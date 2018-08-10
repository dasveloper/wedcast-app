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
  PricingCard,
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

const thirdIndicatorStyles = {
  stepIndicatorSize: 25,
  currentStepIndicatorSize: 30,
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
  labelSize: 13,
  currentStepLabelColor: "#1F9FAC"
};

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
    isAnonymous: null
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
    let self = this;
    if (!this.phone.isValidNumber()){
      this.setState({errorMessage: "Invalid phone number"});
      return;
    }
    firebase
      .auth()
      .verifyPhoneNumber(self.state.phoneNumber)

      .on(
        "state_changed",
        phoneAuthSnapshot => {},
        error => {
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
          self.setState({
            confirmResult: phoneAuthSnapshot,
            phoneSubmitted: true,
            disableNext: true
          });
        }
      );
  };
  confirmVerification = () => {
    const { verificationCode, confirmResult } = this.state;
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
          self.createFeed();
        })
        .catch(function(error) {
          if (error.userInfo.error_name == "ERROR_INVALID_VERIFICATION_CODE") {
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
          } else if (
            error.userInfo.error_name == "ERROR_PROVIDER_ALREADY_LINKED"
          ) {
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
          } else if (
            error.userInfo.error_name == "ERROR_CREDENTIAL_ALREADY_IN_USE"
          ) {
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
                        self.props.navigation.navigate("LoginName");
                      })
                }
              ],
              { cancelable: true }
            );
          } else {
            alert(JSON.stringify(error.userInfo.error_name));
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

  addHashTag = text => {
    text = text.replace(/\s/g, "");
    text = text.replace(/[\W_]+/g, "");
    text = text.toLowerCase();
    if (text.charAt(0) != "#") {
      text = "#" + text;
    }
    let hasInput = text.length === 0;

    this.setState({ disableNext: hasInput, castId: text });
  };
  componentWillReceiveProps(nextProps, nextState) {
    if (nextState.currentPage != this.state.currentPage) {
      if (this.viewPager) {
        this.viewPager.setPage(nextState.currentPage);
      }
    }
  }

  componentDidMount() {
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
    const page1 = (
      <View style={styles.page}>
        <Text
          style={{
            paddingHorizontal: 20,
            fontSize: 18,
            marginBottom: 10,
            fontWeight: "bold"
          }}
        >
          Create a name for your Wedcast
        </Text>
        {!this.state.inputFocused && (
          <Text
            style={{
              paddingHorizontal: 20,
              fontSize: 14,
              textAlign: "center",
              marginBottom: 20
            }}
          >
            This will be the name displayed to your guests.
          </Text>
        )}

        <View style={styles.buttonGroup}>
          <Input
            placeholder="Enter a name"
            onChangeText={text => {
              let hasInput = text.length === 0;
              this.setState({ feedName: text, disableNext: hasInput });
            }}
            ref={component => (this.nameInput = component)}
            value={this.state.feedName}
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
            maxLength={25}
            onFocus={() => this.setState({ inputFocused: true })}
            onBlur={() => this.setState({ inputFocused: false })}
            inputContainerStyle={{ borderBottomWidth: 0 }}
            inputStyle={{ fontSize: 20, height: 50 }}
          />
        </View>
      </View>
    );
    const page2 = (
      <View style={styles.page}>
        <Text
          style={{
            paddingHorizontal: 20,
            fontSize: 18,
            marginBottom: 10,
            fontWeight: "bold"
          }}
        >
          Create a #CastId
        </Text>
        {!this.state.inputFocused && (
          <Text
            style={{
              paddingHorizontal: 20,
              textAlign: "center",
              fontSize: 14,
              marginBottom: 20
            }}
          >
            Your CastId will be used to find your wedding.
          </Text>
        )}

        <View style={styles.buttonGroup}>
          <Input
            placeholder="Enter a CastId"
            onChangeText={text => this.addHashTag(text)}
            ref={component => (this.castIdInput = component)}
            value={this.state.castId}
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
            maxLength={15}
            onFocus={() => this.setState({ inputFocused: true })}
            onBlur={() => this.setState({ inputFocused: false })}
            inputContainerStyle={{ borderBottomWidth: 0 }}
            inputStyle={{ fontSize: 20, height: 50 }}
          />
        </View>
        {!this.state.inputFocused && (
          <Text style={{ padding: 20, fontSize: 12, color: "#999999" }}>
            Example: #MrAndMrsJones, #LoveAtFirstSite, #TheSmiths,
            #RoyalWedding, etc.{" "}
          </Text>
        )}
      </View>
    );
    const passwordPage = (
      <View style={styles.page}>
        <Text
          style={{
            paddingHorizontal: 20,
            fontSize: 18,
            marginBottom: 10,
            fontWeight: "bold"
          }}
        >
          Create a password
        </Text>
        {!this.state.inputFocused && (
          <Text
            style={{
              paddingHorizontal: 20,
              textAlign: "center",
              fontSize: 14,
              marginBottom: 20
            }}
          >
            This password will secure your WedCast
          </Text>
        )}

        <View style={styles.buttonGroup}>
          <Input
            placeholder="Enter a Password"
            onChangeText={text => {
              let hasInput = text.length === 0;
              this.setState({ password: text, disableNext: hasInput });
            }}
            value={this.state.password}
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
            maxLength={15}
            onFocus={() => this.setState({ inputFocused: true })}
            onBlur={() => this.setState({ inputFocused: false })}
            inputContainerStyle={{ borderBottomWidth: 0 }}
            ref={component => (this.passwordInput = component)}
            inputStyle={{ fontSize: 20, height: 50 }}
          />
        </View>
      </View>
    );
    const page3 = (
      <View style={styles.page}>
        <Text
          style={{
            paddingHorizontal: 20,
            fontSize: 18,
            marginBottom: 10,
            fontWeight: "bold"
          }}
        >
          Add a WedCast photo
        </Text>
        {!this.state.inputFocused && (
          <Text
            style={{
              paddingHorizontal: 20,
              textAlign: "center",
              fontSize: 14,
              marginBottom: 20
            }}
          >
            Your guests will see this photo when searching for your wedding
          </Text>
        )}

        {this.state.avatarUri == null && (
          <Avatar
            size={this.state.smallScreen ? 150 : 250}
            rounded
            containerStyle={{ backgroundColor: "#87E5D3" }}
            imageProps={{ resizeMode: "cover" }}
            source={require("./assets/placeholder.png")}
            onPress={() => {
              Orientation.unlockAllOrientations();

              this.props.navigation.navigate("UpdateAvatar", {
                returnData: this.returnData.bind(this)
              });
            }}
            activeOpacity={0.7}
          />
        )}
        {this.state.avatarUri != null && (
          <Avatar
            size={this.state.smallScreen ? 150 : 250}
            rounded
            containerStyle={{ backgroundColor: "#87E5D3" }}
            imageProps={{ resizeMode: "cover" }}
            source={{ uri: this.state.avatarUri }}
            onPress={() => {
              Orientation.unlockAllOrientations();
              this.props.navigation.navigate("UpdateAvatar", {
                returnData: this.returnData.bind(this)
              });
            }}
            activeOpacity={0.7}
          />
        )}
      </View>
    );
    const phonePage = (
      <View style={{ flex: 1 }}>
        {!this.state.phoneSubmitted && (
          <View style={styles.page}>
            <Text
              style={{
                paddingHorizontal: 20,
                fontSize: 18,
                marginBottom: 10,
                fontWeight: "bold"
              }}
            >
              Create recovery account
            </Text>
            {!this.state.inputFocused && (
              <Text
                style={{
                  paddingHorizontal: 20,
                  textAlign: "center",
                  fontSize: 14,
                  marginBottom: 20
                }}
              >
                We'll use your phone number to create a recovery account in case
                you get logged out.
              </Text>
            )}
                       {this.state.errorMessage && (
                <Text style={{ color: "red", textAlign: 'center', marginVertical: 10 }}>{this.state.errorMessage}</Text>
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
            <Text
              style={{
                paddingHorizontal: 20,
                fontSize: 18,
                marginBottom: 10,
                fontWeight: "bold"
              }}
            >
              Verification sent
            </Text>
            {!this.state.inputFocused && (
              <Text
                style={{
                  paddingHorizontal: 20,
                  textAlign: "center",
                  fontSize: 14,
                  marginBottom: 20
                }}
              >
                Please enter the code you recieved to verify your phone number.
              </Text>
            )}

            <View style={styles.buttonGroup}>
              <Input
                placeholder="Verification code"
                value={this.state.verificationCode}
                onChangeText={text => {
                  let hasInput = text.length === 0;
                  this.setState({
                    verificationCode: text,
                    disableNext: hasInput
                  });
                }}
                maxLength={20}
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
                ref={component => (this.verificationInput = component)}
                onFocus={() => this.setState({ inputFocused: true })}
                onBlur={() => this.setState({ inputFocused: false })}
                inputContainerStyle={{ borderBottomWidth: 0 }}
                inputStyle={{ fontSize: 20, height: 50 }}
              />
            </View>
          </View>
        )}
      </View>
    );

    const page4 = (
      <View style={styles.page}>
        <TouchableOpacity
          style={styles.pricingCard}
          onPress={() => this.setState({ castType: 0 })}
        >
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "#1F9FAC" }}>
            Small Wedding
          </Text>
          <Text style={{ fontSize: 20, fontWeight: "bold", marginTop: 5 }}>
            FREE
          </Text>
          <Text style={{ fontSize: 14, color: "#999999", marginTop: 10 }}>
            Up to 50 guests
          </Text>
          <Text style={{ fontSize: 14, color: "#999999", marginTop: 5 }}>
            Photos stored for 1 year
          </Text>

          <CheckBox
            center
            checkedIcon="circle"
            uncheckedIcon="circle-o"
            checkedColor={"#1F9FAC"}
            checked={this.state.castType === 0}
            onPress={() => this.setState({ castType: 0 })}
            containerStyle={{ padding: 0, marginTop: 10 }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.pricingCard}
          onPress={() => this.setState({ castType: 1 })}
        >
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "#1F9FAC" }}>
            Large Wedding
          </Text>
          <Text style={{ fontSize: 20, fontWeight: "bold", marginTop: 5 }}>
            $19
          </Text>
          <Text style={{ fontSize: 14, color: "#999999", marginTop: 10 }}>
            Unlimited guests
          </Text>
          <Text style={{ fontSize: 14, color: "#999999", marginTop: 5 }}>
            Photos stored forever
          </Text>

          <CheckBox
            center
            checkedIcon="circle"
            uncheckedIcon="circle-o"
            checkedColor={"#1F9FAC"}
            checked={this.state.castType === 1}
            containerStyle={{ padding: 0, marginTop: 10 }}
            onPress={() => this.setState({ castType: 1 })}
          />
        </TouchableOpacity>
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
          <View style={styles.stepIndicator}>
            <Button
              style={styles.cancel}
              onPress={() => this.props.navigation.navigate("Menu")}
              clear={true}
              titleStyle={{
                color: "#999999",
                paddingHorizontal: 0,
                fontSize: 14
              }}
              title="Cancel"
            />
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
            alert(`Sorry, #${castId} is taken. Please try a different #CastID`);
          } else {
            self.viewPager.setPage([self.state.currentPage + 1]);

            self.setState({
              currentPage: (self.state.currentPage += 1)
            });
          }
        })
        .catch(function(error) {
          var errorCode = error.code;
          var errorMessage = error.message;
          alert(JSON.stringify(error));
          alert(`Sorry, #${castId} is taken. Please try a different #CastID`);
        });
    } else if (this.state.currentPage == 2) {
      //Keyboard.dismiss();
      //this.passwordInput.blur();
      this.viewPager.setPage([this.state.currentPage + 1]);
      this.setState({
        currentPage: (this.state.currentPage += 1)
      });
    } else {
      this.viewPager.setPage([this.state.currentPage + 1]);
      this.setState({
        currentPage: (this.state.currentPage += 1)
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
      feeds: {}
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
  pricingCard: {
    paddingVertical: 15,
    paddingHorizontal: 35,

    borderRadius: 8,
    borderColor: "#dedede",
    borderWidth: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10
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
  }
});
