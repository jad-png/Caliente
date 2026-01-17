import { Component, HostListener, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TrackService } from '../../core/services/track.service';
import { AudioPlayerService } from '../../core/services/audio-player.service';
import { Track, MusicGenre } from '../../core/models/track.model';
import { DurationPipe } from '../../shared/pipes/duration.pipe';
import { ToastService } from '../../core/services/toast.service';
import { TrackUploadModalComponent } from './components/track-upload-modal/track-upload-modal.component';
import { PlaylistService } from '../../core/services/playlist.service';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [CommonModule, FormsModule, DurationPipe, TrackUploadModalComponent],
  templateUrl: './library.component.html',
  styleUrl: './library.component.css'
})
export class LibraryComponent {
  trackService = inject(TrackService);
  playlistService = inject(PlaylistService);
  playerService = inject(AudioPlayerService);
  toastService = inject(ToastService);

  tracks = this.trackService.tracks;
  searchQuery = signal('');
  selectedGenre = signal('All');
  showUploadModal = signal(false);
  openMenuId = signal<string | null>(null);
  showPlaylistSubmenu = signal<string | null>(null);

  playlists = this.playlistService.playlists;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    // If we have an open menu and the click is NOT on a menu button or the menu itself
    if (this.openMenuId() && !target.closest('.menu-trigger') && !target.closest('.menu-content')) {
      this.openMenuId.set(null);
      this.showPlaylistSubmenu.set(null);
    }
  }

  toggleMenu(id: string, event: Event) {
    event.stopPropagation();
    if (this.openMenuId() === id) {
      this.openMenuId.set(null);
      this.showPlaylistSubmenu.set(null);
    } else {
      this.openMenuId.set(id);
    }
  }

  togglePlaylistSubmenu(id: string, event: Event) {
    event.stopPropagation();
    this.showPlaylistSubmenu.update(v => v === id ? null : id);
  }

  async addTrackToPlaylist(playlistId: string, trackId: string) {
    await this.playlistService.addTrackToPlaylist(playlistId, trackId);
    this.openMenuId.set(null);
    this.showPlaylistSubmenu.set(null);
  }

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
