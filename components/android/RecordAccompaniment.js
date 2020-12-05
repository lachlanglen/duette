/* eslint-disable complexity */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Text, TouchableOpacity, View, Dimensions, Modal, Alert, StatusBar } from 'react-native';
import { Camera } from 'expo-camera';
import { Icon } from 'react-native-elements';
import * as ScreenOrientation from 'expo-screen-orientation';
import { toggleUpgradeOverlay } from '../../redux/upgradeOverlay';

// ANDROID

const RecordAccompaniment = (props) => {
  const {
    setCameraRef,
    handleRecordExit,
    recording,
    startCountdown,
    countdown,
    countdownActive,
    toggleRecord,
    secs,
    deviceType,
  } = props;

  const [screenOrientation, setScreenOrientation] = useState('');
  const [cameraType, setCameraType] = useState('front');

  let screenWidth = Math.floor(Dimensions.get('window').width);
  let screenHeight = Math.floor(Dimensions.get('window').height);

  useEffect(() => {
    const detectOrientation = async () => {
      if (screenWidth > screenHeight) setScreenOrientation('LANDSCAPE');
      if (screenWidth < screenHeight) setScreenOrientation('PORTRAIT');
      await ScreenOrientation.unlockAsync();
      ScreenOrientation.addOrientationChangeListener(info => {
        // if ((info.orientationInfo.orientation === 3 || info.orientationInfo.orientation === 4) && cameraType === 'back') {
        //   Alert.alert(
        //     'Not supported',
        //     "Outward-facing camera is only supported in portrait mode. If you want to flip the camera, please rotate your device.",
        //     [
        //       { text: 'OK', onPress: () => setCameraType('front') },
        //     ],
        //     { cancelable: false }
        //   );
        //   return;
        // }
        if (info.orientationInfo.orientation === 'UNKNOWN') {
          if (screenWidth > screenHeight) setScreenOrientation('LANDSCAPE');
          if (screenWidth < screenHeight) setScreenOrientation('PORTRAIT');
        } else {
          if (info.orientationInfo.orientation === 1 || info.orientationInfo.orientation === 2) setScreenOrientation('PORTRAIT');
          if (info.orientationInfo.orientation === 3 || info.orientationInfo.orientation === 4) setScreenOrientation('LANDSCAPE');
        }
      })
    };
    detectOrientation();
    return async () => {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    }
  }, []);

  const getColor = () => {
    if (!recording) return 'yellow';
    if (secs > 59) return 'green';
    if (secs > 14 && secs <= 59) return 'yellow';
    if (secs <= 14) return 'red';
  };

  const handleToggleUpgradeOverlay = () => {
    props.toggleUpgradeOverlay(!props.displayUpgradeOverlay);
  };

  const toggleCameraType = () => {
    if (cameraType === 'front') setCameraType('back');
    else if (cameraType === 'back') setCameraType('front');
  }

  // const handleModalOrientationChange = (ev) => {
  //   console.log('ev: ', ev)
  //   setScreenOrientation(ev.nativeEvent.orientation.toUpperCase());
  //   if (ev.nativeEvent.orientation === 'landscape' && cameraType === 'back') {
  //     Alert.alert(
  //       'Not supported',
  //       "Outward-facing camera is only supported in portrait mode. If you want to flip the camera, please rotate your device.",
  //       [
  //         { text: 'OK', onPress: () => setCameraType('front') },
  //       ],
  //       { cancelable: false }
  //     );
  //   }
  // };

  return (
    <Modal
      animationType="fade"
      // onOrientationChange={e => handleModalOrientationChange(e)}
      supportedOrientations={['portrait', 'landscape-right']}
    >
      <StatusBar hidden />
      <View style={{
        flexDirection: screenOrientation === 'PORTRAIT' ? 'column' : 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
        paddingVertical: screenOrientation === 'PORTRAIT' ? (screenHeight - (screenWidth / 8 * 9)) / 2 : 0,
        height: '100%',
      }}>
        <View
          style={{
            width: screenOrientation === 'PORTRAIT' ? screenWidth : screenHeight / 9 * 16 * 0.9,
            height: screenOrientation === 'PORTRAIT' ? screenWidth / 8 * 16 * 0.9 : screenHeight * 0.9,
            justifyContent: 'flex-start',
            alignItems: 'center',
            backgroundColor: 'black',
          }}
        >
          <Camera
            style={{
              width: '100%',
              height: '100%',
            }}
            ratio="16:9"
            type={cameraType === 'front' ? Camera.Constants.Type.front : Camera.Constants.Type.back}
            ref={ref => setCameraRef(ref)}
          >
            {
              screenOrientation === 'LANDSCAPE' ? (
                <View style={{
                  flexDirection: 'row',
                  height: '100%',
                  width: '100%',
                  justifyContent: 'space-between',
                }}>
                  <View style={{
                    flexDirection: 'column',
                    backgroundColor: 'black',
                    width: '25%',
                    height: '100%',
                    justifyContent: 'space-evenly',
                    alignItems: 'center',
                  }}>
                    <TouchableOpacity
                      onPress={!recording ? handleRecordExit : () => { }}
                    >
                      <View style={{
                        flexDirection: 'row',
                        // backgroundColor: 'pink',
                        alignItems: 'center',
                        width: '100%',
                      }}>
                        <Text style={{
                          color: 'red',
                          fontSize: recording ? 15 : 20,
                          fontWeight: recording ? 'bold' : 'normal',
                          textAlign: 'center',
                        }}
                        >
                          {recording ? 'REC' : 'Cancel'}
                        </Text>
                        {
                          recording &&
                          <View
                            style={{
                              width: 10,
                              height: 10,
                              backgroundColor: 'red',
                              borderRadius: 50,
                              marginLeft: 7,
                              // marginTop: 24,
                            }} />
                        }
                      </View>
                    </TouchableOpacity>
                    <View
                      style={{
                        flexDirection: 'row',
                      }}>
                      <TouchableOpacity
                        style={{
                          // backgroundColor: 'purple',
                          alignItems: 'center',
                        }}>
                        <Text style={{
                          color: getColor(),
                          fontSize: 20,
                          fontWeight: secs > 59 ? 'normal' : 'bold',
                        }}>
                          {!recording ? '9 mins max' : `${Math.floor(secs / 60) > 0 ? Math.floor(secs / 60) : ''}:${secs % 60 >= 10 ? secs % 60 : `0${secs % 60}`}`}
                        </Text>
                      </TouchableOpacity>
                      {/* {
                        recording &&
                        <TouchableOpacity
                          onPress={handleToggleUpgradeOverlay}
                          style={{
                            width: 24,
                            height: 24,
                            alignSelf: 'flex-end',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'gray',
                            marginRight: 10,
                            marginLeft: 6,
                            marginBottom: 30,
                            borderRadius: 50,
                          }}>
                          <Text
                            style={{
                              color: 'white',
                              fontSize: 14,
                              height: 20,
                              fontWeight: 'bold',
                              fontWeight: secs > 59 ? 'normal' : 'bold',
                            }}
                          >?</Text>
                        </TouchableOpacity>
                      } */}
                    </View>
                  </View>
                  {
                    countdownActive &&
                    <View
                      style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginLeft: '25%',
                        width: '42%',
                        height: '100%',
                        position: 'absolute',
                        marginTop: deviceType === 2 ? screenHeight / 5 : 0,
                      }}>
                      <Text
                        style={{
                          color: 'white',
                          fontSize: deviceType === 2 ? 200 : 110,
                        }}
                      >
                        {countdown}
                      </Text>
                    </View>
                  }
                  <View style={{
                    flexDirection: 'row',
                    backgroundColor: 'black',
                    width: '25%',
                    height: '100%',
                    justifyContent: 'center',
                  }}>
                    <View
                      style={{
                        justifyContent: 'center',
                      }}>
                      <Text style={{
                        color: 'red',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        textTransform: 'uppercase',
                        fontSize: 14,
                      }}>{recording || countdownActive ? '' : 'record'}
                      </Text>
                      <TouchableOpacity
                        onPress={!recording ? startCountdown : toggleRecord}
                        disabled={countdownActive}
                        style={{
                          borderWidth: 5,
                          borderColor: recording ? 'darkred' : 'darkred',
                          alignSelf: 'center',
                          width: 50,
                          height: 50,
                          backgroundColor: recording ? 'black' : 'red',
                          borderRadius: 50,
                          margin: 10,
                        }}
                      />
                    </View>
                  </View>
                </View>
              ) : (
                  // PORTRAIT ORIENTATION:
                  <View style={{
                    flexDirection: 'column',
                    height: '100%',
                    width: '100%',
                    justifyContent: 'space-between',
                  }}>
                    <View style={{
                      flexDirection: 'row',
                      backgroundColor: 'black',
                      width: '100%',
                      height: '18.3%',
                      justifyContent: 'flex-end',
                      paddingBottom: 25,
                    }}>
                      <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        paddingHorizontal: 20,
                        alignItems: 'flex-end',
                        width: '100%'
                      }}>
                        <TouchableOpacity
                          onPress={!recording ? handleRecordExit : () => { }}
                        >
                          <View style={{ flexDirection: 'row' }}>
                            <Text style={{
                              color: 'red',
                              fontSize: recording ? 15 : 20,
                              fontWeight: recording ? 'bold' : 'normal',
                            }}
                            >
                              {recording ? 'REC' : 'Cancel'}
                            </Text>
                            {
                              recording &&
                              <View
                                style={{
                                  width: 10,
                                  height: 10,
                                  backgroundColor: 'red',
                                  borderRadius: 50,
                                  marginLeft: 7,
                                  alignSelf: 'center'
                                }} />
                            }
                          </View>
                        </TouchableOpacity>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                          <TouchableOpacity>
                            <Text style={{
                              color: getColor(),
                              fontSize: 20,
                              fontWeight: secs > 59 || !recording ? 'normal' : 'bold',
                            }}>
                              {!recording ? '9 mins max' : `${Math.floor(secs / 60) > 0 ? Math.floor(secs / 60) : ''}:${secs % 60 >= 10 ? secs % 60 : `0${secs % 60}`}`}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                    {
                      countdownActive &&
                      <View
                        style={{
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: screenWidth,
                          height: screenHeight,
                          position: 'absolute',
                          marginTop: deviceType === 2 ? screenHeight / 5 : 0,
                        }}>
                        <Text
                          style={{
                            color: 'white',
                            fontSize: deviceType === 2 ? 200 : 110,
                          }}
                        >
                          {countdown}
                        </Text>
                      </View>
                    }
                    <View style={{
                      backgroundColor: 'black',
                      width: '100%',
                      height: '18.3%',
                    }}>
                      <Text style={{
                        color: 'red',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        textTransform: 'uppercase',
                        fontSize: 14,
                        marginVertical: 2,
                      }}>{recording || countdownActive ? '' : 'record'}
                      </Text>
                      <TouchableOpacity
                        onPress={!recording ? startCountdown : toggleRecord}
                        disabled={countdownActive}
                        style={{
                          borderWidth: 5,
                          borderColor: recording ? 'darkred' : 'darkred',
                          alignSelf: 'center',
                          width: 50,
                          height: 50,
                          backgroundColor: recording ? 'black' : 'red',
                          borderRadius: 50,
                        }}
                      />
                    </View>
                  </View>
                )
            }
          </Camera>
        </View>
      </View>
      {
        !recording &&
        <View style={{
          position: 'absolute',
          bottom: screenOrientation === 'PORTRAIT' ? screenHeight * 0.2 : 25,
          right: screenOrientation === 'PORTRAIT' ? 10 : screenWidth * .25 + 25,
        }}>
          <Icon
            onPress={toggleCameraType}
            name={cameraType === 'front' ? "camera-rear" : 'camera-front'}
            type="material"
            color="black"
            size={deviceType === 2 ? 40 : 30}
          />
        </View>
      }
    </Modal>
  )
};

const mapState = ({ displayUpgradeOverlay }) => {
  return {
    displayUpgradeOverlay,
  }
};

const mapDispatch = dispatch => {
  return {
    toggleUpgradeOverlay: bool => dispatch(toggleUpgradeOverlay(bool)),
  }
};

export default connect(mapState, mapDispatch)(RecordAccompaniment);
