import React from "react";
import {
  StyleSheet,
  View,
  TextInput,
  KeyboardAvoidingView,
  Dimensions,
  SafeAreaView
} from "react-native";
import firebase from "react-native-firebase";
import {
  Input,
  Button,
  Text,
  ListItem,
  Icon,
  Avatar
} from "react-native-elements";
import EStyleSheet from "react-native-extended-stylesheet";


export default class PrivateFeed extends React.Component {
  state = {
    feed: null,
    password: "",
    errorMessage: null,
    inputFocused: false,
    avatarUri: null,
    errorMessage: null,
    feed: null,
    smallScreen: false
  };

  requestAccess = () => {
    let self = this;

    let params = this.props.navigation.state.params;
    let feed = params.feed;
    let password = this.state.password;
    let castId = params.castId;
    let user = firebase.auth().currentUser.displayName;
    let userObj = { userName: user, password: password };
    firebase
      .database()
      .ref(`feeds/feedNew/${castId}/members/${firebase.auth().currentUser.uid}`)
      .set(userObj, function(error) {
        if (error) self.setState({ errorMessage: "Incorrect password" });
        else {
          self.props.navigation.navigate("WeddingDetails", {
            castId: castId,
            feedName: feed.feedName
          });
        }
      });
    firebase
      .database()
      .ref(`users/${firebase.auth().currentUser.uid}/feedList/${castId}`)
      .set(feed, function(error) {});
  };

  componentDidMount() {
    if (Dimensions.get('window').width <= 320){
      this.setState({smallScreen: true})
    }
    let params = this.props.navigation.state.params;
    let feed = params.feed;
    this.setState({ feed: feed });
  }
  render() {
    const { inputFocused, password, errorMessage, feed } = this.state;
   
    if (feed) {
      avatar = feed.avatarUri
        ? { uri: feed.avatarUri }
        : require("./assets/placeholder.png");
    }
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor:'#fff' }}>

        <View style={styles.container}>
        <View style={styles.backButton}>
                  <Icon
                    type="ionicon"
                    name="ios-arrow-back"
                    color="#000"
                    size={30}
                    onPress={() => this.props.navigation.goBack()}
                    containerStyle={styles.backIcon}
                  />

                  <Text style={styles.private}>Enter the password</Text>
                </View>

          <View
            style={{
              flex: 1,
              justifyContent: "space-evenly",
              alignItems: "center"
            }}
          >
          {!(this.state.inputFocused && this.state.smallScreen) && <Text
              style={{
                textAlign: "center",
                fontSize: 18,
                fontFamily: "Quicksand"
              }}
            >
              This wedding is private, you must enter the password to enter the
              Wedcast.
            </Text>}

            {this.state.feed && (!(this.state.inputFocused ) ) &&
              <Avatar
              size={this.state.smallScreen ? 150 : 250}
              rounded
              containerStyle={{ backgroundColor: "#87E5D3" }}
              imageProps={{ resizeMode: "cover" }}
              source={avatar}
             
            />

            }
        
            
          </View>
        </View>
        <KeyboardAvoidingView
          style={styles.loginButtonWrapper}
          behavior="padding"
          enabled
        >
          {errorMessage && (
            <Text
              style={{
                color: "red",
                margin: 5,
                textAlign: "center",
                fontSize: 16,
                fontFamily: "Quicksand"

              }}
            >
              {errorMessage}
            </Text>
          )}
       
 
          <Input
            placeholderTextColor="#605D5D"
            autoCapitalize="none"
            placeholder="Password"
            autoCorrect={false}
            underlineColorAndroid="transparent"
            InputProps={{ disableUnderline: true }}

            onFocus={() => this.setState({ inputFocused: true })}
            onBlur={() => this.setState({ inputFocused: false })}
            blurOnSubmit={false}
            value={password}
            onChangeText={password => this.setState({ password })}
            containerStyle={styles.searchInputContainer}
            inputContainerStyle={{ borderBottomWidth: 0 }}
            inputStyle={styles.searchInput}
          />


          <Button
            style={styles.loginButton}
            buttonStyle={{
              backgroundColor: "#1F9FAC",
              padding: 10,
              borderRadius: 0
            }}
            titleStyle={{
              fontSize: 30,
              fontFamily: "Quicksand"
            }}
            title="Submit"
            onPress={this.requestAccess}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }
}
const styles = EStyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-evenly",
    flexDirection: "column",
    padding: 10,
    backgroundColor: "#fff"
  },
  loginButtonWrapper: {
    backgroundColor: "#fff",
    justifyContent: "center"
  },
  loginButton: {
    borderRadius: 0
  },
  buttonGroup: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center"
  },
  textInput: {
    height: 40,
    width: "90%",
    borderColor: "gray",
    borderWidth: 1,
    marginTop: 8
  },
  backButton: {
    justifyContent: "center",
    alignSelf: "center",
    marginLeft: 15,
    padding: 0,
    flexDirection: "row",
    flexWrap: 'nowrap',
    position: 'relative',
    width: '100%',
    paddingBottom: 5
  },
  backIcon:{
    position: 'absolute',
    left: 10

  },
  private: {
    fontSize: 24,
    color: "#000",
    fontFamily: "Quicksand",
    textAlign: "center"
  },
  searchInputContainer: {
    backgroundColor: "#f4f4f4",
    margin: 0,
    alignSelf: "center",
    borderTopLeftRadius: 5,
    padding: "10rem",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 5,
    alignSelf: "center",
    marginBottom: 20,
    borderBottomWidth: 0,
    width: "90%",
    fontSize: 24,
  },
  searchInput: {
    fontSize: 25,
    fontFamily: "Quicksand",
    padding: 0,
        borderBottomWidth: 0,

  },
});
