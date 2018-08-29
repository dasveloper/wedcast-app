/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from "react";
import Orientation from "react-native-orientation-locker";
import PhoneInput from "react-native-phone-input";

import firebase from "react-native-firebase";
import {
  Input,
  Button,
  Text,
  ListItem,
  Icon,
  Avatar,
  CheckBox
} from "react-native-elements";

import uuid from "uuid";
import {
  TouchableOpacity,
  Platform,
  Keyboard,
  AppRegistry,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Alert,
  Dimensions,
  SafeAreaView
} from "react-native";
import { ViewPager } from "rn-viewpager";

import StepIndicator from "react-native-step-indicator";

const getStepIndicatorIconConfig = ({ position, stepStatus }) => {
  const iconConfig = {
    name: "feed",
    color: stepStatus === "finished" ? "#ffffff" : "#1F9FAC",
    size: 15
  };
};

export default class App extends Component {
  state = {
    feedName: null,
    castId: null,
    password: null,
    guests: null,
    avatarUri: null,
    verificationCode: null,
    phoneNumber: null,
    errorMessage: null,
    confirmResult: null,
    imageTaken: null,
    phoneSubmitted: false,
    windowWidth: null,
    windowHeight: null,
    disableNext: true,
    castType: 0,
    inputFocused: false,
    isAnonymous: null,
    CastKey: 1
  };

  constructor() {
    super();

    this.state = {
      currentPage: 0,
      currentUser: null,
      castId: "",
      verificationCode: "",
      phoneNumber: "",
      password: "",
      feedName: "",
      castType: 0,
      disableNext: true,
      smallScreen: false
    };
  }

  linkPhone = () => {
    firebase.analytics().logEvent(`create_link_phone`);

    let self = this;
    if (!this.phone.isValidNumber()) {
      this.setState({ errorMessage: "Invalid phone number" });
      firebase.analytics().logEvent(`invalid_phone`);

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
              self.setState({
                phoneSubmitted: true,
                disableNext: true,
                confirmResult: phoneAuthSnapshot
              });

              // on ios this is the final phone auth state event you'd receive
              // so you'd then ask for user input of the code and build a credential from it
              // as demonstrated in the `signInWithPhoneNumber` example above
              break;
            case firebase.auth.PhoneAuthState.ERROR: // or 'error'
             
              
              self.setState({
                phoneSubmitted: false
              });
            // ---------------------
            // ANDROID ONLY EVENTS
            // ---------------------
            case firebase.auth.PhoneAuthState.AUTO_VERIFY_TIMEOUT: // or 'timeout'
              //console.log('auto verify on android timed out');
              //alert('no auto, show verification');

              // proceed with your manual code input flow, same as you would do in
              // CODE_SENT if you were on IOS
              break;
            case firebase.auth.PhoneAuthState.AUTO_VERIFIED: // or 'verified'
              // auto verified means the code has also been automatically confirmed as correct/received
              // phoneAuthSnapshot.code will contain the auto verified sms code - no need to ask the user for input.
              self.setState({
                confirmResult: phoneAuthSnapshot,
                verificationCode: phoneAuthSnapshot.code
              });
              self.confirmVerification();
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
          firebase.analytics().logEvent(`phone_success`);

          console.log(phoneAuthSnapshot);
        }
      );
  };
  confirmVerification = () => {
    let { verificationCode, confirmResult } = this.state;
    const { verificationId, code } = confirmResult;

    let self = this;
    if (confirmResult && verificationCode.length) {
      const credential = firebase.auth.PhoneAuthProvider.credential(
        verificationId,
        verificationCode
      );
      firebase
        .auth()
        .currentUser.linkAndRetrieveDataWithCredential(credential)
        .then(user => {
          firebase.analytics().logEvent(`create_verification_success`);

          self.createFeed();
        })
        .catch(function(error) {


          if (error.code == "auth/provider-already-linked") {
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
            firebase.analytics().logEvent(`create_number_already_in_use`);

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
        });

      //  confirmResult.confirm(verificationCode)
      //  .then((user) => {
      //    this.createFeed()
      //  })
      // .catch(error => alert("incorrect"));
      //}
    }
  };
  sanitizePassword = text => {
    let sanitizedText = text.replace(/[ .#$\\\/\[\]]+/g, "");
    let hasInput = text.length === 0;

    if (sanitizedText !== text) {
      console.log("forcing update");
    
      this.setState({ password: sanitizedText + " " }); // this character is not alphanumerical 'x', it's a forbidden character '✕' (cross)
      setTimeout(() => {
        this.setState(previousState => {
          return { ...previousState, password: sanitizedText };
        });
      }, 0);
    } else {
      this.setState({ password: sanitizedText });
    }

    this.setState({ disableNext: hasInput });
  };
  sanitizeVerification = text => {
    let sanitizedText = text.replace(/[ .#$\\\/\[\]]+/g, "");
    let hasInput = text.length === 0;

    if (sanitizedText !== text) {
      console.log("forcing update");
    
      this.setState({ verificationCode: sanitizedText + " " }); // this character is not alphanumerical 'x', it's a forbidden character '✕' (cross)
      setTimeout(() => {
        this.setState(previousState => {
          return { ...previousState, verificationCode: sanitizedText };
        });
      }, 0);
    } else {
      this.setState({ verificationCode: sanitizedText });
    }

    this.setState({ disableNext: hasInput });
  };
  sanitizeFeedName = text => {
    let sanitizedText = text.replace(/[.#$\\\/\[\]]+/g, "");
    let hasInput = text.length === 0;

    if (sanitizedText !== text) {
      console.log("forcing update");
    
      this.setState({ feedName: sanitizedText + " " }); // this character is not alphanumerical 'x', it's a forbidden character '✕' (cross)
      setTimeout(() => {
        this.setState(previousState => {
          return { ...previousState, feedName: sanitizedText };
        });
      }, 0);
    } else {
      this.setState({ feedName: sanitizedText });
    }

    this.setState({ disableNext: hasInput });
  };
  addHashTag = castId => {
    let sanitizedCastId = castId.replace(/[ .#$\\\/\[\]]+/g, "").toLowerCase();
    let hasInput = castId.length === 0;
   // if (sanitizedCastId.length && sanitizedCastId.charAt(0) != "#") {
     // sanitizedCastId = "#" + sanitizedCastId;
    //}
    if (sanitizedCastId !== castId) {
      console.log("forcing update");
      this.setState({ castId: sanitizedCastId + " " }); // this character is not alphanumerical 'x', it's a forbidden character '✕' (cross)
      setTimeout(() => {
        this.setState(previousState => {
          return { ...previousState, castId: sanitizedCastId };
        });
      }, 0);
    } else {
      this.setState({ castId: sanitizedCastId });
    }

    this.setState({ disableNext: hasInput });
  };

  componentDidMount() {
    firebase.analytics().setCurrentScreen("createwedcast");
    const { currentUser } = firebase.auth();
    if (
      Dimensions.get("window").width <= 320 &&
      Dimensions.get("window").height <= 500
    ) {
      this.setState({ smallScreen: true });
    }
    this.setState({
      currentUser: currentUser,
      isAnonymous: currentUser.isAnonymous
    });
  }

  render() {
    let thirdIndicatorStyles = {
      stepIndicatorSize: this.state.smallScreen ? 20 : 25,
      currentStepIndicatorSize: this.state.smallScreen ? 25 : 30,
      separatorStrokeWidth: 2,
      currentStepStrokeWidth: 3,
      stepStrokeCurrentColor: "#1F9FAC",
      stepStrokeWidth: 3,
      stepStrokeFinishedColor: "#1F9FAC",
      stepStrokeUnFinishedColor: "#dedede",
      separatorFinishedColor: "#1F9FAC",
      separatorUnFinishedColor: "#dedede",
      stepIndicatorFinishedColor: "#1F9FAC",
      stepIndicatorUnFinishedColor: "#ffffff",
      stepIndicatorCurrentColor: "#ffffff",
      stepIndicatorLabelFontSize: 0,
      currentStepIndicatorLabelFontSize: 0,
      stepIndicatorLabelCurrentColor: "transparent",
      stepIndicatorLabelFinishedColor: "transparent",
      stepIndicatorLabelUnFinishedColor: "transparent",
      labelColor: "#999999",
      labelSize: this.state.smallScreen ? 10 : 14,
      currentStepLabelColor: "#1F9FAC"
    };
    const page1 = (
      <View style={styles.page}>
        <Text style={styles.paginationHeader}>
          Create a name for your Wedcast
        </Text>
        {!this.state.inputFocused && (
          <Text style={styles.pagintationInfo}>
            This will be the name displayed to your guests.
          </Text>
        )}

        <View style={styles.buttonGroup}>
          <Input
            placeholder="Enter a name"
            onChangeText={this.sanitizeFeedName}

            value={this.state.feedName}
            containerStyle={styles.pagintationInputContainer}
            maxLength={40}
            onFocus={() => this.setState({ inputFocused: true })}
            onBlur={() => this.setState({ inputFocused: false })}
            inputContainerStyle={{ borderBottomWidth: 0 }}
            inputStyle={styles.pagintationInput}
          />
        </View>
      </View>
    );
    const page2 = (
      <View style={styles.page}>
        <Text style={styles.paginationHeader}>Create a #CastId</Text>
        {!this.state.inputFocused && (
          <Text style={styles.pagintationInfo}>
            Your CastId will be used to find your wedding.
          </Text>
        )}

        <View style={styles.buttonGroup}>
          <Input
            placeholder="Enter a CastId"
            onChangeText={this.addHashTag}
            ref={component => (this.castIdInput = component)}
            value={this.state.castId.length ? '#' +this.state.castId: ''}
            autoCapitalize="none"
            containerStyle={styles.pagintationInputContainer}
            maxLength={25}
            onFocus={() => this.setState({ inputFocused: true })}
            onBlur={() => this.setState({ inputFocused: false })}
            inputContainerStyle={{ borderBottomWidth: 0 }}
            inputStyle={styles.pagintationInput}
          />
        </View>
        {!this.state.inputFocused && (
          <Text style={{ padding: 20, fontSize: 12, color: "#999999" }}>
            Example: #MrAndMrsJones, #LoveAtFirstSite, #TheSmiths,
            #RoyalWedding, etc.
          </Text>
        )}
      </View>
    );
    const passwordPage = (
      <View style={styles.page}>
        <Text style={styles.paginationHeader}>Create a password</Text>
        {!this.state.inputFocused && (
          <Text style={styles.pagintationInfo}>
            This password will secure your WedCast
          </Text>
        )}

        <View style={styles.buttonGroup}>
          <Input
            placeholder="Enter a Password"
   
            onChangeText={this.sanitizePassword}

            value={this.state.password}
            autoCapitalize="none"
            containerStyle={styles.pagintationInputContainer}
            maxLength={15}
            onFocus={() => this.setState({ inputFocused: true })}
            onBlur={() => this.setState({ inputFocused: false })}
            inputContainerStyle={{ borderBottomWidth: 0 }}
            ref={component => (this.passwordInput = component)}
            inputStyle={styles.pagintationInput}
          />
        </View>
      </View>
    );
    const page3 = (
      <View style={styles.page}>
        <Text style={styles.paginationHeader}>Add a WedCast photo</Text>
        {!this.state.inputFocused && (
          <Text style={styles.pagintationInfo}>
            Your guests will see this photo when searching for your wedding
          </Text>
        )}
        <Avatar
          size={this.state.smallScreen ? 150 : 250}
          rounded
          containerStyle={{ backgroundColor: "#87E5D3" }}
          imageProps={{ resizeMode: "cover" }}
          source={
            this.state.avatarUri == null
              ? require("./assets/placeholder.png")
              : { uri: this.state.avatarUri }
          }
          onPress={() => {
            Orientation.unlockAllOrientations();
            this.props.navigation.navigate("UpdateAvatar", {
              returnData: this.returnData.bind(this),
              storagePath: `${this.state.castId}/weddingAvatar`

            });
          }}
          activeOpacity={0.7}
        />
      </View>
    );
    const phonePage = (
      <View style={{ flex: 1 }}>
        {!this.state.phoneSubmitted && (
          <View style={styles.page}>
            <Text style={styles.paginationHeader}>Create recovery account</Text>
            {!this.state.inputFocused && (
              <Text style={styles.pagintationInfo}>
                We'll use your phone number to create a recovery account in case
                you get logged out.
              </Text>
            )}
            {this.state.errorMessage && (
              <Text style={styles.errorMessage}>{this.state.errorMessage}</Text>
            )}
            <View style={styles.buttonGroup}>
              <PhoneInput
                ref={ref => {
                  this.phone = ref;
                }}
                style={{
                  backgroundColor: "#f4f4f4",
                  margin: 0,
                  flex: 1,
                  alignSelf: "center",
                  borderRadius: 0,
                  borderTopLeftRadius: 5,
                  borderBottomLeftRadius: 5,
                  fontSize: 20,
                  height: 50,
                  padding: 10
                }}
                onFocus={() => this.setState({ inputFocused: true })}
                onBlur={() => this.setState({ inputFocused: false })}
                blurOnSubmit={false}
                value={this.state.phoneNumber}
                autoFocus={true}
                keyboardType="phone-pad"
                autoCapitalize="none"
                textContentType="telephoneNumber"
                onChangePhoneNumber={phoneNumber => {
                  let hasInput = phoneNumber.length === 0;
                  this.setState({
                    phoneNumber: phoneNumber,
                    errorMessage: null,
                    disableNext: hasInput
                  });
                }}
              />
            </View>
          </View>
        )}
        {this.state.phoneSubmitted && (
          <View style={styles.page}>
            <Text style={styles.paginationHeader}>Verification sent</Text>
            {!this.state.inputFocused && (
              <Text style={styles.pagintationInfo}>
                Please enter the code you recieved to verify your phone number.
              </Text>
            )}

            <View style={styles.buttonGroup}>
              <Input
                placeholder="Verification code"
                value={this.state.verificationCode}
                onChangeText={this.sanitizeVerification}
                maxLength={20}
                autoCapitalize="none"
                containerStyle={styles.pagintationInputContainer}
                ref={component => (this.verificationInput = component)}
                onFocus={() => this.setState({ inputFocused: true })}
                onBlur={() => this.setState({ inputFocused: false })}
                inputContainerStyle={{ borderBottomWidth: 0 }}
                inputStyle={styles.pagintationInput}
              />
            </View>
          </View>
        )}
      </View>
    );

    let pages = [page1, page2, passwordPage, page3, phonePage];
    let self = this;
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior="padding"
          enabled
        >
                    <TouchableOpacity
              style={styles.cancel}
              onPress={() => this.props.navigation.navigate("Menu")}
              clear={true}
           >
              <Text style={{
                color: "#999999",
                paddingHorizontal: 0,
                fontSize: 14
              }}>Cancel</Text>
            </TouchableOpacity>
          <View style={styles.stepIndicator}>

            {(!this.state.inputFocused || !this.state.smallScreen) && (
              <StepIndicator
                stepCount={this.state.isAnonymous ? 5 : 4}
                customStyles={thirdIndicatorStyles}
                currentPosition={this.state.currentPage}
                labels={
                  this.state.isAnonymous
                    ? ["Name", "CastID", "Password", "Photo", "Account"]
                    : ["Name", "CastID", "Password", "Photo"]
                }
              />
            )}
          </View>
          <ViewPager
            style={{ flexGrow: 1 }}
            horizontalScroll={false}
            scrollEnabled={false}
            ref={viewPager => {
              this.viewPager = viewPager;
            }}
            onPageSelected={page => {
              this.setState({ currentPage: page.position });
            }}
          >
            {pages.map((page, i) => this.renderViewPagerPage(page, i))}
          </ViewPager>
          <View
            style={[
              styles.pagerNavigation,
              {
                justifyContent:
                  this.state.currentPage != 0 ? "space-between" : "flex-end"
              }
            ]}
          >
            {this.state.currentPage != 0 && (
              <Button
                onPress={this.goToPreviousPage}
                clear={true}
                titleStyle={{ color: "#484848" }}
                title="Previous"
              />
            )}
            {this.state.currentPage == 3 && (
              <Button
                onPress={
                  this.state.isAnonymous ? this.goToNextPage : this.createFeed
                }
                clear={true}
                disabledTitleStyle={{ color: "#1F9FAC" }}
                titleStyle={{ color: "#1F9FAC" }}
                title={
                  this.state.isAnonymous
                    ? this.state.avatarUri
                      ? "Next"
                      : "Skip"
                    : "Finish"
                }
              />
            )}
            {this.state.currentPage == 4 && (
              <Button
                onPress={
                  this.state.phoneSubmitted
                    ? this.confirmVerification
                    : this.linkPhone
                }
                clear={true}
                disabled={this.state.disableNext}
                disabledTitleStyle={{ color: "#999999" }}
                titleStyle={{ color: "#1F9FAC" }}
                //onPress={this.createFeed.bind(this)}
                title={
                  this.state.phoneSubmitted ? "Finish" : "Send verification"
                }
              />
            )}
            {this.state.currentPage != 4 &&
              this.state.currentPage != 3 && (
                <Button
                  onPress={this.goToNextPage}
                  clear={true}
                  disabled={this.state.disableNext}
                  disabledTitleStyle={{ color: "#999999" }}
                  titleStyle={{ color: "#1F9FAC" }}
                  //onPress={this.createFeed.bind(this)}
                  title="Next"
                />
              )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }
  returnData(avatarUri) {
    this.setState({ avatarUri: avatarUri });
  }
  renderViewPagerPage = (data, index) => {
    return <View key={index}>{data}</View>;
  };
  goToNextPage = () => {
    let self = this;

    firebase.analytics().logEvent(`next_page`);

    Keyboard.dismiss();
    switch (self.state.currentPage) {
      case 0:
        self.setState({
          disableNext: !self.state.castId.length > 0
        });
        break;
      case 1:
        self.setState({
          disableNext: !self.state.password.length > 0
        });
        break;
      case 2:
        break;
      case 3:
        if (!this.state.phoneSubmitted) {
          self.setState({
            disableNext: !self.state.phoneNumber.length > 0
          });
        } else {
          self.setState({
            disableNext: !self.state.verificationCode.length > 0
          });
        }
        break;
      case 4:
        break;
    }
    if (this.state.currentPage == 1) {
      let castId = this.state.castId.replace("#", "");
      firebase
        .database()
        .ref(`feeds/feedNew/${castId}/chatInfo`)
        .once("value", function(snapshotRef) {
          if (snapshotRef && snapshotRef.val()) {
            firebase.analytics().logEvent(`castID_taken`);

            alert(`Sorry, #${castId} is taken. Please try a different #CastID`);
          } else {
            let nextPage = self.state.currentPage + 1;
            self.viewPager.setPage(nextPage);

            self.setState({
              currentPage: nextPage
            });
          }
        })
        .catch(function(error) {
          var errorCode = error.code;
          var errorMessage = error.message;
          alert(JSON.stringify(error));
         // alert(`Sorry, #${castId} is taken. Please try a different #CastID`);
        });
    } else if (this.state.currentPage == 2) {
      //Keyboard.dismiss();
      //this.passwordInput.blur();
      let nextPage = self.state.currentPage + 1;

      this.viewPager.setPage(nextPage);
      this.setState({
        currentPage: nextPage
      });
    } else {
      let nextPage = self.state.currentPage + 1;

      this.viewPager.setPage(nextPage);
      this.setState({
        currentPage: nextPage
      });
    }
  };
  goToPreviousPage = () => {
    if (this.state.currentPage == 4) {
      if (this.state.phoneSubmitted) {
        this.setState({
          phoneSubmitted: false
        });
      } else {
        this.viewPager.setPage([this.state.currentPage - 1]);
        this.setState({
          disableNext: false,
          currentPage: (this.state.currentPage -= 1)
        });
      }
    } else if (this.state.currentPage != 0) {
      this.viewPager.setPage([this.state.currentPage - 1]);
      this.setState({
        disableNext: false,
        currentPage: (this.state.currentPage -= 1)
      });
    }
  };
  renderStepIndicator = params => (
    <Icon {...getStepIndicatorIconConfig(params)} />
  );
  generateUID = () => {
    // I generate the UID from two parts here
    // to ensure the random number provide enough bits.
    var firstPart = (Math.random() * 46656) | 0;
    var secondPart = (Math.random() * 46656) | 0;
    firstPart = ("000" + firstPart.toString(36)).slice(-3);
    secondPart = ("000" + secondPart.toString(36)).slice(-3);

    return firstPart + secondPart;
  };

  createFeed = () => {
    firebase.analytics().logEvent(`create_feed`);

    const newFeedId = this.generateUID();
    let castId = this.state.castId.replace("#", "");
    let password = this.state.password;
    let newFeed = {
      feedId: newFeedId,
      owner: this.state.currentUser.uid,
      feedName: this.state.feedName,
      castType: this.state.castType,
      castId: castId,
      avatarUri: this.state.avatarUri,
      feeds: {},
      startedAt: firebase.database.ServerValue.TIMESTAMP
    };

    //const feed = firebase.database().ref("feeds/feeds").push(newFeed);

    //firebase.database().ref(`feeds/feedList/${feed.key}`).set(newFeed);

    var key = castId;
    //let obj = {"owner" :this.state.currentUser.uid, roomName: "foobar"};
    // firebase.database().ref(`feeds/feedNew/chatInfo`).set(obj);

    firebase
      .database()
      .ref(`feeds/feedNew`)
      .child(key)
      .child("chatInfo")
      .set(newFeed);
    firebase
      .database()
      .ref(`feeds/feedNew`)
      .child(key)
      .child("password")
      .set(password);

    let user = firebase.auth().currentUser.displayName;
    let userObj = { userName: user, password: password };
    firebase
      .database()
      .ref(`feeds/feedNew/${castId}/members/${firebase.auth().currentUser.uid}`)
      .set(userObj, function(error) {});
    firebase
      .database()
      .ref(`users/${firebase.auth().currentUser.uid}/myWedding`)
      .push(newFeed);

    this.props.navigation.navigate("WeddingDetails", {
      castId: castId,
      feedName: newFeed.feedName
    });
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  cancel: {
    padding: 10,
    marginBottom: 5,
    flex: 0,
    alignSelf: "flex-start"
  },
  stepIndicator: {
    width: "100%",
    top: 0,
    left: 0
  },
  page: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    display: "flex",
    flexDirection: "column",
    width: "100%"
  },
  pagerNavigation: {
    display: "flex",
    alignSelf: "flex-end",
    bottom: 0,
    left: 0,
    width: "100%",
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#f4f4f4"
  },
  buttonGroup: {
    display: "flex",
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center"
  },

  paginationHeader: {
    paddingHorizontal: 20,
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "bold"
  },
  pagintationInputContainer: {
    backgroundColor: "#f4f4f4",
    margin: 0,
    flex: 1,
    alignSelf: "center",
    borderRadius: 0,
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5
  },
  pagintationInput: { fontSize: 20, height: 50 },
  pagintationInfo: {
    paddingHorizontal: 20,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20
  },
  errorMessage: {
    color: "red",
    textAlign: "center",
    marginVertical: 10
  }
});
