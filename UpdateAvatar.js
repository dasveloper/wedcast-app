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
  CameraRoll,
  Dimensions,
  ActivityIndicator,
  SafeAreaView,
  Alert
} from "react-native";
import { Icon, Button } from "react-native-elements";

import Camera from "react-native-camera";
import uuid from "uuid";
import firebase from "react-native-firebase";


export default class UpdateAvatar extends Component {
  state = {
    currentUser: null,
    flashOn: null,
    cameraModeBack: null,
    imagePreview: null,
    imageTaken: null,
    savingPhoto: false,
    windowWidth: null,
    windowHeight: null,
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
      downloading: false,
      imageTaken: false,
      cameraModeBack: false,
      currentUser: currentUser,
      windowWidth: dimensions.width,
      windowHeight: dimensions.height
    };
  }
  _onOrientationDidChange = orientation => {  };
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
      await CameraRoll.saveToCameraRoll(imagePreview);
    }
  };
  componentDidMount() {
    Orientation.unlockAllOrientations();
    Orientation.addOrientationListener(this._onOrientationDidChange);
    Permissions.check('camera').then(response => {
      // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
      this.setState({ cameraPermission: response })
    })
  }
  render() {
    const {
      currentUser,
      imagePreview,
      flashOn,
      cameraModeBack,
      imageTaken,
      windowHeight,
      windowWidth
    } = this.state;
    let imagePreviewPlaceholder = imageTaken ? (
      <Image
        source={{ uri: imagePreview }}
        style={{
          flex: 1
        }}
      />
    ) : (
      <Camera
        ref={cam => {
          this.camera = cam;
        }}
        style={styles.cam}
        captureTarget={Camera.constants.CaptureTarget.disk}
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
      <SafeAreaView style={styles.bottomMenu}>
        <Button
          loading={this.state.savingPhoto}
          loadingProps={{ size: "large", color: "rgba(255, 255, 255, 1)" }}
          buttonStyle={{ backgroundColor: "transparent" }}
          disabled={this.state.savingPhoto}
          disabledStyle={{ backgroundColor: "transparent" }}
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
      </SafeAreaView>
    ) : (
      <SafeAreaView style={styles.bottomMenu}>
        <Icon
          type="ionicon"
          name="md-camera"
          color="#1F9FAC"
          iconStyle={styles.topNavIcon}
          size={40}
          reverse
          onPress={() => this.state.cameraPermission === "authorized" ? this.takePicture() : 
          this.alertForPhotosPermission()}
           />
      </SafeAreaView>
    );

    let topMenu = imageTaken ? (
      <SafeAreaView style={styles.topMenu}>
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
      </SafeAreaView>
    ) : (
      <SafeAreaView style={styles.topMenu}>
        <View style={styles.feedMenu}>
          <Icon
            type="ionicon"
            name="ios-arrow-round-back"
            color="#fff"
            size={40}
            onPress={() => {
              Orientation.lockToPortrait();

              this.props.navigation.goBack();
            }}
            iconStyle={styles.navIcon}
          />
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
      </SafeAreaView>
    );

    return (
      <View style={styles.container}>
        {topMenu}

        {imagePreviewPlaceholder}
        {bottomMenu}
      </View>
    );
  }
  async uploadImageAsync() {
    const { currentUser, imagePreview } = this.state;
    this.setState({ savingPhoto: true });

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
          let comment = { avatar: downloadURL };
          self.setState({
            savingPhoto: false
          });
          self.props.navigation.state.params.returnData(downloadURL);
          Orientation.lockToPortrait();

          self.props.navigation.goBack();

          // firebase.database().ref(`users/${firebase.auth().currentUser.uid}/profile`).set(comment, function(error) {
          //  if (error)
          //   console.log('Error has occured during saving process')
          // else
          //  self.setState({ imagePreview: null, imageTaken: false })
          //  })
        });
      }
    );
    return true;
  }
  requestPermission = () => {
    Permissions.request('camera').then(response => {
      // Returns once the user has chosen to 'allow' or to 'not allow' access
      // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
      this.setState({ cameraPermission: response })
    })
  }
  requestDownloadPermission = () => {
    Permissions.request('photo').then(response => {
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
  alertForDownloadPermission() {
    Alert.alert(
      'Can we access your photo library?',
      'We need access so you can download photos',
      [
        {
          text: 'No',
          onPress: () => console.log('Permission denied'),
          style: 'cancel',
        },
        this.state.downloadPermission == 'undetermined'
          ? { text: 'OK', onPress: this.requestDownloadPermission }
          : { text: 'Open Settings', onPress: Permissions.openSettings },
      ],
    )
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
  navigateMenu = () => {
    this.props.navigation.navigate("Menu");
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FCFF"
  },
  welcome: {
    fontSize: 20,
    textAlign: "center",
    margin: 10
  },

  cam: {
    flex: 1,
    flexDirection: "column"
  },
  bottomMenu: {
    flex: 0,
    padding: 5,
    maxHeight: 50,
    backgroundColor: "rgba(0,0,0,.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 99,
    flexDirection: "row"
  },
  topMenu: {
    flex: 0,
    padding: 10,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 99,
    flexDirection: "row"
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
  cameraControls: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    overflow: "hidden",
    flex: 1,
    marginHorizontal: 10
  },
  flashIcon: {
    marginRight: 15
  },
  topNavIcon: {
    marginHorizontal: 10
  },
  navIcon: {
    marginHorizontal: 20
  }
});
