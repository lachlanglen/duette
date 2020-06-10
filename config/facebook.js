// import Constants from 'expo-constants';
import * as Facebook from 'expo-facebook';

// const {
//   FACEBOOK_APP_ID,
//   FACEBOOK_APP_SECRET,
// } = Constants.manifest.extra;

const FACEBOOK_APP_ID = "1387690044775372";
const FACEBOOK_APP_SECRET = "2655f0aa2e0ad3fb38162cacbdb660b2";

Facebook.initializeAsync(FACEBOOK_APP_ID)

const facebook = Object.freeze({
  appId: FACEBOOK_APP_ID,
  appSecret: FACEBOOK_APP_SECRET,
});

export default facebook;
