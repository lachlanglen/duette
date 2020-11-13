import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Text, Clipboard, View, Button, Vibration, Platform, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import * as Notifications from "expo-notifications";
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import * as Permissions from 'expo-permissions';
import * as StoreReview from 'expo-store-review';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import UUIDGenerator from 'react-native-uuid-generator';
import { toggleRequestReview } from '../redux/requestReview';
import { deleteLocalFile } from '../services/utils';
import { updateUser } from '../redux/user';

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
    makePrivate,
    shouldShare,
  } = props;

  const navigation = useNavigation();

  let tempVidId;
  let userReference;
  let ws;
  let expoPushToken = null;

  useEffect(() => {
    activateKeepAwake();
    // createConnection();
    const handleAndroid = async () => {
      const result = await Notifications.setNotificationChannelAsync("duette", {
        name: "duette",
        priority: "max",
        sound: true,
        vibrate: [0, 250, 500, 250]
      });
    }
    if (Platform.OS === 'android') handleAndroid();
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
    Notifications.addNotificationResponseReceivedListener(async res => {
      if (Platform.OS === 'ios') {
        if (res.notification.request.content.data.type === 'base track') navigation.navigate('Duette')
        else if (res.notification.request.content.data.type === 'duette') {
          // check to see if review has been requested
          // if it has, just navigate
          // if it hasn't, update redux requestReview toggle to 'true' before navigating
          const reviewRequestTimeMillis = await SecureStore.getItemAsync('reviewRequestTimeMillis');
          if (!reviewRequestTimeMillis) props.toggleRequestReview(true);
          navigation.navigate('My Duettes');
        } else if (res.notification.request.content.data.type === 'baseTrackUsed') {
          navigation.navigate('Accompaniment');
        }
      } else if (Platform.OS === 'android') {
        if (res.notification.request.content.data.type === 'base track') navigation.navigate('Duette')
        else if (res.notification.request.content.data.type === 'duette') {
          // check to see if review has been requested
          // if it has, just navigate
          // if it hasn't, update redux requestReview toggle to 'true' before navigating
          const reviewRequestTimeMillis = await SecureStore.getItemAsync('reviewRequestTimeMillis');
          if (!reviewRequestTimeMillis) props.toggleRequestReview(true);
          navigation.navigate('My Duettes');
        };
      }
    });
    handlePost();
  }, []);

  // const createConnection = () => {
  //   ws = new WebSocket("wss://pi518guoyc.execute-api.us-east-2.amazonaws.com/test");
  //   ws.onopen = () => {
  //     console.log('Start Connection');
  //   };
  //   // ws.onmessage = e => {
  //   //   // const data = JSON.parse(e.data).data;
  //   //   // console.log('message: ', data)
  //   // };
  //   ws.onerror = e => {
  //     console.log('websocket error: ', e)
  //     // throw new Error('websocket error in SavingVideo:', e.message);
  //   };
  //   ws.onclose = e => {
  //     console.log('onclose', e.code, e.reason);
  //   };
  // };

  const createConnection = () => {
    console.log('in createConnection')
    ws = new WebSocket("wss://pi518guoyc.execute-api.us-east-2.amazonaws.com/test");
    ws.onopen = () => {
      console.log('Start Connection');
      if (type === 'duette') {
        const duetteKey = tempVidId;
        const accompanimentKey = props.selectedVideo.id;
        ws.send(JSON.stringify({
          type: 'duette',
          inputBucket: 'duette',
          outputBucket: 'duette',
          // platform: Platform.OS,
          accompanimentKey,
          accompanimentTitle: props.selectedVideo.title,
          accompanimentUser: props.selectedVideo.user,
          duetteKey,
          delay: (customOffset + (date2 - date1)) / 1000,
          baseTrackVolume: baseTrackVolume === 1 ? null : baseTrackVolume.toFixed(1),
          duetteVolume: duetteVolume === 1 ? null : duetteVolume.toFixed(1),
          userId: props.user.id,
          shouldShare,
          notificationToken: expoPushToken,
          email: updatedEmail ? updatedEmail : props.user.email,
          name: !props.user.name.includes('null') ? props.user.name.split(' ')[0] : '',
          sendEmails: props.user.sendEmails,
          // TODO: remove line below
          // test: true,
        }));
        deleteLocalFile(duetteUri);
        deleteLocalFile(baseTrackUri);
      } else {
        ws.send(JSON.stringify({
          type: 'base track',
          inputBucket: 'duette',
          outputBucket: 'duette',
          // platform: Platform.OS,
          key: tempVidId,
          title,
          composer,
          songKey,
          performer,
          notes,
          userReference,
          makePrivate,
          userId: props.user.id,
          notificationToken: expoPushToken,
          email: props.user.email,
          name: !props.user.name.includes('null') ? props.user.name.split(' ')[0] : '',
          sendEmails: props.user.sendEmails,
        }));
        deleteLocalFile(dataUri);
      };
      console.log('ws request sent!')
      requestReviewAndExit();
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
    console.log('permissions requested')
    try {
      const token = await Notifications.getExpoPushTokenAsync({
        experienceId,
      });
      expoPushToken = token.data;
      if (props.user.expoPushToken !== expoPushToken) props.updateUser(props.user.id, { expoPushToken })
      handleIdAlert();
    } catch (e) {
      console.log('error: ', e)
      handleIdAlert();
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

  const handleCopy = () => {
    Clipboard.setString(String(userReference));
    Alert.alert(
      "Copied!",
      `Your private Base Track ID has been copied to your clipboard. You can also access this ID at any time by searching for your Base Track and selecting the "Share" option.`,
      [
        {
          text: 'OK',
          onPress: () => createConnection(),
          style: 'cancel',
        },
      ],
      { cancelable: false }
    );
  }

  const handleIdAlert = () => {
    if (makePrivate) {
      Alert.alert(
        "Base Track ID",
        `Your private Base Track ID is ${userReference}.`,
        [
          {
            text: 'Copy ID',
            onPress: () => handleCopy(),
            style: 'cancel'
          },
          { text: 'Exit', onPress: () => createConnection() }
        ],
        { cancelable: false }
      );
    } else {
      createConnection();
    }
  };

  const requestReviewAndExit = async () => {
    const reviewRequestTimeMillis = await SecureStore.getItemAsync('reviewRequestTimeMillis');
    if (!reviewRequestTimeMillis) {
      const available = await StoreReview.isAvailableAsync();
      console.log('available: ', available);
      if (available) {
        // request review
        await StoreReview.requestReview();
        console.log('review requested!')
        // set on secure store
        const currentTime = Date.now().toString();
        await SecureStore.setItemAsync('reviewRequestTimeMillis', currentTime);
      }
    }
    deactivateKeepAwake();
    ws.close();
    handleExit();
  }

  // const handleSendToWebSocket = async () => {
  //   if (ws.readyState === 2 || ws.readyState === 3) {
  //     refreshConnection();
  //   } else {
  //     if (type === 'duette') {
  //       const duetteKey = tempVidId;
  //       const accompanimentKey = props.selectedVideo.id;
  //       ws.send(JSON.stringify({
  //         type: 'duette',
  //         inputBucket: 'duette',
  //         outputBucket: 'duette',
  //         // platform: Platform.OS,
  //         accompanimentKey,
  //         accompanimentTitle: props.selectedVideo.title,
  //         accompanimentUser: props.selectedVideo.user,
  //         duetteKey,
  //         delay: (customOffset + (date2 - date1)) / 1000,
  //         baseTrackVolume: baseTrackVolume === 1 ? null : baseTrackVolume.toFixed(1),
  //         duetteVolume: duetteVolume === 1 ? null : duetteVolume.toFixed(1),
  //         userId: props.user.id,
  //         notificationToken: expoPushToken,
  //         email: updatedEmail ? updatedEmail : props.user.email,
  //         name: props.user.name.split(' ')[0],
  //         sendEmails: props.user.sendEmails,
  //         // TODO: remove line below
  //         test: true,
  //       }));
  //       deleteLocalFile(duetteUri);
  //       deleteLocalFile(baseTrackUri);
  //     } else {
  //       ws.send(JSON.stringify({
  //         type: 'base track',
  //         inputBucket: 'duette',
  //         outputBucket: 'duette',
  //         // platform: Platform.OS,
  //         key: tempVidId,
  //         title,
  //         composer,
  //         songKey,
  //         performer,
  //         notes,
  //         userReference,
  //         makePrivate,
  //         userId: props.user.id,
  //         notificationToken: expoPushToken,
  //         email: props.user.email,
  //         name: props.user.name.split(' ')[0],
  //         sendEmails: props.user.sendEmails,
  //       }));
  //       deleteLocalFile(dataUri);
  //     };
  //     requestReviewAndExit();
  //   };
  // };

  const handleThrowError = err => {
    if (dataUri) deleteLocalFile(dataUri);
    if (baseTrackUri) deleteLocalFile(baseTrackUri);
    if (duetteUri) deleteLocalFile(duetteUri);
    handleExit();
    throw new Error('error uploading video in SavingVideo: ', err)
  }

  const handlePost = async () => {
    const { randomId } = (await axios.get('https://duette.herokuapp.com/api/video/generateRandomId')).data;
    console.log('randomId: ', randomId);
    userReference = randomId;
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
      <Text style={styles.importantTextRed}>Please do not leave this screen, or your video will not be saved!</Text>
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
    updateUser: (userId, details) => dispatch(updateUser(userId, details))
  }
};

export default connect(mapState, mapDispatch)(SavingVideo);
