import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./features/library/library.component').then(m => m.LibraryComponent)
    },
    {
        path: 'track/:id',
        loadComponent: () => import('./features/track-detail/track-detail.component').then(m => m.TrackDetailComponent)
    },
    {
        path: 'playlist/:id',
        loadComponent: () => import('./features/playlists/playlist-detail.component').then(m => m.PlaylistDetailComponent)
    }
];
