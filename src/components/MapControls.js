import React from "react";
import { Button, Dropdown, Menu } from "antd";

/**
 * MapControls component for map view.
 * Renders map mode, tile layer, export, and quick selection dropdown.
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
}) => {
  // Dropdown menu for Quick Selections (types sorted alphabetically)
  const sortedTypes = [...workoutTypes].sort((a, b) => a.localeCompare(b));
  const quickSelectionsMenu = (
    <Menu>
      {sortedTypes.map((type) => {
        const allOfTypeSelected = typeAllSelected[type];
        return (
          <Menu.Item
            key={type}
            onClick={() =>
              allOfTypeSelected
                ? handleDeselectAllByType(type)
                : handleSelectAllByType(type)
            }
            style={{
              color: "#fff",
              background: workoutTypeColor(type),
              margin: 0,
            }}
          >
            {allOfTypeSelected ? `Deselect All ${type}` : `Select All ${type}`}
          </Menu.Item>
        );
      })}
      <Menu.Divider />
      <Menu.Item
        key="all"
        onClick={allSelected ? handleDeselectAll : handleSelectAll}
        style={{
          fontWeight: "bold",
        }}
      >
        {allSelected ? "Deselect All" : "Select All"}
      </Menu.Item>
    </Menu>
  );

  return (
    <div style={{ marginTop: 12 }}>
      <div
        style={{
          textAlign: "left",
          marginBottom: 8,
          display: "flex",
          gap: 12, // ensures equal spacing between all buttons/dropdowns
          flexWrap: "wrap",
        }}
      >
        <Button
          type={mapMode === "heat" ? "primary" : "default"}
          onClick={() => setMapMode("heat")}
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
        <Dropdown
          overlay={quickSelectionsMenu}
          placement="bottomLeft"
          trigger={["click"]}
        >
          <Button>Quick Selections</Button>
        </Dropdown>
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
      {/* Quick Selections Dropdown */}
    </div>
  );
};

export default MapControls;
