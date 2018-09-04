import React, {Component}from "react";
import {
  StyleSheet,
  Platform,
  Image,
  Text,
  View,
  StatusBar,
  Dimensions,
  BackHandler
} from "react-native";
import { StackNavigator, DrawerNavigator } from "react-navigation";
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
let currentPage = "";
const entireScreenWidth = Dimensions.get("window").width;
EStyleSheet.build({ $rem: entireScreenWidth / 380 });

firebase.analytics().logEvent("opened");
// gets the current screen from navigation state
function getCurrentRouteName(navigationState) {
  if (!navigationState) {
    return null;
  }
  const route = navigationState.routes[navigationState.index];
  // dive into nested navigators
  if (route.routes) {
    return getCurrentRouteName(route);
  }
  return route.routeName;
}

// create our app's navigation stack
const Nav = StackNavigator(
  {
    Loading: {
      screen: Loading
    },
    Walkthrough: {
      screen: Walkthrough
    },
    PrivacyPolicy: {
      screen: PrivacyPolicy
    },
    PrivateFeed: {
      screen: PrivateFeed
    },
    ImageView: {
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
      gesturesEnabled: false
    }
  }
);

export default class App extends Component {
  constructor() {
    super();
    this.state = {
      currentPage: ''
    };
  }
  componentDidMount(){
    BackHandler.addEventListener("hardwareBackPress", () => {
      if (this.state.currentPage =="Walkthrough" || this.state.currentPage == "Menu")
      return true;
      else return false;
    });
  }
  render(){
    let self = this

    return (
      <Nav
        onNavigationStateChange={(prevState, currentState) => {
          const currentScreen = getCurrentRouteName(currentState);
          const prevScreen = getCurrentRouteName(prevState);
    
          if (prevScreen !== currentScreen) {
            self.setState({currentPage: currentScreen});
          }
        }}
      />
    )
  }


}
