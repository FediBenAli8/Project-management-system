import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Token, LoginReq, User } from '../login/login';
import { tap, Observable, catchError, throwError } from 'rxjs';
import { TokenService } from './token.service';
import { RegisterReq } from '../views/register/register';



@Injectable({ providedIn: "root" })
export class AuthService {
    private platformId = inject(PLATFORM_ID);
    api = "http://localhost:8000/auth"
    private _accessToken = signal<string | null>(null);
    private _refreshToken = signal<string | null>(null);
    private _user = signal<User | null>(null);
    readonly isLoggedIn = computed(() => !!this._accessToken());
    readonly isAdmin = computed(() => this._user()?.role === 'admin');
    readonly isMember = computed(() => this.isTeamMember());
    readonly role = computed(() => this._user()?.role ?? null);
    readonly email = computed(() => this._user()?.email ?? null);
    readonly userName = computed(() => this._user()?.username ?? null);
    private get isBrowser(): boolean {
        return isPlatformBrowser(this.platformId);
    }
    private getStorage(key: string): string | null {
        return this.isBrowser ? localStorage.getItem(key) : null;
    }
    private setStorage(key: string, value: string): void {
        if (this.isBrowser) localStorage.setItem(key, value);
    }
    private removeStorage(key: string): void {
        if (this.isBrowser) localStorage.removeItem(key);
    }
    readonly accessToken = this._accessToken.asReadonly();
    readonly refreshToken = this._refreshToken.asReadonly();
    readonly user = this._user.asReadonly();
    
    getUserRole(): string | null {
        return this._user()?.role ?? null;
    }

    isTeamLeader(): boolean {
        const role = String(this._user()?.role || '').trim().toLowerCase().replace(/\s+/g, '_');
        return ['team_leader', 'leader'].includes(role);
    }

    isTeamMember(): boolean {
        const role = String(this._user()?.role || '').trim().toLowerCase().replace(/\s+/g, '_');
        return ['team_member', 'member'].includes(role);
    }
    
    constructor(private http: HttpClient,
        private router: Router,
        private tokenService: TokenService,
    ) {
        const accessToken = this.getStorage('access_token');
        const user = this.getStorage('user');

        if (accessToken) {
            this._accessToken.set(accessToken);
        }

        if (user) {
            try {
                this._user.set(JSON.parse(user));
            } catch {
                this.removeStorage('user');
            }
        }
    }
    login(body: LoginReq): Observable<Token> {
        return this.http.post<Token>(this.api + "/login", body,
            { withCredentials: true }
        ).pipe(tap(res => {
            this._accessToken.set(res.access_token);
            this._user.set(res.user);
            //this.setStorage('refresh_token', res.refresh_token);
            this.setStorage('access_token', res.access_token);
            this.setStorage('user', JSON.stringify(res.user));
            //this._refreshToken.set(res.refresh_token);
        }))
    }

    register(body: RegisterReq) {
        return this.http.post<Token>(this.api + "/signup", body,
            { withCredentials: true }
        ).pipe(tap(res => {
            this._accessToken.set(res.access_token);
            this._user.set(res.user);
            //this._refreshToken.set(res.refresh_token);
        }))
    }
    changePassword(currentPassword: string, newPassword: string) {
        return this.http.put<{ message: string }>(this.api + "/change-password", {
            current_password: currentPassword,
            new_password: newPassword,
        });
    }
    refresh() {
        //const token = this.getStorage('refresh_token');
        //if (!token) return throwError(() => new Error('No refresh token'));
        return this.http.post<Token>(this.api + "/refresh", {},
            { withCredentials: true }
        ).pipe(tap(res => {
            this._accessToken.set(res.access_token);
            this._user.set(res.user);
            //this._refreshToken.set(res.refresh_token);
        }
        ))
    }
    logout() {
        // Call backend logout to clear the refresh_token cookie server-side
        this.http.post(this.api + "/logout", {}, { withCredentials: true }).subscribe({
            next: () => {
                // Clear frontend state
                this._accessToken.set(null);
                this._refreshToken.set(null);
                this._user.set(null);
                this.removeStorage('refresh_token');
                this.removeStorage('access_token');
                this.removeStorage('user');
                this.router.navigate(['/login']);
            },
            error: (error) => {
                console.error('Logout error:', error);
                // Still clear frontend state even if backend call fails
                this._accessToken.set(null);
                this._refreshToken.set(null);
                this._user.set(null);
                this.removeStorage('refresh_token');
                this.removeStorage('access_token');
                this.removeStorage('user');
                this.router.navigate(['/login']);
            }
        });
    }

}
