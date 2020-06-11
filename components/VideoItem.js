/* eslint-disable complexity */
import React from 'react';
import { connect } from 'react-redux';
import { Text, TouchableOpacity, View, Dimensions, StyleSheet, Image, Alert, Platform, ActivityIndicator } from 'react-native';
import { Video } from 'expo-av';
import { getAWSVideoUrl, getAWSThumbnailUrl } from '../constants/urls';
import { deleteVideo } from '../redux/videos';
import { setVideo } from '../redux/singleVideo';
import { toggleUpgradeOverlay } from '../redux/upgradeOverlay';
import buttonStyles from '../styles/button';

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
        Composer: {composer ? composer : 'Unknown'}
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
            loading.isLoading && loading.id === id &&
            <ActivityIndicator style={{ marginLeft: 20 }} />
          }
        </Text>
      </TouchableOpacity>
      {
        props.user.id === userId &&
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
    toggleUpgradeOverlay: bool => dispatch(toggleUpgradeOverlay(bool)),
  }
};

export default connect(mapState, mapDispatch)(VideoItem);
