import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Linking, View, ScrollView, Text, Modal, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import * as Device from 'expo-device';
import buttonStyles from '../../styles/button';
import { handleLogin, handleSubscribe } from '../../services/utils';

const NewUserModal = (props) => {

  const [deviceType, setDeviceType] = useState(null);

  useEffect(() => {
    const getDeviceType = async () => {
      const type = await Device.getDeviceTypeAsync();
      setDeviceType(type);
    };
    getDeviceType();
  })

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
        }}>Connect with Facebook and make amazing split-screen music videos in seconds!</Text>
        <TouchableOpacity
          onPress={handleLogin}
          style={{
            ...buttonStyles.regularButton,
            marginTop: 30,
            width: deviceType === 2 ? '50%' : '100%',
            height: 60,
            marginBottom: 0,
          }}>
          <Text style={{
            ...buttonStyles.regularButtonText,
            fontSize: 28,
          }}>Connect with Facebook</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleLogin}
          style={{
            marginTop: 10,
          }}>
        </TouchableOpacity>
        <Text
          style={{
            textAlign: 'center',
            marginTop: 10
          }}>By clicking 'Connect with Facebook', you confirm that you have read and agreed to Duette's <Text onPress={() => Linking.openURL('http://duette.app/terms-of-use')} style={{ color: '#0047B9' }}>Terms of Use</Text> and <Text onPress={() => Linking.openURL('http://duette.app/privacy-policy')} style={{ color: '#0047B9' }}>Privacy Policy.</Text></Text>
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
  }
});

const mapState = ({ user }) => {
  return {
    user,
  }
};

export default connect(mapState)(NewUserModal);
