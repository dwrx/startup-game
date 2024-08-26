import React from "react";
import { Modal, Box, Button, Typography, Tooltip } from "@mui/material";
import "../styles.css";

interface TeamModalProps {
  open: boolean;
  onClose: () => void;
  playerXp: number;
  playerDirtyCash: number;
}

const TeamModal: React.FC<TeamModalProps> = ({ open, onClose, playerXp, playerDirtyCash }) => {
  const canRecruitAlbert = playerXp >= 9 && playerDirtyCash >= 5000;

  const recruitMember = (memberName: string) => {
    console.log("recruit member", memberName);
  };

  return (
    <Modal open={open} onClose={onClose} className="team-modal">
      <Box
        className="team-modal-content"
        sx={{
          backgroundImage: "url('/team-background.png')",
          backgroundSize: "cover",
          padding: "20px",
          borderRadius: "10px",
          color: "#fff",
        }}
      >
        <div
          className="team-member"
          style={{ background: "linear-gradient(90deg, rgba(255, 165, 0, 0.15), rgba(128, 128, 128, 0.5))" }}
        >
          <img src="/albert.png" alt="Albert" className="team-member-image" />
          <div className="team-member-info">
            {/* <Typography variant="h6">Albert</Typography> */}
            <Typography variant="body1">
              <b>Albert</b> is a clever mastermind, skilled in planning and executing high-stakes heists.
            </Typography>
            <Tooltip title="Albert unlocks Heists.">
              <Button
                variant="contained"
                color="primary"
                disabled={!canRecruitAlbert}
                onClick={() => recruitMember("Albert")}
                style={{ marginTop: "10px", color: "#000000", backgroundColor: canRecruitAlbert ? "#d2ab2c" : "grey" }}
              >
                {playerXp < 9 ? `9 XP needed` : "Recruit for $5000"}
                {/* Recruit for $5000 <img src="/dirty-money.png" style={{ paddingLeft: "5px" }} width="32" alt="Dirty Cash" /> */}
              </Button>
            </Tooltip>
          </div>
        </div>

        <div
          className="team-member"
          style={{ background: "linear-gradient(90deg, rgba(255, 0, 0, 0.15), rgba(128, 128, 128, 0.5))" }}
        >
          <img src="/easy.png" alt="Easy" className="team-member-image" />
          <div className="team-member-info">
            {/* <Typography variant="h6">Easy</Typography> */}
            <Typography variant="body1">
              <b>"Easy"</b> can solve problems with the police and keep the team out of trouble.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              disabled={true}
              style={{ marginTop: "10px", backgroundColor: "grey" }}
            >
              Not enough XP
            </Button>
          </div>
        </div>

        <div
          className="team-member"
          style={{ background: "linear-gradient(90deg, rgba(0, 0, 255, 0.15), rgba(128, 128, 128, 0.5))" }}
        >
          <img src="/becca.png" alt="Becca" className="team-member-image" />
          <div className="team-member-info">
            {/* <Typography variant="h6">Becca</Typography> */}
            <Typography variant="body1">
              <b>Becca</b>, the team's chief intelligence officer, excels in corporate espionage.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              disabled={true}
              style={{ marginTop: "10px", backgroundColor: "grey" }}
            >
              Not enough XP
            </Button>
          </div>
        </div>
        <Box mt={2} textAlign="right">
          <Button variant="contained" color="primary" className="close" onClick={onClose}>
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default TeamModal;
