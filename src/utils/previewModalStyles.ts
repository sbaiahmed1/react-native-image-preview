import { Dimensions, StyleSheet } from 'react-native';

/**
 * Represents a collection of style objects.
 */
export const styles = StyleSheet.create({
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
  left10: {
    left: 10,
  },
  right10: {
    right: 10,
  },
  closeButtonContainerStyles: {
    position: 'absolute',
    top: 100,
    right: 20,
  },
  closeButtonStyles: { height: 15, width: 15, resizeMode: 'contain' },
  fullFlex: { flex: 1 },
  blinkingText: {
    color: 'white',
    paddingVertical: 10,
    textAlign: 'center',
  },
  imageLoaderStyles: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flexRowCenter: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  chevronLeft: {
    height: 20,
    width: 20,
    resizeMode: 'contain',
    transform: [{ rotate: '180deg' }],
  },

  chevronRight: {
    height: 20,
    width: 20,
    resizeMode: 'contain',
  },
});
