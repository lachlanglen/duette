/* eslint-disable complexity */
import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { View, Modal, StyleSheet, TouchableOpacity, Text, Dimensions, Alert } from 'react-native';
import { Video } from 'expo-av';
import { Camera } from 'expo-camera';
import * as Device from 'expo-device';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
import ReviewDuette from '../ReviewDuette';
import { deleteLocalFile } from '../../services/utils';
import buttonStyles from '../../styles/button';

let countdownIntervalId;
let cancel;

const RecordDuetteModal = (props) => {

  let screenWidth = Math.floor(Dimensions.get('window').width);
  let screenHeight = Math.floor(Dimensions.get('window').height);

  const {
    setShowRecordDuetteModal,
    baseTrackUri,
    setSearchText,
  } = props;

  const [recording, setRecording] = useState(false);
  const [duetteUri, setDuetteUri] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [screenOrientation, setScreenOrientation] = useState('');
  const [vidLoaded, setVidLoaded] = useState(false);
  const [vidDoneBuffering, setVidDoneBuffering] = useState(false);
  const [playDelay, setPlayDelay] = useState(0);
  const [displayedNotes, setDisplayedNotes] = useState(false);
  const [countdown, setCountdown] = useState(3);  // start with 3 secs remaining
  const [countdownActive, setCountdownActive] = useState(false);
  const [deviceType, setDeviceType] = useState(null);
  const [cameraRef, setCameraRef] = useState(null);
  const [hardRefresh, setHardRefresh] = useState(false);
  // const [cancel, setCancel] = useState(false);

  // const cameraRef = useRef(null);
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

  useEffect(() => {
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
  })

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

  const handleModalOrientationChange = (ev) => {
    setScreenOrientation(ev.nativeEvent.orientation.toUpperCase())
  };

  const handleCancel = async () => {
    try {
      deleteLocalFile(baseTrackUri);
      setDuetteUri('');
      clearInterval(countdownIntervalId);
      setCountdown(3);
      setCountdownActive(false);
      cancel = true;
      cameraRef.stopRecording();
      setRecording(false);
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
            screenOrientation={screenOrientation}
            playDelay={playDelay}
            baseTrackUri={baseTrackUri}
            setSearchText={setSearchText}
            setHardRefresh={setHardRefresh}
          />
        ) : (
            <Modal
              onRequestClose={handleCancel}
              supportedOrientations={deviceType === 2 ? ['portrait'] : ['portrait', 'landscape-right']}
              onOrientationChange={e => handleModalOrientationChange(e)}
            >
              {
                deviceType === 2 && screenOrientation === 'LANDSCAPE' ? (
                  <View style={{ flex: 1, backgroundColor: 'black', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: 'white', fontSize: 20 }}>Landscape recording not supported on iPad</Text>
                  </View>
                ) : (
                    <View style={{
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: 'black',
                      paddingVertical: screenOrientation === 'PORTRAIT' ? (screenHeight - (screenWidth / 8 * 9)) / 2 : 0,
                      height: '100%'
                    }}>
                      {
                        !hardRefresh &&
                        <View style={{ flexDirection: 'row' }}>
                          <Video
                            ref={vidRef}
                            source={{ uri: baseTrackUri }}
                            rate={1.0}
                            volume={1.0}
                            isMuted={false}
                            resizeMode="cover"
                            progressUpdateIntervalMillis={50}
                            onPlaybackStatusUpdate={update => handlePlaybackStatusUpdate(update)}
                            style={{
                              width: screenOrientation === 'LANDSCAPE' ? screenHeight / 9 * 8 : screenWidth / 2,
                              height: screenOrientation === 'LANDSCAPE' ? screenHeight : screenWidth / 16 * 9,
                            }}
                          />
                          {/* TODO: add codec to camera input? (e.g. .mov) */}
                          <Camera
                            style={{
                              width: screenOrientation === 'LANDSCAPE' ? screenHeight / 9 * 8 : screenWidth / 2,
                              height: screenOrientation === 'LANDSCAPE' ? screenHeight : screenWidth / 16 * 9,
                            }}
                            type={Camera.Constants.Type.front}
                            ref={ref => setCameraRef(ref)}                        >
                            <View>
                              <TouchableOpacity
                                onPress={!recording ? handleCancel : () => { }}
                                style={{ flexDirection: 'row' }}
                              >
                                <Text style={deviceType !== 2 ? {
                                  ...styles.overlayText,
                                  paddingLeft: screenOrientation === 'LANDSCAPE' ? 20 : 10,
                                  paddingTop: screenOrientation === 'LANDSCAPE' ? 20 : 10,
                                  fontSize: screenOrientation === 'LANDSCAPE' ? screenWidth / 30 : screenWidth / 22,
                                } : {
                                    ...styles.overlayText,
                                    paddingLeft: 10,
                                    paddingTop: 10,
                                    fontSize: 26,
                                  }}
                                >
                                  {recording ? 'REC' : 'Cancel'}
                                </Text>
                                {
                                  recording && deviceType !== 2 &&
                                  <View
                                    style={{
                                      width: screenOrientation === 'LANDSCAPE' ? 14 : 10,
                                      height: screenOrientation === 'LANDSCAPE' ? 14 : 10,
                                      backgroundColor: 'red',
                                      borderRadius: 50,
                                      marginLeft: 7,
                                      marginTop: screenOrientation === 'LANDSCAPE' ? 26 : 16,
                                    }} />
                                }
                              </TouchableOpacity>
                            </View>
                            {
                              vidLoaded && vidDoneBuffering &&
                              <View
                                style={styles.recordButtonContainer}>
                                <TouchableOpacity
                                >
                                  <Text style={{
                                    ...styles.recordText,
                                    fontSize: screenOrientation === 'LANDSCAPE' ? 18 : 13,
                                  }}>{recording ? '' : 'record'}</Text>
                                  <TouchableOpacity
                                    onPress={!recording ? startCountdown : toggleRecord}
                                    style={{
                                      ...styles.recordButton,
                                      borderWidth: deviceType === 2 ? 6 : screenWidth / 100,
                                      width: deviceType === 2 ? 60 : screenWidth / 10,
                                      height: deviceType === 2 ? 60 : screenWidth / 10,
                                      backgroundColor: recording ? 'black' : 'red',
                                      marginBottom: screenOrientation === 'LANDSCAPE' ? 10 : 6,
                                    }} />
                                </TouchableOpacity>
                              </View>
                            }
                            {
                              screenOrientation === 'LANDSCAPE' && recording &&
                              <TouchableOpacity
                                onPress={handleTryAgain}
                                style={styles.problemContainerLandscape}
                              >
                                <Text style={{ color: 'red', fontSize: 16 }}>Having a problem? Touch here to try again.</Text>
                              </TouchableOpacity>
                            }
                          </Camera>
                        </View>
                      }
                      {
                        countdownActive && countdown > 0 &&
                        <View style={{
                          position: 'absolute',
                          height: 300,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <Text style={{
                            color: '#0047B9',
                            fontSize: screenOrientation === 'LANDSCAPE' || deviceType === 2 ? 100 : 70
                          }}
                          >
                            {countdown}
                          </Text>
                        </View>
                      }
                      {
                        screenOrientation === 'PORTRAIT' && recording &&
                        <TouchableOpacity
                          onPress={handleTryAgain}
                        >
                          <Text style={{ color: 'red', fontSize: 16, marginTop: 20 }}>Having a problem? Touch here to try again.</Text>
                        </TouchableOpacity>
                      }
                      {
                        hardRefresh &&
                        <View style={{
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                          <Text style={{
                            ...buttonStyles.regularButtonText,
                            marginBottom: 30,
                          }}>What would you like to do?</Text>
                          <TouchableOpacity
                            onPress={handleReload}
                            style={{
                              ...buttonStyles.regularButton,
                              width: '75%',
                            }}
                          >
                            <Text style={buttonStyles.regularButtonText}>Reload preview</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={confirmReRecord}
                            style={{
                              ...buttonStyles.regularButton,
                              width: '75%',
                            }}
                          >
                            <Text style={buttonStyles.regularButtonText}>Re-record Duette</Text>
                          </TouchableOpacity>
                        </View>
                      }
                    </View>
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
  overlay: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DDDDDD',
    padding: 10,
    position: 'absolute',
    opacity: 0.5,
    alignSelf: 'center',
    borderColor: 'black',
  },
  overlayText: {
    fontWeight: 'normal',
    color: 'red',
  },
  problemContainerLandscape: {
    alignItems: 'center',
    paddingBottom: 10,
    height: 30,
  },
  recordButtonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end'
  },
  recordButton: {
    borderColor: 'darkred',
    alignSelf: 'center',
    borderRadius: 50,
    marginTop: 6,
  },
  recordText: {
    color: 'red',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
  }
});

const mapState = ({ selectedVideo }) => {
  return {
    selectedVideo
  }
}

export default connect(mapState)(RecordDuetteModal);
