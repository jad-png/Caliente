import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    private toastsSignal = signal<Toast[]>([]);
    readonly toasts = this.toastsSignal.asReadonly();

    show(message: string, type: ToastType = 'success') {
        const id = Math.random().toString(36).substring(2, 11);
        const toast: Toast = { id, message, type };

        this.toastsSignal.update(toasts => [...toasts, toast]);

        setTimeout(() => {
            this.remove(id);
        }, 3000);
    }

    remove(id: string) {
        this.toastsSignal.update(toasts => toasts.filter(t => t.id !== id));
    }
}
