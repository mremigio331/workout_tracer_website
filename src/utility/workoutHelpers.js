import { decodePolyline } from "../utility/polyline";

// Returns stats per workout type for selected workouts
export function getWorkoutTypeStats(stravaWorkouts, includedIds) {
  if (!stravaWorkouts) return {};
  const stats = {};
  stravaWorkouts.forEach((w) => {
    if (!w.type) return;
    if (!includedIds.includes(w.id)) return;
    if (!stats[w.type]) {
      stats[w.type] = {
        totalDistance: 0,
        totalElevation: 0,
        totalKj: 0,
        count: 0,
      };
    }
    stats[w.type].totalDistance += w.distance || 0;
    stats[w.type].totalElevation += w.total_elevation_gain || 0;
    stats[w.type].totalKj += w.kilojoules || 0;
    stats[w.type].count += 1;
  });
  return stats;
}

// Returns all lat/lng points for selected workouts with geo
export function getHeatmapPoints(stravaWorkouts, includedIds) {
  if (!stravaWorkouts) return [];
  return stravaWorkouts
    .filter((w) => {
      if (includedIds.includes(w.id) && w.map && w.map.summary_polyline) {
        const points = decodePolyline(w.map.summary_polyline);
        return (
          points.length > 0 &&
          points.every(
            ([lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng),
          )
        );
      }
      return false;
    })
    .flatMap((w) => decodePolyline(w.map.summary_polyline));
}

// Returns all polylines for selected workouts with geo
export function getPolylines(stravaWorkouts, includedIds) {
  if (!stravaWorkouts) return [];
  return stravaWorkouts
    .filter((w) => {
      if (includedIds.includes(w.id) && w.map && w.map.summary_polyline) {
        const points = decodePolyline(w.map.summary_polyline);
        return (
          points.length > 0 &&
          points.every(
            ([lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng),
          )
        );
      }
      return false;
    })
    .map((w) => ({
      positions: decodePolyline(w.map.summary_polyline),
      type: w.type,
      id: w.id,
    }));
}

// Returns all unique workout types
export function getWorkoutTypes(stravaWorkouts) {
  if (!stravaWorkouts) return [];
  const types = new Set();
  stravaWorkouts.forEach((w) => {
    if (w.type) types.add(w.type);
  });
  return Array.from(types);
}

// Returns a mapping from type to array of workout IDs
export function getTypeToIds(stravaWorkouts) {
  if (!stravaWorkouts) return {};
  const map = {};
  stravaWorkouts.forEach((w) => {
    if (w.type) {
      if (!map[w.type]) map[w.type] = [];
      map[w.type].push(w.id);
    }
  });
  return map;
}

// Returns a mapping from type to boolean: are all of that type selected?
export function getTypeAllSelected(workoutTypes, typeToIds, includedIds) {
  const result = {};
  for (const type of workoutTypes) {
    const ids = typeToIds[type] || [];
    result[type] =
      ids.length > 0 && ids.every((id) => includedIds.includes(id));
  }
  return result;
}
