import React, { Component } from "react";
import SplashScreen from "react-native-splash-screen";
import firebase from "react-native-firebase";
import EStyleSheet from "react-native-extended-stylesheet";

import { Button, Text } from "react-native-elements";
import { Image, StyleSheet, View, BackHandler } from "react-native";
import { IndicatorViewPager, PagerDotIndicator } from "rn-viewpager";

export default class Walkthrough extends Component {
  constructor() {
    super();

    this.state = {
      currentPage: 0
    };
  }

  componentDidMount() {
    firebase.analytics().setCurrentScreen("walkthrough");
    SplashScreen.hide();
  }
  render() {
    const phonePage = (
      <View style={{ flex: 1 }}>
        <View style={styles.walkthoughPage}>
          <Image
            resizeMethod="resize"
            source={require("./assets/walkthrough-phone.jpg")}
            style={styles.walkthoughImage}
          />
        </View>
        <Text style={styles.walkthroughText}>
          Let your your guests become the photographers, straight from their
          smart phones.
        </Text>
      </View>
    );

    const photoPage = (
      <View style={{ flex: 1 }}>
        <View style={styles.walkthoughPage}>
          <Image
            resizeMethod="resize"
            source={require("./assets/walkthrough-photos.jpg")}
            style={styles.walkthoughImage}
          />
        </View>
        <Text style={styles.walkthroughText}>
          Download photos straight to your phone.
        </Text>
      </View>
    );
    const projectorPage = (
      <View style={{ flex: 1 }}>
        <View style={styles.walkthoughPage}>
          <Image
            resizeMethod="resize"
            source={require("./assets/walkthrough-projector.jpg")}
            style={styles.walkthoughImage}
          />
        </View>
        <Text style={styles.walkthroughText}>
          Live stream your photos straight to a projector via your CastUrl
        </Text>
      </View>
    );
    const laptopPage = (
      <View style={{ flex: 1 }}>
        <View style={styles.walkthoughPage}>
          <Image
            resizeMethod="resize"
            source={require("./assets/walkthrough-laptop.jpg")}
            style={styles.walkthoughImage}
          />
        </View>
        <Text style={styles.walkthroughText}>
          Distant guests can't make it? They can watch live from the comfort of
          their home.
        </Text>
      </View>
    );
    let pages = [phonePage, photoPage, laptopPage, projectorPage];

    return (
      <View style={styles.container}>
        <IndicatorViewPager
          style={{ flex: 1 }}
          indicator={this._renderDotIndicator()}
        >
          {pages.map((page, index) => this.renderViewPagerPage(page, index))}
        </IndicatorViewPager>

        <View style={styles.pagerNavigation}>
          <Button
            containerStyle={styles.skipButton}
            clear={true}
            onPress={() => this.props.navigation.navigate("LoginName")}
            titleStyle={styles.skipTitle}
            title="Get started!"
          />
        </View>
      </View>
    );
  }

  renderViewPagerPage = (page, index) => {
    return <View key={index}>{page}</View>;
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

const styles = EStyleSheet.create({
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
    marginBottom: "20rem"
  },
  buttonGroup: {
    display: "flex",
    paddingHorizontal: "20rem",
    flexDirection: "row",
    alignItems: "center"
  },

  skipTitle: {
    color: "#1F9FAC",
    fontSize: "22rem",
    fontFamily: "Quicksand"
  },
  walkthroughText: {
    fontFamily: "Quicksand",
    padding: "26rem",
    fontSize: "20rem",
    textAlign: "center",
    marginBottom:"30rem"
  },
  walkthoughImage: {
    width: "80%",
    resizeMode: "contain",
    backgroundColor: "transparent"
  },
  walkthoughPage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});
