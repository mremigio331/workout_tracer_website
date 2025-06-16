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
import WorkoutStats from "../../components/WorkoutStats";
import WorkoutCards from "../../components/WorkoutCards";
import WorkoutDetailsModal from "../../components/WorkoutDetailsModal";
import MapControls from "../../components/MapControls";
import workoutTypeColor from "../../utility/workoutTypeColor";
import {
  PAGE_SIZE,
  MAP_HEIGHT_DESKTOP,
  MAP_HEIGHT_MOBILE,
  FALLBACK_CENTER,
} from "../../config/mapConfig";
import {
  getWorkoutTypeStats,
  getHeatmapPoints,
  getPolylines,
  getWorkoutTypes,
  getTypeToIds,
  getTypeAllSelected,
} from "../../utility/workoutHelpers";

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
  const [mapMode, setMapMode] = useState("heat");

  const {
    stravaWorkouts,
    isStravaWorkoutFetching,
    isStravaWorkoutError,
    refetchStravaWorkouts,
  } = useStravaWorkouts();

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

  const filteredWorkouts = useMemo(() => {
    if (!sortedWorkouts) return [];

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
        <WorkoutStats
          isStravaWorkoutFetching={isStravaWorkoutFetching}
          stravaWorkouts={stravaWorkouts}
          workoutTypeStats={workoutTypeStats}
          workoutTypeColor={workoutTypeColor}
        />
        <WorkoutCards
          isStravaWorkoutFetching={isStravaWorkoutFetching}
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
        />
        <WorkoutDetailsModal
          open={modalVisible}
          workout={selectedWorkout}
          onCancel={handleModalClose}
        />
      </Content>
    </Layout>
  );
};

export default HomeAuthenticated;
