import React, { useContext, useState, useMemo, useEffect } from "react";
import {
  Button,
  Layout,
  Typography,
  Spin,
  Avatar,
  Select,
  DatePicker,
  Tabs,
} from "antd";
import {
  MapContainer,
  TileLayer,
  Polyline,
  useMap,
  ZoomControl,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import { useMediaQuery } from "react-responsive";
import html2canvas from "html2canvas";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import HeatmapLayer from "./HeatmapLayer";
import WorkoutStats from "./WorkoutStats";
import WorkoutCards from "./WorkoutCards";
import WorkoutDetailsModal from "./WorkoutDetailsModal";
import MapControls from "./MapControls";
import workoutTypeColor, {
  highlightedActivity,
} from "../utility/workoutTypeColor";
import { PAGE_SIZE, FALLBACK_CENTER } from "../config/mapConfig";
import {
  getWorkoutTypeStats,
  getHeatmapPoints,
  getPolylines,
  getWorkoutTypes,
  getTypeToIds,
  getTypeAllSelected,
} from "../utility/workoutHelpers";
import { NAVBAR_HEIGHT } from "../constants/ui";
import { decodePolyline } from "../utility/polyline";

const { Content } = Layout;
const { Title } = Typography;
const { RangePicker } = DatePicker;

// Helper component to sync map center with localStorage
const MapCenterSync = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
    // Save center to localStorage on moveend
    const onMove = () => {
      const c = map.getCenter();
      localStorage.setItem(
        "workoutTracerMapCenter",
        JSON.stringify([c.lat, c.lng]),
      );
    };
    map.on("moveend", onMove);
    return () => {
      map.off("moveend", onMove);
    };
  }, [center, map]);
  return null;
};

// Fit map to all polylines and allow centering on a specific workout
function FitMapToPolylines({ polylines, centerLatLng }) {
  const map = useMap();
  const [hasFit, setHasFit] = useState(false);

  useEffect(() => {
    if (polylines && polylines.length > 0) {
      const allPoints = polylines.flatMap((line) => line.positions);
      if (allPoints.length === 0) return;
      const bounds = allPoints.map(([lat, lng]) => [lat, lng]);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [polylines, map]);

  // Only center on a workout if centerLatLng is set, but do NOT refit bounds after
  useEffect(() => {
    if (
      centerLatLng &&
      Array.isArray(centerLatLng) &&
      centerLatLng.length === 2
    ) {
      map.setView(centerLatLng, 14); // adjust zoom as needed
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centerLatLng, map]);

  return null;
}

const WorkoutTracerDashboard = ({
  stravaProfile,
  stravaWorkouts,
  isProfileLoading,
  isWorkoutsLoading,
  headerFallback = "User's Workout Tracer",
  stravaId,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [mapMode, setMapMode] = useState("lines");
  const [includedIds, setIncludedIds] = useState([]);

  useEffect(() => {
    setCurrentPage(1);
    setIncludedIds(
      stravaWorkouts
        ? stravaWorkouts
            .filter((w) => w.map && w.map.summary_polyline)
            .map((w) => w.id)
        : [],
    );
  }, [stravaWorkouts]);

  const showWorkoutModal = (workout) => {
    setSelectedWorkout(workout);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedWorkout(null);
  };

  const sortedWorkouts = useMemo(() => {
    if (!stravaWorkouts) return [];
    return [...stravaWorkouts].sort((a, b) => {
      const aTime = a.start_date_local
        ? new Date(a.start_date_local).getTime()
        : 0;
      const bTime = b.start_date_local
        ? new Date(b.start_date_local).getTime()
        : 0;
      return bTime - aTime;
    });
  }, [stravaWorkouts]);

  const [searchType, setSearchType] = useState(undefined);
  const [searchDateRange, setSearchDateRange] = useState([null, null]);
  const [searchName, setSearchName] = useState("");

  const filteredWorkouts = useMemo(() => {
    if (!sortedWorkouts) return [];
    const [startDate, endDate] = Array.isArray(searchDateRange)
      ? searchDateRange
      : [null, null];
    return sortedWorkouts.filter((w) => {
      if (searchType && w.type !== searchType) return false;
      if (startDate && endDate && w.start_date_local) {
        const workoutDate = new Date(w.start_date_local);
        const start = startDate.startOf
          ? startDate.startOf("day").toDate()
          : new Date(startDate);
        const end = endDate.endOf
          ? endDate.endOf("day").toDate()
          : new Date(endDate);
        if (workoutDate < start || workoutDate > end) return false;
      }
      if (
        searchName &&
        !(w.name || "").toLowerCase().includes(searchName.toLowerCase())
      )
        return false;
      return true;
    });
  }, [sortedWorkouts, searchType, searchDateRange, searchName]);

  useEffect(() => {
    setIncludedIds(filteredWorkouts.map((w) => w.id));
  }, [searchType, searchDateRange, sortedWorkouts]);

  const totalPages = filteredWorkouts
    ? Math.ceil(filteredWorkouts.length / PAGE_SIZE)
    : 1;
  const paginatedWorkouts = filteredWorkouts
    ? filteredWorkouts.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
      )
    : [];

  const handleCheckboxChange = useMemo(
    () => (workoutId, checked) => {
      setIncludedIds((prev) =>
        checked ? [...prev, workoutId] : prev.filter((id) => id !== workoutId),
      );
    },
    [],
  );

  const allWorkoutIds = useMemo(() => {
    if (!stravaWorkouts) return [];
    return stravaWorkouts.map((w) => w.id);
  }, [stravaWorkouts]);

  const allSelected = useMemo(() => {
    return (
      allWorkoutIds.length > 0 &&
      includedIds.length === allWorkoutIds.length &&
      allWorkoutIds.every((id) => includedIds.includes(id))
    );
  }, [allWorkoutIds, includedIds]);

  const handleSelectAll = () => {
    setIncludedIds(allWorkoutIds);
  };

  const handleDeselectAll = () => {
    setIncludedIds([]);
  };

  const workoutTypes = useMemo(
    () => getWorkoutTypes(stravaWorkouts),
    [stravaWorkouts],
  );

  const typeToIds = useMemo(
    () => getTypeToIds(stravaWorkouts),
    [stravaWorkouts],
  );

  const typeAllSelected = useMemo(
    () => getTypeAllSelected(workoutTypes, typeToIds, includedIds),
    [workoutTypes, typeToIds, includedIds],
  );

  const handleSelectAllByType = (type) => {
    const ids = typeToIds[type] || [];
    setIncludedIds((prev) => Array.from(new Set([...prev, ...ids])));
  };

  const handleDeselectAllByType = (type) => {
    const ids = typeToIds[type] || [];
    setIncludedIds((prev) => prev.filter((id) => !ids.includes(id)));
  };

  const workoutTypeStats = useMemo(
    () => getWorkoutTypeStats(stravaWorkouts, includedIds),
    [stravaWorkouts, includedIds],
  );

  const heatmapPoints = useMemo(
    () => getHeatmapPoints(stravaWorkouts, includedIds),
    [stravaWorkouts, includedIds],
  );

  const polylines = useMemo(
    () => getPolylines(stravaWorkouts, includedIds),
    [stravaWorkouts, includedIds],
  );

  // Memo for last activity center (latest workout with GPS location)
  const lastActivityCenter = useMemo(() => {
    if (!stravaWorkouts || includedIds.length === 0) return FALLBACK_CENTER;
    const sorted = [...stravaWorkouts]
      .filter(
        (w) => includedIds.includes(w.id) && w.map && w.map.summary_polyline,
      )
      .sort((a, b) => {
        const aTime = a.start_date_local
          ? new Date(a.start_date_local).getTime()
          : 0;
        const bTime = b.start_date_local
          ? new Date(b.start_date_local).getTime()
          : 0;
        return bTime - aTime;
      });
    if (!sorted.length) return FALLBACK_CENTER;
    const polyline = sorted[0].map.summary_polyline;
    if (!polyline) return FALLBACK_CENTER;
    const points = decodePolyline(polyline);
    return points.length ? points[0] : FALLBACK_CENTER;
  }, [stravaWorkouts, includedIds]);

  // NYC fallback center
  const NYC_CENTER = [40.7128, -74.006];

  const initialMapCenter = useMemo(() => {
    const stored = localStorage.getItem("workoutTracerMapCenter");
    if (stored) {
      try {
        const arr = JSON.parse(stored);
        if (
          Array.isArray(arr) &&
          arr.length === 2 &&
          arr.every(Number.isFinite)
        ) {
          return arr;
        }
      } catch {}
    }
    return NYC_CENTER;
  }, []);

  const [showTileLayer, setShowTileLayer] = useState(true);
  const isLoading = isWorkoutsLoading || !stravaWorkouts;
  const [centerWorkoutLatLng, setCenterWorkoutLatLng] = useState(null);

  const handleCenterOnWorkout = (workout) => {
    if (workout.map && workout.map.summary_polyline) {
      const decodePolyline = require("../utility/polyline").decodePolyline;
      const points = decodePolyline(workout.map.summary_polyline);
      if (points && points.length > 0) {
        setCenterWorkoutLatLng(points[0]);
        setTimeout(() => setCenterWorkoutLatLng(null), 1000);
      }
    }
  };

  const [collapsed, setCollapsed] = useState(false);
  const [highlightedActivities, setHighlightedActivities] = useState([]);

  // Responsive: detect if mobile (width <= 768px)
  const isMobile = useMediaQuery({ maxWidth: 768 });
  // Remove old showMobileSection and showMobileControls
  // Add a single state for cycling mobile panels: "map", "controls", "stats", "workouts"
  const MOBILE_PANELS = [
    { key: "map", label: "Map" },
    { key: "controls", label: "Controls" },
    { key: "stats", label: "Stats" },
    { key: "workouts", label: "Workouts" },
  ];
  const [mobilePanel, setMobilePanel] = useState("map");

  // Dynamically get window size for mobile layout
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 375,
    height: typeof window !== "undefined" ? window.innerHeight : 667,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const mapExportRef = React.useRef(null);

  // Export map logic (same as HomeAuthenticated)
  const handleExportMap = async () => {
    if (!mapExportRef.current) return;
    const controls = mapExportRef.current.querySelectorAll(
      ".leaflet-control, .map-controls, .ant-btn, .ant-select, .ant-picker",
    );
    const prevDisplay = [];
    controls.forEach((el) => {
      prevDisplay.push(el.style.display);
      el.style.display = "none";
    });
    await new Promise((resolve) => setTimeout(resolve, 100));
    window.dispatchEvent(new Event("resize"));
    await new Promise((resolve) => setTimeout(resolve, 100));
    const leafletMap = mapExportRef.current.querySelector(".leaflet-container");
    const mapNode = leafletMap || mapExportRef.current;
    html2canvas(mapNode, {
      useCORS: true,
      backgroundColor: null,
      logging: false,
      scale: 2,
      width: mapNode.offsetWidth,
      height: mapNode.offsetHeight,
      windowWidth: mapNode.offsetWidth,
      windowHeight: mapNode.offsetHeight,
    }).then((canvas) => {
      controls.forEach((el, idx) => {
        el.style.display = prevDisplay[idx];
      });
      const link = document.createElement("a");
      link.download = "workout-map.png";
      link.href = canvas.toDataURL();
      link.click();
    });
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Render the navbar outside of Content, so it always appears at the top */}
      {/* Assume your Navbar component is imported and used at the App level or here if needed */}
      <Content style={{ padding: 0, marginTop: NAVBAR_HEIGHT }}>
        {isMobile ? (
          // MOBILE LAYOUT
          <div
            style={{
              width: windowSize.width,
              height: windowSize.height - NAVBAR_HEIGHT,
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Tabs at the top, right under the navbar */}
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                zIndex: 1001,
                background: "#fff",
                borderBottom: "1px solid #eee",
                width: windowSize.width,
              }}
            >
              <Tabs
                activeKey={mobilePanel}
                onChange={setMobilePanel}
                centered
                tabBarGutter={8}
                items={MOBILE_PANELS.map((panel) => ({
                  key: panel.key,
                  label: panel.label,
                }))}
              />
            </div>

            {/* Panels */}
            <div
              style={{
                width: windowSize.width,
                height: windowSize.height - NAVBAR_HEIGHT - 48, // 48px is approx Tabs height
                position: "absolute",
                top: 48,
                left: 0,
                overflowY: "auto", // <-- allow vertical scrolling
                WebkitOverflowScrolling: "touch", // for iOS smooth scroll
              }}
            >
              {mobilePanel === "map" && (
                <div
                  style={{
                    width: "100vw",
                    height: "100vh",
                    position: "relative",
                    marginTop: 0,
                  }}
                >
                  {isLoading ? (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#fff",
                      }}
                    >
                      <Spin size="large" tip="Loading map data..." />
                    </div>
                  ) : (
                    <MapContainer
                      style={{
                        height: "100%",
                        width: "100vw",
                      }}
                      center={initialMapCenter}
                      zoom={12}
                      scrollWheelZoom={true}
                      zoomControl={false}
                    >
                      <ZoomControl position="bottomright" />
                      <MapCenterSync center={initialMapCenter} />
                      <FitMapToPolylines
                        polylines={polylines}
                        centerLatLng={centerWorkoutLatLng}
                      />
                      {showTileLayer && (
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution="&copy; OpenStreetMap contributors"
                        />
                      )}
                      {mapMode === "heat" && heatmapPoints.length > 0 && (
                        <HeatmapLayer points={heatmapPoints} />
                      )}
                      {mapMode === "lines" &&
                        polylines.map((line, idx) =>
                          line.positions.length > 0 ? (
                            <Polyline
                              key={line.id || idx}
                              positions={line.positions}
                              color={
                                highlightedActivities.includes(line.id)
                                  ? highlightedActivity
                                  : workoutTypeColor(line.type)
                              }
                              weight={3}
                              highlightedActivities={highlightedActivities}
                              setHighlightedActivities={
                                setHighlightedActivities
                              }
                            />
                          ) : null,
                        )}
                    </MapContainer>
                  )}
                </div>
              )}

              {mobilePanel === "controls" && (
                <div
                  style={{
                    width: "100vw",
                    height: "100vh",
                    background: "#fff",
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    paddingBottom: 56, // leave space for tabs
                  }}
                >
                  <div style={{ padding: 16 }}>
                    {/* Controls content (filters, map controls, etc) */}
                    <div
                      style={{
                        margin: "16px 0",
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 8,
                      }}
                    >
                      <Select
                        allowClear
                        placeholder="Filter by Type"
                        style={{ minWidth: 120, marginRight: 8 }}
                        value={searchType}
                        onChange={setSearchType}
                        options={workoutTypes.map((type) => ({
                          value: type,
                          label: type,
                        }))}
                      />
                      <RangePicker
                        style={{ minWidth: 160, marginRight: 8 }}
                        value={searchDateRange}
                        onChange={setSearchDateRange}
                        allowEmpty={[true, true]}
                      />
                    </div>
                    <div
                      style={{
                        padding: 8,
                        background: "#fff",
                        borderRadius: 8,
                        marginBottom: 8,
                      }}
                    >
                      <MapControls
                        mapMode={mapMode}
                        setMapMode={setMapMode}
                        isMobile={isMobile}
                        showTileLayer={showTileLayer}
                        setShowTileLayer={setShowTileLayer}
                        handleExportMap={handleExportMap}
                        allSelected={allSelected}
                        handleSelectAll={handleSelectAll}
                        handleDeselectAll={handleDeselectAll}
                        workoutTypes={workoutTypes}
                        typeAllSelected={typeAllSelected}
                        handleSelectAllByType={handleSelectAllByType}
                        handleDeselectAllByType={handleDeselectAllByType}
                        workoutTypeColor={workoutTypeColor}
                        highlightedActivities={highlightedActivities}
                      />
                    </div>
                  </div>
                </div>
              )}

              {mobilePanel === "stats" && (
                <div style={{ padding: 8, paddingBottom: 56 }}>
                  {isLoading ? (
                    <div style={{ textAlign: "center", margin: "32px 0" }}>
                      <Spin size="large" tip="Loading workouts..." />
                    </div>
                  ) : (
                    <WorkoutStats
                      isStravaWorkoutFetching={isWorkoutsLoading}
                      stravaWorkouts={stravaWorkouts}
                      workoutTypeStats={workoutTypeStats}
                      workoutTypeColor={workoutTypeColor}
                    />
                  )}
                </div>
              )}

              {mobilePanel === "workouts" && (
                <div style={{ padding: 8, paddingBottom: 56 }}>
                  {isLoading ? (
                    <div style={{ textAlign: "center", margin: "32px 0" }}>
                      <Spin size="large" tip="Loading workouts..." />
                    </div>
                  ) : (
                    <>
                      <WorkoutCards
                        isStravaWorkoutFetching={isWorkoutsLoading}
                        stravaWorkouts={stravaWorkouts}
                        filteredWorkouts={filteredWorkouts}
                        paginatedWorkouts={paginatedWorkouts}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        totalPages={totalPages}
                        includedIds={includedIds}
                        handleCheckboxChange={handleCheckboxChange}
                        showWorkoutModal={showWorkoutModal}
                        modalVisible={modalVisible}
                        selectedWorkout={selectedWorkout}
                        handleModalClose={handleModalClose}
                        centerOnWorkout={handleCenterOnWorkout}
                        highlightedActivities={highlightedActivities}
                        setHighlightedActivities={setHighlightedActivities}
                      />
                    </>
                  )}
                  <WorkoutDetailsModal
                    open={modalVisible}
                    workout={selectedWorkout}
                    onCancel={handleModalClose}
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          // DESKTOP LAYOUT
          <div
            style={{
              position: "relative",
              width: "100vw",
              height: "100vh",
              overflow: "hidden",
            }}
          >
            {/* Fullscreen Map */}
            <div
              ref={mapExportRef}
              style={{
                position: "absolute",
                top: NAVBAR_HEIGHT,
                left: 0,
                width: "100vw",
                height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
                zIndex: 1,
              }}
            >
              {isLoading ? (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#fff",
                  }}
                >
                  <Spin size="large" tip="Loading map data..." />
                </div>
              ) : (
                <MapContainer
                  style={{
                    height: "100%",
                    width: "100%",
                  }}
                  center={initialMapCenter}
                  zoom={12}
                  scrollWheelZoom={true}
                  zoomControl={false}
                >
                  <ZoomControl position="bottomright" />
                  <MapCenterSync center={initialMapCenter} />
                  <FitMapToPolylines
                    polylines={polylines}
                    centerLatLng={centerWorkoutLatLng}
                  />
                  {showTileLayer && (
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution="&copy; OpenStreetMap contributors"
                    />
                  )}
                  {mapMode === "heat" && heatmapPoints.length > 0 && (
                    <HeatmapLayer points={heatmapPoints} />
                  )}
                  {mapMode === "lines" &&
                    polylines.map((line, idx) =>
                      line.positions.length > 0 ? (
                        <Polyline
                          key={line.id || idx}
                          positions={line.positions}
                          color={
                            highlightedActivities.includes(line.id)
                              ? highlightedActivity
                              : workoutTypeColor(line.type)
                          }
                          weight={3}
                          highlightedActivities={highlightedActivities}
                          setHighlightedActivities={setHighlightedActivities}
                        />
                      ) : null,
                    )}
                </MapContainer>
              )}
            </div>
            {/* Sidebar overlays the map */}
            <div
              style={{
                position: "absolute",
                top: NAVBAR_HEIGHT,
                right: 0,
                width: collapsed ? 0 : "30vw",
                minWidth: collapsed ? 0 : "320px",
                maxWidth: collapsed ? 0 : "30vw",
                height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
                overflowY: collapsed ? "hidden" : "auto",
                background: "#fafcff",
                padding: collapsed ? 0 : 32,
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                transition: "all 0.3s",
                zIndex: 2,
                pointerEvents: "auto",
              }}
            >
              {/* Collapse/Expand Button */}
              <Button
                type="text"
                onClick={() => setCollapsed((c) => !c)}
                style={{
                  position: "absolute",
                  left: collapsed ? 0 : -24,
                  top: 16,
                  zIndex: 100,
                  background: "#fff",
                  border: "1px solid #eee",
                  borderRadius: "0 4px 4px 0",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  padding: 4,
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "auto",
                }}
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              />
              {collapsed && (
                <Button
                  type="primary"
                  shape="circle"
                  icon={<MenuUnfoldOutlined />}
                  onClick={() => setCollapsed(false)}
                  style={{
                    position: "fixed",
                    right: 0,
                    top: 80,
                    zIndex: 2000,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  }}
                />
              )}
              {!collapsed && (
                <>
                  <div
                    style={{
                      textAlign: "left",
                      marginTop: "32px",
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                    }}
                  >
                    {isProfileLoading ? (
                      <span style={{ fontSize: 22 }}>
                        Loading user {stravaId}...
                      </span>
                    ) : stravaProfile ? (
                      <>
                        <Avatar
                          src={
                            stravaProfile.profile_medium ||
                            stravaProfile.profile
                          }
                          size={48}
                          style={{ marginRight: 12 }}
                        >
                          {stravaProfile.firstname
                            ? stravaProfile.firstname[0]
                            : stravaProfile.lastname
                              ? stravaProfile.lastname[0]
                              : "?"}
                        </Avatar>
                        <div>
                          <Title level={2} style={{ margin: 0 }}>
                            {stravaProfile.firstname || ""}{" "}
                            {stravaProfile.lastname || ""}'s Workout Tracer
                          </Title>
                          {stravaProfile.city && (
                            <div style={{ color: "#888", fontSize: 16 }}>
                              {stravaProfile.city}
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <Title level={2} style={{ margin: 0 }}>
                        {headerFallback}
                      </Title>
                    )}
                  </div>
                  {/* Search/Filter Bar */}
                  <div
                    style={{
                      margin: "32px 0 16px 0",
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 16,
                    }}
                  >
                    <Select
                      allowClear
                      placeholder="Filter by Type"
                      style={{ width: "100%" }}
                      value={searchType}
                      onChange={setSearchType}
                      options={workoutTypes.map((type) => ({
                        value: type,
                        label: type,
                      }))}
                    />
                    <RangePicker
                      style={{ width: "100%" }}
                      value={searchDateRange}
                      onChange={setSearchDateRange}
                      allowEmpty={[true, true]}
                    />
                  </div>
                  <div
                    style={{
                      padding: 16,
                      borderTop: "1px solid #f0f0f0",
                      background: "#fff",
                    }}
                  >
                    <MapControls
                      mapMode={mapMode}
                      setMapMode={setMapMode}
                      isMobile={isMobile}
                      showTileLayer={showTileLayer}
                      setShowTileLayer={setShowTileLayer}
                      handleExportMap={handleExportMap}
                      allSelected={allSelected}
                      handleSelectAll={handleSelectAll}
                      handleDeselectAll={handleDeselectAll}
                      workoutTypes={workoutTypes}
                      typeAllSelected={typeAllSelected}
                      handleSelectAllByType={handleSelectAllByType}
                      handleDeselectAllByType={handleDeselectAllByType}
                      workoutTypeColor={workoutTypeColor}
                    />
                  </div>
                  {isLoading ? (
                    <div style={{ textAlign: "center", margin: "32px 0" }}>
                      <Spin size="large" tip="Loading workouts..." />
                    </div>
                  ) : (
                    <>
                      <WorkoutStats
                        isStravaWorkoutFetching={isWorkoutsLoading}
                        stravaWorkouts={stravaWorkouts}
                        workoutTypeStats={workoutTypeStats}
                        workoutTypeColor={workoutTypeColor}
                      />
                      <WorkoutCards
                        isStravaWorkoutFetching={isWorkoutsLoading}
                        stravaWorkouts={stravaWorkouts}
                        filteredWorkouts={filteredWorkouts}
                        paginatedWorkouts={paginatedWorkouts}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        totalPages={totalPages}
                        includedIds={includedIds}
                        handleCheckboxChange={handleCheckboxChange}
                        showWorkoutModal={showWorkoutModal}
                        modalVisible={modalVisible}
                        selectedWorkout={selectedWorkout}
                        handleModalClose={handleModalClose}
                        centerOnWorkout={handleCenterOnWorkout}
                        highlightedActivities={highlightedActivities}
                        setHighlightedActivities={setHighlightedActivities}
                      />
                    </>
                  )}
                  <WorkoutDetailsModal
                    open={modalVisible}
                    workout={selectedWorkout}
                    onCancel={handleModalClose}
                  />
                </>
              )}
            </div>
          </div>
        )}
      </Content>
    </Layout>
  );
};

export default WorkoutTracerDashboard;
