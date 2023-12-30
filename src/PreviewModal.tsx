import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Button,
  Dimensions,
  Image,
  type ImageSourcePropType,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
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
  ReduceMotion,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import ChevronIcon from './assets/icons/ChevronIcon';
import { BrokenImage } from './assets/images';
import { isValidUrl } from './utils/validations';
import { CloseIcon } from './assets/icons';

/**
 * Modal component for previewing images with zoom and pan gestures.
 * @component
 * @param {string[]} images - An array of image URLs or a single image URL.
 * @returns {ReactElement} - React component
 */
const PreviewModal: React.FC<{ images: string[] }> = ({ images }) => {
  const MAX_X_OFFSET = 100;
  const { height } = useWindowDimensions();
  const savedPositionX = useSharedValue(0);
  const positionX = useSharedValue(0);
  const animatedText = useSharedValue(1);
  const savedPositionY = useSharedValue(0);
  const positionY = useSharedValue(0);
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(true);
  const [imageIndex, setImageIndex] = useState(1);
  const [isImageLoaded, setIsImageLoaded] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
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
    })
    .onEnd((e) => {
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
        runOnJS(setIsImageLoaded)(false);
        runOnJS(setError)(false);
        runOnJS(setImageIndex)(imageIndex - 1);
      }
      if (
        e.translationX < -MAX_X_OFFSET &&
        imageIndex < images.length - 1 &&
        scale.value === 1
      ) {
        runOnJS(setImageIndex)(imageIndex + 1);
        runOnJS(setIsImageLoaded)(false);
        runOnJS(setError)(false);
        positionX.value = withTiming(0);
      }

      if ((e.translationY > 200 || e.translationY < -200) && scale.value <= 1) {
        runOnJS(setIsModalOpen)(false);
      }
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
      savedScale.value = scale.value;
      if (scale.value < 1) {
        scale.value = withTiming(1);
        savedScale.value = 1;

        positionX.value = withTiming(0, { duration: 100 });
        positionY.value = withTiming(0, { duration: 100 });
        savedPositionX.value = 0;
        savedPositionY.value = 0;
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      positionY.value,
      [-height / 2, -200, -100, 0, 100, 200, height / 2],
      [0, 0.75, 1, 1, 1, 0.75, 0],
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
      [
        '#FFFFFF00',
        '#FFFFFFBF',
        '#000000',
        '#000000',
        '#000000',
        '#FFFFFFBF',
        '#FFFFFF00',
      ]
    );
    return {
      backgroundColor: scale.value > 1 ? 'black' : backgroundColor,
    };
  });

  const nextButtonAnimatedStyles = useAnimatedStyle(() => {
    const opacity = interpolate(
      positionX.value,
      [-50, -MAX_X_OFFSET],
      [0, 1],
      Extrapolation.CLAMP
    );
    return {
      opacity:
        imageIndex < images.length - 1 && scale.value === 1 ? opacity : 0,
    };
  });

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
  useEffect(() => {
    animatedText.value = withRepeat(
      withTiming(0.3, { duration: 1000, reduceMotion: ReduceMotion.System }),
      -1,
      true
    );
  }, [animatedText]);

  const blinkingTextStyles = useAnimatedStyle(() => {
    const opacity = animatedText.value;
    return {
      opacity: opacity,
    };
  });

  const composedGestures = Gesture.Race(doubleTap, pan, pinch);

  //
  const getImageSource = (): ImageSourcePropType => {
    // Basic checks to prevent errors
    // Return broken image if error or invalid images array
    if (error || !Array.isArray(images)) {
      return BrokenImage;
    }

    return fetchImageAtIndex(images, imageIndex);
  };

  const fetchImageAtIndex = (
    images: any[],
    index: number
  ): ImageSourcePropType => {
    // Check if the index is within bounds
    if (index >= images.length) {
      return BrokenImage;
    }

    // Check the type of the image at the index and return accordingly
    const imageAtIndex = images[index];
    if (typeof imageAtIndex === 'string') {
      return isValidUrl(imageAtIndex) ? { uri: imageAtIndex } : BrokenImage;
    } else if (typeof imageAtIndex === 'number') {
      return imageAtIndex;
    }

    return BrokenImage;
  };

  return (
    <View
      style={{
        backgroundColor: 'white',
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Button title={'show modal'} onPress={() => setIsModalOpen(true)} />
      {isModalOpen && (
        <Animated.View
          exiting={FadeOut}
          style={[styles.container, containerAnimatedStyle]}
        >
          <GestureHandlerRootView style={{ flex: 1 }}>
            <GestureDetector gesture={composedGestures}>
              <View
                style={{
                  flexDirection: 'row',
                  flex: 1,
                  alignItems: 'center',
                }}
              >
                <Pressable
                  hitSlop={20}
                  onPress={() => setIsModalOpen(false)}
                  style={styles.closeButtonContainerStyles}
                >
                  <Image
                    style={styles.closeButtonStyles}
                    tintColor={'white'}
                    source={CloseIcon}
                  />
                </Pressable>
                <Animated.View
                  style={[
                    styles.absolute,
                    styles.left0,
                    previousButtonAnimatedStyles,
                  ]}
                >
                  <ChevronIcon />
                </Animated.View>
                {!isImageLoaded && (
                  <View
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 1000,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ActivityIndicator animating />
                    <Animated.Text
                      style={[
                        {
                          color: 'white',
                          paddingVertical: 10,
                          textAlign: 'center',
                        },
                        blinkingTextStyles,
                      ]}
                    >
                      Loading...
                    </Animated.Text>
                  </View>
                )}
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
                  source={getImageSource()}
                />

                <Animated.View
                  style={[
                    styles.absolute,
                    styles.right0,
                    nextButtonAnimatedStyles,
                  ]}
                >
                  <ChevronIcon style={{ transform: [{ rotate: '180deg' }] }} />
                </Animated.View>
              </View>
            </GestureDetector>
          </GestureHandlerRootView>
        </Animated.View>
      )}
    </View>
  );
};

/**
 * Represents a collection of style objects.
 */
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  image: {
    width: Dimensions.get('screen').width,
    height: Dimensions.get('screen').height / 3,
    resizeMode: 'contain',
  },
  absolute: {
    position: 'absolute',
  },
  relative: {
    position: 'relative',
  },
  left0: {
    left: 0,
  },
  right0: {
    right: 0,
  },
  closeButtonContainerStyles: {
    position: 'absolute',
    top: 100,
    right: 20,
  },
  closeButtonStyles: { height: 15, width: 15, resizeMode: 'contain' },
});

export default PreviewModal;
