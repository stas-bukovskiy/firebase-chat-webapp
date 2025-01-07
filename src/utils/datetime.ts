// 1. Convert Date to UTC timestamp
export function dateToUTCTimestamp(date: Date): number {
    return Math.floor(date.getTime() / 1000); // Converts to seconds
}

// 2. Convert now Date to UTC timestamp
export function nowToUTCTimestamp(): number {
    return Math.floor(Date.now() / 1000); // Converts to seconds
}

// 3. Convert UTC timestamp to localized Date
export function utcTimestampToLocalDate(utcTimestamp: number): Date {
    return new Date(utcTimestamp * 1000); // Converts seconds to milliseconds
}

export function formatUtcTimestamp(timestamp: number): string {
    // Convert the UTC timestamp to a local Date object
    const date = new Date(timestamp * 1000);
    const now = new Date();

    // Get the user's locale (default to system locale)
    const userLocale = navigator.language || 'en-US';

    // Date format options
    const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: false };
    const dayTimeOptions: Intl.DateTimeFormatOptions = { weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false };
    const dateMonthTimeOptions: Intl.DateTimeFormatOptions = { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false };
    const fullDateTimeOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false };

    // Check if the date is today
    if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString(userLocale, timeOptions);
    }

    // Check if the date is this week
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    if (date >= startOfWeek) {
        return date.toLocaleString(userLocale, dayTimeOptions);
    }

    // Check if the date is this year but not this month
    if (date.getFullYear() === now.getFullYear() && date.getMonth() !== now.getMonth()) {
        return date.toLocaleString(userLocale, dateMonthTimeOptions);
    }

    // Check if the date is this year
    if (date.getFullYear() === now.getFullYear()) {
        return date.toLocaleString(userLocale, dateMonthTimeOptions);
    }

    // For all other dates
    return date.toLocaleString(userLocale, fullDateTimeOptions);
}
