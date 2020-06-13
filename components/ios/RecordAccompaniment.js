/* eslint-disable complexity */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Image, Text, TouchableOpacity, View, Dimensions, Modal, Alert } from 'react-native';
import { Icon } from 'react-native-elements';
import { Camera } from 'expo-camera';
import { toggleUpgradeOverlay } from '../../redux/upgradeOverlay';

// iOS

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

  let screenWidth = Math.floor(Dimensions.get('window').width);
  let screenHeight = Math.floor(Dimensions.get('window').height);

  const [screenOrientation, setScreenOrientation] = useState('');
  const [cameraType, setCameraType] = useState('front');

  const handleModalOrientationChange = (ev) => {
    setScreenOrientation(ev.nativeEvent.orientation.toUpperCase());
    if (ev.nativeEvent.orientation === 'landscape' && cameraType === 'back') {
      Alert.alert(
        'Not supported',
        "Outward-facing camera is only supported in portrait mode. If you want to flip the camera, please rotate your device.",
        [
          { text: 'OK', onPress: () => setCameraType('front') },
        ],
        { cancelable: false }
      );
    }
  };

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

  return (
    <Modal
      animationType="fade"
      onOrientationChange={e => handleModalOrientationChange(e)}
      supportedOrientations={['portrait', 'landscape-right']}
    >
      <View style={{
        flexDirection: screenOrientation === 'PORTRAIT' ? 'column' : 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
        paddingVertical: screenOrientation === 'PORTRAIT' ? (screenHeight - (screenWidth / 8 * 9)) / 2 : 0
      }}>
        <View
          style={{
            width: screenOrientation === 'PORTRAIT' ? screenWidth : screenHeight / 9 * 8,
            height: screenOrientation === 'PORTRAIT' ? screenWidth / 8 * 9 : screenHeight
          }}>
          <Camera
            style={{
              width: '100%',
              height: '100%'
            }}
            type={cameraType === 'front' ? Camera.Constants.Type.front : Camera.Constants.Type.back}
            ref={ref => setCameraRef(ref)}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity
                onPress={handleRecordExit}
                disabled={recording}
              >
                <View style={{ flexDirection: 'row' }}>
                  <Text style={{
                    color: 'red',
                    fontSize: recording ? 15 : 20,
                    paddingLeft: 20,
                    paddingTop: 20,
                    fontWeight: recording ? 'bold' : 'normal'
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
                        marginTop: 24,
                      }} />
                  }
                </View>
              </TouchableOpacity>
              <View
                style={{
                  flexDirection: 'row',
                }}>
                <TouchableOpacity
                  disabled
                  style={{
                    marginBottom: 30,
                    // backgroundColor: 'green',
                  }}>
                  <Text style={{
                    color: getColor(),
                    fontSize: 20,
                    paddingTop: 20,
                    paddingRight: 10,
                    // backgroundColor: 'purple',
                    fontWeight: secs > 59 ? 'normal' : 'bold',
                  }}>
                    {!recording ? '9 mins max' : `${Math.floor(secs / 60) > 0 ? Math.floor(secs / 60) : ''}:${secs % 60 >= 10 ? secs % 60 : `0${secs % 60}`}`}
                  </Text>
                </TouchableOpacity>
                {/* {
                  !recording &&
                  <TouchableOpacity
                    onPress={handleToggleUpgradeOverlay}
                    style={{
                      width: 24,
                      height: 24,
                      alignSelf: 'flex-end',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      backgroundColor: 'gray',
                      marginRight: 10,
                      marginBottom: 30,
                      borderRadius: 50,
                    }}>
                    <Text
                      style={{
                        color: 'white',
                        fontSize: 14,
                        height: 20,
                        fontWeight: 'bold',
                        // paddingTop: 20,
                        // paddingRight: 20,
                        // backgroundColor: 'purple',
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
                  height: 300,
                  marginTop: deviceType === 2 ? screenHeight / 5 : 0,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    color: '#0047B9',
                    fontSize: deviceType === 2 ? 200 : 110,
                  }}
                >
                  {countdown}
                </Text>
              </View>
            }
            <View
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                flexDirection: 'column',
                justifyContent: 'flex-end'
              }}
            >
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
            {
              screenOrientation === 'PORTRAIT' && !recording &&
              <View style={{
                position: 'absolute',
                bottom: 10,
                right: 10,
              }}>
                <Icon
                  onPress={toggleCameraType}
                  name={cameraType === 'front' ? "camera-rear" : 'camera-front'}
                  type="material"
                  color="black"
                  size={30}
                />
              </View>
            }
          </Camera>
        </View>
      </View>
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
