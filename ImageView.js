/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */
import Orientation from "react-native-orientation-locker";
import Permissions from "react-native-permissions";
import Spinner from "react-native-loading-spinner-overlay";
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
  SafeAreaView
} from "react-native";
import { Icon, Button, Overlay } from "react-native-elements";

import RNFetchBlob from "react-native-fetch-blob";

import uuid from "uuid";
import firebase from "react-native-firebase";

export default class ImageView extends Component {
  constructor(props) {
    super(props);

    const dimensions = Dimensions.get("window");
    this.state = {
      downloadPermission: null,
      showDownloadPermissionOverlay: false,
      showOverlay: false,
      timePassed: false
    };
  }
  componentDidMount() {
    firebase.analytics().setCurrentScreen("imageview");
    Orientation.unlockAllOrientations();
  }
  navigateBack = () => {
    Orientation.lockToPortrait();

    this.props.navigation.goBack();
  };
  requestDownloadPermission = () => {
    firebase.analytics().logEvent("request_download_permission");

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
  }
  saveToCameraRoll = async image => {
    firebase.analytics().logEvent("fullscreen_save_image");

    if (Platform.OS === "android") {
      await RNFetchBlob.config({
        fileCache: true,
        appendExt: "jpg"
      })
        .fetch("GET", image.uri)
        .then(res => {
          CameraRoll.saveToCameraRoll(res.path());
        });
    } else {
      await CameraRoll.saveToCameraRoll(image.uri);
    }
    return;
  };



  render() {
    let { post } = this.props.navigation.state.params;
    let { image } = post;
    let { uri } = image;
    return (
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        <View style={styles.topMenu}>
          <Icon
            type="ionicon"
            name="ios-arrow-back"
            iconStyle={styles.menuIcon}
            underlayColor="transparent"
            size={36}
            onPress={() => this.navigateBack()}
          />

          <Icon
                 type="material-community"
                 name="download"
            color="#fff"
            underlayColor="transparent"
            style={styles.footerDownload}
            size={36}
            onPress={() => {
              Permissions.check("photo").then(response => {
                // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
                this.setState({
                  downloadPermission: response
                });
                if (response == "undetermined") {
                  this.alertForDownloadPermission();
                } else if (response == "authorized") {
                  this.setState({showOverlay :true});
                  this.saveToCameraRoll(image).then(res =>
                    setTimeout(
                      function() {
                        this.setState({ timePassed: true });
                        this.setState({
                          showOverlay: false
                        });
                      }.bind(this),
                      1000
                    )
                    
                  );
                }
              });
            }}
          />
        </View>
        <Image
          source={{ uri: uri }}
          style={{
            flex: 1,
            maxHeight: "100%",
            maxWidth: "100%",

            resizeMode: "contain"
          }}
        />
       {this.state.showDownloadPermissionOverlay && (
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
             <Spinner
          visible={this.state.showOverlay}
          textContent= "Downloading image..."
          textStyle={{ color: "#FFF" }}
        />
      </View>
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
  },
  topMenu: {
    flex: 0,
    paddingHorizontal: 10,
    paddingVertical: 5,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    zIndex: 99,
    flexDirection: "row",
    maxWidth: "100%",
    backgroundColor: "rgba(0,0,0,0.4)"
  }
});
