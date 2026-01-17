import { Component, EventEmitter, HostListener, inject, Injectable, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PlaylistService } from '../../../core/services/playlist.service';

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

    private playlistService = inject(PlaylistService);

    playlists = this.playlistService.playlists;

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
