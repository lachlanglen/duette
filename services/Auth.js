import * as Facebook from 'expo-facebook';
import appleAuth, {
  AppleButton,
  AppleAuthRequestOperation,
  AppleAuthRequestScope,
} from '@invertase/react-native-apple-authentication';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-community/google-signin';

import { config } from '../config';

export default class AuthService {

  async loginWithFacebook() {
    await Facebook.initializeAsync(config.facebook.appId);
    const res = await Facebook.logInWithReadPermissionsAsync(
      config.facebook.appId,
      { permissions: ['public_profile', 'email'] },
    );

    return res;
  }

  async loginWithApple() {
    try {
      // performs login request
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: AppleAuthRequestOperation.LOGIN,
        requestedScopes: [
          AppleAuthRequestScope.EMAIL,
          AppleAuthRequestScope.FULL_NAME,
        ],
      });

      return appleAuthRequestResponse;

      // if (appleAuthRequestResponse['realUserStatus']) {
      //   this.setState({
      //     isLogin: true,
      //   });
      // }
    } catch (error) {
      return error;
      // if (error.code === AppleAuthError.CANCELED) {
      // }
      // if (error.code === AppleAuthError.FAILED) {
      //   alert('Touch ID wrong');
      // }
      // if (error.code === AppleAuthError.INVALID_RESPONSE) {
      //   alert('Touch ID wrong');
      // }
      // if (error.code === AppleAuthError.NOT_HANDLED) {
      // }
      // if (error.code === AppleAuthError.UNKNOWN) {
      //   alert('Touch ID wrong');
      // }
    }
  }

  async loginWithGoogle() {
    try {
      await GoogleSignin.hasPlayServices();
      const info = await GoogleSignin.signIn();
      console.log('Google signin info: ', info)
    } catch (error) {
      console.log('Google signin error: ', error)
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
      } else {
        // some other error happened
      }
    }
  }
}