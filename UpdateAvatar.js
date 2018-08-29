/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */
import Orientation from "react-native-orientation-locker";
import CameraComponent from "./Camera";
import { Icon, Button } from "react-native-elements";
import uuid from "uuid";
import firebase from "react-native-firebase";
import React, { Component } from "react";
import {
  StyleSheet,
  View,
  Image,
} from "react-native";


export default class UpdateAvatar extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    firebase.analytics().setCurrentScreen("updateavatar");

  }
  render() {
    return (
      <View style={styles.container}>
        <CameraComponent
          ref={component => (this.camera = component)}
          navigation={this.props.navigation}
          showBottomNav={false}
          showCircleOverlay={true}
          cameraModeBack={false}
          returnData={this.returnData}
        />
      </View>
    );
  }
  returnData = avatarUri => {
    this.uploadImageAsync(avatarUri);
  };
  async uploadImageAsync(imageUrl) {
    firebase.analytics().logEvent("save_update_avatar");
   let storagePath = this.props.navigation.state.params.storagePath;
    const ref = firebase
      .storage()
      .ref(storagePath)
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
          let comment = { avatar: downloadURL };
          self.camera.reset();

          self.props.navigation.state.params.returnData(downloadURL);
          Orientation.lockToPortrait();

          self.props.navigation.goBack();
        });
      }
    );
    return true;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});
