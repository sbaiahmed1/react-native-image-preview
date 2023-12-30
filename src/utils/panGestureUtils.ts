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
  positionX,
  positionY,
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
  if (
    savedPositionX.value + e.translationX > 0 &&
    savedPositionX.value + e.translationX < MAX_X_OFFSET * scale.value
  ) {
    positionX.value = e.translationX;
  }

  if (
    savedPositionX.value + e.translationX < 0 &&
    savedPositionX.value + e.translationX > -MAX_X_OFFSET * scale.value
  ) {
    positionX.value = e.translationX;
  }

  if (e.translationY + savedPositionY.value > 0 && scale.value === 1)
    positionY.value = e.translationY + savedPositionY.value;
};

export const onPanGestureEnd = ({
  e,
  scale,
  positionX,
  positionY,
  savedPositionX,
  savedPositionY,
  imageIndex,
  swipeLeftCallback,
  swipeRightCallback,
  closeModalCallback,
  imagesLength,
}: {
  e: GestureStateChangeEvent<PanGestureHandlerEventPayload>;
  scale: SharedValue<number>;
  savedPositionX: SharedValue<number>;
  positionY: SharedValue<number>;
  positionX: SharedValue<number>;
  savedPositionY: SharedValue<number>;
  imageIndex: number;
  imagesLength: number;
  swipeLeftCallback: () => void;
  swipeRightCallback: () => void;
  closeModalCallback: () => void;
}) => {
  'worklet';
  if (scale.value <= 1) {
    positionX.value = withTiming(0, { duration: 100 });
    positionY.value = withTiming(0, { duration: 100 });
    savedPositionX.value = 0;
    savedPositionY.value = 0;
  } else {
    savedPositionX.value = savedPositionX.value + e.translationX;
    savedPositionY.value = savedPositionY.value + e.translationY;
  }

  if (
    e.translationX > MAX_X_OFFSET &&
    e.translationX > 0 &&
    imageIndex > 0 &&
    scale.value === 1
  ) {
    positionX.value = withTiming(0);
    swipeLeftCallback();
  }
  if (
    e.translationX < -MAX_X_OFFSET &&
    imageIndex < imagesLength - 1 &&
    scale.value === 1
  ) {
    swipeRightCallback();
    positionX.value = withTiming(0);
  }

  if ((e.translationY > 200 || e.translationY < -200) && scale.value <= 1) {
    closeModalCallback();
  }
};
