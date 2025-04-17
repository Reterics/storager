import {getDownloadURL, getStorage, ref} from 'firebase/storage';
import app from './config.ts';
import ImageDBModel from './ImageDBModel.ts';

/**
 * @deprecated This method will be no longer supported from version 1.2.0
 */
export const storage = getStorage(app);

/**
 * @deprecated This method will be no longer supported from version 1.2.0
 * @param path
 */
export const getFileURL = (path: string): Promise<string> => {
  const storageRef = ref(storage, path);
  return getDownloadURL(storageRef);
};

export const imageModel = new ImageDBModel();
