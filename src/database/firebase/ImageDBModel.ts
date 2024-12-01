import DBModel from "../DBModel.ts";
import {CommonCollectionData, FirebaseImageData, ImageStore} from "../../interfaces/firebase.ts";
import {loadFromIndexedDB, saveToIndexedDB} from "../../utils/indexedDB.ts";
import {getFileURL} from "./storage.ts";
import {StoreItem, StorePart} from "../../interfaces/interfaces.ts";

/**
 * @name ImageDBModel
 * @deprecated This class will be no longer supported from version 1.2.0
 * @class
 * @classDesc
 * This object will store all the Storage references in IndexedDB without expiration, because the storage tokens
 * are not expiring. In this way we save ourselves a significant amount of API call to Firebase Storage
 **/
export default class ImageDBModel extends DBModel {
    private _imageStore: ImageStore;
    constructor() {
        super();
        this._imageStore = {};
    }

    async loadPersisted() {
        let cache;
        try {
            cache = {
                'images' : await loadFromIndexedDB('images') as FirebaseImageData[],
            };

        } catch (e) {
            console.error(e);
        }

        this._imageStore = (cache?.images || []).reduce((sum, image) => {
            sum[image.id] = image;
            return sum;
        }, {} as ImageStore);
    }

    async savePersisted() {
        try {
            await saveToIndexedDB('images', Object.values(this._imageStore) as unknown as CommonCollectionData[] );
        } catch (e) {
            console.error(e);
        }
    }

    sync(ms = 2000) {
        if (this._timeout) {
            clearTimeout(this._timeout);
        }
        this._timeout = setTimeout(()=> this.savePersisted(), ms);
    }

    async getFileURL(pathAsId: string): Promise<string> {
        if (!this._imageStore[pathAsId]) {
            const data = await getFileURL(pathAsId);

            this._imageStore[pathAsId] = {
                id: pathAsId,
                url: data
            };
            this.sync();
        }

        return this._imageStore[pathAsId].base64 ?? this._imageStore[pathAsId].url;
    }

    async integrityCheck(data: StoreItem[] | StorePart[] | null) {
        if (!data) {
            return;
        }

        for (const element of data) {
            if (element.image?.startsWith('screenshots/') && !this._imageStore[element.image]) {
                await this.getFileURL(element.image);
            }
        }
    }
}
