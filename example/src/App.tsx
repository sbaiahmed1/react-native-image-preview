import * as React from 'react';

import { StyleSheet, View } from 'react-native';
import { PreviewModal } from 'react-native-image-preview';

export default function App() {
  return (
    <View style={styles.container}>
      <PreviewModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
