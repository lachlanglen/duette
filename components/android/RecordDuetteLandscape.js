/* eslint-disable complexity */
import React from 'react';
import { connect } from 'react-redux';
import { View, TouchableOpacity, Text, Dimensions, StyleSheet } from 'react-native';
import { Camera } from 'expo-camera';
import { Video } from 'expo-av';
import { getAWSVideoUrl } from '../../constants/urls';

const RecordDuetteLandscape = (props) => {
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

  return (
    <View style={{
      ...styles.container,
      width: screenHeight / 9 * 16,
      height: screenHeight,
    }}>
      {/* TODO: add codec to camera input? (e.g. .mov) */}
      <Camera
        style={{
          ...styles.camera,
          marginLeft: screenWidth - screenHeight / 9 * 8,
        }}
        ratio="16:9"
        type={Camera.Constants.Type.front}
        ref={ref => setCameraRef(ref)} >
        <View style={{
          ...styles.recordButtonContainer,
          width: screenWidth,
          height: screenHeight,
        }}>
          <TouchableOpacity
            onPress={toggleRecord}
          >
            <Text style={styles.recordButtonText}
            >
              {recording ? '' : 'record'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={!recording ? startCountdown : toggleRecord}
            style={{
              ...styles.recordButton,
              borderColor: recording ? 'darkred' : 'darkred',
              backgroundColor: recording ? 'black' : 'red',
            }}
          />
        </View>
      </Camera>
      <View style={{
        ...styles.videoContainer,
        width: screenHeight / 9 * 8,
        height: screenHeight,
      }}>
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
            height: screenHeight,
          }}
        />
      </View>
      <View style={{
        ...styles.recordingOrCancelContainer,
        height: screenHeight * 0.95,
      }}>
        <TouchableOpacity
          onPress={!recording ? handleCancel : () => { }}
          style={styles.recordingOrCancelButton}
        >
          <Text
            style={{
              ...styles.recordingOrCancelText,
              fontSize: recording ? 15 : 20,
              fontWeight: recording ? 'bold' : 'normal',
            }}
          >
            {recording ? 'Recording' : 'Cancel'}
          </Text>
        </TouchableOpacity>
        {
          recording &&
          <TouchableOpacity
            onPress={handleTryAgain}
            style={styles.problemContainer}
          >
            <Text
              style={styles.problemText}>Having a problem? Touch here to try again.
            </Text>
          </TouchableOpacity>
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
            color: '#0047B9',
            fontSize: deviceType === 2 ? 100 : 70
          }}
          >
            {countdown}
          </Text>
        </View>
      }
    </View>
  )
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'black',
  },
  camera: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
  },
  recordButtonContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  recordButtonText: {
    color: 'red',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  recordButton: {
    borderWidth: 5,
    width: 50,
    height: 50,
    borderRadius: 50,
    marginBottom: 35,
  },
  videoContainer: {
    position: 'absolute',
  },
  recordingOrCancelContainer: {
    position: 'absolute',
    justifyContent: 'space-between',
  },
  recordingOrCancelButton: {
    alignSelf: 'flex-start',
    paddingLeft: 15,
    paddingTop: 10,
  },
  recordingOrCancelText: {
    color: 'red',
    textAlign: 'center',
  },
  problemContainer: {
    paddingLeft: 15,
    paddingBottom: 15,
    alignSelf: 'flex-end',
  },
  problemText: {
    color: 'red',
    fontSize: 16,
    marginTop: 20,
  }
});

const mapState = ({ selectedVideo }) => {
  return {
    selectedVideo
  }
}

export default connect(mapState)(RecordDuetteLandscape);
