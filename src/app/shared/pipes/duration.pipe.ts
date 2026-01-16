import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'duration',
    standalone: true
})
export class DurationPipe implements PipeTransform {

    transform(value: number): string {
        if (!value && value !== 0) return '0:00';

        const minutes = Math.floor(value / 60);
        const seconds = Math.floor(value % 60);

        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

}
