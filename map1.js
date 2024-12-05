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
import Stroke from "https://cdn.skypack.dev/ol/style/Stroke.js";
import Fill from "https://cdn.skypack.dev/ol/style/Fill.js";

// Koordinat Logic Coffee
const logicCoffeeCoords = [107.57504888132391, -6.874693043534695]; // Longitude, Latitude
let userCoords = null; // Koordinat pengguna
let map;

// Basemap layer
const basemap = new TileLayer({
  source: new OSM(),
});

// Map view
const mapView = new View({
  center: fromLonLat(logicCoffeeCoords),
  zoom: 15, // Default zoom level
});

// Marker dan circle layer
const markerLayer = new VectorLayer({
  source: new VectorSource(),
});
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

// Fungsi menggambar marker
function addMarker(coords) {
  const marker = new Feature({
    geometry: new Point(fromLonLat(coords)),
  });

  markerLayer.getSource().clear();
  markerLayer.getSource().addFeature(marker);
}

// Fungsi menggambar radius
function drawCircle(coords, radius) {
  const circleFeature = new Feature({
    geometry: new Circle(fromLonLat(coords), radius * 1000), // Radius dalam meter
  });

  circleLayer.getSource().clear();
  circleLayer.getSource().addFeature(circleFeature);

  // Zoom agar pas dengan lingkaran
  const circleExtent = circleFeature.getGeometry().getExtent();
  mapView.fit(circleExtent, { duration: 1000, maxZoom: 18 });
}

// Hitung jarak antara dua koordinat
function calculateDistance(coord1, coord2) {
  const R = 6371; // Radius bumi dalam kilometer
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Hasil dalam kilometer
}

// Tampilkan peta
function displayMap() {
  map = new Map({
    target: "map",
    layers: [basemap, markerLayer, circleLayer],
    view: mapView,
  });
}

// Tangani lokasi pengguna
function getUserLocation() {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userCoords = [position.coords.longitude, position.coords.latitude];
        alert(`Lokasi Anda berhasil ditemukan!`);

        // Tambahkan marker untuk lokasi pengguna
        addMarker(userCoords);

        // Hitung jarak ke Logic Coffee
        const distanceToLogic = calculateDistance(userCoords, logicCoffeeCoords);
        alert(`Jarak Anda ke Logic Coffee adalah ${distanceToLogic.toFixed(2)} km`);

        // Gambarkan lingkaran di sekitar Logic Coffee
        drawCircle(logicCoffeeCoords, distanceToLogic);
      },
      (error) => {
        alert("Gagal mendapatkan lokasi Anda. Pastikan GPS diaktifkan.");
        console.error(error);
      }
    );
  } else {
    alert("Geolocation tidak didukung oleh browser Anda.");
  }
}

// Jalankan peta saat halaman dimuat
window.addEventListener("DOMContentLoaded", () => {
  displayMap();
  getUserLocation(); // Panggil geolocation saat halaman dimuat
});
