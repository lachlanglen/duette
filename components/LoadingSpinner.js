import React from 'react';
import { View, ActivityIndicator, StyleSheet, Modal } from 'react-native';

const LoadingSpinner = () => {
  return (
    <Modal>
      <View style={styles.spinnerContainer}>
        <ActivityIndicator
          style={styles.spinner}
          size="large"
          color="#0047B9" />
      </View>
    </Modal>
  )
};

const styles = StyleSheet.create({
  spinnerContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffd12b',
    flex: 1,
  },
  spinner: {
    marginBottom: 30,
  },
})

export default LoadingSpinner;
