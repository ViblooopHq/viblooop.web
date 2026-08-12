import { HttpClient, HttpHeaders } from '@angular/common/http';
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

  /*
   * @param api - API URL
   * @param requestBody - Request body
   * @param headers - Optional headers
   * @returns 
   */
  post<T,>(api: string, requestBody: T, headers?: HttpHeaders) {
    return this.http.post(api, requestBody, { headers: headers });
  }

  /*
   * @param api - API URL
   * @param requestBody - Request body
   * @param headers - Optional headers
   * @returns 
   */
  put<T, R>(api: string, requestBody: T, headers?: HttpHeaders) {
    return this.http.put(api, requestBody, { headers: headers });
  }

  /*
   * @param api - API URL
   * @param requestBody - Request body
   * @param headers - Optional headers
   * @returns 
   */
  delete<T, R>(api: string, requestBody: T, headers?: HttpHeaders) {
    return this.http.delete(api, { body: requestBody, headers: headers });
  }

  /*
   * @param api - API URL
   * @param headers - Optional headers
   * @returns 
   */
  get(api: string, headers?: HttpHeaders) {
    return this.http.get(api, { headers: headers });
  }

  /*
   * @param api - API URL
   * @param requestBody - Request body
   * @param headers - Optional headers
   * @returns 
   */
  patch<T, R>(api: string, requestBody: T, headers?: HttpHeaders) {
    return this.http.patch(api, requestBody, { headers: headers });
  }
}
