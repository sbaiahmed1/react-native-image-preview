import type { ImageSourcePropType } from 'react-native';
import { BrokenImage } from '../assets/images';
import { isValidUrl } from './validations';

export const getImageSource = (
  imageIndex: number,
  images: string[] | number[],
  error: boolean
): ImageSourcePropType => {
  // Basic checks to prevent errors
  // Return broken image if error or invalid images array
  if (error || !Array.isArray(images)) {
    return BrokenImage;
  }

  return fetchImageAtIndex(imageIndex, images);
};

const fetchImageAtIndex = (
  index: number,
  images: string[] | number[]
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
