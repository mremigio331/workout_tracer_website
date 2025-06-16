import { useEffect } from "react";
import { useMap } from "react-leaflet";

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
