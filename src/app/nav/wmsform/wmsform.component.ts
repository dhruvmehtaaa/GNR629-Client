import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { InteroperabilityService } from "../../interoperability.service";
import { NgxXml2jsonService } from "ngx-xml2json";
import { DomSanitizer } from '@angular/platform-browser';
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: "app-wmsform",
  templateUrl: "./wmsform.component.html",
  styleUrls: ["./wmsform.component.css"],
})
export class WmsformComponent implements OnInit {
  // obj = null;
  onServerSelectionChange() {
    const selectedServer = this.form.get('serverSelection').value;
    if (selectedServer === 'localhost') {
      this.form.get('URL').setValue('http://localhost:8080/geoserver/wms?service=wms&version=1.1.1&request=GetCapabilities');
    } else if (selectedServer === 'bhuvan') {
      this.form.get('URL').setValue('https://bhuvan-vec2.nrsc.gov.in/bhuvan/wms?service=wms&version=1.1.1&request=GetCapabilities');
    }
  }
  sendString(url: string) {
    this.interoperabilityService.sendString(url);
  }
  
  getCapabilities = "notHit";
  imageToShow;
  getLayers = false;
  obj = null;
  layers: [];
  format: [];
  styles: [];
  versions: [];
  selectVersion = null;
  selectReq = null;
  selectLayer = null;
  selectSRS = null;
  selectFormat = null;
  selectBbox = null;
  selectStyles = null;
  wmsRequests = [];
  selectMinx = null;
  selectMiny = null;
  selectMaxx = null;
  selectMaxy = null;
  selectWidth = null;
  selectHeight = null;
  serverSelection = new FormControl('localhost'); // Default to localhost

  // Add Bhuvan server URL
  bhuvanServerUrl = 'https://bhuvan-vec2.nrsc.gov.in/bhuvan/wms';
  form = new FormGroup({
    serverSelection: new FormControl('localhost'),
    URL: new FormControl(
      this.serverSelection.value === 'localhost' ? 
          "http://localhost:8080/geoserver/wms?service=wms&version=1.1.1&request=GetCapabilities" :
          "https://bhuvan-vec2.nrsc.gov.in/bhuvan/wms?service=wms&version=1.1.1&request=GetCapabilities",
    ),
    Version: new FormControl(null),
    WMSRequest: new FormControl(null),
    Layer: new FormControl(null),
    Styles: new FormControl(null),
    SRS: new FormControl(null),
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
      if (value === 'bhuvan') {
        this.form.get('URL').setValue(this.bhuvanServerUrl);
      } else {
        this.form.get('URL').setValue('http://localhost:8080/geoserver/wms?service=wms&version=1.1.1&request=GetCapabilities');
      }
    });
    
    this.form.valueChanges.subscribe(data => {
      console.log(data);
      if (data) {
        this.selectVersion = data.Version;
        this.selectReq = data.WMSRequest;
        this.selectLayer = data.Layer;
        this.selectStyles = data.Styles;
        this.selectSRS = data.SRS;
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
        for (var item in this.layers) {
          if (this.layers[item]["Name"] == this.selectLayer) {
            // console.log(item);

            this.selectSRS = this.layers[item]["SRS"];
            // this.form.controls["SRS"].setValue(this.selectSRS);
            this.format = this.obj["WMT_MS_Capabilities"][1].Capability.Request[
              this.selectReq
            ].Format;
            this.styles = this.layers[item]["Style"]["Name"];

            this.selectWidth = 1200;
            // this.form.controls["Width"].setValue(this.selectWidth);
            this.selectHeight = 900;

            // this.form.controls["Height"].setValue(this.selectHeight);
            this.selectBbox = this.layers[item]["BoundingBox"];
            this.selectMinx = this.selectBbox["@attributes"]["minx"];

            // this.form.controls["Minx"].setValue(this.selectMinx);
            this.selectMiny = this.selectBbox["@attributes"]["miny"];
            // this.form.controls["Miny"].setValue(this.selectMiny);
            this.selectMaxx = this.selectBbox["@attributes"]["maxx"];
            // this.form.controls["Maxx"].setValue(this.selectMaxx);
            this.selectMaxy = this.selectBbox["@attributes"]["maxy"];
            // this.form.controls["Maxy"].setValue(this.selectMaxy);
            
          }
        }
      }
    });
  }

  onSubmit() {
    const selectedServer = this.serverSelection.value;
    let urlLoc: string;
    console.log(selectedServer);

    if (selectedServer === 'localhost') {
      urlLoc = this.form.controls["URL"].value;
    } else if (selectedServer === 'bhuvan') {
      urlLoc = this.bhuvanServerUrl;
    }

    if (this.getCapabilities == "notHit") {
      const urlLoc = this.form.controls["URL"].value;
      console.log(urlLoc);
      // this.spinner.show();
      this.interoperabilityService.getData(urlLoc).subscribe(data => {
        const parser = new DOMParser();
      const xml = parser.parseFromString(data, "text/xml");
      const xmlString = new XMLSerializer().serializeToString(xml);
      this.interoperabilityService.setXmlResponse(xmlString);
        this.obj = this.ngxXml2jsonService.xmlToJson(xml);
        // this.spinner.hide();
        this.getCapabilities = "hit";

        if (this.getCapabilities == "hit") {
          this.layers = this.obj[
            "WMT_MS_Capabilities"
          ][1].Capability.Layer.Layer;
          this.wmsRequests = Object.keys(this.obj["WMT_MS_Capabilities"][1].Capability.Request).filter(request => {
            return request==="GetCapabilities" || request === "GetMap" || request === "GetFeatureInfo";
          });
          this.versions = this.obj["WMT_MS_Capabilities"][1][
            "@attributes"
          ].version;

          console.log(this.obj);
        }
      });
    }
    
  }

  SubmitWMSForm() {
    alert("done!!");
    const selectedServer = this.serverSelection.value;
    
    let serverUrl: string;
    serverUrl = this.form.get('URL').value;
    if(serverUrl==='https://bhuvan-vec2.nrsc.gov.in/bhuvan/wms?service=wms&version=1.1.1&request=GetCapabilities'){
      serverUrl=this.bhuvanServerUrl;
    }else{
      serverUrl='http://localhost:8080/geoserver/wms';
    }
    // console.log(serverUrl);
    
    const version = this.form.controls["Version"].value;
    const request_type= this.form.controls["WMSRequest"].value;
    const layers = this.form.controls["Layer"].value;
    const bbox = `${this.form.controls["Minx"].value},${this.form.controls["Miny"].value},${this.form.controls["Maxx"].value},${this.form.controls["Maxy"].value}`;
    const width = this.form.controls["Width"].value;
    const height = this.form.controls["Height"].value;
    const srs = this.form.controls["SRS"].value;
    const format = this.form.controls["Format"].value;
  
  //console.log(bbox);
    // Construct the URL with form values
    const Requrl = `${serverUrl}?service=WMS&version=${version}&request=${request_type}&layers=${layers}&bbox=${bbox}&width=${width}&height=${height}&srs=EPSG%3A4326&format=${format}`;
    console.log(Requrl);
    this.sendString(Requrl); 
           
    // Fetch the image from the server
    this.interoperabilityService.getImageFromServer(Requrl).subscribe(
      (imageBlob: Blob) => {
        // Convert the image blob to a URL
        const imageUrl = URL.createObjectURL(imageBlob);
  
        // Set the image URL in the service
        this.interoperabilityService.setImage(imageUrl);
      },
      error => {
        console.error("Error fetching image:", error);
        // Handle error if necessary
      }
    );
  }
  
  
}
