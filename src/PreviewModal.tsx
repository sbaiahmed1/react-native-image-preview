import React, { useState } from 'react';
import {
  Button,
  Modal,
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

const PreviewModal: React.FC = () => {
  const MAX_X_OFFSET = 150;
  const { width, height } = useWindowDimensions();
  const savedPositionX = useSharedValue(0);
  const positionX = useSharedValue(0);
  const savedPositionY = useSharedValue(0);
  const positionY = useSharedValue(0);
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(true);

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
    .onStart((_) => {
      scale.value = savedScale.value;
    })
    .onUpdate((e) => {
      scale.value = e.scale;
    })
    .onEnd((e) => {
      if (e.scale < 1) {
        scale.value = withTiming(1);
        savedScale.value = 1;
      }
      scale.value = e.scale;
      savedScale.value = e.scale;
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: positionY.value },
        { translateX: positionX.value },
        { scale: scale.value },
      ],
    };
  });

  const imageAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      positionY.value,
      [-height / 3, -200, 0, 200, height / 3],
      [0, 0.5, 1, 0.5, 0],
      Extrapolation.CLAMP
    );
    return {
      opacity: scale?.value > 1 ? 1 : opacity,
    };
  });

  const containerAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      positionY.value,
      [-height / 3, -200, 0, 200, height / 3],
      ['#FFFFFF00', '#FFFFFF80', '#000000', '#FFFFFF80', '#FFFFFF00']
    );
    return {
      backgroundColor: scale.value > 1 ? 'black' : backgroundColor,
    };
  });

  const composedGestures = Gesture.Race(doubleTap, pan, pinch);

  return (
    <View style={{ backgroundColor: 'green', flex: 1, width: '100%' }}>
      <Button title={'show modal'} onPress={() => setIsModalOpen(true)} />
      <Button title={'show modal'} onPress={() => setIsModalOpen(true)} />
      <Button title={'show modal'} onPress={() => setIsModalOpen(true)} />
      <Modal transparent visible={isModalOpen} animationType={'fade'}>
        <Animated.View style={[styles.container, containerAnimatedStyle]}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <GestureDetector gesture={composedGestures}>
              <Animated.Image
                resizeMode={'contain'}
                fadeDuration={500}
                style={[
                  { width, height: '100%' },
                  animatedStyle,
                  imageAnimatedStyle,
                ]}
                source={{
                  uri: 'https://img.freepik.com/photos-gratuite/peinture-numerique-montagne-arbre-colore-au-premier-plan_1340-25699.jpg?size=626&ext=jpg&ga=GA1.1.1826414947.1699142400&semt=ais',
                }}
              />
            </GestureDetector>
          </GestureHandlerRootView>
        </Animated.View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
});

export default PreviewModal;
