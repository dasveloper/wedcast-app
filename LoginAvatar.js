import Orientation from "react-native-orientation-locker";
import Spinner from "react-native-loading-spinner-overlay";
import EStyleSheet from "react-native-extended-stylesheet";

import React from "react";
import {
  StyleSheet,
  View,
  ImageBackground,
  Dimensions,
  SafeAreaView
} from "react-native";
import firebase from "react-native-firebase";
import { Input, Button, Text, Icon, Avatar } from "react-native-elements";

export default class LoginAvatar extends React.Component {
  state = {
    userName: "",
    avatarUri: null,
    currentUser: null,
    smallScreen: false,
    showProfileOverlay: false
  };

  updateAvatar = () => {
    firebase.analytics().setCurrentScreen("loginavatar");
    var self = this;
    var user = firebase.auth().currentUser;

    if (user != null) {
      user
        .updateProfile({ photoURL: self.state.avatarUri })
        .then(function(user) {
          self.props.navigation.navigate("Menu");
          //return user.updateProfile({'displayName': this.state.name, "photoUrl": this.state.avatarUri});
        })
        .catch(function(error) {});
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
  handleLogin = () => {
    let self = this;
    if (this.state.currentUser != null) {
      this.state.currentUser
        .updateProfile({
          displayName: self.state.userName,
          photoURL: self.state.avatarUri
        })
        .then(function() {
          //return user.updateProfile({'displayName': this.state.name, "photoUrl": this.state.avatarUri});
          self.props.navigation.navigate("Menu", {
            currentUser: firebase.auth().currentUser
          });
        })
        .catch(function(error) {});
    } else {
      this.setState({ showProfileOverlay: true });
      firebase.analytics().logEvent("avatar_set");

      firebase
        .auth()
        .signInAnonymouslyAndRetrieveData()
        .catch(function(error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          // ...
        })
        .then(function() {
          var user = firebase.auth().currentUser;

          if (user != null) {
            user
              .updateProfile({
                displayName: self.state.userName,
                photoURL: self.state.avatarUri
              })
              .then(function() {
                //return user.updateProfile({'displayName': this.state.name, "photoUrl": this.state.avatarUri});
                user = firebase.auth().currentUser;

                firebase
                  .database()
                  .ref(`users/${user.uid}/profile`)
                  .set(user, function(error) {
                    // Callback comes here
                    if (error) {
                      //alert(error);
                    } else {
                      let userObj = {
                        userName: user.displayName,
                        avatar: user.photoUrl,
                        password: "wedcast"
                      };
                      firebase
                        .database()
                        .ref(
                          `feeds/feedNew/examplewedcast/members/${
                            firebase.auth().currentUser.uid
                          }`
                        )
                        .set(userObj, function(error) {
                          if (error)
                            self.setState({
                              errorMessage: "Incorrect password"
                            });
                          else {
                            const exampleWedcast = {
                              castId: "examplewedcast",
                              castType: 0,
                              feedId: "f9mro3",
                              feedName: "Example Wedcast",
                              owner: "zuk3xKCbnPhax3kUk5yWiMJyDHu2",
                              startedAt: 1535386373761
                            };

                            firebase
                              .database()
                              .ref(`users/${user.uid}/feedList/examplewedcast`)
                              .set(exampleWedcast, function(error) {});
                          }
                        });

                      self.props.navigation.navigate("Menu", {
                        currentUser: user,
                        newUser: true
                      });
                    }
                    self.setState({ showProfileOverlay: false });
                  });
              })
              .catch(function(error) {});
          }
          //return user.updateProfile({'displayName': this.state.name, "photoUrl": this.state.avatarUri});
        })
        .catch(function(error) {
          console.log(error);
        });
    }
  };
  returnData(avatarUri) {
    this.setState({ avatarUri: avatarUri });
  }

  componentDidMount = () => {
    const { currentUser } = firebase.auth();
    if (Dimensions.get("window").width <= 320) {
      this.setState({ smallScreen: true });
    }
    var userName;
    if (this.props.navigation.getParam("userName")) {
      userName = this.props.navigation.getParam("userName", null);
    }
    this.setState({ userName: userName });
  };

  render() {
    const { inputFocused } = this.state;

    return (
      <ImageBackground
        resizeMode={"cover"} // or cover
        style={styles.backgroundStyle} // must be passed from the parent, the number may vary depending upon your screen size
        imageStyle={{ opacity: this.state.inputFocused ? 0.4 : 1 }}
        source={
          this.state.avatarUri
            ? require("./assets/photo-blank-bg.jpg")
            : require("./assets/photo-bg.jpg")
        }
      >
        <SafeAreaView style={styles.container}>
          <Spinner
            visible={this.state.showProfileOverlay}
            textContent="Creating account..."
            textStyle={{ color: "#FFF" }}
          />
          <View style={{ flex: 1 }}>
            <View
              style={[
                {
                  backgroundColor: this.state.inputFocused
                    ? "rgba(255, 255, 255, 1)"
                    : "rgba(255, 255, 255, .3)"
                },
                styles.buttonGroup
              ]}
            >
              <View style={styles.backButton}>
                <Icon
                  type="ionicon"
                  name="ios-arrow-back"
                  color="#000"
                  size={30}
                  onPress={() => this.props.navigation.goBack()}
                  containerStyle={styles.backIcon}
                  iconStyle={styles.navIcon}
                />

                <Text style={styles.loginHeader}>Add a profile picture</Text>
              </View>
              <Text style={styles.loginSubHeader}>
                This image will be displayed when you host or attend an event
              </Text>
            </View>
          </View>

          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            {this.state.avatarUri && (
              <Avatar
                size={this.state.smallScreen ? 200 : 300}
                rounded
                source={{ uri: this.state.avatarUri }}
                activeOpacity={0.7}
                onPress={() => {
                  Orientation.unlockAllOrientations();

                  this.props.navigation.navigate("UpdateAvatar", {
                    returnData: this.returnData.bind(this),
                    storagePath: `users`
                  });
                }}
              />
            )}
          </View>
          <View style={styles.inputWrapper}>
            <Button
              buttonStyle={styles.addPictureButton}
              titleStyle={styles.addPicture}
               
              title="Add a profile picture"
              onPress={() => {
                Orientation.unlockAllOrientations();

                this.props.navigation.navigate("UpdateAvatar", {
                  returnData: this.returnData.bind(this),
                  storagePath: `users`
                });
              }}
            />
          </View>
          <View style={styles.loginButtonWrapper}>
            <Button
              buttonStyle={styles.loginButton}
              titleStyle={styles.loginButtonTitle}
              disabledStyle={styles.loginButtonDisabled}
              disabled={!this.state.avatarUri}
              title="Done"
              onPress={this.handleLogin}
            />
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }
}
const styles = EStyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column"
  },
  addPicture:{
    
      fontSize: "24rem",
      fontFamily: "Quicksand"
    
  },
  addPictureButton:{
    backgroundColor: "#1F9FAC",
    borderRadius: 5,
    height: "50rem",
    margin: "20rem"
  },
  kb: {
    flex: 1
  },
  backgroundStyle: {
    flex: 1,
    flexDirection: "column",

    backgroundColor: "#B5FCF1"
  },
  //Upper text header
  backButton: {
    justifyContent: "center",
    alignSelf: "center",
    marginLeft: 15,
    padding: 0,
    flexDirection: "row",
    flexWrap: "nowrap",
    position: "relative",
    width: "100%",
  },
  backIcon: {
    position: "absolute",
    left: 10,
    padding: "5rem"
  },
  loginHeader: {
    fontSize: "24rem",
    color: "#000",
    fontFamily: "Quicksand",
    textAlign: "center",
    paddingVertical: "5rem"
  },
  loginSubHeader: {
    fontFamily: "Quicksand",
    color: "#000",
    marginHorizontal: "10rem",
    fontSize: "18rem",
    textAlign: "center"
  },
  //Bottom input wrapper
  inputWrapper: {
    flex: 1,
    justifyContent: "flex-end",
    flexDirection: "column"
  },
  //Login Button
  loginButtonWrapper: {
    backgroundColor: "#A1C146"
  },
  loginButton: {
    backgroundColor: "#6E8E13",
    padding: "5rem",
    borderRadius: 0
  },
  loginButtonTitle: {
    fontSize: "26rem",
    fontFamily: "Quicksand"
  },
  loginButtonDisabled: {
    backgroundColor: "#A1C146"
  },
  buttonGroup: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    alignSelf: "center",
    paddingVertical: "10rem"
  }
});
