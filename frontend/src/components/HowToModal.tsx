import React from "react";
import { Modal, Box, Typography, Button } from "@mui/material";
import "../styles.css";

interface HowToModalProps {
  open: boolean;
  onClose: () => void;
}

const HowToModal: React.FC<HowToModalProps> = ({ open, onClose }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box className="modal-box">
        <Typography variant="body1" paragraph>
          You can use{" "}
          <a href="https://backpack.app/download" target="_blank" style={{ color: "white" }} rel="noopener noreferrer">
            Backpack wallet
          </a>{" "}or <a href="https://nightly.app/" target="_blank" style={{ color: "white" }} rel="noopener noreferrer">Nightly wallet</a>{" "}
          that have a native support of Sonic Origin (devnet). If you use other wallets, you may need to setup manually a custom
          RPC URL if your wallet allows this:
        </Typography>
        <Typography variant="body1" paragraph>
          <code>https://devnet.sonic.game</code>
        </Typography>
        <Box mt={2}>
          <img src="/how-to.png" alt="Setup Guide" style={{ width: "100%" }} />
        </Box>
        <Box mt={2} textAlign="right">
          <Button variant="contained" color="primary" onClick={onClose}>
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default HowToModal;
