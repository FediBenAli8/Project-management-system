import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    private isRefreshing = false;

    constructor(private authService: AuthService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Attach access token to every request
        const token = this.authService.accessToken();
        const cloned = (token && !req.url.includes('/auth/refresh')) ? req.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
        }) : req;

        return next.handle(cloned).pipe(
            catchError(err => {
                // If the error is 401 and it's NOT the refresh request itself
                if (err.status === 401 && !req.url.includes('/auth/refresh') && !req.url.includes('/auth/login') && !req.url.includes('/auth/signup')) {
                    return this.authService.refresh().pipe(
                        switchMap(() => {
                            // Retry original request with new token
                            const retried = req.clone({
                                setHeaders: { Authorization: `Bearer ${this.authService.accessToken()}` }
                            });
                            return next.handle(retried);
                        }),
                        catchError(refreshErr => {
                            // Refresh failed — log out
                            this.authService.logout();
                            return throwError(() => refreshErr);
                        })
                    );
                }
                return throwError(() => err);
            })
        );
    }
}