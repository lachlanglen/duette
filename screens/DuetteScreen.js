import React, { useState, useEffect } from 'react';
import { Alert, TouchableOpacity, StyleSheet, Text, View, SafeAreaView, FlatList, Platform, Dimensions } from 'react-native';
import { Searchbar } from 'react-native-paper';
import { connect } from 'react-redux';
import { setVideo } from '../redux/singleVideo'
import HeadphoneDetection from 'react-native-headphone-detection';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
import RecordDuetteModalIos from '../components/ios/RecordDuetteModal';
import RecordDuetteModalAndroid from '../components/android/RecordDuetteModal';
// import Constants from 'expo-constants';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as FileSystem from 'expo-file-system';
import * as Device from 'expo-device';
import * as Permissions from 'expo-permissions';
import { fetchVideos } from '../redux/videos';
import UserInfoMenu from '../components/UserInfoMenu';
import VideoItem from '../components/VideoItem';
import LoadingSpinner from '../components/LoadingSpinner';
import EditDetailsModal from '../components/EditDetailsModal';
import { getAWSVideoUrl } from '../constants/urls';
import { deleteLocalFile } from '../services/utils';
import { toggleUserInfo } from '../redux/userInfo';
import WelcomeModal from '../components/WelcomeFlow/WelcomeModal';
import RequestBaseTrackModal from '../components/RequestBaseTrackModal';

const DuetteScreen = (props) => {

  const [hasAudioPermission, setHasAudioPermission] = useState(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [showRecordDuetteModal, setShowRecordDuetteModal] = useState(false);
  const [showEditDetailsModal, setShowEditDetailsModal] = useState(false);
  const [showRequestBaseTrackModal, setShowRequestBaseTrackModal] = useState(false);
  const [previewVid, setPreviewVid] = useState('');
  const [searchText, setSearchText] = useState('');
  const [screenOrientation, setScreenOrientation] = useState('');
  const [baseTrackUri, setBaseTrackUri] = useState('');
  const [loading, setLoading] = useState({ isLoading: false, id: '' });
  const [deviceType, setDeviceType] = useState(null);

  let screenWidth = Math.round(Dimensions.get('window').width);
  let screenHeight = Math.round(Dimensions.get('window').height);

  useEffect(() => {
    const detectOrientation = () => {
      if (screenWidth > screenHeight) setScreenOrientation('LANDSCAPE');
      if (screenWidth < screenHeight) setScreenOrientation('PORTRAIT');
      ScreenOrientation.addOrientationChangeListener(info => {
        if (info.orientationInfo.orientation === 'UNKNOWN') {
          if (screenWidth > screenHeight) setScreenOrientation('LANDSCAPE');
          if (screenWidth < screenHeight) setScreenOrientation('PORTRAIT');
        } else {
          if (info.orientationInfo.orientation === 1 || info.orientationInfo.orientation === 2) setScreenOrientation('PORTRAIT');
          if (info.orientationInfo.orientation === 3 || info.orientationInfo.orientation === 4) setScreenOrientation('LANDSCAPE');
        }
      })
    };
    const getDeviceType = async () => {
      const type = await Device.getDeviceTypeAsync();
      setDeviceType(type);
    };
    detectOrientation();
    getDeviceType();
  });

  const exitPermissions = () => {
    deleteLocalFile(baseTrackUri);
    setLoading({ isLoading: false, id: '' });
  }

  const getPermissionsAndRecord = async () => {
    const perms = await Permissions.getAsync(Permissions.CAMERA, Permissions.AUDIO_RECORDING);
    if (perms.permissions.audioRecording.granted) {
      setHasAudioPermission(true);
    } else {
      const { status } = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
      if (status === 'granted') {
        setHasAudioPermission(true);
      } else {
        Alert.alert(
          `Oops...`,
          'Duette needs audio permissions in order to function correctly. Please enable audio permissions for Duette in your device settings.',
          [
            { text: 'OK', onPress: () => exitPermissions() },
          ],
          { cancelable: false }
        )
        throw new Error('Audio permissions not granted');
      }
    }
    if (perms.permissions.camera.granted) {
      setHasCameraPermission(true);
      setLoading({ isLoading: false, id: '' });
      activateKeepAwake();
      setShowRecordDuetteModal(true);
    } else {
      const { status } = await Permissions.askAsync(Permissions.CAMERA);
      if (status === 'granted') {
        setHasCameraPermission(true);
        setLoading({ isLoading: false, id: '' });
        activateKeepAwake();
        setShowRecordDuetteModal(true);
      } else {
        Alert.alert(
          `Oops...`,
          'Duette needs camera permissions in order to function correctly. Please enable camera permissions for Duette in your device settings.',
          [
            { text: 'OK', onPress: () => exitPermissions() },
          ],
          { cancelable: false }
        )
        throw new Error('Camera permissions not granted');
      }
    }
  };

  const loadVideo = async (id) => {
    // TODO: show error if not enough storage available?
    // console.log('hi in loadVideo')
    const freeDiskStorage = await FileSystem.getFreeDiskStorageAsync();
    const freeDiskStorageMb = freeDiskStorage / 1000000;
    console.log('freeDiskStorageMb: ', freeDiskStorageMb)
    if (freeDiskStorageMb < 100) {
      Alert.alert(
        'Not enough space available',
        `You don't have enough free space on your device to record a Duette. Please clear up approx. ${Math.ceil(100 - freeDiskStorageMb)}MB of space and try again!`,
        [
          { text: 'OK', onPress: () => { } },
        ],
        { cancelable: false }
      );
    } else {
      setLoading({ isLoading: true, id });
      if (previewVid) setPreviewVid('');
      props.setVideo(id);
      try {
        // if (Platform.OS === 'ios') {
        console.log('line 124')
        console.log('videoUrl: ', getAWSVideoUrl(id))
        const { uri } = await FileSystem.downloadAsync(
          getAWSVideoUrl(id),
          FileSystem.documentDirectory + `${id}.mov`
        );
        console.log('uri: ', uri)
        // console.log('line 129')
        setBaseTrackUri(uri);
        // }
        getPermissionsAndRecord();
      } catch (e) {
        console.log('error in DuetteScreen: ', e)
        Alert.alert(
          'Oops...',
          `We encountered a problem downloading this base track. Please check your internet connection and try again.`,
          [
            { text: 'OK', onPress: () => setLoading({ isLoading: false, id: '' }) },
          ],
          { cancelable: false }
        );
        throw new Error(`error in loadVideo. ${freeDiskStorageMb}MB available. error: `, e)
      }
    }
  }

  const handleUse = async (id) => {
    try {
      const { audioJack, bluetooth } = await HeadphoneDetection.isAudioDeviceConnected();
      if (!audioJack && !bluetooth) {
        Alert.alert(
          'No Headphones Detected',
          'You need to be using bluetooth or wired headphones in order to record a Duette. Please connect headphones and try again!',
          [
            { text: 'OK', onPress: () => { } },
          ],
          { cancelable: false }
        );
      } else {
        loadVideo(id);
      }
    } catch (e) {
      loadVideo(id);
      throw new Error('error detecting headphones: ', e)
    }
  };

  const handlePreview = (id) => {
    setPreviewVid(id);
  };

  const setFilteredVideos = text => {
    // console.log('props.user.id in setFilteredVideos: ', props.user.id)
    props.fetchVideos(text, props.user.id);
  };

  const handleSearch = text => {
    setSearchText(text);
    setFilteredVideos(text);
  };

  const handleHideUserInfo = () => {
    props.toggleUserInfo(false);
  };

  const RequestComponent = ({ unprompted }) => {
    return (
      <View style={{
        marginTop: unprompted ? 30 : 0,
      }}>
        <Text style={styles.blackText}>Don't see what you're looking for?</Text>
        <TouchableOpacity
          onPress={() => setShowRequestBaseTrackModal(true)}
        >
          <Text
            style={{
              ...styles.blueText,
              margin: 0,
              fontStyle: 'italic',
            }}>Request a Base Track</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    !props.user.id ? (
      !props.dataLoaded ? (
        <LoadingSpinner />
      ) : (
          <WelcomeModal />
        )
    ) : (
        showEditDetailsModal && props.selectedVideo.id ? (
          <EditDetailsModal
            id={props.selectedVideo.id}
            setShowEditDetailsModal={setShowEditDetailsModal}
            origTitle={props.selectedVideo.title}
            origComposer={props.selectedVideo.composer}
            origSongKey={props.selectedVideo.key}
            origPerformer={props.selectedVideo.performer}
            origNotes={props.selectedVideo.notes}
            origIsPrivate={props.selectedVideo.isPrivate}
            setSearchText={setSearchText}
            searchText={searchText}
          />
        ) : (
            showRecordDuetteModal ? (
              // RECORD A DUETTE
              <View
                style={styles.container}>
                {
                  Platform.OS === 'android' ? (
                    <RecordDuetteModalAndroid
                      setShowRecordDuetteModal={setShowRecordDuetteModal}
                      screenOrientation={screenOrientation}
                      baseTrackUri={baseTrackUri}
                      setSearchText={setSearchText}
                    />
                  ) : (
                      <RecordDuetteModalIos
                        setShowRecordDuetteModal={setShowRecordDuetteModal}
                        baseTrackUri={baseTrackUri}
                        setSearchText={setSearchText}
                      />
                    )
                }
              </View>
            ) : (
                showRequestBaseTrackModal ? (
                  <RequestBaseTrackModal
                    setShowRequestBaseTrackModal={setShowRequestBaseTrackModal}
                  />
                ) : (
                    // VIEW VIDEOS
                    <View
                      style={styles.listContainer}>
                      <SafeAreaView
                        onTouchStart={props.displayUserInfo ? handleHideUserInfo : () => { }}
                        style={styles.listContainer}
                      >
                        <Searchbar
                          placeholder="Try 'No Such Thing'"
                          onChangeText={handleSearch}
                          style={styles.searchbar}
                          value={searchText}
                        />
                        {
                          !searchText ? (
                            <View
                              onTouchStart={props.displayUserInfo ? handleHideUserInfo : () => { }}
                            >
                              <Text style={styles.blueText}>
                                {"Search for a base track by title, performer, composer/songwriter, key or ID!"}
                              </Text>
                              <RequestComponent
                                unprompted={true}
                              />
                            </View>
                          ) : (
                              props.videos.length > 0 ? (
                                // SEARCH YIELDED RESULTS
                                <View
                                  style={{ flex: 1, paddingBottom: 10 }}>
                                  <FlatList
                                    data={props.videos}
                                    renderItem={({ item }) => (
                                      <VideoItem
                                        id={item.id}
                                        title={item.title}
                                        performer={item.performer}
                                        composer={item.composer}
                                        theKey={item.key}
                                        notes={item.notes}
                                        userId={item.userId}
                                        userReference={item.userReference}
                                        isPrivate={item.isPrivate}
                                        previewVid={previewVid}
                                        setPreviewVid={setPreviewVid}
                                        handlePreview={handlePreview}
                                        handleUse={handleUse}
                                        setShowEditDetailsModal={setShowEditDetailsModal}
                                        showEditDetailsModal={showEditDetailsModal}
                                        loading={loading}
                                        searchText={searchText}
                                        deviceType={deviceType}
                                      />
                                    )}
                                    keyExtractor={item => item.id}
                                    viewabilityConfig={{}}
                                    ListFooterComponent={RequestComponent}
                                    ListFooterComponentStyle={{ paddingBottom: 20 }}
                                  />
                                </View>
                              ) : (
                                  // SEARCH YIELDED NO RESULTS

                                  // showRequestBaseTrackModal ? (
                                  // <RequestBaseTrackModal
                                  //   setShowRequestBaseTrackModal={setShowRequestBaseTrackModal}
                                  // />
                                  // ) : (
                                  <View>
                                    <Text style={{
                                      ...styles.blueText,
                                      paddingBottom: 50,
                                    }}>
                                      No base tracks found matching "{searchText}" 😿
                                </Text>
                                    <RequestComponent />
                                  </View>
                                  // )
                                )
                            )
                        }
                      </SafeAreaView>
                      {
                        props.displayUserInfo &&
                        <UserInfoMenu />
                      }
                    </View >
                  )
              )
          )
      )
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 5,
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#ffd12b',
  },
  searchbar: {
    borderRadius: 0,
    borderBottomColor: 'grey',
    borderBottomWidth: 2,
  },
  blueText: {
    margin: 10,
    alignSelf: 'center',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0047b9',
  },
  blackText: {
    margin: 10,
    alignSelf: 'center',
    textAlign: 'center',
    fontStyle: 'italic',
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
});


const mapState = ({ videos, selectedVideo, displayUserInfo, user, dataLoaded, error }) => {
  return {
    videos,
    selectedVideo,
    user,
    displayUserInfo,
    dataLoaded,
    error,
  }
}

const mapDispatch = dispatch => {
  return {
    setVideo: id => dispatch(setVideo(id)),
    fetchVideos: (text, userId) => dispatch(fetchVideos(text, userId)),
    toggleUserInfo: bool => dispatch(toggleUserInfo(bool)),
  }
}

export default connect(mapState, mapDispatch)(DuetteScreen);
