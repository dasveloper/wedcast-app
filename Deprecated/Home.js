
import React from 'react'
import { StyleSheet, View,ImageBackground, Image } from 'react-native'
import firebase from 'react-native-firebase';
import { Input, Button, Text,ListItem,Icon, Avatar } from 'react-native-elements';
const defaultAvatar =  "https://cdn.clutchprep.com/avatar_images/mNSN76C3QkGGfoD1HbVO_avatar_placeholder.png";

export default class Home extends React.Component {
  state = { userName: '', avatarUri: null, errorMessage: null }
  handleLogin = () => {
    let self= this;
    firebase.auth().signInAnonymously().catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
      }).then(function(user) {
        var user = firebase.auth().currentUser

        if (user != null) {        
          user.updateProfile({'displayName': self.state.userName, 'photoURL' : self.state.avatarUri}).then(function(user) {
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
    let newUser= {profile: {"name": this.state.userName, "avatar": this.state.avatarUri}};
    let self = this;
    
    firebase.database().ref("users").push(newUser, function(error) {
     if (error)
       console.log('Error has occured during saving process')
    
    })
  }
  componentDidMount= ()=>{
    var userName;
    if (this.props.navigation.getParam('userName')){
        userName= this.props.navigation.getParam('userName', null)
        }
        this.setState({userName: userName});


  }
  render() {
    return (
    <View style={{flex:1}}>

        
        <View style={styles.container}>

            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Image
          resizeMode={'contain'} // or cover
          style={{maxWidth: 150, height: 150, alignSelf:'center'}} // must be passed from the parent, the number may vary depending upon your screen size
          source={require('./assets/logo-4.png')}
        />
        <Text style={{fontSize: 36, marginTop: 4}}>Wedcast</Text>
            </View>

            <View style={{  justifyContent: 'flex-end', flexDirection: 'column'}}>
                

                    <View style={{padding: 20}}>
                     <Button style={styles.loginButton}  
                buttonStyle={{
                    backgroundColor: "#1F9FAC",
                    borderRadius: 5,
                    height: 60,
                }}
                titleStyle={{
                    fontSize: 24,
                }}
                title="Create new account" 
                onPress={() => this.props.navigation.navigate('LoginName')}
                />
            
            <Button style={styles.loginButton}  
                buttonStyle={{
                    borderColor: "#1F9FAC",
                    borderWidth: 1,
                    backgroundColor: "transparent",
                    borderRadius: 5,
                    height: 60,
                    marginVertical: 20,
                }}
                titleStyle={{
                    fontSize: 24,
                    color: "#1F9FAC",

                }}
                title="Login with Email" 
                onPress={() => this.props.navigation.navigate('LoginEmail')}
                />
                </View>
                </View>

        </View>

    </View>
    )
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#FCF5F0'
  },
  loginButtonWrapper:{
    backgroundColor: '#A1C146',


  },
  loginButton:{
    borderRadius: 0,
  },
  buttonGroup:{
    display: 'flex', 
    flexDirection: 'column', 
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 30
  },
  textInput: {
    height: 40,
    width: '90%',
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20
  }
})