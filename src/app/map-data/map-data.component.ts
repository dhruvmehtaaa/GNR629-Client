import { Component, OnInit, AfterViewInit, OnDestroy } from "@angular/core";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import { fromEvent, Subject } from "rxjs";
import { map, takeUntil, switchMap } from "rxjs/operators";

@Component({
  selector: "app-map-data",
  templateUrl: "./map-data.component.html",
  styleUrls: ["./map-data.component.css"]
})
export class MapDataComponent implements OnInit, AfterViewInit, OnDestroy {
  map: Map;
  private destroy$: Subject<void> = new Subject<void>();

  ngAfterViewInit() {
    this.initMap();
  }

  constructor() {}

  ngOnInit() {}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initMap() {
    this.map = new Map({
      target: "map",
      layers: [
        new TileLayer({
          source: new XYZ({
            url: "https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          })
        })
      ],
      view: new View({
        center: [813079.7791264898, 5929220.284081122],
        zoom: 7
      })
    });

    const mapElement = document.getElementById("map");

    // Handle mouse down event
    fromEvent(mapElement, "mousedown")
      .pipe(
        switchMap(() =>
          fromEvent(mapElement, "mousemove")
            .pipe(
              map((event: MouseEvent) => ({
                deltaX: event.movementX,
                deltaY: event.movementY
              })),
              takeUntil(fromEvent(mapElement, "mouseup")),
            )
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(({ deltaX, deltaY }) => {
        const view = this.map.getView();
        const viewCenter = view.getCenter();
        view.setCenter([
          viewCenter[0] - deltaX * view.getResolution(),
          viewCenter[1] + deltaY * view.getResolution()
        ]);
      });
  }
}
