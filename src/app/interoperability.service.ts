import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class InteroperabilityService {
  image;
  constructor(private http: HttpClient) {}

  private xmlResponseSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  public xmlResponse$: Observable<string> = this.xmlResponseSubject.asObservable();

  setXmlResponse(xmlResponse: string) {
    //console.log(xmlResponse); // Log the XML response to the console
    this.xmlResponseSubject.next(xmlResponse);
  }

  private sentStringSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  public sentString$: Observable<string> = this.sentStringSubject.asObservable();

  sendString(data: string): Observable<any> {
    // Logic for sending the string, as you've defined
    this.sentStringSubject.next(data); // Update the BehaviorSubject with the sent string
    return this.http.post('your-url', { stringData: data });
  }
  

  getData(url): Observable<any> {
    return this.http.get(url, { responseType: "text" });
  }
  getImageFromServer(imageUrl: string): Observable<Blob> {
    return this.http.get(imageUrl, { responseType: "blob" });
  }

  getImage() {
    return this.image;
  }
  setImage(imageUrl) {
    this.image = imageUrl;
  }
}
