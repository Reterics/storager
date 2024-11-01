import {serviceDataToPrintable} from "../../src/utils/print";
import {serviceDataList} from "./serviceData";
import {defaultSettings} from "./shopData";


export const mockPDFData =
    serviceDataToPrintable(serviceDataList[0], defaultSettings, (e)=>e, false);
