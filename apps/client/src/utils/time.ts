/**
 * Formats a time duration given in seconds into a human-readable string.
 * Returns string in "MM:SS" or "HH:MM:SS" format.
 * @param seconds
 * @returns String
 */
export function secondsToTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainder = String(Math.floor(seconds % 60)).padStart(2, '0');
    if (minutes < 60) return `${minutes}:${remainder}`;
    return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}:${remainder}`;
}