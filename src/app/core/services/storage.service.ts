import { Injectable } from '@angular/core';
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Track } from '../models/track.model';

interface MusicStreamDB extends DBSchema {
    tracks: {
        key: string;
        value: Track;
        indexes: { 'by-date': Date };
    };
}

@Injectable({
    providedIn: 'root'
})
export class StorageService {
    private dbPromise: Promise<IDBPDatabase<MusicStreamDB>>;

    constructor() {
        this.dbPromise = openDB<MusicStreamDB>('MusicStreamDB', 1, {
            upgrade(db) {
                const store = db.createObjectStore('tracks', { keyPath: 'id' });
                store.createIndex('by-date', 'addedAt');
            },
        });
    }

    async addTrack(track: Track): Promise<string> {
        const db = await this.dbPromise;
        return db.add('tracks', track);
    }

    async getAllTracks(): Promise<Track[]> {
        const db = await this.dbPromise;
        return db.getAllFromIndex('tracks', 'by-date');
    }

    async getTrack(id: string): Promise<Track | undefined> {
        const db = await this.dbPromise;
        return db.get('tracks', id);
    }

    async updateTrack(track: Track): Promise<string> {
        const db = await this.dbPromise;
        return db.put('tracks', track);
    }

    async deleteTrack(id: string): Promise<void> {
        const db = await this.dbPromise;
        return db.delete('tracks', id);
    }
}
