import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import firebase from "react-native-firebase";

export default class Loading extends React.Component {
  componentDidMount() {
    let unsubscribe = firebase.auth().onAuthStateChanged(user => {
      this.props.navigation.navigate(user ? "Menu" : "Walkthrough", {
        currentUser: firebase.auth().currentUser
      });
      unsubscribe();
    });
  }
  render() {
    return (
      <View style={styles.container}>
        <Text>Loading Wedcast</Text>
        <ActivityIndicator size="large" />
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#B5FCF1",
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});
