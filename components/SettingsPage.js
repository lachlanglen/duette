import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Linking, Text, View, SafeAreaView, FlatList, StyleSheet, Dimensions, TouchableOpacity, Platform, Alert, Switch, ScrollView } from 'react-native';
import { Input } from 'react-native-elements';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as Device from 'expo-device';
import buttonStyles from '../styles/button';
import PrivacyPolicyModal from './PrivacyPolicyModal';
import { validate } from 'validate.js';
import { toggleUpgradeOverlay } from '../redux/upgradeOverlay';
import { updateUser } from '../redux/user';
import { clearError } from '../redux/error';

const SettingsPage = (props) => {
  const [screenOrientation, setScreenOrientation] = useState('');
  const [showPrivacyPolicyModal, setShowPrivacyPolicyModal] = useState(false);
  const [editEmail, setEditEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [switchValue, setSwitchValue] = useState(props.user.email ? props.user.sendEmails : false);
  const [deviceType, setDeviceType] = useState(null);
  const [updatedEmailSubmitted, setUpdatedEmailSubmitted] = useState(false);
  const [editName, setEditName] = useState(false);
  const [name, setName] = useState('');
  const [updatedNameSubmitted, setUpdatedNameSubmitted] = useState(false);

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
  }, []);

  const handleEmailUpdateDone = () => {
    setUpdatedEmailSubmitted(false);
    // props.clearError();
    setEditEmail(false);
  };

  const handleNameUpdateDone = () => {
    setUpdatedNameSubmitted(false);
    // props.clearError();
    setEditName(false);
  };

  const handleViewPrivacyPolicy = async () => {
    // setShowPrivacyPolicyModal(true);
    await Linking.openURL('http://duette.app/privacy-policy');
  };

  const handleViewTermsOfUse = async () => {
    await Linking.openURL('http://duette.app/terms-of-use');
  }

  const emailConstraints = {
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

  const nameConstraints = {
    name: {
      presence: {
        allowEmpty: false,
        message: "^Please enter your name"
      },
    },
  };

  const handleEditEmail = () => {
    setEditEmail(true);
  };

  const handleEditName = () => {
    setEditName(true);
  };

  const handleSaveEmail = () => {
    const onSuccess = () => {
      Alert.alert(
        'Updated!',
        "Your email has been successfully updated.",
        [
          { text: 'OK', onPress: () => handleEmailUpdateDone() },
        ],
        { cancelable: false }
      );
    };
    const onEmailAlreadyExists = () => {
      Alert.alert(
        'Oops...',
        `${email} is already registered with another Duette account. Please use a different email address.`,
        [
          { text: 'OK', onPress: () => handleEmailUpdateDone() },
        ],
        { cancelable: false }
      );
    }
    setUpdatedEmailSubmitted(true);
    props.updateUser(props.user.id, { email }, { onSuccess, onEmailAlreadyExists });
  };

  const handleSaveName = () => {
    const onSuccess = () => {
      Alert.alert(
        'Updated!',
        "Your name has been successfully updated.",
        [
          { text: 'OK', onPress: () => handleNameUpdateDone() },
        ],
        { cancelable: false }
      );
    }
    const onFailure = () => {
      Alert.alert(
        'Oops...',
        `We could not update your name right now. Please try again later.`,
        [
          { text: 'OK', onPress: () => handleNameUpdateDone() },
        ],
        { cancelable: false }
      );
    }
    setUpdatedNameSubmitted(true);
    props.updateUser(props.user.id, { name }, { onSuccess, onFailure });
  };

  const handleEmailChange = (val) => {
    if (error) setError(null);
    setEmail(val);
  };

  const handleNameChange = (val) => {
    if (error) setError(null);
    setName(val);
  };

  const handleValidateEmail = () => {
    setError(null);
    const validationResult = validate({ emailAddress: email }, emailConstraints);
    if (!validationResult) {
      // there are no errors; continue to updating user's email
      Alert.alert(
        'Is this correct?',
        `Please confirm your email address: ${email}`,
        [
          { text: 'Yes, save it!', onPress: () => handleSaveEmail() },
          { text: 'Cancel', onPress: () => { } }
        ],
        { cancelable: false }
      );
    } else {
      // there are errors; set them on state and display in UI
      setError(validationResult.emailAddress[0]);
    }
  };

  const handleValidateName = () => {
    setError(null);
    const validationResult = validate({ name }, nameConstraints);
    if (!validationResult) {
      // there are no errors; continue to updating user's name
      Alert.alert(
        'Is this correct?',
        `Please confirm your name: ${name}`,
        [
          { text: 'Yes, save it!', onPress: () => handleSaveName() },
          { text: 'Cancel', onPress: () => { } }
        ],
        { cancelable: false }
      );
    } else {
      // there are errors; set them on state and display in UI
      setError(validationResult.name[0]);
    }
  };

  const handleCancelEmail = () => {
    setUpdatedEmailSubmitted(false);
    setError(null);
    props.clearError();
    setEditEmail(false);
  };

  const handleCancelName = () => {
    setUpdatedNameSubmitted(false);
    setError(null);
    props.clearError();
    setEditName(false);
  };

  const handleUpdateEmailPreferences = (value) => {
    props.updateUser(props.user.id, { sendEmails: value });
    setSwitchValue(value);
  };

  const handleToggleUpgradeOverlay = () => {
    props.toggleUpgradeOverlay(!props.displayUpgradeOverlay);
  };

  const handleManageSubscription = () => {
    Alert.alert(
      'Instructions',
      "To manage your subscription or turn off auto-renewal, go to Settings -> iTunes and App Store, select your Apple ID and then 'View Apple ID', then select 'Subscriptions'.",
      [
        { text: 'Got it!', onPress: () => { } },
      ],
      { cancelable: false }
    );
  }

  return (
    showPrivacyPolicyModal ? (
      <PrivacyPolicyModal
        setShowPrivacyPolicyModal={setShowPrivacyPolicyModal}
      />
    ) : (
        <ScrollView style={{ backgroundColor: '#ffd12b' }}>
          <View style={styles.container}>
            <Text style={styles.titleTextBlue}>Your account:</Text>
            <Text style={{
              ...styles.tierText,
              marginBottom: 0,
            }}>FREE</Text>
            {/* <TouchableOpacity
              onPress={handleManageSubscription}>
              <Text style={{ color: '#0047B9', marginTop: 10, fontSize: 16 }}>Manage Subscription</Text>
            </TouchableOpacity> */}
            {/* <Text style={styles.bulletText}>{'\u2022'} 3.5 min video length</Text>
            <Text style={styles.bulletText}>{'\u2022'} Save videos with Duette logo</Text> */}
            {/* <View style={{
              ...styles.upgradeContainer,
              width: deviceType === 2 ? '60%' : '90%',
            }}>
              <Text style={{
                ...styles.tierText,
                fontSize: 20,
                textTransform: 'none',
                fontStyle: 'italic',
                color: 'white',
              }}>Want more? Get Duette Pro!</Text>
              <Text style={styles.upgradeBulletText}>{'\u2022'} 9 min video length</Text>
              <Text style={styles.upgradeBulletText}>{'\u2022'} Save videos without Duette logo</Text>
              <TouchableOpacity
                onPress={handleToggleUpgradeOverlay}
                style={{
                  ...buttonStyles.regularButton,
                  marginTop: 15,
                  marginBottom: 10,
                  width: deviceType === 2 ? '80%' : '100%',
                  height: 60,
                }}>
                <Text
                  style={buttonStyles.regularButtonText}>Upgrade for $1.99/month</Text>
              </TouchableOpacity>
            </View> */}
            <Text style={styles.titleTextBlue}>Your name:</Text>
            <View style={styles.lineContainer}>
              {
                !editName ? (
                  <Text style={{ ...styles.tierText, marginBottom: 0 }}>{!props.user.name.includes('null') ? props.user.name : 'None provided'}</Text>
                ) : (
                    <Input
                      // labelStyle={{ marginLeft: 30 }}
                      containerStyle={styles.inputField}
                      onChangeText={val => handleNameChange(val)}
                      value={name}
                      // label="Title"
                      placeholder="Enter your name here" />
                  )
              }
              {
                !editName &&
                <TouchableOpacity
                  disabled={updatedNameSubmitted}
                  onPress={handleEditName}>
                  <Text style={styles.editText}>{!props.user.name.includes('null') ? 'Edit' : 'Add'}</Text>
                </TouchableOpacity>
              }
            </View>
            {
              error && (
                <Text style={styles.errorText}>{error}</Text>
              )
            }
            {
              editName &&
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity
                  onPress={handleValidateName}>
                  <Text style={styles.saveText}>{updatedNameSubmitted ? 'Saving...' : 'Save'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleCancelName}>
                  <Text style={styles.saveText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            }
            <Text style={styles.titleTextBlue}>Your email:</Text>
            <View style={styles.lineContainer}>
              {
                !editEmail ? (
                  <Text style={{ ...styles.tierText, marginBottom: 0 }}>{props.user.email ? props.user.email : 'None provided'}</Text>
                ) : (
                    <Input
                      // labelStyle={{ marginLeft: 30 }}
                      containerStyle={styles.inputField}
                      onChangeText={val => handleEmailChange(val)}
                      value={email}
                      // label="Title"
                      placeholder="Enter your email here" />
                  )
              }
              {
                !editEmail &&
                <TouchableOpacity
                  disabled={updatedEmailSubmitted}
                  onPress={handleEditEmail}>
                  <Text style={styles.editText}>{props.user.email ? 'Edit' : 'Add'}</Text>
                </TouchableOpacity>
              }
            </View>
            {
              error && (
                <Text style={styles.errorText}>{error}</Text>
              )
            }
            {
              editEmail &&
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity
                  onPress={handleValidateEmail}>
                  <Text style={styles.saveText}>{updatedEmailSubmitted ? 'Saving...' : 'Save'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleCancelEmail}>
                  <Text style={styles.saveText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            }
            <View style={{
              // backgroundColor: 'pink',
              alignItems: 'center',
              justifyContent: 'space-evenly',
              width: '85%',
              marginTop: 30,
            }}>
              <Text style={{
                ...
                styles.titleTextBlue,
                marginTop: 0,
              }}>Receive email notifications?</Text>
              <Switch
                trackColor={{ false: 'grey', true: '#0047B9' }}
                // thumbColor={switchValue ? 'pink' : 'grey'}
                style={styles.switch}
                onValueChange={handleUpdateEmailPreferences}
                value={switchValue}
              />
            </View>
            <Text style={styles.titleTextBlue}>Contact Us:</Text>
            <TouchableOpacity
              onPress={() => Linking.openURL('mailto:support@duette.app')}
            >
              <Text style={styles.tierText}>support@duette.app</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleViewPrivacyPolicy}
              style={{
                ...buttonStyles.regularButton,
                width: deviceType === 2 ? screenWidth / 2 : '75%',
                marginTop: 30,
                marginBottom: 20,
              }}>
              <Text style={buttonStyles.regularButtonText}>View Privacy Policy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleViewTermsOfUse}
              style={{
                ...buttonStyles.regularButton,
                width: deviceType === 2 ? screenWidth / 2 : '75%',
                // margin: 20,
              }}>
              <Text style={buttonStyles.regularButtonText}>View Terms of Use</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )
  )
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    flex: 1,
  },
  lineContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  inputField: {
    width: 300,
    marginTop: 10,
  },
  titleTextBlue: {
    fontSize: 22,
    fontWeight: 'bold',
    alignSelf: 'center',
    textAlign: 'center',
    marginTop: 30,
    marginHorizontal: 10,
    color: '#0047B9'
  },
  tierText: {
    fontSize: 18,
    marginTop: 10,
    marginBottom: 10,
    fontWeight: 'bold',
    // textTransform: 'uppercase',
    // color: '#0047B9',
  },
  bulletText: {
    marginBottom: 5,
    fontStyle: 'italic',
    fontSize: 18,
  },
  upgradeContainer: {
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e43',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    borderColor: '#0047B9',
    borderWidth: 2,
  },
  upgradeBulletText: {
    marginBottom: 5,
    fontSize: 18,
    // fontStyle: 'italic',
    fontWeight: 'bold',
  },
  // emailText: {
  //   fontSize: 18,
  //   marginTop: 10,
  //   fontWeight: 'bold',
  // },
  errorText: {
    color: 'red',
    marginTop: 4,
    fontSize: 16,
  },
  editText: {
    fontSize: 16,
    marginTop: 10,
    color: '#0047B9',
  },
  saveText: {
    fontSize: 16,
    marginTop: 10,
    color: '#0047B9',
    marginHorizontal: 10,
  },
  switch: {
    marginTop: 10,
  }
});

const mapState = ({ user, displayUpgradeOverlay, error }) => {
  return {
    user,
    displayUpgradeOverlay,
    error,
  }
};

const mapDispatch = dispatch => {
  return {
    updateUser: (id, body, extraInfo) => dispatch(updateUser(id, body, extraInfo)),
    toggleUpgradeOverlay: bool => dispatch(toggleUpgradeOverlay(bool)),
    clearError: () => dispatch(clearError()),
  }
}

export default connect(mapState, mapDispatch)(SettingsPage);
