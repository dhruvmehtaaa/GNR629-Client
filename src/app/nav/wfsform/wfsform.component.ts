import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { InteroperabilityService } from "../../interoperability.service";
import { NgxXml2jsonService } from "ngx-xml2json";
import { DomSanitizer } from '@angular/platform-browser';
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: "app-wfsform",
  templateUrl: "./wfsform.component.html",
  styleUrls: ["./wfsform.component.css"],
})
export class WfsformComponent implements OnInit {
  // obj = null;
  parsedXml: string;
  onServerSelectionChange() {
    const selectedServer = this.form.get('serverSelection').value;
    this.form.get('URL').setValue('http://localhost:8080/geoserver/wfs?service=wfs&version=1.1.1&request=GetCapabilities');
  }

  sendString(url: string) {
    this.interoperabilityService.sendString(url);
  }

  getCapabilities = "notHit";
  imageToShow;
  getLayers = false;
  obj = null;
  layers: any[] = []; // Changed to any[]
  format: any[] = []; // Changed to any[]
  styles: any[] = []; // Changed to any[]
  versions: string[] = []; // Changed to string[]
  selectVersion = null;
  selectReq = null;
  selectLayer = null;
  selectSRS = 'EPSG:4326';
  selectFormat = null;
  selectBbox = null;
  selectStyles = null;
  wfsRequests: string[] = []; // Changed to string[]
  selectMinx = null;
  selectMiny = null;
  selectMaxx = null;
  selectMaxy = null;
  selectWidth = null;
  selectHeight = null;
  serverSelection = new FormControl('localhost'); // Default to localhost

  form = new FormGroup({
    serverSelection: new FormControl('localhost'),
    URL: new FormControl("http://localhost:8080/geoserver/wfs?service=wfs&version=1.1.1&request=GetCapabilities"),
    Version: new FormControl(null),
    WFSRequest: new FormControl(null),
    Layer: new FormControl(null),
    Styles: new FormControl(null),
    SRS: new FormControl('EPSG:4326'),
    Width: new FormControl(1200),
    Height: new FormControl(900),
    Minx: new FormControl(-180),
    Miny: new FormControl(-90),
    Maxx: new FormControl(180),
    Maxy: new FormControl(90),
    Format: new FormControl(null)
  });

  @ViewChild('map', { static: true }) mapElement: ElementRef;

  constructor(
    private interoperabilityService: InteroperabilityService,
    private ngxXml2jsonService: NgxXml2jsonService,
    private sanitizer: DomSanitizer,
    // private spinner: NgxSpinnerService
  ) {}

  ngOnInit() {
    this.form.get('serverSelection').valueChanges.subscribe(value => {
      this.form.get('URL').setValue('http://localhost:8080/geoserver/wfs?service=wfs&version=1.1.1&request=GetCapabilities');
    });

    this.form.valueChanges.subscribe(data => {
      console.log(data);
      if (data) {
        this.selectVersion = data.Version;
        this.selectReq = data.WFSRequest;
        this.selectLayer = data.Layer;
        this.selectStyles = data.Styles;
        this.selectSRS = 'EPSG:4326';
        this.selectWidth = data.Width;
        this.selectHeight = data.Height;
        this.selectMinx = data.Minx;
        this.selectMiny = data.Miny;
        this.selectMaxx = data.Maxx;
        this.selectMaxy = data.Maxy;
        this.selectFormat = data.Format;
      }
      
      if (this.selectReq && this.selectVersion) this.getLayers = true;
      if (this.selectLayer) {
        for (let item of this.layers) { // Changed to let
          if (item["Name"] == this.selectLayer) { // Changed to item
            this.selectSRS = 'EPSG:4326'; // Changed to item
            this.format = this.obj["WMT_MS_Capabilities"][1].Capability.Request[this.selectReq].Format;
            this.styles = item["Style"]["Name"]; // Changed to item

            this.selectWidth = 1200;
            this.selectHeight = 900;

            this.selectBbox = item["BoundingBox"];
            this.selectMinx = this.selectBbox["@attributes"]["minx"];
            this.selectMiny = this.selectBbox["@attributes"]["miny"];
            this.selectMaxx = this.selectBbox["@attributes"]["maxx"];
            this.selectMaxy = this.selectBbox["@attributes"]["maxy"];
          }
        }
      }
    });
  }

  onSubmit() {
    const selectedServer = this.serverSelection.value;
    let urlLoc: string;

    urlLoc = this.form.controls["URL"].value;

    if (this.getCapabilities == "notHit") {
      const urlLoc = this.form.controls["URL"].value;
      this.interoperabilityService.getData(urlLoc).subscribe(data => {
        const parser = new DOMParser();
        const xml = parser.parseFromString(data, "text/xml");
        const xmlString = new XMLSerializer().serializeToString(xml);
        this.interoperabilityService.setXmlResponse(xmlString);
        this.obj = this.ngxXml2jsonService.xmlToJson(xml);
        this.getCapabilities = "hit";

        if (this.getCapabilities == "hit") {
          this.layers = this.obj["wfs:WFS_Capabilities"].FeatureTypeList.FeatureType;  
          // this.wfsRequests =this.obj["wfs:WFS_Capabilities"]["ows:OperationsMetadata"]["ows:Operation"] 
          if (this.obj && this.obj["wfs:WFS_Capabilities"] && this.obj["wfs:WFS_Capabilities"]["ows:OperationsMetadata"] && this.obj["wfs:WFS_Capabilities"]["ows:OperationsMetadata"]["ows:Operation"]) {
            // Access the array of operations
            const operations = this.obj["wfs:WFS_Capabilities"]["ows:OperationsMetadata"] && this.obj["wfs:WFS_Capabilities"]["ows:OperationsMetadata"]["ows:Operation"];
          
            // Iterate over each operation
            for (let operation of operations) {
              // Access the name attribute and push it to wfsRequests
              this.wfsRequests.push(operation["@attributes"].name);
            }
          }
          

          this.versions.push(this.obj["wfs:WFS_Capabilities"]["@attributes"]["version"]);

          console.log(this.obj);
        }
      });
    }
  }

  SubmitWFSForm() {
    alert("done!!");
    const selectedServer = this.serverSelection.value;
    let serverUrl: string;
    serverUrl = this.form.get('URL').value;
    serverUrl='http://localhost:8080/geoserver/wfs';
    const version = this.form.controls["Version"].value;
    const request_type = this.form.controls["WFSRequest"].value;
    const layers = this.form.controls["Layer"].value;
    const bbox = `${this.form.controls["Minx"].value},${this.form.controls["Miny"].value},${this.form.controls["Maxx"].value},${this.form.controls["Maxy"].value}`;
    const width = this.form.controls["Width"].value;
    const height = this.form.controls["Height"].value;
    const srs = this.form.controls["SRS"].value;
    const format = this.form.controls["Format"].value;
    let Requrl: string;
  
    // if (request_type === 'DescribeFeatureType') {
      Requrl = `http://localhost:8080/geoserver/wfs?service=WFS&version=1.1.0&request=${request_type}&typeName=${layers}`;
      console.log(Requrl);
      
      // Make the HTTP request to get the XML
      this.interoperabilityService.getData(Requrl).subscribe(data => {
        // Parse the XML response
        const parser = new DOMParser();
        const xml = parser.parseFromString(data, "text/xml");
        const xmlString = new XMLSerializer().serializeToString(xml);
        this.parsedXml = xmlString; 
        // Display the parsed XML
        // console.log(xmlString); // You can use this XML data as needed in your application
      });
    // } else {
    //   Requrl = `${serverUrl}?service=WFS&version=${version}&request=${request_type}&layers=${layers}&bbox=${bbox}&width=${width}&height=${height}&srs=EPSG%3A4326&format=kml`;
    //   console.log(Requrl);
      
    //   // Send the request string
    //   this.sendString(Requrl);
    // }
  }
    
}
