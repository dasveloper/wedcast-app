import Orientation from "react-native-orientation-locker";

import React from "react";
import {
  StyleSheet,
  View,
  ImageBackground,
  Image,
  KeyboardAvoidingView,
  Dimensions,
  SafeAreaView
} from "react-native";
import firebase from "react-native-firebase";
import {
  Input,
  Button,
  Text,
  ListItem,
  Icon,
  Avatar
} from "react-native-elements";

export default class LoginAvatar extends React.Component {
  state = {
    userName: "",
    avatarUri: null,
    errorMessage: null,
    currentUser: null,
    smallScreen: false
  };

  updateAvatar = () => {
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
      firebase
        .auth()
        .signInAnonymouslyAndRetrieveData()
        .catch(function(error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          // ...
        })
        .then(function(user) {
          var user = firebase.auth().currentUser;

          if (user != null) {
            user
              .updateProfile({
                displayName: self.state.userName,
                photoURL: self.state.avatarUri
              })
              .then(function() {
                //return user.updateProfile({'displayName': this.state.name, "photoUrl": this.state.avatarUri});
                self.props.navigation.navigate("Menu", {
                  currentUser: firebase.auth().currentUser,
                  newUser: true
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
  saveLoginDetails = () => {
    let newUser = {
      profile: { name: this.state.userName, avatar: this.state.avatarUri }
    };
    let self = this;

    firebase
      .database()
      .ref("users")
      .push(newUser, function(error) {
        if (error) console.log("Error has occured during saving process");
      });
  };
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
    const { inputFocused, name } = this.state;

    return (
      <KeyboardAvoidingView style={styles.kb} behavior="padding" enabled>
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
                  size={this.state.smallScreen ? 150 : 300}
                  rounded
                  source={{ uri: this.state.avatarUri }}
                  activeOpacity={0.7}
                  onPress={() => {
                    Orientation.unlockAllOrientations();

                    this.props.navigation.navigate("UpdateAvatar", {
                      returnData: this.returnData.bind(this)
                    });
                  }}
                />
              )}
            </View>
            <View style={styles.inputWrapper}>
              <Button
                buttonStyle={{
                  backgroundColor: "#1F9FAC",
                  borderRadius: 5,
                  height: 60,
                  margin: 20
                }}
                titleStyle={{
                  fontSize: 24,
                  fontFamily: "Quicksand"
                }}
                title="Add a profile picture"
                onPress={() => {
                  Orientation.unlockAllOrientations();

                  this.props.navigation.navigate("UpdateAvatar", {
                    returnData: this.returnData.bind(this)
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
      </KeyboardAvoidingView>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column"
  },
  kb: {
    flex: 1
  },
  backgroundStyle: {
    flex: 1,
    flexDirection: "column",

    backgroundColor: "#B5FCF1"
  },
  errorMessage: {
    color: "red"
  },
  //Upper text header
  backButton: {
    justifyContent: "center",
    alignSelf: "center",
    marginLeft: 15,
    padding: 0,
    flexDirection: "row",
    flexWrap: 'nowrap',
    position: 'relative',
    width: '100%',
    paddingBottom: 5
  },
  backIcon:{
    position: 'absolute',
    left: 10

  },
  loginHeader: {
    fontSize: 24,
    color: "#000",
    fontFamily: "Quicksand",
    textAlign: "center"
  },
  loginSubHeader: {
    fontFamily: "Quicksand",
    marginTop: 5,
    color: "#000",
    marginHorizontal: 10,
    fontSize: 18,
    textAlign: "center"
  },
  returnUser: {
    marginTop: 10,
    textAlign: "center"
  },
  returnUserText: {
    color: "blue",
    fontSize: 14,
    fontFamily: "Quicksand"
  },
  //Bottom input wrapper
  inputWrapper: {
    flex: 1,
    justifyContent: "flex-end",
    flexDirection: "column"
  },
  //Login Input
  loginInput: {
    borderRadius: 5,
    padding: 10,
    alignSelf: "center",
    marginBottom: 20,
    borderBottomWidth: 0,
    width: "90%",
    fontSize: 24,
    height: 60
  },
  //Login Button
  loginButtonWrapper: {
    backgroundColor: "#A1C146"
  },
  loginButton: {
    backgroundColor: "#6E8E13",
    padding: 10,
    borderRadius: 0
  },
  loginButtonTitle: {
    fontSize: 30,
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
    paddingVertical: 15
  },
  textInput: {
    height: 40,
    width: "90%",
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 20
  }
});
