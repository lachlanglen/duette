import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';
import store from '../redux/store';
import * as FileSystem from 'expo-file-system';
import { clearCurrentUser, createOrUpdateUser, updateUser } from '../redux/user';
import { toggleUserInfo } from '../redux/userInfo';
import AuthService from './Auth';
import axios from 'axios';
import { fetchDuettes } from '../redux/duettes';

const Auth = new AuthService;

export const handleLogin = async () => {
  const permissionsObj = await Auth.loginWithFacebook();
  if (permissionsObj.type === 'success') {
    // console.log('permissionsObj: ', permissionsObj)
    const { declinedPermissions, expires, permissions, token } = permissionsObj;
    try {
      const basicInfo = await fetch(`https://graph.facebook.com/me?access_token=${token}`);
      const { id, name } = await basicInfo.json();
      const moreInfo = await fetch(`https://graph.facebook.com/${id}?fields=email,picture&access_token=${token}`);
      const { email, picture } = await moreInfo.json();
      // create or update user & store this user on state
      store.dispatch(createOrUpdateUser({ id, name, picture, email, expires }));
      // save token and expiry to secure store
      try {
        await SecureStore.setItemAsync('accessToken', token);
        await SecureStore.setItemAsync('expires', expires.toString());
        await SecureStore.setItemAsync('facebookId', id);
        const user = (await axios.get(`https://duette.herokuapp.com/api/user/facebookId/${id}`)).data;
        store.dispatch(fetchDuettes(user.id));
      } catch (e) {
        console.log('error setting access token, expires or facebookId keys on secure store: ', e);
      }
    } catch (e) {
      console.log('error fetching user info: ', e);
    }
  } else {
    console.log('login cancelled')
  }
}

export const handleLogout = async (displayUserInfo) => {
  try {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('expires');
    await SecureStore.deleteItemAsync('facebookId');
    store.dispatch(clearCurrentUser());
    store.dispatch(toggleUserInfo(!displayUserInfo));
  } catch (e) {
    console.log('error deleting items from secure store: ', e)
  }
};

export const handleSubscribe = (userId) => {
  Alert.alert(
    `Purchase`,
    "Here is where you will complete purchase flow.",
    [
      { text: 'OK', onPress: () => store.dispatch(updateUser(userId, { isSubscribed: true })) }, // add userId and
    ],
    { cancelable: false }
  )
}

export const deleteLocalFile = async fileName => {
  await FileSystem.deleteAsync(fileName, { idempotent: true });
}