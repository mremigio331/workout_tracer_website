import React from "react";
import { Button } from "antd";

/**
 * MapControls component for map view.
 * Renders map mode, tile layer, export, and workout type selection buttons.
 *
 * @param {Object} props
 * @param {"heat"|"lines"} props.mapMode
 * @param {Function} props.setMapMode
 * @param {boolean} props.isMobile
 * @param {boolean} props.showTileLayer
 * @param {Function} props.setShowTileLayer
 * @param {Function} props.handleExportMap
 * @param {boolean} props.allSelected
 * @param {Function} props.handleSelectAll
 * @param {Function} props.handleDeselectAll
 * @param {Array<string>} props.workoutTypes
 * @param {Object} props.typeAllSelected
 * @param {Function} props.handleSelectAllByType
 * @param {Function} props.handleDeselectAllByType
 * @param {Function} props.workoutTypeColor
 */
const MapControls = ({
  mapMode,
  setMapMode,
  isMobile,
  showTileLayer,
  setShowTileLayer,
  handleExportMap,
  allSelected,
  handleSelectAll,
  handleDeselectAll,
  workoutTypes,
  typeAllSelected,
  handleSelectAllByType,
  handleDeselectAllByType,
  workoutTypeColor,
}) => (
  <div style={{ marginTop: 12 }}>
    <div style={{ textAlign: "left", marginBottom: 8 }}>
      <Button
        type={mapMode === "heat" ? "primary" : "default"}
        onClick={() => setMapMode("heat")}
        style={{ marginRight: 8 }}
        size={isMobile ? "small" : "middle"}
      >
        Heatmap
      </Button>
      <Button
        type={mapMode === "lines" ? "primary" : "default"}
        onClick={() => setMapMode("lines")}
        size={isMobile ? "small" : "middle"}
      >
        Lines
      </Button>
    </div>
    <div style={{ textAlign: "left", marginBottom: 8 }}>
      <Button
        onClick={() => setShowTileLayer((v) => !v)}
        style={{ marginRight: 8 }}
      >
        {showTileLayer ? "Hide Background Map" : "Show Background Map"}
      </Button>
      <Button onClick={handleExportMap} style={{ marginRight: 8 }}>
        Export Map as PNG
      </Button>
    </div>
    <div style={{ textAlign: "left" }}>
      <Button
        onClick={allSelected ? handleDeselectAll : handleSelectAll}
        style={{ marginRight: 8 }}
      >
        {allSelected ? "Deselect All" : "Select All"}
      </Button>
      {workoutTypes.map((type) => {
        const allOfTypeSelected = typeAllSelected[type];
        return (
          <Button
            key={type}
            onClick={() =>
              allOfTypeSelected
                ? handleDeselectAllByType(type)
                : handleSelectAllByType(type)
            }
            style={{
              marginRight: 8,
              background: workoutTypeColor(type),
              color: "#fff",
              border: "none",
            }}
          >
            {allOfTypeSelected ? `Deselect All ${type}` : `Select All ${type}`}
          </Button>
        );
      })}
    </div>
  </div>
);

export default MapControls;
