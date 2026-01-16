import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AudioPlayerService } from '../../../core/services/audio-player.service';
import { TrackService } from '../../../core/services/track.service';
import { DurationPipe } from '../../pipes/duration.pipe';

@Component({
  selector: 'app-player-controls',
  standalone: true,
  imports: [CommonModule, FormsModule, DurationPipe, RouterModule],
  templateUrl: './player-controls.component.html',
  styleUrl: './player-controls.component.css'
})
export class PlayerControlsComponent {
  player = inject(AudioPlayerService);

  seek(event: Event) {
    const input = event.target as HTMLInputElement;
    this.player.seek(Number(input.value));
  }

  updateVolume(event: Event) {
    const input = event.target as HTMLInputElement;
    this.player.setVolume(Number(input.value));
  }

  onPrev() {
    this.player.previous();
  }

  onNext() {
    this.player.next();
  }
}

