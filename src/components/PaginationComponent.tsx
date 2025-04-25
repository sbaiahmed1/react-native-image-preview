import { styles } from '../utils/previewModalStyles';
import {
  type FlatList,
  type ListRenderItem,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  type AnimatedRef,
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import React, { useCallback } from 'react';
import { AnimatedPressable, MAX_X_OFFSET } from '../utils/constants';

interface PaginationComponentProps {
  positionX: SharedValue<number>;
  positionY: SharedValue<number>;
  scale: SharedValue<number>;
  images: string[] | number[];
  imageIndex: number;
  onIndicatorPress: (index: number) => void;
}
type AnimatedFlatListRef = AnimatedRef<FlatList<string | number>>;

const PaginationComponent = React.forwardRef<
  AnimatedFlatListRef,
  PaginationComponentProps
>(
  (
    { positionX, positionY, images, scale, imageIndex, onIndicatorPress },
    ref
  ) => {
    // Animated styles
    const animatedViewStyle = useAnimatedStyle(() => {
      const opacity = interpolate(
        scale.value,
        [1, 1.5],
        [1, 0],
        Extrapolation.CLAMP
      );

      const dragToDismissOpacity = interpolate(
        positionY.value,
        [50, 100],
        [1, 0],
        Extrapolation.CLAMP
      );

      return {
        opacity: scale.value === 1 ? dragToDismissOpacity : opacity,
      };
    });

    const dotsAnimatedStyles = useAnimatedStyle(() => {
      const dotHeight = interpolate(
        positionX.value,
        [-MAX_X_OFFSET, 0, MAX_X_OFFSET],
        [9, 12, 9],
        Extrapolation.CLAMP
      );

      const opacity = interpolate(
        positionX.value,
        [-MAX_X_OFFSET, 0, MAX_X_OFFSET],
        [0.7, 1, 0.7],
        Extrapolation.CLAMP
      );
      return {
        height: dotHeight,
        width: dotHeight,
        opacity,
      };
    });

    // Méthods
    const getDynamicDotStyles = useCallback(
      (index: number) => {
        return {
          height: imageIndex === index ? 12 : 9,
          width: imageIndex === index ? 12 : 9,
          opacity: imageIndex === index ? 1 : 0.3,
        };
      },
      [imageIndex]
    );

    // Components
    const renderPaginationComponentItem: ListRenderItem<string | number> =
      useCallback(
        ({ index }) => {
          return (
            <AnimatedPressable
              hitSlop={10}
              onPress={() => onIndicatorPress(index)}
              style={[
                paginationComponentStyles.dotStyle,
                getDynamicDotStyles(index),
                imageIndex === index && dotsAnimatedStyles,
              ]}
            />
          );
        },
        [onIndicatorPress, getDynamicDotStyles, imageIndex, dotsAnimatedStyles]
      );

    return (
      <Animated.View
        style={[
          styles.absolute,
          paginationComponentStyles.container,
          animatedViewStyle,
        ]}
      >
        <View style={{ flex: 1, width: 100 }}>
          <Animated.FlatList
            onScrollToIndexFailed={() => {}}
            showsHorizontalScrollIndicator={false}
            ref={ref as AnimatedFlatListRef}
            contentContainerStyle={
              paginationComponentStyles.contentContainerStyle
            }
            data={images}
            horizontal
            renderItem={renderPaginationComponentItem}
          />
        </View>
      </Animated.View>
    );
  }
);

const paginationComponentStyles = StyleSheet.create({
  container: {
    bottom: 100,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    zIndex: 1,
  },
  contentContainerStyle: {
    alignSelf: 'center',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingEnd: 5,
  },
  dotStyle: {
    borderRadius: 6,
    backgroundColor: 'white',
    marginHorizontal: 3,
  },
});

export default PaginationComponent;
