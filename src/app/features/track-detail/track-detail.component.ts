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
  templateUrl: './track-detail.component.html',
  styleUrl: './track-detail.component.css'
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
