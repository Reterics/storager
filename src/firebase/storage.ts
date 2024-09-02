import { getDownloadURL, getStorage, ref, uploadBytes, UploadResult, uploadString, deleteObject } from "firebase/storage";
import app, {firebaseCollections, getById} from "./BaseConfig.ts";
import {Template} from "../interfaces/interfaces.ts";

export const storage = getStorage(app);

export const uploadFile = (path: string, file: File|Blob|Uint8Array): Promise<UploadResult> => {
    const storageRef  = ref(storage, path);

    return uploadBytes(storageRef, file);
}

export const uploadFileDataURL = (path: string, message: string): Promise<UploadResult> => {
    const storageRef  = ref(storage, path);

    return uploadString(storageRef, message, 'data_url');
}

export const uploadFileBase64 = (path: string, message: string): Promise<UploadResult> => {
    const storageRef  = ref(storage, path);

    return uploadString(storageRef, message, 'base64');
}

export const uploadFileBase64URL = (path: string, message: string): Promise<UploadResult> => {
    const storageRef  = ref(storage, path);

    return uploadString(storageRef, message, 'base64url');
}

export const uploadFileString = (path: string, message: string): Promise<UploadResult> => {
    const storageRef  = ref(storage, path);

    return uploadString(storageRef, message);
}

export const getFileURL = (path: string): Promise<string> => {
    const storageRef  = ref(storage, path);
    return getDownloadURL(storageRef);
}

export const deleteFile = (path: string): Promise<void> => {
    const deleteRef = ref(storage, path);
    return deleteObject(deleteRef);
}

export const getFileFromStorage = async (id: string) => {
    const template = await getById(id, firebaseCollections.templates) as Template;
    if (template) {

        const url = template.path;
        if (url) {
            const response = await fetch(await getFileURL(url));
            if (response && response.ok) {
                const content = await response.text();
                if (content) {
                    template.content = content;
                }
            }
        }
        return { ...template } as Template
    }
    return null;
}
