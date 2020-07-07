// import Constants from 'expo-constants';
// import * as manifest from './app.json';
// if (!Constants.manifest) {
//   Constants.manifest = manifest.expo
// }
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';
import * as Notifications from "expo-notifications";
import * as SecureStore from 'expo-secure-store';
import * as InAppPurchases from 'expo-in-app-purchases';
import { Text, TextInput, Platform, StatusBar, StyleSheet, View, SafeAreaView } from 'react-native';
import store from './redux/store';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
import { Provider } from 'react-redux';
import axios from 'axios';
import useCachedResources from './hooks/useCachedResources';
import BottomTabNavigator from './navigation/BottomTabNavigator';
import LinkingConfiguration from './navigation/LinkingConfiguration';
import MyDuettes from './components/MyDuettes';
import SettingsPage from './components/SettingsPage';
import { updateTransactionProcessing } from './redux/transactionProcessing';

import * as Sentry from '@sentry/react-native';
import { setUser } from './redux/user';

Sentry.init({
  dsn: 'https://4f1d90283940486d93204bc6690934e2@o378963.ingest.sentry.io/5203127',
});

Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;

TextInput.defaultProps = TextInput.defaultProps || {};
TextInput.defaultProps.allowFontScaling = false;

const Stack = createStackNavigator();

console.disableYellowBox = true;

let purchaseUpdateSubscription;
let purchaseErrorSubscription;

export default function App(props) {
  const isLoadingComplete = useCachedResources();
  const containerRef = React.useRef();

  // React.useEffect(() => {
  //   const setListener = async () => {
  //     InAppPurchases.setPurchaseListener(async ({ responseCode, results, errorCode }) => {
  //       console.log('in purchase listener')
  //       const RC = await InAppPurchases.getBillingResponseCodeAsync();
  //       if (RC !== InAppPurchases.IAPResponseCode.OK) {
  //         // Either we're not connected or the last response returned an error (Android)
  //         await InAppPurchases.connectAsync();
  //         console.log('connected in purchase listener')
  //       }
  //       if (responseCode === InAppPurchases.IAPResponseCode.USER_CANCELED) {
  //         console.log('User canceled the transaction');
  //         store.dispatch(updateTransactionProcessing(false));
  //         deactivateKeepAwake();
  //         // TODO: handle other response code cases
  //       } else if (responseCode === InAppPurchases.IAPResponseCode.ERROR) {
  //         console.log('Error processing transaction');
  //         store.dispatch(updateTransactionProcessing(false));
  //         deactivateKeepAwake();
  //       } else if (responseCode === InAppPurchases.IAPResponseCode.OK) {
  //         // Purchase was successful
  //         results.forEach(async purchase => {
  //           if (!purchase.acknowledged) {
  //             console.log(`Successfully purchased ${purchase.productId}`);
  //             // Process transaction here and unlock content...
  //             // console.log('purchase: ', purchase)
  //             const results = (await axios.post('https://duette.herokuapp.com/api/appStore', { data: purchase.transactionReceipt })).data;
  //             // console.log('result: ', result)
  //             const latest = results[results.length - 1];
  //             console.log('latest transaction: ', latest)
  //             console.log('is trial period? ', latest.is_trial_period);
  //             console.log('expires: ', latest.expires_date_ms);
  //             if (parseInt(Date.now().toString().slice(0, 10)) < parseInt(latest.expires_date_ms.toString().slice(0, 10))) {

  //               // open up subscriber content (update user record)
  //               const userId = store.getState().user.id;
  //               // console.log('userId in App.js useEffect: ', userId);
  //               const updatedUser = (await axios.put(`https://duette.herokuapp.com/api/user/${userId}`, { isSubscribed: true, hasLapsed: false, expires: latest.expires_date_ms.toString().slice(0, 10) })).data;
  //               console.log('user updated with isSubscribed & expiration: ', updatedUser);
  //               store.dispatch(setUser(updatedUser));
  //               // Then when you're done
  //               try {
  //                 await InAppPurchases.finishTransactionAsync(purchase, true);
  //                 console.log('finished transaction!')
  //                 store.dispatch(updateTransactionProcessing(false));
  //                 deactivateKeepAwake();
  //               } catch (e) {
  //                 console.log('error finishing transaction: ', e)
  //                 store.dispatch(updateTransactionProcessing(false));
  //                 deactivateKeepAwake();
  //               }
  //             } else {
  //               await InAppPurchases.finishTransactionAsync(purchase, true);
  //               console.log('finished transaction!')
  //               store.dispatch(updateTransactionProcessing(false));
  //               deactivateKeepAwake();
  //             }
  //           }
  //         });
  //       }
  //     });
  //   };
  //   setListener();
  //   return (async () => {
  //     await InAppPurchases.disconnectAsync();
  //   })
  // }, []);

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <React.Fragment>
        <SafeAreaView style={styles.outerContainer} />
        <SafeAreaView style={styles.innerContainer}>
          {Platform.OS === 'ios' && <StatusBar barStyle="dark-content" />}
          <NavigationContainer
            ref={containerRef}
            // initialState={initialNavigationState}
            linking={LinkingConfiguration}
          >
            <Provider store={store}>
              <Stack.Navigator>
                <Stack.Screen
                  name="Root"
                  component={BottomTabNavigator} />
                <Stack.Screen
                  name="My Duettes"
                  component={MyDuettes}
                  options={{
                    headerStyle: {
                      backgroundColor: '#0047B9',
                    },
                    headerTitleStyle: {
                      color: 'white',
                    },
                    headerTintColor: 'white',
                    headerBackTitle: 'Back',
                  }}
                />
                <Stack.Screen
                  name="Settings"
                  component={SettingsPage}
                  options={{
                    headerStyle: {
                      backgroundColor: '#0047B9',
                    },
                    headerTitleStyle: {
                      color: 'white',
                    },
                    headerTintColor: 'white',
                    headerBackTitle: 'Back',
                  }}
                />
              </Stack.Navigator>
            </Provider>
          </NavigationContainer>
        </SafeAreaView>
      </React.Fragment>
    );
  }
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 0,
    backgroundColor: '#0047B9',
  },
  innerContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
