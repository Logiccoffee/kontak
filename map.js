import Map from "https://cdn.skypack.dev/ol/Map.js";
import View from "https://cdn.skypack.dev/ol/View.js";
import TileLayer from "https://cdn.skypack.dev/ol/layer/Tile.js";
import OSM from "https://cdn.skypack.dev/ol/source/OSM.js";
import { fromLonLat } from "https://cdn.skypack.dev/ol/proj.js";
import VectorLayer from "https://cdn.skypack.dev/ol/layer/Vector.js";
import VectorSource from "https://cdn.skypack.dev/ol/source/Vector.js";
import Feature from "https://cdn.skypack.dev/ol/Feature.js";
import Point from "https://cdn.skypack.dev/ol/geom/Point.js";
import Style from "https://cdn.skypack.dev/ol/style/Style.js";
import Icon from "https://cdn.skypack.dev/ol/style/Icon.js";

const attributions =
  '<a href="https://petapedia.github.io/" target="_blank">&copy; PetaPedia Indonesia</a>';

const logicCoffeeCoords = [107.57504888132391, -6.874693043534695]; // Longitude, Latitude

// Basemap layer
const basemap = new TileLayer({
  source: new OSM({ attributions: attributions }),
});

// Map view
const defaultstartmap = new View({
  center: fromLonLat(logicCoffeeCoords),
  zoom: 18,
});

// Marker feature
const marker = new Feature({
  geometry: new Point(fromLonLat(logicCoffeeCoords)),
});

// Marker style
marker.setStyle(
  new Style({
    image: new Icon({
      src: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
      scale: 0.07,
    }),
  })
);

// Marker layer
const markerLayer = new VectorLayer({
  source: new VectorSource({
    features: [marker],
  }),
});

// Display map function
function displayMap() {
  const map = new Map({
    target: "map",
    layers: [basemap, markerLayer],
    view: defaultstartmap,
  });
}

window.addEventListener("DOMContentLoaded", () => {
  displayMap();
});
