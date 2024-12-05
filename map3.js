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

// Koordinat Logic Coffee (default)
const logicCoffeeCoords = [107.57504888132391, -6.874693043534695];
let clickedCoordinates = logicCoffeeCoords; // Default to Logic Coffee
let map;

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
    layers: [basemap, markerLayer, circleLayer],
    view: mapView,
  });

  // Menangani klik pada peta
  map.on("click", (event) => {
    const coords = toLonLat(event.coordinate);
    clickedCoordinates = coords; // Simpan koordinat yang diklik
    updateMarker(coords);
  });
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

// Fungsi untuk menggambar lingkaran pada peta
function drawCircle(coords, radius) {
  const circleFeature = new Feature({
    geometry: new Circle(fromLonLat(coords), radius * 1000), // Radius dalam meter
  });

  // Hapus lingkaran yang ada dan tambahkan lingkaran baru
  circleLayer.getSource().clear();
  circleLayer.getSource().addFeature(circleFeature);
}

// Fungsi untuk mendapatkan nilai cookie berdasarkan nama
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null; // Jika cookie tidak ditemukan
}

// Fungsi untuk mengirimkan permintaan ke backend
function searchRoads(maxDistance) {
  const token = getCookie("login"); // Ambil token dari cookie

  // Periksa apakah token tersedia
  if (!token) {
    alert("Token tidak ditemukan, silakan login.");
    return;
  }

  fetch("https://asia-southeast2-awangga.cloudfunctions.net/logiccoffee/data/roads", {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // Wajib ada
      "Login": token, // Token autentikasi
    },
    body: JSON.stringify({
      longitude: clickedCoordinates[0], // Longitude dari koordinat yang diklik
      latitude: clickedCoordinates[1],  // Latitude dari koordinat yang diklik
      maxDistance: maxDistance, // Jarak maksimal (dalam kilometer)
    }),
  })
    .then(response => {
      if (!response.ok) {
        throw new Error("Gagal mendapatkan data dari server.");
      }
      return response.json();
    })
    .then(data => {
      if (data && data.length > 0) {
        console.log("Jalan ditemukan:", data);
        alert(`Jalan ditemukan dalam radius ${maxDistance} km.`);
      } else {
        alert(`Tidak ada jalan ditemukan dalam radius ${maxDistance} km.`);
      }
    })
    .catch(error => {
      console.error("Gagal mendapatkan data jalan:", error);
      alert("Terjadi kesalahan saat mencari jalan.");
    });
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
    drawCircle(clickedCoordinates, maxDistance); // Gambar lingkaran pada peta
    searchRoads(maxDistance); // Panggil fungsi untuk mencari jalan
  }
});

// Inisialisasi peta
window.addEventListener("DOMContentLoaded", () => {
  displayMap();
});
