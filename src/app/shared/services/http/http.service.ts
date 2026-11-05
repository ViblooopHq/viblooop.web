import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  http: HttpClient = inject(HttpClient)

  /**
   * Loads a JSON file from the specified URL.
   * @param url - The URL of the JSON file to load.
   * @returns An Observable that emits the parsed JSON data.
   */
  loadJsonFile(url: string) {
    return this.http.get(url);
  }

  /*
   * @param api - API URL
   * @param requestBody - Request body
   * @param headers - Optional headers
   * @returns 
   */
  post<T,>(api: string, requestBody?: T, headers?: HttpHeaders) {
    return this.http.post(api, requestBody, { headers: headers });
  }

  /*
   * @param api - API URL
   * @param requestBody - Request body
   * @param headers - Optional headers
   * @returns 
   */
  put<T, R>(api: string, requestBody?: T, headers?: HttpHeaders) {
    return this.http.put(api, requestBody, { headers: headers });
  }

  /*
   * @param api - API URL
   * @param requestBody - Request body
   * @param headers - Optional headers
   * @returns 
   */
  delete<T, R>(api: string, requestBody?: T, headers?: HttpHeaders) {
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
  patch<T, R>(api: string, requestBody?: T, headers?: HttpHeaders) {
    return this.http.patch(api, requestBody, { headers: headers });
  }
}
