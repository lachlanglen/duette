/* eslint-disable complexity */
import React, { useState, useEffect } from 'react';
import { SafeAreaView, Modal, Image, Text, View, Button, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { connect } from 'react-redux';
import { postVideo } from '../redux/videos';
import Form from './Form';
import buttonStyles from '../styles/button';
import SavingVideo from './SavingVideo';
import AddEmailModal from './AddEmailModal';

const DetailsModal = (props) => {
  const {
    setRecord,
    setPreview,
    setShowDetailsModal,
    dataUri
  } = props;

  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [composer, setComposer] = useState('');
  const [songKey, setSongKey] = useState('');
  const [performer, setPerformer] = useState(props.user.name);
  const [notes, setNotes] = useState('');
  const [showAddEmailModal, setShowAddEmailModal] = useState(false);
  const [updatedEmail, setUpdatedEmail] = useState(null);

  const handleSave = () => {
    if (!props.user.email) {
      setShowAddEmailModal(true);
    } else {
      setSaving(true);
    }
  };

  const handleExit = () => {
    setSaving(false);
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
