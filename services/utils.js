import * as SecureStore from 'expo-secure-store';
import { Alert, Platform } from 'react-native';
import store from '../redux/store';
import * as FileSystem from 'expo-file-system';
import * as InAppPurchases from 'expo-in-app-purchases';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
import { clearCurrentUser, createOrUpdateUser, updateUser, setUser } from '../redux/user';
import { toggleUserInfo } from '../redux/userInfo';
import AuthService from './Auth';
import axios from 'axios';
import { fetchDuettes } from '../redux/duettes';
import { updateTransactionProcessing } from '../redux/transactionProcessing';
import { updateRestoringProcessing } from '../redux/restoringProcessing';
import { firebase } from '../config/index';

const Auth = new AuthService;

export const handleCreateAccountWithFirebase = async (email, password, firstName, lastName, setIsSubmitting) => {
  const res = await Auth.createAccountWithFirebase(email, password);
  console.log('res: ', res)
  const handleSuccess = async () => {
    await SecureStore.setItemAsync('oAuthId', res.user.uid);
    setIsSubmitting(false);
  };
  const handleFailure = () => {
    Alert.alert(
      'Oops',
      "We were able to create your account at this time. Please try again, and if the problem persists contact us at support@duette.app",
      [
        { text: 'OK', onPress: () => setIsSubmitting(false) },
      ],
      { cancelable: false }
    );
  }
  store.dispatch(createOrUpdateUser({ oAuthId: res.user.uid, name: firstName + ' ' + lastName, email, isApple: false, onSuccess: handleSuccess, onFailure: handleFailure }));
  return;
};

export const handleLoginWithFirebase = async (email, password, setIsSubmitting) => {
  const res = await Auth.loginWithFirebase(email, password);
  console.log('res.success: ', res.success)
  const handleSuccess = async () => {
    await SecureStore.setItemAsync('oAuthId', res.user.uid);
    setIsSubmitting(false);
  };
  const handleFailure = () => {
    Alert.alert(
      'Oops',
      "We were able to log you in at this time. Please try again, and if the problem persists contact us at support@duette.app",
      [
        { text: 'OK', onPress: () => setIsSubmitting(false) },
      ],
      { cancelable: false }
    );
  }
  if (res.success) store.dispatch(createOrUpdateUser({ oAuthId: res.user.uid, onSuccess: handleSuccess, onFailure: handleFailure }));
  else return Alert.alert(
    'Invalid Password',
    "The password you entered is incorrect. Please try again or select 'Forgot Password.'",
    [
      { text: 'OK', onPress: () => setIsSubmitting(false) },
    ],
    { cancelable: false }
  );;
};

export const handleResetFirebasePassword = async (email, onSuccess, onFailure) => {
  const res = await Auth.resetFirebasePassword(email)
  console.log('res line 69: ', res)
  if (res.success) onSuccess();
  else if (!res.success) onFailure();
};

export const handleFacebookLogin = async () => {
  const permissionsObj = await Auth.loginWithFacebook();
  if (permissionsObj.type === 'success') {
    // console.log('permissionsObj: ', permissionsObj)
    const { declinedPermissions, expires, permissions, token } = permissionsObj;
    try {
      const basicInfo = await fetch(`https://graph.facebook.com/me?access_token=${token}`);
      const { id, name } = await basicInfo.json();
      const moreInfo = await fetch(`https://graph.facebook.com/${id}?fields=email,picture&access_token=${token}`);
      const { email } = await moreInfo.json();
      // create or update user & store this user on state
      store.dispatch(createOrUpdateUser({ id, name, email, isApple: false }));
      console.log('line 29')
      // save token and expiry to secure store
      try {
        await SecureStore.setItemAsync('accessToken', token);
        await SecureStore.setItemAsync('expires', expires.toString());
        await SecureStore.setItemAsync('facebookId', id);
        console.log('line 35')
        const user = (await axios.get(`https://duette.herokuapp.com/api/user/oAuthId/${id}`)).data;
        if (!store.getState().user.id) store.dispatch(setUser(user));
      } catch (e) {
        throw new Error('error setting access token, expires or facebookId keys on secure store: ', e);
      }
    } catch (e) {
      // console.log('error fetching user info: ', e);
      throw new Error('error fetching user info: ', e);
    }
  } else {
    console.log('login cancelled')
  }
}

export const handleAppleLogin = async () => {
  const response = await Auth.loginWithApple();
  let success;
  if (response.authorizationCode) success = true;
  if (success) {
    // create/update user
    // console.log('response: ', response)
    const { email } = response;
    const { familyName, givenName } = response.fullName;
    store.dispatch(createOrUpdateUser({ oAuthId: response.user, name: `${givenName} ${familyName}`, email, isApple: true }));
    console.log('oAuthId: ', response.user)
    // set oAuthId on device
    await SecureStore.setItemAsync('oAuthId', response.user);
    console.log('item set!')
  } else {
    console.log('failure: ', response)
  }
}

export const handleLogout = async (displayUserInfo, onFailure) => {
  try {
    const res = await Auth.logoutWithFirebase();
    if (res.success) {
      await SecureStore.deleteItemAsync('oAuthId');
      // await SecureStore.deleteItemAsync('accessToken');
      // await SecureStore.deleteItemAsync('expires');
      // await SecureStore.deleteItemAsync('facebookId');
      store.dispatch(clearCurrentUser());
      store.dispatch(toggleUserInfo(!displayUserInfo));
    } else {
      // logout failed
      if (onFailure) onFailure();
    }
  } catch (e) {
    throw new Error('error logging out: ', e);
  }
};

export const handleSubscribe = async () => {
  const responseCode = await InAppPurchases.getBillingResponseCodeAsync();
  if (responseCode !== InAppPurchases.IAPResponseCode.OK) {
    // Either we're not connected or the last response returned an error (Android)
    await InAppPurchases.connectAsync();
    console.log('connected in handleSubscribe')
  }
  try {
    const items = Platform.select({
      ios: [
        'app.duette.duette.one_month'
      ],
    });
    console.log('items: ', items)
    try {
      const products = await InAppPurchases.getProductsAsync(items);
      console.log('products: ', products);
      try {
        await InAppPurchases.purchaseItemAsync(products.results[0].productId);
      } catch (e) {
        console.log('error puchasing item: ', e)
        await axios.post('https://duette.herokuapp.com/api/logger', { errorPurchasing: e });
      }
    } catch (e) {
      console.log('error getting products: ', e);
      await axios.post('https://duette.herokuapp.com/api/logger', { errorGetting: e });
    }
  } catch (e) {
    console.log('error connecting: ', e)
    await axios.post('https://duette.herokuapp.com/api/logger', { errorConnecting: e });
  }
};

const finishRestore = () => {
  store.dispatch(updateRestoringProcessing(false));
  deactivateKeepAwake();
}

export const handleRestore = async () => {
  store.dispatch(updateRestoringProcessing(true));
  activateKeepAwake();
  const responseCode = await InAppPurchases.getBillingResponseCodeAsync();
  if (responseCode !== InAppPurchases.IAPResponseCode.OK) {
    console.log('responseCode in handleRestore: ', responseCode)
    // Either we're not connected or the last response returned an error (Android)
    await InAppPurchases.connectAsync();
    console.log('connected in handleRestore')
  }
  try {
    const { responseCode, results } = await InAppPurchases.getPurchaseHistoryAsync(true);
    console.log('results.length: ', results.length)
    if (responseCode === InAppPurchases.IAPResponseCode.OK) {
      // console.log('results: ', results)
      const res = (await axios.post('https://duette.herokuapp.com/api/appStore', { data: results[results.length - 1].transactionReceipt })).data;
      // console.log('res: ', res[res.length - 1])
      const sorted = res.sort((a, b) => a.expires_date_ms - b.expires_date_ms);
      // console.log('sorted: ', sorted)
      // sorted.forEach(r => console.log('expires: ', r.expires_date_ms))
      const latest = sorted[sorted.length - 1];
      console.log('latest: ', latest)

      if (parseInt(Date.now().toString().slice(0, 10)) < parseInt(latest.expires_date_ms.toString().slice(0, 10))) {
        // user's subscription is current; update user record
        const userId = store.getState().user.id;
        // console.log('userId in App.js useEffect: ', userId);
        const updatedUser = (await axios.put(`https://duette.herokuapp.com/api/user/${userId}`, { isSubscribed: true, hasLapsed: false, expires: latest.expires_date_ms.toString().slice(0, 10) })).data;
        console.log('user updated with isSubscribed & expiration: ', updatedUser);
        store.dispatch(setUser(updatedUser));
        Alert.alert(
          'Subscription Restored',
          "We were able to restore your most recent subscription. Happy Duetting!",
          [
            { text: 'OK', onPress: () => finishRestore() },
          ],
          { cancelable: false }
        );
      } else {
        // user's most recent subscription is expired; no action to take
        Alert.alert(
          'Subscription Expired',
          "It looks like your most recent subscription has expired. If you believe this to be incorrect, please email us at support@duette.app.",
          [
            { text: 'OK', onPress: () => finishRestore() },
          ],
          { cancelable: false }
        );
      }
    }
  } catch (e) {
    console.log('error getting purchase history: ', e);
    Alert.alert(
      'Oops',
      "Unfortunately we could not restore your subscription at this time. Please try again later or email us at support@duette.app.",
      [
        { text: 'OK', onPress: () => finishRestore() },
      ],
      { cancelable: false }
    );
  }
}

export const deleteLocalFile = async fileName => {
  await FileSystem.deleteAsync(fileName, { idempotent: true });
}