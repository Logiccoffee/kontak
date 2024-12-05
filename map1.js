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

const logicCoffeeCoords = [107.57504888132391, -6.874693043534695]; // Logic Coffee
const attributions =
  '<a href="https://petapedia.github.io/" target="_blank">&copy; PetaPedia Indonesia</a>';

const basemap = new TileLayer({
  source: new OSM({ attributions }),
});

const mapView = new View({
  center: fromLonLat(logicCoffeeCoords),
  zoom: 14,
});

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

const routeLayer = new VectorLayer({
  source: new VectorSource(),
  style: new Style({
    stroke: new Stroke({
      color: "green",
      width: 3,
    }),
  }),
});

const map = new Map({
  target: "map",
  layers: [basemap, markerLayer, circleLayer, routeLayer],
  view: mapView,
});

// Fungsi untuk menambahkan marker
function addMarker(coords, iconUrl, title = "") {
  const marker = new Feature({
    geometry: new Point(fromLonLat(coords)),
  });
  marker.setStyle(
    new Style({
      image: new Icon({
        src: iconUrl,
        scale: 0.07,
      }),
      text: title
        ? new Text({
            text: title,
            offsetY: -25,
            fill: new Fill({ color: "black" }),
          })
        : null,
    })
  );
  markerLayer.getSource().addFeature(marker);
}

// Tambahkan marker Logic Coffee
addMarker(logicCoffeeCoords, "https://cdn-icons-png.flaticon.com/512/684/684908.png", "Logic Coffee");

// Fungsi untuk menggambar lingkaran radius
function drawCircle(coords, radius) {
  const circleFeature = new Feature({
    geometry: new Circle(fromLonLat(coords), radius * 1000), // Radius dalam meter
  });

  circleLayer.getSource().clear();
  circleLayer.getSource().addFeature(circleFeature);
}

// Fungsi untuk menggambar rute
function drawRoute(routeCoords) {
  const routeFeature = new Feature({
    geometry: new LineString(routeCoords),
  });

  routeLayer.getSource().clear();
  routeLayer.getSource().addFeature(routeFeature);
}

// Fungsi untuk mendapatkan koordinat berdasarkan region
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

// Fungsi untuk mendapatkan rute dari OpenRouteService
async function getRoute(startCoords, endCoords) {
  const apiKey = "API_KEY_OPENROUTESERVICE"; // Ganti dengan API key OpenRouteService milikmu
  const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${startCoords[0]},${startCoords[1]}&end=${endCoords[0]},${endCoords[1]}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.routes || data.routes.length === 0) {
      alert("Rute tidak ditemukan.");
      return null;
    }

    const coords = data.routes[0].geometry.coordinates;
    return coords.map(([lon, lat]) => fromLonLat([lon, lat]));
  } catch (error) {
    alert("Terjadi kesalahan saat mengambil rute.");
    console.error(error);
    return null;
  }
}

// Handle form Max Distance
document.getElementById("max-distance-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const maxDistance = parseFloat(document.getElementById("max-distance").value);
  if (isNaN(maxDistance) || maxDistance <= 0) {
    alert("Masukkan jarak yang valid dalam kilometer.");
    return;
  }
  drawCircle(logicCoffeeCoords, maxDistance);
  alert(`Radius ${maxDistance} km diterapkan.`);
});

// Handle form Region
document.getElementById("region-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const region = document.getElementById("region").value;
  if (!region) {
    alert("Masukkan nama wilayah yang valid.");
    return;
  }

  const userCoords = await getCoordinates(region);
  if (!userCoords) return;

  // Tambahkan marker pengguna
  addMarker(userCoords, "https://cdn-icons-png.flaticon.com/512/483/483947.png", "Pengguna");

  // Dapatkan rute dari lokasi pengguna ke Logic Coffee
  const routeCoords = await getRoute(userCoords, logicCoffeeCoords);
  if (routeCoords) {
    drawRoute(routeCoords);

    // Zoom agar rute terlihat jelas
    const extent = routeLayer.getSource().getExtent();
    mapView.fit(extent, { padding: [50, 50, 50, 50] });
  }
});
