import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Platform, Linking, View, ScrollView, Text, Modal, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import * as Device from 'expo-device';
import buttonStyles from '../../styles/button';
import * as SecureStore from 'expo-secure-store';
import { handleFacebookLogin, handleAppleLogin, handleSubscribe } from '../../services/utils';
import appleAuth, {
  AppleButton,
  AppleAuthRequestOperation,
  AppleAuthRequestScope,
} from '@invertase/react-native-apple-authentication';
import eula from '../../constants/EULA';

const NewUserModal = (props) => {

  const [deviceType, setDeviceType] = useState(null);
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    const getDeviceType = async () => {
      const type = await Device.getDeviceTypeAsync();
      setDeviceType(type);
    };
    getDeviceType();
  });

  const handleShowTerms = async () => {
    const agreed = await SecureStore.getItemAsync('agreedToTerms');
    if (agreed) {
      handleAppleLogin();
    } else {
      setShowTerms(true);
    }
  }

  const handleAgreeToTerms = async () => {
    await SecureStore.setItemAsync('agreedToTerms', Date.now().toString())
    handleAppleLogin();
  }

  return (
    <Modal>
      {
        showTerms ? (
          <View style={{
            ...styles.container,
            // paddingTop: 50,
          }}>
            <ScrollView
            // contentContainerStyle={styles.container}
            >
              <View>
                <Text style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  textAlign: 'center',
                  alignSelf: 'center',
                  paddingVertical: 30,
                }}>In order to proceed, please read the following End User License Agreement and select "I Agree" at the end.</Text>
                <Text style={{ paddingBottom: 30 }}>{eula}</Text>
                <TouchableOpacity
                  onPress={handleAgreeToTerms}
                  style={{
                    ...buttonStyles.regularButton,
                    width: deviceType === 2 ? '50%' : '100%',
                    marginBottom: 15,
                  }}>
                  <Text style={buttonStyles.regularButtonText}>I Agree</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowTerms(false)}
                  style={{
                    ...buttonStyles.regularButton,
                    width: deviceType === 2 ? '50%' : '100%',
                    backgroundColor: 'tomato'
                  }}>
                  <Text style={buttonStyles.regularButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        ) : (
            <ScrollView
              contentContainerStyle={styles.container}>
              <Image
                source={require('../../assets/images/duette-logo-HD.png')}
                style={styles.logo} />
              <Text style={styles.titleText}>Welcome to Duette!</Text>
              <Text style={{
                ...styles.subTitleText,
                paddingHorizontal: deviceType === 2 ? 150 : 0,
              }}>{`Continue with ${Platform.OS === 'ios' ? 'Apple' : 'Facebook'} and start making amazing split-screen music videos for free!`}</Text>
              {/* <TouchableOpacity
          onPress={handleFacebookLogin}
          style={{
            marginTop: 10,
          }}>
        </TouchableOpacity> */}
              {
                Platform.OS === 'ios' ? (
                  <AppleButton
                    buttonStyle={AppleButton.Style.BLACK}
                    buttonType={AppleButton.Type.CONTINUE}
                    onPress={handleShowTerms}
                    style={{
                      ...styles.appleButton,
                      width: deviceType === 2 ? '50%' : '100%',
                      marginTop: 30,
                    }}
                  />
                ) : (
                    <TouchableOpacity
                      onPress={handleFacebookLogin}
                      style={{
                        ...buttonStyles.regularButton,
                        marginTop: 30,
                        width: deviceType === 2 ? '50%' : '90%',
                        height: Platform.OS === 'android' ? 85 : 60,
                        marginBottom: 0,
                      }}>
                      <Text style={{
                        ...buttonStyles.regularButtonText,
                        fontSize: 28,
                        fontWeight: 'normal',
                      }}>Continue with Facebook</Text>
                    </TouchableOpacity>
                  )
              }
              {/* <Text
                style={{
                  textAlign: 'center',
                  marginTop: 10,
                }}>{`By clicking 'Continue with ${Platform.OS === 'ios' ? 'Apple' : 'Facebook'}', you confirm that you have read and agreed to Duette's `}<Text onPress={() => Linking.openURL('http://duette.app/terms-of-use')} style={{ color: '#0047B9' }}>Terms of Use</Text> and <Text onPress={() => Linking.openURL('http://duette.app/privacy-policy')} style={{ color: '#0047B9' }}>Privacy Policy.</Text></Text> */}
            </ScrollView>
          )
      }
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
