// import Constants from 'expo-constants';
// import * as manifest from './app.json';
// if (!Constants.manifest) {
//   Constants.manifest = manifest.expo
// }
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';
import * as Notifications from "expo-notifications";
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import store from './redux/store';
import { Provider } from 'react-redux';

import useCachedResources from './hooks/useCachedResources';
import BottomTabNavigator from './navigation/BottomTabNavigator';
import LinkingConfiguration from './navigation/LinkingConfiguration';
import MyDuettes from './components/MyDuettes';
import SettingsPage from './components/SettingsPage';

const Stack = createStackNavigator();

console.disableYellowBox = true;

export default function App(props) {
  const isLoadingComplete = useCachedResources();
  const containerRef = React.useRef();

  React.useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
    Notifications.addNotificationReceivedListener(n => {
      console.log('notification: ', n)
    });
    console.log('notification listeners set!')
  }, [])

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <View style={styles.container}>
        {Platform.OS === 'ios' && <StatusBar barStyle="dark-content" />}
        <NavigationContainer
          ref={containerRef}
          // initialState={initialNavigationState}
          linking={LinkingConfiguration}
        >
          <Provider store={store}>
            <Stack.Navigator>
              <Stack.Screen name="Root" component={BottomTabNavigator} />
              <Stack.Screen name="My Duettes" component={MyDuettes} />
              <Stack.Screen name="Settings" component={SettingsPage} />
            </Stack.Navigator>
          </Provider>
        </NavigationContainer>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
