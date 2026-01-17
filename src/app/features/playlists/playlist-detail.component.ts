import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PlaylistService } from '../../core/services/playlist.service';
import { TrackService } from '../../core/services/track.service';
import { AudioPlayerService } from '../../core/services/audio-player.service';
import { Playlist } from '../../core/models/playlist.model';
import { Track } from '../../core/models/track.model';
import { DurationPipe } from '../../shared/pipes/duration.pipe';

@Component({
    selector: 'app-playlist-detail',
    standalone: true,
    imports: [CommonModule, RouterLink, DurationPipe],
    templateUrl: './playlist-detail.component.html'
})
export class PlaylistDetailComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private playlistService = inject(PlaylistService);
    private trackService = inject(TrackService);
    playerService = inject(AudioPlayerService);

    playlist = signal<Playlist | null>(null);

    playlistTracks = computed(() => {
        const pl = this.playlist();
        if (!pl || !pl.trackIds) return [];

        return this.trackService.tracks().filter(t => pl.trackIds?.includes(t.id));
    });

    ngOnInit() {
        this.route.params.subscribe(params => {
            const id = params['id'];
            if (id) {
                const found = this.playlistService.playlists().find(p => p.id === id);
                if (found) {
                    this.playlist.set(found);
                }
            }
        });
    }

    playTrack(track: Track) {
        this.playerService.playTrack(track, this.playlistTracks());
    }

    playPlaylist() {
        const tracks = this.playlistTracks();
        if (tracks.length > 0) {
            this.playTrack(tracks[0]);
        }
    }
}
