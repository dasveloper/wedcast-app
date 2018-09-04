import Orientation from "react-native-orientation-locker";
import Permissions from "react-native-permissions";
import Spinner from "react-native-loading-spinner-overlay";
import Feed from "./ImageFeed";
import EStyleSheet from "react-native-extended-stylesheet";

import Masonry from "react-native-masonry";
import React, { Component } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  CameraRoll,
  Image,
  SafeAreaView,
  Animated,
  ActivityIndicator,
  Alert,
  FlatList,
  Dimensions
} from "react-native";
import { Icon, Avatar, Input, Button, Overlay } from "react-native-elements";
import firebase from "react-native-firebase";
import uuid from "uuid";
import RNFetchBlob from "react-native-fetch-blob";
import Camera from "react-native-camera";

export default class CreateFeed extends Component {
  state = {
    currentUser: null,
    images: null,
    downloadingSelected: false,
    doneDownloadingAll: false,
    downloadList: [],
    downloadingList: [],
    downloadPermission: null,
    showDownloadPermissionOverlay: false,
    selectAll: true,
    selectMode: false,
    fadeOut: new Animated.Value(0),
    showOverlay: false,
    overlayText: "",
    castId: null,
    imageSize: 0
  };
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    firebase.analytics().setCurrentScreen("feed");
    let self = this;
    const { currentUser } = firebase.auth();
    const dimensions = Dimensions.get("window");
    this.setState({ imageSize: dimensions.width });
    self.setState({ currentUser });
    let castId;
    if (this.props.navigation.getParam("castId")) {
      castId = this.props.navigation.getParam("castId", null);
      self.setState({ castId });
    }
    firebase
      .database()
      .ref(`feeds/feedNew/${castId}/uploads`)
      .on(
        "value",

        function(snapshot) {
          var data = [];
          snapshot.forEach(ss => {
            data.push({ image: ss.val(), key: ss.key });
          });
          self.setState({ images: data });
          //  alert(data.length)
        }
      );
  }
  goToFullscreen = post => {
    firebase.analytics().logEvent("view_image");

    this.props.navigation.navigate("ImageView", { post: post });
  };

  removeDownload(e) {
    this.setState({
      downloadList: this.state.downloadList.filter(function(download) {
        return download !== e;
      })
    });
  }
  addDownload(e) {
    let list = this.state.downloadList;
    if (list.indexOf(e) === -1) {
      list = list.concat(e);
      this.setState({ downloadList: list }); //simple value
    } else this.removeDownload(e);
    return;
  }
  removeIsDownloading(e) {
    setTimeout(
      function() {
        this.setState({
          showOverlay: false,
          overlayText: "",
          downloadingList: this.state.downloadingList.filter(function(
            download
          ) {
            return download !== e;
          })
        });
      }.bind(this),
      1000
    );
  }
  addIsDownloading(e) {
    this.setState({
      showOverlay: true,
      overlayText: "Downloading image..."
    });
    let list = this.state.downloadingList;
    if (list.indexOf(e) === -1) {
      list = list.concat(e);
      this.setState({ downloadingList: list }); //simple value
    } else this.removeDownload(e);
    return;
  }
  saveSelected = async () => {
    firebase.analytics().logEvent("save_all");

    for (let image of this.state.downloadList) {
      this.saveToCameraRoll(image.image);
    }
    setTimeout(
      function() {
        this.setState({ timePassed: true });

        this.setState({
          showOverlay: false,
          overlayText: "",
          downloadList: [],
          selectAll: true
        });
      }.bind(this),
      1000
    );
  };
  fadeOut() {
    this.state.fadeOut.setValue(1);
    Animated.timing(this.state.fadeOut, {
      toValue: 0,
      duration: 3000
    }).start();
  }

  saveToCameraRoll = async image => {    
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

  toggleSelectMode = () => {
    this.setState({
      selectMode: !this.state.selectMode,
      selectAll: true,
      downloadList: []
    });
  };
  
  selectAll = () => {
    if (this.state.selectAll) {
      this.setState({ downloadList: this.state.images });
    } else {
      this.setState({ downloadList: [] });
    }
    this.setState({ selectAll: !this.state.selectAll });
  };
  goToCamera = () => {
    Orientation.unlockAllOrientations();
    this.props.navigation.navigate("Main");
  };
  requestDownloadPermission = () => {
    firebase.analytics().logEvent("feed_request_download_permission");

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
  deleteImage(key) {
    firebase.analytics().logEvent("delete_image");

    let self = this;
  Alert.alert(
      `Delete photo`,
      `Are you sure you would like to delete this image?`,
      [
        {
          text: "Cancel"
        },
        {
          text: "Delete",
          onPress: () =>
          firebase
          .database()
          .ref(`feeds/feedNew/${self.state.castId}/uploads/${key}`)
          .remove()
        }
      ],
      { cancelable: true }
    );

}
  _renderItem = ({ item }) => {
    let image = item.image;
    let user = image.user;
    let key = item.key;
    let self = this;
    let isDownloading = this.state.downloadingList.includes(item);

    let isDownloadable = self.state.downloadList.includes(item);
    let trash = (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => this.deleteImage(key)}
        style={{
          justifyContent: "center",
          alignItems: "center",
          zIndex: 999,


        }}
      >
        <Text style={{fontSize: 22, fontFamily: 'Quicksand', color: '#fff'}}>Delete</Text>
      </TouchableOpacity>
    );
    let overlay = (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => this.addDownload(item)}
        style={{
          justifyContent: "center",
          alignItems: "center",
          zIndex: 999,

          width: 30,
          height: 30,
          borderRadius: 30,
          borderWidth: 2,
          borderColor: "#e4e4e4",
          backgroundColor: isDownloadable ? "#C1D870" : "rgba(255,255,255,0.7)"
        }}
      >
        {isDownloadable ? (
          <Icon size={18} color="#fff" type="ionicon" name="md-checkmark" />
        ) : (
          undefined
        )}
      </TouchableOpacity>
    );
    let header = this.state.selectMode ? (
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          position: "absolute",
          justifyContent: user.uid == this.state.currentUser.uid ? "space-between" :"flex-end",
          backgroundColor: "rgba(0,0,0,.5)",
          alignItems: "flex-start",
          zIndex: 999,
          top: 0,
          right: 0,
          left: 0,
          bottom: 0,
          padding: 10
        }}
      >
        {user.uid == this.state.currentUser.uid && trash}
        {overlay}
      </View>
    ) : (
      undefined
    );

    let footer = (
      <View style={styles.imageFooter}>
        <View style={styles.footerUser}>
          <Avatar
            size={40}
            rounded
            source={{ uri: user.photoURL }}
            activeOpacity={0.7}
          />
          <Text style={styles.footerUserName}>{user.displayName}</Text>
        </View>
        {isDownloading && <ActivityIndicator size="small" color="#000" />}
        {!isDownloading && (
          <Icon
          type="material-community"
          name="download"
            color="#000"
            underlayColor="transparent"
            style={styles.footerDownload}
            size={34}
            onPress={() => {
              Permissions.check("photo").then(response => {
                // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
                this.setState({
                  downloadPermission: response
                });
                firebase.analytics().logEvent("feed_save_image");

                if (response == "undetermined") {
                  this.alertForDownloadPermission();
                } else if (response == "authorized") {
                  this.addIsDownloading(image);
                  this.saveToCameraRoll(image).then(res =>
                    this.removeIsDownloading(image)
                  );
                }
              });
            }}
          />
        )}
      </View>
    );
    return (
      <View style={styles.imageCard}>
        {header}
        <TouchableOpacity
        
          onPress={() => this.goToFullscreen(item)}
        >
          <Image
            source={{ uri: image.uri }}
            style={{
              height: this.state.imageSize,
              width: this.state.imageSize,
              alignSelf: "center"
            }}
          />
        </TouchableOpacity>
        {footer}
      </View>
    );
  };

  render() {
    let topMenu = this.state.selectMode ? (
      <View style={styles.topMenu}>
        <TouchableOpacity
          onPress={() => {
            Permissions.check("photo").then(response => {
              // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
              this.setState({ downloadPermission: response });
              if (response == "undetermined") {
                this.alertForDownloadPermission();
              } else if (response == "authorized") {
                if (this.state.downloadList.length > 0) {
                  this.setState({
                    showOverlay: true,
                    overlayText: `Downloading ${
                      this.state.downloadList.length
                    } images...`
                  });
                  this.saveSelected();
                }
              }
            });
          }}
          style={{ flexDirection: "row" }}
        >
          <Text style={{ fontSize: 16, fontFamily: "Quicksand" }}>
            {this.state.downloadList.length == 0
              ? "Select images to download"
              : "Download " + this.state.downloadList.length}
          </Text>
          <Animated.View style={{ opacity: this.state.fadeOut }}>
            <Icon
              type="ionicon"
              underlayColor="transparent"
              name="md-checkmark"
              color="green"
              iconStyle={styles.navIcon}
              size={20}
            />
          </Animated.View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => this.selectAll()}>
          <Text style={{ fontSize: 16, fontFamily: "Quicksand" }}>
            {this.state.selectAll ? "Select all" : "Deselect all"}
          </Text>
        </TouchableOpacity>
      </View>
    ) : (
      undefined
    );
    let bottomMenu = (
      <SafeAreaView style={styles.bottomMenuWrapper}>
        <Icon
          type="ionicon"
          underlayColor="transparent"
          name="ios-camera-outline"
          color="#000"
          iconStyle={styles.navIcon}
          size={40}
          onPress={() => this.goToCamera()}
        />

        <Icon
          type="ionicon"
          underlayColor="transparent"
          name="ios-checkmark-circle-outline"
          color="#000"
          iconStyle={styles.navIcon}
          size={40}
          onPress={() => this.toggleSelectMode()}
        />
      </SafeAreaView>
    );

    const { currentUser, overlayText, showOverlay } = this.state;

    return (
      <SafeAreaView style={{ backgroundColor: "#fff", flex: 1 }}>
        <Spinner
          visible={this.state.showOverlay}
          textContent={overlayText}
          textStyle={{ color: "#FFF" }}
        />
        <View style={styles.container}>
          <View style={{ padding: 10 }}>
            <Text style={styles.feedHeader}>Photos</Text>
          </View>
          {topMenu}
          <View
            style={{
              padding: 10,
              paddingTop: 15,
              backgroundColor: "#fff",
              flex: 1,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20
            }}
          >
            {this.state.images == null ||
              (this.state.images.length == 0 && (
                <View>
                  <Text
                    style={{
                      marginTop: 20,
                      fontFamily: "Quicksand",
                      textAlign: "center",
                      fontSize: 16
                    }}
                  >
                    There are no images for this Wedcast
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Quicksand",
                      marginTop: 10,
                      textAlign: "center",
                      color: "#a4a4a4"
                    }}
                  >
                    Pictures you take will appear here!
                  </Text>
                </View>
              ))}
       
            {this.state.images && (
                             <FlatList
                             extraData={this.state}
                             keyExtractor={(item, index) => item.key}
                             data={this.state.images}
                             renderItem={this._renderItem}
                           />
              // <Feed
              //   images={this.state.images}
              //   castId={this.state.castId}
              //   selectMode={this.state.selectMode}
              //   goToFullscreen={this.goToFullscreen}
              // />
            )}
          </View>
        </View>
        {bottomMenu}
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
        {false && (
          <View
            pointerEvents="box-none"
            style={{
              position: "absolute",
              zIndex: 99,
              left: 0,
              right: 0,
              bottom: -25,
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <Icon
              type="ionicon"
              name="md-add"
              color="#F04155"
              containerStyle={styles.addButton}
              size={40}
              reverse
            />
          </View>
        )}
      </SafeAreaView>
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1F9FAC"
  },
  feedHeader: {
    fontSize: 22,
    fontFamily: "Quicksand",
    color: "#fff",
    textAlign: "left",
    fontWeight: "800"
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
  imageFooter: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255,255,255,.5)",
    borderColor: "#999999",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  footerDownload: {
    alignSelf: "center",
    marginTop: 5
  },
  footerUser: {
    flexDirection: "row",
    alignItems: "center"
  },
  footerUserName: {
    fontSize: 16,
    marginLeft: 10,
    fontFamily: "Quicksand"
  },
  bottomMenuWrapper: {
    paddingHorizontal: 5,
    display: "flex",
    alignItems: "center",

    backgroundColor: "#fff",
    zIndex: 99,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  topMenu: {
    backgroundColor: "rgba(255,255,255,.6)",
    marginBottom: 10,
    flex: 0,
    padding: 10,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",

    zIndex: 99,
    flexDirection: "row",
    maxWidth: "100%"
  },
  captureButton: {
    width: 60,
    height: 60,
    borderRadius: 60,
    backgroundColor: "#fbfbfb",
    alignSelf: "center",
    borderWidth: 2,
    borderColor: "#fff"
  },
  navIcon: {
    marginHorizontal: 10
  },
  navText: {
    marginHorizontal: 20,
    color: "#000",
    fontSize: 20,
    fontFamily: "Quicksand"
  },
  addButton: {
    bottom: 0,
    left: 0,
    right: 0,
    margin: "auto"
  },
  imageCard: {
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
    marginBottom: 10
  }
});
