import React, { useContext, useState, useMemo, useEffect } from "react";
import {
  Button,
  Layout,
  Typography,
  Card,
  Row,
  Col,
  Modal,
  Descriptions,
  Checkbox,
  Input,
  Select,
  DatePicker,
} from "antd";
import { useNavigate } from "react-router-dom";
import { UserAuthenticationContext } from "../../provider/UserAuthenticationProvider";
import { useUserProfile } from "../../provider/UserProfileProvider";
import { useStravaWorkouts } from "../../provider/StravaWorkoutsProvider";
import { MapContainer, TileLayer, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import { useMediaQuery } from "react-responsive";
import html2canvas from "html2canvas";

import HeatmapLayer from "../../components/HeatmapLayer";
import { decodePolyline } from "../../utils/polyline";
import workoutTypeColor from "../../utils/workoutTypeColor";
import {
  PAGE_SIZE,
  MAP_HEIGHT_DESKTOP,
  MAP_HEIGHT_MOBILE,
  FALLBACK_CENTER,
} from "../../config/mapConfig";

const { Content } = Layout;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const HomeAuthenticated = () => {
  const navigate = useNavigate();
  const { user, name } = useContext(UserAuthenticationContext);
  const { userProfile, isUserFetching } = useUserProfile();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [mapMode, setMapMode] = useState("heat"); // "heat" or "lines"

  // Use the new provider for workouts
  const {
    stravaWorkouts,
    isStravaWorkoutFetching,
    isStravaWorkoutError,
    refetchStravaWorkouts,
  } = useStravaWorkouts();

  // Track which workouts are included in the heatmap
  const [includedIds, setIncludedIds] = useState([]);

  // Reset to page 1 and includedIds when workouts change
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

  // Sort workouts by start_date_local (descending, most recent first)
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

  // Search/filter state
  const [searchType, setSearchType] = useState(undefined);
  const [searchDateRange, setSearchDateRange] = useState([null, null]);

  // Filtered workouts for display and selection
  const filteredWorkouts = useMemo(() => {
    if (!sortedWorkouts) return [];
    // Defensive: ensure searchDateRange is always an array
    const [startDate, endDate] = Array.isArray(searchDateRange)
      ? searchDateRange
      : [null, null];
    return sortedWorkouts.filter((w) => {
      // Filter by type
      if (searchType && w.type !== searchType) return false;
      // Filter by date range
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
      return true;
    });
  }, [sortedWorkouts, searchType, searchDateRange]);

  // When filters change, update includedIds to match filteredWorkouts
  useEffect(() => {
    setIncludedIds(filteredWorkouts.map((w) => w.id));
  }, [searchType, searchDateRange, sortedWorkouts]); // update on filter change

  // Pagination logic (use filteredWorkouts instead of sortedWorkouts)
  const totalPages = filteredWorkouts
    ? Math.ceil(filteredWorkouts.length / PAGE_SIZE)
    : 1;
  const paginatedWorkouts = filteredWorkouts
    ? filteredWorkouts.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
      )
    : [];

  // Memoize the includedIds handler to prevent unnecessary rerenders
  const handleCheckboxChange = useMemo(
    () => (workoutId, checked) => {
      setIncludedIds((prev) =>
        checked ? [...prev, workoutId] : prev.filter((id) => id !== workoutId),
      );
    },
    [],
  );

  // Get all workout IDs (regardless of geo)
  const allWorkoutIds = useMemo(() => {
    if (!stravaWorkouts) return [];
    return stravaWorkouts.map((w) => w.id);
  }, [stravaWorkouts]);

  // Are all workouts currently selected?
  const allSelected = useMemo(() => {
    return (
      allWorkoutIds.length > 0 &&
      includedIds.length === allWorkoutIds.length &&
      allWorkoutIds.every((id) => includedIds.includes(id))
    );
  }, [allWorkoutIds, includedIds]);

  // Select all workouts (regardless of geo)
  const handleSelectAll = () => {
    setIncludedIds(allWorkoutIds);
  };

  // Deselect all
  const handleDeselectAll = () => {
    setIncludedIds([]);
  };

  // For a type: add all of that type to includedIds (union, no duplicates)
  const handleSelectAllByType = (type) => {
    const ids = typeToIds[type] || [];
    setIncludedIds((prev) => Array.from(new Set([...prev, ...ids])));
  };

  // For a type: remove all of that type from includedIds
  const handleDeselectAllByType = (type) => {
    const ids = typeToIds[type] || [];
    setIncludedIds((prev) => prev.filter((id) => !ids.includes(id)));
  };

  // Responsive: detect if mobile (width <= 768px)
  const isMobile = useMediaQuery({ maxWidth: 768 });

  // Show/hide background map
  const [showTileLayer, setShowTileLayer] = useState(true);

  // Ref for map export (the visible map container)
  const mapExportRef = React.useRef(null);

  // Export the currently displayed map (everything visible in the map container)
  const handleExportMap = async () => {
    if (!mapExportRef.current) return;
    // Wait a tick for map to render
    await new Promise((resolve) => setTimeout(resolve, 100));
    html2canvas(mapExportRef.current, {
      useCORS: true,
      backgroundColor: null,
      logging: false,
      scale: 2,
      scrollY: -window.scrollY,
    }).then((canvas) => {
      const link = document.createElement("a");
      link.download = "workout-map.png";
      link.href = canvas.toDataURL();
      link.click();
    });
  };

  // Calculate stats per workout type, filtered by includedIds (include all workouts, not just those with geo)
  const workoutTypeStats = useMemo(() => {
    if (!stravaWorkouts) return {};
    const stats = {};
    stravaWorkouts.forEach((w) => {
      if (!w.type) return;
      if (!includedIds.includes(w.id)) return; // Only count selected workouts
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
  }, [stravaWorkouts, includedIds]);

  // Gather all latlngs for included workouts (only those with geo)
  const heatmapPoints = useMemo(() => {
    if (!stravaWorkouts) return [];
    return stravaWorkouts
      .filter(
        (w) => includedIds.includes(w.id) && w.map && w.map.summary_polyline,
      )
      .flatMap((w) => decodePolyline(w.map.summary_polyline));
  }, [stravaWorkouts, includedIds]);

  // Gather all polylines for included workouts (only those with geo)
  const polylines = useMemo(() => {
    if (!stravaWorkouts) return [];
    return stravaWorkouts
      .filter(
        (w) => includedIds.includes(w.id) && w.map && w.map.summary_polyline,
      )
      .map((w) => ({
        positions: decodePolyline(w.map.summary_polyline),
        type: w.type,
        id: w.id,
      }));
  }, [stravaWorkouts, includedIds]);

  // Get all unique workout types present in the current workouts (regardless of geo)
  const workoutTypes = useMemo(() => {
    if (!stravaWorkouts) return [];
    const types = new Set();
    stravaWorkouts.forEach((w) => {
      if (w.type) types.add(w.type);
    });
    return Array.from(types);
  }, [stravaWorkouts]);

  // For each type, get all workout IDs of that type (regardless of geo)
  const typeToIds = useMemo(() => {
    if (!stravaWorkouts) return {};
    const map = {};
    stravaWorkouts.forEach((w) => {
      if (w.type) {
        if (!map[w.type]) map[w.type] = [];
        map[w.type].push(w.id);
      }
    });
    return map;
  }, [stravaWorkouts]);

  // For each type, are all of that type selected?
  const typeAllSelected = useMemo(() => {
    const result = {};
    for (const type of workoutTypes) {
      const ids = typeToIds[type] || [];
      result[type] =
        ids.length > 0 && ids.every((id) => includedIds.includes(id));
    }
    return result;
  }, [workoutTypes, typeToIds, includedIds]);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content style={{ padding: isMobile ? "8px" : "50px" }}>
        <div
          style={{ textAlign: "left", marginTop: isMobile ? "16px" : "50px" }}
        >
          <Title level={2} style={{ fontSize: isMobile ? 22 : undefined }}>
            {isUserFetching
              ? "Loading User Profile..."
              : ` ${userProfile?.name || name || "User"}'s Workout Tracer`}
          </Title>
        </div>
        {/* Maps */}
        {!isStravaWorkoutFetching && mapMode === "heat" && (
          <div style={{ margin: isMobile ? "20px 0" : "40px 0" }}>
            <Title level={5} style={{ fontSize: isMobile ? 16 : undefined }}>
              Workout Heatmap
            </Title>
            <div
              ref={mapExportRef}
              style={{ position: "relative", width: "100%" }}
            >
              <MapContainer
                style={{
                  height: isMobile ? MAP_HEIGHT_MOBILE : MAP_HEIGHT_DESKTOP,
                  width: "100%",
                }}
                center={
                  heatmapPoints.length > 0 ? heatmapPoints[0] : FALLBACK_CENTER
                }
                zoom={12}
                scrollWheelZoom={true}
              >
                {showTileLayer && (
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />
                )}
                {heatmapPoints.length > 0 && (
                  <HeatmapLayer points={heatmapPoints} />
                )}
              </MapContainer>
            </div>
            {/* Controls: 3 rows */}
            <div style={{ marginTop: 12 }}>
              {/* Row 1: Map type toggle */}
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
              {/* Row 2: Hide background/export */}
              <div style={{ textAlign: "left", marginBottom: 8 }}>
                <Button
                  onClick={() => setShowTileLayer((v) => !v)}
                  style={{ marginRight: 8 }}
                >
                  {showTileLayer
                    ? "Hide Background Map"
                    : "Show Background Map"}
                </Button>
                <Button onClick={handleExportMap} style={{ marginRight: 8 }}>
                  Export Map as PNG
                </Button>
              </div>
              {/* Row 3: Select All options */}
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
                      {allOfTypeSelected
                        ? `Deselect All ${type}`
                        : `Select All ${type}`}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        {!isStravaWorkoutFetching && mapMode === "lines" && (
          <div style={{ margin: isMobile ? "20px 0" : "40px 0" }}>
            <Title level={5} style={{ fontSize: isMobile ? 16 : undefined }}>
              Workout Lines
            </Title>
            <div
              ref={mapExportRef}
              style={{ position: "relative", width: "100%" }}
            >
              <MapContainer
                style={{
                  height: isMobile ? MAP_HEIGHT_MOBILE : MAP_HEIGHT_DESKTOP,
                  width: "100%",
                }}
                center={
                  polylines.length > 0
                    ? polylines[0].positions[0]
                    : FALLBACK_CENTER
                }
                zoom={12}
                scrollWheelZoom={true}
              >
                {showTileLayer && (
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />
                )}
                {polylines.map((line, idx) =>
                  line.positions.length > 0 ? (
                    <Polyline
                      key={line.id || idx}
                      positions={line.positions}
                      color={workoutTypeColor(line.type)}
                      weight={3}
                    />
                  ) : null,
                )}
              </MapContainer>
            </div>
            {/* Controls: 3 rows */}
            <div style={{ marginTop: 12 }}>
              {/* Row 1: Map type toggle */}
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
              {/* Row 2: Hide background/export */}
              <div style={{ textAlign: "left", marginBottom: 8 }}>
                <Button
                  onClick={() => setShowTileLayer((v) => !v)}
                  style={{ marginRight: 8 }}
                >
                  {showTileLayer
                    ? "Hide Background Map"
                    : "Show Background Map"}
                </Button>
                <Button onClick={handleExportMap} style={{ marginRight: 8 }}>
                  Export Map as PNG
                </Button>
              </div>
              {/* Row 3: Select All options */}
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
                      {allOfTypeSelected
                        ? `Deselect All ${type}`
                        : `Select All ${type}`}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
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
            style={{ minWidth: 180, marginRight: 8 }}
            value={searchType}
            onChange={setSearchType}
            options={workoutTypes.map((type) => ({
              value: type,
              label: type,
            }))}
          />
          <RangePicker
            style={{ minWidth: 260, marginRight: 8 }}
            value={searchDateRange}
            onChange={setSearchDateRange}
            allowEmpty={[true, true]}
          />
        </div>
        {/* Workout Type Summary Cards */}
        {!isStravaWorkoutFetching &&
          stravaWorkouts &&
          Object.keys(workoutTypeStats).length > 0 && (
            <div style={{ margin: "32px 0" }}>
              <Title level={4} style={{ marginBottom: 16 }}>
                Workout Stats
              </Title>
              <Row gutter={[16, 16]}>
                {Object.entries(workoutTypeStats)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([type, stats]) => (
                    <Col xs={24} sm={24} md={24} lg={8} xl={8} key={type}>
                      <Card
                        style={{
                          borderLeft: `8px solid ${workoutTypeColor(type)}`,
                          minHeight: 360,
                          fontSize: 24,
                        }}
                        title={<span style={{ fontSize: 32 }}>{type}</span>}
                        headStyle={{
                          color: workoutTypeColor(type),
                          fontSize: 32,
                        }}
                      >
                        {stats.totalDistance > 0 && (
                          <p style={{ fontSize: 24 }}>
                            <b>Total Distance:</b>{" "}
                            {`${(stats.totalDistance / 1000).toFixed(2)} km`}
                          </p>
                        )}
                        {stats.totalElevation > 0 && (
                          <p style={{ fontSize: 24 }}>
                            <b>Total Elevation:</b>{" "}
                            {`${stats.totalElevation.toFixed(0)} m`}
                          </p>
                        )}
                        {stats.totalKj > 0 && (
                          <p style={{ fontSize: 24 }}>
                            <b>Calories Burned:</b>{" "}
                            {`${(stats.totalKj * 0.239006).toFixed(0)} cal`}
                          </p>
                        )}
                        <p style={{ fontSize: 24 }}>
                          <b>Workouts:</b> {stats.count}
                        </p>
                      </Card>
                    </Col>
                  ))}
              </Row>
            </div>
          )}
        {/* Render Strava Workouts Cards with Pagination */}
        {!isStravaWorkoutFetching &&
          stravaWorkouts &&
          filteredWorkouts.length > 0 && (
            <div style={{ marginTop: 40 }}>
              <Title level={4}>Your Strava Workouts</Title>
              <Row gutter={[16, 16]}>
                {paginatedWorkouts.map((workout, idx) => {
                  // Remove geo check for checkbox
                  return (
                    <Col
                      xs={24}
                      sm={12}
                      md={8}
                      lg={6}
                      xl={4.8}
                      key={workout.id || idx}
                    >
                      <Card
                        title={
                          <Button
                            type="link"
                            style={{ padding: 0, fontWeight: "bold" }}
                            onClick={() => showWorkoutModal(workout)}
                          >
                            {workout.name || "Untitled Workout"}
                          </Button>
                        }
                        bordered={true}
                        style={{
                          marginBottom: 16,
                          borderLeft: `8px solid ${workoutTypeColor(workout.type)}`,
                        }}
                        extra={
                          <Checkbox
                            checked={includedIds.includes(workout.id)}
                            onChange={(e) =>
                              handleCheckboxChange(workout.id, e.target.checked)
                            }
                          >
                            Selected
                          </Checkbox>
                        }
                      >
                        <p>
                          <b>Type:</b> {workout.type || "N/A"}
                        </p>
                        <p>
                          <b>Start:</b>{" "}
                          {workout.start_date_local
                            ? new Date(
                                workout.start_date_local,
                              ).toLocaleString()
                            : "N/A"}
                        </p>
                        <p>
                          <b>Distance:</b>{" "}
                          {workout.distance
                            ? `${(workout.distance / 1000).toFixed(2)} km`
                            : "N/A"}
                        </p>
                        {workout.total_elevation_gain !== undefined && (
                          <p>
                            <b>Elevation:</b> {workout.total_elevation_gain} m
                          </p>
                        )}
                      </Card>
                    </Col>
                  );
                })}
              </Row>
              {/* Pagination Controls */}
              <div style={{ textAlign: "center", margin: "24px 0" }}>
                <Button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{ marginRight: 8 }}
                >
                  Previous
                </Button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  style={{ marginLeft: 8 }}
                >
                  Next
                </Button>
              </div>
              {/* Modal for workout details */}
              <Modal
                open={modalVisible}
                title={selectedWorkout?.name || "Workout Details"}
                onCancel={handleModalClose}
                footer={null}
                width={600}
              >
                {selectedWorkout && (
                  <Descriptions column={1} bordered size="small">
                    {Object.entries(selectedWorkout)
                      .filter(
                        ([key, value]) =>
                          value !== null &&
                          value !== undefined &&
                          key !== "map",
                      )
                      .map(([key, value]) => (
                        <Descriptions.Item label={key} key={key}>
                          {typeof value === "object"
                            ? JSON.stringify(value)
                            : String(value)}
                        </Descriptions.Item>
                      ))}
                  </Descriptions>
                )}
              </Modal>
            </div>
          )}
        {isStravaWorkoutFetching && (
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <Text>Loading workouts...</Text>
          </div>
        )}
      </Content>
    </Layout>
  );
};

export default HomeAuthenticated;
