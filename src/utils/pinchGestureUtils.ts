import { type SharedValue, withTiming } from 'react-native-reanimated';

export const onPinchGestureEnd = ({
  scale,
  savedScale,
  positionX,
  positionY,
  savedPositionX,
  savedPositionY,
}: {
  scale: SharedValue<number>;
  savedScale: SharedValue<number>;
  savedPositionX: SharedValue<number>;
  positionY: SharedValue<number>;
  positionX: SharedValue<number>;
  savedPositionY: SharedValue<number>;
}) => {
  'worklet';
  // If scale is less than 1.1, snap back to 1 with a smooth animation
  if (scale.value < 1.1) {
    scale.value = withTiming(1, { duration: 200 });
    savedScale.value = 1;
    positionX.value = withTiming(0, { duration: 200 });
    positionY.value = withTiming(0, { duration: 200 });
    savedPositionX.value = 0;
    savedPositionY.value = 0;
  } else {
    // Apply boundary constraints with smooth animations
    const maxScale = 4;
    const boundedScale = Math.min(Math.max(scale.value, 1), maxScale);

    if (boundedScale !== scale.value) {
      scale.value = withTiming(boundedScale, { duration: 200 });
    }

    savedScale.value = boundedScale;

    // Save the current position for the next gesture
    savedPositionX.value = positionX.value;
    savedPositionY.value = positionY.value;
  }
};
