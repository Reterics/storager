import {ContextDataCollectionType, ContextDataValueType} from "../interfaces/firebase.ts";

export const applyDefaults = (defaults: object, array: ContextDataCollectionType) => {

    const keys = Object.keys(defaults);
    const updater = (entry: ContextDataValueType) => {
        keys.forEach((key) => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            if (entry && entry[key] === undefined) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                entry[key] = defaults[key];
            }
        })
        return entry;
    };
    return (Array.isArray(array) ? array.map(updater) : updater(array));
};

export const downloadAsFile = (name: string, body: string, fileType = 'text/plain') => {
    if (!name) {
        name = Math.floor(new Date().getTime() / 360000) + ".json";
    }
    try {
        const textToSaveAsBlob = new Blob([body], { type: fileType });
        const textToSaveAsURL = URL.createObjectURL(textToSaveAsBlob);
        const fileNameToSaveAs = name;

        const downloadLink = document.createElement('a');
        downloadLink.download = fileNameToSaveAs;
        downloadLink.innerHTML = 'Download As File';
        downloadLink.href = textToSaveAsURL;
        downloadLink.style.display = 'none';
        document.body.appendChild(downloadLink);

        downloadLink.click();
        downloadLink.outerHTML = '';


    } catch (e: unknown) {
        if (e instanceof Error) {
            console.error(e.message);
        }
    }
};


export const fileToDataURL = (file: File) => {
    return new Promise((resolve) => {
        if (file) {
            const reader = new FileReader();

            reader.onload = e => {
                resolve(e.target?.result);
            };

            // Convert the file to a data URL
            reader.readAsDataURL(file);
        }
    })
};
