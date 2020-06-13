import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Text, View, Button, Vibration, Platform, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import * as Notifications from "expo-notifications";
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import * as Permissions from 'expo-permissions';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import UUIDGenerator from 'react-native-uuid-generator';
import { toggleRequestReview } from '../redux/requestReview';
import { deleteLocalFile } from '../services/utils';

const experienceId = "@lachlan-glen-test/managedThenEject";

const SavingVideo = (props) => {

  const {
    dataUri,
    duetteUri,
    baseTrackUri,
    title,
    composer,
    songKey,
    performer,
    notes,
    handleExit,
    type,
    customOffset,
    playDelay,
    baseTrackVolume,
    duetteVolume,
    date1,
    date2,
    updatedEmail,
  } = props;

  const navigation = useNavigation();

  let tempVidId;
  let ws;
  let expoPushToken = null;

  useEffect(() => {
    activateKeepAwake();
    createConnection();
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
    Notifications.addNotificationResponseReceivedListener(async res => {
      if (res.notification.request.content.data.body.type === 'base track') navigation.navigate('Duette')
      else if (res.notification.request.content.data.body.type === 'duette') {
        // check to see if review has been requested
        // if it has, just navigate
        // if it hasn't, update redux requestReview toggle to 'true' before navigating
        const reviewRequestTimeMillis = await SecureStore.getItemAsync('reviewRequestTimeMillis');
        if (!reviewRequestTimeMillis) props.toggleRequestReview(true);
        navigation.navigate('My Duettes');
      };
    });
    handlePost();
  }, []);

  const createConnection = () => {
    ws = new WebSocket("wss://pi518guoyc.execute-api.us-east-2.amazonaws.com/test");
    ws.onopen = () => {
      console.log('Start Connection');
    };
    // ws.onmessage = e => {
    //   // const data = JSON.parse(e.data).data;
    //   // console.log('message: ', data)
    // };
    ws.onerror = e => {
      console.log('websocket error: ', e)
      // throw new Error('websocket error in SavingVideo:', e.message);
    };
    ws.onclose = e => {
      console.log('onclose', e.code, e.reason);
    };
  };

  const registerForPushNotificationsAsync = async () => {
    await Notifications.requestPermissionsAsync();
    try {
      const token = await Notifications.getExpoPushTokenAsync({
        experienceId,
      });
      expoPushToken = token.data;
      handleSendToWebsocket();
    } catch (e) {
      handleSendToWebsocket();
    }
  };

  // const registerForPushNotificationsAsync = async () => {
  //   const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
  //   let finalStatus = existingStatus;
  //   if (existingStatus !== 'granted') {
  //     const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
  //     finalStatus = status;
  //   }
  //   if (finalStatus !== 'granted') {
  //     console.log('Failed to get push token for push notification!');
  //     handleSendToWebsocket();
  //   }
  //   console.log('getExpoPushTokenAsync: ', Notifications.getExpoPushTokenAsync)
  //   try {
  //     const token = await Notifications.getExpoPushTokenAsync();
  //     expoPushToken = token;
  //     handleSendToWebsocket();
  //   } catch (e) {
  //     console.log('error: ', e)
  //   }
  // };

  const handleSendToWebsocket = () => {
    if (ws.readyState === 2 || ws.readyState === 3) createConnection();
    if (type === 'duette') {
      const duetteKey = tempVidId;
      const accompanimentKey = props.selectedVideo.id;
      ws.send(JSON.stringify({
        type: 'duette',
        inputBucket: 'duette',
        outputBucket: 'duette',
        accompanimentKey,
        duetteKey,
        delay: (customOffset + (date2 - date1)) / 1000,
        baseTrackVolume: baseTrackVolume === 1 ? null : baseTrackVolume.toFixed(1),
        duetteVolume: duetteVolume === 1 ? null : duetteVolume.toFixed(1),
        userId: props.user.id,
        notificationToken: expoPushToken,
        email: updatedEmail ? updatedEmail : props.user.email,
        name: props.user.name.split(' ')[0],
        sendEmails: props.user.sendEmails,
      }));
      deleteLocalFile(duetteUri);
      deleteLocalFile(baseTrackUri);
    } else {
      ws.send(JSON.stringify({
        type: 'base track',
        inputBucket: 'duette',
        outputBucket: 'duette',
        key: tempVidId,
        title,
        composer,
        songKey,
        performer,
        notes,
        userId: props.user.id,
        notificationToken: expoPushToken,
        email: props.user.email,
        name: props.user.name.split(' ')[0],
        sendEmails: props.user.sendEmails,
      }));
      deleteLocalFile(dataUri);
    };
    deactivateKeepAwake();
    handleExit();
  };

  const handleThrowError = err => {
    throw new Error('error uploading video in SavingVideo: ', err)
  }

  const handlePost = async () => {
    const uuid = await UUIDGenerator.getRandomUUID();
    tempVidId = uuid.toLowerCase();
    let uriParts = type === 'base track' ? dataUri.split('.') : duetteUri.split('.');
    let fileType = uriParts[uriParts.length - 1];
    const vidFile = {
      uri: type === 'base track' ? dataUri : duetteUri,
      name: `${tempVidId}.mov`,
      type: `video/${fileType}`
    }
    try {
      const signedUrl = (await axios.get(`https://duette.herokuapp.com/api/aws/getSignedUrl/${tempVidId}.mov`)).data;
      const awsOptions = {
        method: 'PUT',
        body: vidFile,
        headers: {
          Accept: 'application/json',
          'Content-Type': `video/${fileType}`,
        },
      };
      await fetch(signedUrl, awsOptions);
      Alert.alert(
        "We're saving your video!",
        `We'll send you a notification when your ${type === 'base track' ? type : 'Duette'} has finished processing.`,
        [
          { text: 'OK', onPress: () => registerForPushNotificationsAsync() },
        ],
        { cancelable: false }
      );
    } catch (e) {
      Alert.alert(
        "We had a problem 😿",
        'Unfortunately we were not able to upload your video. We apologize for the inconvenience! Please try again later.',
        [
          { text: 'OK', onPress: (e) => handleThrowError(e) },
        ],
        { cancelable: false }
      );
    }
  };

  return (
    <View
      style={styles.container}>
      <Text style={styles.titleTextBlue}>Uploading Video...</Text>
      <Text style={styles.importantTextRed}>Important:</Text>
      <Text style={styles.importantTextRed}>Please do not leave this screen!</Text>
      <ActivityIndicator size="large" color="#0047B9" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  titleTextBlue: {
    fontSize: 28,
    fontWeight: 'bold',
    alignSelf: 'center',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
    marginHorizontal: 10,
    color: '#0047B9'
  },
  importantTextRed: {
    fontSize: 20,
    fontWeight: 'bold',
    alignSelf: 'center',
    textAlign: 'center',
    marginHorizontal: 10,
    marginBottom: 20,
    color: 'red'
  },
  timeRemainingText: {
    marginVertical: 20,
    fontSize: 15,
  }
});

const mapState = ({ user, selectedVideo }) => {
  return {
    user,
    selectedVideo,
  }
};

const mapDispatch = dispatch => {
  return {
    toggleRequestReview: bool => dispatch(toggleRequestReview(bool)),
  }
};

export default connect(mapState, mapDispatch)(SavingVideo);
