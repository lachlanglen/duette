import * as Linking from 'expo-linking';

export default {
  // prefixes: [Linking.makeUrl('/')],
  prefixes: ['myapp://'],
  config: {
    Root: {
      path: 'root',
      screens: {
        Accompaniment: 'accompaniment',
        Duette: 'duette',
        Settings: 'settings',
      },
    },
  },
};
