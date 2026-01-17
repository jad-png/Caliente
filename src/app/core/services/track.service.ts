import { Injectable, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { Track } from '../models/track.model';

@Injectable({
    providedIn: 'root'
})
export class TrackService {
    readonly tracks = signal<Track[]>([]);
    readonly loading = signal<boolean>(false);
    readonly error = signal<string | null>(null);

    constructor(private storage: StorageService) {
        this.loadTracks();
    }

    async loadTracks() {
        this.loading.set(true);
        try {
            const tracks = await this.storage.tracks.getAllFromIndex('by-date');
            console.log(tracks);
            this.tracks.set(tracks);
        } catch (err) {
            console.error(err);
            this.error.set('Failed to load tracks');
        } finally {
            this.loading.set(false);
        }
    }

    async addTrack(trackData: Omit<Track, 'id' | 'addedAt'>) {
        this.loading.set(true);
        try {
            const newTrack: Track = {
                ...trackData,
                id: crypto.randomUUID(),
                addedAt: new Date()
            };

            await this.storage.tracks.add(newTrack);

            this.tracks.update(list => [...list, newTrack]);
        } catch (err) {
            console.error(err);
            this.error.set('Failed to add track');
            throw err;
        } finally {
            this.loading.set(false);
        }
    }

    async deleteTrack(id: string) {
        try {
            await this.storage.tracks.delete(id);
            this.tracks.update(list => list.filter(t => t.id !== id));
        } catch (err) {
            console.error(err);
            this.error.set('Failed to delete track');
        }
    }

    async updateTrack(updatedTrack: Track) {
        try {
            await this.storage.tracks.update(updatedTrack);
            this.tracks.update(list => list.map(t => t.id === updatedTrack.id ? updatedTrack : t));
        } catch (err) {
            console.error(err);
            this.error.set('Failed to update track');
        }
    }
}
