import { Injectable, signal, Signal } from "@angular/core";
import { BaseStorage, StorageService } from "./storage.service";
import { Playlist } from "../models/playlist.model";

@Injectable({
    providedIn: 'root'
})
export class PlaylistService {
    readonly playlists = signal<Playlist[]>([]);
    readonly loading = signal<boolean>(false);
    readonly error = signal<String | null>(null);

    constructor(private storage: StorageService) {
        this.loadPlaylists();
    }

    async loadPlaylists() {
        this.loading.set(true);
        this.error.set(null);
        try {
            const playlists = await this.storage.playlists.getAllFromIndex('by-date');
            this.playlists.set(playlists);
        } catch (err) {
            console.error(err);
            this.error.set('Failed to load playlists');
        } finally {
            this.loading.set(false);
        }
    }

    async addPlaylist (playlistData: Omit<Playlist, 'id' | 'addedAt'>) {
        this.loading.set(true);
        this.error.set(null);
        try {
            const playlist: Playlist = {
                ...playlistData,
                id: crypto.randomUUID(),
                createdAt: new Date()
            }

            await this.storage.playlists.add(playlist);
            this.playlists.update((prev) => [...prev, playlist]);
        } catch (err) {
            console.error(err);
            this.error.set('Failed to add playlist');
        } finally {
            this.loading.set(false);
        }
    }

    async updatePlaylist (updatedPlaylist: Playlist) {
        try {
            await this.storage.playlists.update(updatedPlaylist);
            this.playlists.update((prev) => prev.map(p => p.id === updatedPlaylist.id ? updatedPlaylist : p));
        } catch (err) {
            console.error(err);
            this.error.set('Failed to update playlist');
        }
    }

    async deletePlaylist (id: string) {
        try {
            await this.storage.playlists.delete(id);
            this.playlists.update((prev) => prev.filter(p => p.id !== id));
        } catch (err) {
            console.error(err);
            this.error.set('Failed to delete playlist');
        }
    }
}