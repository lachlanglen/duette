/* eslint-disable complexity */
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View, Dimensions, Modal, StyleSheet } from 'react-native';
import { Video } from 'expo-av';
import * as ScreenOrientation from 'expo-screen-orientation';
import buttonStyles from '../../styles/button';

const PreviewAccompaniment = (props) => {
  const {
    dataUri,
    handleSave,
    handleRefresh,
  } = props;

  let screenWidth = Math.floor(Dimensions.get('window').width);
  let screenHeight = Math.floor(Dimensions.get('window').height);

  const [screenOrientation, setScreenOrientation] = useState('');

  useEffect(() => {
    const detectOrientation = async () => {
      if (screenWidth > screenHeight) setScreenOrientation('LANDSCAPE');
      if (screenWidth < screenHeight) setScreenOrientation('PORTRAIT');
      await ScreenOrientation.unlockAsync();
      ScreenOrientation.addOrientationChangeListener(info => {
        if (info.orientationInfo.orientation === 'UNKNOWN') {
          if (screenWidth > screenHeight) setScreenOrientation('LANDSCAPE');
          if (screenWidth < screenHeight) setScreenOrientation('PORTRAIT');
        } else {
          if (info.orientationInfo.orientation === 1 || info.orientationInfo.orientation === 2) setScreenOrientation('PORTRAIT');
          if (info.orientationInfo.orientation === 3 || info.orientationInfo.orientation === 4) setScreenOrientation('LANDSCAPE');
        }
      })
    };
    detectOrientation();
    return async () => {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    }
  }, []);

  return (
    <Modal
      animationType="fade"
      supportedOrientations={['portrait', 'portrait-upside-down', 'landscape', 'landscape-left', 'landscape-right']}
    >
      <View
        style={{
          flexDirection: screenOrientation === 'PORTRAIT' ? 'column' : 'row',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'black',
          paddingVertical: screenOrientation === 'PORTRAIT' ? (screenHeight - (screenWidth / 8 * 9)) / 2 : 0,
          height: '100%',
        }}>
        <View
          style={{
            flexDirection: screenOrientation === 'PORTRAIT' ? 'column' : 'row',
            width: screenOrientation === 'PORTRAIT' ? screenWidth : screenHeight / 9 * 16 * 0.9,
            height: screenOrientation === 'PORTRAIT' ? screenWidth / 8 * 16 * 0.9 : screenHeight * 0.9,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'black',
          }}>
          {
            !dataUri ? (
              <View
                style={{
                  backgroundColor: 'black',
                  width: screenOrientation === 'PORTRAIT' ? '100%' : screenHeight / 9 * 8 * 0.9,
                  height: screenOrientation === 'PORTRAIT' ? screenWidth / 8 * 9 : screenHeight * 0.9,
                }}
              />
            ) : (
                <Video
                  source={{ uri: dataUri }}
                  rate={1.0}
                  volume={1.0}
                  isMuted={false}
                  resizeMode="cover"
                  shouldPlay
                  positionMillis={50}
                  useNativeControls={true}
                  isLooping={false}
                  style={{
                    width: screenOrientation === 'PORTRAIT' ? '100%' : screenHeight / 9 * 8 * 0.9,
                    height: screenOrientation === 'PORTRAIT' ? screenWidth / 8 * 9 : screenHeight * 0.9,
                  }}
                />
              )
          }
          <View style={{
            flexDirection: screenOrientation === 'PORTRAIT' ? 'row' : 'column',
            marginTop: screenOrientation === 'PORTRAIT' ? 20 : 0,
            marginLeft: screenOrientation === 'PORTRAIT' ? 0 : 40,
          }}>
            <TouchableOpacity
              style={{
                ...buttonStyles.regularButton,
                width: screenOrientation === 'PORTRAIT' ? '30%' : 100,
                marginVertical: screenOrientation === 'PORTRAIT' ? 0 : 25,
                marginHorizontal: screenOrientation === 'PORTRAIT' ? 20 : 0,
              }}
              onPress={handleSave}>
              <Text style={buttonStyles.regularButtonText}
              >Save
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                ...buttonStyles.regularButton,
                width: screenOrientation === 'PORTRAIT' ? '30%' : 100,
                marginVertical: screenOrientation === 'PORTRAIT' ? 0 : 25,
                marginHorizontal: screenOrientation === 'PORTRAIT' ? 20 : 0,
              }}
              onPress={handleRefresh}>
              <Text style={buttonStyles.regularButtonText}
              >Redo
              </Text>
            </TouchableOpacity>
          </View>
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
