/* eslint-disable complexity */
import React, { useState } from 'react';
import { Text, TouchableOpacity, View, Dimensions, Modal, StyleSheet } from 'react-native';
import { Video } from 'expo-av';
import buttonStyles from '../../styles/button';

const PreviewAccompaniment = (props) => {
  const {
    dataUri,
    handleSave,
    handleRefresh,
    deviceType
  } = props;

  let screenWidth = Math.floor(Dimensions.get('window').width);
  let screenHeight = Math.floor(Dimensions.get('window').height);

  const [screenOrientation, setScreenOrientation] = useState('')

  const handleModalOrientationChange = (ev) => {
    setScreenOrientation(ev.nativeEvent.orientation.toUpperCase())
  };

  return (
    <Modal
      animationType="fade"
      onOrientationChange={e => handleModalOrientationChange(e)}
      supportedOrientations={['portrait']}
    >
      <View
        style={{
          flexDirection: screenOrientation === 'PORTRAIT' ? 'column' : 'row',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          backgroundColor: 'black',
          height: '100%',
          paddingLeft: screenOrientation === 'PORTRAIT' ? 0 : (screenWidth - screenHeight / 9 * 8) / 2,
          paddingTop: screenOrientation === 'PORTRAIT' ? (screenHeight - screenWidth / 8 * 9) / 2 : 0,
        }}>
        <View
          style={{
            width: screenOrientation === 'PORTRAIT' ? screenWidth : screenHeight / 9 * 8,
            height: screenOrientation === 'PORTRAIT' ? screenWidth / 8 * 9 : screenHeight,
          }}>
          <Video
            source={{ uri: dataUri }}
            rate={1.0}
            volume={1.0}
            isMuted={false}
            resizeMode="cover"
            shouldPlay={true}
            positionMillis={50}
            useNativeControls={true}
            isLooping={false}
            style={{ width: '100%', height: '100%' }}
          />
        </View>
        <View style={{
          flexDirection: screenOrientation === 'PORTRAIT' ? 'row' : 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'black',
          width: screenOrientation === 'PORTRAIT' ? '100%' : (screenWidth - screenHeight / 9 * 8) / 2,
          height: screenOrientation === 'PORTRAIT' ? (screenHeight - screenWidth / 8 * 9) / 2 : '100%'
        }}>
          <TouchableOpacity
            style={{
              ...buttonStyles.regularButton,
              width: deviceType === 2 && screenOrientation === 'LANDSCAPE' ? '60%' : '30%',
              height: 50,
              marginHorizontal: screenOrientation === 'PORTRAIT' ? 15 : 0,
              marginTop: deviceType === 2 ? 30 : 0,
            }}
            onPress={handleSave}>
            <Text style={buttonStyles.regularButtonText}
            >Save
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              ...buttonStyles.regularButton,
              width: deviceType === 2 && screenOrientation === 'LANDSCAPE' ? '60%' : '30%',
              height: 50,
              marginHorizontal: screenOrientation === 'PORTRAIT' ? 15 : 0,
              marginTop: deviceType === 2 ? 30 : 0,
            }}
            onPress={handleRefresh}>
            <Text style={buttonStyles.regularButtonText}
            >Redo
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
};

const styles = StyleSheet.create({
  overlayText: {
    color: 'blue',
    fontSize: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    fontWeight: 'bold',
    width: '100%',
    textAlign: 'center',
    borderRadius: 5,
  },
  button: {
    borderColor: 'black',
    borderWidth: 1,
    backgroundColor: 'white',
    borderRadius: 5,
  }
});

export default PreviewAccompaniment;
