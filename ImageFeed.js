import Orientation from "react-native-orientation-locker";
import Permissions from "react-native-permissions";
import Spinner from "react-native-loading-spinner-overlay";

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
  ListView,
  Dimensions,
  FlatList
} from "react-native";
import { Icon, Avatar, Input, Button, Overlay } from "react-native-elements";
import firebase from "react-native-firebase";
import uuid from "uuid";
import RNFetchBlob from "react-native-fetch-blob";
import Camera from "react-native-camera";

export default class Feed extends Component {
  constructor(props) {
    super(props);
    const ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2
    });
    this.state = {
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
      width: 0,
      dataSource: ds.cloneWithRows(this.props.images)
    };
  }
  componentDidMount() {
    const dimensions = Dimensions.get("window");
    this.setState({ width: dimensions.width });
    let self = this;
    const { currentUser } = firebase.auth();
    self.setState({ currentUser });
  }
  static getDerivedStateFromProps(props, state) {
    // Any time the current user changes,
    // Reset any parts of state that are tied to that user.
    // In this simple example, that's just the email.
    if (props.selectMode !== state.selectMode) {
      return {
        selectMode: props.selectMode
      };
    }
    return null;
  }
  deleteImage(key) {
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
            .ref(`feeds/feedNew/${self.props.castId}/uploads/${key}`)
            .remove()
          }
        ],
        { cancelable: true }
      );

  }
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
    for (let image of this.state.downloadList) {
      this.saveToCameraRoll(image);
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

  selectAll = () => {
    if (this.state.selectAll) {
      this.setState({ downloadList: this.props.images });
    } else {
      this.setState({ downloadList: [] });
    }
    this.setState({ selectAll: !this.props.selectAll });
  };
  goToCamera = () => {
    Orientation.unlockAllOrientations();
    this.props.navigation.navigate("Main");
  };
  requestDownloadPermission = () => {
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
    let header = this.props.selectMode ? (
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          position: "absolute",
          justifyContent: "space-between",
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
        {trash}
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
            type="ionicon"
            name="ios-download-outline"
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
        
          onPress={() => this.props.goToFullscreen(item)}
        >
          <Image
            source={{ uri: image.uri }}
            style={{
              height: this.state.width,
              width: this.state.width,
              alignSelf: "center"
            }}
          />
        </TouchableOpacity>
        {footer}
      </View>
    );
  };

  render() {
    const { currentUser, overlayText, showOverlay } = this.state;

    return (
      <SafeAreaView style={{ backgroundColor: "#fff", flex: 1 }}>
        <FlatList
          extraData={this.state}
          keyExtractor={(item, index) => item.key}
          data={this.props.images}
          renderItem={this._renderItem}
        />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  feedHeader: {
    fontSize: 22,
    fontFamily: "Quicksand",
    color: "#fff",
    textAlign: "left",
    fontWeight: "800"
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
