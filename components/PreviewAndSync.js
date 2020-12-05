/* eslint-disable complexity */
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Alert, Text, TouchableOpacity, View, Dimensions, Button, StyleSheet, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { Icon } from 'react-native-elements';
import { Video } from 'expo-av';
import * as Device from 'expo-device';
import { getAWSVideoUrl } from '../constants/urls';
import buttonStyles from '../styles/button';

const PreviewAndSync = (props) => {
  const {
    screenOrientation,
    setVidARef,
    setVidBRef,
    handlePlaybackStatusUpdate,
    duetteUri,
    handleShowPreview,
    previewComplete,
    isPlaying,
    bothVidsReady,
    handleSave,
    handleRedo,
    handleSyncBack,
    handleSyncForward,
    baseTrackUri,
    handleRestart,
    reduceBaseTrackVolume,
    increaseBaseTrackVolume,
    baseTrackVolume,
    duetteVolume,
    reduceDuetteVolume,
    increaseDuetteVolume,
    handleHardRefresh,
  } = props;

  let screenWidth = Math.floor(Dimensions.get('window').width);
  let screenHeight = Math.floor(Dimensions.get('window').height);

  const [deviceType, setDeviceType] = useState(null);

  useEffect(() => {
    const getDeviceType = async () => {
      const type = await Device.getDeviceTypeAsync();
      setDeviceType(type);
    };
    getDeviceType();
  }, []);

  const confirmRedo = () => {
    Alert.alert(
      'Are you sure?',
      'If you proceed, this Duette will be permanently deleted.',
      [
        { text: "Yes, I'm sure", onPress: () => handleRedo() },
        { text: 'Cancel', onPress: () => { } }
      ],
      { cancelable: false }
    );
  }

  // const handleProblem = () => {
  //   Alert.alert(
  //     'What would you like to do?',
  //     "'Soft Refresh' is recommended if a video has frozen. 'Hard Refresh' is recommended if a video has failed to load.",
  //     [
  //       { text: 'Soft Refresh', onPress: () => handleRestart() },
  //       { text: 'Hard Refresh', onPress: () => handleHardRefresh() },
  //     ],
  //     { cancelable: false }
  //   );
  // };

  return (
    screenOrientation === 'LANDSCAPE' && deviceType === 2 ? (
      <View style={{
        flex: 1,
        backgroundColor: 'black',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Text style={{
          color: 'white',
          fontSize: 18,
        }}>Landscape preview not supported on tablets. Please rotate device to preview.</Text>
      </View>
    ) : (
        <ScrollView contentContainerStyle={{
          ...styles.container,
          // paddingVertical: screenOrientation === 'PORTRAIT' && !previewComplete ? 20 : 0,
          paddingTop: screenOrientation === 'PORTRAIT' && screenHeight < 800 && previewComplete ? (screenHeight - (screenWidth / 8 * 9)) / 2 : 0,
        }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: screenOrientation === 'PORTRAIT' && !previewComplete && Platform.OS === 'ios' ? 20 : 0,
          }}>
            {
              !props.selectedVideo.id ? (
                <View
                  style={{
                    backgroundColor: 'black',
                    width: screenOrientation === 'LANDSCAPE' ? screenHeight / 9 * 8 : screenWidth / 2,
                    height: screenOrientation === 'LANDSCAPE' ? screenHeight : screenWidth / 16 * 9,
                  }}
                />
              ) : (
                  <Video
                    ref={ref => setVidARef(ref)}
                    source={{
                      uri: Platform.OS === 'ios' ? baseTrackUri : getAWSVideoUrl(props.selectedVideo.id),
                    }}
                    rate={1.0}
                    volume={1.0}
                    isMuted={false}
                    resizeMode="cover"
                    shouldPlay={false}
                    // positionMillis={0}
                    isLooping={false}
                    style={{
                      width: screenOrientation === 'LANDSCAPE' ? screenHeight / 9 * 8 : screenWidth / 2,
                      height: screenOrientation === 'LANDSCAPE' ? screenHeight : screenWidth / 16 * 9,
                    }}
                    onPlaybackStatusUpdate={update => handlePlaybackStatusUpdate(update, 'vid1')}
                  />
                )
            }
            <Video
              ref={ref => setVidBRef(ref)}
              source={{
                uri: duetteUri,
              }}
              rate={1.0}
              volume={1.0}
              isMuted={false}
              resizeMode="cover"
              shouldPlay={false}
              isLooping={false}
              style={{
                width: screenOrientation === 'LANDSCAPE' ? screenHeight / 9 * 8 : screenWidth / 2,
                height: screenOrientation === 'LANDSCAPE' ? screenHeight : screenWidth / 16 * 9,
              }}
              onPlaybackStatusUpdate={update => handlePlaybackStatusUpdate(update, 'vid2')}
            />
            {
              // if preview hasn't played yet
              !previewComplete && !isPlaying ? (
                <TouchableOpacity
                  onPress={handleShowPreview}
                  style={{
                    ...styles.overlay,
                    width: screenWidth,
                    height: screenOrientation === 'LANDSCAPE' ? screenHeight : screenWidth / 16 * 9
                  }}>
                  <View style={{ flexDirection: 'row' }}>
                    <Text style={{
                      fontSize: screenOrientation === 'LANDSCAPE' ? screenWidth / 30 : screenWidth / 20,
                      fontWeight: 'bold',
                      marginRight: 10,
                    }}>
                      {bothVidsReady ? 'Touch to preview!' : 'Loading...'}
                    </Text>
                    {
                      !bothVidsReady &&
                      <ActivityIndicator size="small" color="#0047B9" />
                    }
                  </View>
                  {
                    screenOrientation === 'LANDSCAPE' &&
                    <Text style={{
                      fontSize: screenWidth / 32,
                      fontWeight: 'normal',
                      marginTop: 10,
                    }}>
                      Rotate device to use video controls
                </Text>
                  }
                </TouchableOpacity>
              ) : (
                  // if preview has played (previewComplete)
                  previewComplete &&
                  <TouchableOpacity
                    style={{
                      ...styles.overlay,
                      opacity: 0.8,
                      paddingTop: 40,
                      flexDirection: 'column',
                      justifyContent: 'space-evenly',
                      width: screenWidth,
                      height: screenOrientation === 'LANDSCAPE' ? screenHeight : screenWidth / 16 * 9,
                    }}>
                    <TouchableOpacity
                      style={{
                        ...buttonStyles.regularButton,
                        width: 200,
                      }}
                      onPress={handleShowPreview}>
                      <Text
                        style={buttonStyles.regularButtonText}>
                        View again
                  </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        ...buttonStyles.regularButton,
                        width: 100,
                      }}
                      disabled={!bothVidsReady}
                      onPress={handleSave}>
                      <Text
                        style={buttonStyles.regularButtonText}>
                        Save
                  </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        ...buttonStyles.regularButton,
                        width: 100,
                      }}
                      onPress={confirmRedo}>
                      <Text
                        style={buttonStyles.regularButtonText}>
                        Redo
                  </Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                )
            }
          </View>
          {
            screenOrientation === 'PORTRAIT' && !previewComplete &&
            <View>
              <Text
                style={styles.instruction}>Not perfectly in sync? Use the arrows below to adjust to your taste!
          </Text>
              <View
                style={deviceType === 2 ? {
                  ...styles.syncIconsContainer,
                  width: screenWidth / 2,
                  alignSelf: 'center',
                } : {
                    ...styles.syncIconsContainer,
                  }}>
                <Icon
                  onPress={isPlaying ? handleSyncBack : () => { }}
                  underlayColor="black"
                  name="fast-rewind"
                  type="material"
                  color="white"
                  size={50} />
                <Text
                  style={{
                    fontSize: 25,
                    color: 'white',
                    alignSelf: 'center',
                  }}>|
            </Text>
                <Icon
                  onPress={isPlaying ? handleSyncForward : () => { }}
                  underlayColor="black"
                  name="fast-forward"
                  type="material"
                  color="white"
                  size={50} />
              </View>
              <Text
                style={styles.hintTitle}>Hint:
          </Text>
              <View
                style={styles.hintContainer}>
                <Text
                  style={{ color: 'white', fontSize: 14, }}>If your Duette is <Text style={{ color: 'yellow' }}>behind</Text> the base track, press
            </Text>
                <Icon
                  name="fast-forward"
                  type="material"
                  color="yellow" />
              </View>
              <View
                style={{
                  ...styles.hintContainer,
                  marginBottom: 10,

                }}>
                <Text
                  style={{ color: 'white', fontSize: 14, }}>If your Duette is <Text style={{ color: 'yellow' }}>ahead of</Text> the base track, press
            </Text>
                <Icon
                  name="fast-rewind"
                  type="material"
                  color="yellow" />
              </View>
              <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 5, marginBottom: 15 }}>
                <Text style={styles.volumeControlsTitle}>Volume controls:</Text>
                <View style={deviceType === 2 ? {
                  ...styles.volumeControlsContainer,
                  width: screenWidth / 2,
                  alignSelf: 'center',
                } : {
                    ...styles.volumeControlsContainer,
                  }}>
                  <Text style={styles.volumeInstructionText}>Base track volume:</Text>
                  <View style={styles.volumeButtonsContainer}>
                    <TouchableOpacity
                      style={{
                        ...styles.volumeControlsButton,
                        backgroundColor: baseTrackVolume < 0.2 ? 'grey' : '#0047B9',
                        paddingLeft: 1,
                        marginRight: 15,
                      }}
                      onPress={reduceBaseTrackVolume}
                      disabled={baseTrackVolume === 0.1 || !isPlaying}
                    >
                      <Text style={styles.volumeButtonText}>-</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        ...styles.volumeControlsButton,
                        backgroundColor: baseTrackVolume > 0.9 ? 'grey' : '#0047B9',
                      }}
                      onPress={increaseBaseTrackVolume}
                      disabled={baseTrackVolume === 0.9 || !isPlaying}
                    >
                      <Text style={styles.volumeButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={deviceType === 2 ? {
                  ...styles.volumeControlsContainer,
                  width: screenWidth / 2,
                  alignSelf: 'center',
                } : {
                    ...styles.volumeControlsContainer,
                    marginBottom: Platform.OS === 'ios' ? 10 : 0,
                  }}>
                  <Text style={styles.volumeInstructionText}>Duette volume:</Text>
                  <View style={styles.volumeButtonsContainer}>
                    <TouchableOpacity
                      style={{
                        ...styles.volumeControlsButton,
                        backgroundColor: duetteVolume < 0.2 ? 'grey' : '#0047B9',
                        paddingLeft: 1,
                        marginRight: 15,
                      }}
                      onPress={reduceDuetteVolume}
                      disabled={duetteVolume === 0.1 || !isPlaying}
                    >
                      <Text style={styles.volumeButtonText}>-</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        ...styles.volumeControlsButton,
                        backgroundColor: duetteVolume > 0.9 ? 'grey' : '#0047B9',
                      }}
                      onPress={increaseDuetteVolume}
                      disabled={duetteVolume === 0.9 || !isPlaying}
                    >
                      <Text style={styles.volumeButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              <View style={deviceType === 2 ? {
                flexDirection: 'row',
                justifyContent: 'space-evenly',
                width: screenWidth / 2.5,
                alignSelf: 'center',
              } : {
                  flexDirection: 'row',
                  justifyContent: 'space-evenly',
                }}>
                <TouchableOpacity
                  style={{
                    ...buttonStyles.regularButton,
                    width: 100,
                    marginBottom: 10,
                  }}
                  onPress={!previewComplete && !isPlaying && bothVidsReady ? handleShowPreview : handleSave} >
                  <Text
                    style={{
                      ...buttonStyles.regularButtonText,
                      fontSize: Platform.OS === 'ios' ? 20 : 17,
                      fontWeight: Platform.OS === 'ios' ? 'normal' : 'bold',
                    }}>{!previewComplete && !isPlaying && bothVidsReady ? 'Preview' : 'Save'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    ...buttonStyles.regularButton,
                    width: 120,
                    marginBottom: 10,
                  }}
                  onPress={confirmRedo} >
                  <Text
                    style={{
                      ...buttonStyles.regularButtonText,
                      fontSize: Platform.OS === 'ios' ? 20 : 17,
                      fontWeight: Platform.OS === 'ios' ? 'normal' : 'bold',
                    }}>Re-record
              </Text>
                </TouchableOpacity>
              </View>
              {
                isPlaying &&
                <TouchableOpacity
                  // onPress={isPlaying ? handleProblem : handleHardRefresh}
                  onPress={handleRestart}
                  style={styles.problemContainer}
                >
                  <Text style={{ fontSize: 14, color: 'red' }}>Having a problem? Touch here to refresh.</Text>
                </TouchableOpacity>
              }
            </View>
          }
        </ScrollView>
      )
  )
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'center',
    // alignItems: 'center',
    backgroundColor: 'black',
    height: '100%',
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
    fontSize: 20,
    alignSelf: 'center',
    fontFamily: 'Gill Sans',
    fontWeight: '600',
    color: 'white',
  },
  button: {
    backgroundColor: "#0047B9",
    opacity: 1,
    alignSelf: 'center',
    borderColor: 'black',
    padding: 10,
    margin: 10,
    borderRadius: 5,
    borderWidth: 1
  },
  instruction: {
    color: 'white',
    marginTop: 10,
    marginBottom: Platform.OS === 'ios' ? 15 : 5,
    textAlign: 'center',
    fontSize: Platform.OS === 'ios' ? 16 : 14,
  },
  syncIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintTitle: {
    fontStyle: 'italic',
    marginTop: Platform.OS === 'ios' ? 10 : 4,
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
  volumeControlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 10,
    marginRight: 20,
    marginLeft: 20,
  },
  volumeControlsTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
    // marginTop: 10,
    marginBottom: 14,
  },
  volumeButtonsContainer: {
    flexDirection: 'row',
  },
  volumeControlsButton: {
    width: 30,
    height: 30,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  volumeInstructionText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
  },
  volumeButtonText: {
    color: 'white',
    textAlign: 'center',
    paddingBottom: 2,
    fontSize: 20,
  },
  problemContainer: {
    alignItems: 'center',
    paddingBottom: 10,
    marginTop: 5,
    height: 30,
  },
});

const mapState = ({ selectedVideo }) => {
  return {
    selectedVideo,
  }
}

export default connect(mapState)(PreviewAndSync);
