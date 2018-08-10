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
  FlatList,
  ScrollView

} from 'react-native';
import firebase from 'react-native-firebase';
import { Input, Button, ListItem,Icon, Avatar } from 'react-native-elements';

const defaultAvatar =  "https://cdn.clutchprep.com/avatar_images/mNSN76C3QkGGfoD1HbVO_avatar_placeholder.png";

export default class InviteRequests extends Component {
  state = { 
      currentUser: null,
      invites: null,
      topFeeds: null,
      profile: null,
    }
  constructor(props) {
    super(props);
  
    const { currentUser } = firebase.auth()
    this.state = {
        currentUser: currentUser
     }
 }
 componentDidMount(){
    let self=this;
    firebase.database().ref(`users/${firebase.auth().currentUser.uid}/invites`).orderByChild('feedCount').on('value',  
    function(snapshot){
      var data = [];
      snapshot.forEach(ss => {
         data.unshift(ss.val());
      });
      self.setState({invites: data});
    }
  )
 }

  render() {
    const { currentUser, profile,invites } = this.state
   


    return (
      <View style={styles.container}>
        <View style={styles.nav}>
        <Icon
                           type="ionicon"
        
                name='ios-arrow-back-outline' 
                color='#000'
                iconStyle={styles.navIcon}
                size={24}
                onPress={() =>       this.props.navigation.goBack()} 
                />
         
        
                  </View>
 
        <FlatList style={styles.feedList}
        keyExtractor={this.keyExtractor}
        data={invites}
        renderItem={this.renderItem}
        />
      </View>
    );
  }
  acceptInviteRequest = (user) =>{
      let feed = null;
      let self=this;
      let userId = user.userId;
      firebase.database().ref(`users/${userId}/feedList/${user.feed}/hasAccess`).set(true, function(error) {
        if (error){}
        //alert("error")
        else{}

      }) 
      firebase.database().ref(`feeds/feeds/${user.feed}/allowedAccess/${userId}`).set(true, function(error) {
        if (error){}
        //alert("error")
        else{}

      }) 
      
      firebase.database().ref(`feeds/feedList/${user.feed}/allowedAccess/${userId}`).set(true, function(error) {
        if (error){}
        //alert("error")
        else{}

      }) 
      firebase.database().ref(`users/${firebase.auth().currentUser.uid}/invites/${userId}`).remove(function(error) {

        if (error){}
        //alert("error")
        else{}

      }) 
  }
  rejectInviteRequest = (user) =>{
    let feed = null;
    let self=this;
    let userId = user.userId;
    firebase.database().ref(`users/${firebase.auth().currentUser.uid}/invites/${userId}`).remove(function(error) {

      if (error){}
      //alert("error")
      else{}

    }) 
}
  keyExtractor = (item, index) => index

  renderItem = ({ item }) => (
      
    <ListItem
      title={item.user}
      onPress={this.acceptInviteRequest.bind(this,item)}
      subtitleStyle ={{color:'#a8a8a8' }}
      style={{borderBottomWidth: 1, borderColor: '#e8e8e8'}}
      rightElement={
        <View style={{flexDirection: 'row'}}><Button
        buttonStyle={{marginHorizontal: 5}}
        onPress={this.rejectInviteRequest.bind(this,item)}

        icon={
          <Icon
          type="ionicon"
          containerStyle={{width: 30, height: 30, borderRadius: 4, alignItems: 'center', justifyContent: 'center', backgroundColor:'#D12018'}}
            name='md-close'
            iconStyle={{lineHeight: 30}}
            size={24}
            color='white'
          />
        }
        title=''
      /><Button
      buttonStyle={{marginHorizontal: 5}}
      onPress={this.acceptInviteRequest.bind(this,item)}
        icon={
          <Icon
          type="ionicon"
          containerStyle={{width: 30, height: 30, borderRadius: 4, alignItems: 'center', justifyContent: 'center', backgroundColor:'#24A98E'}}
            name='md-checkmark'
            iconStyle={{lineHeight: 30}}
            size={24}
            color='white'
          />
        }
        title=''
      /></View>}
    />
  )
  goToCreateFeed= () =>{

    this.props.navigation.navigate('CreateFeed');
    
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#fff'
  },
  nav: {
    paddingVertical:  15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent:'flex-start',
    alignItems: 'center',
    backgroundColor: '#fff',
    zIndex: 10,
    borderBottomWidth:1,
    borderColor: "#f4f4f4"
  },
  logo: {
 
    position: 'relative'
  },
  createButton:{
        display: 'flex', 
    padding: 10,
        flexDirection: 'row',
  },
  buttonGroup:{
    display: 'flex', 
paddingHorizontal: 10,
    flexDirection: 'row', 
    alignItems: 'center'
  },
  topWrapper:{
    shadowOpacity: 0.75,
    shadowRadius: 6,
    shadowColor: '#c8c8c8',
    shadowOffset: { height: 5, width: 0 },
    paddingBottom: 10,
    zIndex:2,
    backgroundColor: '#fff'
  },
  feedForm:{
      marginHorizontal: 10
  },
  feedList:{
      flex:1,
      
  }
});
