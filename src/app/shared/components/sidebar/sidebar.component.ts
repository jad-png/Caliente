import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
    @Output() createPlaylist = new EventEmitter<void>();
    isCollapsed = signal(false);
    activeMenu = signal('Library');

    // Dummy playlists for UI
    playlists = signal([
        { id: '1', name: 'My Favorites', trackCount: 42 },
        { id: '2', name: 'Late Night Vibes', trackCount: 15 },
        { id: '3', name: 'Gym Mix', trackCount: 28 },
        { id: '4', name: 'Coding Flow', trackCount: 104 }
    ]);

    toggleSidebar() {
        this.isCollapsed.update(v => !v);
    }

    setActive(menu: string) {
        this.activeMenu.set(menu);
    }

    onCreatePlaylistClick() {
        this.createPlaylist.emit();
    }
}
