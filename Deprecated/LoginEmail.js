/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ImageBackground
} from "react-native";
import firebase from "react-native-firebase";
import {
  Input,
  Button,
  ListItem,
  Icon,
  Avatar,
  SideMenu,
  Badge
} from "react-native-elements";

const defaultAvatar =
  "https://cdn.clutchprep.com/avatar_images/mNSN76C3QkGGfoD1HbVO_avatar_placeholder.png";

export default class LoginEmail extends Component {
  render() {
    return (
      <View style={styles.container}>
        <ImageBackground
          resizeMode={"cover"} // or cover
          style={{ flex: 1 }} // must be passed from the parent, the number may vary depending upon your screen size
          source={require("./assets/login.png")}
        >
          <TouchableOpacity
            style={{ padding: 10 }}
            onPress={() => this.props.navigation.goBack()}
          >
            <Text style={{ fontSize: 20 }}>Back</Text>
          </TouchableOpacity>
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <View style={styles.buttonGroup}>
              <Text
                style={{ fontSize: 24, color: "#484848", textAlign: "center" }}
              >
                Welcome back!
              </Text>
            </View>
            <View style={styles.buttonGroup}>
              <Input
                placeholder="Email"
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
                inputContainerStyle={{ borderBottomWidth: 0 }}
                inputStyle={{ fontSize: 28, height: 64 }}
              />
            </View>

            <View style={styles.buttonGroup}>
              <Input
                placeholder="Password"
                shake={true}
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
                inputContainerStyle={{ borderBottomWidth: 0 }}
                inputStyle={{ fontSize: 28, height: 64 }}
              />
            </View>
          </View>
          <View style={styles.loginButtonWrapper}>
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
              title="Done"
              onPress={this.goToAvatar}
            />
          </View>
        </ImageBackground>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#fff"
  },

  buttonGroup: {
    display: "flex",
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    width: "90%",
    justifyContent: "center"
  }
});
