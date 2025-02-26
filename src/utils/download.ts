import {getFileNameFromStorageUrl} from "@/utils/files.ts";

export const downloadStorageFile = (storageFireUrl: string) => {
    const fileName = getFileNameFromStorageUrl(storageFireUrl) || 'download';

    // Create a temporary anchor element
    const anchor = document.createElement('a');
    anchor.href = storageFireUrl;
    anchor.download = fileName;

    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
};