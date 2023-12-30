import { styles } from '../utils/previewModalStyles';
import ChevronIcon from '../assets/icons/ChevronIcon';
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import React from 'react';
import { MAX_X_OFFSET } from '../utils/constants';

const NextImageComponent: React.FC<{
  positionX: SharedValue<number>;
  imageIndex: number;
  imagesLength: number;
  scale: SharedValue<number>;
}> = ({ positionX, imageIndex, scale, imagesLength }) => {
  const nextButtonAnimatedStyles = useAnimatedStyle(() => {
    const opacity = interpolate(
      positionX.value,
      [-50, -MAX_X_OFFSET],
      [0, 1],
      Extrapolation.CLAMP
    );
    return {
      opacity: imageIndex < imagesLength - 1 && scale.value === 1 ? opacity : 0,
    };
  });

  return (
    <>
      <Animated.View
        style={[styles.absolute, styles.right0, nextButtonAnimatedStyles]}
      >
        <ChevronIcon style={{ transform: [{ rotate: '180deg' }] }} />
      </Animated.View>
    </>
  );
};

export default NextImageComponent;
