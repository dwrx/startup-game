import React from 'react';
import { Modal, Box, Typography, Button, Grid } from '@mui/material';
import '../styles.css';

interface RoomInfo {
    name: string;
    description: string;
    price: number;
    yield: number;
    capacity: number;
    image: string;
    levelRequirement: number;
}

interface PurchaseModalProps {
    open: boolean;
    onClose: () => void;
    rooms: RoomInfo[];
    onPurchase: (room: RoomInfo) => void;
    playerCash: number;
    playerLevel: number;
}

const PurchaseModal: React.FC<PurchaseModalProps> = ({ open, onClose, rooms, onPurchase, playerCash, playerLevel }) => {
    return (
        <Modal open={open} onClose={onClose}>
            <Box className="modal-box">
                <Typography variant="h6" component="h2">
                    Choose a Room to Purchase
                </Typography>
                <Grid container spacing={2}>
                    {rooms.map((room) => (
                        <Grid item xs={12} sm={6} md={4} key={room.name}>
                            <Box className="room-option">
                                <img src={room.image} alt={room.name} className="room-image" />
                                <Typography variant="h6">{room.name}</Typography>
                                <Typography>{room.description}</Typography>
                                <Typography>Price: ${room.price}</Typography>
                                <Typography>Yield: {room.yield}/min</Typography>
                                <Typography>Capacity: {room.capacity}</Typography>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => onPurchase(room)}
                                    disabled={playerCash < room.price || playerLevel < room.levelRequirement}
                                >
                                    {playerCash < room.price
                                        ? 'Not enough money'
                                        : playerLevel < room.levelRequirement
                                        ? 'Your level too low'
                                        : 'Purchase'}
                                </Button>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Modal>
    );
};

export default PurchaseModal;
