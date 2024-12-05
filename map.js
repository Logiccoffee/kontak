import Map from "https://cdn.skypack.dev/ol/Map.js";
import View from "https://cdn.skypack.dev/ol/View.js";
import TileLayer from "https://cdn.skypack.dev/ol/layer/Tile.js";
import OSM from "https://cdn.skypack.dev/ol/source/OSM.js";
import { fromLonLat, toLonLat } from "https://cdn.skypack.dev/ol/proj.js";
import VectorLayer from "https://cdn.skypack.dev/ol/layer/Vector.js";
import VectorSource from "https://cdn.skypack.dev/ol/source/Vector.js";
import Feature from "https://cdn.skypack.dev/ol/Feature.js";
import Point from "https://cdn.skypack.dev/ol/geom/Point.js";
import Circle from "https://cdn.skypack.dev/ol/geom/Circle.js";
import Style from "https://cdn.skypack.dev/ol/style/Style.js";
import Icon from "https://cdn.skypack.dev/ol/style/Icon.js";
import Stroke from "https://cdn.skypack.dev/ol/style/Stroke.js";
import Fill from "https://cdn.skypack.dev/ol/style/Fill.js";

const logicCoffeeCoords = [107.57504888132391, -6.874693043534695]; // Longitude, Latitude
let clickedCoordinates = logicCoffeeCoords; // Default to Logic Coffee
let map;

// Basemap layer
const basemap = new TileLayer({
  source: new OSM(),
});

// Map view
const mapView = new View({
  center: fromLonLat(logicCoffeeCoords),
  zoom: 18,
});

// Marker style
const markerStyle = new Style({
  image: new Icon({
    src: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    scale: 0.07,
  }),
});

// Marker layer
const markerLayer = new VectorLayer({
  source: new VectorSource(),
});

// Circle layer for radius visualization
const circleLayer = new VectorLayer({
  source: new VectorSource(),
  style: new Style({
    stroke: new Stroke({
      color: "blue",
      width: 2,
    }),
    fill: new Fill({
      color: "rgba(0, 0, 255, 0.1)",
    }),
  }),
});

// Display map function
function displayMap() {
  map = new Map({
    target: "map",
    layers: [basemap, markerLayer, circleLayer],
    view: mapView,
  });

  // Handle map click
  map.on("click", (event) => {
    const coords = toLonLat(event.coordinate);
    clickedCoordinates = coords; // Save clicked coordinates
    updateMarker(coords);
  });
}

// Add or update marker
function updateMarker(coords) {
  const marker = new Feature({
    geometry: new Point(fromLonLat(coords)),
  });
  marker.setStyle(markerStyle);

  // Clear existing marker and add new one
  markerLayer.getSource().clear();
  markerLayer.getSource().addFeature(marker);
}

// Draw circle on map
function drawCircle(coords, radius) {
  const circleFeature = new Feature({
    geometry: new Circle(fromLonLat(coords), radius * 1000), // Radius in meters
  });

  // Clear existing circle and add new one
  circleLayer.getSource().clear();
  circleLayer.getSource().addFeature(circleFeature);
}

// Handle search form submission
document.getElementById("search-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const maxDistance = parseFloat(document.getElementById("max-distance").value);
  if (!isNaN(maxDistance) && clickedCoordinates) {
    drawCircle(clickedCoordinates, maxDistance);
    alert(`Radius of ${maxDistance} km applied at ${clickedCoordinates}`);
  }
});

// Initialize map
window.addEventListener("DOMContentLoaded", () => {
  displayMap();
});