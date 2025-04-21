import {completionFormToPrintable, serviceDataToPrintable} from "../../src/utils/print";
import {serviceCompletionDataList, serviceDataList} from "./serviceData";
import {defaultSettings} from "./shopData";
import {SettingsItems} from "../../src/interfaces/interfaces.ts";
import {TFunction} from 'i18next';


export const mockPDFData =
    serviceDataToPrintable(serviceDataList[0], defaultSettings, ((e: string)=>e) as TFunction, false);

export const mockEmptyPDFData = serviceDataToPrintable({id: ''}, {} as SettingsItems,
  ((e: string)=>e) as TFunction, false);

export const mockPDFCompletionData =
    completionFormToPrintable(serviceCompletionDataList[0], ((e: string)=>e) as TFunction, false);

export const mockEmptyPDFCompletionData =
    completionFormToPrintable({id: ''}, ((e: string)=>e) as TFunction, false);
