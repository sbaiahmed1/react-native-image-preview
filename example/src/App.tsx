import * as React from 'react';
import { useState } from 'react';

import { Button, StyleSheet, View } from 'react-native';
import { PreviewModal } from 'react-native-image-preview';

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  return (
    <View style={styles.container}>
      <Button title={'Open Modal'} onPress={() => setIsModalOpen(true)} />
      <PreviewModal
        onCloseModal={() => {
          setIsModalOpen(false);
        }}
        modalAnimationIn={'slideIn-down'}
        modalAnimationOut={'slideOut-down'}
        isModalOpen={isModalOpen}
        images={[
          'https://img.freepik.com/photos-gratuite/peinture-numerique-montagne-arbre-colore-au-premier-plan_1340-25699.jpg?size=626&ext=jpg&ga=GA1.1.1826414947.1699142400&semt=ais',
          'https://dfstudio-d420.kxcdn.com/wordpress/wp-content/uploads/2019/06/digital_camera_photo-1080x675.jpg',
          'https://theintercept.com/wp-content/uploads/2019/01/GettyImages-1077343584-1547140810-e1547141434550.jpg?fit=5000%2C2500',
          'https://google.com',
          'wys',
          'https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
          'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aHVtYW58ZW58MHx8MHx8fDA%3D',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSf_C3OjH3BbicdZ1UP0jAncMv-HpNvU_B1fg6C8H_vcg&s',
          'https://theinpaint.com/images/tutorials/online/how-to-remove-tourists-from-photo-3.jpg',
          'https://buffer.com/cdn-cgi/image/w=1000,fit=contain,q=90,f=auto/library/content/images/size/w1200/2023/10/free-images.jpg',
          'https://thumbs.dreamstime.com/b/jour-de-terre-d-environnement-dans-les-mains-des-arbres-cultivant-jeunes-plantes-bokeh-verdissent-la-main-femelle-fond-tenant-l-130247647.jpg',
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
});
