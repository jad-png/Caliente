import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TrackService } from '../../core/services/track.service';
import { AudioPlayerService } from '../../core/services/audio-player.service';
import { Track, MusicGenre } from '../../core/models/track.model';
import { DurationPipe } from '../../shared/pipes/duration.pipe';
import { ToastService } from '../../core/services/toast.service';
import { TrackUploadModalComponent } from './components/track-upload-modal/track-upload-modal.component';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [CommonModule, FormsModule, DurationPipe, TrackUploadModalComponent],
  templateUrl: './library.component.html',
  styleUrl: './library.component.css'
})
export class LibraryComponent {
  trackService = inject(TrackService);
  playerService = inject(AudioPlayerService);
  toastService = inject(ToastService);

  tracks = this.trackService.tracks;
  searchQuery = signal('');
  selectedGenre = signal('All');
  showUploadModal = signal(false);

  genres: MusicGenre[] = ['Pop', 'Rock', 'Rap', 'Hip-Hop', 'Jazz', 'Classical', 'Electronic', 'R&B', 'Country', 'Other'];

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
    this.playerService.playTrack(track, this.filteredTracks());
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
  }
}
