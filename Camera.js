/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */
import Orientation from "react-native-orientation-locker";
import Permissions from "react-native-permissions";
import Spinner from 'react-native-loading-spinner-overlay';

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
  SafeAreaView
} from "react-native";
import { Icon, Button } from "react-native-elements";

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
      downloading: false,
      savingPhoto: false,
      cameraModeBack: true,
      currentUser: currentUser,
      windowWidth: dimensions.width,
      windowHeight: dimensions.height,
      appState: AppState.currentState,
      imagePreview: null,
      AppState: null,
      cameraPermission: null,
      downloadPermission: null,
      overlayText: ''
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
    if (this.props.returnPage){
        this.props.navigation.navigate(this.props.returnPage);
    } else{
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
  alertForPhotosPermission() {
    Alert.alert(
      "Can we access your photos?",
      "We need access so you can set your profile pic",
      [
        {
          text: "No",
          onPress: () => console.log("Permission denied"),
          style: "cancel"
        },
        this.state.cameraPermission == "undetermined"
          ? { text: "OK", onPress: this.requestPermission }
          : { text: "Open Settings", onPress: Permissions.openSettings }
      ]
    );
  }

  takePicture() {
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
      savingPhoto: false
    });
    Orientation.unlockAllOrientations();

  }
  requestPermission = () => {
    Permissions.request("camera").then(response => {
      // Returns once the user has chosen to 'allow' or to 'not allow' access
      // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
      this.setState({ cameraPermission: response });
    });
  };

  saveToCameraRoll = async image => {
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
    this.setState({savingPhoto: true, overlayText: "Saving image..."});
    this.props.returnData(imagePreview);
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
      overlayText
    } = this.state;
    let castId;

    let feedName;
    if (this.props.feedName) {
      feedName = this.props.feedName;
    }
    let imagePreviewPlaceholder = imageTaken ? (
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
    ) : (
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
        captureTarget={Camera.constants.CaptureTarget.disk}
        flashMode={
          flashOn
            ? Camera.constants.FlashMode.on
            : Camera.constants.FlashMode.off
        }
        aspect={Camera.constants.Aspect.fill}
      />
    );
    let bottomMenu = (
      <SafeAreaView
        style={[
          styles.bottomMenuWrapper,
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
            iconStyle={styles.topNavIcon}
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
      </SafeAreaView>
    );

    let topMenu = imageTaken ? (
      <View style={styles.topMenu}>
        <Icon
          type="ionicon"
          name="md-close"
          color="white"
          iconStyle={styles.topNavIcon}
          underlayColor="transparent"
          size={36}
          onPress={this.reset.bind(this)}
        />
        {this.state.downloading && (
          <ActivityIndicator size="small" color="#fff" />
        )}
        {!this.state.downloading && (
          <Icon
            type="ionicon"
            name="ios-download-outline"
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
                  this.setState({ downloading: true });
                  this.saveToCameraRoll().then(() =>
                    this.setState({ downloading: false })
                  );
                }
              });
            }}
          />
        )}
      </View>
    ) : (
      <View style={styles.topMenu}>
        <View style={styles.feedMenu}>
          <Icon
            type="ionicon"
            name="ios-menu-outline"
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
        <Spinner visible={this.state.savingPhoto} textContent={overlayText} textStyle={{color: '#FFF'}} />
        {topMenu}
        {imagePreviewPlaceholder}
        {bottomMenu}
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
    paddingHorizontal: 5,
    transform: [{ translateY: 30 }],
    display: "flex",
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 99,
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
  }
});
