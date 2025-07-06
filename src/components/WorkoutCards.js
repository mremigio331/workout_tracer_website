import React, { useState } from "react";
import {
  Typography,
  Row,
  Col,
  Card,
  Button,
  Checkbox,
  Modal,
  Descriptions,
  Input,
} from "antd";
import workoutTypeColor from "../utility/workoutTypeColor";

const { Title } = Typography;

/**
 * WorkoutCards component for displaying paginated workout cards.
 *
 * @param {Object} props
 * @param {boolean} props.isStravaWorkoutFetching
 * @param {Array} props.stravaWorkouts
 * @param {Array} props.filteredWorkouts
 * @param {Array} props.paginatedWorkouts
 * @param {number} props.currentPage
 * @param {Function} props.setCurrentPage
 * @param {number} props.totalPages
 * @param {Array} props.includedIds
 * @param {Function} props.handleCheckboxChange
 * @param {Function} props.showWorkoutModal
 * @param {boolean} props.modalVisible
 * @param {Object} props.selectedWorkout
 * @param {Function} props.handleModalClose
 * @param {Function} props.centerOnWorkout - function(workout) to center/zoom map on this workout
 */
const WorkoutCards = ({
  isStravaWorkoutFetching,
  stravaWorkouts,
  filteredWorkouts,
  paginatedWorkouts,
  currentPage,
  setCurrentPage,
  totalPages,
  includedIds,
  handleCheckboxChange,
  showWorkoutModal,
  modalVisible,
  selectedWorkout,
  handleModalClose,
  centerOnWorkout, // <-- new prop
  highlightedActivities,
  setHighlightedActivities,
}) => {
  // Add local search state for filtering cards by text
  const [localSearch, setLocalSearch] = useState("");

  if (isStravaWorkoutFetching) {
    return (
      <div style={{ textAlign: "center", marginTop: 32 }}>
        <Typography.Text>Loading workouts...</Typography.Text>
      </div>
    );
  }

  if (!stravaWorkouts || filteredWorkouts.length === 0) {
    return null;
  }

  // Filter paginatedWorkouts by local search text (case-insensitive)
  const filteredPaginated = localSearch
    ? paginatedWorkouts.filter(
        (w) =>
          (w.name || "").toLowerCase().includes(localSearch.toLowerCase()) ||
          (w.type || "").toLowerCase().includes(localSearch.toLowerCase()),
      )
    : paginatedWorkouts;

  // Handler to add/remove a workout from highlightedActivities
  const toggleHighlight = (workoutId) => {
    setHighlightedActivities((prev) =>
      prev.includes(workoutId)
        ? prev.filter((id) => id !== workoutId)
        : [...prev, workoutId],
    );
  };

  return (
    <div style={{ marginTop: 40 }}>
      <Title level={4}>Your Strava Workouts</Title>
      <div
        style={{
          margin: "0 0 16px 0",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Input.Search
          placeholder="Search workouts"
          allowClear
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          style={{ width: "100%" }}
        />
      </div>
      <Row gutter={[16, 16]}>
        {filteredPaginated.map((workout, idx) => (
          <Col span={24} key={workout.id || idx}>
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
                width: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 8,
                  gap: 12,
                }}
              >
                <Checkbox
                  checked={includedIds.includes(workout.id)}
                  onChange={(e) =>
                    handleCheckboxChange(workout.id, e.target.checked)
                  }
                >
                  Selected
                </Checkbox>
                <Button
                  size="small"
                  onClick={() => centerOnWorkout && centerOnWorkout(workout)}
                  style={{ marginLeft: 0 }}
                  disabled={
                    !workout.map ||
                    !workout.map.summary_polyline ||
                    workout.map.summary_polyline.length === 0
                  }
                >
                  Center on Map
                </Button>
                <Button
                  size="small"
                  type={
                    highlightedActivities &&
                    highlightedActivities.includes(workout.id)
                      ? "primary"
                      : "default"
                  }
                  onClick={() => toggleHighlight(workout.id)}
                  style={{ marginLeft: 0 }}
                >
                  {highlightedActivities &&
                  highlightedActivities.includes(workout.id)
                    ? "Unhighlight"
                    : "Highlight"}
                </Button>
              </div>
              <p>
                <b>Type:</b> {workout.type || "N/A"}
              </p>
              <p>
                <b>Start:</b>{" "}
                {workout.start_date_local
                  ? new Date(workout.start_date_local).toLocaleString()
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
        ))}
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
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
                  value !== null && value !== undefined && key !== "map",
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
  );
};

export default WorkoutCards;
