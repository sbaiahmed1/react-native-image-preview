import {
  BaseAnimationBuilder,
  type EntryExitAnimationFunction,
  FadeIn,
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  FadeInUp,
  FadeOut,
  FadeOutDown,
  FadeOutLeft,
  FadeOutRight,
  FadeOutUp,
  SlideInDown,
  SlideInLeft,
  SlideInRight,
  SlideInUp,
  SlideOutDown,
  SlideOutLeft,
  SlideOutRight,
  SlideOutUp,
} from 'react-native-reanimated';

type EntryOrExitLayoutType =
  | BaseAnimationBuilder
  | typeof BaseAnimationBuilder
  | EntryExitAnimationFunction;

/**
 * Represents a fade-in animation class.
 */
type fadeIn =
  | 'fadeIn'
  | 'fadeIn-right'
  | 'fadeIn-left'
  | 'fadeIn-top'
  | 'fadeIn-down';

/**
 * Represents a fade out animation class.
 */
type fadeOut =
  | 'fadeOut'
  | 'fadeOut-right'
  | 'fadeOut-left'
  | 'fadeOut-top'
  | 'fadeOut-down';

type slideIn =
  | 'slideIn-right'
  | 'slideIn-left'
  | 'slideIn-top'
  | 'slideIn-down';

type slideOut =
  | 'slideOut-right'
  | 'slideOut-left'
  | 'slideOut-top'
  | 'slideOut-down';

/**
 * Represents a class for performing animations.
 */
export type animations = fadeOut | fadeIn | slideOut | slideIn;

/**
 * Returns the animation function based on the provided modal animation type.
 *
 * @param {animations} modalAnimationIn - The modal animation type.
 * @returns {EntryOrExitLayoutType} - The animation for the given modal animation type.
 */
export const getModalAnimationIn = (
  modalAnimationIn: animations
): EntryOrExitLayoutType => {
  switch (modalAnimationIn) {
    case 'slideIn-down':
      return SlideInDown;
    case 'slideIn-top':
      return SlideInUp;
    case 'slideIn-left':
      return SlideInLeft;
    case 'slideIn-right':
      return SlideInRight;
    case 'fadeIn':
      return FadeIn;
    case 'fadeIn-down':
      return FadeInDown;
    case 'fadeIn-left':
      return FadeInLeft;
    case 'fadeIn-right':
      return FadeInRight;
    case 'fadeIn-top':
      return FadeInUp;
    default:
      return FadeIn;
  }
};

/**
 * Returns the animation function based on the provided modal animation type.
 *
 * @param {animations} modalAnimationOut - The modal animation type.
 * @returns {EntryOrExitLayoutType} - The animation for the given modal animation type.
 */
export const getModalAnimationOut = (
  modalAnimationOut: animations
): EntryOrExitLayoutType => {
  switch (modalAnimationOut) {
    case 'slideOut-down':
      return SlideOutDown;
    case 'slideOut-top':
      return SlideOutUp;
    case 'slideOut-right':
      return SlideOutRight;
    case 'slideOut-left':
      return SlideOutLeft;
    case 'fadeOut':
      return FadeOut;
    case 'fadeOut-down':
      return FadeOutDown;
    case 'fadeOut-left':
      return FadeOutLeft;
    case 'fadeOut-right':
      return FadeOutRight;
    case 'fadeOut-top':
      return FadeOutUp;
    default:
      return FadeOut;
  }
};
