import * as Facebook from 'expo-facebook';

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
}