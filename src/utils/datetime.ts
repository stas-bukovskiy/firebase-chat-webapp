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