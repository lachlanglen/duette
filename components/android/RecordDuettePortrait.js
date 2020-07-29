/* eslint-disable complexity */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { View, TouchableOpacity, Text, Dimensions, StyleSheet, StatusBar } from 'react-native';
import { Icon } from 'react-native-elements';
import { Camera } from 'expo-camera';
import { Video } from 'expo-av';
import { getAWSVideoUrl } from '../../constants/urls';
import * as ScreenOrientation from 'expo-screen-orientation';

const RecordDuettePortrait = (props) => {
  const {
    recording,
    handleCancel,
    vidRef,
    handlePlaybackStatusUpdate,
    setCameraRef,
    toggleRecord,
    handleTryAgain,
    startCountdown,
    countdown,
    countdownActive,
    deviceType,
  } = props;

  let screenWidth = Math.floor(Dimensions.get('window').width);
  let screenHeight = Math.floor(Dimensions.get('window').height);

  const [cameraType, setCameraType] = useState('front');

  const toggleCameraType = () => {
    if (cameraType === 'front') setCameraType('back');
    else if (cameraType === 'back') setCameraType('front');
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <View style={styles.recordingOrCancelContainer}>
        <TouchableOpacity
          onPress={!recording ? handleCancel : () => { }}
        >
          <Text style={{
            color: 'red',
            fontSize: recording ? 15 : 20,
            fontWeight: recording ? 'bold' : 'normal',
            textAlign: 'center',
          }}
          >
            {recording ? 'REC' : 'Cancel'}
          </Text>
        </TouchableOpacity>
      </View>
      <View
        style={{
          ...styles.mediaContainer,
          height: screenWidth / 9 * 8,
        }}>
        <View style={styles.videoContainer}>
          <View style={{
            ...styles.videoOffset,
            height: (screenWidth / 9 * 8 - screenWidth / 16 * 9) / 2,
          }} />
          {
            !props.selectedVideo.id ? (
              <View
                style={{
                  backgroundColor: 'black',
                  width: screenWidth / 2,
                  height: screenWidth / 16 * 9,
                }}
              />
            ) : (
                <Video
                  ref={vidRef}
                  // source={{ uri: getAWSVideoUrl(selectedVideoId) }}
                  source={{ uri: getAWSVideoUrl(props.selectedVideo.id) }}
                  rate={1.0}
                  volume={1.0}
                  isMuted={false}
                  resizeMode="cover"
                  progressUpdateIntervalMillis={50}
                  onPlaybackStatusUpdate={update => handlePlaybackStatusUpdate(update)}
                  style={{
                    width: screenWidth / 2,
                    height: screenWidth / 16 * 9,
                  }}
                />
              )
          }
        </View>
        <View style={styles.cameraContainer}>
          {/* TODO: add codec to camera input? (e.g. .mov) */}
          <Camera
            style={styles.camera}
            ratio="16:9"
            type={cameraType === 'front' ? Camera.Constants.Type.front : Camera.Constants.Type.back}
            ref={ref => setCameraRef(ref)} >
            <View style={styles.cameraOverlayContainer}>
              <View style={{
                ...styles.cameraOverlay,
                height: (screenWidth / 9 * 8 - screenWidth / 16 * 9) / 2,
              }} />
              <View style={{
                ...styles.cameraOverlay,
                height: (screenWidth / 9 * 8 - screenWidth / 16 * 9) / 2,
              }} />
            </View>
          </Camera>
          {
            !recording &&
            <View style={{
              position: 'absolute',
              bottom: '20%',
              right: 6,
            }}>
              <Icon
                onPress={toggleCameraType}
                disabled={countdownActive}
                name={cameraType === 'front' ? "camera-rear" : 'camera-front'}
                type="material"
                color="black"
                size={deviceType === 2 ? 36 : 26}
              />
            </View>
          }
        </View>
        {
          countdownActive &&
          <View style={{
            position: 'absolute',
            height: 300,
            width: screenWidth,
            alignSelf: 'center',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Text style={{
              color: 'white',
              fontSize: deviceType === 2 ? 100 : 70
            }}
            >
              {countdown}
            </Text>
          </View>
        }
      </View>
      <View style={styles.recordButtonContainer}>
        <View style={styles.recordTextContainer}>
          <TouchableOpacity
            // onPress={!recording ? startCountdown : toggleRecord}
            disabled
          >
            <Text style={styles.recordText}>
              {recording ? '' : 'record'}
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={!recording ? startCountdown : toggleRecord}
          disabled={countdownActive}
          style={{
            ...styles.recordButton,
            borderColor: recording ? 'darkred' : 'darkred',
            backgroundColor: recording ? 'black' : 'red',
          }}
        />
      </View>
      {
        recording &&
        <TouchableOpacity
          onPress={handleTryAgain}
        >
          <Text style={styles.problemText}>Having a problem? Touch here to try again.</Text>
        </TouchableOpacity>
      }
    </View>
  )
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
    height: '100%',
  },
  recordingOrCancelContainer: {
    alignSelf: 'center',
    justifyContent: 'center',
    height: '15%',
    width: '50%',
  },
  mediaContainer: {
    flexDirection: 'row',
    backgroundColor: 'black',
    width: '100%',
  },
  videoContainer: {
    height: '100%',
    width: '50%',
    backgroundColor: 'black',
  },
  videoOffset: {
    width: '100%',
    backgroundColor: 'black',
  },
  cameraContainer: {
    height: '100%',
    width: '50%',
    backgroundColor: 'black',
  },
  camera: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
  },
  cameraOverlayContainer: {
    height: '100%',
    width: '100%',
    justifyContent: 'space-between',
  },
  cameraOverlay: {
    width: '100%',
    backgroundColor: 'black',
  },
  recordButtonContainer: {
    backgroundColor: 'black',
    height: '15%',
    width: '50%',
  },
  recordTextContainer: {
    backgroundColor: 'black',
    width: '100%',
    height: '18.3%',
    justifyContent: 'flex-end',
  },
  recordText: {
    color: 'red',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  recordButton: {
    borderRadius: 50,
    margin: 10,
    borderWidth: 5,
    alignSelf: 'center',
    width: 50,
    height: 50,
  },
  problemText: {
    color: 'red',
    fontSize: 16,
    marginTop: 20,
    width: '100%',
  }
})

const mapState = ({ selectedVideo }) => {
  return {
    selectedVideo
  }
}

export default connect(mapState)(RecordDuettePortrait);
