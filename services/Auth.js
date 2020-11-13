import * as Facebook from 'expo-facebook';
import appleAuth, {
  AppleButton,
  AppleAuthRequestOperation,
  AppleAuthRequestScope,
} from '@invertase/react-native-apple-authentication';

import { config } from '../config';

export default class AuthService {

  async loginWithFirebase(email, password) {
    try {
      const userRecord = await config.firebase.auth().signInWithEmailAndPassword(email, password)
      console.log("userRecord: ", userRecord);
      return { success: true, ...userRecord };
    } catch (e) {
      console.log("error in loginWithFirebase: ", e)
      return { success: false }
    }
  }

  async createAccountWithFirebase(email, password) {
    try {
      const newRecord = await config.firebase.auth().createUserWithEmailAndPassword(email, password)
      console.log("newRecord: ", newRecord);
      return newRecord;
      // create user in db
    } catch (e) {
      console.log("error in createAccountWithFirebase: ", e)
      return;
    }
  }

  async resetFirebasePassword(email) {
    try {
      const reset = await config.firebase.auth().sendPasswordResetEmail(email);
      console.log('reset: ', reset)
      return { success: true }
    } catch (e) {
      console.log('error sending reset email: ', e)
      return { success: false }
    }
  }

  async logoutWithFirebase() {
    try {
      await config.firebase.auth().signOut();
      return { success: true }
    } catch (e) {
      console.log('error in logoutWithFirebase: ', e);
      return { success: false }
    }
  }

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
}