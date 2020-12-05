import React, { createRef, useState } from 'react';
import { connect } from 'react-redux';
import { Platform, Text, View, StyleSheet, Alert, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Input } from 'react-native-elements';
import CheckBox from 'react-native-check-box';
import { clearVideo } from '../redux/singleVideo';
import buttonStyles from '../styles/button';

const RequestForm = (props) => {

  const {
    handleExit,
    handleSave,
    title,
    setTitle,
    composer,
    setComposer,
    songKey,
    setSongKey,
    notes,
    setNotes,
    notifyMe,
    setNotifyMe,
    handlePermissionsWarn,
    saving,
  } = props;

  const handleConfirmExit = () => {
    Alert.alert(
      'Are you sure?',
      "If you go back now your request won't be saved.",
      [
        { text: 'Yes, go back', onPress: () => handleExit() },
        { text: 'Cancel', style: 'cancel', onPress: () => { } }
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
        "'Written by' must be 30 characters or less",
        [
          { text: 'OK', onPress: () => { } },
        ],
        { cancelable: false }
      );
    }
  };

  const handleSetSongKey = val => {
    if (val.length <= 30) {
      setSongKey(val);
    } else {
      Alert.alert(
        'Too long',
        "Key must be 30 characters or less",
        [
          { text: 'OK', onPress: () => { } },
        ],
        { cancelable: false }
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* <StatusBar hidden /> */}
      <Text style={styles.titleText}>Request a Base Track</Text>
      {/* <Text style={styles.subTitleText}>Please enter the following details:</Text> */}
      <Input
        labelStyle={styles.labelText}
        containerStyle={styles.inputField}
        onChangeText={val => handleSetTitle(val)}
        value={title}
        label="Title (required)"
        placeholder="e.g. 'Barcarolle' or 'Truth Hurts'" />
      <Input
        labelStyle={styles.labelText}
        containerStyle={styles.inputField}
        onChangeText={val => handleSetComposer(val)}
        value={composer}
        label="Who wrote it? (required)"
        placeholder="e.g. 'Offenbach' or 'Lizzo'" />
      <Input
        labelStyle={styles.labelText}
        containerStyle={styles.inputField}
        onChangeText={val => handleSetSongKey(val)}
        value={songKey}
        label="Preferred key (required)"
        placeholder="e.g. 'B major', 'high voice' or 'original'" />
      <Input
        labelStyle={styles.labelText}
        containerStyle={{
          ...styles.inputField,
          marginBottom: 0,
        }}
        onChangeText={val => handleSetNotes(val)}
        value={notes}
        label="Want to add any notes about this request? (optional)"
        placeholder={`e.g. 'Quarter note = 120-ish'`} />
      <CheckBox
        style={{ flex: 1, paddingLeft: 10, paddingRight: 60 }}
        onClick={() => setNotifyMe(!notifyMe)}
        isChecked={notifyMe}
        leftText={"Notify me when someone records this Base Track"}
        leftTextStyle={{
          ...styles.labelText,
          fontWeight: 'bold',
        }}
        checkBoxColor='#187795'
        checkedCheckBoxColor='#187795'
      />
      <TouchableOpacity
        onPress={notifyMe ? handlePermissionsWarn : handleSave}
        disabled={!title || !composer || !songKey || saving}
        style={{
          ...buttonStyles.regularButton,
          height: 50,
          width: '40%',
          backgroundColor: !title || !composer || !songKey || saving ? 'grey' : '#0047B9',
          marginBottom: 14,
          marginTop: 30,
        }}>
        <Text style={{
          ...buttonStyles.regularButtonText,
        }}>Submit!</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleConfirmExit}
        disabled={saving}
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
    fontSize: 30,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
    marginBottom: 30,
  },
  subTitleText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#0047B9',
    marginBottom: 30
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

export default RequestForm;
