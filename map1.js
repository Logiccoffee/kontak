import Map from "https://cdn.skypack.dev/ol/Map.js";
import View from "https://cdn.skypack.dev/ol/View.js";
import TileLayer from "https://cdn.skypack.dev/ol/layer/Tile.js";
import OSM from "https://cdn.skypack.dev/ol/source/OSM.js";
import { fromLonLat, toLonLat } from "https://cdn.skypack.dev/ol/proj.js";
import VectorLayer from "https://cdn.skypack.dev/ol/layer/Vector.js";
import VectorSource from "https://cdn.skypack.dev/ol/source/Vector.js";
import Feature from "https://cdn.skypack.dev/ol/Feature.js";
import Point from "https://cdn.skypack.dev/ol/geom/Point.js";
import Style from "https://cdn.skypack.dev/ol/style/Style.js";
import Icon from "https://cdn.skypack.dev/ol/style/Icon.js";
import Stroke from "https://cdn.skypack.dev/ol/style/Stroke.js";
import Fill from "https://cdn.skypack.dev/ol/style/Fill.js";
import LineString from "https://cdn.skypack.dev/ol/geom/LineString.js";

// Logic Coffee coordinates
const logicCoffeeCoords = [107.57504888132391, -6.874693043534695];

// Base map layer
const basemap = new TileLayer({
  source: new OSM(),
});

// Map view
const mapView = new View({
  center: fromLonLat(logicCoffeeCoords),
  zoom: 18,
});

// Styles
const markerStyle = new Style({
  image: new Icon({
    src: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    scale: 0.07,
  }),
});

const routeStyle = new Style({
  stroke: new Stroke({
    color: "red",
    width: 3,
  }),
});

// Map and layers
const markerLayer = new VectorLayer({ source: new VectorSource() });
const routeLayer = new VectorLayer({ source: new VectorSource(), style: routeStyle });

const map = new Map({
  target: "map",
  layers: [basemap, markerLayer, routeLayer],
  view: mapView,
});

// Add a marker for Logic Coffee
const addMarker = (coords) => {
  const marker = new Feature({ geometry: new Point(fromLonLat(coords)) });
  marker.setStyle(markerStyle);
  markerLayer.getSource().addFeature(marker);
};

// Draw a route between two points
const drawRoute = (start, end) => {
  const routeFeature = new Feature({
    geometry: new LineString([fromLonLat(start), fromLonLat(end)]),
  });
  routeLayer.getSource().clear();
  routeLayer.getSource().addFeature(routeFeature);
};

// Get user coordinates via region input
const getCoordinates = async (region) => {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(region)}&format=json&limit=1`;
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
    alert("Gagal mendapatkan koordinat.");
    return null;
  }
};

// Max Distance form submission
document.getElementById("max-distance-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const maxDistance = parseFloat(document.getElementById("max-distance").value);
  if (isNaN(maxDistance) || maxDistance <= 0) {
    alert("Masukkan jarak valid (km).");
    return;
  }

  // Add circle around Logic Coffee (optional visual guide)
  alert(`Menampilkan lokasi dalam radius ${maxDistance} km dari Logic Coffee belum tersedia.`);
});

// Region form submission
document.getElementById("region-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const region = document.getElementById("region").value;
  if (!region) {
    alert("Masukkan nama wilayah yang valid.");
    return;
  }

  const userCoords = await getCoordinates(region);
  if (!userCoords) return;

  // Add user marker
  const userMarker = new Feature({ geometry: new Point(fromLonLat(userCoords)) });
  userMarker.setStyle(markerStyle);
  markerLayer.getSource().clear(); // Clear previous markers
  markerLayer.getSource().addFeature(userMarker);

  // Draw route to Logic Coffee
  drawRoute(userCoords, logicCoffeeCoords);

  // Zoom to fit both markers
  mapView.fit(new LineString([fromLonLat(userCoords), fromLonLat(logicCoffeeCoords)]).getExtent(), {
    padding: [50, 50, 50, 50],
  });

  alert(`Rute ditampilkan dari "${region}" ke Logic Coffee.`);
});

// Initialize map with Logic Coffee marker
addMarker(logicCoffeeCoords);
