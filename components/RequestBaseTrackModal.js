/* eslint-disable complexity */
import React, { useState, useEffect } from 'react';
import { SafeAreaView, KeyboardAvoidingView, Modal, Image, Text, View, Button, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { connect } from 'react-redux';
import Toast from 'react-native-simple-toast';
import * as Notifications from "expo-notifications";
import RequestForm from './RequestForm';
import buttonStyles from '../styles/button';
import axios from 'axios';
import { updateUser } from '../redux/user';

const RequestBaseTrackModal = (props) => {
  const {
    setShowRequestBaseTrackModal,
  } = props;

  // const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [composer, setComposer] = useState('');
  const [songKey, setSongKey] = useState('');
  const [notes, setNotes] = useState('');
  const [notifyMe, setNotifyMe] = useState(true);
  const [saving, setSaving] = useState(false);

  const experienceId = "@lachlan-glen-test/managedThenEject";

  const handleExit = () => {
    setSaving(false);
    setShowRequestBaseTrackModal(false);
  };

  const registerForPushNotificationsAsync = async () => {
    try {
      await Notifications.requestPermissionsAsync();
      const token = await Notifications.getExpoPushTokenAsync({
        experienceId,
      });
      const expoPushToken = token.data;
      console.log('expoPushToken: ', expoPushToken)
      if (props.user.expoPushToken !== expoPushToken) props.updateUser(props.user.id, { expoPushToken });
      handleSave();
    } catch (e) {
      console.log('error: ', e)
      handleSave();
    }
  };

  const handlePermissionsWarn = () => {
    setSaving(true);
    if (!props.user.expoPushToken) {
      Alert.alert(
        'Allow Notifications',
        `We need your permission in order to notify you when this Base Track has been recorded.`,
        [
          {
            text: "OK",
            onPress: registerForPushNotificationsAsync,
            style: 'cancel'
          },
        ],
        { cancelable: false }
      );
    } else {
      registerForPushNotificationsAsync();
    }
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      const body = {
        title,
        composer,
        key: songKey,
        notes: notes ? notes : null,
        userId: props.user.id,
        notifyUser: notifyMe,
      };
      await axios.post('https://duette.herokuapp.com/api/request', body);
      Alert.alert(
        'Success',
        `Your Base Track request has been saved! We'll let you know when someone records this Base Track.`,
        [
          {
            text: "OK",
            onPress: handleExit,
            style: 'cancel'
          },
        ],
        { cancelable: false }
      );
    } catch (e) {
      Alert.alert(
        'Oops',
        `We had a problem saving your Base Track request. Please try again later.`,
        [
          {
            text: "OK",
            onPress: handleExit,
            style: 'cancel'
          },
        ],
        { cancelable: false }
      );
    }
  };

  return (
    <View style={styles.container}>
      <Modal
        supportedOrientations={['portrait', 'landscape', 'landscape-right']}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS == "ios" ? "padding" : "height"}
        // style={styles.container}
        >
          <ScrollView>
            <RequestForm
              handleExit={handleExit}
              handleSave={handleSave}
              title={title}
              setTitle={setTitle}
              composer={composer}
              setComposer={setComposer}
              songKey={songKey}
              setSongKey={setSongKey}
              notes={notes}
              setNotes={setNotes}
              notifyMe={notifyMe}
              setNotifyMe={setNotifyMe}
              handlePermissionsWarn={handlePermissionsWarn}
              saving={saving}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View >
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    marginTop: 50,
    padding: 20,
    backgroundColor: '#ffffff',
  },
});

const mapState = ({ user }) => {
  return {
    user,
  }
};

const mapDispatch = dispatch => {
  return {
    updateUser: (userId, details) => dispatch(updateUser(userId, details))
  }
};

export default connect(mapState, mapDispatch)(RequestBaseTrackModal);
