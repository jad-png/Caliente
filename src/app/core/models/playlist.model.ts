export interface Playlist {
    id: string; // UUID or timestamp based
    name: string;
    artist: string;
    trackIds?: string[];
    createdAt: Date;
    coverImage?: string; // Base64 string of the cover image
}
