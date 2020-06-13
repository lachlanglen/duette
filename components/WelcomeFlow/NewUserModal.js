import React from 'react';
import { connect } from 'react-redux';
import { View, ScrollView, Text, Modal, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import buttonStyles from '../../styles/button';
import { handleLogin, handleSubscribe } from '../../services/utils';

const NewUserModal = (props) => {

  const handlePurchase = () => {
    handleSubscribe(props.user.id);
  };

  return (
    <Modal>
      <View
        style={styles.container}>
        <Image
          source={require('../../assets/images/duette-logo-HD.png')}
          style={styles.logo} />
        <Text style={styles.titleText}>It looks like this is your first time!</Text>
        <Text style={styles.subTitleText}>Start your <Text style={{ fontWeight: 'bold' }}>1-week free trial</Text> and make amazing split-screen music videos in seconds!</Text>
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
          style={{
            ...buttonStyles.regularButton,
            marginTop: 30,
            width: '80%',
            height: 60,
            marginBottom: 0,
          }}>
          <Text style={{
            ...buttonStyles.regularButtonText,
            fontSize: 28,
          }}>Start free trial</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleLogin}
          style={{
            marginTop: 10,
          }}>
        </TouchableOpacity>
      </View>
    </Modal>
  )
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 35,
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

const mapState = ({ user }) => {
  return {
    user,
  }
};

export default connect(mapState)(NewUserModal);
