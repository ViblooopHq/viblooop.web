import { inject, Injectable } from '@angular/core';
import { HttpService } from '../http/http.service';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Environment } from '../../../../environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  httpService = inject(HttpService);
  baseUrl = Environment.apiBaseUrl;
  authService = inject(AuthService)

  getUserProfile(userId): Observable<any> {
    const body = { userId: userId };
    return this.httpService.http.post(this.baseUrl + `/getUserProfile`, body);
  }

  updateUserProfile(data: any) {
    return this.httpService.http.post(this.baseUrl + `/updateProfile`, data);
  }

  verifySelfieProfile(data: FormData) {
    return this.httpService.http.post(this.baseUrl + `/verifySelfieProfile`, data);
  }

  getIntrestList(): Observable<any> {
    return this.httpService.http.get(this.baseUrl + `/getAllInterests`);
  }

}
