/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */
import SplashScreen from "react-native-splash-screen";
import Orientation from "react-native-orientation-locker";

import React, { Component } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Animated,
  Alert,Dimensions
} from "react-native";
import firebase from "react-native-firebase";
import {
  Input,
  Button,
  ListItem,
  Icon,
  Avatar,
  SideMenu,
  Badge,
  Overlay
} from "react-native-elements";

const defaultAvatar =
  "https://cdn.clutchprep.com/avatar_images/mNSN76C3QkGGfoD1HbVO_avatar_placeholder.png";

export default class Menu extends Component {
  defaultState = {
    currentUser: null,
    feedId: "",
    topFeeds: null,
    profile: null,
    userFeeds: null,
    accountMenuVisible: false,
    feedKeys: null,
    myWeddings: null,
    myWeddingList: null,
    errorMessage: null,
    flyout: new Animated.Value(200)
  };
  constructor(props) {
    super(props);
    const { currentUser } = firebase.auth();
    this.state = { ...this.defaultState, currentUser, smallScreen: false };
  }

  componentWillUnmount() {
    //this.setState({state: defaultState});
  }
  _onOrientationDidChange = orientation => {
    if (orientation === "LANDSCAPE") {
      // do something with landscape layout
    } else {
      // do something with portrait layout
    }
  };
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

    if (Dimensions.get('window').width <= 320 && Dimensions.get('window').height <= 500){
      this.setState({smallScreen: true})
    }
    SplashScreen.hide();
    Orientation.lockToPortrait();

    Orientation.addOrientationListener(this._onOrientationDidChange);

    let self = this;
    this.getUserFeeds();
    let newUser;
    if (this.props.navigation.getParam("newUser")) {
      newUser = this.props.navigation.getParam("newUser", null);
    }
    if (newUser) {
      setTimeout(function() {
        self.flyout();
      }, 1000);
    }

    //self.setState({currentUser:  firebase.auth().currentUser});
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
            onPress: () =>
            this.props.navigation.navigate("LoginPhone")
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
    const {
      currentUser,
      errorMessage,
      myWedding,
      profile,
      topFeeds,
      userFeeds
    } = this.state;
    let newUser;

    return (
                      <SafeAreaView style={{ flex: 1, position: "relative", backgroundColor: '#fff' }}>
        {currentUser && (
            <Overlay
              isVisible={this.state.accountMenuVisible}
              containerStyle={{ zIndex: 999}}
              overlayStyle={{
                zIndex: 999,
                height: '90%' ,
                flexDirection: "column",
                borderRadius: 4
              }}
              onBackdropPress={() =>
                this.setState({ accountMenuVisible: false })
              }
            >
              <View style={{ alignItems: "center" }}>
                {currentUser.displayName && (
                  <Text style={styles.userName}>{currentUser.displayName}</Text>
                )}

                <Avatar
                  size={150}
                  rounded
                  source={{ uri: currentUser.photoURL || defaultAvatar }}
                  activeOpacity={0.7}
                  onPress={() => {
                    Orientation.unlockAllOrientations();

                    this.props.navigation.navigate("UpdateAvatar", {
                      returnData: this.returnData.bind(this)
                    });
                  }}
                />
              </View>
              <View style={{ marginTop: 20 }}>
                <ListItem
                  containerStyle={styles.settingsItem}
                  title={
                    <View>
                      <Text style={styles.settingsActions}>Privacy Policy</Text>
                    </View>
                  }
                />
               {this.state.currentUser.isAnonymous && <ListItem
                  containerStyle={styles.settingsItem}
                  onPress={() => this.props.navigation.navigate("LoginPhone")}
                  title={
                    <View>
                      <Text style={styles.settingsActions}>
                        Create recovery account
                      </Text>
                    </View>
                  }
                />}
              </View>
              <TouchableOpacity
                onPress={this.logout}
                style={styles.logoutButton}
              >
                <Text style={styles.logoutButtonText}> Log Out </Text>
              </TouchableOpacity>
            </Overlay>
          )}
        <ScrollView style={styles.container}>
  
          <View style={styles.nav}>
            {currentUser && (
              <Avatar
                size={45}
                rounded
                activeOpacity={0.7}
                source={{ uri: currentUser.photoURL || defaultAvatar }}
                onPress={() => this.setState({ accountMenuVisible: true })}
              />
            )}
            <Text style={styles.customFont}>Wedcast</Text>

            <View style={styles.logo}>
              <Icon
                type="ionicon"
                name="ios-mail-outline"
                color="transparent"
                iconStyle={styles.navIcon}
                size={40}
              />

              {false && (
                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    right: -5,
                    backgroundColor: "red",
                    minWidth: 20,
                    height: 20,
                    display: "flex",
                    paddingHorizontal: 4,
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: 10
                  }}
                >
                  <Text
                    style={{ fontSize: 14, fontWeight: "bold", color: "#fff" }}
                  >
                    8
                  </Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.topWrapper}>
            {false && (
              <View style={{}}>
                <Text
                  style={{ fontSize: 16, fontWeight: "bold", marginLeft: 20 }}
                >
                  Trending Public Wedcasts
                </Text>

                <ScrollView
                  style={{
                    borderBottomWidth: 1,
                    borderColor: "#f4f4f4",
                    marginLeft: 10
                  }}
                  horizontal={true}
                >
                  {topFeeds &&
                    topFeeds.map((item, i) => (
                      <TouchableOpacity
                        key={item.feedId}
                        onPress={this.goToFeed.bind(this, item.feedId)}
                      >
                        <View
                          style={{
                            backgroundColor: "#fff",
                            padding: 5,
                            borderRadius: 10,
                            shadowOpacity: 0.75,
                            shadowRadius: 5,
                            shadowColor: "#c8c8c8",
                            shadowOffset: { height: 0, width: 0 },
                            margin: 10,
                            height: 120,
                            width: 120
                          }}
                        >
                          <View
                            style={{
                              flex: 2,
                              flexDirection: "column",
                              justifyContent: "center",
                              alignItems: "center"
                            }}
                          >
                            <Avatar
                              size="large"
                              rounded
                              source={{
                                uri:
                                  "https://fm.cnbc.com/applications/cnbc.com/resources/img/editorial/2018/05/16/105213031-GettyImages-950325748.1910x1000.jpg?v=1526506797"
                              }}
                              activeOpacity={0.7}
                            />
                          </View>
                          <View
                            style={{
                              flex: 1,
                              flexDirection: "column",
                              justifyContent: "center",
                              alignItems: "center"
                            }}
                          >
                            <Text style={{ backgroundColor: "white" }}>
                              {item.feedName}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                </ScrollView>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <FlatList
                style={styles.feedList}
                keyExtractor={this.keyExtractor}
                data={this.state.myWeddings}
                renderItem={this.renderItem}
                extraData={this.state}
              />
            </View>
            <View style={styles.feedForm}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  marginTop: 10,
                  marginLeft: 10,
                  fontFamily: "Quicksand"
                }}
              >
                Find Wedcast
              </Text>

              <View style={styles.buttonGroup}>
                <Input
                  placeholder="#CastID"
                  shake={true}
                  onChangeText={text => this.addHashTag(text)}
                  value={this.state.feedId}
                  autoCapitalize="none"
                  containerStyle={{
                    backgroundColor: "#f4f4f4",
                    margin: 0,
                    flex: 1,
                    alignSelf: "center",
                    borderRadius: 0,
                    borderTopLeftRadius: 5,
                    borderBottomLeftRadius: 5
                  }}
                  inputContainerStyle={{ borderBottomWidth: 0 }}
                  inputStyle={{
                    fontSize: 20,
                    height: 50,
                    fontFamily: "Quicksand"
                  }}
                />
                <Button
                  buttonStyle={{
                    backgroundColor: "#1F9FAC",
                    width: 50,
                    height: 50,
                    alignSelf: "center",
                    borderColor: "transparent",
                    borderWidth: 0,
                    marginVertical: 10,
                    borderRadius: 0,
                    borderTopRightRadius: 5,
                    borderBottomRightRadius: 5
                  }}
                  title="Go"
                  titleStyle={{
                    fontFamily: "Quicksand"
                  }}
                  disabledStyle={{ backgroundColor: "#9cdce2" }}
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
              <Text
                style={{
                  fontFamily: "Quicksand",
                  margin: 0,
                  fontSize: 12,
                  alignSelf: "center"
                }}
              >
                OR
              </Text>
              <View style={styles.createButton}>
                <Button
                  containerStyle={{
                    flex: 1,
                    backgroundColor: "#1F9FAC",
                    borderRadius: 5,

                    height: 40
                  }}
                  buttonStyle={{
                    backgroundColor: "transparent",
                    alignSelf: "center"
                  }}
                  titleStyle={{
                    fontFamily: "Quicksand"
                  }}
                  title="Create Wedcast"
                  onPress={this.goToCreateFeed.bind(this)}
                />
              </View>
            </View>
          </View>
          <FlatList
            contentContainerStyle={
              !this.state.userFeeds && styles.centerEmptySet
            }
            style={styles.feedList}
            keyExtractor={this.keyExtractor}
            data={this.state.userFeeds}
            renderItem={this.renderItem}
            extraData={this.state}
            ListEmptyComponent={
              <Text style={{ paddingVertical: 20, color: "#999999" }}>
                Currently not attending any weddings
              </Text>
            }
          />
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
  addHashTag = text => {
    text = text.replace(/\s/g, "");
    if (text.charAt(0) != "#") {
      text = "#" + text;
    }
    this.setState({ feedId: text });
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
        style={{ borderBottomWidth: 1, borderColor: "#e8e8e8" }}
        chevron
        leftAvatar={{
          avatarStyle: {
            width: 50,
            height: 50,
            backgroundColor: "#1F9FAC",
            borderRadius: 25
          },
          overlayContainerStyle: { backgroundColor: "transparent" },
          source: image
        }}
      />
    );
  };
  goToCreateFeed = () => {
    this.props.navigation.navigate("CreateFeed");
  };
}

const styles = StyleSheet.create({
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
    alignItems: "center",
    backgroundColor: "#fff",
    zIndex: 10,
    borderBottomWidth: 1,
    borderColor: "#f4f4f4"
  },
  logo: {
    position: "relative"
  },
  createButton: {
    display: "flex",
    padding: 10,
    flexDirection: "row"
  },
  navIcon: {},
  buttonGroup: {
    display: "flex",
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center"
  },
  settingsItem: {
    borderBottomWidth: 0.5,
    borderColor: "#999999"
  },
  detailItem: {
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
    fontSize: 24
  },
  topWrapper: {
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowColor: "#c8c8c8",
    shadowOffset: { height: 10, width: 0 },
    paddingBottom: 10,
    zIndex: 2,
    backgroundColor: "#fff",
    marginTop: 10
  },
  feedForm: {
    marginHorizontal: 10
  },
  feedList: {
    flex: 1
  },

  customFont: {
    fontSize: 24,
    fontFamily: "Quicksand"
  }
});
