import { inject, Injectable, signal, Signal } from "@angular/core";
import { StorageService } from "./storage.service";
import { Playlist } from "../models/playlist.model";
import { ToastService } from "./toast.service";

@Injectable({
    providedIn: 'root'
})
export class PlaylistService {
    readonly playlists = signal<Playlist[]>([]);
    readonly loading = signal<boolean>(false);
    readonly error = signal<String | null>(null);

    private toastService = inject(ToastService);


    constructor(private storage: StorageService) {
        this.loadPlaylists();
    }

    async loadPlaylists() {
        this.loading.set(true);
        this.error.set(null);
        try {
            const playlists = await this.storage.playlists.getAllFromIndex('by-date');

            playlists.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            this.playlists.set(playlists);
        } catch (err) {
            console.error(err);
            this.error.set('Failed to load playlists');
        } finally {
            this.loading.set(false);
        }
    }

    async addPlaylist(data: { name: string, description?: string, coverImage?: string, artist: string }) {
        this.loading.set(true);
        this.error.set(null);
        try {
            const newPlaylist: Playlist = {
                id: crypto.randomUUID(),
                name: data.name,
                artist: data.artist,
                description: data.description,
                trackIds: [],
                coverImage: data.coverImage,
                createdAt: new Date()
            }

            await this.storage.playlists.add(newPlaylist);
            this.playlists.update((prev) => [...prev, newPlaylist]);
        } catch (err) {
            console.error(err);
            this.error.set('Failed to add playlist');
        } finally {
            this.loading.set(false);
        }
    }

    async updatePlaylist(updatedPlaylist: Playlist) {
        try {
            await this.storage.playlists.update(updatedPlaylist);
            this.playlists.update((prev) => prev.map(p => p.id === updatedPlaylist.id ? updatedPlaylist : p));
        } catch (err) {
            console.error(err);
            this.error.set('Failed to update playlist');
        }
    }

    async deletePlaylist(id: string) {
        try {
            await this.storage.playlists.delete(id);
            this.playlists.update((prev) => prev.filter(p => p.id !== id));
        } catch (err) {
            console.error(err);
            this.error.set('Failed to delete playlist');
        }
    }

    async addTrackToPlaylist(playlistId: string, trackId: string) {
        const playlist = this.playlists().find(p => p.id === playlistId);
        if (!playlist) {
            this.error.set('Playlist not found');
            return;
        }

        if (playlist.trackIds?.includes(trackId)) {
            this.toastService.show('Track already in playlist');
            return;
        }

        playlist.trackIds?.push(trackId);
        this.updatePlaylist(playlist);
    }
}