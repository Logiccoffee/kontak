import Map from "https://cdn.skypack.dev/ol/Map.js";
import View from "https://cdn.skypack.dev/ol/View.js";
import TileLayer from "https://cdn.skypack.dev/ol/layer/Tile.js";
import OSM from "https://cdn.skypack.dev/ol/source/OSM.js";
import { fromLonLat, toLonLat } from "https://cdn.skypack.dev/ol/proj.js";
import VectorLayer from "https://cdn.skypack.dev/ol/layer/Vector.js";
import VectorSource from "https://cdn.skypack.dev/ol/source/Vector.js";
import Feature from "https://cdn.skypack.dev/ol/Feature.js";
import Point from "https://cdn.skypack.dev/ol/geom/Point.js";
import LineString from "https://cdn.skypack.dev/ol/geom/LineString.js";
import Style from "https://cdn.skypack.dev/ol/style/Style.js";
import Icon from "https://cdn.skypack.dev/ol/style/Icon.js";
import Stroke from "https://cdn.skypack.dev/ol/style/Stroke.js";

// Koordinat Logic Coffee
const logicCoffeeCoords = [107.57504888132391, -6.874693043534695]; // Longitude, Latitude
let userCoords = null; // Koordinat pengguna

// Layer peta dasar
const basemap = new TileLayer({
  source: new OSM(),
});

// View peta
const mapView = new View({
  center: fromLonLat(logicCoffeeCoords),
  zoom: 14,
});

// Marker untuk Logic Coffee
const logicMarker = new Feature({
  geometry: new Point(fromLonLat(logicCoffeeCoords)),
});
logicMarker.setStyle(
  new Style({
    image: new Icon({
      src: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
      scale: 0.07,
    }),
  })
);

// Layer marker
const markerLayer = new VectorLayer({
  source: new VectorSource({
    features: [logicMarker],
  }),
});

// Layer rute
const routeLayer = new VectorLayer({
  source: new VectorSource(),
  style: new Style({
    stroke: new Stroke({
      color: "blue",
      width: 3,
    }),
  }),
});

// Inisialisasi peta
const map = new Map({
  target: "map",
  layers: [basemap, markerLayer, routeLayer],
  view: mapView,
});

// Fungsi untuk menggambar rute
function drawRoute(startCoords, endCoords) {
  const route = new Feature({
    geometry: new LineString([fromLonLat(startCoords), fromLonLat(endCoords)]),
  });

  routeLayer.getSource().clear();
  routeLayer.getSource().addFeature(route);

  // Zoom ke rute
  mapView.fit(route.getGeometry(), { padding: [50, 50, 50, 50] });
}

// Fungsi untuk mendapatkan koordinat dari wilayah
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

// Event listener untuk form jarak
document.getElementById("max-distance").closest("form").addEventListener("submit", (event) => {
  event.preventDefault();

  const maxDistance = parseFloat(document.getElementById("max-distance").value);
  if (isNaN(maxDistance) || maxDistance <= 0) {
    alert("Masukkan jarak yang valid dalam kilometer.");
    return;
  }

  if (!userCoords) {
    alert("Klik pada peta untuk menentukan lokasi pengguna.");
    return;
  }

  // Menggambar rute jika jarak valid
  drawRoute(userCoords, logicCoffeeCoords);
  alert(`Rute sejauh ${maxDistance} km dari lokasi Anda ke Logic Coffee telah ditampilkan.`);
});

// Event listener untuk form region
document.getElementById("region").closest("form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const region = document.getElementById("region").value;
  if (!region) {
    alert("Masukkan nama wilayah yang valid.");
    return;
  }

  const regionCoords = await getCoordinates(region);
  if (regionCoords) {
    // Menggambar rute dari wilayah ke Logic Coffee
    drawRoute(regionCoords, logicCoffeeCoords);
    alert(`Rute dari "${region}" ke Logic Coffee telah ditampilkan.`);
  }
});

// Event listener untuk klik peta (menentukan lokasi pengguna)
map.on("click", (event) => {
  userCoords = toLonLat(event.coordinate);
  alert(`Lokasi pengguna telah ditentukan: ${userCoords}`);
});
