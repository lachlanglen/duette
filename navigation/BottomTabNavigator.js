import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { connect } from 'react-redux';
import { View } from 'react-native';
import * as React from 'react';
import { Icon } from 'react-native-elements';
import { toggleUserInfo } from '../redux/userInfo';

import TabBarIcon from '../components/TabBarIcon';
import AccompanimentScreen from '../screens/AccompanimentScreen';
import DuetteScreen from '../screens/DuetteScreen';

const BottomTab = createBottomTabNavigator();
const INITIAL_ROUTE_NAME = 'Accompaniment';

const BottomTabNavigator = (props) => {

  const { navigation, route } = props;
  // Set the header title on the parent stack navigator depending on the
  // currently active tab. Learn more in the documentation:
  // https://reactnavigation.org/docs/en/screen-options-resolution.html
  navigation.setOptions({ headerTitle: getHeaderTitle(route, props.user), headerRight: () => <UserIcon />, headerStyle: { backgroundColor: '#0047B9', height: 70 }, headerTitleStyle: { color: 'white' } });

  const handlePress = () => {
    if (props.user.id) {
      props.toggleUserInfo(!props.displayUserInfo)
    }
  }

  const UserIcon = () => (
    <View style={{ paddingRight: 12 }}>
      <Icon onPress={handlePress} underlayColor="#0047B9" name="perm-identity" type="material" color="white" size={25} />
    </View>
  );

  return (
    <BottomTab.Navigator initialRouteName={INITIAL_ROUTE_NAME}>
      <BottomTab.Screen
        name="Accompaniment"
        component={AccompanimentScreen}
        options={{
          title: 'Record a Base Track!',
          tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="md-musical-note" />,
        }}
      />
      <BottomTab.Screen
        name="Duette"
        component={DuetteScreen}
        options={{
          title: 'Record a Duette!',
          tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="md-musical-notes" />,
        }}
      />
    </BottomTab.Navigator>
  );
}

function getHeaderTitle(route, user) {
  const routeName = route.state ?.routes[route.state.index] ?.name ?? INITIAL_ROUTE_NAME;

  switch (routeName) {
    case 'Accompaniment':
      return `Welcome${!user.name.includes('null') ? `, ${user.name.split(' ')[0]}` : ' to Duette'}!`;
    case 'Duette':
      return `${user.name ? 'Choose a base track' : 'Welcome to Duette!'}`;
  }
};

const mapState = ({ displayUserInfo, user }) => {
  return {
    displayUserInfo,
    user
  }
}

const mapDispatch = dispatch => {
  return {
    toggleUserInfo: bool => dispatch(toggleUserInfo(bool)),
  }
}

export default connect(mapState, mapDispatch)(BottomTabNavigator);
