import Orientation from "react-native-orientation-locker";
import Permissions from 'react-native-permissions'

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
  Alert
} from "react-native";
import { Icon, Avatar,Input, Button  } from "react-native-elements";
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
    selectAll: true,
    selectMode: false,
    fadeOut: new Animated.Value(0)
  };
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    let self = this;
    const { currentUser } = firebase.auth();
    self.setState({ currentUser });
    let castId;
    if (this.props.navigation.getParam("castId")) {
      castId = this.props.navigation.getParam("castId", null);
    }
    firebase
      .database()
      .ref(`feeds/feedNew/${castId}/uploads`)
      .on(
        "value",

        function(snapshot) {
          var data = [];
          snapshot.forEach(ss => {
            data.push(ss.val());
          });
          self.setState({ images: data });
        }
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
    this.setState({
      downloadingList: this.state.downloadingList.filter(function(download) {
        return download !== e;
      })
    });
  }
  addIsDownloading(e) {
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
    this.setState({
      downloadingSelected: false,
      downloadList: [],
      selectAll: true
    });
    this.fadeOut();
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
        .fetch('GET', image.uri)
        .then(res => {
           CameraRoll.saveToCameraRoll(res.path())
          
        });
    } else {
      await CameraRoll.saveToCameraRoll(image.uri);
    }
    return;
  };

  cancelSelectMode = () => {
    this.setState({ selectMode: !this.state.selectMode, selectAll: true });
    this.setState({ downloadList: [] });
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
    Permissions.request('photo').then(response => {
      // Returns once the user has chosen to 'allow' or to 'not allow' access
      // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
      this.setState({ cameraPermission: response })
    })
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
  render() {
    let topMenu = this.state.selectMode ? (
      <View style={styles.topMenu}>
        <TouchableOpacity
          onPress={() => {
              Permissions.check('photo').then(response => {
                // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
                this.setState({ downloadPermission: response })
                if (response == 'undetermined'){
                  this.alertForDownloadPermission();
        
                } else if (response == 'authorized'){
       
                  if (this.state.downloadList.length > 0) {
                    this.setState({ downloadingSelected: true });
                    this.saveSelected();
                  }

                }
        
              })

          }}
          style={{ flexDirection: "row" }}
        >
          <Text style={{ fontSize: 16, fontFamily: "Quicksand" }}>
            {this.state.downloadList.length == 0
              ? "Select images to download"
              : this.state.downloadingSelected
                ? "Downloading"
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
      <View style={styles.bottomMenu}>
        <Icon
          type="ionicon"
          underlayColor="transparent"
          name="ios-camera-outline"
          color="black"
          iconStyle={styles.navIcon}
          size={40}
          onPress={() => this.goToCamera()}
        />

        {this.state.selectMode && (
          <TouchableOpacity onPress={() => this.cancelSelectMode()}>
            <Text style={styles.navText}>Cancel</Text>
          </TouchableOpacity>
        )}
        {!this.state.selectMode && (
          <TouchableOpacity
            onPress={() =>
              this.setState({ selectMode: !this.state.selectMode })
            }
          >
            <Text style={styles.navText}> Select</Text>
          </TouchableOpacity>
        )}
      </View>
    );

    const { currentUser } = this.state;

    return (
      <SafeAreaView style={{ backgroundColor: '#fff',flex: 1 }}>
        <View style={styles.container}>
          {topMenu}
          {this.state.images && (
            <Masonry
              spacing={0}
              imageContainerStyle={{ marginTop: 0, position: "relative" }}
              columns={1} // optional - Default: 2
              bricks={this.state.images.map(data => {
                let foo = data;
                let user = data.user;
                let self = this;
                return {
                  uri: data.uri,
                  onPress: data =>
                    this.state.selectMode ? this.addDownload(foo) : undefined,
                  renderHeader: data => {
                    let isDownloadable = self.state.downloadList.includes(foo);

                    let overlay = this.state.selectMode ? (
                      <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => this.addDownload(foo)}
                        style={{
                          position: "absolute",
                          justifyContent: "center",
                          alignItems: "center",
                          zIndex: 999,
                          top: 10,
                          right: 10,
                          width: 30,
                          height: 30,
                          borderRadius: 30,
                          borderWidth: 2,
                          borderColor: "#e4e4e4",
                          backgroundColor: isDownloadable
                            ? "#C1D870"
                            : "rgba(255,255,255,0.7)"
                        }}
                      >
                        {isDownloadable ? (
                          <Icon
                            size={18}
                            color="#fff"
                            type="ionicon"
                            name="md-checkmark"
                          />
                        ) : (
                          undefined
                        )}
                      </TouchableOpacity>
                    ) : (
                      undefined
                    );
                    return overlay;
                  },
                  renderFooter: data => {
                    let isDownloading = self.state.downloadingList.includes(
                      foo
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
                          <Text style={styles.footerUserName}>
                            {user.displayName}
                          </Text>
                        </View>
                        {isDownloading && (
                          <ActivityIndicator size="small" color="#000" />
                        )}
                        {!isDownloading && (
                          <Icon
                            type="ionicon"
                            name="ios-download-outline"
                            color="#000"
                            underlayColor="transparent"
                            style={styles.footerDownload}
                            size={34}
                            onPress={() => {
                              Permissions.check('photo').then(response => {
                                // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
                                this.setState({ downloadPermission: response })
                                if (response == 'undetermined'){
                                  this.alertForDownloadPermission();
                        
                                } else if (response == 'authorized'){
                                  this.addIsDownloading(foo);
                                  this.saveToCameraRoll(foo).then(res =>
                                    this.removeIsDownloading(foo)
                                  );
                                }
                        
                              })
                              
            
                            }}
                          />
                        )}
                      </View>
                    );
                    return footer;
                  }
                };
              })}
            />
          )}
        </View>
        {bottomMenu}
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  imageFooter: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255,255,255,.5)",
    borderColor: "#999999",
    borderBottomWidth: 1,
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
  bottomMenu: {
    flex: 0,
    padding: 5,
    maxHeight: 50,
    backgroundColor: "#fff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",

    zIndex: 99,
    flexDirection: "row"
  },
  topMenu: {
    backgroundColor: "rgba(255,255,255,.6)",

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
  }
});
