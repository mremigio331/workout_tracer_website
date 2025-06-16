import React from "react";
import { Modal, Descriptions } from "antd";

const WorkoutDetailsModal = ({ open, workout, onCancel }) => (
  <Modal
    open={open}
    title={workout?.name || "Workout Details"}
    onCancel={onCancel}
    footer={null}
    width={600}
  >
    {workout && (
      <Descriptions column={1} bordered size="small">
        {Object.entries(workout)
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
);

export default WorkoutDetailsModal;
