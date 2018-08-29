/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */
import Orientation from "react-native-orientation-locker";

import React, { Component } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  SectionList,
  SafeAreaView,
  ScrollView
} from "react-native";
import firebase from "react-native-firebase";
import { Input, Button, ListItem, Icon, Avatar } from "react-native-elements";

export default class FeedUsers extends Component {
  defaultState = {
    currentUser: null,
    offlineUsers: null,
    onlineUsers: null,
    topFeeds: null,
    profile: null
  };
  constructor(props) {
    super(props);

    const { currentUser } = firebase.auth();
    this.state = {
      ...this.defaultState,
      currentUser: currentUser
    };
  }
  goToCamera = () => {
    Orientation.unlockAllOrientations();
    this.props.navigation.goBack();
  };

  componentDidMount() {
    firebase.analytics().setCurrentScreen("notifications");
    let self = this;
  }

  render() {
    return (
      <SafeAreaView style={{ backgroundColor: "#f4f4f4", flex: 1 }}>
        <View style={styles.container}>
          <View style={styles.backButton}>
            <Icon
              type="ionicon"
              name="ios-arrow-back"
              color="#fff"
              size={30}
              onPress={() => this.props.navigation.goBack()}
              containerStyle={styles.backIcon}
            />
            <Text style={styles.feedHeader}>Notifications</Text>
          </View>
          <View
            style={{
              padding: 10,
              paddingTop: 15,
              backgroundColor: "#fff",
              flex: 1,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20
            }}
          >
            <FlatList
              contentContainerStyle={styles.feedList}
              keyExtractor={this.keyExtractor}
              data={[]}
              renderItem={this.renderItem}
              extraData={this.state}
              ListEmptyComponent={
                <Text style={{ paddingVertical: 26, color: "#999999" }}>
                  No unread notifications
                </Text>
              }
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }
  keyExtractor = (item, index) => index;

  goToCreateFeed = () => {
    this.props.navigation.navigate("CreateFeed");
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1F9FAC"
  },
  feedHeader: {
    fontSize: 22,
    fontFamily: "Quicksand",
    color: "#fff",
    textAlign: "left",
    fontWeight: "800"
  },
  nav: {
    backgroundColor: "#E8A892",
    paddingVertical: 5,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowOpacity: 0.95,
    shadowRadius: 6,
    shadowColor: "#c8c8c8",
    shadowOffset: { height: 5, width: 0 },
    zIndex: 10
  },
  logo: {
    fontSize: 20,
    color: "#fff"
  },
  createButton: {
    display: "flex",
    padding: 10,
    flexDirection: "row"
  },

  topWrapper: {
    shadowOpacity: 0.75,
    shadowRadius: 6,
    shadowColor: "#c8c8c8",
    shadowOffset: { height: 5, width: 0 },
    paddingBottom: 10,
    zIndex: 2,
    backgroundColor: "#fff"
  },
  feedForm: {
    marginHorizontal: 10
  },
  feedList: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center"
  },
  bottomMenuWrapper: {
    paddingHorizontal: 5,
    display: "flex",
    alignItems: "center",

    backgroundColor: "#fff",
    zIndex: 99,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  navIcon: {
    marginHorizontal: 10
  },
  centerEmptySet: { justifyContent: "center", alignItems: "center" },
  backButton: {
    justifyContent: "center",
    alignSelf: "center",
    paddingVertical: 10,
    flexDirection: "row",
    flexWrap: "nowrap",
    position: "relative",
    width: "100%"
  },
  backIcon: {
    position: "absolute",
    left: 10,
    top: 10
  },
});
