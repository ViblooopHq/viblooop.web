import { inject, Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { HttpService } from '../http/http.service';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Environment } from '../../../../environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private httpService = inject(HttpService);
  private baseUrl = Environment.apiBaseUrl;
  authService = inject(AuthService)

  getUserProfile(userId): Observable<any> {
    const body = { userId: userId };
    return this.httpService.post(this.baseUrl + `/getUserProfile`, body);
  }

  getMyProfile(): Observable<any> {
    return this.httpService.post(this.baseUrl + `/getMyProfile`, {});
  }

  updateUserProfile(data: any) {
    return this.httpService.patch(this.baseUrl + `/updateProfile`, data);
  }

  verifySelfieProfile(data: FormData) {
    const headers = new HttpHeaders({ 'X-Skip-Global-Loader': 'true' });
    return this.httpService.post(this.baseUrl + `/verifySelfieProfile`, data, headers);
  }

  getIntrestList(): Observable<any> {
    return this.httpService.get(this.baseUrl + `/getAllInterests`);
  }

  deleteAccount() {
    return this.httpService.delete(this.baseUrl + `/delete-account`);
  }

}
