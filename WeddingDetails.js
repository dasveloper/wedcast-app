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
  Image,
  Dimensions,
  ScrollView,
  TextInput,
  SafeAreaView
} from "react-native";
import { Icon, Avatar, Divider, ListItem, Button } from "react-native-elements";
import firebase from "react-native-firebase";

export default class WeddingDetails extends Component {
  state = {
    currentUser: null,
    newPassword: null,
    changingPassword: false,
    feed: null,
    feedKey: null,
    uploads: null,
    members: null
  };

  constructor(props) {
    super(props);
    const { currentUser } = firebase.auth();
    this.state = {
      currentUser: currentUser
    };
  }
  returnData = avatarUri => {
    let castId;
    let self = this;
    if (this.props.navigation.getParam("castId")) {
      castId = this.props.navigation.getParam("castId", null);
    }
    if (castId != null) {
      firebase
        .database()
        .ref(`feeds/feedNew/${castId}/chatInfo/avatarUri`)
        .set(avatarUri, function(snapshot) {
          self.setState({ avatarUri: avatarUri });
        });
    }
  };
  componentDidMount() {
    let castId;
    let self = this;
    if (this.props.navigation.getParam("castId")) {
      castId = this.props.navigation.getParam("castId", null);
    }
    firebase
      .database()
      .ref(`feeds/feedNew/${castId}/password`)
      .on("value", function(snapshot) {
        self.setState({ password: snapshot.val() });
      });
    firebase
      .database()
      .ref(`feeds/feedNew/${castId}/chatInfo`)
      .on("value", function(snapshot) {
        self.setState({ feed: snapshot.val(), feedKey: snapshot.key });
      });
    firebase
      .database()
      .ref(`feeds/feedNew/${castId}/uploads`)
      .on("value", function(snapshot) {
        self.setState({ uploads: snapshot.val() });
      });
    firebase
      .database()
      .ref(`feeds/feedNew/${castId}/members`)
      .on("value", function(snapshot) {
        self.setState({ members: snapshot.val() });
      });
  }

  toggleChangeInput = () => {
    if (this.state.changingPassword) {
      let password = this.state.password;
      firebase
        .database()
        .ref(`feeds/feedNew`)
        .child(this.state.feed.castId)
        .child("password")
        .set(password);

      this.setState({ changingPassword: false });
    } else {
      this.setState({ changingPassword: true });
    }
  };
  render() {
    const {
      currentUser,
      feed,
      newPassword,
      changingPassword,
      password,
      feedKey,
      uploads,
      members
    } = this.state;
    let avatar;
    if (feed) {
      avatar = feed.avatarUri
        ? { uri: feed.avatarUri }
        : require("./assets/placeholder.png");
      passwordDetail = (
        <View>
          {!changingPassword && (
            <Text style={styles.detailLabel}>Password: </Text>
          )}
          {!changingPassword && <Text style={styles.detail}>{password}</Text>}
          {changingPassword && (
            <TextInput
              autoFocus={true}
              ref={component => (this.changePasswordInput = component)}
              onChangeText={text => this.setState({ password: text })}
              style={styles.changingPassword}
              value={password}
            />
          )}
        </View>
      );
      submitPasswordChange = (
        <View>
          {changingPassword && (
            <Button
              buttonStyle={{ backgroundColor: "transparent" }}
              icon={{
                type: "ionicon",
                name: "md-checkmark",
                size: 22,
                containerStyle: {
                  marginRight: 10,
                  justifyContent: "center",
                  alignItems: "center"
                },
                color: "#BADA5F"
              }}
              title=""
              titleStyle={{
                fontFamily: "Quicksand"
              }}
              onPress={() => this.toggleChangeInput()}
            />
          )}
          {!changingPassword && (
            <Button
              buttonStyle={{ backgroundColor: "transparent" }}
              icon={{
                type: "ionicon",
                name: "md-create",
                size: 22,
                containerStyle: {
                  marginRight: 10,
                  justifyContent: "center",
                  alignItems: "center"
                },
                color: "#999999"
              }}
              title=""
              titleStyle={{
                fontFamily: "Quicksand"
              }}
              onPress={() => this.toggleChangeInput()}
            />
          )}
        </View>
      );

      castId = (
        <View>
          <Text style={styles.detailLabel}>CastID: </Text>
          <Text style={styles.detail}>{"#" + feed.castId}</Text>
        </View>
      );
      feedUrl = (
        <View>
          <Text style={styles.detailLabel}>Feed Url: </Text>
          <Text style={styles.detail}>{`https://wedcast.app/cast/${feed.castId}`}</Text>
        </View>
      );
      weddingType = (
        <View>
          <Text style={styles.detailLabel}>Wedding Type: </Text>
          <Text style={styles.detail}>
            {feed.castType === 0 ? "Small Wedding" : "Large Wedding"}
          </Text>
        </View>
      );
      photos = (
        <View style={styles.guestsWrapper}>
          <Icon
            name="ios-images"
            color="black"
            type="ionicon"
            iconStyle={styles.f}
            size={28}
          />
          <Text style={styles.guests}>
            {uploads ? Object.keys(uploads).length : 0}
          </Text>
        </View>
      );
      guests = (
        <View style={styles.guestsWrapper}>
          <Icon
            name="ios-people"
            color="black"
            type="ionicon"
            iconStyle={styles.guestIcon}
            size={28}
          />
          <Text style={styles.guests}>
            {members ? Object.keys(members).length : 0}
          </Text>
        </View>
      );
    }
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.nav}>
          <Icon
            type="ionicon"
            name="ios-menu-outline"
            color="#000"
            iconStyle={styles.menuIcon}
            size={40}
            onPress={() => this.props.navigation.navigate("Menu")}
          />
        </View>
        {feed != null && (
          <ScrollView style={styles.containerColumn}>
            <View style={styles.nameWrapper}>
              <Text style={styles.feedName}>{feed.feedName}</Text>
            </View>
            <View style={styles.avatarRow}>
              <Avatar
                size={250}
                rounded
                containerStyle={{ backgroundColor: "#87E5D3" }}
                imageProps={{ resizeMode: "cover" }}
                source={avatar}
                activeOpacity={feed.owner === currentUser.uid ? 0.7 : 1}
                onPress={() => {
                  Orientation.unlockAllOrientations();

                  feed.owner === currentUser.uid
                    ? this.props.navigation.navigate("UpdateAvatar", {
                        returnData: this.returnData.bind(this)
                      })
                    : undefined;
                }}
              />
            </View>
            <View style={styles.feedStats}>
              {members && guests}
              {uploads && photos}
            </View>
            <ListItem
              containerStyle={styles.goToFeed}
              title={`Go to ${feed.feedName}`}
              titleStyle={{
                paddingVertical: 10,
                color: "#fff",
                fontWeight: "bold",
                fontFamily: "Quicksand"
              }}
              onPress={() => {
                Orientation.unlockAllOrientations();

                this.props.navigation.navigate("Main", {
                  castId: feed.castId,
                  feedName: feed.feedName
                });
              }}
              chevron
            />
            <ListItem containerStyle={styles.detailItem} title={castId} />
            <ListItem
              containerStyle={styles.detailItem}
              title={passwordDetail}
              rightElement={
                feed.owner === currentUser.uid
                  ? submitPasswordChange
                  : undefined
              }
            />

            <ListItem containerStyle={styles.detailItem} title={feedUrl} />
          </ScrollView>
        )}
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  nav: {
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10
  },
  container: {
    backgroundColor: '#fff',
    flex: 1
  },
  containerColumn: {
    flexDirection: "column",
    flex: 1,
    backgroundColor: "#fff"
  },
  guestsWrapper: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row"
  },

  feedStats: {
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly"
  },
  guestIcon: {
    marginRight: 5
  },
  guests: {
    fontSize: 18,
    fontFamily: "Quicksand",
    marginLeft: 5
  },
  nameWrapper: {
    display: "flex",
    alignItems: "center"
  },
  feedName: {
    fontSize: 28,
    marginBottom: 20,
    fontFamily: "Quicksand"
  },
  avatarRow: {
    display: "flex",
    alignItems: "center"
  },
  goToFeed: {
    borderBottomWidth: 0.5,
    borderColor: "#999999",
    backgroundColor: "#1F9FAC"
  },
  detailItem: {
    borderBottomWidth: 0.5,
    borderColor: "#999999"
  },
  detailLabel: {
    color: "#999999",
    fontSize: 16,
    marginBottom: 4,
    fontFamily: "Quicksand"
  },
  detail: {
    fontSize: 16,
    fontFamily: "Quicksand"
  },
  changingPassword: {
    fontSize: 20,
    fontFamily: "Quicksand"
  }
});