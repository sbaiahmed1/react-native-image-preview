import React, { useEffect } from 'react';
import { styles } from '../utils/previewModalStyles';
import { ActivityIndicator, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const ImageLoadingComponent: React.FC = () => {
  const animatedText = useSharedValue(1);

  const blinkingTextStyles = useAnimatedStyle(() => {
    const opacity = animatedText.value;
    return {
      opacity: opacity,
    };
  });

  useEffect(() => {
    animatedText.value = withRepeat(
      withTiming(0.3, { duration: 1000 }),
      -1,
      true
    );
  }, [animatedText]);

  return (
    <View style={styles.imageLoaderStyles}>
      <ActivityIndicator animating />
      <Animated.Text style={[styles.blinkingText, blinkingTextStyles]}>
        Loading...
      </Animated.Text>
    </View>
  );
};

export default ImageLoadingComponent;
