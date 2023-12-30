import { styles } from '../utils/previewModalStyles';
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import React from 'react';
import { MAX_X_OFFSET } from '../utils/constants';
import { Image } from 'react-native';
import { ChevronIcon } from '../assets/icons';

const NextImageComponent: React.FC<{
  positionX: SharedValue<number>;
  imageIndex: number;
  imagesLength: number;
  scale: SharedValue<number>;
  CustomNextImageComponent?: () => JSX.Element;
}> = ({
  positionX,
  imageIndex,
  scale,
  imagesLength,
  CustomNextImageComponent,
}) => {
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
        style={[styles.absolute, styles.right10, nextButtonAnimatedStyles]}
      >
        {CustomNextImageComponent ? (
          <CustomNextImageComponent />
        ) : (
          <Image source={ChevronIcon} style={styles.chevronRight} />
        )}
      </Animated.View>
    </>
  );
};

export default NextImageComponent;
