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
        {/* <img src={room.image} alt={room.name} width={256} className="room-image" /> */}
        <Typography variant="h6">{room.name}</Typography>
        <Typography>{room.description}</Typography>
        <hr />
        <pre>
          <p>Yield: ${room.yield}/min</p>
          <p>Max capacity: ${room.capacity}</p>
          <p>Level: 1</p>
        </pre>
        <Button variant="contained" color="primary" disabled>
          Upgrade Room
        </Button>
      </Box>
    </Modal>
  );
};

export default RoomDetailsModal;
