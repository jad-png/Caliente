import { Component, EventEmitter, HostListener, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
    selector: 'app-playlist-form-modal',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './playlist-form-modal.component.html',
    styleUrl: './playlist-form-modal.component.css'
})
export class PlaylistFormModalComponent {
    @Output() close = new EventEmitter<void>();
    @Output() submitForm = new EventEmitter<any>();

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

    playlistForm = this.fb.group({
        name: ['', [Validators.required, Validators.maxLength(50)]],
        description: ['', [Validators.maxLength(200)]],
        cover: [null as File | null]
    });

    selectedFileName = signal<string | null>(null);

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

    onSubmit() {
        if (this.playlistForm.valid) {
            this.submitForm.emit(this.playlistForm.value);
            this.onClose();
        }
    }
}
