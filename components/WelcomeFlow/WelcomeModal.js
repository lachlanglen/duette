import React from 'react';
import { connect } from 'react-redux';
import { View, ScrollView, Text, Modal, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import buttonStyles from '../../styles/button';
import { handleLogin, handleSubscribe } from '../../services/utils';

const NewUserModal = (props) => {

  return (
    <Modal>
      <ScrollView
        contentContainerStyle={styles.container}>
        <Image
          source={require('../../assets/images/duette-logo-HD.png')}
          style={styles.logo} />
        <Text style={styles.titleText}>Welcome to Duette!</Text>
        <Text style={styles.subTitleText}>Connect with Facebook and make amazing split-screen music videos in seconds!</Text>
        <TouchableOpacity
          onPress={handleLogin}
          style={{
            ...buttonStyles.regularButton,
            marginTop: 30,
            width: '100%',
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
      </ScrollView>
    </Modal>
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
