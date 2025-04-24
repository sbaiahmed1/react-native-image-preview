import type { ImageSourcePropType } from 'react-native';
import { BrokenImage } from '../assets/images';
import { isValidUrl } from './validations';

/**
 * Retrieves the source of an image based on the given index and array of images.
 *
 * @param {string|number} images - The array of images to retrieve the source from.
 * @param {Boolean} error - A flag indicating if an error has occurred.
 * If set to true, a broken image will be returned.
 *
 * @param {number} errorImage
 * @returns {ImageSourcePropType} - The source of the image as an ImageSourcePropType object.
 */
export const getImageSource = (
  images: string | number,
  error: boolean,
  errorImage: number = BrokenImage
): ImageSourcePropType => {
  // Basic checks to prevent errors
  // Return broken image if error or invalid images array
  if (error) {
    // return errorImage;
  }

  return fetchImageAtIndex(images, errorImage);
};

/**
 * Fetches the image source from an array of images at the specified index.
 *
 * The function will attempt to check the type of the image source at the provided index:
 * If the source is string, it will verify if it's a URL using the `isValidUrl` function.
 * If the source is a URL, it will return an object { uri: <image URL> }; otherwise, it will return the `BrokenImage`.
 * If the source is a number, it will return the number directly.
 * If the index is out-of-bounds or the image source is neither a string nor a number, the `BrokenImage` will be returned.
 *
 * @param image - The array of images which is composed of strings or numbers.
 * @param {number} errorImage
 * @returns {ImageSourcePropType} - The image source at the provided index or `BrokenImage`
 * if the index is invalid or the image source is incorrect.
 */
export const fetchImageAtIndex = (
  image: string | number,
  errorImage: number
): ImageSourcePropType => {
  // Check if the index is within bounds
  if (!image) {
    return errorImage;
  }

  // Check the type of the image at the index and return accordingly
  if (typeof image === 'string') {
    return isValidUrl(image) ? { uri: image } : errorImage;
  } else if (typeof image === 'number') {
    return image;
  }

  return errorImage;
};
