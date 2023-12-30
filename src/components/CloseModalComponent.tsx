import { styles } from '../utils/previewModalStyles';
import { Image, Pressable } from 'react-native';
import { CloseIcon } from '../assets/icons';
import React from 'react';

const CloseModalComponent: React.FC<{ onCloseModal: () => void }> = ({
  onCloseModal,
}) => {
  return (
    <>
      <Pressable
        hitSlop={20}
        onPress={onCloseModal}
        style={styles.closeButtonContainerStyles}
      >
        <Image
          style={styles.closeButtonStyles}
          tintColor={'white'}
          source={CloseIcon}
        />
      </Pressable>
    </>
  );
};

export default CloseModalComponent;
