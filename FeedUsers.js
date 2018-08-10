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
  ScrollView,
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
    this.props.navigation.navigate("Main");
  };

  componentDidMount() {

    let self = this;
    let castId;
    if (this.props.navigation.getParam("castId")) {
      castId = this.props.navigation.getParam("castId", null);
    }
    firebase
      .database()
      .ref(`feeds/feedNew/${castId}/members/`)
      .on("value", function(snapshot) {
        var onlineUsers = [];
        var offlineUsers = [];
        snapshot.forEach(ss => {
          if (ss.val().online) {
            onlineUsers.push(ss.val());
          } else {
            offlineUsers.push(ss.val());
          }
        });
        self.setState({ onlineUsers: onlineUsers });
        self.setState({ offlineUsers: offlineUsers });
      });
  }

  render() {
    const { currentUser, offlineUsers, onlineUsers } = this.state;

    let castId;
    if (this.props.navigation.getParam("castId")) {
      castId = this.props.navigation.getParam("castId", null);
    }
    let bottomMenu = (
      <View style={styles.bottomMenu}>
        <Icon
          type="ionicon"
          underlayColor="transparent"
          name="ios-camera-outline"
          color="black"
          iconStyle={styles.navIcon}
          size={40}
          onPress={() => this.goToCamera()}
        />
      </View>
    );
    return (
      <SafeAreaView style={{ backgroundColor: '#f4f4f4',flex: 1 }}>
        <View style={styles.container}>
          <SectionList
            style={styles.feedList}
            renderItem={({ item, index, section }) => (
              <ListItem
                title={item.userName}
                titleStyle={{ fontFamily: "Quicksand" }}
                subtitleStyle={{ color: "#a8a8a8", fontFamily: "Quicksand" }}
                style={{ borderBottomWidth: 1, borderColor: "#e8e8e8" }}
                rightElement={
                  <View
                    style={{
                      height: 10,
                      width: 10,
                      borderRadius: 10,
                      backgroundColor: item.online ? "#C1D870" : "#e4e4e4"
                    }}
                  />
                }
              />
            )}
            renderSectionHeader={({ section: { title } }) => (
              <Text
                style={{
                  backgroundColor: "#f4f4f4",
                  fontFamily: "Quicksand",
                  fontSize: 12,
                  marginTop: 15,
                  color: "#a8a8a8",
                  padding: 10,
                  textAlign: "center"
                }}
              >
                {title}
              </Text>
            )}
            sections={[
              { title: "Online Now", data: onlineUsers || [] },
              { title: "Offline", data: offlineUsers || [] }
            ]}
            keyExtractor={(item, index) => item + index}
          />}
        </View>
        {bottomMenu}
      </SafeAreaView>
    );
  }

  keyExtractor = (item, index) => item.castId;

  renderItem = ({ item }) => (
    <ListItem
      title={item.userName}
      subtitleStyle={{ color: "#a8a8a8" }}
      style={{ borderBottomWidth: 1, borderColor: "#e8e8e8" }}
      chevron
    />
  );
  goToCreateFeed = () => {
    this.props.navigation.navigate("CreateFeed");
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    flexDirection: "column",
    backgroundColor: "#f4f4f4"
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
    flex: 1
  },
  bottomMenu: {
    flex: 0,
    padding: 5,
    maxHeight: 50,
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",

    zIndex: 99,
    flexDirection: "row"
  },
  navIcon: {
    marginHorizontal: 10
  }
});
