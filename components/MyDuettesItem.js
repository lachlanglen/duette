import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Image, Alert, Text, View, Dimensions, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as StoreReview from 'expo-store-review';
import * as FileSystem from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';
import { Video } from 'expo-av';
import { getAWSVideoUrl, getAWSThumbnailUrl } from '../constants/urls';
import buttonStyles from '../styles/button';
import { deleteLocalFile } from '../services/utils';
import { toggleRequestReview } from '../redux/requestReview';
import { toggleUserInfo } from '../redux/userInfo';

const MyDuettesItem = props => {
  const {
    videoId,
    duetteId,
    videoTitle,
    selectedDuette,
    setSelectedDuette,
    screenOrientation,
    screenWidth,
    screenHeight,
    showPreview,
    setShowPreview,
    handleToggleUpgradeOverlay,
  } = props;

  // let screenWidth = Math.round(Dimensions.get('window').width);
  // let screenHeight = Math.round(Dimensions.get('window').height);

  const [savingToCameraRoll, setSavingToCameraRoll] = useState(false);
  const [loading, setLoading] = useState(false);

  const combinedKey = `${videoId}${duetteId}`;

  const requestReview = async () => {
    console.log('props.requestReview: ', props.requestReview)
    // check for redux toggle
    if (props.requestReview) {
      // check if review request is available
      const available = await StoreReview.isAvailableAsync();
      console.log('available: ', available);
      if (available) {
        // request review
        await StoreReview.requestReview();
        console.log('review requested!')
        // set on secure store
        const currentTime = Date.now().toString();
        await SecureStore.setItemAsync('reviewRequestTimeMillis', currentTime);
        console.log('set on secure store!')
        // change toggle to false
        props.toggleRequestReview(false);
      }
    }
  }

  const handleExitAlert = (success) => {
    console.log('success: ', success)
    if (success) {
      requestReview();
    }
    setSavingToCameraRoll(false);
    setLoading(false);
    setSelectedDuette('');
    props.toggleUserInfo(false);
  };

  const saveVideo = async (key) => {
    setLoading(true);
    try {
      const { uri } = await FileSystem.downloadAsync(
        getAWSVideoUrl(`duette/${key}`),
        FileSystem.documentDirectory + `${key}.mov`
      )
      setSavingToCameraRoll(true);
      try {
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert(
          'Saved!',
          'This Duette has been saved to your Camera Roll',
          [
            { text: 'OK', onPress: handleExitAlert('success') },
          ],
          { cancelable: false }
        );
        deleteLocalFile(uri);
      } catch (e) {
        Alert.alert(
          `We're sorry`,
          'This video could not be saved to your camera roll at this time.',
          [
            { text: 'OK', onPress: () => handleExitAlert() },
          ],
          { cancelable: false }
        )
        throw new Error('error saving to camera roll: ', e);
      }
    } catch (e) {
      Alert.alert(
        `We're sorry`,
        'This video could not be saved to your camera roll at this time.',
        [
          { text: 'OK', onPress: () => handleExitAlert() },
        ],
        { cancelable: false }
      )
      throw new Error('error downloading to local file: ', e);
    }
  };

  const playPreview = () => {
    setSelectedDuette(duetteId);
    setShowPreview(true);
  }

  const handleSaveToCameraRoll = async (duetteId, combinedKey) => {
    setSelectedDuette(duetteId);
    const permission = await MediaLibrary.getPermissionsAsync();
    if (permission.status !== 'granted') {
      const newPermission = await MediaLibrary.requestPermissionsAsync();
      if (newPermission.status === 'granted') {
        saveVideo(combinedKey);
      } else {
        Alert.alert(
          'Camera Roll',
          'We need your permission to save to your Camera Roll!',
          [
            { text: 'OK', onPress: () => setSavingToCameraRoll(false) },
          ],
          { cancelable: false }
        );
      }
    } else {
      saveVideo(combinedKey);
    }
  };

  const handlePlaybackStatusUpdate = (updateObj) => {
    if (updateObj.didJustFinish) {
      setSelectedDuette('');
      setShowPreview(false);
    }
  };

  return (
    <View
      style={{
        backgroundColor: 'white',
        marginVertical: 10,
        marginHorizontal: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'darkgrey',
        paddingVertical: 10,
        height: screenWidth / 16 * 9 + 50,
        width: screenWidth - 30,
        alignItems: 'center',
      }}>
      {
        selectedDuette === duetteId && showPreview ? (
          <Video
            source={{ uri: getAWSVideoUrl(`duette/${combinedKey}`) }}
            shouldPlay={true}
            useNativeControls={true}
            onPlaybackStatusUpdate={update => handlePlaybackStatusUpdate(update)}
            style={{
              width: screenWidth * 0.85,
              height: screenWidth * 0.85 / 16 * 9,
              borderRadius: 10,
            }} />
        ) : (
            <View>
              <Image
                style={{
                  width: screenWidth * 0.85,
                  height: screenWidth * 0.85 / 16 * 9,
                  borderRadius: 10,
                }}
                source={{ uri: getAWSThumbnailUrl(`duette/${combinedKey}`) }} />
              <TouchableOpacity
                onPress={playPreview}
                style={{
                  width: screenWidth * 0.85,
                  height: screenWidth * 0.85 / 16 * 9,
                  borderRadius: 10,
                  backgroundColor: 'white',
                  opacity: 0.5,
                  position: 'absolute',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text style={{
                  fontSize: 30,
                  alignSelf: 'center',
                  fontFamily: 'Gill Sans',
                  fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
                  color: '#0047B9',
                }}>"{videoTitle}"</Text>
                <Text style={{
                  fontSize: 20,
                  alignSelf: 'center',
                  fontFamily: 'Gill Sans',
                  fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
                  color: 'black',
                  marginTop: 20,
                }}>Touch to view</Text>
              </TouchableOpacity>
            </View>
          )
      }
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <TouchableOpacity
          onPress={() => handleSaveToCameraRoll(duetteId, combinedKey)}
          disabled={savingToCameraRoll}
          style={{
            ...buttonStyles.regularButton,
            width: screenWidth * 0.85,
            marginTop: 10,
            marginBottom: 0,
            backgroundColor: loading || savingToCameraRoll ? 'lightgrey' : '#0047B9',
            borderColor: loading || savingToCameraRoll ? 'white' : 'darkblue',
          }}>
          {
            !loading ? (
              <Text style={{
                ...buttonStyles.regularButtonText,
                fontWeight: Platform.OS === 'ios' ? 'normal' : 'bold',
              }}>Save to Camera Roll
              </Text>
            ) : (
                <View style={{ flexDirection: 'row' }}>
                  <Text style={{
                    ...buttonStyles.regularButtonText,
                    fontWeight: 'normal',
                  }}>{savingToCameraRoll ? 'Saving to Camera Roll...' : 'Loading...'}
                  </Text>
                  <ActivityIndicator size="small" color="#0047B9" />
                </View>
              )
          }
        </TouchableOpacity>
        {/* <TouchableOpacity
          onPress={handleToggleUpgradeOverlay}
          style={{
            marginTop: 7,
          }}>
          <Text
            style={{
              color: '#0047B9',
            }}>Save without Duette logo</Text>
        </TouchableOpacity> */}
      </View>
    </View >
  )
};

const mapState = ({ requestReview }) => {
  return {
    requestReview,
  }
};

const mapDispatch = dispatch => {
  return {
    toggleRequestReview: bool => dispatch(toggleRequestReview(bool)),
    toggleUserInfo: bool => dispatch(toggleUserInfo(bool)),
  }
};

export default connect(mapState, mapDispatch)(MyDuettesItem);
