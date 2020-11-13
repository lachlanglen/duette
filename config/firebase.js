import * as firebase from 'firebase';
import '@firebase/auth';
import '@firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDkGxO9Imhz6kwBpwDbg-lnjT5GisgGYP4',
  authDomain: 'duette-d435e.firebaseapp.com',
  databaseURL: 'https://duette-d435e.firebaseio.com',
  projectId: 'duette-d435e',
  storageBucket: 'duette-d435e.appspot.com',
  // messagingSenderId: '12345-insert-yourse',
  appId: '1:927814748138:ios:690395efef6610473e5493',
  measurementId: "G-EBJLGJ77JH"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export default firebase;