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
} from "antd";
import { useNavigate } from "react-router-dom";
import { UserAuthenticationContext } from "../../provider/UserAuthenticationProvider";
import { useUserProfile } from "../../provider/UserProfileProvider";
import { useStravaWorkouts } from "../../provider/StravaWorkoutsProvider";
import { MapContainer, TileLayer, useMap, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import polyline from "@mapbox/polyline";
import { useMediaQuery } from "react-responsive";

const { Content } = Layout;
const { Title, Text } = Typography;

const PAGE_SIZE = 25;

// Helper to decode a polyline to latlngs
const decodePolyline = (poly) => {
  try {
    return polyline.decode(poly).map(([lat, lng]) => [lat, lng]);
  } catch {
    return [];
  }
};

// Heatmap Layer component
const HeatmapLayer = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (!window.L || !points.length) return;
    // Remove previous heat layer if it exists
    if (map._heatLayer) {
      map.removeLayer(map._heatLayer);
      map._heatLayer = null;
    }
    // Create heat layer
    const heat = window.L.heatLayer(points, {
      radius: 10,
      blur: 15,
      maxZoom: 17,
    });
    heat.addTo(map);
    map._heatLayer = heat;
    // Do NOT call fitBounds here to avoid rerender on every interaction
    return () => {
      if (map._heatLayer) {
        map.removeLayer(map._heatLayer);
        map._heatLayer = null;
      }
    };
  // Only update when points array reference changes, not on every click
  }, [points]);
  return null;
};

const MAP_HEIGHT_DESKTOP = 400 * 1.33; // ~532px
const MAP_HEIGHT_MOBILE = 250;

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
      const aTime = a.start_date_local ? new Date(a.start_date_local).getTime() : 0;
      const bTime = b.start_date_local ? new Date(b.start_date_local).getTime() : 0;
      return bTime - aTime;
    });
  }, [stravaWorkouts]);

  // Pagination logic (use sortedWorkouts instead of stravaWorkouts)
  const totalPages = sortedWorkouts
    ? Math.ceil(sortedWorkouts.length / PAGE_SIZE)
    : 1;
  const paginatedWorkouts = sortedWorkouts
    ? sortedWorkouts.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
      )
    : [];

  // Memoize the includedIds handler to prevent unnecessary rerenders
  const handleCheckboxChange = useMemo(
    () => (workoutId, checked) => {
      setIncludedIds((prev) =>
        checked ? [...prev, workoutId] : prev.filter((id) => id !== workoutId)
      );
    },
    []
  );

  // Gather all latlngs for included workouts
  const heatmapPoints = useMemo(() => {
    if (!stravaWorkouts) return [];
    return stravaWorkouts
      .filter(
        (w) => includedIds.includes(w.id) && w.map && w.map.summary_polyline,
      )
      .flatMap((w) => decodePolyline(w.map.summary_polyline));
  }, [stravaWorkouts, includedIds]);

  // Gather all polylines for included workouts
  const polylines = useMemo(() => {
    if (!stravaWorkouts) return [];
    return stravaWorkouts
      .filter(
        (w) => includedIds.includes(w.id) && w.map && w.map.summary_polyline,
      )
      .map((w) => decodePolyline(w.map.summary_polyline));
  }, [stravaWorkouts, includedIds]);

  // Responsive: detect if mobile (width <= 768px)
  const isMobile = useMediaQuery({ maxWidth: 768 });

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content style={{ padding: isMobile ? "8px" : "50px" }}>
        <div style={{ textAlign: "center", marginTop: isMobile ? "16px" : "50px" }}>
          <Title level={2} style={{ fontSize: isMobile ? 22 : undefined }}>
            Welcome to the Workout Tracer
          </Title>
          {isUserFetching ? (
            <Text>Loading...</Text>
          ) : (
            <Text>{`You have signed in ${userProfile?.name || ""}`}</Text>
          )}
        </div>
        {/* Map Mode Toggle */}
        <div style={{ textAlign: "center", margin: isMobile ? "12px 0" : "24px 0" }}>
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
        {/* Maps */}
        {!isStravaWorkoutFetching &&
          heatmapPoints.length > 0 &&
          mapMode === "heat" && (
            <div style={{ margin: isMobile ? "20px 0" : "40px 0" }}>
              <Title level={5} style={{ fontSize: isMobile ? 16 : undefined }}>
                Workout Heatmap
              </Title>
              <MapContainer
                style={{
                  height: isMobile ? MAP_HEIGHT_MOBILE : MAP_HEIGHT_DESKTOP,
                  width: "100%",
                }}
                center={heatmapPoints[0]}
                zoom={12}
                scrollWheelZoom={true}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                <HeatmapLayer points={heatmapPoints} />
              </MapContainer>
            </div>
          )}
        {!isStravaWorkoutFetching &&
          polylines.length > 0 &&
          mapMode === "lines" && (
            <div style={{ margin: isMobile ? "20px 0" : "40px 0" }}>
              <Title level={5} style={{ fontSize: isMobile ? 16 : undefined }}>
                Workout Lines
              </Title>
              <MapContainer
                style={{
                  height: isMobile ? MAP_HEIGHT_MOBILE : MAP_HEIGHT_DESKTOP,
                  width: "100%",
                }}
                center={polylines[0][0]}
                zoom={12}
                scrollWheelZoom={true}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                {polylines.map((line, idx) =>
                  line.length > 0 ? (
                    <Polyline
                      key={idx}
                      positions={line}
                      color="#ff6600"
                      weight={3}
                    />
                  ) : null,
                )}
              </MapContainer>
            </div>
          )}
        {/* Render Strava Workouts Cards with Pagination */}
        {!isStravaWorkoutFetching &&
          stravaWorkouts &&
          stravaWorkouts.length > 0 && (
            <div style={{ marginTop: 40 }}>
              <Title level={4}>Your Strava Workouts</Title>
              <Row gutter={[16, 16]}>
                {paginatedWorkouts.map((workout, idx) => {
                  const hasGeo = workout.map && workout.map.summary_polyline;
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
                        style={{ marginBottom: 16 }}
                        extra={
                          hasGeo && (
                            <Checkbox
                              checked={includedIds.includes(workout.id)}
                              onChange={(e) =>
                                handleCheckboxChange(
                                  workout.id,
                                  e.target.checked,
                                )
                              }
                            >
                              On Map
                            </Checkbox>
                          )
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
                    {Object.entries(selectedWorkout).map(([key, value]) => (
                      <Descriptions.Item label={key} key={key}>
                        {typeof value === "object" && value !== null
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
