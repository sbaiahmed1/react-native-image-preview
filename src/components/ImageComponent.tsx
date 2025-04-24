import { useWindowDimensions, View } from 'react-native';
import { styles } from '../utils/previewModalStyles';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
// Add this import
import Animated, {
  runOnJS,
  type SharedValue,
  useAnimatedReaction,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import {
  type animations,
  getAnimationIn,
  getAnimationOut,
} from '../utils/modalAnimation';
import { getImageSource } from '../utils/imageHelper';
import { type FC, type JSX, useState } from 'react';
import { onPanGestureEnd, onPanGestureUpdate } from '../utils/panGestureUtils';
import { onPinchGestureEnd } from '../utils/pinchGestureUtils';
import ImageLoadingComponent from './ImageLoadingComponent';

interface ImageComponentProps {
  /** Enable/disable pan gesture functionality */
  isPanGestureEnabled: boolean;
  /** Animation type for image entrance */
  imageAnimationIn: animations;
  /** Animation type for image exit */
  imageAnimationOut: animations;
  /** Enable/disable swipe to dismiss functionality */
  isSwipeToDismissEnabled: boolean;
  /** Callback function when modal needs to be closed */
  onCloseModal: () => void;
  /** Enable/disable double tap to zoom functionality */
  isDoubleTapToZoomEnabled: boolean;
  /** Enable/disable pinch gesture functionality */
  isPinchGestureEnabled: boolean;
  /** Image source (URL string or require'd local image number) */
  item: string | number;
  /** Fallback image to show when main image fails to load */
  errorImageUrl: number;
  /** Y position of the image */
  positionY: SharedValue<number>;
  /** X position of the image */
  positionX: SharedValue<number>;
  /** Scale of the image */
  scale: SharedValue<number>;
  /** Saved Y position of the image */
  savedPositionY: SharedValue<number>;
  /** Saved X position of the image */
  savedPositionX: SharedValue<number>;
  /** Saved scale of the image */
  savedScale: SharedValue<number>;
  CustomLoadingComponent?: () => JSX.Element;
}

const ImageComponent: FC<ImageComponentProps> = ({
  isPanGestureEnabled,
  CustomLoadingComponent,
  imageAnimationIn,
  imageAnimationOut,
  isSwipeToDismissEnabled,
  onCloseModal,
  isDoubleTapToZoomEnabled,
  isPinchGestureEnabled,
  item,
  errorImageUrl,
  positionY,
  positionX,
  scale,
  savedPositionY,
  savedPositionX,
  savedScale,
}) => {
  const [error, setError] = useState<boolean>(false);
  const [isImageLoaded, setIsImageLoaded] = useState<boolean>(false);
  const { width, height } = useWindowDimensions();
  /**
   * Function handleImageLoadEnd
   *
   * This function is used to handle the completion of image loading.
   * It sets the value of the isImageLoaded state variable to true.
   *
   * @function
   * @name handleImageLoadEnd
   * @returns {void}
   */
  const handleImageLoadEnd = (): void => {
    setIsImageLoaded(true);
  };

  /**
   * Sets the error state to true.
   *
   * @function handleError
   */
  const handleError = () => {
    setError(true);
  };

  /**
   * Gesture handler for double tap and pinch gestures.
   */
  // Modify the pan gesture
  const pan = Gesture.Pan()
    .enabled(isPanGestureEnabled)
    .activateAfterLongPress(80)
    .minDistance(10) // Only activate after moving 10px
    .onBegin(() => {
      // Only activate pan gesture when zoomed
      return scale.value > 1;
    })
    .onUpdate((e) => {
      if (scale.value > 1) {
        onPanGestureUpdate({
          savedPositionX,
          savedPositionY,
          positionY,
          scale,
          positionX,
          e,
        });
      }
    })
    .onEnd((e) => {
      // When scaled, update the saved position values to maintain position after finger release
      if (scale.value > 1) {
        savedPositionX.value = savedPositionX.value + e.translationX;
        savedPositionY.value = savedPositionY.value + e.translationY;
        positionX.value = savedPositionX.value;
        positionY.value = savedPositionY.value;
      }

      onPanGestureEnd({
        e,
        savedPositionX,
        positionY,
        positionX,
        savedPositionY,
        scale,
        swipeLeftCallback: () => {
          positionX.value = withTiming(0);
          runOnJS(setIsImageLoaded)(false);
          runOnJS(setError)(false);
        },
        swipeRightCallback: () => {
          runOnJS(setIsImageLoaded)(false);
          runOnJS(setError)(false);
          positionX.value = withTiming(0);
        },
      });
    });

  const pinch = Gesture.Pinch()
    .enabled(isPinchGestureEnabled)
    .onUpdate((event) => {
      // Apply smoother scaling with focal point consideration
      const newScale = Math.min(savedScale.value * event.scale, 4);
      scale.value = newScale;

      // Calculate focal point adjustments for more natural zooming
      if (event.scale > 1) {
        // Adjust position based on focal point when zooming in
        positionX.value =
          savedPositionX.value + event.focalX * (1 - event.scale);
        positionY.value =
          savedPositionY.value + event.focalY * (1 - event.scale);
      }
    })
    .onEnd((event) => {
      // Add momentum-based animation for smoother finish
      if (event.velocity > 0) {
        // Apply velocity-based animation with damping
        scale.value = withTiming(
          Math.min(Math.max(savedScale.value * event.scale, 1), 4),
          { duration: 250, easing: (t) => Math.sin((t * Math.PI) / 2) }
        );
      }

      onPinchGestureEnd({
        scale,
        savedScale,
        savedPositionX,
        savedPositionY,
        positionY,
        positionX,
      });
    });

  const doubleTap = Gesture.Tap()
    .enabled(isDoubleTapToZoomEnabled)
    .maxDuration(250)
    .numberOfTaps(2)
    .onStart(() => {
      if (scale.value > 1) {
        scale.value = withTiming(1);
        savedScale.value = 1;
        positionX.value = withTiming(0);
        positionY.value = withTiming(0);
        savedPositionY.value = 0;
        savedPositionY.value = 0;
      } else {
        scale.value = withTiming(2);
        savedScale.value = 2;
      }
    });

  /**
   * Animated style for the image component.
   */
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: positionY.value },
        { translateX: positionX.value },
        { scale: scale.value },
      ],
      // Add zIndex that increases when scaled to prevent overlap
      zIndex: scale.value > 1 ? 10 : 1,
    };
  });

  useAnimatedReaction(
    () => scale.value,
    (currentScale, previousScale) => {
      // When transitioning from zoomed to non-zoomed
      if (previousScale && previousScale > 1 && currentScale <= 1) {
        positionX.value = withTiming(0);
        positionY.value = withTiming(0);
        savedPositionX.value = 0;
        savedPositionY.value = 0;
      }
    }
  );

  // Add a vertical-only pan for swipe to dismiss
  const verticalPan = Gesture.Pan()
    .enabled(isSwipeToDismissEnabled)
    .minDistance(20) // Require more movement to activate
    .onBegin((e) => {
      // Only activate for vertical gestures when not zoomed
      return (
        scale.value <= 1 && Math.abs(e.velocityY) > Math.abs(e.velocityX) * 2
      );
    })
    .onUpdate((e) => {
      if (
        scale.value <= 1 &&
        Math.abs(e.translationY) > Math.abs(e.translationX) * 2
      ) {
        positionY.value = e.translationY;
      }
    })
    .onEnd((e) => {
      if ((e.translationY > 200 || e.translationY < -200) && scale.value <= 1) {
        runOnJS(onCloseModal)();
        positionY.value = withTiming(0);
      } else {
        positionY.value = withTiming(0);
      }
    });

  return (
    <View
      style={[{ width, height, justifyContent: 'center', overflow: 'hidden' }]}
    >
      <GestureDetector
        gesture={Gesture.Exclusive(
          doubleTap,
          Gesture.Simultaneous(pinch, Gesture.Race(pan, verticalPan))
        )}
      >
        <Animated.Image
          onLoadEnd={handleImageLoadEnd}
          onError={handleError}
          entering={getAnimationIn(imageAnimationIn).delay(100).duration(200)}
          exiting={getAnimationOut(imageAnimationOut).duration(200)}
          resizeMode={'contain'}
          fadeDuration={500}
          style={[styles.image, animatedStyle]}
          resizeMethod={'resize'}
          source={getImageSource(item, error, errorImageUrl)}
          // Remove the pointerEvents prop to allow gestures to work
        />
      </GestureDetector>
      <ImageLoadingComponent
        CustomLoadingComponent={CustomLoadingComponent}
        isImageLoaded={isImageLoaded}
      />
    </View>
  );
};

export default ImageComponent;
