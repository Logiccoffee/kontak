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
import LineString from "https://cdn.skypack.dev/ol/geom/LineString.js"; // Pastikan ini diimport

// Koordinat Logic Coffee (default)
const logicCoffeeCoords = [107.57504888132391, -6.874693043534695];
let clickedCoordinates = logicCoffeeCoords; // Default to Logic Coffee
let map;

// Attributions
const attributions =
  '<a href="https://petapedia.github.io/" target="_blank">&copy; PetaPedia Indonesia</a>';

// Layer peta dasar
const basemap = new TileLayer({
  source: new OSM({
    attributions: attributions,
  }),
});

// View untuk peta
const mapView = new View({
  center: fromLonLat(logicCoffeeCoords),
  zoom: 18,
});

// Gaya marker
const markerStyle = new Style({
  image: new Icon({
    src: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    scale: 0.07,
  }),
});

// Layer marker
const markerLayer = new VectorLayer({
  source: new VectorSource(),
});

// Layer untuk lingkaran radius
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
    layers: [basemap, markerLayer, circleLayer, lineLayer],
    view: mapView,
  });

  // Menambahkan marker di Logic Coffee
  const logicCoffeeMarker = new Feature({
    geometry: new Point(fromLonLat(logicCoffeeCoords)),
  });
  logicCoffeeMarker.setStyle(markerStyle); // Gaya marker
  markerLayer.getSource().addFeature(logicCoffeeMarker);

  // Menangani klik pada peta setelah peta diinisialisasi
  map.on("click", (event) => {
    const coords = toLonLat(event.coordinate);
    clickedCoordinates = coords; // Simpan koordinat yang diklik
    updateMarker(coords); // Memperbarui marker dengan koordinat yang diklik
    drawLine(coords); // Gambar garis dari marker baru ke Logic Coffee
  });
}

// Layer untuk garis
const lineLayer = new VectorLayer({
  source: new VectorSource(),
  style: new Style({
    stroke: new Stroke({
      color: 'red', // Warna garis
      width: 2, // Lebar garis
    }),
  }),
});

// Fungsi untuk menggambar garis dari koordinat pengguna ke Logic Coffee
function drawLine(userCoords) {
  const lineFeature = new Feature({
    geometry: new LineString([fromLonLat(userCoords), fromLonLat(logicCoffeeCoords)]),
  });

  // Menambahkan garis ke layer
  lineLayer.getSource().clear(); // Hapus garis yang lama
  lineLayer.getSource().addFeature(lineFeature);
}

// Fungsi untuk menambahkan atau memperbarui marker
function updateMarker(coords) {
  const marker = new Feature({
    geometry: new Point(fromLonLat(coords)),
  });
  marker.setStyle(markerStyle);

  // Hapus marker yang ada dan tambahkan marker baru
  markerLayer.getSource().clear();
  markerLayer.getSource().addFeature(marker);
}

// Fungsi untuk menghitung jarak antara dua koordinat (Haversine formula)
function calculateDistance(coord1, coord2) {
  const R = 6371; // Radius bumi dalam km
  const lat1 = coord1[1];
  const lon1 = coord1[0];
  const lat2 = coord2[1];
  const lon2 = coord2[0];

  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Jarak dalam km
  return distance;
}

// Fungsi untuk menggambar lingkaran pada peta
function drawCircle(coords, radius) {
  const circleFeature = new Feature({
    geometry: new Circle(fromLonLat(coords), radius * 1000), // Radius dalam meter
  });

  // Hapus lingkaran yang ada dan tambahkan lingkaran baru
  circleLayer.getSource().clear();
  circleLayer.getSource().addFeature(circleFeature);
}

// Ambil token dari cookie dengan nama 'login'
const token = getCookie('login');
if (!token) {
  alert('Token tidak ditemukan, harap login terlebih dahulu!');
  throw new Error('Token tidak ditemukan');  // Hentikan eksekusi jika token tidak ada
}

// Fungsi untuk mengambil nilai cookie berdasarkan nama
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null; // Jika cookie tidak ditemukan, kembalikan null
}

// Menambahkan marker di Logic Coffee
const logicCoffeeMarker = new Feature({
  geometry: new Point(fromLonLat(logicCoffeeCoords)),
});
logicCoffeeMarker.setStyle(markerStyle); // Gaya marker

// Menambahkan marker ke layer
markerLayer.getSource().addFeature(logicCoffeeMarker);


// Fungsi untuk fetch data dari backend menggunakan proxy 
async function fetchRoads(longitude, latitude, maxDistance) {
  try {
    console.log("Fetching roads with params:", { longitude, latitude, maxDistance });

    const response = await fetch("https://asia-southeast2-awangga.cloudfunctions.net/logiccoffee/data/roads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Login": token,  // Token dari cookie
      },
      body: JSON.stringify({
        long: longitude,
        lat: latitude,
        max_distance: maxDistance,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Roads fetched:", data);
    return data; // Kembalikan data dari backend
  } catch (error) {
    console.error("Error fetching roads:", error);
    return null; // Jika ada error, kembalikan null
  }
}

// Menangani pengiriman form pencarian
document.getElementById("search-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const maxDistance = parseFloat(document.getElementById("max-distance").value);
  if (isNaN(maxDistance) || maxDistance <= 0) {
    alert("Masukkan jarak yang valid dalam kilometer.");
    return;
  }
  if (clickedCoordinates) {
    drawCircle(clickedCoordinates, maxDistance);  // Gambar lingkaran pada peta
    fetchRoads(clickedCoordinates[0], clickedCoordinates[1], maxDistance)  // Panggil fungsi untuk mencari jalan
      .then((roads) => {
        if (roads) {
          console.log("Data jalan terambil:", roads);
          // Lakukan sesuatu dengan data jalan yang diterima, seperti menampilkan pada peta atau UI
        }
      });
  }
});

// Menangani pengiriman form pencarian
document.getElementById("search-titik-pengguna").addEventListener("submit", (event) => {
  event.preventDefault();

  // Ambil nilai input pengguna untuk latitude dan longitude
  const latitude = parseFloat(document.getElementById("latitude").value);
  const longitude = parseFloat(document.getElementById("longitude").value);

  // Validasi input
  if (isNaN(latitude) || isNaN(longitude)) {
    alert("Masukkan latitude dan longitude yang valid.");
    return;
  }

  const userCoords = [longitude, latitude]; // Koordinat dari form input

  // Menambahkan marker di titik pengguna
  updateMarker(userCoords);

  // Gambar garis dari titik pengguna ke Logic Coffee
  drawLine(userCoords);

  // Hitung jarak antara pengguna dan Logic Coffee
  const distance = calculateDistance(userCoords, logicCoffeeCoords);
  const maxDistance = parseFloat(document.getElementById("max-distance").value);

  // Periksa apakah jarak lebih dari radius maksimum
  if (distance > maxDistance) {
    alert("Peringatan: Anda terlalu jauh dari Logic Coffee! Jarak Anda: " + distance.toFixed(2) + " km");
  }
});


// Menampilkan peta saat halaman selesai dimuat
window.addEventListener("DOMContentLoaded", () => {
  displayMap();
});
