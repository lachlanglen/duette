import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { View, ScrollView, Text, Modal, StyleSheet, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import * as Device from 'expo-device';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
import buttonStyles from '../../styles/button';
import { handleLogin, handleSubscribe, handleRestore } from '../../services/utils';
import { updateTransactionProcessing } from '../../redux/transactionProcessing';

const SubscribeModal = (props) => {

  const [deviceType, setDeviceType] = useState(null);

  useEffect(() => {
    const getDeviceType = async () => {
      const type = await Device.getDeviceTypeAsync();
      setDeviceType(type);
    };
    getDeviceType();
  })

  const handlePurchase = () => {
    activateKeepAwake();
    props.setTransactionProcessing(true);
    handleSubscribe(props.user.id);
  };

  return (
    <Modal>
      <ScrollView>
        <View
          style={{
            ...styles.container,
            paddingHorizontal: deviceType === 2 ? 200 : 30,
          }}>
          <Image
            source={require('../../assets/images/duette-logo-HD.png')}
            style={styles.logo} />
          {
            props.user.hasLapsed ? (
              <View>
                <Text style={{
                  ...styles.titleText,
                  fontSize: 24,
                }}>It looks like your subscription has expired!</Text>
                <Text style={styles.subTitleText}>Resubscribe for just $1.99/month to make unlimited split-screen music videos in seconds!</Text>
                <TouchableOpacity
                  onPress={handlePurchase}
                  disabled={props.restoringProcessing || props.transactionProcessing}
                  style={{
                    ...buttonStyles.regularButton,
                    marginTop: 30,
                    width: '80%',
                    height: 60,
                    marginBottom: 0,
                    backgroundColor: props.transactionProcessing ? 'grey' : '#0047B9',
                  }}>
                  <View style={{ flexDirection: 'row' }}>
                    <Text style={{
                      ...buttonStyles.regularButtonText,
                      fontSize: 28,
                    }}>{props.transactionProcessing ? 'Please wait...' : 'Resubscribe'}</Text>
                    {
                      props.transactionProcessing &&
                      <ActivityIndicator size="large" color="#0047B9" />
                    }
                  </View>
                </TouchableOpacity>
              </View>
            ) : (
                <View>
                  <Text style={styles.titleText}>It looks like this is your first time!</Text>
                  <Text style={styles.subTitleText}>Start your <Text style={{ fontWeight: 'bold' }}>1-week free trial</Text> and make unlimited split-screen music videos in seconds!</Text>
                  <Text style={{
                    ...styles.subTitleText,
                    marginTop: 15,
                  }}>After your free trial ends, you will be charged $1.99/month.</Text>
                  <Text style={{
                    ...styles.subTitleText,
                    marginTop: 15,
                    fontWeight: 'bold',
                  }}>You can cancel anytime!</Text>
                  <TouchableOpacity
                    onPress={handlePurchase}
                    disabled={props.restoringProcessing || props.transactionProcessing}
                    style={{
                      ...buttonStyles.regularButton,
                      marginTop: 30,
                      width: '100%',
                      height: 60,
                      marginBottom: 0,
                      backgroundColor: props.transactionProcessing ? 'grey' : '#0047B9',
                    }}>
                    <View style={{ flexDirection: 'row' }}>
                      <Text style={{
                        ...buttonStyles.regularButtonText,
                        fontSize: 28,
                      }}>{props.transactionProcessing ? 'Please wait...' : 'Start free trial'}</Text>
                      {
                        props.transactionProcessing &&
                        <ActivityIndicator size="large" color="#0047B9" />
                      }
                    </View>
                  </TouchableOpacity>
                </View>
              )
          }
          <TouchableOpacity
            disabled={props.restoringProcessing || props.transactionProcessing}
            onPress={handleRestore}>
            <Text style={{ color: '#0047B9', marginTop: 14, fontSize: deviceType === 2 ? 16 : 14 }}>{props.restoringProcessing ? 'Restoring, please wait...' : 'Already subscribed? Restore Subscription'}</Text>
          </TouchableOpacity>
          <Text style={{ marginTop: 14, textAlign: 'center', fontSize: deviceType === 2 ? 15 : 14 }}>Have questions or concerns? Email us at support@duette.app - we'd love to hear from you!</Text>
        </View>
      </ScrollView>
    </Modal>
  )
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    backgroundColor: '#ffd12b'
  },
  titleText: {
    color: '#0047B9',
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 30,
    textAlign: 'center',
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

const mapState = ({ user, transactionProcessing, restoringProcessing }) => {
  return {
    user,
    transactionProcessing,
    restoringProcessing,
  }
};

const mapDispatch = dispatch => {
  return {
    setTransactionProcessing: (bool) => dispatch(updateTransactionProcessing(bool)),
  }
}

export default connect(mapState, mapDispatch)(SubscribeModal);
