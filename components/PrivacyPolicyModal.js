import React from 'react';
import { View, Modal, Text, StyleSheet, TouchableOpacity } from 'react-native';

const PrivacyPolicyModal = (props) => {

  const { setShowPrivacyPolicyModal } = props;

  const handleClose = () => {
    setShowPrivacyPolicyModal(false);
  }
  return (
    <View>
      <Modal
        supportedOrientations={['portrait', 'landscape', 'landscape-right']}
      >
        <View style={styles.container}>
          <Text style={styles.titleTextBlue}>Our Privacy Policy</Text>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.close}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
          <Text style={styles.privacyPolicyText}>This is an example privacy policy
          ............................................................................
          ............................................................................
          ............................................................................
          ............................................................................
          ............................................................................
          ............................................................................
          ............................................................................
          ............................................................................
          ............................................................................
          ............................................................................
          ............................................................................
          ............................................................................
          ............................................................................
          ............................................................................
          ............................................................................
          ............................................................................
          ............................................................................
          ............................................................................
          ............................................................................
          ............................................................................</Text>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.close}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  )
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 10,
    backgroundColor: '#ffd12b',
    flex: 1,
  },
  titleTextBlue: {
    fontSize: 22,
    fontWeight: 'bold',
    alignSelf: 'center',
    textAlign: 'center',
    marginTop: 30,
    marginHorizontal: 10,
    color: '#0047B9',
  },
  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: '#0047B9',
    marginVertical: 15,
  },
  privacyPolicyText: {
    fontSize: 16,
    // textAlign: 'center',
  }
});

export default PrivacyPolicyModal;
