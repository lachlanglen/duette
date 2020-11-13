import React, { useState } from 'react';
import { connect } from 'react-redux';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Input } from 'react-native-elements';
import { validate } from 'validate.js';
import buttonStyles from '../styles/button';
import { updateUser } from '../redux/user';

const AddEmailModal = (props) => {
  const {
    showConfirmAlert,
    setSaving,
    setUpdatedEmail,
  } = props;

  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);

  const constraints = {
    emailAddress: {
      presence: {
        allowEmpty: false,
        message: "^Please enter an email address"
      },
      email: {
        message: "^Please enter a valid email address"
      }
    },
  };

  const handleSaveEmail = () => {
    setUpdatedEmail(email);
    props.updateUser(props.user.id, { email })
    // TODO: handle update error
    setSaving(true);
  };

  const handleValidateEmail = () => {
    setError(null);
    const validationResult = validate({ emailAddress: email }, constraints);
    if (!validationResult) {
      // there are no errors; continue to updating user's email
      Alert.alert(
        'Is this correct?',
        `Please confirm your email address: ${email}`,
        [
          {
            text: 'Yes, save it!',
            onPress: () => handleSaveEmail()
          },
          {
            text: 'Cancel',
            onPress: () => { },
          }
        ],
        { cancelable: false }
      );
    } else {
      // there are errors; set them on state and display in UI
      setError(validationResult.emailAddress[0]);
    }
  };

  const handleValChange = (val) => {
    if (error) setError(null);
    setEmail(val);
  };

  const handleSave = () => {
    setSaving(true);
  }

  console.log('in addemailmodal')

  return (
    <View style={styles.container}>
      <Text style={styles.titleTextBlue}>Want to know when your Duette has finished processing?</Text>
      <Text style={styles.bodyText}>Add your email below and we'll send you a link to download your video when it's done!</Text>
      <Input
        // labelStyle={{ marginLeft: 30 }}
        containerStyle={styles.inputField}
        onChangeText={val => handleValChange(val)}
        value={email}
        // label="Title"
        placeholder="Enter your email here" />
      {
        error && (
          <Text style={styles.errorText}>{error}</Text>
        )
      }
      <TouchableOpacity
        onPress={email ? handleValidateEmail : handleSave}
        style={{
          ...buttonStyles.regularButton,
          marginTop: 30,
        }}>
        <Text style={buttonStyles.regularButtonText}>{!email ? 'Skip' : 'Save'}</Text>
      </TouchableOpacity>
    </View>
  )
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
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
  bodyText: {
    fontSize: 18,
    // fontWeight: 'bold',
    alignSelf: 'center',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
    marginHorizontal: 10,
    // color: '#0047B9'
  },
  inputField: {
    width: '80%',
    marginTop: 10,
  },
  errorText: {
    color: 'red',
    marginTop: 4,
    fontSize: 16,
  },
});

const mapState = ({ user }) => {
  return {
    user,
  }
};

const mapDispatch = dispatch => {
  return {
    updateUser: (id, body) => dispatch(updateUser(id, body))
  }
};

export default connect(mapState, mapDispatch)(AddEmailModal);
