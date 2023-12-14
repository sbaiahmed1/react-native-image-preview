import { NativeModules, Platform } from 'react-native';
import PreviewModal from './PreviewModal';

const LINKING_ERROR =
  `The package 'react-native-image-preview' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const ImagePreview = NativeModules.ImagePreview
  ? NativeModules.ImagePreview
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

console.log(ImagePreview);
function multiply(a: number, b: number): Promise<number> {
  return ImagePreview.multiply(a, b);
}

export { multiply, PreviewModal };
