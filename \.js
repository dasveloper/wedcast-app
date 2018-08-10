/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */
import Orientation from "react-native-orientation-locker";
import Permissions from 'react-native-permissions'

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

export default class Main extends Component {
  state = {
    currentUser: null,
    flashOn: null,
    cameraModeBack: null,
    imagePreview: null,
    imageTaken: null,
    windowWidth: null,
    windowHeight: null,
    AppState: null,
    downloading: null,
    cameraPermission: null,
    downloadPermission: null
  };

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
      appState: AppState.currentState
    };
  }
  _handleAppStateChange = nextAppState => {
    if (
      this.state.appState.match(/active/) &&
      nextAppState.match(/inactive|background/)
    ) {
      console.log("App has come to the background!");
      let user = this.state.currentUser.uid;
      if (this.props.navigation.getParam("castId")) {
        castId = this.props.navigation.getParam("castId", null);

        firebase
          .database()
          .ref(`feeds/feedNew/${castId}/members/${user}/online`)
          .set(false, function(error) {});
      }
    } else if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState.match(/active/)
    ) {
      console.log("App has come to the foreground!");
      let user = this.state.currentUser.uid;
      if (this.props.navigation.getParam("castId")) {
        castId = this.props.navigation.getParam("castId", null);

        firebase
          .database()
          .ref(`feeds/feedNew/${castId}/members/${user}/online`)
          .set(true, function(error) {});
      }
    }
    this.setState({ appState: nextAppState });
  };
  componentWillUnmount() {
    AppState.removeEventListener("change", this._handleAppStateChange);

    let user = this.state.currentUser.uid;
    if (this.props.navigation.getParam("castId")) {
      castId = this.props.navigation.getParam("castId", null);

      firebase
        .database()
        .ref(`feeds/feedNew/${castId}/members/${user}/online`)
        .set(false, function(error) {});
    }
  }
  _onOrientationDidChange = orientation => {
    if (orientation === "LANDSCAPE") {
      // do something with landscape layout
    } else {
      // do something with portrait layout
    }
  };

  componentDidMount() {
    AppState.addEventListener("change", this._handleAppStateChange);
    Orientation.unlockAllOrientations();
    Orientation.addOrientationListener(this._onOrientationDidChange);
      Permissions.check('camera').then(response => {
        // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
        this.setState({ cameraPermission: response })
        if (response == 'undetermined'){
          this.alertForPhotosPermission();

        }

      })
    let user = this.state.currentUser.uid;
    if (this.props.navigation.getParam("castId")) {
      castId = this.props.navigation.getParam("castId", null);

      firebase
        .database()
        .ref(`feeds/feedNew/${castId}/members/${user}/online`)
        .set(true, function(error) {});
    }
  }
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
  render() {
    const {
      currentUser,
      imagePreview,
      imageTaken,
      cameraModeBack,
      flashOn,
      windowHeight,
      windowWidth
    } = this.state;
    let castId;
    if (this.props.navigation.getParam("castId")) {
      castId = this.props.navigation.getParam("castId", null);
    }
    let feedName;
    if (this.props.navigation.getParam("castId")) {
      feedName = this.props.navigation.getParam("feedName", null);
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
          bottom:0
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
    let bottomMenu = imageTaken ? (
      <View style={styles.bottomMenu}>
        <Icon
          type="ionicon"
          name="ios-people"
          color="white"
          iconStyle={styles.navIcon}
          size={40}
          onPress={() => this.goToFeedUsers()}
        />
        <Button
          loading={this.state.savingPhoto}
          disabled={this.state.savingPhoto}
          disabledStyle={{ backgroundColor: "transparent" }}
          loadingProps={{ size: "large", color: "rgba(255, 255, 255, 1)" }}
          buttonStyle={{ backgroundColor: "transparent" }}
          containerStyle={{
            backgroundColor: "#96c256",
            width: 80,
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 80,
            height: 80
          }}
          title=""
          icon={
            <Icon
              type="ionicon"
              name="md-checkmark"
              color="transparent"
              iconStyle={styles.navIcon}
              size={40}
              reverse
              loading
              onPress={this.uploadImageAsync.bind(this)}
            />
          }
        />
        <Icon
          type="ionicon"
          name="ios-images"
          color="white"
          size={40}
          onPress={() => this.goToFeed()}
          iconStyle={styles.navIcon}
        />
      </View>
    ) : (
      <View style={styles.bottomMenu}>
        <Icon
          type="ionicon"
          name="ios-people"
          color="white"
          underlayColor="transparent"
          iconStyle={styles.navIcon}
          size={40}
          onPress={() => this.goToFeedUsers()}
        />

        <Icon
          type="ionicon"
          name="md-camera"
          color="#1F9FAC"
          iconStyle={styles.topNavIcon}
          size={40}
          reverse
          onPress={() => this.state.cameraPermission === "authorized" ? this.takePicture() : 
          this.alertForPhotosPermission()

        }
        />

        <Icon
          type="ionicon"
          name="ios-images"
          color="white"
          underlayColor="transparent"
          size={40}
          onPress={() => this.goToFeed()}
          iconStyle={styles.navIcon}
        />
      </View>
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
          onPress={this.cancelPreview.bind(this)}
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
              Permissions.check('photo').then(response => {
                // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
                this.setState({ downloadPermission: response })
                if (response == 'undetermined'){
                  this.alertForDownloadPermission();
        
                } else if (response == 'authorized'){
                  this.setState({ downloading: true });
                  this.saveToCameraRoll().then(() =>
                    this.setState({ downloading: false })
                  );
                }
        
              })

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
            color="white"
            iconStyle={styles.menuIcon}
            underlayColor="transparent"
            size={36}
            onPress={() => this.goToWeddingDetails()}
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
        {topMenu}
        {imagePreviewPlaceholder}
        {bottomMenu}
      </SafeAreaView>
    );
  }
  async uploadImageAsync() {
    const { currentUser, imagePreview } = this.state;
    let castId;
    this.setState({ savingPhoto: true });

    if (this.props.navigation.getParam("castId")) {
      castId = this.props.navigation.getParam("castId", null);
    }
    const ref = firebase
      .storage()
      .ref()
      .child(uuid.v4());

    var metadata = {
      contentType: "image/jpeg"
    };

    var uploadTask = ref.put(imagePreview, metadata);

    let self = this;
    uploadTask.on(
      "state_changed",
      function(snapshot) {
        // Observe state change events such as progress, pause, and resume
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        //  var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      },
      function(error) {
        // Handle unsuccessful uploads
      },
      function(snapshot) {
        // Handle successful uploads on complete
        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
        snapshot.ref.getDownloadURL().then(function(downloadURL) {
          Image.getSize(
            downloadURL,
            (Width, Height) => {

              //self.saveToCameraRoll(downloadURL);
              let comment = { user: currentUser, uri: downloadURL, width: Width, height: Height };
              firebase
                .database()
                .ref("feeds/feedNew")
                .child(castId)
                .child("uploads")
                .push(comment, function(error) {
                  if (error) {
                  } //alert("Error has occured during saving process");
                  else {
                    self.setState({
                      imagePreview: null,
                      imageTaken: false,
                      savingPhoto: false
                    });
                  }
                  Orientation.unlockAllOrientations();
                });
            },
            errorMsg => {
              console.log(errorMsg);
            }
          );
        });
      }
    );
    return true;
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
  cancelPreview() {
    this.setState({
      imagePreview: null,
      imageTaken: false,
      savingPhoto: false
    });
    Orientation.unlockAllOrientations();
  }
  goToFeed = () => {
    Orientation.lockToPortrait();

    let castId;
    if (this.props.navigation.getParam("castId")) {
      castId = this.props.navigation.getParam("castId", null);
    }
    this.props.navigation.navigate("Feed", { castId: castId });
  };
  goToFeedUsers = () => {
    Orientation.lockToPortrait();
    let castId;
    if (this.props.navigation.getParam("castId")) {
      castId = this.props.navigation.getParam("castId", null);
    }
    this.props.navigation.navigate("FeedUsers", { castId: castId });
  };
  goToWeddingDetails = () => {
    Orientation.lockToPortrait();

    this.props.navigation.navigate("WeddingDetails");
  };
  requestPermission = () => {
    Permissions.request('camera').then(response => {
      // Returns once the user has chosen to 'allow' or to 'not allow' access
      // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
      this.setState({ cameraPermission: response })
    })
  }

  alertForPhotosPermission() {
    Alert.alert(
      'Can we access your photos?',
      'We need access so you can set your profile pic',
      [
        {
          text: 'No',
          onPress: () => console.log('Permission denied'),
          style: 'cancel',
        },
        this.state.cameraPermission == 'undetermined'
          ? { text: 'OK', onPress: this.requestPermission }
          : { text: 'Open Settings', onPress: Permissions.openSettings },
      ],
    )
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection:'column',
    backgroundColor: "#000",
    justifyContent:'space-between'
  },
  welcome: {
    fontSize: 20,
    textAlign: "center",
    margin: 10
  },
  cam: {
    flex: 1,
    flexDirection: "column",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom:0
  },
  bottomMenu: {
    flex: 0,
    padding: 0,
    maxHeight: 50,
    backgroundColor: "rgba(0,0,0,.4)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",

    zIndex: 99,
    flexDirection: "row"
  },
  menuIcon: {
    marginRight: 15
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
  switchCameraIcon: {},
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
