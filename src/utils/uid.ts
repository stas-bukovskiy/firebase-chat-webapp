// The characters allowed in Firebase document IDs.
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const autoIdLength = 20;

/**
 * Generates a 20-character random ID similar to Firebase Firestore document IDs.
 *
 * @returns {string} A random alphanumeric string of length 20.
 */
export function generateFirestoreId(): string {
    let autoId = '';

    // Check if the crypto API is available.
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
        // Create an array with a length of autoIdLength.
        const randomBytes = new Uint8Array(autoIdLength);
        crypto.getRandomValues(randomBytes);
        // For each byte, pick a character from the allowed set.
        for (let i = 0; i < autoIdLength; i++) {
            autoId += chars.charAt(randomBytes[i] % chars.length);
        }
    } else {
        // Fallback: use Math.random (not as secure but works in all environments)
        for (let i = 0; i < autoIdLength; i++) {
            autoId += chars.charAt(Math.floor(Math.random() * chars.length));
        }
    }
    return autoId;
}

