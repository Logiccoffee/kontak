import Map from "https://cdn.skypack.dev/ol/Map.js";
import View from "https://cdn.skypack.dev/ol/View.js";
import TileLayer from "https://cdn.skypack.dev/ol/layer/Tile.js";
import OSM from "https://cdn.skypack.dev/ol/source/OSM.js";
import { fromLonLat } from "https://cdn.skypack.dev/ol/proj.js";
import VectorLayer from "https://cdn.skypack.dev/ol/layer/Vector.js";
import VectorSource from "https://cdn.skypack.dev/ol/source/Vector.js";
import Feature from "https://cdn.skypack.dev/ol/Feature.js";
import Polygon from "https://cdn.skypack.dev/ol/geom/Polygon.js";
import Style from "https://cdn.skypack.dev/ol/style/Style.js";
import Stroke from "https://cdn.skypack.dev/ol/style/Stroke.js";
import Fill from "https://cdn.skypack.dev/ol/style/Fill.js";

const logicCoffeeCoords = [107.57504888132391, -6.874693043534695]; // Longitude, Latitude

// Basemap layer
const basemap = new TileLayer({
  source: new OSM(),
});

// Map view
const defaultstartmap = new View({
  center: fromLonLat(logicCoffeeCoords),
  zoom: 13,
});

// Region Layer
const regionLayer = new VectorLayer({
  source: new VectorSource(),
  style: new Style({
    stroke: new Stroke({
      color: "blue",
      width: 3,
    }),
    fill: new Fill({
      color: "rgba(0, 0, 255, 0.1)",
    }),
  }),
});

// Map initialization
function displayMap() {
  const map = new Map({
    target: "map",
    layers: [basemap, regionLayer],
    view: defaultstartmap,
  });

  return map;
}

// Regions data
const regions = {
  Bandung: [
    [107.55, -6.85],
    [107.65, -6.85],
    [107.65, -6.90],
    [107.55, -6.90],
    [107.55, -6.85],
  ],
};

// Function to draw region
function drawRegion(regionName) {
  const coordinates = regions[regionName];
  if (coordinates) {
    const polygon = new Polygon([coordinates.map(fromLonLat)]);
    const regionFeature = new Feature({ geometry: polygon });
    regionLayer.getSource().clear(); // Clear previous features
    regionLayer.getSource().addFeature(regionFeature);
    alert(`Region ${regionName} has been displayed.`);
  } else {
    alert(`Region ${regionName} not found.`);
  }
}

// Add event listener for the search form
window.addEventListener("DOMContentLoaded", () => {
  const map = displayMap();

  const searchForm = document.getElementById("search-form");
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const regionName = document.getElementById("region").value.trim();
    drawRegion(regionName);
  });
});
