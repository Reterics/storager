import {completionFormToPrintable, serviceDataToPrintable} from "../../src/utils/print";
import {serviceCompletionDataList, serviceDataList} from "./serviceData";
import {defaultSettings} from "./shopData";
import {SettingsItems} from "../../src/interfaces/interfaces.ts";


export const mockPDFData =
    serviceDataToPrintable(serviceDataList[0], defaultSettings, (e)=>e, false);

export const mockEmptyPDFData = serviceDataToPrintable({id: ''}, {} as SettingsItems,
    (e)=>e, false);

export const mockPDFCompletionData =
    completionFormToPrintable(serviceCompletionDataList[0], (e)=>e, false);

export const mockEmptyPDFCompletionData =
    completionFormToPrintable({id: ''}, (e)=>e, false);
