export type MusicGenre = 'Pop' | 'Rock' | 'Rap' | 'Hip-Hop' | 'Jazz' | 'Classical' | 'Electronic' | 'R&B' | 'Country' | 'Other';

export interface Track {
    id: string; // UUID or timestamp based
    title: string;
    artist: string;
    description?: string;
    addedAt: Date;
    duration: number; // in seconds
    genre: MusicGenre;
    file?: File | Blob; // The actual audio file (stored in IndexedDB)
    mimeType: string;
    size: number;
    coverImage?: string; // Base64 string of the cover image
}
