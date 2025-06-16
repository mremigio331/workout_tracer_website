import polyline from "@mapbox/polyline";

export const decodePolyline = (poly) => {
  try {
    return polyline.decode(poly).map(([lat, lng]) => [lat, lng]);
  } catch {
    return [];
  }
};
