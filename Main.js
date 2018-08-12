/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */
import Orientation from "react-native-orientation-locker";
import Permissions from "react-native-permissions";
import CameraComponent from "./Camera";
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
  constructor(props) {
    super(props);
    const { currentUser } = firebase.auth();
    const dimensions = Dimensions.get("window");
    this.state = {
      savingPhoto: false,
      currentUser: currentUser,
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
  }


  componentDidMount() {
    AppState.addEventListener("change", this._handleAppStateChange);
    
    let user = this.state.currentUser.uid;
    if (this.props.navigation.getParam("castId")) {
      castId = this.props.navigation.getParam("castId", null);

      firebase
        .database()
        .ref(`feeds/feedNew/${castId}/members/${user}/online`)
        .set(true, function(error) {});
    }
  }

  render() {
    const {
      currentUser,
    } = this.state;

    let castId;
    if (this.props.navigation.getParam("castId")) {
      castId = this.props.navigation.getParam("castId", null);
    }
    let feedName;
    if (this.props.navigation.getParam("castId")) {
      feedName = this.props.navigation.getParam("feedName", null);
    }

    return (
      <SafeAreaView style={styles.container}>
        <CameraComponent
          ref={component => (this.camera = component)}
          feedName={feedName}
          navigation={this.props.navigation}
          castId = {castId}
          showBottomNav = {true}
          returnPage="WeddingDetails"
          returnData={this.returnData}
        />
      </SafeAreaView>
    );
  }
  returnData = avatarUri => {
    this.uploadImageAsync(avatarUri);
  };
  async uploadImageAsync(imageUrl) {
    const { currentUser } = this.state;
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

    var uploadTask = ref.put(imageUrl, metadata);

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
              let comment = {
                user: currentUser,
                uri: downloadURL,
                width: Width,
                height: Height
              };
              firebase
                .database()
                .ref("feeds/feedNew")
                .child(castId)
                .child("uploads")
                .push(comment, function(error) {
                  if (error) {
                  } //alert("Error has occured during saving process");
                  else {
                    self.camera.reset();
                  }
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#000",
    justifyContent: "space-between"
  },
  
});
