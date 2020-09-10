import React, { useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { PermissionsAndroid, Image, Alert, Text, View, Dimensions, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as StoreReview from 'expo-store-review';
import * as FileSystem from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';
import Toast from 'react-native-simple-toast';
import { Video } from 'expo-av';
import { getAWSVideoUrl, getAWSThumbnailUrl } from '../constants/urls';
import buttonStyles from '../styles/button';
import { deleteLocalFile } from '../services/utils';
import { toggleRequestReview } from '../redux/requestReview';
import { toggleUserInfo } from '../redux/userInfo';
import { deleteDuette } from '../redux/duettes';
// import CameraRoll from "@react-native-community/cameraroll";

const MyDuettesItem = props => {
  const {
    videoId,
    duetteId,
    videoTitle,
    userId,
    selectedDuette,
    setSelectedDuette,
    screenOrientation,
    screenWidth,
    screenHeight,
    showPreview,
    setShowPreview,
    handleToggleUpgradeOverlay,
  } = props;

  const dispatch = useDispatch();

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

  const handleExitAlert = (uri, success) => {
    console.log('success: ', success)
    if (success) {
      requestReview();
    }
    deleteLocalFile(uri);
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
      console.log('uri: ', uri)
      setSavingToCameraRoll(true);
      // if (Platform.OS === 'ios') {
      try {
        await MediaLibrary.saveToLibraryAsync(uri);
        // const asset = await MediaLibrary.createAssetAsync(uri);
        // console.log('asset: ', asset)
        // const album = await MediaLibrary.createAlbumAsync('Duette', asset)
        // console.log('album: ', album)
        Alert.alert(
          'Saved!',
          `This Duette has been saved to your ${Platform.OS === 'ios' ? 'Camera Roll' : 'device'}.`,
          [
            { text: 'OK', onPress: handleExitAlert(uri, 'success') },
          ],
          { cancelable: false }
        );
      } catch (e) {
        Alert.alert(
          `We're sorry`,
          `This video could not be saved to your ${Platform.OS === 'ios' ? 'Camera Roll' : 'device'} at this time.`,
          [
            { text: 'OK', onPress: () => handleExitAlert(uri) },
          ],
          { cancelable: false }
        )
        throw new Error(`error saving to ${Platform.OS === 'ios' ? 'Camera Roll' : 'device'}: `, e);
      }
      // } else {
      //   console.log('line 104')
      //   try {
      //     const saved = await CameraRoll.save(uri);
      //     console.log('saved: ', saved)
      //   } catch (e) {
      //     console.log('error saving: ', e)
      //   }
      // }
    } catch (e) {
      Alert.alert(
        `We're sorry`,
        `This video could not be saved to your ${Platform.OS === 'ios' ? 'Camera Roll' : 'device'} at this time.`,
        [
          { text: 'OK', onPress: () => handleExitAlert(uri) },
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

  const hasAndroidPermission = async () => {
    console.log('in hasAndroidPermission')
    const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;

    const hasPermission = await PermissionsAndroid.check(permission);
    console.log('hasPermission: ', hasPermission)
    if (hasPermission) {
      return true;
    }

    const status = await PermissionsAndroid.request(permission);
    if (status !== 'granted') {
      Alert.alert(
        'Device Permission',
        'We need your permission to save to your device!',
        [
          { text: 'OK', onPress: () => setSavingToCameraRoll(false) },
        ],
        { cancelable: false }
      );
    }
    console.log('status: ', status)
    return status === 'granted';
  }


  const handleSaveToCameraRoll = async (duetteId, combinedKey) => {
    setSelectedDuette(duetteId);
    // if (Platform.OS === 'ios') {
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
    // } else {
    // if (!(hasAndroidPermission())) return;
    // saveVideo(combinedKey);
    // }
  };

  const handleDelete = () => {
    Alert.alert(
      'Are you sure you want to delete this Duette?',
      `This cannot be undone.${Platform.OS === 'ios' ? ' 💀' : ''}`,
      [
        { text: 'Yes, delete it!', onPress: () => dispatch(deleteDuette({ duetteId, videoId, userId: props.user.id, onSuccess: () => Toast.show('Duette successfully deleted!'), onFailure: () => Toast.show('Error deleting Duette. Please try again later.') })) },
        { text: 'Cancel', onPress: () => { } }
      ],
      { cancelable: false }
    );
  }

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
        height: userId === props.user.id ? screenWidth / 16 * 9 + 68 : screenWidth / 16 * 9 + 50,
        width: screenWidth - 30,
        alignItems: 'center',
      }}>
      {
        selectedDuette === duetteId && showPreview ? (
          <Video
            source={{ uri: getAWSVideoUrl(`duette/${combinedKey}`) }}
            shouldPlay={true}
            resizeMode='contain'
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
                  padding: 10,
                  borderRadius: 10,
                  backgroundColor: 'white',
                  opacity: 0.5,
                  position: 'absolute',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text style={{
                  fontSize: Platform.OS === 'ios' ? 30 : 26,
                  textAlign: 'center',
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
              }}>{`Save to ${Platform.OS === 'ios' ? 'Camera Roll' : 'Device'}`}
              </Text>
            ) : (
                <View style={{ flexDirection: 'row' }}>
                  <Text style={{
                    ...buttonStyles.regularButtonText,
                    fontWeight: 'normal',
                  }}>{savingToCameraRoll ? `Saving to ${Platform.OS === 'ios' ? 'Camera Roll' : 'Device'}...` : 'Loading...'}
                  </Text>
                  <ActivityIndicator size="small" color="#0047B9" />
                </View>
              )
          }
        </TouchableOpacity>
        {
          userId === props.user.id &&
          <TouchableOpacity
            onPress={handleDelete}>
            <Text style={{
              textAlign: 'center',
              color: 'red',
              fontSize: 16,
              paddingTop: 5,
            }}>Delete</Text>
          </TouchableOpacity>
        }
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

const mapState = ({ requestReview, user }) => {
  return {
    requestReview,
    user
  }
};

const mapDispatch = dispatch => {
  return {
    toggleRequestReview: bool => dispatch(toggleRequestReview(bool)),
    toggleUserInfo: bool => dispatch(toggleUserInfo(bool)),
  }
};

export default connect(mapState, mapDispatch)(MyDuettesItem);
