import { Component, EventEmitter, HostListener, Output, signal } from '@angular/core';
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
    @Output() editPlaylist = new EventEmitter<any>();
    isCollapsed = signal(false);
    activeMenu = signal('Library');
    openPlaylistMenuId = signal<string | null>(null);

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent) {
        const target = event.target as HTMLElement;
        if (this.openPlaylistMenuId() && !target.closest('.pl-menu-trigger') && !target.closest('.pl-menu-content')) {
            this.openPlaylistMenuId.set(null);
        }
    }

    @HostListener('document:keydown.escape')
    onEscape() {
        this.openPlaylistMenuId.set(null);
    }

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

    togglePlaylistMenu(id: string, event: Event) {
        event.stopPropagation();
        this.openPlaylistMenuId.update(v => v === id ? null : id);
    }

    onEditPlaylist(playlist: any) {
        this.editPlaylist.emit(playlist);
        this.openPlaylistMenuId.set(null);
    }
}
