/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from "react";
import SplashScreen from "react-native-splash-screen";

import { Button, Text } from "react-native-elements";
import {
  TouchableOpacity,
  Platform,
  Keyboard,
  Image,
  AppRegistry,
  StyleSheet,
  View,
  KeyboardAvoidingView
} from "react-native";
import { IndicatorViewPager, PagerDotIndicator } from "rn-viewpager";

export default class Walkthrough extends Component {
  state = {
    feedName: null,
    castId: null,
    password: null,
    guests: null,
    avatarUri: null,
    verificationCode: null,
    phoneNumber: null,
    confirmResult: null,
    imageTaken: null,
    phoneSubmitted: false,
    windowWidth: null,
    windowHeight: null,
    disableNext: true,
    castType: 0
  };

  constructor() {
    super();

    this.state = {
      currentPage: 0,
      currentUser: null,
      password: null,
      feedName: null,
      castType: 0,
      disableNext: true
    };
  }
  componentDidMount() {
    SplashScreen.hide();
  }
  render() {
    const page1 = (
      <View style={{ flex: 1 }}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Image
            source={require("./assets/walkthrough-phone.png")}
            style={{
              width: "80%",
              resizeMode: "contain",
              backgroundColor: "transparent"
            }}
          />
        </View>
        <Text
          style={{
            fontFamily: "Quicksand",
            padding: 30,
            fontSize: 18,
            textAlign: "center",
            marginBottom: 30
          }}
        >
          Let your your guests become the photographers, straight from their
          smart phones.
        </Text>
      </View>
    );
    const photoPage = (
      <View style={{ flex: 1 }}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Image
            source={require("./assets/walkthrough-photos.png")}
            style={{
              width: "80%",
              resizeMode: "contain",
              backgroundColor: "transparent"
            }}
          />
        </View>
        <Text
          style={{
            fontFamily: "Quicksand",
            padding: 30,
            fontSize: 18,
            textAlign: "center",
            marginBottom: 30
          }}
        >
          Download photos straight to your phone.
        </Text>
      </View>
    );
    const page3 = (
      <View style={{ flex: 1 }}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Image
            source={require("./assets/walkthrough-projector.png")}
            style={{
              width: "80%",
              resizeMode: "contain",
              backgroundColor: "transparent"
            }}
          />
        </View>
        <Text
          style={{
            fontFamily: "Quicksand",
            padding: 30,
            fontSize: 18,
            textAlign: "center",
            marginBottom: 30
          }}
        >
          Live stream your photos straight to a projector via your CastUrl
        </Text>
      </View>
    );
    const page2 = (
      <View style={{ flex: 1 }}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Image
            source={require("./assets/walkthrough-laptop.png")}
            style={{
              width: "80%",
              resizeMode: "contain",
              backgroundColor: "transparent"
            }}
          />
        </View>
        <Text
          style={{
            fontFamily: "Quicksand",
            padding: 30,
            fontSize: 18,
            textAlign: "center",
            marginBottom: 30
          }}
        >
          Distant guests can't make it? They can watch live from the comfort of
          their home.
        </Text>
      </View>
    );
    let pages = [page1, photoPage, page2, page3];

    return (
      <View style={styles.container}>
        <IndicatorViewPager
          style={{ flex: 1 }}
          indicator={this._renderDotIndicator()}
        >
          {pages.map(page => this.renderViewPagerPage(page))}
        </IndicatorViewPager>

        <View style={styles.pagerNavigation}>
          <Button
            containerStyle={styles.skipButton}
            clear={true}
            onPress={() => this.props.navigation.navigate("LoginName")}
            titleStyle={styles.skipTitle}
            title="Skip"
          />
        </View>
      </View>
    );
  }

  renderViewPagerPage = data => {
    return <View>{data}</View>;
  };
  goToNextPage = () => {
    this.viewPager.setPage([this.state.currentPage + 1]);
    this.setState({
      currentPage: (this.state.currentPage += 1)
    });
  };
  goToPreviousPage = () => {
    if (this.state.currentPage != 0) {
      this.viewPager.setPage([this.state.currentPage - 1]);
      this.setState({
        disableNext: false,
        currentPage: (this.state.currentPage -= 1)
      });
    }
  };

  _renderDotIndicator() {
    return (
      <PagerDotIndicator
        selectedDotStyle={{
          backgroundColor: "#1F9FAC",
          height: 15,
          width: 15,
          borderRadius: 15
        }}
        pageCount={3}
        dotStyle={{
          backgroundColor: "#87E5D3",
          height: 15,
          width: 15,
          borderRadius: 15
        }}
        pageCount={4}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#B5FCF1"
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
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%"
  },
  pagerNavigation: {
    display: "flex",
    alignSelf: "flex-end",
    bottom: 0,
    left: 0,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20
  },
  buttonGroup: {
    display: "flex",
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center"
  },
  skipButton: {
    paddingHorizontal: 10,
    borderRadius: 4
  },
  skipTitle: {
    color: "#1F9FAC",
    fontSize: 22,
    fontFamily: "Quicksand",

  }
});
