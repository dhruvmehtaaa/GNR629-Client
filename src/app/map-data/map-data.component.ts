import { Component, OnInit, AfterViewInit, OnDestroy } from "@angular/core";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import { fromEvent, Subject } from "rxjs";
import { takeUntil, switchMap } from "rxjs/operators";
import { InteroperabilityService } from "../interoperability.service";
import { HttpClient } from '@angular/common/http';
import TileWMS from 'ol/source/TileWMS';
import { transform } from 'ol/proj';
import Overlay from 'ol/Overlay';

@Component({
  selector: "app-map-data",
  templateUrl: "./map-data.component.html",
  styleUrls: ["./map-data.component.css"]
})
export class MapDataComponent implements OnInit, AfterViewInit, OnDestroy {
  map: Map;
  private destroy$: Subject<void> = new Subject<void>();
  receivedStrings: string[] = []; // Array to store received strings
  basemapLayer: TileLayer; // Reference to the basemap layer
  wmsLayers: TileLayer[] = []; // Array to store WMS layers
  features: any[] = []; // Array to store fetched features
  popup: Overlay; // Popup overlay

  constructor(
    private interoperabilityService: InteroperabilityService,
    private http: HttpClient
  ) {}

  ngAfterViewInit() {
    this.initMap();
  }

  ngOnInit() {
    this.interoperabilityService.sentString$.subscribe(response => {
      this.receivedStrings.push(response); // Store the received string in the array
      console.log(this.receivedStrings); // Log the received strings to the console
      // Reinitialize map with the received WMS URL
      if (this.map) {
        const layerName = this.extractLayerName(response);
        if (layerName) {
          this.loadWmsLayer(response, layerName);
        } else {
          console.error('Failed to extract layer name from WMS URL:', response);
        }
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadWmsLayer(url: string, layerName: string) {
    // Add WMS layer
    const wmsLayer = new TileLayer({
      source: new TileWMS({
        url: url,
        params: {
          'LAYERS': layerName,
          'TILED': true // Tiled WMS for performance
        },
        serverType: 'geoserver'
      })
    });

    this.wmsLayers.push(wmsLayer); // Add the layer to the array
    this.map.addLayer(wmsLayer); // Add the layer to the map
  }

  private extractLayerName(url: string): string | null {
    const params = new URLSearchParams(url);
    return params.has('layers') ? params.get('layers') : null;
  }

  private initMap() {
    this.map = new Map({
      target: "map",
      view: new View({
        center: [0, 0],
        zoom: 2
      })
    });

    // Add basemap layer
    this.basemapLayer = new TileLayer({
      source: new XYZ({
        url: "https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      })
    });
    this.map.addLayer(this.basemapLayer);

    const mapElement = document.getElementById("map");

    // Create popup overlay
    this.popup = new Overlay({
      element: document.getElementById('popup'),
      autoPan: true,
      autoPanAnimation: {
        duration: 250
      }
    });
    this.map.addOverlay(this.popup);

    // Handle click event on the map
    fromEvent(mapElement, "click")
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe((event: MouseEvent) => {
        const coordinate = this.map.getEventCoordinate(event);
        this.getFeatureInfo(coordinate);
      });

    // Handle mouse down event
    fromEvent(mapElement, "mousedown")
      .pipe(
        switchMap(() =>
          fromEvent(mapElement, "mousemove")
            .pipe(
              takeUntil(fromEvent(mapElement, "mouseup")),
            )
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(({ movementX, movementY }: MouseEvent) => {
        const view = this.map.getView();
        const viewCenter = view.getCenter();
        view.setCenter([
          viewCenter[0] - movementX * view.getResolution(),
          viewCenter[1] + movementY * view.getResolution()
        ]);
      });
  }

  private getFeatureInfo(coordinate: [number, number]) {
    const viewResolution = this.map.getView().getResolution();
    const projection = this.map.getView().getProjection().getCode();
    const url = this.wmsLayers[0].getSource().getFeatureInfoUrl(
      coordinate,
      viewResolution,
      projection,
      {
        'INFO_FORMAT': 'application/json', // Request feature info in JSON format
        'FEATURE_COUNT': 1 // Limit the number of features returned
      }
    );
  
    if (url) {
      // Send HTTP GET request to the WMS server
      this.http.get(url).subscribe((response: any) => {
        // Handle the response here
        console.log('Feature Info:', response);
        const features = response.features;
  
        // Update popup content
        const content = document.getElementById('popup-content');
        if (content && features && features.length > 0) {
          // Clear previous content
          content.innerHTML = '';
  
          // Display the first property value of each feature
          features.forEach(feature => {
            for (const key in feature.properties) {
              const p = document.createElement('p');
              p.textContent = feature.properties[key];
              content.appendChild(p);
              break; // Only display the first property
            }
          });
  
          // Set popup position
          this.popup.setPosition(coordinate);
        } else {
          // Clear popup content and hide popup if no features found
          content.innerHTML = '';
          this.popup.setPosition(undefined);
        }
      });
    }
  }
  
  
  
  
}