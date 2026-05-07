import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    private isRefreshing = false;
    private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    constructor(private authService: AuthService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Attach access token to every request
        const token = this.authService.accessToken();
        const cloned = (token && !req.url.includes('/auth/refresh')) ? this.addTokenHeader(req, token) : req;

        return next.handle(cloned).pipe(
            catchError(err => {
                // If the error is 401 and it's NOT the refresh request itself
                if (err.status === 401 && !req.url.includes('/auth/refresh') && !req.url.includes('/auth/login') && !req.url.includes('/auth/signup')) {
                    return this.handle401Error(req, next);
                }
                return throwError(() => err);
            })
        );
    }

    private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
        if (!this.isRefreshing) {
            this.isRefreshing = true;
            this.refreshTokenSubject.next(null);

            return this.authService.refresh().pipe(
                switchMap((res: any) => {
                    this.isRefreshing = false;
                    const newToken = res.access_token;
                    this.refreshTokenSubject.next(newToken);
                    return next.handle(this.addTokenHeader(request, newToken));
                }),
                catchError((refreshErr) => {
                    this.isRefreshing = false;
                    this.authService.logout();
                    return throwError(() => refreshErr);
                })
            );
        } else {
            // While refreshing, wait for the new token from refreshTokenSubject
            return this.refreshTokenSubject.pipe(
                filter(token => token !== null),
                take(1),
                switchMap(token => {
                    return next.handle(this.addTokenHeader(request, token));
                })
            );
        }
    }

    private addTokenHeader(request: HttpRequest<any>, token: string) {
        return request.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
        });
    }
}