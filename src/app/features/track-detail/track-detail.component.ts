import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TrackService } from '../../core/services/track.service';
import { AudioPlayerService } from '../../core/services/audio-player.service';
import { Track, MusicGenre } from '../../core/models/track.model';
import { DurationPipe } from '../../shared/pipes/duration.pipe';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-track-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DurationPipe, RouterModule],
  template: `
    <div class="container mx-auto px-4 py-8 pb-32 max-w-4xl">
      <!-- Back Button -->
      <a routerLink="/" class="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition mb-8 group">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transform group-hover:-translate-x-1 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Library
      </a>

      @if (loading()) {
        <div class="flex justify-center py-24">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      } @else {
        @if (track(); as t) {
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <!-- Cover Art Placeholder -->
            <div class="aspect-square bg-gradient-to-br from-electric-violet to-hot-red rounded-3xl shadow-2xl flex items-center justify-center p-12 text-white relative overflow-hidden group">
              <div class="absolute inset-0 bg-black/10 group-hover:bg-transparent transition"></div>
              <svg xmlns="http://www.w3.org/2000/svg" class="w-full h-full opacity-30" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
              <div class="absolute bottom-6 left-6 right-6">
                <h3 class="text-xl font-bold truncate">{{ t.title }}</h3>
                <p class="text-white/80 truncate text-sm">{{ t.artist }}</p>
              </div>
            </div>

            <!-- Actions & Info -->
            <div class="md:col-span-2 space-y-8">
              <div class="flex justify-between items-start">
                <div>
                  <h1 class="text-4xl font-black text-gray-900 leading-tight">{{ t.title }}</h1>
                  <p class="text-xl text-gray-500 mt-1">{{ t.artist }}</p>
                </div>
                <button 
                  (click)="playTrack(t)"
                  class="w-16 h-16 flex items-center justify-center rounded-full bg-gray-900 text-white shadow-xl hover:scale-110 transition active:scale-95"
                >
                  @if (playerService.currentTrack()?.id === t.id && playerService.state() === 'playing') {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                  } @else {
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  }
                </button>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Duration</p>
                  <p class="text-lg font-mono text-gray-900">{{ t.duration | duration }}</p>
                </div>
                <div class="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Genre</p>
                  <p class="text-lg text-gray-900">{{ t.genre }}</p>
                </div>
                <div class="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Added On</p>
                  <p class="text-lg text-gray-900">{{ t.addedAt | date:'mediumDate' }}</p>
                </div>
                <div class="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">File Size</p>
                  <p class="text-lg text-gray-900">{{ (t.size / 1024 / 1024) | number:'1.1-2' }} MB</p>
                </div>
              </div>

              <div class="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <h4 class="text-lg font-bold mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-electric-violet" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  Edit Metadata
                </h4>
                <form [formGroup]="editForm" (ngSubmit)="saveChanges()" class="space-y-4">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="space-y-1">
                      <label class="text-sm font-medium text-gray-600">Title</label>
                      <input type="text" formControlName="title" class="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-electric-violet transition outline-none">
                    </div>
                    <div class="space-y-1">
                      <label class="text-sm font-medium text-gray-600">Artist</label>
                      <input type="text" formControlName="artist" class="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-electric-violet transition outline-none">
                    </div>
                  </div>
                  <div class="space-y-1">
                    <label class="text-sm font-medium text-gray-600">Genre</label>
                    <select formControlName="genre" class="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-electric-violet transition outline-none">
                      @for (genre of genres; track genre) {
                        <option [value]="genre">{{ genre }}</option>
                      }
                    </select>
                  </div>
                  <div class="space-y-1">
                    <label class="text-sm font-medium text-gray-600">Description</label>
                    <textarea formControlName="description" rows="3" class="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-electric-violet transition outline-none resize-none"></textarea>
                  </div>
                  <div class="flex justify-end gap-3 pt-4">
                    <button type="button" (click)="resetForm()" class="px-6 py-2 text-gray-500 hover:text-gray-900 transition font-medium">Reset</button>
                    <button 
                      type="submit" 
                      [disabled]="editForm.invalid || isSaving()"
                      class="px-8 py-2 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition disabled:opacity-50"
                    >
                      @if (isSaving()) {
                        Saving...
                      } @else {
                        Save Changes
                      }
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        } @else {
          <div class="p-12 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <h2 class="text-2xl font-bold text-gray-400">Track not found</h2>
            <p class="text-gray-500 mt-2">The song you're looking for might have been removed.</p>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    :host {
      --electric-violet: oklch(53.18% 0.28 296.97);
      --hot-red: oklch(61.42% 0.238 15.34);
    }
  `]
})
export class TrackDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private trackService = inject(TrackService);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);
  playerService = inject(AudioPlayerService);

  track = signal<Track | null>(null);
  loading = signal(true);
  isSaving = signal(false);

  genres: MusicGenre[] = ['Pop', 'Rock', 'Rap', 'Hip-Hop', 'Jazz', 'Classical', 'Electronic', 'R&B', 'Country', 'Other'];

  editForm = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(50)]],
    artist: ['', Validators.required],
    genre: ['Pop', Validators.required],
    description: ['', Validators.maxLength(200)],
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadTrack(id);
    } else {
      this.loading.set(false);
    }
  }

  async loadTrack(id: string) {
    this.loading.set(true);
    try {
      // In a real app we'd get from service or re-fetch from IndexedDB
      const allTracks = this.trackService.tracks();
      let found = allTracks.find(t => t.id === id);

      if (!found) {
        // Fallback: search storage directly
      }

      if (found) {
        this.track.set(found);
        this.editForm.patchValue({
          title: found.title,
          artist: found.artist,
          genre: found.genre,
          description: found.description || ''
        });
      }
    } finally {
      this.loading.set(false);
    }
  }

  playTrack(track: Track) {
    this.playerService.playTrack(track);
  }

  resetForm() {
    if (this.track()) {
      this.editForm.patchValue({
        title: this.track()!.title,
        artist: this.track()!.artist,
        genre: this.track()!.genre,
        description: this.track()!.description || ''
      });
    }
  }

  async saveChanges() {
    if (this.editForm.invalid || !this.track()) return;

    this.isSaving.set(true);
    const updated: Track = {
      ...this.track()!,
      ...this.editForm.value as any
    };

    try {
      await this.trackService.updateTrack(updated);
      this.track.set(updated);
      this.toastService.show('Changes saved successfully!');
    } catch (err) {
      this.toastService.show('Failed to save changes.', 'error');
    } finally {
      this.isSaving.set(false);
    }
  }
}
