import * as Facebook from 'expo-facebook';
import appleAuth, {
  AppleButton,
  AppleAuthRequestOperation,
  AppleAuthRequestScope,
} from '@invertase/react-native-apple-authentication';

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
}