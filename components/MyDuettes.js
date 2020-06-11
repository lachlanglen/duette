import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Text, View, SafeAreaView, FlatList, StyleSheet, Dimensions } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import MyDuettesItem from './MyDuettesItem';
import { fetchDuettes } from '../redux/duettes';
import { toggleUpgradeOverlay } from '../redux/upgradeOverlay';

const MyDuettes = (props) => {
  const [selectedDuette, setSelectedDuette] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [screenOrientation, setScreenOrientation] = useState('');

  let screenWidth = Math.round(Dimensions.get('window').width);
  let screenHeight = Math.round(Dimensions.get('window').height);

  useEffect(() => {
    const detectOrientation = () => {
      if (screenWidth > screenHeight) setScreenOrientation('LANDSCAPE');
      if (screenWidth < screenHeight) setScreenOrientation('PORTRAIT');
      ScreenOrientation.addOrientationChangeListener(info => {
        if (info.orientationInfo.orientation === 'UNKNOWN') {
          if (screenWidth > screenHeight) setScreenOrientation('LANDSCAPE');
          if (screenWidth < screenHeight) setScreenOrientation('PORTRAIT');
        } else {
          if (info.orientationInfo.orientation === 1 || info.orientationInfo.orientation === 2) setScreenOrientation('PORTRAIT');
          if (info.orientationInfo.orientation === 3 || info.orientationInfo.orientation === 4) setScreenOrientation('LANDSCAPE');
        }
      })
    }
    detectOrientation();
  });

  useEffect(() => {
    props.setDuettes(props.user.id)
  }, []);

  const handleToggleUpgradeOverlay = () => {
    props.toggleUpgradeOverlay(!props.displayUpgradeOverlay);
  };

  return (
    <SafeAreaView
      style={styles.container}>
      {
        props.userDuettes.length > 0 ? (
          <View style={{ flex: 1, paddingBottom: 10 }}>
            <Text style={{
              color: '#0047B9',
              fontSize: 20,
              fontWeight: 'bold',
              textAlign: 'center',
              paddingVertical: 10,
              fontStyle: 'italic',
            }}>Duettes available for 30 days</Text>
            <FlatList
              data={props.userDuettes}
              renderItem={({ item }) => (
                <MyDuettesItem
                  videoId={item.videoId}
                  videoTitle={item.video ? item.video.title : ''}
                  duetteId={item.id}
                  selectedDuette={selectedDuette}
                  setSelectedDuette={setSelectedDuette}
                  screenOrientation={screenOrientation}
                  screenWidth={screenWidth}
                  screenHeight={screenHeight}
                  showPreview={showPreview}
                  setShowPreview={setShowPreview}
                  handleToggleUpgradeOverlay={handleToggleUpgradeOverlay}
                />
              )}
              keyExtractor={item => item.id}
              viewabilityConfig={{}}
            />
          </View>
        ) : (
            <View>
              <Text style={styles.text}>
                No videos to display
              </Text>
            </View>
          )
      }
    </SafeAreaView>
  )
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFD12B',
  },
  text: {
    marginTop: 10,
    alignSelf: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
});

const mapState = ({ userDuettes, user, displayUpgradeOverlay }) => {
  return {
    userDuettes,
    user,
    displayUpgradeOverlay,
  }
};

const mapDispatch = dispatch => {
  return {
    setDuettes: userId => dispatch(fetchDuettes(userId)),
    toggleUpgradeOverlay: bool => dispatch(toggleUpgradeOverlay(bool)),
  }
}

export default connect(mapState, mapDispatch)(MyDuettes);
