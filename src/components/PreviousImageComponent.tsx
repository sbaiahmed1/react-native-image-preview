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

const PreviousImageComponent: React.FC<{
  positionX: SharedValue<number>;
  imageIndex: number;
  scale: SharedValue<number>;
}> = ({ positionX, imageIndex, scale }) => {
  const previousButtonAnimatedStyles = useAnimatedStyle(() => {
    const opacity = interpolate(
      positionX.value,
      [50, MAX_X_OFFSET],
      [0, 1],
      Extrapolation.CLAMP
    );
    return {
      opacity: imageIndex > 0 && scale.value === 1 ? opacity : 0,
    };
  });

  return (
    <>
      <Animated.View
        style={[styles.absolute, styles.left0, previousButtonAnimatedStyles]}
      >
        <ChevronIcon />
      </Animated.View>
    </>
  );
};

export default PreviousImageComponent;
