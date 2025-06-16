import React from "react";
import { Typography, Row, Col, Card } from "antd";

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

  return (
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
  );
};

export default WorkoutStats;
