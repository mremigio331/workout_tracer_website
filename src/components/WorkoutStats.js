import React from "react";
import { Typography, Row, Col, Card } from "antd";
import { useUserProfile } from "../provider/UserProfileProvider";
const { Title } = Typography;

/**
 * WorkoutStats component for displaying summary statistics per workout type.
 *
 * @param {Object} props
 * @param {boolean} props.isStravaWorkoutFetching
 * @param {Array} props.stravaWorkouts
 * @param {Object} props.workoutTypeStats
 * @param {Function} props.workoutTypeColor
 * @returns {JSX.Element|null}
 */
const WorkoutStats = ({
  isStravaWorkoutFetching,
  stravaWorkouts,
  workoutTypeStats,
  workoutTypeColor,
}) => {
  if (
    isStravaWorkoutFetching ||
    !stravaWorkouts ||
    Object.keys(workoutTypeStats).length === 0
  ) {
    return null;
  }
  const { userProfile } = useUserProfile();
  const distanceUnit = userProfile?.distance_unit || "Imperial";
  const distanceLabel = distanceUnit === "Imperial" ? "miles" : "km";
  const elevationLabel = distanceUnit === "Imperial" ? "ft" : "m";
  const convertDistance = (km) =>
    distanceUnit === "Imperial" ? (km * 0.621371).toFixed(2) : km.toFixed(2);
  const convertElevation = (meters) =>
    distanceUnit === "Imperial"
      ? (meters * 3.28084).toFixed(0)
      : meters.toFixed(0);

  return (
    <div style={{ margin: "32px 0" }}>
      <Title level={4} style={{ marginBottom: 16 }}>
        Workout Stats (Total: {stravaWorkouts.length} workouts)
      </Title>
      <Row gutter={[16, 16]}>
        {Object.entries(workoutTypeStats)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([type, stats]) => (
            <Col span={24} key={type}>
              <Card
                style={{
                  borderLeft: `8px solid ${workoutTypeColor(type)}`,
                  minHeight: 0,
                  fontSize: 16,
                  width: "100%",
                  marginBottom: 16,
                }}
                title={<span style={{ fontSize: 20 }}>{type}</span>}
                headStyle={{
                  color: workoutTypeColor(type),
                  fontSize: 20,
                }}
              >
                {stats.totalDistance > 0 && (
                  <p style={{ fontSize: 16 }}>
                    <b>Total Distance:</b>{" "}
                    {`${convertDistance(stats.totalDistance / 1000)} ${distanceLabel}`}
                  </p>
                )}
                {stats.totalElevation > 0 && (
                  <p style={{ fontSize: 16 }}>
                    <b>Total Elevation:</b>{" "}
                    {`${convertElevation(stats.totalElevation)} ${elevationLabel}`}
                  </p>
                )}
                {stats.totalKj > 0 && (
                  <p style={{ fontSize: 16 }}>
                    <b>Calories Burned:</b>{" "}
                    {`${(stats.totalKj * 0.239006).toFixed(0)} cal`}
                  </p>
                )}
                <p style={{ fontSize: 16 }}>
                  <b>Workouts:</b> {stats.count}
                </p>
              </Card>
            </Col>
          ))}
      </Row>
    </div>
  );
};

export default WorkoutStats;
