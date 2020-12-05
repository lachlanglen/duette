import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as Device from 'expo-device';

const FAQPage = () => {
  const [screenOrientation, setScreenOrientation] = useState('');
  const [deviceType, setDeviceType] = useState(null);

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
    };
    const getDeviceType = async () => {
      const type = await Device.getDeviceTypeAsync();
      setDeviceType(type);
    };
    detectOrientation();
    getDeviceType();
  }, []);

  return (
    <ScrollView style={{ backgroundColor: '#ffd12b' }}>
      <View style={{
        ...styles.container,
        paddingHorizontal: deviceType === 2 ? 40 : 20,
        paddingBottom: deviceType === 2 ? 80 : 40,
      }}>
        <Text style={styles.titleTextBlue}>Q: What is a 'Base Track'?</Text>
        <Text style={{
          ...styles.tierText,
          marginBottom: 0,
        }}>A: A Base Track is the left-hand side of a split-screen video - you could also think of it as an 'Accompaniment Track'. You can record a Base Track that other users can find and record a Duette along with (see below), or you can find a Base Track that has already been recorded and record a Duette alongside it!</Text>
        <Text style={styles.titleTextBlue}>Q: What is a 'Duette'?</Text>
        <Text style={{
          ...styles.tierText,
          marginBottom: 0,
        }}>A: A Duette is the completion of a split-screen video, which is available for 30 days and can be saved to your device and shared with your friends. You can record a Duette by searching for a Base Track (see above) and recording alongside it!</Text>
        <Text style={styles.titleTextBlue}>Q: What if there is no Base Track available for the song I want to record?</Text>
        <Text style={{
          ...styles.tierText,
          marginBottom: 0,
        }}>A: Just select "Record a Duette" and then choose the "Request a Base Track" option! Enter as many details as you can in the request form. Most of these requests get fulfilled within 48 hours, and we'll notify you when it's ready!</Text>
        <Text style={styles.titleTextBlue}>Q: Are the Base Tracks I record available to any Duette user?</Text>
        <Text style={{
          ...styles.tierText,
          marginBottom: 0,
        }}>A: It's up to you. When you save a Base Track, you have the option to make it "private" - meaning that a Duette user can only find your Base Track by searching by its unique ID. If you choose not to make your Base Track private, any user around the world will be able to find it and record along with it. We encourage you to make your Base Tracks public if you are comfortable doing so!</Text>
        <Text style={styles.titleTextBlue}>Q: How do I find the unique ID for my Base Track?</Text>
        <Text style={{
          ...styles.tierText,
          marginBottom: 0,
        }}>A: The unique ID will be available for you to copy when you first save your Base Track, and you can copy it again at any time by selecting "Record a Duette," searching for your Base Track, choosing the "Share" icon, and selecting "Copy Base Track ID."</Text>
        <Text style={styles.titleTextBlue}>Q: Can I share a Base Track?</Text>
        <Text style={{
          ...styles.tierText,
          marginBottom: 0,
        }}>A: Yes! Just search for the Base Track by selecting "Record a Duette," choose the "Share" icon on the Base Track you want to share, then select "Copy Base Track ID." You can share this ID with anyone, and they will be able to locate the Base Track immediately by entering the ID into the search field.</Text>
        <Text style={styles.titleTextBlue}>Q: How do I edit or delete Base Tracks I have recorded?</Text>
        <Text style={{
          ...styles.tierText,
          marginBottom: 0,
        }}>A: Just select “Record a Duette” from the home screen or the bottom menu and search for your Base Track. You can then edit the track details or delete the video entirely.
        </Text>
        <Text style={styles.titleTextBlue}>Q: Will I be notified when a user records a Duette along with my Base Track?</Text>
        <Text style={{
          ...styles.tierText,
          marginBottom: 0,
        }}>A: Yes! Be sure to allow notifications when requested, and ensure that "Receive Email Notifications" is enabled in your Settings.</Text>
        <Text style={styles.titleTextBlue}>Q: Can I use my own external microphone to record a Base Track or a Duette?</Text>
        <Text style={{
          ...styles.tierText,
          marginBottom: 0,
        }}>A: Yes! Just connect your external microphone to your device and you’re all set - Duette will automatically use it as the audio source.</Text>
        <Text style={styles.titleTextBlue}>Q: Does it matter if my headphones are wireless or not when I'm recording a Duette?</Text>
        <Text style={{
          ...styles.tierText,
          marginBottom: 0,
        }}>A: No - any headphones are fine!</Text>
        <Text style={styles.titleTextBlue}>Q: Does Duette use the audio input from my headphones when I record a Duette?</Text>
        <Text style={{
          ...styles.tierText,
          marginBottom: 0,
        }}>A: It depends. If your headphones have an audio input (mic) and you don’t have an external microphone connected to your device, then the audio input from your headphones will be used for your Duette. If you have an external microphone connected to your device, then Duette will use the audio input from the external mic, regardless of whether your headphones have an audio input or not.
        </Text>
        <Text style={styles.titleTextBlue}>Q: Are my Duettes private?</Text>
        <Text style={{
          ...styles.tierText,
          marginBottom: 0,
        }}>A: It's up to you! We encourage you to share your new Duette with the user who created the Base Track, and give you the option to do so when saving your Duette. If you choose this option, your Duette will be displayed on their "My Duettes" screen and they will be able to view and save it. If you choose not to share, the only user who will be able to view your Duette will be you.</Text>
        <Text style={styles.titleTextBlue}>Q: Is it possible to use my own watermark on my Duettes instead of the Duette logo?</Text>
        <Text style={{
          ...styles.tierText,
          marginBottom: 0,
        }}>A: Not currently. However, if this is a feature you’d like, email us at support@duette.app and we’ll consider finding a way to make it possible!</Text>
        <Text style={styles.titleTextBlue}>Q: Why can I only access my Duettes for 30 days?</Text>
        <Text style={{
          ...styles.tierText,
          marginBottom: 0,
        }}>A: In order to provide a free platform, we have to keep costs down at our end - including video storage. If you would like to access your Duettes for longer than 30 days, email us at support@duette.app and we’ll consider finding a way to make it possible!</Text>
        <Text style={styles.titleTextBlue}>Q: I have another question that isn’t already answered here. How can I get help?</Text>
        <Text style={{
          ...styles.tierText,
          marginBottom: 0,
        }}>A: Email us at support@duette.app with any questions that you have, and we will respond as soon as possible!</Text>
      </View>
    </ScrollView>
  )
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-start',
    flex: 1,
  },
  titleTextBlue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 30,
    color: '#0047B9'
  },
  tierText: {
    fontSize: 18,
    marginTop: 10,
    marginBottom: 10,
    fontWeight: 'bold',
  },
});

export default FAQPage;
