import React, { type Ref, useState } from 'react';
import { FlatList, useWindowDimensions, View } from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  type AnimatedRef,
  Extrapolation,
  FadeIn,
  FadeOut,
  interpolate,
  interpolateColor,
  runOnJS,
  scrollTo,
  useAnimatedRef,
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
  PaginationComponent,
  PreviousImageComponent,
} from './components';
import { getImageSource } from './utils/imageHelper';
import { onPinchGestureEnd } from './utils/pinchGestureUtils';
import { BrokenImage } from './assets/images';

/*
 * Modal component for previewing images with zoom and pan gestures.
 * @component
 * @returns {ReactElement} - React component
 */

interface PreviewModalProps {
  testID?: string;
  images: string[] | number[];
  isModalOpen: boolean;
  isPanGestureEnabled?: boolean;
  isPinchGestureEnabled?: boolean;
  isDoubleTapToZoomEnabled?: boolean;
  isSwipeToDismissEnabled?: boolean;
  onCloseModal: () => void;
  CustomLoadingComponent?: () => JSX.Element;
  CustomPreviousImageComponent?: () => JSX.Element;
  CustomNextImageComponent?: () => JSX.Element;
  errorImageUrl?: number;
  showPaginationComponent?: boolean;
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  isModalOpen = false,
  images = [],
  onCloseModal,
  CustomLoadingComponent,
  CustomNextImageComponent,
  CustomPreviousImageComponent,
  isPanGestureEnabled = true,
  isPinchGestureEnabled = true,
  isDoubleTapToZoomEnabled = true,
  isSwipeToDismissEnabled = true,
  errorImageUrl,
  showPaginationComponent,
}) => {
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

  // Refs
  const indicatorsRef = useAnimatedRef<FlatList<string | number>>();

  const pan = Gesture.Pan()
    .enabled(isPanGestureEnabled)
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
          scrollTo(indicatorsRef, (imageIndex - 1) * 17, 0, true);
        },
        swipeRightCallback: () => {
          runOnJS(setImageIndex)(imageIndex + 1);
          runOnJS(setIsImageLoaded)(false);
          runOnJS(setError)(false);
          scrollTo(indicatorsRef, (imageIndex + 1) * 17, 0, true);
          positionX.value = withTiming(0);
        },
        closeModalCallback: () => {
          isSwipeToDismissEnabled && runOnJS(onCloseModal)();
        },
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

  const pinch = Gesture.Pinch()
    .enabled(isPinchGestureEnabled)
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

  // Methods
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

  return isModalOpen ? (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      style={[styles.container, containerAnimatedStyle]}
    >
      <GestureHandlerRootView style={styles.fullFlex}>
        <GestureDetector gesture={composedGestures}>
          <View style={styles.flexRowCenter}>
            <CloseModalComponent onCloseModal={onCloseModal} />
            <PreviousImageComponent
              CustomPreviousImageComponent={CustomPreviousImageComponent}
              imageIndex={imageIndex}
              scale={scale}
              positionX={positionX}
            />
            <ImageLoadingComponent
              CustomLoadingComponent={CustomLoadingComponent}
              isImageLoaded={isImageLoaded}
            />
            <Animated.Image
              onLoadEnd={handleImageLoadEnd}
              onError={handleError}
              entering={FadeIn.delay(100).duration(200)}
              exiting={FadeOut.duration(200)}
              resizeMode={'contain'}
              key={images[imageIndex]}
              fadeDuration={500}
              style={[styles.image, animatedStyle]}
              resizeMethod={'resize'}
              source={getImageSource(imageIndex, images, error, errorImageUrl)}
            />

            <NextImageComponent
              CustomNextImageComponent={CustomNextImageComponent}
              positionX={positionX}
              imageIndex={imageIndex}
              imagesLength={images?.length}
              scale={scale}
            />
            {showPaginationComponent && (
              <PaginationComponent
                positionY={positionY}
                scale={scale}
                images={images}
                onIndicatorPress={(index: number) => {
                  scrollTo(indicatorsRef, index * 17, 0, true);
                  setImageIndex(index);
                  setIsImageLoaded(false);
                  setError(false);
                }}
                imageIndex={imageIndex}
                positionX={positionX}
                ref={
                  indicatorsRef as Ref<AnimatedRef<FlatList<string | number>>>
                }
              />
            )}
          </View>
        </GestureDetector>
      </GestureHandlerRootView>
    </Animated.View>
  ) : (
    <></>
  );
};

PreviewModal.defaultProps = {
  testID: 'PreviewModal',
  isModalOpen: false,
  images: [],
  isPanGestureEnabled: true,
  isPinchGestureEnabled: true,
  isDoubleTapToZoomEnabled: true,
  isSwipeToDismissEnabled: true,
  errorImageUrl: BrokenImage,
  showPaginationComponent: true,
};

export default PreviewModal;
