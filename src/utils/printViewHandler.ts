import {completionFormToPrintable, PrintableDataProps, serviceDataToPrintable} from "./print.tsx";
import {DBContextType} from "../interfaces/firebase.ts";
import {ServiceCompleteData, ServiceData, SettingsItems} from "../interfaces/interfaces.ts";

export const getPrintableData = (
    dbContext: DBContextType | null,
    id: string,
    t: (key: string) => string,
    docType?: string,
    printNow?: boolean,
): PrintableDataProps | null => {
    if (!dbContext?.data) return null;

    const { services, completions, settings, archive } = dbContext.data;

    let serviceData: ServiceData | undefined;
    let completionData: ServiceCompleteData | undefined;

    if (docType === "services") {
        serviceData = services.find(item => item.id === id) || archive.find(item => item.id === id)
    } else if (docType === "completions") {
        completionData = completions.find(item => item.id === id) || archive.find(item => item.id === id)
    } else {
        // If we didn't provide type, we search in all collections.
        // CompletionData id differs from serviceData
        serviceData = services.find(item => item.id === id)
        if (!serviceData) {
            completionData = completions.find(item => item.id === id)
        }

    }

    if (serviceData) {
        return serviceDataToPrintable(serviceData, settings || ({} as SettingsItems), t, printNow);
    } else if (completionData) {
        return completionFormToPrintable(completionData, t, printNow);
    }

    return null;
};
