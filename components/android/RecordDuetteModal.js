/* eslint-disable complexity */
import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { View, Modal, StyleSheet, Dimensions, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import * as Device from 'expo-device';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
import ReviewDuette from '../ReviewDuette';
import RecordDuettePortrait from './RecordDuettePortrait';
import RecordDuetteLandscape from './RecordDuetteLandscape';
import { clearVideo } from '../../redux/singleVideo';

let countdownIntervalId;
let cancel;

const RecordDuetteModal = (props) => {

  const {
    setShowRecordDuetteModal,
    baseTrackUri,
    setSearchText,
    screenOrientation,
  } = props;

  let screenWidth = Math.floor(Dimensions.get('window').width);
  let screenHeight = Math.floor(Dimensions.get('window').height);

  const [recording, setRecording] = useState(false);
  const [duetteUri, setDuetteUri] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [vidLoaded, setVidLoaded] = useState(false);
  const [vidDoneBuffering, setVidDoneBuffering] = useState(false);
  const [playDelay, setPlayDelay] = useState(0);
  const [displayedNotes, setDisplayedNotes] = useState(false);
  const [countdown, setCountdown] = useState(3);  // start with 3 secs remaining
  const [countdownActive, setCountdownActive] = useState(false);
  const [deviceType, setDeviceType] = useState(null);
  const [cameraRef, setCameraRef] = useState(null);
  const [hardRefresh, setHardRefresh] = useState(false);

  const vidRef = useRef(null);

  let time1;
  let time2;
  let time3;

  useEffect(() => {
    const getDeviceType = async () => {
      const type = await Device.getDeviceTypeAsync();
      setDeviceType(type);
    };
    getDeviceType();
  }, []);

  if (props.selectedVideo.notes && !displayedNotes && vidLoaded && vidDoneBuffering) {
    Alert.alert(
      `Notes from ${props.selectedVideo.performer.split(' ')[0]}`,
      props.selectedVideo.notes,
      [
        { text: 'OK', onPress: () => setDisplayedNotes(true) },
      ],
      { cancelable: false }
    );
  }

  const record = async () => {
    if (duetteUri) setDuetteUri('');
    try {
      time1 = Date.now();
      const vid = await cameraRef.recordAsync({ quality: Camera.Constants.VideoQuality['720p'] });
      setDuetteUri(vid.uri);
      if (!cancel) {
        setShowPreviewModal(true);
      } else {
        cancel = undefined;
      }
    } catch (e) {
      throw new Error('error starting recording: ', e);
    }
  };

  const play = async () => {
    try {
      time2 = Date.now();
      await vidRef.current.playFromPositionAsync(time2 - time1, { toleranceMillisBefore: 0, toleranceMillisAfter: 0 });
      time3 = Date.now();
      setPlayDelay(time3 - time2);
    } catch (e) {
      throw new Error('error playing video: ', e);
    }
  };

  const toggleRecord = async () => {
    if (recording) {
      deactivateKeepAwake();
      setRecording(false);
      cameraRef.stopRecording();
    } else {
      activateKeepAwake();
      setRecording(true);
      record();
      play();
    }
  };

  const handleCancel = async () => {
    try {
      // deleteLocalFile(baseTrackUri);
      setDuetteUri('');
      clearInterval(countdownIntervalId);
      setCountdown(3);
      setCountdownActive(false);
      cancel = true;
      cameraRef.stopRecording();
      setRecording(false);
      props.clearVideo();
      await vidRef.current.unloadAsync();
      setShowRecordDuetteModal(false);
    } catch (e) {
      setShowRecordDuetteModal(false);
      throw new Error('error unloading video: ', e);
    }
  };

  const handleTryAgain = async () => {
    await vidRef.current.stopAsync();
    cancel = true;
    cameraRef.stopRecording();
    setRecording(false);
    setDuetteUri('');
    clearInterval(countdownIntervalId);
    setCountdownActive(false);
    setCountdown(3);
  };

  const handleReload = () => {
    setShowPreviewModal(true);
    setHardRefresh(false);
  };

  const handleReRecord = () => {
    setHardRefresh(false);
    setDuetteUri(false);
  };

  const confirmReRecord = () => {
    Alert.alert(
      'Are you sure?',
      'If you proceed, your previous Duette will be permanently deleted.',
      [
        { text: "Yes, I'm sure", onPress: () => handleReRecord() },
        { text: 'Cancel', onPress: () => { } }
      ],
      { cancelable: false }
    );
  }

  const handlePlaybackStatusUpdate = (updateObj) => {
    if (updateObj.isLoaded !== vidLoaded) setVidLoaded(updateObj.isLoaded);
    if (!vidDoneBuffering && !updateObj.isBuffering) setVidDoneBuffering(true);
    if (updateObj.didJustFinish) toggleRecord();
  };

  const startCountdown = () => {
    setCountdownActive(true);
    countdownIntervalId = setInterval(() => {
      setCountdown(countdown => countdown - 1)
    }, 1000)
  };

  useEffect(() => {
    if (countdownActive && countdown === 0) {
      toggleRecord();
      clearInterval(countdownIntervalId);
      setCountdownActive(false);
      setCountdown(3);
    }
  }, [countdownActive, countdown]);

  return (
    <View style={styles.container}>
      {
        showPreviewModal ? (
          <ReviewDuette
            setShowRecordDuetteModal={setShowRecordDuetteModal}
            duetteUri={duetteUri}
            setShowPreviewModal={setShowPreviewModal}
            setDuetteUri={setDuetteUri}
            androidScreenOrientation={screenOrientation}
            playDelay={playDelay}
            // baseTrackUri={baseTrackUri}
            setSearchText={setSearchText}
            setHardRefresh={setHardRefresh}
          />
        ) : (
            <Modal
              onRequestClose={handleCancel}
              supportedOrientations={['portrait', 'portrait-upside-down', 'landscape', 'landscape-left', 'landscape-right']}
            >
              {
                screenOrientation === 'PORTRAIT' ? (
                  <RecordDuettePortrait
                    recording={recording}
                    handleCancel={handleCancel}
                    vidRef={vidRef}
                    handlePlaybackStatusUpdate={handlePlaybackStatusUpdate}
                    setCameraRef={setCameraRef}
                    toggleRecord={toggleRecord}
                    handleTryAgain={handleTryAgain}
                    startCountdown={startCountdown}
                    countdown={countdown}
                    countdownActive={countdownActive}
                    deviceType={deviceType}
                  />
                ) : (
                    deviceType === 2 ? (
                      <View style={{ flex: 1, backgroundColor: 'black', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: 'white', fontSize: 20 }}>Landscape recording not supported on iPad</Text>
                      </View>
                    ) : (
                        <RecordDuetteLandscape
                          recording={recording}
                          handleCancel={handleCancel}
                          vidRef={vidRef}
                          handlePlaybackStatusUpdate={handlePlaybackStatusUpdate}
                          setCameraRef={setCameraRef}
                          toggleRecord={toggleRecord}
                          handleTryAgain={handleTryAgain}
                          startCountdown={startCountdown}
                          countdown={countdown}
                          countdownActive={countdownActive}
                          deviceType={deviceType}
                        />
                      )
                  )
              }
            </Modal >
          )
      }
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

const mapState = ({ selectedVideo }) => {
  return {
    selectedVideo
  }
};

const mapDispatch = dispatch => {
  return {
    clearVideo: () => dispatch(clearVideo()),
  }
}

export default connect(mapState, mapDispatch)(RecordDuetteModal);
