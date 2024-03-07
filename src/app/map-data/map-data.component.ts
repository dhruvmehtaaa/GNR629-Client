import { Component, OnInit, AfterViewInit, OnDestroy } from "@angular/core";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import TileWMS from "ol/source/TileWMS";
import { fromEvent, Subject } from "rxjs";
import { takeUntil, switchMap } from "rxjs/operators";
import { InteroperabilityService } from "../interoperability.service";
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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

  constructor(
    private interoperabilityService: InteroperabilityService,
    private sanitizer: DomSanitizer
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
    // Clear existing layers except the basemap layer
    this.map.getLayers().forEach(layer => {
      if (!(layer instanceof TileLayer) || layer !== this.basemapLayer) {
        this.map.removeLayer(layer);
      }
    });

    // Add WMS layer
    const wmsLayer = new TileLayer({
      source: new TileWMS({
        url: url,
        params: {
          'LAYERS': layerName
        },
        serverType: 'geoserver'
      })
    });

    this.map.addLayer(wmsLayer);
  }

  private extractLayerName(url: string): string | null {
    const params = new URLSearchParams(url);
    return params.has('layers') ? params.get('layers') : null;
  }

  private initMap() {
    this.map = new Map({
      target: "map",
      view: new View({
        center: [813079.7791264898, 5929220.284081122],
        zoom: 7
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
}
