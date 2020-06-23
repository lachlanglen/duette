/* eslint-disable max-statements */
/* eslint-disable complexity */
import React, { useState, useEffect } from 'react';
import { Button, Image, View, Dimensions, StyleSheet, TouchableOpacity, Text, Platform, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { connect } from 'react-redux'
import * as ScreenOrientation from 'expo-screen-orientation';
import * as Device from 'expo-device';
import { Camera } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import * as Permissions from 'expo-permissions';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
import DetailsModal from '../components/DetailsModal';
import { fetchVideos } from '../redux/videos';
import UserInfoMenu from '../components/UserInfoMenu';
// import RecordAccompanimentAndroid from '../components/android/RecordAccompaniment';
import RecordAccompanimentIos from '../components/ios/RecordAccompaniment';
// import PreviewAccompanimentAndroid from '../components/android/PreviewAccompaniment';
import PreviewAccompanimentIos from '../components/ios/PreviewAccompaniment';
import buttonStyles from '../styles/button';
import LoadingSpinner from '../components/LoadingSpinner';
import { toggleUserInfo } from '../redux/userInfo';
import WelcomeFlow from '../components/WelcomeFlow/WelcomeFlow';
import { deleteLocalFile } from '../services/utils';
import { toggleRequestReview } from '../redux/requestReview';
import { updateTransactionProcessing } from '../redux/transactionProcessing';

let timerIntervalId;
let countdownIntervalId;

const AccompanimentScreen = (props) => {

  const [hasAudioPermission, setHasAudioPermission] = useState(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [record, setRecord] = useState(false);
  const [recording, setRecording] = useState(false);
  const [dataUri, setDataUri] = useState('');
  const [cameraRef, setCameraRef] = useState(null);
  const [preview, setPreview] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [screenOrientation, setScreenOrientation] = useState('');
  const [secs, setSecs] = useState(540);  // start with 9 mins remaining
  const [countdown, setCountdown] = useState(3);  // start with 3 secs remaining
  const [countdownActive, setCountdownActive] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [deviceType, setDeviceType] = useState(null);

  const screenWidth = Math.round(Dimensions.get('window').width);
  const screenHeight = Math.round(Dimensions.get('window').height);

  useEffect(() => {
    const detectOrientation = () => {
      if (screenWidth > screenHeight) setScreenOrientation('LANDSCAPE');
      if (screenWidth < screenHeight) setScreenOrientation('PORTRAIT');
      ScreenOrientation.addOrientationChangeListener(info => {
        if (info.orientationInfo.orientation === 'UNKNOWN') {
          if (screenWidth > screenHeight) setScreenOrientation('LANDSCAPE');
          if (screenWidth < screenHeight) setScreenOrientation('PORTRAIT');
        } else {
          if (info.orientationInfo.orientation === 1 || info.orientationInfo.orientation === 2) setScreenOrientation('PORTRAIT');
          if (info.orientationInfo.orientation === 3 || info.orientationInfo.orientation === 4) setScreenOrientation('LANDSCAPE');
        }
      })
    };
    const getDeviceType = async () => {
      const type = await Device.getDeviceTypeAsync();
      setDeviceType(type);
    };
    detectOrientation();
    getDeviceType();
  }, []);

  const handleRefresh = () => {
    if (recording) cameraRef.stopRecording();
    if (dataUri) deleteLocalFile(dataUri);
    clearInterval(timerIntervalId);
    clearInterval(countdownIntervalId);
    setCountdownActive(false);
    setTimerActive(false);
    setRecording(false);
    setDataUri('');
    setShowDetailsModal(false);
    setPreview(false);
    setSecs(540);
    setCountdown(3);
  };

  const startRecording = async () => {
    try {
      setRecording(true);
      startTimer();
      const vid = await cameraRef.recordAsync({ quality: Camera.Constants.VideoQuality['720p'] });
      setDataUri(vid.uri)
    } catch (e) {
      Alert.alert(
        `Oops!`,
        "We encountered a problem. Please press 'OK' to try again.",
        [
          { text: 'OK', onPress: () => handleRefresh() },
        ],
        { cancelable: false }
      )
      throw new Error('error in recordAsync: ', e);
    }
  };

  const stopRecording = () => {
    cameraRef.stopRecording();
    setRecording(false);
    setPreview(true);
    setSecs(540);
  };

  const toggleRecord = () => {
    if (recording) {
      if (secs > 530) {
        Alert.alert(
          'Too short',
          "Video must be at least 10 seconds long",
          [
            { text: 'OK', onPress: () => handleRefresh() },
          ],
          { cancelable: false }
        );
      } else {
        clearInterval(timerIntervalId);
        deactivateKeepAwake();
        stopRecording();
      }
    } else {
      activateKeepAwake();
      setCountdownActive(false);
      startRecording();
    }
  };

  const handleRecordExit = () => {
    handleRefresh();
    setRecord(false);
  };

  const handleSave = () => {
    Alert.alert(
      'Agree to Terms',
      "By saving this base track, you are making it available to any user on the Duette app. You can delete it at any time by searching for the video and selecting 'Delete'. You are also confirming that this video does not contain explicit content. Do you wish to continue?",
      [
        { text: 'Yes, I agree', onPress: () => setShowDetailsModal(true) },
        { text: 'Cancel', onPress: () => { } },
      ],
      { cancelable: false }
    );
  };

  const startTimer = () => {
    setTimerActive(true);
    timerIntervalId = setInterval(() => {
      setSecs(secs => secs - 1)
    }, 1000)
  };

  useEffect(() => {
    if (timerActive && secs === 0) {
      clearInterval(timerIntervalId);
      setTimerActive(false);
      toggleRecord();
    }
  }, [timerActive, secs]);

  const startCountdown = () => {
    setCountdownActive(true);
    countdownIntervalId = setInterval(() => {
      setCountdown(countdown => countdown - 1)
    }, 1000)
  };

  useEffect(() => {
    if (countdownActive && countdown === 0) {
      clearInterval(countdownIntervalId);
      setCountdownActive(false);
      setCountdown(3);
      toggleRecord();
    }
  }, [countdownActive, countdown]);

  const handleHideUserInfo = () => {
    props.toggleUserInfo(false);
  };

  const handleRecordBaseTrack = async () => {
    const freeDiskStorage = await FileSystem.getFreeDiskStorageAsync();
    const freeDiskStorageMb = freeDiskStorage / 1000000;
    if (freeDiskStorageMb < 50) {
      Alert.alert(
        'Not enough space available',
        `You don't have enough free space available on your device to record a base track. Please clear up approx. ${Math.ceil(50 - freeDiskStorageMb)}MB of space and try again!`,
        [
          { text: 'OK', onPress: () => { } },
        ],
        { cancelable: false }
      );
    } else {
      getPermissionsAndRecord();
    }
  };

  const getPermissionsAndRecord = async () => {
    const perms = await Permissions.getAsync(Permissions.CAMERA, Permissions.AUDIO_RECORDING);
    if (perms.permissions.audioRecording.granted) {
      setHasAudioPermission(true);
    } else {
      const { status } = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
      if (status === 'granted') {
        setHasAudioPermission(true);
      } else {
        Alert.alert(
          `Oops...`,
          'Duette needs audio permissions in order to function correctly. Please enable audio permissions for Duette in your device settings.',
          [
            { text: 'OK', onPress: () => { } },
          ],
          { cancelable: false }
        )
        throw new Error('Audio permissions not granted');
      }
    }
    if (perms.permissions.camera.granted) {
      setHasCameraPermission(true);
      setRecord(true);
    } else {
      const { status } = await Permissions.askAsync(Permissions.CAMERA);
      if (status === 'granted') {
        setHasCameraPermission(true);
        setRecord(true);
      } else {
        Alert.alert(
          `Oops...`,
          'Duette needs camera permissions in order to function correctly. Please enable camera permissions for Duette in your device settings.',
          [
            { text: 'OK', onPress: () => handleRefresh() },
          ],
          { cancelable: false }
        )
        throw new Error('Camera permissions not granted');
      }
    }
  };

  return (
    // user does not have an active subscription
    !props.user.isSubscribed ? (
      !props.dataLoaded ? (
        <LoadingSpinner />
      ) : (
          <WelcomeFlow />
        )
    ) : (
        // ==> user has an active subscription
        !preview ? (
          // record video:
          <View
            style={styles.container}>
            {
              record ? (
                // user has clicked 'Record!' button
                // Platform.OS === 'android' ? (
                //   <RecordAccompanimentAndroid
                //     setCameraRef={setCameraRef}
                //     handleRecordExit={handleRecordExit}
                //     recording={recording}
                //     toggleRecord={toggleRecord}
                //     screenOrientation={screenOrientation}
                //     startCountdown={startCountdown}
                //     secs={secs}
                //     setSecs={setSecs}
                //     countdown={countdown}
                //     countdownActive={countdownActive}
                //     deviceType={deviceType}
                //   />
                // ) : (
                <RecordAccompanimentIos
                  setCameraRef={setCameraRef}
                  handleRecordExit={handleRecordExit}
                  recording={recording}
                  startCountdown={startCountdown}
                  secs={secs}
                  setSecs={setSecs}
                  countdown={countdown}
                  countdownActive={countdownActive}
                  toggleRecord={toggleRecord}
                  deviceType={deviceType}
                />
                // )
              ) : (
                  props.transactionProcessing ? (
                    <LoadingSpinner />
                  ) : (
                      // landing page ('Record!' button not clicked)
                      <View
                        style={styles.landingPage}>
                        <View
                          onTouchStart={props.displayUserInfo ? handleHideUserInfo : () => { }}
                          style={{
                            ...styles.logoAndButtonsContainer,
                            height: screenHeight * 0.9,
                            marginTop: screenHeight < 800 ? 40 : 0,
                            justifyContent: screenHeight < 800 ? 'flex-start' : 'center',
                            // justifyContent: deviceType === 2 ? 'center' : 'flex-start',
                          }}>
                          <Image
                            source={require('../assets/images/duette-logo-HD.png')}
                            style={styles.logo} />
                          <View>
                            <TouchableOpacity
                              style={{
                                ...buttonStyles.regularButton,
                                width: deviceType === 2 ? screenWidth * 0.5 : '75%',
                                height: 60,
                              }}
                              onPress={handleRecordBaseTrack}
                            >
                              <Text style={{
                                ...buttonStyles.regularButtonText,
                                fontSize: deviceType === 2 ? 30 : 22,
                              }}>Record a base track</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={{
                                ...buttonStyles.regularButton,
                                width: deviceType === 2 ? screenWidth * 0.5 : '60%',
                                height: 60,
                              }}
                              onPress={() => props.navigation.navigate('Duette')}
                            >
                              <Text style={{
                                ...buttonStyles.regularButtonText,
                                fontSize: deviceType === 2 ? 30 : 22,
                              }}>Record a Duette</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                        {
                          props.displayUserInfo &&
                          <UserInfoMenu />
                        }
                      </View>
                    )
                )
            }
          </View >
        ) : (
            // preview accompaniment:
            showDetailsModal ? (
              // add accompaniment details
              <DetailsModal
                setPreview={setPreview}
                setRecord={setRecord}
                setShowDetailsModal={setShowDetailsModal}
                dataUri={dataUri} />
            ) : (
                // preview accompaniment
                // Platform.OS === 'android' ? (
                //   <PreviewAccompanimentAndroid
                //     dataUri={dataUri}
                //     handleSave={handleSave}
                //     handleRefresh={handleRefresh}
                //     screenOrientation={screenOrientation}
                //   />
                // ) : (
                <PreviewAccompanimentIos
                  dataUri={dataUri}
                  handleSave={handleSave}
                  handleRefresh={handleRefresh}
                  deviceType={deviceType}
                />
                // )
              )
          )
      )
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  landingPage: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  logoAndButtonsContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 250,
    height: 200,
    marginBottom: 30,
  }
})

const mapState = ({ user, displayUserInfo, dataLoaded, transactionProcessing }) => {
  return {
    user,
    displayUserInfo,
    dataLoaded,
    transactionProcessing,
  }
};

const mapDispatch = dispatch => {
  return {
    fetchVideos: () => dispatch(fetchVideos()),
    toggleUserInfo: bool => dispatch(toggleUserInfo(bool)),
    toggleRequestReview: bool => dispatch(toggleRequestReview(bool)),
    updateTransactionProcessing: bool => dispatch(updateTransactionProcessing(bool)),
  }
};

export default connect(mapState, mapDispatch)(AccompanimentScreen);

// export default HomeScreen;

