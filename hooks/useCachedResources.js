import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import SplashScreen from 'react-native-splash-screen';
import * as React from 'react';
import { Platform } from 'react-native';
// import { connect } from 'react-redux';
import { Audio } from 'expo-av';
import * as SecureStore from 'expo-secure-store';
// import * as InAppPurchases from 'expo-in-app-purchases';
import store from '../redux/store';
import axios from 'axios';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
import { setLoaded } from '../redux/dataLoaded';
import { fetchUser, setUser, updateUser } from '../redux/user';
import { fetchDuettes } from '../redux/duettes';
import { fetchVideos } from '../redux/videos';
import { updateTransactionProcessing } from '../redux/transactionProcessing';
import Constants from 'expo-constants';
import * as manifest from "../app.json";

export default function useCachedResources() {
  const [isLoadingComplete, setLoadingComplete] = React.useState(false);

  // Load any resources or data that we need prior to rendering the app
  React.useEffect(() => {
    if (!Constants.manifest) {
      Constants.manifest = manifest.expo;
    }
    // const setPurchaseListener = async () => {
    //   InAppPurchases.setPurchaseListener(async ({ responseCode, results, errorCode }) => {
    //     console.log('in purchase listener')
    //     const RC = await InAppPurchases.getBillingResponseCodeAsync();
    //     if (RC !== InAppPurchases.IAPResponseCode.OK) {
    //       // Either we're not connected or the last response returned an error (Android)
    //       await InAppPurchases.connectAsync();
    //       console.log('connected in purchase listener')
    //     }
    //     if (responseCode === InAppPurchases.IAPResponseCode.USER_CANCELED) {
    //       console.log('User canceled the transaction');
    //       store.dispatch(updateTransactionProcessing(false));
    //       deactivateKeepAwake();
    //       // TODO: handle other response code cases
    //     } else if (responseCode === InAppPurchases.IAPResponseCode.ERROR) {
    //       console.log('Error processing transaction');
    //       store.dispatch(updateTransactionProcessing(false));
    //       deactivateKeepAwake();
    //     } else if (responseCode === InAppPurchases.IAPResponseCode.OK) {
    //       // Purchase was successful
    //       results.forEach(async purchase => {
    //         if (!purchase.acknowledged) {
    //           console.log(`Successfully purchased ${purchase.productId}`);
    //           // Process transaction here and unlock content...
    //           // console.log('purchase: ', purchase)
    //           const results = (await axios.post('https://duette.herokuapp.com/api/appStore', { data: purchase.transactionReceipt })).data;
    //           // console.log('result: ', result)
    //           const latest = results[results.length - 1];
    //           console.log('latest transaction: ', latest)
    //           console.log('is trial period? ', latest.is_trial_period);
    //           console.log('expires: ', latest.expires_date_ms);
    //           if (parseInt(Date.now().toString().slice(0, 10)) < parseInt(latest.expires_date_ms.toString().slice(0, 10))) {

    //             // open up subscriber content (update user record)
    //             const userId = store.getState().user.id;
    //             // console.log('userId in App.js useEffect: ', userId);
    //             const updatedUser = (await axios.put(`https://duette.herokuapp.com/api/user/${userId}`, { isSubscribed: true, hasLapsed: false, expires: latest.expires_date_ms.toString().slice(0, 10) })).data;
    //             console.log('user updated with isSubscribed & expiration: ', updatedUser);
    //             store.dispatch(setUser(updatedUser));
    //             // Then when you're done
    //             try {
    //               await InAppPurchases.finishTransactionAsync(purchase, true);
    //               console.log('finished transaction!')
    //               store.dispatch(updateTransactionProcessing(false));
    //               deactivateKeepAwake();
    //             } catch (e) {
    //               console.log('error finishing transaction: ', e)
    //               store.dispatch(updateTransactionProcessing(false));
    //               deactivateKeepAwake();
    //             }
    //           } else {
    //             await InAppPurchases.finishTransactionAsync(purchase, true);
    //             console.log('finished transaction!')
    //             store.dispatch(updateTransactionProcessing(false));
    //             deactivateKeepAwake();
    //           }
    //         }
    //       });
    //     }
    //   });
    // };

    async function loadResourcesAndDataAsync() {
      try {
        // SplashScreen.preventAutoHideAsync();
        // Load fonts
        await Font.loadAsync({
          ...Ionicons.font,
          'space-mono': require('../assets/fonts/SpaceMono-Regular.ttf'),
        });
        // await SecureStore.deleteItemAsync('oAuthId');
        // await SecureStore.deleteItemAsync('expires');
        // await SecureStore.deleteItemAsync('facebookId')
        let oAuthId;
        if (Platform.OS === 'ios') {
          oAuthId = await SecureStore.getItemAsync('oAuthId');
          console.log('oAuthId in useCachedResources: ', oAuthId)
          // check if user has connected with Apple
          if (oAuthId) {
            // get user by oAuthId
            const user = (await axios.get(`https://duette.herokuapp.com/api/user/oAuthId/${oAuthId}`)).data;
            console.log('user: ', user);
            store.dispatch(setUser(user));
          }
        } else if (Platform.OS === 'android') {
          // check for fb access token expiry
          const expires = await SecureStore.getItemAsync('expires');
          console.log('expires: ', expires)
          // if token is still valid
          if (parseInt(expires) > parseInt(Date.now().toString().slice(0, 10))) {
            // user's fb token is current
            // fetch and set user with facebookId
            console.log('fb token is valid')
            const facebookId = await SecureStore.getItemAsync('facebookId');
            const user = (await axios.get(`https://duette.herokuapp.com/api/user/oAuthId/${facebookId}`)).data;
            console.log('user: ', user);
            store.dispatch(setUser(user));
            // if (user.isSubscribed && (parseInt(Date.now().toString().slice(0, 10)) < parseInt(user.expires.toString().slice(0, 10)))) {
            //   // user's subscription is current
            //   console.log('user subscription is current!')
            //   console.log('parseInt(user.expires): ', parseInt(user.expires.toString().slice(0, 10)));
            //   console.log('date.now: ', parseInt(Date.now().toString().slice(0, 10)))
            //   // store.dispatch(fetchDuettes(user.id));
            //   store.dispatch(setUser(user));
            // } else if (user.isSubscribed && (parseInt(Date.now().toString().slice(0, 10)) >= parseInt(user.expires.toString().slice(0, 10)))) {
            //   // user's subscription has expired but record has not been updated
            //   console.log("user's subscription has expired")
            //   // update user record as not subscribed
            //   try {
            //     const updated = (await axios.put(`https://duette.herokuapp.com/api/user/${user.id}`, { isSubscribed: false, hasLapsed: true, expires: null })).data;
            //     console.log('updated user record: ', updated);
            //     store.dispatch(setUser(updated));
            //   } catch (e) {
            //     console.log('error updating user record: ', e)
            //   }
            // } else {
            //   // user's record has already been updated as expired and they have not yet renewed
            // }
          }
        }
        // store.dispatch(fetchVideos());
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          playThroughEarpieceAndroid: false,
        });
        // setPurchaseListener();
        // await InAppPurchases.connectAsync();
        // console.log('connected to App Store');
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

    // return (async () => {
    //   await InAppPurchases.disconnectAsync();
    // });

  }, []);

  return isLoadingComplete;
};