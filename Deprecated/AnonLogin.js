
import React from 'react'
import { StyleSheet, View } from 'react-native'
import firebase from 'react-native-firebase';
import { Input, Button, Text,ListItem,Icon, Avatar } from 'react-native-elements';
const defaultAvatar =  "https://cdn.clutchprep.com/avatar_images/mNSN76C3QkGGfoD1HbVO_avatar_placeholder.png";

export default class AnonLogin extends React.Component {
  state = { name: '', avatarUri: null, errorMessage: null }

  updateAvatar = () => {
    var self = this;
      var user = firebase.auth().currentUser

      if (user != null) {        
        user.updateProfile({'photoURL': self.state.avatarUri}).then(function(user) {
          self.props.navigation.navigate("Menu");
          //return user.updateProfile({'displayName': this.state.name, "photoUrl": this.state.avatarUri});
        }).catch(function(error) {  
        });
      }

}
  handleLogin = () => {
    const { email, pasword } = this.state
    let self= this;
    firebase.auth().signInAnonymously().catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
      }).then(function(user) {
        var user = firebase.auth().currentUser

        if (user != null) {        
          user.updateProfile({'displayName': self.state.name, 'photoURL':  self.state.avatarUri}).then(function(user) {
           self.saveLoginDetails();
            //return user.updateProfile({'displayName': this.state.name, "photoUrl": this.state.avatarUri});
          }).catch(function(error) {
    
          });
        }
        //return user.updateProfile({'displayName': this.state.name, "photoUrl": this.state.avatarUri});
      }).catch(function(error) {

      });
      
  }
  returnData(avatarUri) {
    this.setState({avatarUri: avatarUri});
  }
  saveLoginDetails = () =>{
    let newUser= {profile: {"name": this.state.name, "avatar": this.state.avatarUri}};
    let self = this;
    
    firebase.database().ref("users").push(newUser, function(error) {
     if (error)
       console.log('Error has occured during saving process')
    
    })
  }
  componentDidMount= ()=>{
    var user = firebase.auth().currentUser

    if (user != null) {        
    }
  }
  render() {
    return (
        <View style={{flex:1}}>
      <View style={styles.container}>
      <View style={styles.buttonGroup}>

<Text style={{fontSize: 32, color: '#DB9B85', textAlign: 'center', fontWeight: 'bold'}}>Let's get started</Text>
<Text style={{marginBottom: 30,marginTop: 5,color: '#DB9B85', marginHorizontal: 10, fontSize: 18, textAlign: 'center'}}>These details will be displayed when you host or attend an event</Text>

        {this.state.errorMessage &&
          <Text style={{ color: 'red' }}>
            {this.state.errorMessage}
          </Text>}
        <Input
        placeholderTextColor="#E8A892"
          style={styles.textInput}
          autoCapitalize="none"
          placeholder="Enter your name"
          onChangeText={name => this.setState({ name })}
          value={this.state.name}
          containerStyle ={{backgroundColor: 'transparent', borderRadius: 5, alignSelf: 'center'}}
          inputContainerStyle= {{borderBottomWidth: 1,borderColor:'#E8A892', width: '100%'}}
          inputStyle = {{ fontSize: 24, height: 60}}
        />

</View>
<View style={{justifyContent: 'center', alignItems: 'center'}}>
<Avatar
  size={250}
  rounded
  source={{uri: this.state.avatarUri  || defaultAvatar}}
  onPress={() => this.props.navigation.navigate('UpdateAvatar', {returnData: this.returnData.bind(this)})}
  activeOpacity={0.7}
/>
    </View>
    </View>

    <View style={styles.loginButtonWrapper}>
        <Button style={styles.loginButton}  
         buttonStyle={{
    backgroundColor: "#E8A892",
            padding: 10,
    borderRadius: 0
  }}
  titleStyle={{
    fontSize: 30,

  }}
  title="Done" onPress={this.updateAvatar} />
      </View>
      </View>
    )
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-evenly',
    flexDirection: 'column',
    padding: 10,
    backgroundColor: '#FCF5F0'
  },
  loginButtonWrapper:{
    backgroundColor: 'red',


  },
  loginButton:{
    borderRadius: 0,
  },
  buttonGroup:{
    display: 'flex', 
    flexDirection: 'column', 
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center'
  },
  textInput: {
    height: 40,
    width: '90%',
    borderColor: 'gray',
    borderWidth: 1,
    marginTop: 8
  }
})