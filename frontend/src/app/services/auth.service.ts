import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Token, LoginReq, User } from '../login/login';
import { tap, Observable } from 'rxjs';
import { TokenService } from './token.service';



@Injectable({ providedIn: "root" })
export class AuthService {
    api = "http://localhost:8000/auth"
    private _accessToken = signal<string | null>(null);
    //private _refreshToken = signal<string | null>(null);
    private _user = signal<User | null>(null);
    readonly isLoggedIn = computed(() => !!this._accessToken());
    readonly isAdmin = computed(() => this._user()?.role === 'admin');
    readonly isMember = computed(() => this._user()?.role === 'member');
    readonly role = computed(() => this._user()?.role ?? null);
    readonly userName = computed(() => this._user()?.username ?? null);
    readonly accessToken = this._accessToken.asReadonly();
    //readonly refreshToken = this._refreshToken.asReadonly();
    readonly user = this._user.asReadonly();
    constructor(private http: HttpClient,
        private router: Router,
        private tokenService: TokenService,
    ) { }
    login(body: LoginReq): Observable<Token> {
        return this.http.post<Token>(this.api + "/login", body,
            { withCredentials: true }
        ).pipe(tap(res => {
            this._accessToken.set(res.access_token);
            this._user.set(res.user);
            //this._refreshToken.set(res.refresh_token);
        }))
    }

    register() {
        console.log("logged in")
    }
    refresh() {
        return this.http.post<Token>(this.api + "/refresh", {},
            { withCredentials: true }
        ).pipe(tap(res => {
            this._accessToken.set(res.access_token);
            this._user.set(res.user);
            //this._refreshToken.set(res.refresh_token);
        }))
    }

}