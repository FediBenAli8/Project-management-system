// src/app/core/services/token.service.ts
import { Injectable } from '@angular/core';
import { jwtDecode, JwtPayload } from 'jwt-decode';

export interface CustomJwtPayload extends JwtPayload {
    role?: string; // Adjust based on your backend's JWT structure
    sub?: string;  // Usually user ID
}

@Injectable({
    providedIn: 'root'
})
export class TokenService {

    decodeToken(token: string): CustomJwtPayload | null {
        if (!token) return null;
        try {
            return jwtDecode<CustomJwtPayload>(token);
        } catch (error) {
            console.error('Invalid token', error);
            return null;
        }
    }

    getRoleFromToken(token: string): string | null {
        const decoded = this.decodeToken(token);
        return decoded?.role || null;
    }

    isTokenExpired(token: string): boolean {
        const decoded = this.decodeToken(token);
        if (!decoded || !decoded.exp) return true;
        const currentTime = Date.now() / 1000;
        return decoded.exp < currentTime;
    }
}