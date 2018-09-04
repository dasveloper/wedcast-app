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
import EStyleSheet from "react-native-extended-stylesheet";

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
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard
} from "react-native";
import { Icon, Button, Overlay, Input } from "react-native-elements";

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
      stickerList: [],
      textTop: null,
      textOverlayFocused: false,
      textOverlayHeight: null,
      userOverlayText: "",
      showTextOverlay: false
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
          top: this.state.windowHeight / 2,

          left: this.state.windowWidth / 2,

          zIndex: 10
        }}
        onEnd={(event, styles) => {
          console.log(styles);
        }}
      >
        <Image
          source={sticker}
          style={{
            width: 100,
            resizeMode: "contain",
            zIndex: 10
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
    const stickerSource1 = require("./assets/stickers/emoji/Emoji1.png");
    const stickerSource3 = require("./assets/stickers/emoji/Emoji3.png");
    const stickerSource4 = require("./assets/stickers/emoji/Emoji4.png");
    const stickerSource5 = require("./assets/stickers/emoji/Emoji5.png");
    const stickerSource6 = require("./assets/stickers/emoji/Emoji6.png");
    const stickerSource7 = require("./assets/stickers/emoji/Emoji7.png");
    const stickerSource8 = require("./assets/stickers/emoji/Emoji8.png");
    const stickerSource9 = require("./assets/stickers/emoji/Emoji9.png");
    const stickerSource10 = require("./assets/stickers/emoji/Emoji10.png");
    const stickerSource11 = require("./assets/stickers/emoji/Emoji11.png");
    const stickerSource12 = require("./assets/stickers/emoji/Emoji12.png");
    const stickerSource13 = require("./assets/stickers/emoji/Emoji13.png");
    const stickerSource14 = require("./assets/stickers/emoji/Emoji14.png");
    const stickerSource15 = require("./assets/stickers/emoji/Emoji15.png");
    const stickerSource16 = require("./assets/stickers/emoji/Emoji16.png");
    const stickerSource17 = require("./assets/stickers/emoji/Emoji17.png");
    const stickerSource18 = require("./assets/stickers/emoji/Emoji18.png");
    const stickerSource19 = require("./assets/stickers/emoji/Emoji19.png");
    const stickerSource20 = require("./assets/stickers/emoji/Emoji20.png");
    const stickerSource21 = require("./assets/stickers/emoji/Emoji21.png");
    const stickerSource22 = require("./assets/stickers/emoji/Emoji22.png");

    const stickers = [
      stickerSource1,
      stickerSource3,
      stickerSource4,
      stickerSource5,
      stickerSource6,
      stickerSource7,
      stickerSource8,
      stickerSource9,
      stickerSource10,
      stickerSource11,
      stickerSource12,
      stickerSource13,
      stickerSource14,
      stickerSource15,
      stickerSource16,
      stickerSource17,
      stickerSource18,
      stickerSource19,
      stickerSource20,
      stickerSource21,
      stickerSource22
    ];

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
        {this.state.textOverlayFocused &&
          this.state.showTextOverlay && (
            <TouchableOpacity
              style={{
                width: "100%",
                height: "100%",
                zIndex: 10,
                position: "absolute",
                top: 0,
                left: 0,
                backgroundColor: "rgba(0,0,0,0.4)"
              }}
              onPress={() => {
                this.setState({ textOverlayFocused: false });
                this.userTextOverlay.blur();
                if (this.state.userOverlayText.length == 0){
                  this.setState({ showTextOverlay: false });

                }
              }}
              accessible={false}
            />
          )}
        {this.state.showTextOverlay && (
          <Gestures
            draggable={{
              y: true,
              x: false
            }}
            onStart={(event, styles) => {
              this.setState({ textTop: styles.top });
            }}
            styles={{
              position: "absolute",
              top: this.state.windowHeight / 2,
              left: 0,
              zIndex: 10,
              backgroundColor: "rgba(255,255,255,.6)",
              width: "100%",
              padding: 0
            }}
            onEnd={(event, styles) => {
              if (styles.top == this.state.textTop) {
                this.setState({ textOverlayFocused: true });
                this.userTextOverlay.focus();
              }
            }}
          >
            <Input
              onChangeText={text => {
                this.setState({ userOverlayText: text });
              }}
              onContentSizeChange={event => {
                this.setState({
                  textOverlayHeight: event.nativeEvent.contentSize.height
                });
              }}
              value={this.state.userOverlayText}
              inputStyle={{
                width: "100%",
                height: Math.max(35, this.state.textOverlayHeight)
              }}
              multiline={true}
              containerStyle={styles.textOverlayContainer}
              inputContainerStyle={styles.textOverlay}
              pointerEvents="none"
              ref={component => (this.userTextOverlay = component)}
            />
          </Gestures>
        )}
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
            zIndex: 99
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
          <ScrollView
            style={{
              transform: [{ translateY: 25 }],
              paddingBottom: 15,
              backgroundColor: "rgba(255,255,255,.4)"
            }}
            horizontal={true}
          >
            {stickerMenu}
          </ScrollView>
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
              onPress={() => {
                this.setState({ textOverlayFocused: false });
                this.userTextOverlay.blur();
                if (this.state.userOverlayText.length == 0){
                  this.setState({ showTextOverlay: false });

                }
                this.returnImage(imagePreview)}}
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
          size={30}
          onPress={this.reset.bind(this)}
        />
      </View>
    ) : (
      <View style={styles.topMenu}>
        <View style={styles.feedMenu}>
          <Icon
            type="ionicon"
            name="ios-arrow-back"
            iconStyle={styles.menuIcon}
            underlayColor="transparent"
            size={30}
            onPress={() => this.navigateBack()}
          />
          <Text numberOfLines={1} style={styles.feedName}>
            {feedName}
          </Text>
        </View>
      </View>
    );
    let stickerIconMenu = imageTaken ? (
      <View
        style={{
          flexDirection: "column",
          position: "absolute",
          justifyContent: "center",
          alignItems: "center",
          right: 0,
          top: 0,
          zIndex: 99,
          padding: 10
        }}
      >
        <Icon
          type="material-community"
          name="download"
          color="white"
          iconStyle={styles.topNavIcon}
          underlayColor="transparent"
          size={30}
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
          size={30}
          onPress={() =>
            this.setState({
              stickerMenuVisible: !this.state.stickerMenuVisible
            })
          }
        />
        <Icon
          type="material-community"
          name="format-text"
          underlayColor="transparent"
          color="#fff"
          iconStyle={styles.topNavIcon}
          size={30}
          onPress={() => {
            this.setState({
              textOverlayFocused: true,
              showTextOverlay: !this.state.showTextOverlay,
              overlayText: ''
            }, function() {
              if (this.userTextOverlay) this.userTextOverlay.focus()
            });
            //this.userTextOverlay.focus();
          }}
        />
      </View>
    ) : (
      <View
        style={{
          flexDirection: "column",
          position: "absolute",
          justifyContent: "center",
          alignItems: "center",
          right: 0,
          top: 0,
          zIndex: 99,
          padding: 10
        }}
      >
        <Icon
          type="material-community"
          name="camera-switch"
          color="white"
          iconStyle={styles.topNavIcon}
          underlayColor="transparent"
          size={30}
          onPress={() =>
            this.setState({ cameraModeBack: !this.state.cameraModeBack })
          }
        />
        <Icon
          type="material-community"
          name={this.state.flashOn ? "flash" : "flash-off"}
          color="white"
          underlayColor="transparent"
          iconStyle={styles.topNavIcon}
          size={30}
          onPress={() => this.setState({ flashOn: !this.state.flashOn })}
        />
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
        {stickerIconMenu}
        {imagePreviewPlaceholder}
        {bottomMenu}
        {this.props.showCircleOverlay && (
          <View
            pointerEvents="none"
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
              <Text style={styles.permissionTitle}>Camera access</Text>
              <Text style={styles.permissionSubtitle}>
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
                titleStyle={styles.permissionButtonText}
                buttonStyle={styles.permissionButton}
                onPress={() => {
                  this.setState({ showCameraPermissionOverlay: false });
                }}
              />
              <Button
                title="OK!"
                titleStyle={styles.permissionButtonText}
                buttonStyle={styles.permissionButtonBorder}
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
              <Text style={styles.permissionTitle}>Photo library access</Text>
              <Text style={styles.permissionSubtitle}>
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
                titleStyle={styles.permissionButtonText}
                buttonStyle={styles.permissionButton}
                onPress={() => {
                  this.setState({ showDownloadPermissionOverlay: false });
                }}
              />
              <Button
                title="OK!"
                titleStyle={styles.permissionButtonText}
                buttonStyle={styles.permissionButtonBorder}
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

const styles = EStyleSheet.create({
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
    zIndex: 1,
    borderColor: "#fff",
    borderWidth: 5
  },
  textOverlayContainer: {
    paddingVertical: 20,
    width: "100%"
  },
  textOverlay: { borderBottomWidth: 0 },
  cam: {
    flex: 1,
    flexDirection: "column",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  permissionTitle: { fontSize: "20rem", fontFamily: "Quicksand" },
  permissionSubtitle: {
    textAlign: "center",
    color: "#696969",
    marginVertical: "5rem",
    fontSize: "18rem",
    fontFamily: "Quicksand"
  },
  permissionButtonText: {
    color: "#1F9FAC",
    fontFamily: "Quicksand",
    fontSize: "20rem"
  },
  permissionButton: {
    backgroundColor: "transparent",
    borderColor: "transparent",
    borderWidth: 0,
    borderRadius: 23,
    height: "46rem",
    paddingHorizontal: "10rem",
    elevation: 0
  },
  permissionButtonBorder: {
    backgroundColor: "transparent",
    borderColor: "transparent",
    borderWidth: 0,
    borderRadius: 23,
    height: "46rem",
    paddingHorizontal: "16rem",
    borderWidth: 2,
    borderColor: "#1F9FAC",
    elevation: 0
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
    marginBottom: 20
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
  topNavIcon: {
    marginBottom: 10
  }
});
