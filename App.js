import React from "react";
import {
  StyleSheet,
  Platform,
  Image,
  Text,
  View,
  StatusBar,
  Dimensions
} from "react-native";
import { StackNavigator,DrawerNavigator } from "react-navigation";
// import the different screens
import Loading from "./Loading";

import UpdateAvatar from "./UpdateAvatar";
import PrivateFeed from "./PrivateFeed";
import FeedUsers from "./FeedUsers";
import LoginPhone from "./LoginPhone";
import Profile from "./Profile";

import LoginName from "./LoginName";
import LoginAvatar from "./LoginAvatar";
import Main from "./Main";
import Menu from "./Menu";
import WeddingDetails from "./WeddingDetails";
import CreateFeed from "./CreateFeed";
import Feed from "./Feed";
import Walkthrough from "./Walkthrough";
import EStyleSheet from "react-native-extended-stylesheet";

import firebase from "react-native-firebase";

const firebaseConfig = {
  apiKey: "AIzaSyBSgrUWsADqxGFmRhmv_tieMpr4zDhGIn8",
  authDomain: "blobtest-36ff6.firebaseapp.com",
  databaseURL: "https://snaps-b05fb.firebaseio.com/",
  storageBucket: "snaps-b05fb.appspot.com",
  messagingSenderId: "506017999540"
};
StatusBar.setHidden(true);
const entireScreenWidth = Dimensions.get("window").width;

EStyleSheet.build({ $rem: entireScreenWidth / 380 });
// create our app's navigation stack
const App = StackNavigator(
  {
    Loading: {
      screen: Loading
    },
    Walkthrough: {
      screen: Walkthrough
    },
    PrivateFeed: {
      screen: PrivateFeed
    },
    LoginPhone: {
      screen: LoginPhone
    },
    LoginName: {
      screen: LoginName
    },
    LoginAvatar: {
      screen: LoginAvatar
    },
    Main: {
      screen: Main
    },
    CreateFeed: {
      screen: CreateFeed
    },
    FeedUsers: {
      screen: FeedUsers
    },
    Feed: {
      screen: Feed
    },
    Menu: {
      screen: Menu
    },
    UpdateAvatar: {
      screen: UpdateAvatar
    },
    UpdateAvatar: {
      screen: UpdateAvatar
    },
    Profile: {
      screen: Profile
    },
    WeddingDetails: {
      screen: WeddingDetails
    }
  },
  {
    initialRouteName: "Loading",
    headerMode: "none",
    header: null,
    navigationOptions: {
      gesturesEnabled: false,
  },
  }
);
export default App;
