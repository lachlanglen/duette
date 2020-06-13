import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';
import { Audio } from 'expo-av';
import * as SecureStore from 'expo-secure-store';
import store from '../redux/store';
import axios from 'axios';
import { setLoaded } from '../redux/dataLoaded';
import { fetchUser } from '../redux/user';
import { fetchDuettes } from '../redux/duettes';

export default function useCachedResources() {
  const [isLoadingComplete, setLoadingComplete] = React.useState(false);

  // Load any resources or data that we need prior to rendering the app
  React.useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        SplashScreen.preventAutoHideAsync();
        // Load fonts
        await Font.loadAsync({
          ...Ionicons.font,
          'space-mono': require('../assets/fonts/SpaceMono-Regular.ttf'),
        });
        const accessToken = await SecureStore.getItemAsync('accessToken');
        if (accessToken) {
          // check for expires
          const expires = await SecureStore.getItemAsync('expires');
          // if token is still valid
          if (parseInt(expires) > parseInt(Date.now().toString().slice(0, 10))) {
            // user is current
            // fetch and set user with facebookId
            const facebookId = await SecureStore.getItemAsync('facebookId');
            store.dispatch(fetchUser(facebookId));
            const { id } = (await axios.get(`https://duette.herokuapp.com/api/user/facebookId/${facebookId}`)).data;
            store.dispatch(fetchDuettes(id));
          }
        }
        // store.dispatch(fetchVideos());
        Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
        });
        store.dispatch(setLoaded(true));
      } catch (e) {
        // We might want to provide this error information to an error reporting service
        console.warn(e);
      } finally {
        setLoadingComplete(true);
        SplashScreen.hideAsync();
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  return isLoadingComplete;
}
