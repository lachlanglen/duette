import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import SplashScreen from 'react-native-splash-screen';
import * as React from 'react';
// import { connect } from 'react-redux';
import { Audio } from 'expo-av';
import * as SecureStore from 'expo-secure-store';
import * as InAppPurchases from 'expo-in-app-purchases';
import store from '../redux/store';
import axios from 'axios';
import { setLoaded } from '../redux/dataLoaded';
import { fetchUser, setUser, updateUser } from '../redux/user';
import { fetchDuettes } from '../redux/duettes';
import { fetchVideos } from '../redux/videos';

export default function useCachedResources() {
  const [isLoadingComplete, setLoadingComplete] = React.useState(false);

  // Load any resources or data that we need prior to rendering the app
  React.useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        // SplashScreen.preventAutoHideAsync();
        // Load fonts
        await Font.loadAsync({
          ...Ionicons.font,
          'space-mono': require('../assets/fonts/SpaceMono-Regular.ttf'),
        });
        // await SecureStore.deleteItemAsync('accessToken');
        // await SecureStore.deleteItemAsync('expires');
        // await SecureStore.deleteItemAsync('facebookId')
        const accessToken = await SecureStore.getItemAsync('accessToken');
        // check if user has connected with FB
        if (accessToken) {
          // check for fb access token expiry
          const expires = await SecureStore.getItemAsync('expires');
          // if token is still valid
          if (parseInt(expires) > parseInt(Date.now().toString().slice(0, 10))) {
            // user's fb token is current
            // fetch and set user with facebookId
            console.log('fb token is valid')
            const facebookId = await SecureStore.getItemAsync('facebookId');
            const user = (await axios.get(`https://duette.herokuapp.com/api/user/facebookId/${facebookId}`)).data;
            console.log('user: ', user);
            if (user.isSubscribed && (parseInt(Date.now().toString().slice(0, 10)) < parseInt(user.expires.toString().slice(0, 10)))) {
              // user's subscription is current
              console.log('user subscription is current!')
              console.log('parseInt(user.expires): ', parseInt(user.expires.toString().slice(0, 10)));
              console.log('date.now: ', parseInt(Date.now().toString().slice(0, 10)))
              // store.dispatch(fetchDuettes(user.id));
              store.dispatch(setUser(user));
            } else if (user.isSubscribed && (parseInt(Date.now().toString().slice(0, 10)) >= parseInt(user.expires.toString().slice(0, 10)))) {
              // user's subscription has expired but record has not been updated
              console.log("user's subscription has expired")
              // update user record as not subscribed
              try {
                const updated = (await axios.put(`https://duette.herokuapp.com/api/user/${user.id}`, { isSubscribed: false, hasLapsed: true, expires: null })).data;
                console.log('updated user record: ', updated);
                store.dispatch(setUser(updated));
              } catch (e) {
                console.log('error updating user record: ', e)
              }
            } else {
              // user's record has already been updated as expired and they have not yet renewed
              store.dispatch(setUser(user));
            }
          }
        }
        // store.dispatch(fetchVideos());
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
        });
        await InAppPurchases.connectAsync();
        console.log('connected to App Store');
      } catch (e) {
        // We might want to provide this error information to an error reporting service
        // console.log('error in useCachedResources: ', e);
        throw new Error('error in useCachedResources: ', e);
      } finally {
        store.dispatch(setLoaded(true));
        setLoadingComplete(true);
        SplashScreen.hide();
        console.log('splashscreen hidden')
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  return isLoadingComplete;
};