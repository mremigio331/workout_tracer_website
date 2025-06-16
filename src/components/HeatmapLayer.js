import { useEffect } from "react";
import { useMap } from "react-leaflet";

/**
 * HeatmapLayer component for react-leaflet.
 * Adds a Leaflet.heat heatmap layer to the map using the provided points.
 *
 * @param {Object} props
 * @param {Array<Array<number>>} props.points - Array of [lat, lng] points for the heatmap.
 * @returns {null}
 */
const HeatmapLayer = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (!window.L || !points.length) return;
    if (map._heatLayer) {
      map.removeLayer(map._heatLayer);
      map._heatLayer = null;
    }
    const heat = window.L.heatLayer(points, {
      radius: 10,
      blur: 15,
      maxZoom: 17,
    });
    heat.addTo(map);
    map._heatLayer = heat;
    return () => {
      if (map._heatLayer) {
        map.removeLayer(map._heatLayer);
        map._heatLayer = null;
      }
    };
  }, [points, map]);
  return null;
};

export default HeatmapLayer;
