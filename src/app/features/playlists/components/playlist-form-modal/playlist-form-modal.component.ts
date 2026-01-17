import { Component, EventEmitter, HostListener, OnInit, Output, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PlaylistService } from '../../../../core/services/playlist.service';

@Component({
    selector: 'app-playlist-form-modal',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './playlist-form-modal.component.html',
    styleUrl: './playlist-form-modal.component.css'
})
export class PlaylistFormModalComponent implements OnInit {
    @Output() close = new EventEmitter<void>();
    @Output() submitForm = new EventEmitter<any>();
    playlistData = input<any>(null);

    @HostListener('document:keydown.escape')
    onEscape() {
        this.onClose();
    }

    onContainerClick(event: MouseEvent) {
        if ((event.target as HTMLElement).classList.contains('fixed')) {
            this.onClose();
        }
    }

    private fb = inject(FormBuilder);
    private playlistService = inject(PlaylistService);

    playlistForm = this.fb.group({
        name: ['', [Validators.required, Validators.maxLength(50)]],
        description: ['', [Validators.maxLength(200)]],
        cover: [null as File | null]
    });

    selectedFileName = signal<string | null>(null);
    isLoading = signal<boolean>(false);

    ngOnInit() {
        const data = this.playlistData();
        if (data) {
            this.playlistForm.patchValue({
                name: data.name,
                description: data.description || ''
            });
        }
    }

    onClose() {
        this.close.emit();
    }

    onFileSelected(event: Event) {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
            this.selectedFileName.set(file.name);
            this.playlistForm.patchValue({ cover: file });
        }
    }

    private async fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    }

    async onSubmit() {
        if (this.playlistForm.valid) {
            this.isLoading.set(true);
            try {
                const formValue = this.playlistForm.value;
                let coverImageBase64: string | undefined = undefined;

                if (formValue.cover instanceof File) {
                    coverImageBase64 = await this.fileToBase64(formValue.cover);
                }

                const existingData = this.playlistData();
                if (existingData) {
                    // Update
                    await this.playlistService.updatePlaylist({
                        ...existingData,
                        name: formValue.name!,
                        description: formValue.description || '',
                        coverImage: coverImageBase64 || existingData.coverImage
                    });
                } else {
                    // Create
                    await this.playlistService.addPlaylist({
                        name: formValue.name!,
                        description: formValue.description || '',
                        coverImage: coverImageBase64,
                        artist: 'Local User' // Defaulting to Local User
                    });
                }

                this.submitForm.emit();
                this.onClose();
            } catch (error) {
                console.error('Error saving playlist:', error);
            } finally {
                this.isLoading.set(false);
            }
        }
    }
}
