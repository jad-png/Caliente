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
  template: `
    <div class="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 px-4 py-3 shadow-2xl z-50">
      <div class="container mx-auto flex flex-col gap-2">
        
        <!-- Progress Bar -->
        <div class="w-full flex items-center gap-3 text-xs font-mono text-gray-500">
          <span class="w-10 text-right">{{ player.currentTime() | duration }}</span>
          <div class="relative flex-1 group py-2">
            <input 
              type="range" 
              min="0" 
              [max]="player.duration() || 100" 
              [value]="player.currentTime()"
              (input)="seek($event)"
              class="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-electric-violet"
            >
          </div>
          <span class="w-10">{{ player.duration() | duration }}</span>
        </div>

        <div class="flex items-center justify-between gap-4">
          
          <!-- Track Info -->
          <div class="flex items-center w-1/4 min-w-[150px] overflow-hidden">
            @if (player.currentTrack(); as track) {
              <div class="flex flex-col truncate">
                <a [routerLink]="['/track', track.id]" class="font-bold text-gray-900 truncate hover:text-electric-violet transition cursor-pointer">
                  {{ track.title }}
                </a>
                <span class="text-xs text-gray-400 truncate">{{ track.artist }}</span>
              </div>
            } @else {
              <span class="text-sm text-gray-400 italic">No track playing</span>
            }
          </div>

          <!-- Controls -->
          <div class="flex items-center justify-center gap-4 flex-1">
            <button 
              class="p-2 text-gray-400 hover:text-gray-900 transition active:scale-95 disabled:opacity-30" 
              (click)="onPrev()" 
              [disabled]="!player.hasPrev()"
            >
               <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
            </button>

            <button 
              class="w-12 h-12 flex items-center justify-center rounded-full bg-gray-900 text-white shadow-xl hover:scale-105 transition active:scale-95"
              (click)="player.togglePlayPause()"
              [disabled]="!player.currentTrack()"
            >
              @if (player.state() === 'playing') {
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              }
            </button>

            <button 
              class="p-2 text-gray-400 hover:text-gray-900 transition active:scale-95 disabled:opacity-30" 
              (click)="onNext()" 
              [disabled]="!player.hasNext()"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
            </button>
          </div>

          <!-- Volume -->
          <div class="flex items-center justify-end w-1/4 min-w-[150px] gap-2 group">
            <button (click)="player.toggleMute()" class="text-gray-400 hover:text-gray-900">
               @if (player.muted() || player.volume() === 0) {
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
               } @else {
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
               }
            </button>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              [value]="player.volume()"
              (input)="updateVolume($event)"
              class="w-20 sm:w-24 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-400 group-hover:accent-electric-violet transition"
            >
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --electric-violet: oklch(53.18% 0.28 296.97);
    }
  `]
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

