import React, { useState } from 'react';
import {
  Button,
  Dimensions,
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
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import ChevronIcon from './assets/icons/ChevronIcon';

const PreviewModal: React.FC<{ images: string | string[] }> = ({ images }) => {
  const MAX_X_OFFSET = 150;
  const { height } = useWindowDimensions();
  const savedPositionX = useSharedValue(0);
  const positionX = useSharedValue(0);
  const savedPositionY = useSharedValue(0);
  const positionY = useSharedValue(0);
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(true);
  const [imageIndex, setImageIndex] = useState(0);
  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (
        savedPositionX.value + e.translationX > 0 &&
        savedPositionX.value + e.translationX < MAX_X_OFFSET * scale.value
      ) {
        positionX.value = savedPositionX.value + e.translationX;
      }

      if (
        savedPositionX.value + e.translationX < 0 &&
        savedPositionX.value + e.translationX > -MAX_X_OFFSET * scale.value
      ) {
        positionX.value = savedPositionX.value + e.translationX;
      }

      positionY.value = savedPositionY.value + e.translationY;
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

      if (e.translationX > 140 && imageIndex > 0) {
        positionX.value = withTiming(0);
        runOnJS(setImageIndex)(imageIndex - 1);
      }
      if (e.translationX < -140 && imageIndex < images.length - 1) {
        runOnJS(setImageIndex)(imageIndex + 1);
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
        positionX.value = withTiming(0);
        positionY.value = withTiming(0);
        savedPositionY.value = 0;
        savedPositionY.value = 0;
      } else {
        scale.value = withTiming(2);
      }
    });

  const pinch = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = Math.min(savedScale.value * event.scale, 3);
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
      [-height / 3, -200, -100, 0, 100, 200, height / 3],
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
      [-height / 3, -200, -100, 0, 100, 200, height / 3],
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
      [-100, -130],
      [0, 1],
      Extrapolation.CLAMP
    );
    return {
      opacity,
    };
  });

  const previousButtonAnimatedStyles = useAnimatedStyle(() => {
    const opacity = interpolate(
      positionX.value,
      [100, 130],
      [0, 1],
      Extrapolation.CLAMP
    );
    return {
      opacity,
    };
  });

  const composedGestures = Gesture.Race(doubleTap, pan, pinch);

  return (
    <View style={{ backgroundColor: 'white', flex: 1, width: '100%' }}>
      <Button title={'show modal'} onPress={() => setIsModalOpen(true)} />
      <Button title={'show modal'} onPress={() => setIsModalOpen(true)} />
      <Button title={'show modal'} onPress={() => setIsModalOpen(true)} />
      {isModalOpen && (
        <Animated.View style={[styles.container, containerAnimatedStyle]}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <GestureDetector gesture={composedGestures}>
              <View
                style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}
              >
                <Animated.View
                  style={[
                    styles.absolute,
                    styles.left0,
                    previousButtonAnimatedStyles,
                  ]}
                >
                  <ChevronIcon />
                </Animated.View>
                <Animated.Image
                  resizeMode={'contain'}
                  fadeDuration={500}
                  style={[styles.image, animatedStyle]}
                  source={{
                    uri: images[imageIndex],
                  }}
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
    height: '100%',
  },
  absolute: {
    position: 'absolute',
  },
  left0: {
    left: 0,
  },
  right0: {
    right: 0,
  },
});

export default PreviewModal;
