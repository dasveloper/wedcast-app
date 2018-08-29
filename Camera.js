/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */
import Orientation from "react-native-orientation-locker";
import Permissions from "react-native-permissions";
import Spinner from "react-native-loading-spinner-overlay";
import ViewShot from "react-native-view-shot";
import Gestures from "react-native-easy-gestures";

import React, { Component } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  CameraRoll,
  AppState,
  ActivityIndicator,
  SafeAreaView,
  ScrollView
} from "react-native";
import { Icon, Button, Overlay } from "react-native-elements";

import RNFetchBlob from "react-native-fetch-blob";

import Camera from "react-native-camera";
import uuid from "uuid";
import firebase from "react-native-firebase";

export default class CameraComponent extends Component {
  constructor(props) {
    super(props);

    const { currentUser } = firebase.auth();
    const dimensions = Dimensions.get("window");
    this.state = {
      flashOn: false,
      imageTaken: false,
      savingPhoto: false,
      showOverlay: false,
      cameraModeBack: this.props.cameraModeBack,
      currentUser: currentUser,
      windowWidth: dimensions.width,
      windowHeight: dimensions.height,
      appState: AppState.currentState,
      imagePreview: null,
      AppState: null,
      cameraPermission: null,
      downloadPermission: null,
      overlayText: "",
      showCameraPermissionOverlay: false,
      showDownloadPermissionOverlay: false,
      stickerMenuVisible: false,
      stickerList: []
    };
  }
  goToFeed = () => {
    Orientation.lockToPortrait();
    this.props.navigation.navigate("Feed", { castId: this.props.castId });
  };
  goToFeedUsers = () => {
    Orientation.lockToPortrait();
    this.props.navigation.navigate("FeedUsers", { castId: this.props.castId });
  };
  navigateBack = () => {
    Orientation.lockToPortrait();
    if (this.props.returnPage) {
      this.props.navigation.navigate(this.props.returnPage);
    } else {
      this.props.navigation.goBack();
    }
  };

  componentDidMount() {
    Orientation.unlockAllOrientations();
    Permissions.check("camera").then(response => {
      // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
      this.setState({ cameraPermission: response });
      if (response == "undetermined") {
        this.alertForPhotosPermission();
      }
    });
  }
  requestDownloadPermission = () => {
    firebase.analytics().logEvent("camera_request_download_permission");

    Permissions.request("photo").then(response => {
      // Returns once the user has chosen to 'allow' or to 'not allow' access
      // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
      this.setState({
        downloadPermission: response,
        showDownloadPermissionOverlay: false
      });
    });
  };
  alertForDownloadPermission() {
    this.setState({ showDownloadPermissionOverlay: true });

    // Alert.alert(
    //   'Can we access your photo library?',
    //   'We need access so you can download photos',
    //   [
    //     {
    //       text: 'No',
    //       onPress: () => console.log('Permission denied'),
    //       style: 'cancel',
    //     },
    //     this.state.downloadPermission == 'undetermined'
    //       ? { text: 'OK', onPress: this.requestDownloadPermission }
    //       : { text: 'Open Settings', onPress: Permissions.openSettings },
    //   ],
    // )
  }
  alertForPhotosPermission() {
    this.setState({ showCameraPermissionOverlay: true });
    // Alert.alert(
    //   "Can we access your photos?",
    //   "We need access so you can set your profile pic",
    //   [
    //     {
    //       text: "No",
    //       onPress: () => console.log("Permission denied"),
    //       style: "cancel"
    //     },
    //     this.state.cameraPermission == "undetermined"
    //       ? { text: "OK", onPress: this.requestPermission }
    //       : { text: "Open Settings", onPress: Permissions.openSettings }
    //   ]
    // );
  }

  takePicture() {
    firebase.analytics().logEvent("take_picture");

    let self = this;
    const options = {
      forceUpOrientation: true,
      fixOrientation: true
    };
    Orientation.getOrientation(orientation => {
      if (orientation == "PORTRAIT") {
        Orientation.lockToPortrait();
      } else {
        Orientation.lockToLandscape();
      }
      self.camera
        .capture(options)
        .then(data => {
          self.setState({ imagePreview: data.path, imageTaken: true });
        })
        .catch();
    });
  }

  reset() {
    this.setState({
      imagePreview: null,
      imageTaken: false,
      savingPhoto: false,
      showOverlay: false,
      stickerList: []
    });
    Orientation.unlockAllOrientations();
  }
  requestPermission = () => {
    firebase.analytics().logEvent("camera_request_camera_permission");

    Permissions.request("camera").then(response => {
      // Returns once the user has chosen to 'allow' or to 'not allow' access
      // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
      this.setState({
        cameraPermission: response,
        showCameraPermissionOverlay: false
      });
    });
  };

  saveToCameraRoll = async image => {
    firebase.analytics().logEvent("camera_save_image");

    const { imagePreview } = this.state;
    let self = this;
    if (Platform.OS === "android") {
      RNFetchBlob.config({
        fileCache: true,
        appendExt: "jpg"
      })
        .fetch("GET", imagePreview)
        .then(res => {
          CameraRoll.saveToCameraRoll(res.path())
            .then(Alert.alert("Success", "Photo added to camera roll!"))
            .catch(err => console.log("err:", err));
        });
    } else {
      await CameraRoll.saveToCameraRoll(imagePreview).then(() => {});
    }
  };
  returnImage(imagePreview) {
    this.setState({
      savingPhoto: true,
      showOverlay: true,
      overlayText: "Uploading image..."
    });
    this.viewShot.capture().then(uri => {
      console.log(uri);
      this.props.returnData(uri);
    });
  }

  addSticker(sticker) {
    let stickerWrapper = (
      <Gestures
        scalable={{
          min: 0.1,
          max: 7
        }}
        styles={{
          position: "absolute",
          top: 40,
          left: 40,
          zIndex: 2
        }}
        onEnd={(event, styles) => {
          console.log(styles);
        }}
      >
        <Image
          source={sticker}
          style={{
            width: 200,
            resizeMode: "contain",
            zIndex: 2
          }}
        />
      </Gestures>
    );

    this.state.stickerList.push(stickerWrapper);
    this.setState({
      stickerList: this.state.stickerList
    });
  }
  render() {
    const {
      currentUser,
      imagePreview,
      imageTaken,
      cameraModeBack,
      flashOn,
      windowHeight,
      windowWidth,
      overlayText,
      cameraPermission,
      showCameraPermissionOverlay,
      showDownloadPermissionOverlay,
      showOverlay
    } = this.state;
    let castId;
    const stickerSource1 = require("./assets/stickers/sticker1.png");
    const stickerSource2 = require("./assets/stickers/sticker2.png");
    const stickers = [stickerSource1, stickerSource2];

    let feedName;
    if (this.props.feedName) {
      feedName = this.props.feedName;
    }
    let Arr = this.state.stickerList.map((a, i) => {
      return a;
    });
    let imagePreviewPlaceholder = imageTaken ? (
      <ViewShot
        ref={component => (this.viewShot = component)}
        style={{
          flex: 1,
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}
        options={{ format: "jpg", quality: 0.9 }}
      >
        {Arr}

        <Image
          source={{ uri: imagePreview }}
          style={{
            flex: 1,
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          }}
        />
      </ViewShot>
    ) : this.state.cameraPermission == "authorized" ? (
      <Camera
        ref={cam => {
          this.camera = cam;
        }}
        style={styles.cam}
        type={
          cameraModeBack
            ? Camera.constants.Type.back
            : Camera.constants.Type.front
        }
        captureTarget={Camera.constants.CaptureTarget.temp}
        flashMode={
          flashOn
            ? Camera.constants.FlashMode.on
            : Camera.constants.FlashMode.off
        }
        aspect={Camera.constants.Aspect.fill}
      />
    ) : (
      <View />
    );
    let stickerMenu = stickers.map(sticker => {
      return (
        <TouchableOpacity
          style={{
            alignSelf: "center",
            marginLeft: 10,
            height: 100,
            width: 100,
            padding: 10,
            borderRadius: 10,
            backgroundColor: "rgba(255,255,255,.4)"
          }}
          onPress={() => this.addSticker(sticker)}
        >
          <Image
            source={sticker}
            style={{
              height: "100%",
              maxWidth: "100%",
              resizeMode: "contain",
              zIndex: 2
            }}
          />
        </TouchableOpacity>
      );
    });
    let bottomMenu = (
      <SafeAreaView style={styles.bottomMenuWrapper}>
        {imageTaken && this.state.stickerMenuVisible ? (
          <ScrollView horizontal={true}>{stickerMenu}</ScrollView>
        ) : (
          undefined
        )}
        <View
          style={[
            styles.bottomMenuInner,
            {
              justifyContent: this.props.showBottomNav
                ? "space-between"
                : "center"
            }
          ]}
        >
          <View style={styles.bottomMenu} />
          {this.props.showBottomNav && (
            <Icon
              type="ionicon"
              underlayColor="transparent"
              name="ios-people"
              color="#fff"
              iconStyle={styles.navIcon}
              size={40}
              onPress={() => this.goToFeedUsers()}
            />
          )}

          {imageTaken ? (
            <Icon
              type="ionicon"
              name="md-checkmark"
              color="#96c256"
              iconStyle={styles.navIcon}
              size={40}
              reverse
              loading
              onPress={() => this.returnImage(imagePreview)}
            />
          ) : (
            <Icon
              type="ionicon"
              name="md-camera"
              color="#1F9FAC"
              iconStyle={styles.navIcon}
              size={40}
              reverse
              onPress={() =>
                this.state.cameraPermission === "authorized"
                  ? this.takePicture()
                  : this.alertForPhotosPermission()
              }
            />
          )}
          {this.props.showBottomNav && (
            <Icon
              type="ionicon"
              underlayColor="transparent"
              name="ios-images"
              color="#fff"
              iconStyle={styles.navIcon}
              size={40}
              onPress={() => this.goToFeed()}
            />
          )}
        </View>
      </SafeAreaView>
    );

    let topMenu = imageTaken ? (
      <View style={styles.topMenu}>
        <Icon
          type="ionicon"
          name="md-close"
          color="white"
          underlayColor="transparent"
          size={36}
          onPress={this.reset.bind(this)}
        />
       {false && <View
          style={{
            flexDirection: "column",
            position: "absolute",
            right: 0,
            top: 0,
            zIndex: 99,
            padding: 10,

          }}
        >
          <Icon
            type="material-community"
            name="download"
            color="white"
            iconStyle={styles.topNavIcon}
            underlayColor="transparent"
            size={36}
            onPress={() => {
              Permissions.check("photo").then(response => {
                // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
                this.setState({ downloadPermission: response });
                if (response == "undetermined") {
                  this.alertForDownloadPermission();
                } else if (response == "authorized") {
                  this.setState({
                    showOverlay: true,
                    overlayText: "Downloading image..."
                  });
                  this.saveToCameraRoll().then(() => {
                    setTimeout(
                      function() {
                        this.setState({ showOverlay: false, overlayText: "" });
                      }.bind(this),
                      1000
                    );
                  });
                }
              });
            }}
          />
          <Icon
            type="material-community"
            name="sticker-emoji"
            underlayColor="transparent"
            color="#fff"
            iconStyle={styles.topNavIcon}
            size={36}
            onPress={() => this.setState({stickerMenuVisible: !this.state.stickerMenuVisible})}
          />
          <Icon
            type="material-community"
            name="format-text"
            underlayColor="transparent"
            color="#fff"
            iconStyle={styles.topNavIcon}
            size={36}
            onPress={() => this.goToFeedUsers()}
          />
        </View>}
      </View>
    ) : (
      <View style={styles.topMenu}>
        <View style={styles.feedMenu}>
          <Icon
            type="ionicon"
            name="ios-arrow-back"
            iconStyle={styles.menuIcon}
            underlayColor="transparent"
            size={36}
            onPress={() => this.navigateBack()}
          />
          <Text numberOfLines={1} style={styles.feedName}>
            {feedName}
          </Text>
        </View>
        <View style={styles.cameraControls}>
          <Icon
            type="ionicon"
            name={this.state.flashOn ? "ios-flash" : "ios-flash-outline"}
            color="white"
            underlayColor="transparent"
            iconStyle={styles.flashIcon}
            size={36}
            onPress={() => this.setState({ flashOn: !this.state.flashOn })}
          />
          <Icon
            type="ionicon"
            name={
              cameraModeBack
                ? "ios-reverse-camera-outline"
                : "ios-reverse-camera"
            }
            color="white"
            iconStyle={styles.switchCameraIcon}
            underlayColor="transparent"
            size={36}
            onPress={() =>
              this.setState({ cameraModeBack: !this.state.cameraModeBack })
            }
          />
        </View>
      </View>
    );

    return (
      <SafeAreaView style={styles.container}>
        <Spinner
          visible={this.state.showOverlay}
          textContent={overlayText}
          textStyle={{ color: "#FFF" }}
        />
        {topMenu}
        {imagePreviewPlaceholder}
        {bottomMenu}
        {this.props.showCircleOverlay && (
          <View
            style={[
              styles.circleOverlay,
              {
                transform: [
                  { translateX: -this.state.windowWidth / 2 },
                  { translateY: -this.state.windowWidth / 2 }
                ],
                height: this.state.windowWidth,
                width: this.state.windowWidth,
                borderRadius: this.state.windowWidth / 2
              }
            ]}
          />
        )}

        {showCameraPermissionOverlay && (
          <Overlay
            height={null}
            containerStyle={{
              zIndex: 99
            }}
            overlayStyle={{
              backgroundColor: "#fff",
              borderRadius: 8,
              flexDirection: "column"
            }}
            isVisible
          >
            <View
              style={{
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                padding: 10
              }}
            >
              <Icon
                type="ionicon"
                name="ios-camera"
                color="#1F9FAC"
                size={60}
              />
              <Text style={{ fontSize: 20, fontFamily: "Quicksand" }}>
                Camera access required
              </Text>
              <Text
                style={{
                  textAlign: "center",
                  color: "#696969",
                  marginVertical: 5,
                  fontSize: 18,
                  fontFamily: "Quicksand"
                }}
              >
                You'll need to grant camera permissions to take pictures
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-evenly",
                alignItems: "center",
                padding: 10,
                marginTop: 10
              }}
            >
              <Button
                title="Not now"
                titleStyle={{
                  color: "#1F9FAC",
                  fontFamily: "Quicksand",
                  fontSize: 20
                }}
                buttonStyle={{
                  backgroundColor: "transparent",
                  borderColor: "transparent",
                  borderWidth: 0,
                  borderRadius: 23,
                  height: 46,
                  paddingHorizontal: 10
                }}
                onPress={() => {
                  this.setState({ showCameraPermissionOverlay: false });
                }}
              />
              <Button
                title="OK!"
                titleStyle={{
                  color: "#1F9FAC",
                  fontFamily: "Quicksand",
                  fontSize: 20
                }}
                buttonStyle={{
                  backgroundColor: "transparent",
                  borderColor: "transparent",
                  borderWidth: 0,
                  borderRadius: 23,
                  height: 46,
                  paddingHorizontal: 16,
                  borderWidth: 2,
                  borderColor: "#1F9FAC"
                }}
                onPress={() => {
                  this.state.cameraPermission == "undetermined"
                    ? this.requestPermission()
                    : Permissions.openSettings();
                }}
              />
            </View>
          </Overlay>
        )}
        {showDownloadPermissionOverlay && (
          <Overlay
            height={null}
            containerStyle={{
              zIndex: 99
            }}
            overlayStyle={{
              backgroundColor: "#fff",
              borderRadius: 8,
              flexDirection: "column"
            }}
            isVisible
          >
            <View
              style={{
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                padding: 10
              }}
            >
              <Icon
                type="ionicon"
                name="ios-download-outline"
                color="#1F9FAC"
                size={60}
              />
              <Text style={{ fontSize: 20, fontFamily: "Quicksand" }}>
                Photo library access required
              </Text>
              <Text
                style={{
                  textAlign: "center",
                  color: "#696969",
                  marginVertical: 5,
                  fontSize: 18,
                  fontFamily: "Quicksand"
                }}
              >
                You'll need to grant photo library permissions to download
                pictures
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-evenly",
                alignItems: "center",
                padding: 10,
                marginTop: 10
              }}
            >
              <Button
                title="Not now"
                titleStyle={{
                  color: "#1F9FAC",
                  fontFamily: "Quicksand",
                  fontSize: 20
                }}
                buttonStyle={{
                  backgroundColor: "transparent",
                  borderColor: "transparent",
                  borderWidth: 0,
                  borderRadius: 23,
                  height: 46,
                  paddingHorizontal: 10
                }}
                onPress={() => {
                  this.setState({ showDownloadPermissionOverlay: false });
                }}
              />
              <Button
                title="OK!"
                titleStyle={{
                  color: "#1F9FAC",
                  fontFamily: "Quicksand",
                  fontSize: 20
                }}
                buttonStyle={{
                  backgroundColor: "transparent",
                  borderColor: "transparent",
                  borderWidth: 0,
                  borderRadius: 23,
                  height: 46,
                  paddingHorizontal: 16,
                  borderWidth: 2,
                  borderColor: "#1F9FAC"
                }}
                onPress={() => {
                  this.state.downloadPermission == "undetermined"
                    ? this.requestDownloadPermission()
                    : Permissions.openSettings();
                }}
              />
            </View>
          </Overlay>
        )}
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#000",
    justifyContent: "space-between"
  },
  circleOverlay: {
    position: "absolute",
    left: "50%",
    top: "50%",

    borderColor: "#fff",
    borderWidth: 5
  },
  cam: {
    flex: 1,
    flexDirection: "column",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  bottomMenuWrapper: {
    flex: 0,
    transform: [{ translateY: 30 }],
    display: "flex",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 99,
    flexDirection: "column"
  },
  bottomMenuInner: {
    flex: 0,
    paddingHorizontal: 5,
    display: "flex",
    alignItems: "center",
    flexDirection: "row"
  },
  bottomMenu: {
    flex: 0,
    padding: 5,
    height: "100%",
    backgroundColor: "rgba(0,0,0,.4)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute",
    transform: [{ translateY: 25 }],

    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row"
  },
  menuIcon: {
    marginRight: 15,
    color: "#fff"
  },
  feedName: {
    fontSize: 20,
    lineHeight: 20,
    color: "#fff",
    width: 200,
    fontFamily: "Quicksand"
  },
  topMenu: {
    flex: 0,
    padding: 10,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",

    zIndex: 99,
    flexDirection: "row",
    maxWidth: "100%"
  },
  feedMenu: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    flex: 2
  },
  cameraControls: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    overflow: "hidden",
    flex: 1
  },
  flashIcon: {
    marginRight: 15
  },
  captureButton: {
    width: 60,
    height: 60,
    borderRadius: 60,
    backgroundColor: "#F04155",
    alignSelf: "center",
    borderWidth: 2,
    borderColor: "#fff"
  },
  navIcon: {
    marginHorizontal: 10
  },
  topNavIcon:{
    marginBottom: 20

  }
});
