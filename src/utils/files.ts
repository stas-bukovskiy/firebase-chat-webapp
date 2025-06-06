/**
 * Extracts the file extension from a given file name or URL.
 *
 * - Removes URL query parameters (anything after '?') before extracting the extension.
 *
 * @param fileNameOrUrl - The file name or URL (e.g., "example.txt", "https://example.com/image.jpg?alt=media").
 * @returns The file extension without the dot (e.g., "txt") or an empty string if no extension is found.
 */
export function getFileExtension(fileNameOrUrl: string): string {
    // Remove URL parameters by splitting at the '?' symbol
    const [cleanFileName] = fileNameOrUrl.split("?");

    // Find the last dot in the cleaned file name
    const lastDotIndex = cleanFileName.lastIndexOf(".");
    if (lastDotIndex !== -1 && lastDotIndex < cleanFileName.length - 1) {
        return cleanFileName.substring(lastDotIndex + 1);
    }
    return "";
}

export function getFilePathFromStorageUrl(url: string): string {
    const urlPath = url.split("?")[0];
    return decodeURIComponent(urlPath.split("/o/")[1]);
}

export function getFileNameFromStorageUrl(url: string): string {
    const filePath = getFilePathFromStorageUrl(url);
    return filePath.split("/").pop() || "";
}

export function generateFileKey(fileName: string): string {
    return Math.random().toString(36).substring(2, 12);
}