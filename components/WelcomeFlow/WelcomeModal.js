import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Platform, Linking, View, ScrollView, Text, Modal, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { Input, Icon } from 'react-native-elements';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as Device from 'expo-device';
import buttonStyles from '../../styles/button';
import * as SecureStore from 'expo-secure-store';
import { validate } from 'validate.js';
import axios from 'axios';
import { handleFacebookLogin, handleAppleLogin, handleLoginWithFirebase, handleCreateAccountWithFirebase, handleSubscribe, handleResetFirebasePassword } from '../../services/utils';
import appleAuth, {
  AppleButton,
  AppleAuthRequestOperation,
  AppleAuthRequestScope,
} from '@invertase/react-native-apple-authentication';
import eula from '../../constants/EULA';

const NewUserModal = (props) => {

  const [deviceType, setDeviceType] = useState(null);
  const [showTerms, setShowTerms] = useState(false);
  const [showLoginFields, setShowLoginFields] = useState(false);
  const [showSignUpFields, setShowSignUpDetails] = useState(false);
  const [isNewAccount, setIsNewAccount] = useState(true);
  const [error, setError] = useState(null);
  const [firstName, setFirstName] = useState(null);
  const [lastName, setLastName] = useState(null);
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const [passwordValidation, setPasswordValidation] = useState({ charLength: false, lowercase: false, uppercase: false, special: false });
  const [retypedPassword, setRetypedPassword] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState(null);
  const [showEmailSent, setShowEmailSent] = useState(false);

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

  useEffect(() => {
    const getDeviceType = async () => {
      const type = await Device.getDeviceTypeAsync();
      setDeviceType(type);
    };
    getDeviceType();
  });

  const handleShowTerms = async () => {
    const agreed = await SecureStore.getItemAsync('agreedToTerms');
    if (agreed) {
      handleAppleLogin();
    } else {
      setShowTerms(true);
    }
  }

  const handleAgreeToTerms = async () => {
    await SecureStore.setItemAsync('agreedToTerms', Date.now().toString())
    if (isReadyToSubmit()) handleSubmitCreateUser();
    else handleAppleLogin();
    // TODO: add firebase login
  }

  const handleFirebaseLogin = () => {
    handleLoginWithFirebase('lachlanjglen2@gmail.com', 'Password123!');
  };

  const handleSetFirstName = val => {
    if (val.length <= 50) {
      setFirstName(val);
    } else {
      Alert.alert(
        'Too long',
        "First name must be 50 characters or less",
        [
          { text: 'OK', onPress: () => { } },
        ],
        { cancelable: false }
      );
    }
  };

  const handleSetLastName = val => {
    if (val.length <= 50) {
      setLastName(val);
    } else {
      Alert.alert(
        'Too long',
        "Last name must be 50 characters or less",
        [
          { text: 'OK', onPress: () => { } },
        ],
        { cancelable: false }
      );
    }
  };

  const handleSetEmail = val => {
    handleValidateEmail(val);
    setEmail(val);
  };

  const handleSetPassword = val => {
    setPassword(val);
    setPasswordValidation({
      charLength: Pattern.charLength(val),
      lowercase: Pattern.lowercase(val),
      uppercase: Pattern.uppercase(val),
      special: Pattern.special(val),
    });
  };

  const Pattern = {
    charLength: function (val) {
      if (val.length >= 8) return true;
      else return false;
    },
    lowercase: function (val) {
      var regex = /^(?=.*[a-z]).+$/;

      if (regex.test(val)) {
        return true;
      } else return false;
    },
    uppercase: function (val) {
      var regex = /^(?=.*[A-Z]).+$/;

      if (regex.test(val)) {
        return true;
      } else return false;
    },
    special: function (val) {
      var regex = /^(?=.*[0-9_\W]).+$/;

      if (regex.test(val)) {
        return true;
      } else return false;
    }
  };

  const handleCreateUser = async () => {
    handleCreateAccountWithFirebase(email, password, firstName, lastName, setIsSubmitting); // create new firebase user
  };

  const handleLoginUser = () => {
    setIsSubmitting(true);
    handleLoginWithFirebase(email, password, setIsSubmitting);
  }

  const handleValidateEmail = (val) => {
    setError(null);
    const validationResult = validate({ emailAddress: val }, constraints);
    // console.log('validationResult: ', validationResult)
    if (!validationResult) {
      // TODO: there are no errors; continue to save user
    } else {
      // there are errors; set them on state and display in UI
      setError(validationResult.emailAddress[0]);
    }
  };

  const handleSetRetypedPassword = val => {
    setRetypedPassword(val);
  };

  const handleSetResetEmail = val => {
    setResetEmail(val);
  }

  // console.log('email valid? ', validate({ emailAddress: email }, constraints))

  const isReadyToSubmit = () => {
    if (!passwordValidation.charLength ||
      !passwordValidation.lowercase ||
      !passwordValidation.uppercase ||
      !passwordValidation.special ||
      validate({ emailAddress: email }, constraints) ||
      !firstName ||
      !lastName ||
      password !== retypedPassword) return false;
    else return true;
  }

  const handleNavigateToLogin = () => {
    setIsSubmitting(false);
    setIsNewAccount(false);
    setShowResetPassword(false);
    setShowEmailSent(false);
  }

  const handleSubmitCreateUser = async () => {
    setIsSubmitting(true);
    const res = await axios.get(`https://duette.herokuapp.com/api/user/byEmail/${email}`);
    if (res.status === 202) { // email already exists in db
      console.log('email exists!')
      // TODO: direct to login page
      Alert.alert(
        'Already registered',
        `A user with email ${email} already exists. Please login or sign up with a different email.`,
        [
          { text: 'Login', onPress: handleNavigateToLogin },
          { text: 'Cancel', onPress: () => setIsSubmitting(false) }
        ],
        { cancelable: false }
      );
      return;
    } else if (res.status === 200) {
      console.log('email does not exist')
      handleCreateUser();
      // TODO: create firebase user, create db user, set token on device, set user on redux
      // setShowTerms(true);
    }
  };

  const handleCancelCreateAccount = () => {
    setShowSignUpDetails(false);
    setIsNewAccount(true);
    setError(null);
    setFirstName(null);
    setLastName(null);
    setEmail(null);
    setPassword(null);
    setPasswordValidation({ charLength: false, lowercase: false, uppercase: false, special: false });
    setRetypedPassword(null);
  };

  const handleResetPassword = () => {
    setIsSubmitting(true);
    const onSuccess = () => {
      setShowEmailSent(true);
      setIsSubmitting(false);
    }

    const onFailure = () => {
      Alert.alert(
        'Oops',
        `We couldn't find a user record with email ${resetEmail}. Please double check the email address and try again.`,
        [
          { text: 'OK', onPress: setIsSubmitting(false) },
        ],
        { cancelable: false }
      );
    }
    handleResetFirebasePassword(resetEmail, onSuccess, onFailure)
  };

  const handleCancelResetPassword = () => {
    setShowResetPassword(false);
  }

  console.log('password: ', password)

  return (
    <Modal>
      {
        showTerms ? (
          <View style={{
            ...styles.container,
            // paddingTop: 50,
          }}>
            <ScrollView
            // contentContainerStyle={styles.container}
            >
              <View>
                <Text style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  textAlign: 'center',
                  alignSelf: 'center',
                  paddingVertical: 30,
                }}>In order to proceed, please read the following End User License Agreement and select "I Agree" at the end.</Text>
                <Text style={{ paddingBottom: 30 }}>{eula}</Text>
                <TouchableOpacity
                  onPress={handleAgreeToTerms}
                  style={{
                    ...buttonStyles.regularButton,
                    width: deviceType === 2 ? '50%' : '100%',
                    marginBottom: 15,
                  }}>
                  <Text style={buttonStyles.regularButtonText}>I Agree</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowTerms(false)}
                  style={{
                    ...buttonStyles.regularButton,
                    width: deviceType === 2 ? '50%' : '100%',
                    backgroundColor: 'tomato'
                  }}>
                  <Text style={buttonStyles.regularButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        ) : (
            <View style={styles.container}>
              {
                showSignUpFields ? (
                  isNewAccount ? (
                    <KeyboardAwareScrollView
                      // contentContainerStyle={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
                      style={{ width: '100%', height: '100%', }}>
                      <View
                        style={{
                          width: '100%',
                          // flex: 1,
                          padding: 10,
                          alignItems: 'center',
                        }}
                      >
                        <Image
                          source={require('../../assets/images/duette-logo-HD.png')}
                          style={{
                            ...styles.logo,
                            marginTop: 15,
                          }} />
                        <Text style={{
                          ...styles.titleText,
                          fontSize: 22,
                          textAlign: 'center',
                          marginBottom: 25,
                          marginTop: 20,
                        }}>Create a free account to continue!</Text>
                        <TouchableOpacity
                          onPress={() => setIsNewAccount(false)}
                          style={{ alignItems: 'center' }}>
                          <Text style={{
                            color: '#0047B9',
                            textAlign: 'center',
                            fontStyle: 'italic',
                            fontWeight: 'bold',
                          }}>Already have an account? <Text>Login here.</Text></Text>
                        </TouchableOpacity>
                        <Input
                          labelStyle={styles.labelText}
                          containerStyle={{
                            ...styles.inputField,
                            marginTop: 25,
                          }}
                          onChangeText={val => handleSetFirstName(val)}
                          value={firstName}
                          label="First name"
                          placeholder="Please enter your first name" />
                        <Input
                          labelStyle={styles.labelText}
                          containerStyle={styles.inputField}
                          onChangeText={val => handleSetLastName(val)}
                          value={lastName}
                          label="Last name"
                          placeholder="Please enter your last name" />
                        <Input
                          labelStyle={styles.labelText}
                          containerStyle={styles.inputField}
                          onChangeText={val => handleSetEmail(val)}
                          value={email}
                          label="Email"
                          placeholder="Please enter your email" />
                        <Input
                          labelStyle={styles.labelText}
                          containerStyle={styles.inputField}
                          onChangeText={val => handleSetPassword(val)}
                          value={password}
                          label="Password"
                          secureTextEntry
                          placeholder="Please enter a password" />
                        {
                          password !== null &&
                          <View style={{ width: '100%' }}>
                            <View style={styles.passwordRequirementContainer}>
                              <Icon
                                name={passwordValidation.charLength ? 'check' : 'clear'}
                                type="material"
                                color={passwordValidation.charLength ? 'green' : 'red'}
                                size={16}
                              />
                              <Text
                                style={{
                                  ...styles.passwordRequirementText,
                                  color: passwordValidation.charLength ? 'green' : 'red',
                                }}
                              >Must be at least 8 characters long</Text>
                            </View>
                            <View style={styles.passwordRequirementContainer}>
                              <Icon
                                name={passwordValidation.lowercase ? 'check' : 'clear'}
                                type="material"
                                color={passwordValidation.lowercase ? 'green' : 'red'}
                                size={16}
                              />
                              <Text
                                style={{
                                  ...styles.passwordRequirementText,
                                  color: passwordValidation.lowercase ? 'green' : 'red',
                                }}
                              >Must contain a lowercase letter</Text>
                            </View>
                            <View style={styles.passwordRequirementContainer}>
                              <Icon
                                name={passwordValidation.uppercase ? 'check' : 'clear'}
                                type="material"
                                color={passwordValidation.uppercase ? 'green' : 'red'}
                                size={16}
                              />
                              <Text
                                style={{
                                  ...styles.passwordRequirementText,
                                  color: passwordValidation.uppercase ? 'green' : 'red',
                                }}
                              >Must contain an uppercase letter</Text>
                            </View>
                            <View style={styles.passwordRequirementContainer}>
                              <Icon
                                name={passwordValidation.special ? 'check' : 'clear'}
                                type="material"
                                color={passwordValidation.special ? 'green' : 'red'}
                                size={16}
                              />
                              <Text
                                style={{
                                  ...styles.passwordRequirementText,
                                  color: passwordValidation.special ? 'green' : 'red',
                                }}
                              >Must contain a number or special character</Text>
                            </View>
                          </View>
                        }
                        <Input
                          labelStyle={{
                            ...styles.labelText,
                            // margin: 0,
                          }}
                          containerStyle={{
                            ...styles.inputField,
                            marginTop: 15,
                          }}
                          onChangeText={val => handleSetRetypedPassword(val)}
                          value={retypedPassword}
                          label="Confirm Password"
                          secureTextEntry
                          placeholder="Please retype your password" />
                        {
                          password !== null &&
                          <View style={styles.passwordRequirementContainer}>
                            <Icon
                              name={retypedPassword && retypedPassword === password ? 'check' : 'clear'}
                              type="material"
                              color={retypedPassword && retypedPassword === password ? 'green' : 'red'}
                              size={16}
                            />
                            <Text
                              style={{
                                ...styles.passwordRequirementText,
                                color: retypedPassword && retypedPassword === password ? 'green' : 'red',
                              }}
                            >Passwords must match</Text>
                          </View>
                        }
                        <TouchableOpacity
                          style={isReadyToSubmit() && !isSubmitting ? {
                            ...buttonStyles.regularButton,
                            marginTop: 15,
                            marginBottom: 10,
                            width: deviceType === 2 ? '50%' : '75%',
                          } : {
                              ...buttonStyles.disabledButton,
                              marginTop: 15,
                              marginBottom: 10,
                              width: deviceType === 2 ? '50%' : '75%',
                            }}
                          disabled={!isReadyToSubmit()}
                          onPress={() => setShowTerms(true)}
                        >
                          <Text style={buttonStyles.regularButtonText}>{isSubmitting ? 'Please wait...' : 'Create Account'}</Text>
                        </TouchableOpacity>
                        {
                          error &&
                          <Text style={{ color: 'red', marginBottom: 15 }}>{error}</Text>
                        }
                        <TouchableOpacity
                          onPress={handleCancelCreateAccount}
                          style={{
                            ...buttonStyles.regularButton,
                            width: deviceType === 2 ? '50%' : '75%',
                            backgroundColor: 'tomato',
                            marginBottom: 0,
                          }}>
                          <Text style={buttonStyles.regularButtonText}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </KeyboardAwareScrollView>
                  ) : (
                      <KeyboardAwareScrollView
                        contentContainerStyle={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
                        style={{ width: '100%', height: '100%' }}>
                        <View style={{ width: '100%', height: '100%', padding: 10, alignItems: 'center', justifyContent: 'center' }}>
                          <Image
                            source={require('../../assets/images/duette-logo-HD.png')}
                            style={{
                              ...styles.logo,
                              marginTop: 15,
                            }} />
                          {
                            showResetPassword ? (
                              showEmailSent ? (
                                <View style={{ width: '100%' }}>
                                  <Text style={{
                                    ...styles.titleText,
                                    fontSize: 22,
                                    textAlign: 'center',
                                    marginBottom: 15,
                                  }}>Email sent!</Text>
                                  <Text style={{
                                    ...styles.subTitleText,
                                    fontSize: 18,
                                    // textAlign: 'center',
                                    marginTop: 0,
                                    marginBottom: 15,
                                  }}>Please check your email for a link to reset your password.</Text>
                                  <TouchableOpacity
                                    style={{
                                      ...buttonStyles.regularButton,
                                      marginTop: 15,
                                      // marginBottom: 10,
                                      width: deviceType === 2 ? '50%' : '75%',
                                    }}
                                    onPress={() => handleNavigateToLogin()}
                                  // disabled={isSubmitting || !resetEmail}
                                  >
                                    <Text style={buttonStyles.regularButtonText}>Back to login</Text>
                                  </TouchableOpacity>
                                </View>
                              ) : (
                                  <View style={{ width: '100%' }}>
                                    <Text style={{
                                      ...styles.titleText,
                                      fontSize: 22,
                                      textAlign: 'center',
                                      marginBottom: 15,
                                    }}>Reset your password</Text>
                                    <Text style={{
                                      ...styles.subTitleText,
                                      fontSize: 18,
                                      // textAlign: 'center',
                                      marginTop: 0,
                                      fontStyle: 'italic',
                                      marginBottom: 15,
                                    }}>Please enter your email address below and we will send you a link to reset your password.</Text>
                                    <Input
                                      labelStyle={styles.labelText}
                                      containerStyle={{
                                        ...styles.inputField,
                                        marginTop: 20,
                                      }}
                                      onChangeText={val => handleSetResetEmail(val)}
                                      value={resetEmail}
                                      label="Email"
                                      placeholder="Please enter your email" />
                                    <TouchableOpacity
                                      style={isSubmitting || !resetEmail ? {
                                        ...buttonStyles.disabledButton,
                                        marginTop: 15,
                                        marginBottom: 20,
                                        width: deviceType === 2 ? '50%' : '75%',
                                      } : {
                                          ...buttonStyles.regularButton,
                                          marginTop: 15,
                                          marginBottom: 20,
                                          width: deviceType === 2 ? '50%' : '75%',
                                        }}
                                      onPress={handleResetPassword}
                                      disabled={isSubmitting || !resetEmail}
                                    >
                                      <Text style={buttonStyles.regularButtonText}>{isSubmitting ? 'Please wait...' : 'Send reset email'}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                      onPress={handleCancelResetPassword}
                                      disabled={isSubmitting}
                                      style={{
                                        ...buttonStyles.regularButton,
                                        width: deviceType === 2 ? '50%' : '75%',
                                        backgroundColor: 'tomato',
                                      }}>
                                      <Text style={buttonStyles.regularButtonText}>Cancel</Text>
                                    </TouchableOpacity>
                                  </View>
                                )
                            ) : (
                                <View style={{ width: '100%' }}>
                                  <Text style={{
                                    ...styles.titleText,
                                    fontSize: 22,
                                    textAlign: 'center',
                                    marginBottom: 15,
                                  }}>Please login to continue</Text>
                                  <Input
                                    labelStyle={styles.labelText}
                                    containerStyle={{
                                      ...styles.inputField,
                                      marginTop: 20,
                                    }}
                                    onChangeText={val => handleSetEmail(val)}
                                    value={email}
                                    label="Email"
                                    placeholder="Please enter your email" />
                                  <Input
                                    labelStyle={styles.labelText}
                                    containerStyle={styles.inputField}
                                    onChangeText={val => handleSetPassword(val)}
                                    value={password}
                                    secureTextEntry
                                    label="Password"
                                    placeholder="Please enter your password" />
                                  <TouchableOpacity
                                    style={!email || !password || isSubmitting ? {
                                      ...buttonStyles.disabledButton,
                                      marginTop: 15,
                                      // marginBottom: 10,
                                      width: '50%',
                                    } : {
                                        ...buttonStyles.regularButton,
                                        marginTop: 15,
                                        // marginBottom: 10,
                                        width: '50%',
                                      }}
                                    onPress={handleLoginUser}
                                    disabled={!email || !password || isSubmitting}
                                  >
                                    <Text style={buttonStyles.regularButtonText}>{isSubmitting ? 'Please wait...' : 'Login'}</Text>
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                    onPress={() => setShowResetPassword(true)}
                                    style={{ alignItems: 'center' }}>
                                    <Text style={{ color: 'tomato', fontWeight: 'bold', textAlign: 'center', marginBottom: 10, }}>Forgot password? Reset it here.</Text>
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                    onPress={() => setIsNewAccount(true)}
                                    style={{ alignItems: 'center' }}>
                                    <Text style={{ color: '#0047B9', fontWeight: 'bold', textAlign: 'center' }}>Don't have an account? <Text>Create a free account here.</Text></Text>
                                  </TouchableOpacity>
                                </View>
                              )
                          }
                        </View>
                      </KeyboardAwareScrollView>
                    )
                ) : (
                    <View style={{ width: '100%', alignItems: 'center' }}>
                      <Image
                        source={require('../../assets/images/duette-logo-HD.png')}
                        style={{
                          ...styles.logo,
                          marginTop: 15,
                        }} />
                      <Text style={styles.titleText}>Welcome to Duette!</Text>
                      <Text style={{
                        ...styles.subTitleText,
                        paddingHorizontal: deviceType === 2 ? 150 : 0,
                      }}>{`Choose a sign-in option below to start making amazing split-screen music videos for free!`}</Text>
                      {
                        Platform.OS === 'ios' ? (
                          <View style={{ width: '100%', alignItems: 'center' }}>
                            <AppleButton
                              buttonStyle={AppleButton.Style.BLACK}
                              buttonType={AppleButton.Type.CONTINUE}
                              onPress={handleShowTerms}
                              style={{
                                ...styles.appleButton,
                                width: deviceType === 2 ? '50%' : '100%',
                                marginTop: 30,
                              }}
                            />
                            <TouchableOpacity
                              onPress={() => setShowSignUpDetails(true)}
                            >
                              <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 16, color: '#0047B9' }}>
                                {`Or continue with email & password`}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        ) : (
                            <TouchableOpacity
                              onPress={handleFacebookLogin}
                              style={{
                                ...buttonStyles.regularButton,
                                marginTop: 30,
                                width: deviceType === 2 ? '50%' : '90%',
                                height: Platform.OS === 'android' ? 85 : 60,
                                marginBottom: 0,
                              }}>
                              <Text style={{
                                ...buttonStyles.regularButtonText,
                                fontSize: 28,
                                fontWeight: 'normal',
                              }}>Continue with Facebook</Text>
                            </TouchableOpacity>
                          )
                      }
                    </View>
                  )
              }
            </View>
          )
      }
    </Modal >
  )
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    // paddingTop: 80,
    backgroundColor: '#ffd12b'
  },
  titleText: {
    color: '#0047B9',
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 30,
  },
  subTitleText: {
    color: 'black',
    fontSize: 22,
    // fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 30,
  },
  logo: {
    width: 250,
    height: 100,
    // marginTop: 60,
    // marginBottom: 30,
  },
  appleButton: {
    height: 60,
    marginHorizontal: 10,
    marginVertical: 20
  },
  labelText: {
    color: '#187795',
  },
  inputField: {
    marginBottom: 0
  },
  passwordRequirementContainer: {
    width: '100%',
    flexDirection: 'row',
  },
  passwordRequirementText: {
    paddingLeft: 5,
  }
});

const mapState = ({ user }) => {
  return {
    user,
  }
};

export default connect(mapState)(NewUserModal);
