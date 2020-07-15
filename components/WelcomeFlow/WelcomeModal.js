import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Platform, Linking, View, ScrollView, Text, Modal, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import * as Device from 'expo-device';
import buttonStyles from '../../styles/button';
import { handleFacebookLogin, handleAppleLogin, handleSubscribe } from '../../services/utils';
import appleAuth, {
  AppleButton,
  AppleAuthRequestOperation,
  AppleAuthRequestScope,
} from '@invertase/react-native-apple-authentication';

const NewUserModal = (props) => {

  const [deviceType, setDeviceType] = useState(null);

  useEffect(() => {
    const getDeviceType = async () => {
      const type = await Device.getDeviceTypeAsync();
      setDeviceType(type);
    };
    getDeviceType();
  });

  return (
    <Modal>
      <ScrollView
        contentContainerStyle={styles.container}>
        <Image
          source={require('../../assets/images/duette-logo-HD.png')}
          style={styles.logo} />
        <Text style={styles.titleText}>Welcome to Duette!</Text>
        <Text style={{
          ...styles.subTitleText,
          paddingHorizontal: deviceType === 2 ? 150 : 0,
        }}>Continue with Apple and start making amazing split-screen music videos for free!</Text>
        {/* <TouchableOpacity
          onPress={handleFacebookLogin}
          style={{
            ...buttonStyles.regularButton,
            marginTop: 30,
            width: deviceType === 2 ? '50%' : '100%',
            height: Platform.OS === 'android' ? 85 : 60,
            marginBottom: 0,
          }}>
          <Text style={{
            ...buttonStyles.regularButtonText,
            fontSize: 28,
            fontWeight: 'normal',
          }}>Connect with Facebook</Text>
        </TouchableOpacity> */}
        {/* <TouchableOpacity
          onPress={handleFacebookLogin}
          style={{
            marginTop: 10,
          }}>
        </TouchableOpacity> */}
        {
          Platform.OS === 'ios' &&
          <AppleButton
            buttonStyle={AppleButton.Style.BLACK}
            buttonType={AppleButton.Type.CONTINUE}
            onPress={handleAppleLogin}
            style={{
              ...styles.appleButton,
              width: deviceType === 2 ? '50%' : '100%',
            }}
          />
        }
        <Text
          style={{
            textAlign: 'center',
            marginTop: 10,
          }}>By clicking 'Continue with Apple', you confirm that you have read and agreed to Duette's <Text onPress={() => Linking.openURL('http://duette.app/terms-of-use')} style={{ color: '#0047B9' }}>Terms of Use</Text> and <Text onPress={() => Linking.openURL('http://duette.app/privacy-policy')} style={{ color: '#0047B9' }}>Privacy Policy.</Text></Text>
      </ScrollView>
    </Modal >
  )
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#ffd12b'
  },
  titleText: {
    color: '#0047B9',
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 30,
  },
  subTitleText: {
    color: 'black',
    fontSize: 22,
    // fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 30,
  },
  logo: {
    width: 250,
    height: 100,
    // marginTop: 50,
    // marginBottom: 30,
  },
  appleButton: {
    height: 60,
    marginHorizontal: 10,
    marginVertical: 20
  },
});

const mapState = ({ user }) => {
  return {
    user,
  }
};

export default connect(mapState)(NewUserModal);
