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

// Fungsi untuk mendapatkan koordinat wilayah menggunakan API Nominatim
async function getCoordinates(region) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    region
  )}&format=json&limit=1`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.length === 0) {
      alert("Region tidak ditemukan. Silakan coba nama lain.");
      return null;
    }

    const { lat, lon } = data[0];
    return [parseFloat(lon), parseFloat(lat)];
  } catch (error) {
    alert("Terjadi kesalahan saat mencari wilayah. Silakan coba lagi.");
    console.error(error);
    return null;
  }
}

// Event listener untuk form pencarian
document.getElementById("search-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const region = document.getElementById("region").value;
  const maxDistance = parseFloat(document.getElementById("max-distance")?.value || 5); // Default 5km jika tidak ada input

  if (!region) {
    alert("Masukkan nama wilayah yang valid.");
    return;
  }

  if (isNaN(maxDistance) || maxDistance <= 0) {
    alert("Masukkan jarak yang valid dalam kilometer.");
    return;
  }

  // Dapatkan koordinat wilayah dari API
  const coords = await getCoordinates(region);

  if (coords) {
    // Pindahkan tampilan peta ke koordinat yang ditemukan
    mapView.setCenter(fromLonLat(coords));
    mapView.setZoom(12);

    // Tambahkan marker pada wilayah
    updateMarker(coords);

    // Gambar lingkaran dengan radius input
    drawCircle(coords, maxDistance);

    alert(`Peta berhasil diperbarui untuk wilayah "${region}" dengan radius ${maxDistance} km.`);
  }
});

// Initialize map
window.addEventListener("DOMContentLoaded", () => {
  displayMap();
});