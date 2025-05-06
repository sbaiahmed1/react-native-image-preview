import React, { type JSX, type Ref, useRef, useState } from 'react';
import { FlatList, useWindowDimensions, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  type AnimatedRef,
  interpolateColor,
  useAnimatedProps,
  useAnimatedRef,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { containerBackgroundOutputRange } from './utils/constants';
import { CloseModalComponent, PaginationComponent } from './components';
import { BrokenImage } from './assets/images';
import {
  type animations,
  getAnimationIn,
  getAnimationOut,
} from './utils/modalAnimation';
import { styles } from './utils/previewModalStyles';
import ImageComponent from './components/ImageComponent';

/*
 * Modal component for previewing images with zoom and pan gestures.
 * @component
 * @returns {ReactElement} - React component
 */

interface PreviewModalProps {
  testID?: string;
  images: string[] | number[];
  isModalOpen: boolean;
  isPinchGestureEnabled?: boolean;
  isDoubleTapToZoomEnabled?: boolean;
  isSwipeToDismissEnabled?: boolean;
  isPanGestureEnabled?: boolean;
  onCloseModal: () => void;
  CustomLoadingComponent?: () => JSX.Element;
  CustomPreviousImageComponent?: () => JSX.Element;
  CustomNextImageComponent?: () => JSX.Element;
  errorImageUrl?: number;
  showPaginationComponent?: boolean;
  modalAnimationIn?: animations;
  modalAnimationOut?: animations;
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  isModalOpen = false,
  images = [],
  onCloseModal,
  CustomLoadingComponent,
  isPanGestureEnabled = true,
  isPinchGestureEnabled = true,
  isDoubleTapToZoomEnabled = true,
  isSwipeToDismissEnabled = true,
  errorImageUrl = BrokenImage,
  showPaginationComponent = true,
  modalAnimationIn = 'fadeIn',
  modalAnimationOut = 'fadeOut',
}) => {
  const { width, height } = useWindowDimensions();
  const savedPositionX = useSharedValue(0);
  const positionX = useSharedValue(0);
  const savedPositionY = useSharedValue(0);
  const positionY = useSharedValue(0);
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const [imageIndex, setImageIndex] = useState(0);

  // Refs
  const indicatorsRef = useAnimatedRef<FlatList<string | number>>();
  const flatListRef = useAnimatedRef<FlatList<string | number>>();
  const isScrolling = useRef<boolean>(false);

  //FlatList refs

  const onViewableItemsChangedFunction = ({ viewableItems }: any) => {
    if (viewableItems?.[0]?.index !== undefined) {
      // Always scroll the indicator to match the current view
      indicatorsRef.current?.scrollToIndex({
        index: viewableItems[0].index,
        animated: true,
      });

      // Only update the image index if not triggered by manual navigation
      if (isScrolling.current) {
        return;
      } else {
        setImageIndex(viewableItems[0].index);
      }
    }
  };
  const onViewableItemsChanged = useRef(onViewableItemsChangedFunction);

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

  const animatedProps = useAnimatedProps(() => {
    return {
      scrollEnabled: scale.value <= 1,
      // Add these properties to improve scroll behavior
      simultaneousHandlers: scale.value <= 1 ? true : false,
      waitFor: scale.value <= 1 ? undefined : null,
    };
  });

  // Methods

  const handleModalClose = () => {
    savedPositionX.value = 0;
    savedPositionY.value = 0;
    savedScale.value = 1;
    scale.value = 1;
    positionX.value = 0;
    positionY.value = 0;
    onCloseModal();
  };

  return isModalOpen ? (
    <Animated.View
      entering={getAnimationIn(modalAnimationIn)}
      exiting={getAnimationOut(modalAnimationOut)}
      style={[styles.container, containerAnimatedStyle]}
    >
      <GestureHandlerRootView style={styles.fullFlex}>
        <View style={styles.flexRowCenter}>
          <Animated.FlatList<number | string>
            ref={flatListRef}
            animatedProps={animatedProps}
            data={images}
            maxToRenderPerBatch={1}
            initialNumToRender={1}
            renderItem={({ item }) => (
              <ImageComponent
                scale={scale}
                savedScale={savedScale}
                savedPositionX={savedPositionX}
                savedPositionY={savedPositionY}
                positionY={positionY}
                positionX={positionX}
                isPanGestureEnabled={isPanGestureEnabled}
                isPinchGestureEnabled={isPinchGestureEnabled}
                errorImageUrl={errorImageUrl}
                isDoubleTapToZoomEnabled={isDoubleTapToZoomEnabled}
                isSwipeToDismissEnabled={isSwipeToDismissEnabled}
                item={item}
                CustomLoadingComponent={CustomLoadingComponent}
                onCloseModal={handleModalClose}
              />
            )}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={imageIndex}
            onViewableItemsChanged={onViewableItemsChanged.current}
            viewabilityConfig={{
              itemVisiblePercentThreshold: 50,
            }}
            getItemLayout={(_, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
          />

          {showPaginationComponent && (
            <PaginationComponent
              positionY={positionY}
              scale={scale}
              images={images}
              onIndicatorPress={(index: number) => {
                isScrolling.current = true;
                indicatorsRef.current?.scrollToIndex({ index, animated: true });
                flatListRef.current?.scrollToIndex({
                  index,
                  animated: true,
                });
                setImageIndex(index);

                // Use a timeout to reset the flag after the scroll animation completes
                setTimeout(() => {
                  isScrolling.current = false;
                }, 300); // Adjust timing based on your animation duration
              }}
              imageIndex={imageIndex}
              positionX={positionX}
              ref={indicatorsRef as Ref<AnimatedRef<FlatList<string | number>>>}
            />
          )}
        </View>
      </GestureHandlerRootView>
      <CloseModalComponent onCloseModal={handleModalClose} />
    </Animated.View>
  ) : null;
};

export default PreviewModal;
