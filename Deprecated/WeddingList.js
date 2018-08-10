import React from "react";
import {
    Platform,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    FlatList,
    ScrollView,
    Animated
  } from "react-native";
  import firebase from "react-native-firebase";
  import {
    Input,
    Button,
    ListItem,
    Icon,
    Avatar,
    SideMenu,
    Badge,
    Overlay
  } from "react-native-elements";

// This is an example of a "controlled" component.
// We call it this because the parent controls its data.
export default function WeddingList(props) {
  // The parent component is responsible for managing both
  // the "commited" and "draft" email states. It tells this component
  // which one to display by passing props.email.

  keyExtractor = (item, index) => item.castId;
  renderItem = ({ item }) => {
    let image =
      item.avatarUri == undefined
        ? require("./assets/placeholder.png")
        : { uri: item.avatarUri };
    return (
      <ListItem
        id={item.castId}
        title={item.feedName}
        subtitle={`#` + item.castId}
        onPress={this.goToFeed.bind(this, item.castId)}
        titleStyle={{ fontFamily: "Quicksand" }}
        subtitleStyle={{ color: "#a8a8a8", fontFamily: "Quicksand" }}
        style={{ borderBottomWidth: 1, borderColor: "#e8e8e8" }}
        chevron
        leftAvatar={{
          avatarStyle: {
            width: 50,
            height: 50,
            backgroundColor: "#1F9FAC",
            borderRadius: 25
          },
          overlayContainerStyle: { backgroundColor: "transparent" },
          source: image
        }}
      />
    );
  };
  getUserFeeds= () => {
    let self = this;

    firebase
      .database()
      .ref(`users/${firebase.auth().currentUser.uid}/feedList`)
      .orderByChild("feedCount")
      .on("value", function(snapshot) {
        var data = [];
        snapshot.forEach(ss => {
          let myFeed = ss.val();
          data.push(myFeed.castId);
        });
        self.setState({ feedList: data });
        self.updateFeeds();
      });
  }
  updateFeeds = () => {
    let self = this;
    let feeds = [];
    self.setState({ userFeeds: null });
    this.state.feedList.forEach(castId => {
      firebase
        .database()
        .ref(`feeds/feedNew/${castId}/chatInfo`)
        .on(
          "value",

          function(snapshotRef) {
            let cast = snapshotRef.val();
            let feedList = self.state.userFeeds;
            let newCast = true;
            if (feedList) {
              for (var i = 0; i < feedList.length; i++) {
                if (feedList[i].castId === cast.castId) {
                  feedList[i] = cast;
                  newCast = false;
                  break;
                }
              }
            }
            if (newCast) {
              feeds.push(snapshotRef.val());
            }
            self.setState({ userFeeds: feeds });
          }
        );
    });
  };
  return (
    <FlatList
    contentContainerStyle={
      !this.state.userFeeds && styles.centerEmptySet
    }
    style={styles.feedList}
    keyExtractor={this.keyExtractor}
    data={this.state.userFeeds}
    renderItem={this.renderItem}
    extraData={this.state}
    ListEmptyComponent={
      <Text style={{ paddingVertical: 20, color: "#999999" }}>
        Currently not attending any weddings
      </Text>
    }
  />

  );
}
