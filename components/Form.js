import React, { createRef, useState } from 'react';
import { connect } from 'react-redux';
import { Text, View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Input } from 'react-native-elements';
import { clearVideo } from '../redux/singleVideo';
import buttonStyles from '../styles/button';

const Form = (props) => {

  const {
    title,
    setTitle,
    composer,
    setComposer,
    songKey,
    setSongKey,
    performer,
    notes,
    setNotes,
    setPerformer,
    setShowDetailsModal,
    setShowEditDetailsModal,
    handleSave,
    handleUpdate,
    type
  } = props;

  const handleExitEdit = () => {
    props.clearVideo();
    setShowEditDetailsModal(false);
  };

  const handleBack = () => {
    if (type === 'initial') {
      setShowDetailsModal(false);
    } else {
      handleConfirmExitEdit();
    }
  };

  const handleConfirmExitEdit = () => {
    Alert.alert(
      'Are you sure?',
      "If you go back now your changes won't be saved.",
      [
        { text: 'Yes, go back', onPress: () => handleExitEdit() },
        { text: 'Keep editing', onPress: () => { } }
      ],
      { cancelable: false }
    );
  };

  const handleSetNotes = val => {
    if (val.length <= 250) {
      setNotes(val);
    } else {
      Alert.alert(
        'Too long',
        "Notes must be 250 characters or less",
        [
          { text: 'OK', onPress: () => { } },
        ],
        { cancelable: false }
      );
    }
  };

  const handleSetTitle = val => {
    if (val.length <= 50) {
      setTitle(val);
    } else {
      Alert.alert(
        'Too long',
        "Title must be 50 characters or less",
        [
          { text: 'OK', onPress: () => { } },
        ],
        { cancelable: false }
      );
    }
  };

  const handleSetComposer = val => {
    if (val.length <= 30) {
      setComposer(val);
    } else {
      Alert.alert(
        'Too long',
        "Composer must be 20 characters or less",
        [
          { text: 'OK', onPress: () => { } },
        ],
        { cancelable: false }
      );
    }
  };

  const handleSetSongKey = val => {
    if (val.length <= 20) {
      setSongKey(val);
    } else {
      Alert.alert(
        'Too long',
        "Key must be 10 characters or less",
        [
          { text: 'OK', onPress: () => { } },
        ],
        { cancelable: false }
      );
    }
  };

  const handleSetPerformer = val => {
    if (val.length <= 50) {
      setPerformer(val);
    } else {
      Alert.alert(
        'Too long',
        "Performer must be 50 characters or less",
        [
          { text: 'OK', onPress: () => { } },
        ],
        { cancelable: false }
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>{type === 'initial' ? 'Please enter the following details:' : 'Update details:'}</Text>
      <Input
        labelStyle={styles.labelText}
        containerStyle={styles.inputField}
        onChangeText={val => handleSetTitle(val)}
        value={title}
        label="Title (required)"
        placeholder="e.g. Barcarolle" />
      <Input
        labelStyle={styles.labelText}
        containerStyle={styles.inputField}
        onChangeText={val => handleSetComposer(val)}
        value={composer}
        label="Composer (optional, but recommended)"
        placeholder="e.g. Offenbach" />
      <Input
        labelStyle={styles.labelText}
        containerStyle={styles.inputField}
        onChangeText={val => handleSetSongKey(val)}
        value={songKey}
        label="Key (optional, but recommended)"
        placeholder="e.g. B-flat major" />
      <Input
        labelStyle={styles.labelText}
        containerStyle={styles.inputField}
        onChangeText={val => handleSetPerformer(val)}
        value={performer}
        label="Performer (required)"
        placeholder="Enter your name here!" />
      <Input
        labelStyle={styles.labelText}
        containerStyle={styles.inputField}
        onChangeText={val => handleSetNotes(val)}
        value={notes}
        label="Want to add any notes about this track for Duetters? (optional)"
        placeholder={`e.g. "4 measures intro"`} />
      <TouchableOpacity
        onPress={type === 'initial' ? handleSave : handleUpdate}
        disabled={!title || !performer}
        style={{
          ...buttonStyles.regularButton,
          height: 50,
          width: '40%',
          backgroundColor: !title || !performer ? 'grey' : '#0047B9',
          marginBottom: 14,
        }}>
        <Text style={{
          ...buttonStyles.regularButtonText,
        }}>{type === 'initial' ? 'Submit!' : 'Update!'}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleBack}
        style={{
          ...buttonStyles.regularButton,
          width: '40%',
          height: 50,
        }}>
        <Text style={{
          ...buttonStyles.regularButtonText,
        }}>Back</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    marginHorizontal: 20,
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#0047B9',
    marginBottom: 20
  },
  labelText: {
    color: '#187795',
  },
  inputField: {
    marginBottom: 20
  },
  button: {
    backgroundColor: '#0047B9',
    width: '25%',
    height: 40,
    alignSelf: 'center',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  buttonText: {
    fontWeight: 'bold',
    color: 'white'
  }
})

const mapState = ({ user, selectedVideo }) => {
  return {
    user,
    selectedVideo,
  }
};

const mapDispatch = dispatch => {
  return {
    clearVideo: () => dispatch(clearVideo()),
  }
}

export default connect(mapState, mapDispatch)(Form);
