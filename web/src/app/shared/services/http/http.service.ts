import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  http: HttpClient = inject(HttpClient)

  constructor() { }

  loadJsonFile(url: string) {
    return this.http.get(url);
  }

  /**
   *
   * @param api
   * @param requestBody
   * @param method
   * @param callbackFn
   */
  makeHttpCall(api: string, requestBody: any, method: string, callbackFn: any) {
    this.http.request(method, api, { body: requestBody }).subscribe(callbackFn);
  }

  post(api: string, requestBody: any) {
    return this.http.post(api, requestBody);
  }

  put(api: string, requestBody: any) {
    return this.http.put(api, requestBody);
  }

  delete(api: string, requestBody: any) {
    return this.http.delete(api, requestBody);
  }

  get(api: string) {
    return this.http.get(api);
  }
}
