import { Component, OnInit } from "@angular/core";
import { InteroperabilityService } from "../interoperability.service";
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: "app-tabular-data",
  templateUrl: "./tabular-data.component.html",
  styleUrls: ["./tabular-data.component.css"]
})
export class TabularDataComponent implements OnInit {
  xmlResponse: string;
  processedXml: SafeHtml;

  constructor(
    private interoperabilityService: InteroperabilityService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.interoperabilityService.xmlResponse$.subscribe(response => {
      this.xmlResponse = response;
      this.processedXml = this.sanitizer.bypassSecurityTrustHtml(this.xmlResponse);
      console.log(this.processedXml); // Log the processed XML to the console
    });
  }
}
