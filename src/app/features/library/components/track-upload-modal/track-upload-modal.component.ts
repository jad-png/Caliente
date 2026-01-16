import { Component, EventEmitter, HostListener, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TrackService } from '../../../../core/services/track.service';
import { ToastService } from '../../../../core/services/toast.service';
import { MusicGenre } from '../../../../core/models/track.model';

@Component({
  selector: 'app-track-upload-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './track-upload-modal.component.html',
  styleUrl: './track-upload-modal.component.css'
})
export class TrackUploadModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() success = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEscape() {
    this.onClose();
  }

  onContainerClick(event: MouseEvent) {
    // If we click exactly the backdrop (the outer div)
    if ((event.target as HTMLElement).classList.contains('fixed')) {
      this.onClose();
    }
  }

  private trackService = inject(TrackService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  selectedFileName = signal<string | null>(null);
  isSubmitting = signal(false);
  genres: MusicGenre[] = ['Pop', 'Rock', 'Rap', 'Hip-Hop', 'Jazz', 'Classical', 'Electronic', 'R&B', 'Country', 'Other'];

  uploadForm = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(50)]],
    artist: ['', Validators.required],
    description: ['', Validators.maxLength(200)],
    genre: ['Pop', Validators.required],
    file: [null as File | null, Validators.required]
  });

  onClose() {
    this.close.emit();
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB
        this.toastService.show('file size must be less than 10MB', 'error');
        return;
      }
      this.selectedFileName.set(file.name);
      this.uploadForm.patchValue({ file });

      if (!this.uploadForm.get('title')?.value) {
        this.uploadForm.patchValue({ title: file.name.replace(/\.[^/.]+$/, "") });
      }
    }
  }

  async submitUpload() {
    if (this.uploadForm.invalid) return;

    this.isSubmitting.set(true);
    const formValue = this.uploadForm.value;
    const file = formValue.file as File;

    const duration = await this.getAudioDuration(file);

    try {
      await this.trackService.addTrack({
        title: formValue.title!,
        artist: formValue.artist!,
        description: formValue.description || '',
        genre: formValue.genre as MusicGenre,
        file: file,
        mimeType: file.type,
        size: file.size,
        duration: duration
      });
      this.toastService.show('Track added successfully!');
      this.success.emit();
    } catch (err) {
      this.toastService.show('Failed to save track.', 'error');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private getAudioDuration(file: File): Promise<number> {
    return new Promise((resolve) => {
      const audio = new Audio();
      const objectUrl = URL.createObjectURL(file);
      audio.src = objectUrl;
      audio.onloadedmetadata = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(audio.duration);
      };
      audio.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(0);
      };
    });
  }
}
