// import Constants from 'expo-constants';
// import * as manifest from './app.json';
// if (!Constants.manifest) {
//   Constants.manifest = manifest.expo
// }
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import store from './redux/store';
import { Provider } from 'react-redux';

import useCachedResources from './hooks/useCachedResources';
import BottomTabNavigator from './navigation/BottomTabNavigator';
import LinkingConfiguration from './navigation/LinkingConfiguration';

const Stack = createStackNavigator();

console.disableYellowBox = true;

export default function App(props) {
  const isLoadingComplete = useCachedResources();
  const containerRef = React.useRef();
  // const [initialNavigationState, setInitialNavigationState] = React.useState();

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
