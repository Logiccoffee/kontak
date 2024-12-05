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
import LineString from "https://cdn.skypack.dev/ol/geom/LineString.js";

const attributions =
  '<a href="https://petapedia.github.io/" target="_blank">&copy; PetaPedia Indonesia</a>';

const logicCoffeeCoords = [107.57504888132391, -6.874693043534695]; // Longitude, Latitude
let clickedCoordinates = logicCoffeeCoords; // Default to Logic Coffee
let map;

// Basemap layer
const basemap = new TileLayer({
  source: new OSM({
    attributions: attributions,
  }),
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

// Garis layer untuk menghubungkan titik marker ke tepian lingkaran
const lineLayer = new VectorLayer({
  source: new VectorSource(),
  style: new Style({
    stroke: new Stroke({
      color: "blue", // Warna garis
      width: 2,
    }),
  }),
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
    geometry: new Circle(fromLonLat(coords), radius * 1000), // Radius dalam meter
  });

  // Clear existing circle and line
  circleLayer.getSource().clear();
  lineLayer.getSource().clear();

  // Tambahkan lingkaran ke layer
  circleLayer.getSource().addFeature(circleFeature);

  // Buat garis dari marker ke tepian lingkaran
  const edgeCoords = [coords[0], coords[1] + (radius / 111)]; // Radius 1 derajat ~ 111 km
  const lineFeature = new Feature({
    geometry: new LineString([
      fromLonLat(coords),
      fromLonLat(edgeCoords),
    ]),
  });

  lineLayer.getSource().addFeature(lineFeature);
}

// Tampilkan Lat dan Lon di Alert
function updateMarker(coords) {
  const marker = new Feature({
    geometry: new Point(fromLonLat(coords)),
  });
  marker.setStyle(markerStyle);

  // Clear existing marker dan tambahkan yang baru
  markerLayer.getSource().clear();
  markerLayer.getSource().addFeature(marker);

  alert(`Koordinat yang diklik:\nLatitude: ${coords[1].toFixed(6)}, Longitude: ${coords[0].toFixed(6)}`);
}

// Tampilkan peta
function displayMap() {
  map = new Map({
    target: "map",
    layers: [basemap, markerLayer, circleLayer, lineLayer], // Tambahkan lineLayer ke dalam peta
    view: mapView,
  });

  // Handle map click
  map.on("click", (event) => {
    const coords = toLonLat(event.coordinate);
    clickedCoordinates = coords; // Simpan koordinat yang diklik
    updateMarker(coords); // Tampilkan marker
  });
}

// Handle form search untuk menggambar lingkaran dan garis
document.getElementById("search-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const maxDistance = parseFloat(document.getElementById("max-distance").value);
  if (isNaN(maxDistance) || maxDistance <= 0) {
    alert("Masukkan jarak yang valid dalam kilometer.");
    return;
  }
  if (clickedCoordinates) {
    drawCircle(clickedCoordinates, maxDistance);
    alert(`Radius ${maxDistance} km diterapkan pada koordinat ${clickedCoordinates}`);
  }
});

// Initialize map
window.addEventListener("DOMContentLoaded", () => {
  displayMap();
});
