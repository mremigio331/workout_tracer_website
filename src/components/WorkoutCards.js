import React from "react";
import {
  Typography,
  Row,
  Col,
  Card,
  Button,
  Checkbox,
  Modal,
  Descriptions,
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
}) => {
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

  return (
    <div style={{ marginTop: 40 }}>
      <Title level={4}>Your Strava Workouts</Title>
      <Row gutter={[16, 16]}>
        {paginatedWorkouts.map((workout, idx) => (
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
