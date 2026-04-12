import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { accessToken, LoginReq, loginResponse, User } from '../login/login';
import { tap, Observable } from 'rxjs';



@Injectable({ providedIn: "root" })
export class AuthService {
    api = "http://localhost:8000/auth"
    private _accessToken = signal<accessToken | null>(null);
    //private _refreshToken = signal<string | null>(null);
    private _user = signal<User | null>(null);

    readonly accessToken = this._accessToken.asReadonly();
    //readonly refreshToken = this._refreshToken.asReadonly();
    readonly user = this._user.asReadonly();
    constructor(private http: HttpClient, private router: Router) { }
    login(body: LoginReq): Observable<loginResponse> {
        return this.http.post<loginResponse>(this.api + "/login", body,
            { withCredentials: true }
        ).pipe(tap(res => {
            this._accessToken.set(res.access_token);
            //this._refreshToken.set(res.refresh_token);
        }))
    }
    register() {
        console.log("logged in")
    }

}