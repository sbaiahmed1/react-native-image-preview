import * as React from 'react';

import { StyleSheet, View } from 'react-native';
import { PreviewModal } from 'react-native-image-preview';

export default function App() {
  return (
    <View style={styles.container}>
      <PreviewModal
        images={[
          'https://sample-videos.com/img/Sample-jpg-image-30mb.jpg',
          'https://img.freepik.com/photos-gratuite/peinture-numerique-montagne-arbre-colore-au-premier-plan_1340-25699.jpg?size=626&ext=jpg&ga=GA1.1.1826414947.1699142400&semt=ais',
          'https://dfstudio-d420.kxcdn.com/wordpress/wp-content/uploads/2019/06/digital_camera_photo-1080x675.jpg',
          'https://theintercept.com/wp-content/uploads/2019/01/GettyImages-1077343584-1547140810-e1547141434550.jpg?fit=5000%2C2500',
        ]}
      />
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
