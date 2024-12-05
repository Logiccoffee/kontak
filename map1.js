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
import LineString from "https://cdn.skypack.dev/ol/geom/LineString.js";
import Style from "https://cdn.skypack.dev/ol/style/Style.js";
import Icon from "https://cdn.skypack.dev/ol/style/Icon.js";
import Stroke from "https://cdn.skypack.dev/ol/style/Stroke.js";
import Fill from "https://cdn.skypack.dev/ol/style/Fill.js";

const attributions =
  '<a href="https://petapedia.github.io/" target="_blank">&copy; PetaPedia Indonesia</a>';


// Koordinat Logic Coffee
const logicCoffeeCoords = [107.57504888132391, -6.874693043534695]; // Longitude, Latitude
let clickedCoordinates = logicCoffeeCoords; // Default lokasi di Logic Coffee
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

// Fungsi untuk menampilkan peta
function displayMap() {
  map = new Map({
    target: "map",
    layers: [basemap, markerLayer, circleLayer],
    view: mapView,
  });

  // Handle klik pada peta
  map.on("click", (event) => {
    const coords = toLonLat(event.coordinate);
    clickedCoordinates = coords; // Simpan koordinat hasil klik
    updateMarker(coords);
  });
}

// Fungsi untuk menambahkan atau memperbarui marker
function updateMarker(coords) {
  const marker = new Feature({
    geometry: new Point(fromLonLat(coords)),
  });
  marker.setStyle(markerStyle);

  // Hapus marker sebelumnya dan tambahkan yang baru
  markerLayer.getSource().clear();
  markerLayer.getSource().addFeature(marker);
}

// Fungsi untuk menggambar lingkaran radius
function drawCircle(coords, radius) {
  const circleFeature = new Feature({
    geometry: new Circle(fromLonLat(coords), radius * 1000), // Radius dalam meter
  });

  // Hapus lingkaran sebelumnya dan tambahkan yang baru
  circleLayer.getSource().clear();
  circleLayer.getSource().addFeature(circleFeature);
}

// Fungsi untuk menggambar rute
function drawRoute(startCoords, endCoords) {
  const routeFeature = new Feature({
    geometry: new LineString([fromLonLat(startCoords), fromLonLat(endCoords)]),
  });

  const routeLayer = new VectorLayer({
    source: new VectorSource({
      features: [routeFeature],
    }),
    style: new Style({
      stroke: new Stroke({
        color: "red",
        width: 3,
      }),
    }),
  });

  map.addLayer(routeLayer);
}

// Fungsi untuk mendapatkan koordinat wilayah berdasarkan nama
async function getRegionCoordinates(region) {
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
    return [parseFloat(data[0].lon), parseFloat(data[0].lat)];
  } catch (error) {
    console.error(error);
    alert("Gagal mendapatkan data wilayah.");
    return null;
  }
}

// Event listener untuk radius berdasarkan jarak
document.getElementById("distance-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const maxDistance = parseFloat(document.getElementById("max-distance").value);

  if (isNaN(maxDistance) || maxDistance <= 0) {
    alert("Masukkan jarak yang valid.");
    return;
  }

  drawCircle(clickedCoordinates, maxDistance);
  alert(`Radius ${maxDistance} km diterapkan pada lokasi.`);
});

// Event listener untuk batas wilayah (region)
document.getElementById("region-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const region = document.getElementById("region").value;

  if (!region) {
    alert("Masukkan nama wilayah.");
    return;
  }

  const regionCoords = await getRegionCoordinates(region);
  if (regionCoords) {
    drawCircle(regionCoords, 5); // Radius default 5 km di sekitar wilayah
    drawRoute(regionCoords, logicCoffeeCoords);
    alert(`Wilayah "${region}" ditemukan, rute menuju Logic Coffee ditampilkan.`);
  }
});

// Inisialisasi peta
window.addEventListener("DOMContentLoaded", () => {
  displayMap();
});
