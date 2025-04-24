import { MAX_X_OFFSET } from './constants';
import { type SharedValue, withTiming } from 'react-native-reanimated';
import type {
  GestureStateChangeEvent,
  GestureUpdateEvent,
  PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';

export const onPanGestureUpdate = ({
  savedPositionX,
  savedPositionY,
  positionY,
  positionX,
  e,
  scale,
}: {
  e: GestureUpdateEvent<PanGestureHandlerEventPayload>;
  scale: SharedValue<number>;
  savedPositionX: SharedValue<number>;
  positionY: SharedValue<number>;
  positionX: SharedValue<number>;
  savedPositionY: SharedValue<number>;
}) => {
  'worklet';

  if (scale.value > 1) {
    // Directly apply translation for better performance when zoomed
    positionX.value = savedPositionX.value + e.translationX;
    positionY.value = savedPositionY.value + e.translationY;
  }
};

export const onPanGestureEnd = ({
  e,
  scale,
  positionX,
  positionY,
  savedPositionX,
  savedPositionY,
  swipeLeftCallback,
  swipeRightCallback,
}: {
  e: GestureStateChangeEvent<PanGestureHandlerEventPayload>;
  scale: SharedValue<number>;
  savedPositionX: SharedValue<number>;
  positionY: SharedValue<number>;
  positionX: SharedValue<number>;
  savedPositionY: SharedValue<number>;
  swipeLeftCallback: () => void;
  swipeRightCallback: () => void;
}) => {
  'worklet';
  if (scale.value <= 1) {
    positionX.value = withTiming(0, { duration: 100 });
    positionY.value = withTiming(0, { duration: 100 });
    savedPositionX.value = 0;
    savedPositionY.value = 0;
  } else {
    // Apply boundaries only at the end of gesture for better performance
    const maxOffsetX = MAX_X_OFFSET * scale.value;
    const maxOffsetY = MAX_X_OFFSET * scale.value;

    const newSavedX = savedPositionX.value + e.translationX;
    const newSavedY = savedPositionY.value + e.translationY;

    savedPositionX.value = Math.max(
      -maxOffsetX,
      Math.min(maxOffsetX, newSavedX)
    );
    savedPositionY.value = Math.max(
      -maxOffsetY,
      Math.min(maxOffsetY, newSavedY)
    );

    positionX.value = savedPositionX.value;
    positionY.value = savedPositionY.value;
  }

  if (
    e.translationX > MAX_X_OFFSET &&
    e.translationX > 0 &&
    scale.value === 1
  ) {
    positionX.value = withTiming(0);
    swipeLeftCallback();
  }
  if (e.translationX < -MAX_X_OFFSET && scale.value === 1) {
    swipeRightCallback();
    positionX.value = withTiming(0);
  }
};
