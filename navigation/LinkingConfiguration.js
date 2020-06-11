import * as Linking from 'expo-linking';

export default {
  prefixes: [Linking.makeUrl('/')],
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
