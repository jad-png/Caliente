import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PlayerControlsComponent } from './shared/components/player-controls/player-controls.component';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { PlaylistFormModalComponent } from './features/playlists/components/playlist-form-modal/playlist-form-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    PlayerControlsComponent,
    ToastContainerComponent,
    NavbarComponent,
    SidebarComponent,
    PlaylistFormModalComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'MusicStream';
  showPlaylistModal = signal(false);
  editingPlaylist = signal<any>(null);

  openPlaylistModal() {
    this.showPlaylistModal.set(true);
  }

  closePlaylistModal() {
    this.showPlaylistModal.set(false);
    this.editingPlaylist.set(null);
  }

  handleEditPlaylist(playlist: any) {
    this.editingPlaylist.set(playlist);
    this.showPlaylistModal.set(true);
  }
}
