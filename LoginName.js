import React from "react";
//import SplashScreen from "react-native-splash-screen";

import {
  StyleSheet,
  View,
  ImageBackground,
  KeyboardAvoidingView,
  TouchableOpacity,
  TextInput,
  SafeAreaView
} from "react-native";
import firebase from "react-native-firebase";
import {
  Input,
  Button,
  Text,
} from "react-native-elements";

export default class LoginName extends React.Component {
  state = {
    name: "",
    nameSubmitted: false,
    helpText: "",
    confirmResult: null,
    avatarUri: null,
    phoneNumber: "",
    phoneSubmitted: false,
    verificationCode: "",
    errorMessage: null,
    inputFocused: false,
    currentUser: null
  };
  goToAvatar = () => {
    let userName = this.state.name;
    this.props.navigation.navigate("LoginAvatar", {
      userName: userName,
      currentUser: this.state.currentUser
    });
  };
  componentDidMount() {
    const { currentUser } = firebase.auth();
  }
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

  render() {
    const { inputFocused, name } = this.state;

    return (
      <KeyboardAvoidingView style={styles.kb} behavior="padding" enabled>
        <ImageBackground
          resizeMode={"cover"} // or cover
          style={styles.backgroundStyle} // must be passed from the parent, the number may vary depending upon your screen size
          imageStyle={{ opacity: this.state.inputFocused ? 0.4 : 1 }}
          source={require("./assets/guestbook-bg.jpg")}
        >
          <SafeAreaView style={styles.container}>
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
              <Text style={styles.loginHeader}>
                {this.state.currentUser != null
                  ? "Almost there"
                  : "Lets get started!"}
              </Text>
              <Text style={styles.loginSubHeader}>
                {this.state.currentUser != null
                  ? "We just need to get a few more details"
                  : "Your name will be displayed when you host or join an event"}
              </Text>
              {this.state.currentUser == null && (
                <TouchableOpacity
                  style={styles.returnUser}
                  onPress={() => this.props.navigation.navigate("LoginPhone")}
                >
                  <Text style={styles.returnUserText}>Already a user?</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.inputWrapper}>
              {this.state.errorMessage && (
                <Text style={styles.errorMessage}>
                  {this.state.errorMessage}
                </Text>
              )}
              <TextInput
                placeholderTextColor="#605D5D"
                autoCapitalize="none"
                placeholder="Enter your name"
                onFocus={() => this.setState({ inputFocused: true })}
                onBlur={() => this.setState({ inputFocused: false })}
                blurOnSubmit={false}
                value={name}
                onChangeText={name => this.setState({ name })}
                style={[
                  {
                    fontFamily: "Quicksand",
                    backgroundColor: this.state.inputFocused
                      ? "rgba(255, 255, 255, 1)"
                      : "rgba(255, 255, 255, 0.3)"
                  },
                  styles.loginInput
                ]}
              />
            </View>
            <View style={styles.loginButtonWrapper}>
              <Button
                buttonStyle={styles.loginButton}
                titleStyle={styles.loginButtonTitle}
                disabledStyle={styles.loginButtonDisabled}
                disabled={name == ""}
                title="Done"
                onPress={this.goToAvatar}
              />
            </View>
          </SafeAreaView>
        </ImageBackground>
      </KeyboardAvoidingView>
    );
  }
}
const styles = StyleSheet.create({
  kb: {
    flex: 1
  },
  container: {
    flex: 1,
    flexDirection: "column"
  },
  backgroundStyle: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#B5FCF1"
  },
  errorMessage: {
    color: "red"
  },
  loginHeader: {
    fontSize: 24,
    color: "#000",
    fontFamily: "Quicksand",
    textAlign: "center",
    paddingBottom: 5
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
    marginTop: 10
  },
  returnUserText: {
    color: "#1D57AF",
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
});
