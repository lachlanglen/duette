/* eslint-disable complexity */
import React, { useState, useEffect } from 'react';
import { SafeAreaView, Modal, Image, Text, View, Button, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { deactivateKeepAwake } from 'expo-keep-awake';
import { connect } from 'react-redux';
import { postVideo } from '../redux/videos';
import Form from './DetailsForm';
import buttonStyles from '../styles/button';
import SavingVideo from './SavingVideo';
import AddEmailModal from './AddEmailModal';

const DetailsModal = (props) => {
  const {
    setRecord,
    setPreview,
    setShowDetailsModal,
    dataUri,
    deviceType,
  } = props;

  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [composer, setComposer] = useState('');
  const [songKey, setSongKey] = useState('');
  const [performer, setPerformer] = useState(props.user.name);
  const [notes, setNotes] = useState('');
  const [showAddEmailModal, setShowAddEmailModal] = useState(false);
  const [updatedEmail, setUpdatedEmail] = useState(null);
  const [makePrivate, setMakePrivate] = useState(false);

  const handleSave = () => {
    Alert.alert(
      'Agree to Terms',
      `By saving this ${makePrivate ? 'private' : 'public'} base track, you are making it available to any user on the Duette app${makePrivate ? ' who searches for it by its ID.' : '.'} You can delete it or change its privacy settings at any time by searching for the video and selecting 'Delete' or 'Edit Details'. You are also confirming that this video does not contain inappropriate content. Do you wish to continue?`,
      [
        { text: 'Yes, I agree', style: 'cancel', onPress: () => !props.user.email ? setShowAddEmailModal(true) : setSaving(true) },
        { text: 'Cancel', onPress: () => { } },
      ],
      { cancelable: false }
    );
    // if (!props.user.email) {
    //   setShowAddEmailModal(true);
    // } else {
    //   setSaving(true);
    // }
  };

  const handleExit = () => {
    setSaving(false);
    deactivateKeepAwake();
    setRecord(false);
    setPreview(false);
    setShowDetailsModal(false);
  };

  return (
    saving ? (
      <SavingVideo
        dataUri={dataUri}
        setSaving={setSaving}
        title={title}
        composer={composer ? composer : null}
        songKey={songKey ? songKey : null}
        performer={performer}
        notes={notes}
        handleExit={handleExit}
        makePrivate={makePrivate}
        type="base track"
        updatedEmail={updatedEmail}
      />
    ) : (
        !showAddEmailModal ? (
          <View style={styles.container}>
            <Modal
              supportedOrientations={['portrait', 'landscape', 'landscape-right']}
            >
              <KeyboardAwareScrollView>
                <Form
                  handleSave={handleSave}
                  deviceType={deviceType}
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
                  setShowDetailsModal={setShowDetailsModal}
                  makePrivate={makePrivate}
                  setMakePrivate={setMakePrivate}
                  type="initial" />
              </KeyboardAwareScrollView>
            </Modal>
          </View >
        ) : (
            <AddEmailModal
              setSaving={setSaving}
              setUpdatedEmail={setUpdatedEmail}
            />
          )
      )
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
    borderWidth: 2,
    borderRadius: 5,
  }
});

const mapState = ({ user }) => {
  return {
    user,
  }
}

const mapDispatch = dispatch => {
  return {
    postVideo: details => dispatch(postVideo(details)),
  }
}

export default connect(mapState, mapDispatch)(DetailsModal);
