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
import PrivacyPolicy from "./PrivacyPolicy";
import ImageView from "./ImageView";
import Notifications from "./Notifications";

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

firebase.analytics().logEvent("opened");



// create our app's navigation stack
const App = StackNavigator(
  {
    Loading: {
      screen: Loading
    },
    Walkthrough: {
      screen: Walkthrough
    },
    PrivacyPolicy:{
      screen: PrivacyPolicy
    },
    PrivateFeed: {
      screen: PrivateFeed
    },
    ImageView:{
      screen: ImageView
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
    Notifications: {
      screen: Notifications
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
