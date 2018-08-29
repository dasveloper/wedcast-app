/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */
import SplashScreen from "react-native-splash-screen";
import Orientation from "react-native-orientation-locker";
import EStyleSheet from "react-native-extended-stylesheet";

import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ScrollView,
  SafeAreaView,
  Animated,
  Alert,
  Image,
  Linking,
  Dimensions
} from "react-native";
import firebase from "react-native-firebase";
import {
  Input,
  Button,
  ListItem,
  Icon,
  Avatar,
  Overlay
} from "react-native-elements";

const defaultAvatar =
  "https://cdn.clutchprep.com/avatar_images/mNSN76C3QkGGfoD1HbVO_avatar_placeholder.png";

export default class Profile extends Component {
  defaultState = {
    currentUser: null,
    accountMenuVisible: false,
    policyVisible: false
  };
  constructor(props) {
    super(props);
    this.state = { ...this.defaultState, smallScreen: false };
  }

  componentDidMount() {
    let currentUser;
    if (this.props.navigation.getParam("castId")) {
      castId = this.props.navigation.getParam("castId", null);
      this.setState({ currentUser });
    }
    if (
      Dimensions.get("window").width <= 320 &&
      Dimensions.get("window").height <= 500
    ) {
      this.setState({ smallScreen: true });
    }
  }
  logout = () => {
    firebase.analytics().logEvent("logout");

    let self = this;
    if (this.state.currentUser.isAnonymous) {
      Alert.alert(
        `Wait! Your account will be lost`,
        `You must link your account to a phone number if you want to log back in`,
        [
          {
            text: "Log Out",
            onPress: () =>
              firebase
                .auth()
                .signOut()
                .then(function() {
                  self.props.navigation.navigate("LoginName");
                  self.setState({ ...self.defaultState });
                })
          },
          {
            text: "Link phone number",
            onPress: () => this.props.navigation.navigate("LoginPhone")
          },
          {
            text: "Cancel"
          }
        ],
        { cancelable: true }
      );
    } else {
      
      firebase
        .auth()
        .signOut()
        .then(function() {
          self.props.navigation.navigate("LoginName");
          self.setState({ ...self.defaultState });
        });
    }
  };
  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.navigation) {
      if (
        !prevState.navigation ||
        nextProps.navigation.getParam("currentUser", null) !==
          prevState.navigation.getParam("currentUser", null)
      ) {
        const currentUser = nextProps.navigation.getParam("currentUser", null);

        return { currentUser: currentUser };
      }
    } else return null;
  }
  componentDidUpdate(prevProps) {}

  returnData = avatarUri => {
    let user = firebase.auth().currentUser;
    let self = this;
    if (user != null) {
      user
        .updateProfile({ photoURL: avatarUri })
        .then(function(user) {
          self.setState({ currentUser: firebase.auth().currentUser });
          //return user.updateProfile({'displayName': this.state.name, "photoUrl": this.state.avatarUri});
        })
        .catch(function(error) {});
    }
  };
  render() {
    const { currentUser, errorMessage, userFeeds } = this.state;
    let newUser;
    let avatarWidth = Dimensions.get("window").width / 2;
    let badgeOffset = (avatarWidth / 2) * 0.414;
    return (
      <SafeAreaView
        style={{ flex: 1, position: "relative", backgroundColor: "#fff" }}
      >
        <View style={styles.backButton}>
          <Icon
            type="ionicon"
            name="ios-arrow-back"
            color="#000"
            size={30}
            onPress={() => this.props.navigation.goBack()}
            containerStyle={styles.backIcon}
          />

          {currentUser &&
            currentUser.displayName && (
              <Text style={styles.userName}>{currentUser.displayName}</Text>
            )}
        </View>

        {currentUser && (
          <View
            style={{
              zIndex: 9,
              height: "90%",
              flexDirection: "column",
              borderRadius: 4
            }}
          >
            <View style={{ alignItems: "center" }}>
              <View style={{ position: "relative" }}>
                <Avatar
                  size={avatarWidth}
                  rounded
                  source={{ uri: currentUser.photoURL || defaultAvatar }}
                  activeOpacity={0.7}
                />
                <View
                  style={{
                    position: "absolute",
                    width: avatarWidth,
                    height: avatarWidth,
                    left: 0,
                    top: 0
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      Orientation.unlockAllOrientations();

                      this.props.navigation.navigate("UpdateAvatar", {
                        returnData: this.returnData.bind(this),
                        storagePath: `users`

                      });
                    }}
                    style={{
                      position: "absolute",
                      backgroundColor: "#BADA5F",
                      width: 30,
                      height: 30,
                      borderRadius: 20,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      left: avatarWidth - badgeOffset,
                      top: avatarWidth - badgeOffset,
                      //left: 150 - 15.5660171778,
                      //top: 150 -  15.5660171778,

                      transform: [{ translateX: -5 }, { translateY: -5 }]
                    }}
                  >
                    <Icon
                      name="md-create"
                      color="#fff"
                      type="ionicon"
                      size={16}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View style={{ flex: 1, marginTop: 20 }}>
              {currentUser.phoneNumber && (
                <ListItem
                  containerStyle={styles.detailItem}
                  title={
                    <View>
                      <Text style={styles.detailLabel}>Linked phone: </Text>
                      <Text style={styles.detail}>
                        {currentUser.phoneNumber}
                      </Text>
                    </View>
                  }
                />
              )}
              <ListItem
                containerStyle={styles.detailItem}
                onPress={() => this.props.navigation.navigate("PrivacyPolicy")}
                title={
                  <View>
                    <Text style={styles.settingsActions}>Privacy Policy</Text>
                  </View>
                }
              />
              <ListItem
                containerStyle={styles.detailItem}
                onPress={() => Linking.openURL('mailto:support@wedcast.app')}
                title={
                  <View>
                    <Text style={styles.settingsActions}>Support</Text>
                  </View>
                }
              />
              {this.state.currentUser.isAnonymous && (
                <ListItem
                  containerStyle={styles.detailItem}
                  onPress={() => this.props.navigation.navigate("LoginPhone")}
                  title={
                    <View>
                      <Text style={styles.settingsActions}>
                        Create recovery account
                      </Text>
                    </View>
                  }
                />
              )}
            </View>
            <View style={styles.logoutWrapper}>
              <TouchableOpacity
                onPress={this.logout}
                style={styles.logoutButton}
              >
                <Text style={styles.logoutButtonText}> Log Out </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>
    );
  }
}
const styles = EStyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#fff"
  },
  settingsItem: {
    borderBottomWidth: 0.5,
    borderColor: "#999999"
  },
  settingsActions: {
    fontSize: 16,
    marginHorizontal: 10,
    fontFamily: "Quicksand"
  },
  detail: {
    fontSize: 16
  },
  logoutWrapper: {
    alignItems: "center"
  },
  logoutButton: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#d93636",
    borderRadius: 4,
    paddingVertical: 15,
    paddingHorizontal: 40,
    margin: "auto"
  },
  logoutButtonText: {
    color: "#fff",
    fontFamily: "Quicksand",
    fontSize: "20rem"
  },
  backButton: {
    justifyContent: "center",
    alignSelf: "center",
    paddingVertical: 10,
    flexDirection: "row",
    flexWrap: "nowrap",
    position: "relative",
    width: "100%"
  },
  backIcon: {
    position: "absolute",
    left: 10,
    top: 10
  },
  userName: {
    fontSize: 24,
    color: "#000",
    fontFamily: "Quicksand",
    textAlign: "center"
  },
  detailItem: {
    borderBottomWidth: 0.5,
    borderColor: "#999999"
  },
  detailLabel: {
    color: "#999999",
    fontSize: 16,
    marginBottom: 4,
    fontFamily: "Quicksand"
  },
  detail: {
    fontSize: 16,
    fontFamily: "Quicksand"
  }
});
