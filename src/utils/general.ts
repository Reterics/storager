
export const downloadAsFile = (name: string, body: string, fileType = 'text/plain') => {
    if (!name) {
        name = Math.floor(new Date().getTime() / 360000) + ".json";
    }
    try {
        let textToSaveAsBlob = new Blob([body], { type: fileType });
        let textToSaveAsURL = URL.createObjectURL(textToSaveAsBlob);
        let fileNameToSaveAs = name;

        let downloadLink = document.createElement('a');
        downloadLink.download = fileNameToSaveAs;
        downloadLink.innerHTML = 'Download As File';
        downloadLink.href = textToSaveAsURL;
        downloadLink.style.display = 'none';
        document.body.appendChild(downloadLink);

        downloadLink.click();
        downloadLink.outerHTML = '';


    } catch (e) {
        // @ts-ignore
        console.error(e.message);
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
