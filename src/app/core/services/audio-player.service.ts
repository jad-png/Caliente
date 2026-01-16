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
    readonly queue = signal<Track[]>([]);

    // Computed signals for navigation status
    readonly currentIndex = computed(() => {
        const track = this.currentTrack();
        if (!track) return -1;
        return this.queue().findIndex(t => t.id === track.id);
    });

    readonly hasNext = computed(() => {
        const index = this.currentIndex();
        return index !== -1 && index < this.queue().length - 1;
    });

    readonly hasPrev = computed(() => {
        const index = this.currentIndex();
        return index > 0;
    });

    constructor() {
        this.initAudioEvents();
    }

    private initAudioEvents() {
        this.audio.addEventListener('play', () => this.state.set('playing'));
        this.audio.addEventListener('pause', () => this.state.set('paused'));
        this.audio.addEventListener('waiting', () => this.state.set('buffering'));
        this.audio.addEventListener('playing', () => this.state.set('playing'));
        this.audio.addEventListener('ended', () => {
            if (this.hasNext()) {
                this.next();
            } else {
                this.state.set('stopped');
                this.currentTime.set(0);
            }
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

    playTrack(track: Track, context?: Track[]) {
        if (!track.file) {
            console.error('No file associated with track');
            return;
        }

        if (context) {
            this.queue.set(context);
        } else if (this.queue().length === 0 || !this.queue().some(t => t.id === track.id)) {
            this.queue.set([track]);
        }

        // Clean up previous URL if needed
        if (this.audio.src) {
            URL.revokeObjectURL(this.audio.src);
        }

        const objectUrl = URL.createObjectURL(track.file);
        this.audio.src = objectUrl;
        this.audio.load();

        this.currentTrack.set(track);
        this.audio.play().catch(error => console.error('Play error:', error));
    }

    next() {
        const index = this.currentIndex();
        if (this.hasNext()) {
            this.playTrack(this.queue()[index + 1]);
        }
    }

    previous() {
        const index = this.currentIndex();
        if (this.hasPrev()) {
            this.playTrack(this.queue()[index - 1]);
        }
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
