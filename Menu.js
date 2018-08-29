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

export default class Menu extends Component {
  defaultState = {
    currentUser: null,
    feedId: "",
    userFeeds: null,
    accountMenuVisible: false,
    myWeddings: null,
    myWeddingList: null,
    errorMessage: null,
    heroHeight: null,
    heroWidth: null,
    flyout: new Animated.Value(200)
  };
  constructor(props) {
    super(props);
    const { currentUser } = firebase.auth();
    this.state = { ...this.defaultState, currentUser, smallScreen: false };
  }

  getUserFeeds = () => {
    let self = this;

    firebase
      .database()
      .ref(`users/${firebase.auth().currentUser.uid}/myWedding`)
      .orderByChild("feedCount")
      .on("value", function(snapshot) {
        var data = [];
        snapshot.forEach(ss => {
          let myFeed = ss.val();
          data.push(myFeed.castId);
        });
        self.setState({ myWeddingList: data });
        self.updateMyWeddingFeeds();
      });

    firebase
      .database()
      .ref(`users/${firebase.auth().currentUser.uid}/feedList`)
      .orderByChild("feedCount")
      .on("value", function(snapshot) {
        var data = [];
        snapshot.forEach(ss => {
          let myFeed = ss.val();
          data.push(myFeed.castId);
        });
        self.setState({ feedList: data });
        self.updateFeeds();
      });
  };
  componentDidMount() {
    firebase.analytics().setCurrentScreen("menu");
    const srcHeight = 268;
    const srcWidth = 700;
    const maxHeight = Dimensions.get("window").height; // or something else
    const maxWidth = Dimensions.get("window").width;

    const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
    this.setState({
      heroWidth: srcWidth * ratio,
      heroHeight: srcHeight * ratio
    });

    if (
      Dimensions.get("window").width <= 320 &&
      Dimensions.get("window").height <= 500
    ) {
      this.setState({ smallScreen: true });
    }
    SplashScreen.hide();
    Orientation.lockToPortrait();
    this.getUserFeeds();

    if (this.props.navigation.getParam("newUser")) {
      setTimeout(() => {
        this.flyout();
      }, 1000);
    }
  }
  flyout() {
    Animated.timing(this.state.flyout, {
      toValue: 0,
      duration: 200
    }).start();
  }
  flyoutReverse() {
    Animated.timing(this.state.flyout, {
      toValue: 200,
      duration: 200
    }).start();
  }
  updateMyWeddingFeeds = () => {
    let self = this;
    let feeds = [];
    self.setState({ myWeddings: null });
    this.state.myWeddingList.forEach(castId => {
      firebase
        .database()
        .ref(`feeds/feedNew/${castId}/chatInfo`)
        .on(
          "value",

          function(snapshotRef) {
            let cast = snapshotRef.val();
            let wedList = self.state.myWeddings;
            let newCast = true;
            if (wedList) {
              for (var i = 0; i < wedList.length; i++) {
                if (wedList[i].castId === cast.castId) {
                  wedList[i] = cast;
                  newCast = false;
                  break;
                }
              }
            }
            if (newCast) {
              feeds.push(snapshotRef.val());
            }
            self.setState({ myWeddings: feeds });
          }
        );
    });
  };
  updateFeeds = () => {
    let self = this;
    let feeds = [];
    self.setState({ userFeeds: null });
    this.state.feedList.forEach(castId => {
      firebase
        .database()
        .ref(`feeds/feedNew/${castId}/chatInfo`)
        .on(
          "value",

          function(snapshotRef) {
            let cast = snapshotRef.val();
            let feedList = self.state.userFeeds;
            let newCast = true;
            if (feedList) {
              for (var i = 0; i < feedList.length; i++) {
                if (feedList[i].castId === cast.castId) {
                  feedList[i] = cast;
                  newCast = false;
                  break;
                }
              }
            }
            if (newCast) {
              feeds.push(snapshotRef.val());
            }
            self.setState({ userFeeds: feeds });
          }
        );
    });
  };
  logout = () => {
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
  componentDidUpdate(prevProps) {
    if (
      prevProps.navigation.getParam("currentUser", null) !==
      this.props.navigation.getParam("currentUser", null)
    ) {
      this.getUserFeeds();
    }
  }

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

    return (
      <SafeAreaView
        style={{ flex: 1, position: "relative", backgroundColor: "#fff" }}
      >
        <ScrollView style={styles.container}>
          <View style={styles.nav}>
            <Icon
              type="evilicon"
              name="user"
              underlayColor="transparent"
              iconStyle={styles.navIcon}
              containerStyle={{marginTop: 5}}
              color="#1F9FAC"
              size={42}
              onPress={() =>
                this.props.navigation.navigate("Profile", {
                  currentUser: currentUser
                })
              }
            />
            {false && (
              <Avatar
                size={45}
                rounded
                activeOpacity={0.7}
                source={{ uri: currentUser.photoURL || defaultAvatar }}
                onPress={() =>
                  this.props.navigation.navigate("Profile", {
                    currentUser: currentUser
                  })
                }
              />
            )}
            {false && (
              <Image
                style={styles.logo}
                source={require("./assets/logo-blue.png")}
              />
            )}
            <View style={styles.notifications}>
              <Icon
                type="ionicon"
                name="ios-mail-outline"
                color="#1F9FAC"
                iconStyle={styles.navIcon}
                size={40}
                onPress={() =>
                  this.props.navigation.navigate("Notifications", {
                    currentUser: currentUser
                  })
                }
              />
            </View>
          </View>
          <Image
            style={{
              width: this.state.heroWidth,
              height: this.state.heroHeight
            }}
            resizeMode="cover"
            source={require("./assets/hero-large-min.jpg")}
          />

          <View style={styles.topWrapper}>
            <Text style={styles.searchLabel}>Find Wedcast</Text>
            <View style={styles.buttonGroup}>
              <Input
                placeholder="#CastID"
                onChangeText={text => this.addHashTag(text)}
                value={this.state.feedId}
                autoCapitalize="none"
                containerStyle={styles.searchInputContainer}
                inputContainerStyle={{ padding: 0, borderBottomWidth: 0 }}
                inputStyle={styles.searchInput}
              />
              <Button
                buttonStyle={styles.searchButton}
                title="Go"
                titleStyle={styles.searchButtonTitle}
                disabledStyle={{ backgroundColor: "#1F9FAC" }}
                disabled={this.state.feedId == "" || this.state.feedId == "#"}
                onPress={this.goToFeed.bind(this, this.state.feedId)}
              />
            </View>
            {errorMessage && (
              <Text
                style={{
                  color: "red",
                  margin: 5,
                  textAlign: "center",
                  fontSize: 16,
                  fontFamily: "Quicksand"
                }}
              >
                {errorMessage}
              </Text>
            )}
            <Text style={styles.or}>OR</Text>
            <View>
              <TouchableOpacity
                style={styles.createButton}
                title="Create Wedcast"
                onPress={this.goToCreateFeed.bind(this)}
              >
                <Text style={styles.createButtonText}>Create Wedcast</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ flex: 1, padding: 10 }}>
            <Text style={styles.listLabel}>Your weddings</Text>

            <FlatList
              keyExtractor={this.keyExtractor}
              data={this.state.myWeddings}
              renderItem={this.renderItem}
              extraData={this.state}
            />
            <FlatList
              contentContainerStyle={
                !this.state.userFeeds && styles.centerEmptySet
              }
              keyExtractor={this.keyExtractor}
              data={this.state.userFeeds}
              renderItem={this.renderItem}
              extraData={this.state}
              // ListEmptyComponent={
              //   <Text style={{ paddingVertical: 20, color: "#999999" }}>
              //     Currently not attending any weddings
              //  </Text>
              // }
            />
            {!(this.state.myWeddings || this.state.userFeeds) && (
              <Text style={{ paddingBottom: 20, color: "#999999" }}>
                Currently not attending any weddings
              </Text>
            )}
          </View>
        </ScrollView>
        <Animated.View
          style={{
            // top: this.state.flyout,
            position: "absolute",
            height: 200,
            left: 0,
            right: 0,
            transform: [{ translateY: this.state.flyout }],
            bottom: 0,
            backgroundColor: "#1F9FAC",
            padding: 20,
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            shadowOpacity: 0.6,
            shadowRadius: 2,
            shadowColor: "#c8c8c8",
            shadowOffset: { height: -3, width: 0 }
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontFamily: "Quicksand",
              color: "#fff"
            }}
          >
            Welcome to Wedcast
          </Text>
          <Text
            style={{
              fontSize: 18,
              fontFamily: "Quicksand",
              color: "#fff",
              textAlign: "center",
              marginVertical: 8
            }}
          >
            Begin by entering your wedding's #CastID or creating a new Wedcast
          </Text>
          <Button
            containerStyle={{
              borderWidth: 1,
              borderColor: "#fff",
              borderRadius: 10,
              paddingHorizontal: 10,
              marginTop: 20
            }}
            clear={true}
            titleStyle={{}}
            title="Got it"
            onPress={() => this.flyoutReverse()}
          />
        </Animated.View>
      </SafeAreaView>
    );
  }

  addHashTag = castId => {
    let sanitizedCastId = castId.replace(/[ .#$\\\/\[\]]+/g, "").toLowerCase();
    let hasInput = castId.length === 0;
    if (sanitizedCastId.length && sanitizedCastId.charAt(0) != "#") {
      sanitizedCastId = "#" + sanitizedCastId;
    }
    if (sanitizedCastId !== castId) {
      console.log("forcing update");
      this.setState({ feedId: sanitizedCastId + " " }); // this character is not alphanumerical 'x', it's a forbidden character '✕' (cross)
      setTimeout(() => {
        this.setState(previousState => {
          return { ...previousState, feedId: sanitizedCastId };
        });
      }, 0);
    } else {
      this.setState({ feedId: sanitizedCastId });
    }

    this.setState({ disableNext: hasInput });
  };
  goToFeed = feedId => {
    let feed = null;
    let self = this;
    let castId = feedId.replace("#", "");

    firebase
      .database()
      .ref("feeds/feedNew")
      .child(castId)
      .child("chatInfo")
      .once("value", function(snapshot) {
        const exists = snapshot.val();
        if (exists) {
          let feed = snapshot.val();
          let owner = feed.owner;
          self.setState({ errorMessage: undefined });

          firebase
            .database()
            .ref(
              `feeds/feedNew/${castId}/members/${self.state.currentUser.uid}`
            )
            .once("value", function(snapshot) {
              const hasPermission = snapshot.val();
              if (!hasPermission) {
                self.props.navigation.navigate("PrivateFeed", {
                  feed: feed,
                  owner: owner,
                  castId: castId
                });
              } else {
                self.props.navigation.navigate("WeddingDetails", {
                  castId: castId,
                  feedName: feed.feedName
                });
              }
            })
            .catch(function(error) {
              // Handle Errors here.
              var errorCode = error.code;
              var errorMessage = error.message;
              if (errorCode === "database/permission-denied") {
                self.props.navigation.navigate("PrivateFeed", {
                  feed: feed,
                  owner: owner,
                  castId: castId
                });
              }
              // ...
            });
        } else {
          self.setState({ errorMessage: `Couldn't find Wedcast ${feedId}` });
        }
      });
  };
  keyExtractor = (item, index) => item.castId;
  renderItem = ({ item }) => {
    let image =
      item.avatarUri == undefined
        ? require("./assets/placeholder.png")
        : { uri: item.avatarUri };
    return (
      <ListItem
        id={item.castId}
        title={item.feedName}
        subtitle={`#` + item.castId}
        onPress={this.goToFeed.bind(this, item.castId)}
        titleStyle={{ fontFamily: "Quicksand" }}
        subtitleStyle={{ color: "#a8a8a8", fontFamily: "Quicksand" }}
        style={{
          borderBottomWidth: 1,
          borderColor: "#e8e8e8",
          marginBottom: 5
        }}
        chevron
        leftAvatar={{
          rounded: true,
          size: "medium",
          avatarStyle: {
            backgroundColor: "#1F9FAC"
          },
          overlayContainerStyle: {
            overflow: "hidden",
            backgroundColor: "transparent"
          },
          source: image
        }}
      />
    );
  };
  goToCreateFeed = () => {
    firebase.analytics().logEvent(`create_wedcast`);

    this.props.navigation.navigate("CreateFeed");
  };
}
const styles = EStyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#fff"
  },
  centerEmptySet: { justifyContent: "center", alignItems: "center" },
  nav: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    zIndex: 10,
    position: "absolute",
    left: 0,
    right: 0
  },
  notifications: {
    position: "relative"
  },

  buttonGroup: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center"
  },
  settingsItem: {
    borderBottomWidth: 0.5,
    borderColor: "#999999"
  },

  userName: {
    alignSelf: "center",
    fontSize: 22,
    margin: 10,
    fontFamily: "Quicksand"
  },
  settingsActions: {
    fontSize: 16,
    marginHorizontal: 10,
    fontFamily: "Quicksand"
  },
  detail: {
    fontSize: 16
  },
  logoutButton: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#d93636",
    borderRadius: 4,
    padding: 10,
    marginTop: "auto"
  },
  logoutButtonText: {
    color: "#fff",
    fontFamily: "Quicksand",
    fontSize: "15rem"
  },
  topWrapper: {
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowColor: "#c8c8c8",
    shadowOffset: { height: 10, width: 0 },
    padding: 10,
    zIndex: 2,
    backgroundColor: "#A8BF59",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10
  },

  logo: {
    flex: 1,
    height: "80%",
    marginLeft: -10,
    resizeMode: "contain",
    width: null
  },
  hero: {
    width: "100%",
    height: null,
    flex: 1
  },
  listLabel: {
    fontSize: "18rem",
    fontWeight: "bold",
    marginBottom: 10,
    color: "#000",
    fontFamily: "Quicksand"
  },
  searchLabel: {
    fontSize: "18rem",
    fontWeight: "bold",
    marginBottom: 10,
    color: "#000",
    fontFamily: "Quicksand"
  },
  searchInputContainer: {
    backgroundColor: "#f4f4f4",
    margin: 0,
    flex: 1,
    alignSelf: "center",
    borderRadius: 0,
    borderTopLeftRadius: 10,
    paddingHorizontal: "5rem",
    paddingVertical: "10rem",
    height: null,
    borderBottomLeftRadius: 10
  },
  searchInput: {
    fontSize: "20rem",
    fontFamily: "Quicksand",
    padding: 0,
    height: null
  },
  searchButton: {
    backgroundColor: "#1F9FAC",
    padding: "0rem",
    alignSelf: "center",
    borderColor: "transparent",
    borderWidth: 0,
    borderRadius: 0,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    paddingHorizontal: "10rem",
    paddingVertical: "10rem"
  },
  searchButtonTitle: {
    fontFamily: "Quicksand",
    fontSize: "20rem",
    padding: 0
  },
  createButton: {
    flex: 1,
    backgroundColor: "#1F9FAC",
    borderRadius: 10,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: "10rem"
  },
  createButtonText: {
    fontSize: "20rem",
    color: "#fff",
    fontFamily: "Quicksand"
  },
  or: {
    fontFamily: "Quicksand",
    margin: 10,
    fontSize: "14rem",
    alignSelf: "center",
    color: "#000"
  }
});
