
import EStyleSheet from "react-native-extended-stylesheet";

import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ScrollView,
  SafeAreaView,
  Animated,
  Alert,
  Image,
  Linking,
  Dimensions
} from "react-native";
import {
  Input,
  Button,
  ListItem,
  Icon,
  Avatar,
  Overlay
} from "react-native-elements";


export default class PrivacyPolicy extends Component {

  render() {

    return (
      <SafeAreaView style={{flex: 1 }}>
            <View style={styles.backButton}>
                  <Icon
                    type="ionicon"
                    name="ios-arrow-back"
                    color="#000"
                    size={30}
                    onPress={() => this.props.navigation.goBack()}
                    containerStyle={styles.backIcon}
                  />

                  <Text style={styles.userName}>Privacy Policy</Text>
                </View>
 <ScrollView horizontal={false} style={{padding: 10}}contentContainerStyle={{flexGrow:1}} >

<Text> Wedcast built the Wedcast app as a Commercial app. This SERVICE is provided by Wedcast  and is intended for use as is.
                  </Text> <Text>This page is used to inform website visitors regarding my policies with the collection, use, and
                    disclosure of Personal Information if anyone decided to use my Service.
                  </Text> <Text>If you choose to use my Service, then you agree to the collection and use of information in relation
                    to this policy. The Personal Information that I collect is used for providing and improving the
                    Service. I will not use or share your information with anyone except as described
                    in this Privacy Policy.
                  </Text> <Text>The terms used in this Privacy Policy have the same meanings as in our Terms and Conditions, which is accessible
                    at Wedcast unless otherwise defined in this Privacy Policy.
                  </Text> <Text>Information Collection and Use</Text> <Text>For a better experience, while using our Service, I may require you to provide us with certain
                    personally identifiable information, including but not limited to users phone number for account registration, and photos taking during an event. The information that I request is retained on your device and is not collected by me in any way
                  </Text> <Text>The app does use third party services that may collect information used to identify you.</Text> <Text>Link to privacy policy of third party service providers used by the app</Text> <Text onPress={() => Linking.openURL("https://www.google.com/policies/privacy/")}>Google Play Services</Text> <Text>Log Data</Text> <Text> I want to inform you that whenever you use my Service, in a case of an
                    error in the app I collect data and information (through third party products) on your phone
                    called Log Data. This Log Data may include information such as your device Internet Protocol (“IP”) address,
                    device name, operating system version, the configuration of the app when utilizing my Service,
                    the time and date of your use of the Service, and other statistics.
                  </Text> <Text>Cookies</Text> <Text>Cookies are files with a small amount of data that are commonly used as anonymous unique identifiers. These
                    are sent to your browser from the websites that you visit and are stored on your device's internal memory.
                  </Text> <Text>This Service does not use these “cookies” explicitly. However, the app may use third party code and libraries
                    that use “cookies” to collect information and improve their services. You have the option to either
                    accept or refuse these cookies and know when a cookie is being sent to your device. If you choose to
                    refuse our cookies, you may not be able to use some portions of this Service.
                  </Text> <Text>Service Providers</Text> <Text> I may employ third-party companies and individuals due to the following reasons:</Text> To facilitate our Service; To provide the Service on our behalf; To perform Service-related services; or To assist us in analyzing how our Service is used. <Text> I want to inform users of this Service that these third parties have access to your
                    Personal Information. The reason is to perform the tasks assigned to them on our behalf. However, they
                    are obligated not to disclose or use the information for any other purpose.
                  </Text> <Text>Security</Text> <Text> I value your trust in providing us your Personal Information, thus we are striving
                    to use commercially acceptable means of protecting it. But remember that no method of transmission over
                    the internet, or method of electronic storage is 100% secure and reliable, and I cannot guarantee
                    its absolute security.
                  </Text> <Text>Links to Other Sites</Text> <Text>This Service may contain links to other sites. If you click on a third-party link, you will be directed
                    to that site. Note that these external sites are not operated by me. Therefore, I strongly
                    advise you to review the Privacy Policy of these websites. I have no control over
                    and assume no responsibility for the content, privacy policies, or practices of any third-party sites
                    or services.
                  </Text> <Text>Children’s Privacy</Text> <Text>These Services do not address anyone under the age of 13. I do not knowingly collect
                    personally identifiable information from children under 13. In the case I discover that a child
                    under 13 has provided me with personal information, I immediately delete this from
                    our servers. If you are a parent or guardian and you are aware that your child has provided us with personal
                    information, please contact me so that I will be able to do necessary actions.
                  </Text> <Text>Changes to This Privacy Policy</Text> <Text> I may update our Privacy Policy from time to time. Thus, you are advised to review
                    this page periodically for any changes. I will notify you of any changes by posting
                    the new Privacy Policy on this page. These changes are effective immediately after they are posted on
                    this page.
                  </Text> <Text>Contact Us</Text> <Text>If you have any questions or suggestions about my Privacy Policy, do not hesitate to contact
                    me.
                  </Text>
                    </ScrollView> 


</SafeAreaView>
);
}
}
const styles = EStyleSheet.create({
container: {
flex: 1,
flexDirection: "column",
backgroundColor: "#fff"
},
settingsItem: {
borderBottomWidth: 0.5,
borderColor: "#999999"
},
settingsActions: {
fontSize: 16,
marginHorizontal: 10,
fontFamily: "Quicksand"
},
detail: {
fontSize: 16
},
logoutButton: {
justifyContent: "center",
alignItems: "center",
backgroundColor: "#d93636",
borderRadius: 4,
padding: 10,
marginTop: "auto"
},
logoutButtonText: {
color: "#fff",
fontFamily: "Quicksand",
fontSize: "15rem"
},
backButton: {
justifyContent: "center",
alignSelf: "center",
paddingVertical: 10,
flexDirection: "row",
flexWrap: 'nowrap',
position: 'relative',
width: '100%',
},
backIcon:{
position: 'absolute',
left: 10,
top: 10

},
userName: {
fontSize: 24,
color: "#000",
fontFamily: "Quicksand",
textAlign: "center"
},
});
