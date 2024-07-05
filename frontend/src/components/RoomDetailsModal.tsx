import React from "react";
import { Modal, Box, Typography, Button } from "@mui/material";
import "../styles.css";

interface RoomDetailsModalProps {
  open: boolean;
  onClose: () => void;
  room: any;
}

const RoomDetailsModal: React.FC<RoomDetailsModalProps> = ({ open, onClose, room }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box className="modal-box">
        <Typography variant="h6" component="h2">
          Room Details
        </Typography>
        <img src={room.image} alt={room.name} className="room-image" />
        <Typography variant="h6">{room.name}</Typography>
        <Typography>Yield: {room.yield}/min</Typography>
        <Typography>Capacity: {room.capacity}</Typography>
        <Typography>Level: {room.level}</Typography>
        <Button variant="contained" color="primary" disabled>
          Upgrade Room
        </Button>
      </Box>
    </Modal>
  );
};

export default RoomDetailsModal;
