import {Meteor} from "meteor/meteor";

export const removeLines = (data, lines = []) => {
    return data
        .split('\n')
        .filter((val, idx) => lines.indexOf(idx) === -1)
        .join('\n');
}

export const getContentFromLineNumber = (data, line = 0) => {
    return data
        .split('\n')[line];
}

export const convertBlobToBase64 = async (blob) => { // blob data
    return await blobToBase64(blob);
}

const blobToBase64 = blob => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

export const readFile = async (inputPath) => {
    return fetch(inputPath).then((response) => {
        return response.blob();
    }).then((file) => {
        convertBlobToBase64(file).then((base64) => {
            Meteor.call('uploadFileToS3', base64, inputPath);
        })
        return file.text()
    });
}

export const increasingInterval = (fn, time) => {
    let timeout;
    const next = (i) => {
        const increaseMinutes = i * 1000;
        timeout = setTimeout(next, time + increaseMinutes, i + 2);
        fn(timeout, i);
    }
    timeout = setTimeout(next, time, 2);
}
