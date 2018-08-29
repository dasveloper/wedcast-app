import React from "react";
import PhoneInput from "react-native-phone-input";

import {
  StyleSheet,
  View,
  ImageBackground,
  KeyboardAvoidingView,
  ViewPropTypes,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
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

export default class LoginName extends React.Component {
  defaultState = {
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
  constructor(props) {
    super(props);

    const { currentUser } = firebase.auth();
    this.state = {
      ...this.defaultState,
      currentUser: currentUser
    };
  }
  linkPhone = () => {
    let self = this;
    if (!this.phone.isValidNumber()) {
      this.setState({ errorMessage: "Invalid phone number" });
      return;
    }

    firebase
      .auth()
      .verifyPhoneNumber(self.state.phoneNumber)
      .on(
        "state_changed",
        phoneAuthSnapshot => {
          // How you handle these state events is entirely up to your ui flow and whether
          // you need to support both ios and android. In short: not all of them need to
          // be handled - it's entirely up to you, your ui and supported platforms.

          // E.g you could handle android specific events only here, and let the rest fall back
          // to the optionalErrorCb or optionalCompleteCb functions
          switch (phoneAuthSnapshot.state) {
            // ------------------------
            //  IOS AND ANDROID EVENTS
            // ------------------------
            case firebase.auth.PhoneAuthState.CODE_SENT: // or 'sent'
              // on ios this is the final phone auth state event you'd receive
              // so you'd then ask for user input of the code and build a credential from it
              // as demonstrated in the `signInWithPhoneNumber` example above
              break;
            case firebase.auth.PhoneAuthState.ERROR: // or 'error'
              // alert('verification error');
              // alert(phoneAuthSnapshot.error);
              break;

            // ---------------------
            // ANDROID ONLY EVENTS
            // ---------------------
            case firebase.auth.PhoneAuthState.AUTO_VERIFY_TIMEOUT: // or 'timeout'
              console.log("auto verify on android timed out");
              // alert('no auto, show verification');

              // proceed with your manual code input flow, same as you would do in
              // CODE_SENT if you were on IOS
              break;
            case firebase.auth.PhoneAuthState.AUTO_VERIFIED: // or 'verified'
              // auto verified means the code has also been automatically confirmed as correct/received
              // phoneAuthSnapshot.code will contain the auto verified sms code - no need to ask the user for input.
              //  alert('auto verified on android');
              console.log(phoneAuthSnapshot);
              // Example usage if handling here and not in optionalCompleteCb:
              // const { verificationId, code } = phoneAuthSnapshot;
              // const credential = firebase.auth.PhoneAuthProvider.credential(verificationId, code);

              // Do something with your new credential, e.g.:
              // firebase.auth().signInWithCredential(credential);
              // firebase.auth().currentUser.linkWithCredential(credential);
              // etc ...
              break;
          }
        },
        error => {
          // optionalErrorCb would be same logic as the ERROR case above,  if you've already handed
          // the ERROR case in the above observer then there's no need to handle it here
          Alert.alert(
            "Something went wrong",
            error.nativeErrorMessage,
            [
              {
                text: "OK"
              }
            ],
            { cancelable: false }
          );
        },
        phoneAuthSnapshot => {
          // optionalCompleteCb would be same logic as the AUTO_VERIFIED/CODE_SENT switch cases above
          // depending on the platform. If you've already handled those cases in the observer then
          // there's absolutely no need to handle it here.

          // Platform specific logic:
          // - if this is on IOS then phoneAuthSnapshot.code will always be null
          // - if ANDROID auto verified the sms code then phoneAuthSnapshot.code will contain the verified sms code
          //   and there'd be no need to ask for user input of the code - proceed to credential creating logic
          // - if ANDROID auto verify timed out then phoneAuthSnapshot.code would be null, just like ios, you'd
          //   continue with user input logic.

          self.setState({
            confirmResult: phoneAuthSnapshot,
            phoneSubmitted: true
          });
          console.log(phoneAuthSnapshot);
        }
      );
  };
  confirmLinkAccount = () => {
    const { verificationCode, confirmResult } = this.state;
    const { verificationId, code } = confirmResult;
    let self = this;
    firebase.analytics().logEvent("link_phone_account");

    if (confirmResult && verificationCode.length) {
      const credential = firebase.auth.PhoneAuthProvider.credential(
        verificationId,
        verificationCode
      );
      firebase
        .auth()
        .currentUser.linkWithCredential(credential)
        .then(user => {
          Alert.alert(
            "Success!",
            `Your account has been successfully linked to ${
              self.state.phoneNumber
            }`,
            [
              {
                text: "OK",
                onPress: () => self.props.navigation.navigate("Menu")
              }
            ],
            { cancelable: false }
          );
        })
        .catch(function(error) {
          if (error.code == "provider-already-linked") {
            Alert.alert(
              `Your account is already linked to a different phone number`,
              `You cannot link your account to more than one phone number`,
              [
                {
                  text: "Ok"
                }
              ],
              { cancelable: true }
            );
          } else if (error.code == "auth/credential-already-in-use") {
            Alert.alert(
              `An account is already linked to ${self.state.phoneNumber}`,
              `Please try a different number or sign in to your linked account`,
              [
                {
                  text: "Try again"
                },
                {
                  text: "Sign in",
                  onPress: () =>
                    firebase
                      .auth()
                      .signOut()
                      .then(function() {
                        self.setState({ ...self.defaultState });
                      })
                }
              ],
              { cancelable: true }
            );
          } else {

              Alert.alert(
                "Incorrect validation code",
                "Please try again",
                [
                  {
                    text: "OK"
                  }
                ],
                { cancelable: true }
              );
            
            // alert(JSON.stringify(error.userInfo.error_name));
          }
          // alert("Incorrect validation code, please try again.");
          // User couldn't sign in (bad verification code?)
          // ...
        });

      //  confirmResult.confirm(verificationCode)
      //  .then((user) => {
      //    this.createFeed()
      //  })
      // .catch(error => alert("incorrect"));
      //}
    }
  };
  goToVerification = () => {
    firebase.analytics().logEvent("verification_sent");

    self = this;
    if (!this.phone.isValidNumber()) {
      this.setState({ errorMessage: "Invalid phone number" });
      return;
    }

    firebase
      .auth()
      .signInWithPhoneNumber(this.state.phoneNumber)
      .then(confirmResult => {
        this.setState({
          confirmResult: confirmResult,
          phoneSubmitted: true,
          inputFocused: false
        });
        this.secondTextInput.focus();
      })
      .catch(error => function() {});
  };
  confirmVerification = () => {
    firebase.analytics().logEvent("confirm_verification");

    let self = this;
    const { verificationCode, confirmResult } = this.state;

    if (confirmResult && verificationCode.length) {
      confirmResult.confirm(verificationCode).then(user => {
        if (user.displayName != null) {
          self.props.navigation.navigate("Menu", {
            currentUser: user,
            newUser: false
          });
        } else {
          self.props.navigation.navigate("LoginName", { currentUser: user });
        }
      });
      //.catch(error => alert(JSON.stringify(error)));
    }
  };
  handleLogin = () => {
    let self = this;
    firebase
      .auth()
      .signInAnonymously()
      .catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
      })
      .then(function(user) {
        firebase.analytics().logEvent("success_login_with_phone");

        self.props.navigation.navigate("LoginAvatar");
      })
      .catch(function(error) {});
  };

  returnData(avatarUri) {
    this.setState({ avatarUri: avatarUri });
  }
  saveLoginDetails = () => {
    let newUser = { profile: { name: this.state.name } };
    let self = this;

    firebase
      .database()
      .ref("users")
      .push(newUser, function(error) {
        self.props.navigation.navigate("LoginAvatar");

        if (error) console.log("Error has occured during saving process");
      });
  };

  componentDidMount = () => {
    firebase.analytics().setCurrentScreen("loginphone");
    var user = firebase.auth().currentUser;

    if (user != null) {
    }
  };

  static propTypes = {
    focus: ViewPropTypes.bool
  };

  static defaultProps = {
    focus: false
  };

  // Methods:
  focus() {
    this._component.focus();
  }

  componentWillReceiveProps(nextProps) {
    const { focus } = nextProps;

    focus && this.focus();
  }
  render() {
    const {
      inputFocused,
      phoneSubmitted,
      helpText,
      phoneNumber,
      verificationCode,
      currentUser
    } = this.state;
    return (
      <View style={{ flex: 1 }}>
        <KeyboardAvoidingView style={styles.kb} behavior="padding" enabled>
          <SafeAreaView style={styles.container}>
            <View style={{ flex: 1 }}>
              {!phoneSubmitted && (
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
                    <Text
                      style={{
                        fontSize: 24,
                        color: "#000",
                        textAlign: "center"
                      }}
                    >
                      {!currentUser ? "Welcome back!" : "Link your account"}
                    </Text>
                  </View>
                  <Text
                    style={{
                      marginTop: 5,
                      color: "#000",
                      marginHorizontal: 10,
                      fontSize: 18,
                      textAlign: "center"
                    }}
                  >
                    {!currentUser
                      ? "Please login with your recovery phone number"
                      : "We'll link your account to your phone number so you can log in again later."}
                  </Text>
                </View>
              )}
              {phoneSubmitted && (
                <View
                  style={[
                    {
                      paddingTop: 20,
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
                      size={40}
                      onPress={() => this.setState({ phoneSubmitted: false })}
                      containerStyle={styles.backIcon}
                      iconStyle={styles.navIcon}
                    />
                    <Text
                      style={{
                        fontSize: 24,
                        color: "#000",
                        textAlign: "center"
                      }}
                    >
                      We sent you a text
                    </Text>
                  </View>

                  <Text
                    style={{
                      marginTop: 5,
                      color: "#000",
                      marginHorizontal: 10,
                      fontSize: 18,
                      textAlign: "center"
                    }}
                  >
                    Enter the verification number you recieved
                  </Text>
                  <TouchableOpacity
                    onPress={() => this.setState({ phoneSubmitted: false })}
                  >
                    <Text
                      style={{ fontSize: 14, color: "blue", marginTop: 15 }}
                    >
                      Didn't recieve a text?
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View
              style={{
                flex: 1,
                justifyContent: "flex-end",
                flexDirection: "column"
              }}
            >
              {this.state.errorMessage && (
                <Text
                  style={{
                    color: "red",
                    textAlign: "center",
                    marginVertical: 10
                  }}
                >
                  {this.state.errorMessage}
                </Text>
              )}

              {!phoneSubmitted && (
                <PhoneInput
                  ref={ref => {
                    this.phone = ref;
                  }}
                  style={{
                    backgroundColor: inputFocused
                      ? "rgba(255, 255, 255, 1)"
                      : "rgba(255, 255, 255, 0.3)",
                    marginBottom: 20,
                    paddingHorizontal: 10,
                    alignSelf: "center",

                    borderBottomWidth: 0,
                    width: "90%"
                  }}
                  textStyle={{
                    fontSize: 24,
                    height: 60,

                    fontSize: 24,
                    fontFamily: "Quicksand"
                  }}
                  onFocus={() => this.setState({ inputFocused: true })}
                  onBlur={() => this.setState({ inputFocused: false })}
                  blurOnSubmit={false}
                  value={phoneNumber}
                  autoFocus={true}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  textContentType="telephoneNumber"
                  onChangePhoneNumber={phoneNumber =>
                    this.setState({ errorMessage: null, phoneNumber })
                  }
                />

                // <TextInputMask
                //     maxLength={15}
                //     type={"custom"}
                //     options={{
                //       mask: "+9 999-999-9999"
                //     }}
                //     placeholderTextColor="#605D5D"
                //     onFocus={() => this.setState({ inputFocused: true })}
                //     onBlur={() => this.setState({ inputFocused: false })}
                //     blurOnSubmit={false}
                //     value={phoneNumber}
                //     autoFocus={true}
                //     onChangeText={phoneNumber => this.setState({ phoneNumber })}
                //     style={{
                //       backgroundColor: inputFocused
                //         ? "rgba(255, 255, 255, 1)"
                //         : "rgba(255, 255, 255, 0.3)",
                //       borderRadius: 5,
                //       padding: 10,
                //       alignSelf: "center",
                //       marginBottom: 20,
                //       borderBottomWidth: 0,
                //       width: "90%",
                //       fontSize: 24,
                //       height: 60
                //     }}
                //     keyboardType="phone-pad"
                //     autoCapitalize="none"
                //     textContentType="telephoneNumber"
                //     placeholder="Enter your phone number"
                //     withDDD={false}
                //   />
              )}
              {phoneSubmitted && (
                <TextInput
                  ref={input => {
                    this.secondTextInput = input;
                  }}
                  keyboardType="numeric"
                  onChangeText={verificationCode =>
                    this.setState({ verificationCode })
                  }
                  placeholderTextColor="#605D5D"
                  autoCapitalize="none"
                  placeholder="Verification code"
                  onFocus={() => this.setState({ inputFocused: true })}
                  value={verificationCode}
                  style={{
                    backgroundColor: inputFocused
                      ? "rgba(255, 255, 255, 1)"
                      : "rgba(255, 255, 255, 0.3)",
                    borderRadius: 5,
                    padding: 10,
                    alignSelf: "center",
                    marginBottom: 20,
                    borderBottomWidth: 0,
                    width: "90%",
                    fontSize: 24,
                    height: 60
                  }}
                />
              )}
            </View>
            <View style={styles.loginButtonWrapper}>
              {!phoneSubmitted && (
                <Button
                  style={styles.loginButton}
                  buttonStyle={{
                    backgroundColor: "#A1C146",
                    padding: 10,
                    borderRadius: 0
                  }}
                  titleStyle={{
                    fontSize: 30
                  }}
                  disabledStyle={{
                    backgroundColor: "#C1D870"
                  }}
                  disabled={phoneNumber == ""}
                  title="Done"
                  onPress={
                    !currentUser ? this.goToVerification : this.linkPhone
                  }
                />
              )}

              {phoneSubmitted && (
                <Button
                  style={styles.loginButton}
                  buttonStyle={{
                    backgroundColor: "#A1C146",
                    padding: 10,
                    borderRadius: 0
                  }}
                  titleStyle={{
                    fontSize: 30
                  }}
                  disabledStyle={{
                    backgroundColor: "#C1D870"
                  }}
                  disabled={verificationCode == ""}
                  title="Done"
                  onPress={
                    !currentUser
                      ? this.confirmVerification
                      : this.confirmLinkAccount
                  }
                />
              )}
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  kb: {
    flex: 1
  },
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#87e5d3"
  },
  loginButtonWrapper: {
    backgroundColor: "#A1C146"
  },
  loginButton: {
    borderRadius: 0
  },
  buttonGroup: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    paddingVertical: 15,
    width: "100%"
  },
  textInput: {
    height: 40,
    width: "90%",
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 20
  },
  backButton: {
    justifyContent: "center",
    alignSelf: "center",
    marginLeft: 15,
    padding: 0,
    flexDirection: "row",
    flexWrap: "nowrap",
    position: "relative",
    width: "100%",
    paddingBottom: 5
  },
  backIcon: {
    position: "absolute",
    left: 10
  }
});
