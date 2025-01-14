// Function to hash a string and generate a numeric value
function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

// Function to convert a hash to a color
function hashToColor(hash: number): string {
    const r = (hash & 0xFF0000) >> 16;
    const g = (hash & 0x00FF00) >> 8;
    const b = hash & 0x0000FF;
    return `rgb(${r}, ${g}, ${b})`;
}

// Function to calculate contrast color (white or black) for text
function getContrastColor(bgColor: string): string {
    const rgb = bgColor.match(/\d+/g).map(Number);
    // Calculate relative luminance
    const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
    return luminance > 0.5 ? 'black' : 'white';
}

// Main function to generate avatar colors
export function generateAvatarColors(fullName: string): { bgColor: string, textColor: string } {
    const hash = hashString(fullName);
    const bgColor = hashToColor(hash);
    const textColor = getContrastColor(bgColor);
    return {bgColor, textColor};
}

export function generateDisplayName(params: { firstName: string, lastName?: string }): string {
    if (!params) {
        return '';
    }

    return params.lastName ? `${params.firstName} ${params.lastName}` : params.firstName;
}

// Function to generate initials from first and last name
export function generateInitials(fullName: string): string {
    const names = fullName.trim().split(/\s+/);
    return names.length > 1
        ? names[0][0].toUpperCase() + names[1][0].toUpperCase()
        : names[0][0].toUpperCase();
}
