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
  savedScale.value = scale.value;
  if (scale.value < 1) {
    scale.value = withTiming(1);
    savedScale.value = 1;

    positionX.value = withTiming(0, { duration: 100 });
    positionY.value = withTiming(0, { duration: 100 });
    savedPositionX.value = 0;
    savedPositionY.value = 0;
  }
};
