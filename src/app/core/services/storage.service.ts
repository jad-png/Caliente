import { Injectable } from '@angular/core';
import { openDB, DBSchema, IDBPDatabase, StoreNames, StoreValue, IndexNames, StoreKey } from 'idb';
import { Track } from '../models/track.model';
import { Playlist } from '../models/playlist.model';

interface MusicStreamDB extends DBSchema {
    tracks: {
        key: string;
        value: Track;
        indexes: { 'by-date': Date };
    };
}

interface PlaylistDB extends DBSchema {
    playlists: {
        key: string;
        value: Playlist;
        indexes: { 'by-date': Date };
    }
}

export interface BaseStorage<T> {
    add(item: T): Promise<string>;
    getAll(): Promise<T[]>;
    getAllFromIndex(indexName: string): Promise<T[]>;
    get(id: string): Promise<T | undefined>;
    update(item: T): Promise<string>;
    delete(id: string): Promise<void>;
}

/**
 * Concrete implementation of BaseStorage using IndexedDB.
 */
class IndexedDBProvider<TSchema extends DBSchema, TStoreName extends StoreNames<TSchema>>
    implements BaseStorage<StoreValue<TSchema, TStoreName>> {

    constructor(
        private dbPromise: Promise<IDBPDatabase<TSchema>>,
        private storeName: TStoreName
    ) { }

    async add(item: StoreValue<TSchema, TStoreName>): Promise<string> {
        const db = await this.dbPromise;
        return db.add(this.storeName, item) as unknown as Promise<string>;
    }

    async getAll(): Promise<StoreValue<TSchema, TStoreName>[]> {
        const db = await this.dbPromise;
        return db.getAll(this.storeName);
    }

    async getAllFromIndex(indexName: IndexNames<TSchema, TStoreName>): Promise<StoreValue<TSchema, TStoreName>[]> {
        const db = await this.dbPromise;
        return db.getAllFromIndex(this.storeName, indexName);
    }

    async get(id: string): Promise<StoreValue<TSchema, TStoreName> | undefined> {
        const db = await this.dbPromise;
        return db.get(this.storeName, id as any);
    }

    async update(item: StoreValue<TSchema, TStoreName>): Promise<string> {
        const db = await this.dbPromise;
        return db.put(this.storeName, item) as unknown as Promise<string>;
    }

    async delete(id: string): Promise<void> {
        const db = await this.dbPromise;
        return db.delete(this.storeName, id as any);
    }
}

@Injectable({
    providedIn: 'root'
})
export class StorageService {
    private musicDbPromise: Promise<IDBPDatabase<MusicStreamDB>>;
    private playlistDbPromise: Promise<IDBPDatabase<PlaylistDB>>;

    /**
     * Public accessors for specialized storage.
     */
    public readonly tracks: BaseStorage<Track>;
    public readonly playlists: BaseStorage<Playlist>;

    constructor() {
        this.musicDbPromise = openDB<MusicStreamDB>('MusicStreamDB', 2, {
            upgrade(db) {
                const store = db.createObjectStore('tracks', { keyPath: 'id' });
                store.createIndex('by-date', 'addedAt');
            },
        });

        this.playlistDbPromise = openDB<PlaylistDB>('PlaylistDB', 2, {
            upgrade(db) {
                const store = db.createObjectStore('playlists', { keyPath: 'id' });
                store.createIndex('by-date', 'createdAt');
            },
        });

        this.tracks = new IndexedDBProvider(this.musicDbPromise, 'tracks');
        this.playlists = new IndexedDBProvider(this.playlistDbPromise, 'playlists');
    }
}
