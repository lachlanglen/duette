/* eslint-disable complexity */
import React, { useState, useEffect } from 'react';
import { Image, Text, View, Modal, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { connect } from 'react-redux';
import { postVideo } from '../redux/videos';
import Form from './Form';
import { updateVideo, clearVideo } from '../redux/singleVideo';
import { clearError } from '../redux/error';

const EditDetailsModal = (props) => {

  const {
    id,
    setShowEditDetailsModal,
    origTitle,
    origComposer,
    origSongKey,
    origPerformer,
    origNotes,
    setSearchText,
    searchText,
  } = props;

  const [title, setTitle] = useState(origTitle);
  const [composer, setComposer] = useState(origComposer);
  const [songKey, setSongKey] = useState(origSongKey);
  const [performer, setPerformer] = useState(origPerformer);
  const [notes, setNotes] = useState(origNotes);
  const [updatesSubmitted, setUpdatesSubmitted] = useState(false);

  useEffect(() => {
    if (updatesSubmitted && props.error.errorRegistered) {
      if (!props.error.isError) {
        Alert.alert(
          'Updated!',
          "Your updates have been successfully saved.",
          [
            { text: 'OK', onPress: () => handleDone() },
          ],
          { cancelable: false }
        );
      } else {
        Alert.alert(
          'Oops...',
          "We could not save your updates. Please try again later.",
          [
            { text: 'OK', onPress: () => handleDone(props.error.message) },
          ],
          { cancelable: false }
        );
      }
    }
  })

  const handleDone = (msg) => {
    setUpdatesSubmitted(false);
    props.clearVideo();
    props.clearError();
    setShowEditDetailsModal(false);
    if (msg) {
      throw new Error('Error saving video updates: ', msg)
    }
  };

  const handleUpdate = () => {
    props.updateVideoDetails(props.user.id, id, { title, composer, key: songKey, performer, notes }, searchText);
    setUpdatesSubmitted(true);
  }

  return (
    <View style={styles.container}>
      <Modal
        supportedOrientations={['portrait', 'landscape', 'landscape-right']}
      >
        <KeyboardAwareScrollView>
          <Form
            handleUpdate={handleUpdate}
            title={title}
            setTitle={setTitle}
            composer={composer}
            setComposer={setComposer}
            songKey={songKey}
            setSongKey={setSongKey}
            performer={performer}
            setPerformer={setPerformer}
            notes={notes}
            setNotes={setNotes}
            setShowEditDetailsModal={setShowEditDetailsModal}
            type="update" />
        </KeyboardAwareScrollView>
      </Modal>
    </View >
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    marginTop: 50,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  titleTextBlue: {
    fontSize: 20,
    fontWeight: 'bold',
    alignSelf: 'center',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
    marginHorizontal: 10,
    color: '#0047B9'
  },
  successCat: {
    margin: 10,
    width: 300,
    height: 285,
    alignSelf: 'center',
    borderColor: 'black',
    borderWidth: 2
  }
});

const mapState = ({ user, selectedVideo, error }) => {
  return {
    user,
    selectedVideo,
    error,
  }
}

const mapDispatch = dispatch => {
  return {
    postVideo: details => dispatch(postVideo(details)),
    updateVideoDetails: (userId, videoId, newDetails, text) => dispatch(updateVideo(userId, videoId, newDetails, text)),
    clearVideo: () => dispatch(clearVideo()),
    clearError: () => dispatch(clearError()),
  }
}

export default connect(mapState, mapDispatch)(EditDetailsModal);
