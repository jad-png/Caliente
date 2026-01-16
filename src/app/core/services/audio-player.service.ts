import { Injectable, signal, computed, effect } from '@angular/core';
import { Track } from '../models/track.model';

export type PlayerState = 'playing' | 'paused' | 'stopped' | 'buffering';

@Injectable({
    providedIn: 'root'
})
export class AudioPlayerService {
    private audio = new Audio();

    // Signals for state
    readonly state = signal<PlayerState>('stopped');
    readonly currentTrack = signal<Track | null>(null);
    readonly currentTime = signal<number>(0);
    readonly duration = signal<number>(0);
    readonly volume = signal<number>(1);
    readonly muted = signal<boolean>(false);

    constructor() {
        this.initAudioEvents();
    }

    private initAudioEvents() {
        this.audio.addEventListener('play', () => this.state.set('playing'));
        this.audio.addEventListener('pause', () => this.state.set('paused'));
        this.audio.addEventListener('waiting', () => this.state.set('buffering'));
        this.audio.addEventListener('playing', () => this.state.set('playing'));
        this.audio.addEventListener('ended', () => {
            this.state.set('stopped');
            this.currentTime.set(0);
        });
        this.audio.addEventListener('timeupdate', () => {
            this.currentTime.set(this.audio.currentTime);
        });
        this.audio.addEventListener('loadedmetadata', () => {
            this.duration.set(this.audio.duration);
        });
        this.audio.addEventListener('error', (e) => {
            console.error('Audio error', e);
            this.state.set('stopped');
        });
    }

    playTrack(track: Track) {
        if (!track.file) {
            console.error('No file associated with track');
            return;
        }

        // Clean up previous URL if needed (though browser manages this somewhat, explicit revocation is good practice)
        if (this.audio.src) {
            URL.revokeObjectURL(this.audio.src);
        }

        const objectUrl = URL.createObjectURL(track.file);
        this.audio.src = objectUrl;
        this.audio.load(); // specific for some browsers

        this.currentTrack.set(track);
        this.audio.play().catch(error => console.error('Play error:', error));
    }

    togglePlayPause() {
        if (this.state() === 'playing') {
            this.audio.pause();
        } else if (this.state() === 'paused' || (this.state() === 'stopped' && this.currentTrack())) {
            this.audio.play().catch(console.error);
        }
    }

    pause() {
        this.audio.pause();
    }

    stop() {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.state.set('stopped');
    }

    seek(seconds: number) {
        this.audio.currentTime = seconds;
    }

    setVolume(vol: number) {
        const clamped = Math.max(0, Math.min(1, vol));
        this.audio.volume = clamped;
        this.volume.set(clamped);
        if (clamped > 0 && this.muted()) {
            this.muted.set(false);
            this.audio.muted = false;
        }
    }

    toggleMute() {
        this.audio.muted = !this.audio.muted;
        this.muted.set(this.audio.muted);
    }
}
