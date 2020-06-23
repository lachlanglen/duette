import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { connect } from 'react-redux'
import { BlurView } from 'expo-blur';
import { handleLogout } from '../services/utils';
import { toggleUserInfo } from '../redux/userInfo';
import buttonStyles from '../styles/button';
import { toggleUpgradeOverlay } from '../redux/upgradeOverlay';

const UserInfoMenu = (props) => {

  const navigation = useNavigation();

  const handlePress = (type) => {
    if (type === 'duettes' || type === 'settings') {
      navigation.navigate(type === 'duettes' ? 'My Duettes' : 'Settings');
    } else if (type === 'upgrade') {
      props.toggleUpgradeOverlay(!props.displayUpgradeOverlay);
    }
    props.toggleUserInfo(!props.displayUserInfo);
  }

  return (
    // <View style={{ flex: 1, width: '100%', height: '100%', backgroundColor: 'pink' }}>
    <View
      style={{
        position: 'absolute',
        alignSelf: 'flex-end',
      }}>
      {/* <BlurView intensity={100}> */}
      <View style={{
        ...styles.optionContainer,
        backgroundColor: 'white',
        borderTopWidth: 4,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
      }}>
        <Text style={{
          ...styles.optionText,
          color: '#0047B9',
        }}>Logged in as {props.user.name}
        </Text>
      </View>
      <TouchableOpacity
        style={{
          ...styles.optionContainer,
          borderRadius: 0,
        }}
        onPress={() => handlePress('duettes')}
      >
        <Text
          style={styles.optionText}>My Duettes
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          ...styles.optionContainer,
          borderRadius: 0,
        }}
        onPress={() => handlePress('settings')}
      >
        <Text
          style={styles.optionText}>Settings
        </Text>
      </TouchableOpacity>
      {/* <TouchableOpacity
        style={{
          ...styles.optionContainer,
          borderRadius: 0,
          backgroundColor: '#e43'
        }}
        onPress={() => handlePress('upgrade')}
      >
        <Text
          style={{
            ...styles.optionText,
            // textTransform: 'uppercase',
            // fontWeight: 'bold',
            color: 'white',
          }}>Duette Pro
        </Text>
      </TouchableOpacity> */}
      <TouchableOpacity
        style={{
          ...styles.optionContainer,
          borderBottomWidth: 4,
          borderBottomLeftRadius: 5,
          borderBottomRightRadius: 5,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
        }}
        onPress={() => handleLogout(props.displayUserInfo)}>
        <Text
          style={{
            ...styles.optionText,
          }}>Logout
        </Text>
      </TouchableOpacity>
      {/* </BlurView> */}
    </View>
    // </View>
  )
};

const styles = StyleSheet.create({
  optionContainer: {
    ...buttonStyles.regularButton,
    marginBottom: 0,
    paddingHorizontal: 0,
    alignSelf: 'flex-end',
    // borderRadius: 0,
    width: '100%',
    backgroundColor: '#ffd12b',
    borderTopWidth: 2,
    borderBottomWidth: 0,
    borderLeftWidth: 4,
  },
  optionText: {
    ...buttonStyles.regularButtonText,
    color: '#0047b9'
  }
})

const mapState = ({ user, displayUserInfo, displayUpgradeOverlay }) => {
  return {
    user,
    displayUserInfo,
    displayUpgradeOverlay,
  }
};

const mapDispatch = dispatch => {
  return {
    toggleUserInfo: bool => dispatch(toggleUserInfo(bool)),
    toggleUpgradeOverlay: bool => dispatch(toggleUpgradeOverlay(bool)),
  }
};

export default connect(mapState, mapDispatch)(UserInfoMenu);
