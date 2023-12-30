import React, { useState } from 'react';
import { useWindowDimensions, View } from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  FadeInRight,
  FadeOut,
  FadeOutRight,
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { onPanGestureEnd, onPanGestureUpdate } from './utils/panGestureUtils';
import {
  containerBackgroundOpacityRange,
  containerBackgroundOutputRange,
} from './utils/constants';
import { styles } from './utils/previewModalStyles';
import {
  CloseModalComponent,
  ImageLoadingComponent,
  NextImageComponent,
  PreviousImageComponent,
} from './components';
import { getImageSource } from './utils/imageHelper';
import { onPinchGestureEnd } from './utils/pinchGestureUtils';

/*
 * Modal component for previewing images with zoom and pan gestures.
 * @component
 * @returns {ReactElement} - React component
 */

const PreviewModal: React.FC<{
  images: string[] | number[];
  isModalOpen: boolean;
  onCloseModal: () => void;
}> = ({ isModalOpen = false, images = [], onCloseModal }) => {
  const { height } = useWindowDimensions();
  const savedPositionX = useSharedValue(0);
  const positionX = useSharedValue(0);
  const savedPositionY = useSharedValue(0);
  const positionY = useSharedValue(0);
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const [imageIndex, setImageIndex] = useState(0);
  const [isImageLoaded, setIsImageLoaded] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      onPanGestureUpdate({
        savedPositionX,
        savedPositionY,
        positionY,
        scale,
        positionX,
        e,
      });
    })
    .onEnd((e) => {
      onPanGestureEnd({
        e,
        imageIndex,
        savedPositionX,
        positionY,
        positionX,
        savedPositionY,
        scale,
        imagesLength: images?.length,
        swipeLeftCallback: () => {
          positionX.value = withTiming(0);
          runOnJS(setIsImageLoaded)(false);
          runOnJS(setError)(false);
          runOnJS(setImageIndex)(imageIndex - 1);
        },
        swipeRightCallback: () => {
          runOnJS(setImageIndex)(imageIndex + 1);
          runOnJS(setIsImageLoaded)(false);
          runOnJS(setError)(false);
          positionX.value = withTiming(0);
        },
        closeModalCallback: () => {
          runOnJS(onCloseModal)();
        },
      });
    });

  const doubleTap = Gesture.Tap()
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

  const pinch = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = Math.min(savedScale.value * event.scale, 4);
    })
    .onEnd(() => {
      onPinchGestureEnd({
        scale,
        savedScale,
        savedPositionX,
        savedPositionY,
        positionY,
        positionX,
      });
    });

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      positionY.value,
      [-height / 2, -200, -100, 0, 100, 200, height / 2],
      containerBackgroundOpacityRange,
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { translateY: positionY.value },
        { translateX: positionX.value },
        { scale: scale.value },
      ],
      opacity: scale?.value > 1 ? 1 : opacity,
    };
  });

  const containerAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      positionY.value,
      [-height / 2, -200, -100, 0, 100, 200, height / 2],
      containerBackgroundOutputRange
    );
    return {
      backgroundColor: scale.value > 1 ? 'black' : backgroundColor,
    };
  });

  const composedGestures = Gesture.Race(doubleTap, pan, pinch);

  return isModalOpen ? (
    <Animated.View
      exiting={FadeOut}
      style={[styles.container, containerAnimatedStyle]}
    >
      <GestureHandlerRootView style={styles.fullFlex}>
        <GestureDetector gesture={composedGestures}>
          <View style={styles.flexRowCenter}>
            <CloseModalComponent onCloseModal={onCloseModal} />
            <PreviousImageComponent
              imageIndex={imageIndex}
              scale={scale}
              positionX={positionX}
            />
            {!isImageLoaded && <ImageLoadingComponent />}
            <Animated.Image
              onLoadEnd={() => {
                setIsImageLoaded(true);
              }}
              onError={() => {
                setError(true);
              }}
              entering={FadeInRight.duration(200)}
              exiting={FadeOutRight.duration(200)}
              resizeMode={'contain'}
              key={images[imageIndex]}
              fadeDuration={500}
              style={[styles.image, animatedStyle]}
              resizeMethod={'resize'}
              source={getImageSource(imageIndex, images, error)}
            />

            <NextImageComponent
              positionX={positionX}
              imageIndex={imageIndex}
              imagesLength={images?.length}
              scale={scale}
            />
          </View>
        </GestureDetector>
      </GestureHandlerRootView>
    </Animated.View>
  ) : (
    <></>
  );
};

export default PreviewModal;
