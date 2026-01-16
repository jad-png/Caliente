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

    
}