import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { TrackService } from '../../core/services/track.service';
import { AudioPlayerService } from '../../core/services/audio-player.service';
import { Track, MusicGenre } from '../../core/models/track.model';
import { DurationPipe } from '../../shared/pipes/duration.pipe';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, DurationPipe],
  template: `
    <div class="container mx-auto px-4 py-8 pb-32">
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Library</h1>
          <p class="text-gray-500 mt-1">Manage and listen to your local collection</p>
        </div>
        <button 
          (click)="openUploadModal()"
          class="px-6 py-2.5 bg-gray-900 text-white font-medium rounded-full shadow-lg hover:bg-gray-800 transition transform active:scale-95 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Track
        </button>
      </div>

      <!-- Filters & Search -->
      <div class="flex flex-col sm:flex-row gap-4 mb-6">
        <div class="relative flex-1">
          <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </span>
          <input 
            type="text" 
            placeholder="Search by title or artist..." 
            class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-electric-violet focus:border-transparent outline-none transition"
            [(ngModel)]="searchQuery"
          >
        </div>
        <select 
          class="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-electric-violet outline-none bg-white text-gray-700"
          [(ngModel)]="selectedGenre"
        >
          <option value="All">All Genres</option>
          @for (genre of genres; track genre) {
            <option [value]="genre">{{ genre }}</option>
          }
        </select>
      </div>

      <!-- Track List -->
      @if (trackService.loading()) {
        <div class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      } @else {
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          @if (filteredTracks().length === 0) {
            <div class="p-12 text-center text-gray-500">
              <p>No tracks found. Try adding some music!</p>
            </div>
          } @else {
            <div class="grid grid-cols-[auto_1fr_1fr_auto_auto] gap-4 px-6 py-3 border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <div class="w-8">#</div>
              <div>Title</div>
              <div class="hidden sm:block">Artist</div>
              <div class="hidden sm:block">Genre</div>
              <div class="text-right">Duration</div>
              <div class="w-10"></div>
            </div>
            
            @for (track of filteredTracks(); track track.id; let i = $index) {
              <div 
                class="group grid grid-cols-[auto_1fr_1fr_auto_auto] gap-4 px-6 py-4 items-center hover:bg-gray-50 transition cursor-pointer border-b border-gray-50 last:border-none"
                (dblclick)="playTrack(track)"
              >
                <div class="w-8 text-gray-400 group-hover:text-gray-900">
                  @if (playerService.currentTrack()?.id === track.id && playerService.state() === 'playing') {
                     <span class="animate-pulse text-electric-violet">▶</span>
                  } @else {
                    {{ i + 1 }}
                  }
                </div>
                <div class="font-medium text-gray-900 truncate">
                  {{ track.title }}
                  <div class="sm:hidden text-xs text-gray-500 font-normal">{{ track.artist }}</div>
                </div>
                <div class="hidden sm:block text-gray-600 truncate">{{ track.artist }}</div>
                <div class="hidden sm:block">
                  <span class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">{{ track.genre }}</span>
                </div>
                <div class="text-right text-gray-500 text-sm font-mono">{{ track.duration | duration }}</div>
                 <div class="flex justify-end opacity-0 group-hover:opacity-100 transition">
                    <button 
                      (click)="$event.stopPropagation(); deleteTrack(track.id)"
                      class="p-1 text-gray-400 hover:text-red-500 transition"
                      title="Delete"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                 </div>
              </div>
            }
          }
        </div>
      }

      <!-- Upload Modal -->
      @if (showUploadModal()) {
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
            <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 class="text-xl font-bold text-gray-900">Add New Track</h2>
              <button (click)="closeUploadModal()" class="text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form [formGroup]="uploadForm" (ngSubmit)="submitUpload()" class="p-6 space-y-4">
              <!-- File Input -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Audio File</label>
                <div 
                  class="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-electric-violet hover:bg-gray-50 transition cursor-pointer relative"
                  (click)="fileInput.click()"
                >
                  <input 
                    #fileInput 
                    type="file" 
                    class="hidden" 
                    accept="audio/mpeg,audio/wav,audio/ogg" 
                    (change)="onFileSelected($event)"
                  >
                  @if (selectedFileName()) {
                    <p class="text-electric-violet font-medium break-all">{{ selectedFileName() }}</p>
                    <p class="text-xs text-gray-500 mt-1">Click to change</p>
                  } @else {
                     <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                    <p class="text-sm text-gray-600">Click to upload MP3, WAV, or OGG</p>
                    <p class="text-xs text-gray-400 mt-1">Max 10MB</p>
                  }
                </div>
                 @if (uploadForm.get('file')?.touched && uploadForm.get('file')?.errors?.['required']) {
                    <p class="text-red-500 text-xs mt-1">Audio file is required.</p>
                  }
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input type="text" formControlName="title" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-electric-violet outline-none transition">
                   @if (uploadForm.get('title')?.touched && uploadForm.get('title')?.errors?.['required']) {
                    <p class="text-red-500 text-xs mt-1">Title is required.</p>
                  }
                   @if (uploadForm.get('title')?.errors?.['maxlength']) {
                    <p class="text-red-500 text-xs mt-1">Max 50 characters.</p>
                  }
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Artist</label>
                  <input type="text" formControlName="artist" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-electric-violet outline-none transition">
                  @if (uploadForm.get('artist')?.touched && uploadForm.get('artist')?.errors?.['required']) {
                    <p class="text-red-500 text-xs mt-1">Artist is required.</p>
                  }
                </div>
              </div>

              <div>
                 <label class="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                 <select formControlName="genre" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-electric-violet outline-none transition bg-white">
                    @for (genre of genres; track genre) {
                      <option [value]="genre">{{ genre }}</option>
                    }
                 </select>
              </div>

             <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea formControlName="description" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-electric-violet outline-none transition resize-none"></textarea>
                 @if (uploadForm.get('description')?.errors?.['maxlength']) {
                    <p class="text-red-500 text-xs mt-1">Max 200 characters.</p>
                  }
             </div>

             <div class="flex justify-end gap-3 pt-2">
               <button type="button" (click)="closeUploadModal()" class="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition">Cancel</button>
               <button 
                type="submit" 
                [disabled]="uploadForm.invalid || isSubmitting()"
                class="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium shadow-md hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
               >
                 @if (isSubmitting()) {
                   <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                 }
                 Save Track
               </button>
             </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      --electric-violet: oklch(53.18% 0.28 296.97);
    }
  `]
})
export class LibraryComponent {
  trackService = inject(TrackService);
  playerService = inject(AudioPlayerService);
  fb = inject(FormBuilder);

  tracks = this.trackService.tracks;
  searchQuery = signal('');
  selectedGenre = signal('All');
  showUploadModal = signal(false);
  selectedFileName = signal<string | null>(null);
  isSubmitting = signal(false);

  genres: MusicGenre[] = ['Pop', 'Rock', 'Rap', 'Hip-Hop', 'Jazz', 'Classical', 'Electronic', 'R&B', 'Country', 'Other'];

  uploadForm = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(50)]],
    artist: ['', Validators.required],
    description: ['', Validators.maxLength(200)],
    genre: ['Pop', Validators.required],
    file: [null as File | null, Validators.required]
  });

  filteredTracks = computed(() => {
    const rawTracks = this.tracks();
    const query = this.searchQuery().toLowerCase().trim();
    const genre = this.selectedGenre();

    if (!query && genre === 'All') {
      return rawTracks;
    }

    return rawTracks.filter(track => {
      const matchesSearch = !query ||
        track.title.toLowerCase().includes(query) ||
        track.artist.toLowerCase().includes(query);

      const matchesGenre = genre === 'All' || track.genre === genre;

      return matchesSearch && matchesGenre;
    });
  });

  playTrack(track: Track) {
    this.playerService.playTrack(track);
  }

  deleteTrack(id: string) {
    if (confirm('Are you sure you want to delete this track?')) {
      this.trackService.deleteTrack(id);
    }
  }

  openUploadModal() {
    this.showUploadModal.set(true);
  }

  closeUploadModal() {
    this.showUploadModal.set(false);
    this.uploadForm.reset({ genre: 'Pop' });
    this.selectedFileName.set(null);
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB
        alert('File size must be less than 10MB');
        return;
      }
      this.selectedFileName.set(file.name);
      this.uploadForm.patchValue({ file });

      if (!this.uploadForm.get('title')?.value) {
        this.uploadForm.patchValue({ title: file.name.replace(/\.[^/.]+$/, "") });
      }
    }
  }

  async submitUpload() {
    if (this.uploadForm.invalid) return;

    this.isSubmitting.set(true);
    const formValue = this.uploadForm.value;
    const file = formValue.file as File;

    const duration = await this.getAudioDuration(file);

    try {
      await this.trackService.addTrack({
        title: formValue.title!,
        artist: formValue.artist!,
        description: formValue.description || '',
        genre: formValue.genre as MusicGenre,
        file: file,
        mimeType: file.type,
        size: file.size,
        duration: duration
      });
      this.closeUploadModal();
    } catch (err) {
      alert('Failed to save track.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private getAudioDuration(file: File): Promise<number> {
    return new Promise((resolve) => {
      const audio = new Audio();
      const objectUrl = URL.createObjectURL(file);
      audio.src = objectUrl;
      audio.onloadedmetadata = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(audio.duration);
      };
      audio.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(0);
      };
    });
  }
}
