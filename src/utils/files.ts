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