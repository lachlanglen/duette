/* eslint-disable complexity */
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { findNodeHandle, ActionSheetIOS, Text, TouchableOpacity, View, Dimensions, StyleSheet, Image, Alert, Platform, ActivityIndicator } from 'react-native';
import { Video } from 'expo-av';
import { getAWSVideoUrl, getAWSThumbnailUrl } from '../constants/urls';
import { deleteVideo } from '../redux/videos';
import { setVideo } from '../redux/singleVideo';
import { fetchVideos } from '../redux/videos';
import { toggleUpgradeOverlay } from '../redux/upgradeOverlay';
import buttonStyles from '../styles/button';
import axios from 'axios';

const VideoItem = (props) => {

  const {
    id,
    title,
    composer,
    theKey,
    notes,
    performer,
    userId,
    previewVid,
    setPreviewVid,
    handlePreview,
    handleUse,
    setShowEditDetailsModal,
    loading,
    searchText,
  } = props;

  let screenWidth = Math.floor(Dimensions.get('window').width);

  const [flagging, setFlagging] = useState(false);
  const [flagButtonRef, setFlagButtonRef] = useState(null);

  const handlePlaybackStatusUpdate = (updateObj) => {
    if (updateObj.didJustFinish) setPreviewVid('')
  };

  const handleDelete = () => {
    Alert.alert(
      'Are you sure you want to delete this video?',
      `This cannot be undone.${Platform.OS === 'ios' ? ' 💀' : ''}`,
      [
        { text: 'Yes, delete it!', onPress: () => props.deleteVideo(props.user.id, id, searchText) },
        { text: 'Cancel', onPress: () => { } }
      ],
      { cancelable: false }
    );
  };

  const handleShowNotes = () => {
    Alert.alert(
      `Notes from ${performer.split(' ')[0]}:`,
      `"${notes}"`,
      [
        {
          text: 'Dismiss',
          onPress: () => { },
        },
      ],
      { cancelable: false }
    );
  }

  const handleEdit = () => {
    props.setVideo(id);
    setShowEditDetailsModal(true);
  };

  const handleToggleUpgradeOverlay = () => {
    props.toggleUpgradeOverlay(!props.displayUpgradeOverlay);
  };

  const handleExitBlock = () => {
    props.fetchVideos(searchText, props.user.id);
    setFlagging(false);
  };

  const handleExitFlag = async () => {
    setFlagging(false);
    try {
      await axios.post(`https://duette.herokuapp.com/api/flag/${id}`, { flaggingUserId: props.user.id, flaggedUserId: userId })
    } catch (e) {
      throw new Error('error in handleExitFlag: ', e)
    }
  }

  const handleBlockUser = async () => {
    try {
      // TODO: change url below back to heroku
      await axios.post('https://duette.herokuapp.com/api/user/block', { blockingUser: props.user.id, userToBlock: userId })
      Alert.alert(
        'User Blocked',
        "You will no longer see this user's videos in search results.",
        [
          { text: "OK", onPress: () => handleExitBlock() },
        ],
        { cancelable: false }
      );
    } catch (e) {
      Alert.alert(
        'Error Blocking',
        'We unfortunately were not able to block this user at this time. Please contact us at support@duette.app or try again later.',
        [
          { text: 'OK', onPress: () => setFlagging(false) },
        ],
        { cancelable: false }
      );
      throw new Error('Error blocking user: ', e);
    }
  };

  const handleFlagInappropriateContent = () =>
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ["Cancel", "Flag offensive content", "Block this user"],
        destructiveButtonIndex: 2,
        cancelButtonIndex: 0,
        anchor: findNodeHandle(flagButtonRef)
      },
      async buttonIndex => {
        setFlagging(true);
        if (buttonIndex === 0) {
          // cancel action
          setFlagging(false);
          console.log('cancelled!')
        } else if (buttonIndex === 1) {
          // flag objectionable content
          // try {
          // await axios.post(`https://duette.herokuapp.com/api/flag/${id}`, { flaggingUserId: props.user.id, flaggedUserId: userId })
          Alert.alert(
            'Content Flagged',
            'Thank you for flagging this content. We will review it within 24 hours, and take appropriate action if it violates our community guidelines.',
            [
              { text: 'OK', onPress: () => handleExitFlag() },
            ],
            { cancelable: false }
          );
          // } catch (e) {
          // Alert.alert(
          //   'Error Flagging',
          //   'We unfortunately were not able to flag this content at this time. Please contact us at support@duette.app in order to flag this video for inappropriate content.',
          //   [
          //     { text: 'OK', onPress: () => setFlagging(false) },
          //   ],
          //   { cancelable: false }
          // );
          // throw new Error('Error flagging content: ', e);
          // }
        } else if (buttonIndex === 2) {
          // block user's video
          Alert.alert(
            'Are you sure?',
            'This cannot be undone. If you block this user, you will no longer be able to search for or record along with any of their base tracks.',
            [
              { text: "Yes, I'm sure", onPress: () => handleBlockUser() },
              { text: "Cancel", onPress: () => setFlagging(false) },
            ],
            { cancelable: false }
          );
        }
      }
    );

  return (
    <View style={styles.item}>
      <View>
        {
          previewVid === id ? (
            <Video
              source={{ uri: getAWSVideoUrl(id) }}
              rate={1.0}
              volume={1.0}
              isMuted={false}
              resizeMode="cover"
              shouldPlay
              useNativeControls={true}
              isLooping={false}
              onPlaybackStatusUpdate={update => handlePlaybackStatusUpdate(update)}
              style={{
                ...styles.media,
                width: screenWidth * 0.8,
                height: screenWidth * 0.8 / 8 * 9
              }} />
          ) : (
              <View>
                <Image
                  source={{ uri: getAWSThumbnailUrl(id) }}
                  style={{
                    ...styles.media,
                    width: screenWidth * 0.8,
                    height: screenWidth * 0.8 / 8 * 9
                  }} />
                <TouchableOpacity
                  style={{
                    ...styles.overlay,
                    width: screenWidth * 0.8,
                    height: screenWidth * 0.8 / 8 * 9
                  }}
                  onPress={() => handlePreview(id)}
                >
                  <Text style={styles.overlayText}>Touch to preview</Text>
                </TouchableOpacity>
              </View>
            )
        }
        {/* <TouchableOpacity
          onPress={handleToggleUpgradeOverlay}
          style={{
            width: 80,
            backgroundColor: '#e43',
            position: 'absolute',
            top: -10,
            right: 0,
            borderTopRightRadius: 9,
            borderBottomLeftRadius: 10,
            // letterSpacing: 1,
            // transform: [{ rotate: '45deg' }],
          }}>
          <Text
            style={{
              color: 'white',
              textAlign: 'center',
              lineHeight: 50,
              fontSize: 20,
              textTransform: 'uppercase',
              fontWeight: 'bold',
            }}>
            pro
            </Text>
        </TouchableOpacity> */}
      </View>
      <Text
        style={{
          ...styles.title,
          width: screenWidth * 0.8,
          fontWeight: Platform.OS === 'android' ? 'bold' : '400'
        }}>
        "{title}"
      </Text>
      <Text
        style={styles.details}>
        Written by: {composer ? composer : 'Unknown'}
      </Text>
      <Text
        style={styles.details}>
        Key: {theKey ? theKey : 'Unknown'}
      </Text>
      <Text
        style={{
          ...styles.details,
          fontWeight: Platform.OS === 'android' ? 'bold' : '400'
        }}>
        Performed by {performer}
      </Text>
      {
        notes ? (
          <TouchableOpacity
            disabled={loading.isLoading && loading.id === id}
            onPress={handleShowNotes}
            style={{
              alignItems: 'center',
              marginTop: 8,
            }}>
            <Text style={{
              color: '#0047B9',
            }}>View {performer.split(' ')[0]}'s notes</Text>
          </TouchableOpacity>
        ) : (
            <View
              style={{
                alignItems: 'center',
                marginTop: 8,
              }}>
              <Text style={{
                fontStyle: 'italic',
              }}>No notes provided by {performer.split(' ')[0]}</Text>
            </View>
          )
      }
      <TouchableOpacity
        disabled={loading.isLoading && loading.id === id}
        onPress={() => handleUse(id)}
        style={{
          ...styles.button,
          // ...buttonStyles.regularButton,
          width: loading.isLoading && loading.id === id ? '85%' : '70%',
        }}>
        <Text style={{
          ...styles.buttonText,
          // ...buttonStyles.regularButtonText,
          fontWeight: Platform.OS === 'ios' ? 'normal' : 'bold',
          fontSize: loading.isLoading && loading.id === id ? 25 : 30,
        }}>
          {loading.isLoading && loading.id === id ? 'Loading, please wait...' : 'Record Duette!'}
          {
            loading.isLoading && loading.id === id && Platform.OS === 'ios' &&
            <ActivityIndicator style={{ marginLeft: 20 }} />
          }
        </Text>
      </TouchableOpacity>
      {
        props.user.id === userId ? (
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-evenly',
          }}>
            <TouchableOpacity
              onPress={handleDelete}>
              <Text style={{
                textAlign: 'center',
                color: 'red',
                fontSize: 16,
              }}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleEdit}>
              <Text style={{
                textAlign: 'center',
                color: '#0047B9',
                fontSize: 16,
              }}>Edit Details</Text>
            </TouchableOpacity>
          </View>
        ) : (
            <TouchableOpacity
              onPress={handleFlagInappropriateContent}
              disabled={flagging}
              ref={ref => setFlagButtonRef(ref)}
              style={{
                // width: 24,
                // height: 24,
                // alignSelf: 'flex-end',
                // alignItems: 'center',
                // justifyContent: 'flex-end',
                // backgroundColor: 'gray',
                // marginRight: 10,
                // marginBottom: 30,
                // borderRadius: 50,
              }}>
              <Text
                style={{
                  textAlign: 'center',
                  color: '#0047B9',
                  fontSize: 16,
                }}
              >{flagging ? 'Flagging...' : 'Flag inappropriate content'}</Text>
            </TouchableOpacity>
          )
      }
    </View >
  )
};

const styles = StyleSheet.create({
  item: {
    backgroundColor: 'white',
    marginVertical: 10,
    marginHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'darkgrey',
    paddingVertical: 10
  },
  title: {
    fontSize: 32,
    alignSelf: 'center',
    textAlign: 'center',
    fontFamily: 'Gill Sans',
    fontWeight: '600',
    margin: 2,
    color: 'black'
  },
  details: {
    fontSize: 20,
    alignSelf: 'center',
    fontFamily: 'Gill Sans',
    fontWeight: '100',
    margin: 1.5,
    color: 'black'
  },
  overlay: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DDDDDD',
    padding: 10,
    position: 'absolute',
    opacity: 0.5,
    alignSelf: 'center',
    borderRadius: 5,
    marginTop: 15
  },
  overlayText: {
    fontSize: 20,
    alignSelf: 'center',
    fontFamily: 'Gill Sans',
    fontWeight: '600',
    color: 'black',
  },
  button: {
    marginTop: 12,
    marginBottom: 7,
    paddingHorizontal: 3,
    paddingVertical: 11,
    width: '70%',
    alignSelf: 'center',
    backgroundColor: '#187795',
    borderColor: 'darkgrey',
    borderWidth: 1.5,
    borderRadius: 5,
  },
  buttonText: {
    fontFamily: 'Gill Sans',
    fontSize: 30,
    fontWeight: '400',
    alignSelf: 'center',
    color: 'white',
  },
  media: {
    borderWidth: 1.5,
    borderColor: '#2589BD',
    borderRadius: 5,
    alignSelf: 'center',
    marginTop: 15,
  }
});

const mapState = ({ user, displayUpgradeOverlay }) => {
  return {
    displayUpgradeOverlay,
    user,
  }
};

const mapDispatch = dispatch => {
  return {
    deleteVideo: (userId, videoId, searchText) => dispatch(deleteVideo(userId, videoId, searchText)),
    setVideo: id => dispatch(setVideo(id)),
    fetchVideos: (text, userId) => dispatch(fetchVideos(text, userId)),
    toggleUpgradeOverlay: bool => dispatch(toggleUpgradeOverlay(bool)),
  }
};

export default connect(mapState, mapDispatch)(VideoItem);
