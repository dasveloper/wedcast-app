/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Dimensions

} from 'react-native';
import { Icon } from 'react-native-elements'


import Camera from 'react-native-camera'
import uuid from 'uuid';
import firebase from 'react-native-firebase';


const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' +
    'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

export default class UpdateWeddingPhoto extends Component {
  state = { currentUser: null, imagePreview: null, imageTaken: null, windowWidth: null, windowHeight: null }
 
constructor(props) {
  super(props);

  const { currentUser } = firebase.auth();
  const dimensions = Dimensions.get('window');
  this.state = {
    imageTaken: false,
    currentUser: currentUser,
    windowWidth: dimensions.width,
    windowHeight: dimensions.height
  };
}
  render() {
    const { currentUser, imagePreview, imageTaken, windowHeight,windowWidth } = this.state
    let imagePreviewPlaceholder = imageTaken ? (
      <Image
      source={{uri:imagePreview}}
      style={{ position: 'absolute', width: windowWidth, height: windowHeight}}
    />

    ) : (
      <Camera ref={(cam) => {
 
        this.camera = cam
      }}
      style={styles.cam}
      captureTarget={Camera.constants.CaptureTarget.disk}

            type={Camera.constants.Type.front}

      aspect={Camera.constants.Aspect.fill}>
  
      </Camera>
    );
    let bottomMenu = imageTaken ? (
      <View style={styles.bottomMenu}>

      <Icon
        name='menu' 
        color='white'
        iconStyle={styles.navIcon}
        size={40}
        onPress={() =>       this.props.navigation.navigate('Menu')} 
        />
       <Icon
       name='check' 
       color='#96c256'
       iconStyle={styles.navIcon}
       size={40}
       reverse
       onPress={this.uploadImageAsync.bind(this)}
       />
    
      <Icon
        name='apps' 
        color='white'
        size={40}
        onPress={() =>       this.props.navigation.navigate('Feed')} 

        iconStyle={styles.navIcon}/>
              </View>
    ) : ( 
      <View style={styles.bottomMenu}>

      <Icon
        name='menu' 
        color='white'
        iconStyle={styles.navIcon}
        size={40}
        onPress={() =>       this.props.navigation.navigate('Menu')} 
        />
      
          <Icon
        name='photo-camera' 
        color='#F04155'
        iconStyle={styles.topNavIcon}
        size={40}
        reverse
        onPress={this.takePicture.bind(this)}
        />
      
      <Icon
        name='apps' 
        color='white'
        size={40}
        onPress={() =>       this.props.navigation.navigate('Feed')} 

        iconStyle={styles.navIcon}/>
              </View>
    );

    let topMenu = imageTaken ? (      
    <View style={styles.topMenu}>

      <Icon
        name='close' 
        color='white'
        iconStyle={styles.topNavIcon}
        size={30}
        onPress={this.cancelPreview.bind(this)} 
        />
        <Icon
        name='file-download' 
        color='white'
        iconStyle={styles.topNavIcon}
        size={30}
        onPress={() =>       this.props.navigation.navigate('Menu')} 
        />
          </View>
    ) : (
      <View style={styles.topMenu}>
      <Icon
      name='flash-off' 
      color='white'
      iconStyle={styles.topNavIcon}
      size={30}
      onPress={() =>       this.props.navigation.navigate('Menu')} 
      />
      <Icon
      name='switch-camera' 
      color='white'
      iconStyle={styles.topNavIcon}
      size={30}
      onPress={() =>       this.props.navigation.navigate('Menu')} 
      />
        </View>
    );


    return (
      <View style={styles.container}>
     
  
      {topMenu}

      {imagePreviewPlaceholder}
      {bottomMenu}

      </View>
    );
  }
  async uploadImageAsync() {
    const { currentUser, imagePreview } = this.state
    const response = await fetch(imagePreview);
    const blob = await response.blob();
    const ref = firebase
      .storage()
      .ref()
      .child(uuid.v4());
  
  
  
      var uploadTask = ref.put(blob);

     
  let self=this;
    uploadTask.on('state_changed', function(snapshot){
      // Observe state change events such as progress, pause, and resume
      // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
    //  var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

    }, function(error) {
      // Handle unsuccessful uploads
    }, function() {

      // Handle successful uploads on complete
      // For instance, get the download URL: https://firebasestorage.googleapis.com/...
      uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
        let comment= {"avatar": downloadURL};
        self.props.navigation.state.params.returnData(downloadURL);

        self.props.navigation.goBack();

      // firebase.database().ref(`users/${firebase.auth().currentUser.uid}/profile`).set(comment, function(error) {
      //  if (error)
       //   console.log('Error has occured during saving process')
       // else
      //  self.setState({ imagePreview: null, imageTaken: false })
    //  })
      });

  });
    return true;
  }

  takePicture(){
    const options = {
      forceUpOrientation: true,
      fixOrientation: true
    };
 
    this.camera.capture(options).then((data) =>{
      this.setState({ imagePreview: data.path, imageTaken: true })

      
     }).catch()
  }
  cancelPreview(){
    this.setState({ imagePreview: null, imageTaken: false })

  }
  navigateMenu = () => {
    
      this.props.navigation.navigate('Menu');
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  cam:{
    flex: 1,
    flexDirection: 'column',
  },
  bottomMenu: {
   flex: 0,
   padding: 5,
   maxHeight: 50, 
   backgroundColor:'rgba(0,0,0,.4)',
   display: 'flex',
   justifyContent: 'space-between',
   alignItems: 'center',
   position: 'absolute',
   bottom:0,
   left:0,
   right:0,
   zIndex: 99,
   flexDirection: 'row'
  },
  topMenu: {
    flex: 0,
    padding: 10,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    top:0,
    left:0,
    right:0,
    zIndex: 99,
    flexDirection: 'row'
   },
  captureButton:{
    width: 60,
    height: 60,
    borderRadius: 60,
    backgroundColor:'#F04155',
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: '#fff'
  },
  navIcon: {
    marginHorizontal:20
  },
 
});
