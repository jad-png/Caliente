import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class ApiClientService {
    private http = inject(HttpClient);
    private readonly API_URL = "";

    getAll<T>(path: string) {
        return this.http.get<T[]>(`${this.API_URL}/${path}`)
    }

    create<T>(path: string, body: T) {
        return this.http.post<T>(`${this.API_URL}/${path}`, body)
    }

    update<T>(path: string, body: T) {
        return this.http.put<T>(`${this.API_URL}/${path}`, body)
    }

    delete(path: string) {
        return this.http.delete(`${this.API_URL}/${path}`)
    }
}