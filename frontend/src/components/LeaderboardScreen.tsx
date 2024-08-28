import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import SiteNavigation from "./SiteNavigation";
import {
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Tooltip,
} from "@mui/material";
import { Link } from "react-router-dom";
import "./LeaderboardScreen.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

type Player = {
  address: string;
  xp: number;
  silver: number;
  lootbox_level: number;
  score: number;
  username: string | null;
  position: number;
};

const LeaderboardScreen = () => {
  const wallet = useWallet();
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);
  const [playerPosition, setPlayerPosition] = useState<Player | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const addressParam = wallet.publicKey ? `?address=${wallet.publicKey.toBase58()}` : "";
        const response = await fetch(`${API_BASE_URL}/api/v1/leaderboard${addressParam}`);
        const result = await response.json();

        if (result.success) {
          if (result.leaderboard[0]?.position !== undefined) {
            setPlayerPosition(result.leaderboard[0]);
            setLeaderboard(result.leaderboard.slice(1));
          } else if (result.leaderboard[0] === null) {
            setLeaderboard(result.leaderboard.slice(1));
          } else {
            setLeaderboard(result.leaderboard);
          }
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard", error);
      }
      setLoading(false);
    };

    fetchLeaderboard();
  }, [wallet.publicKey]);

  const formatPlayerName = (username: string | null, address: string) => {
    if (username) return username;
    return `${address.slice(0, 3)}...${address.slice(-3)}`;
  };

  return (
    <div className="leaderboard-page">
      <SiteNavigation />
      <Box className="leaderboard-header">
        <Typography variant="h6" gutterBottom>
          Players active during the pre-season will share <span style={{color: 'gold'}}>1,000,000 Sonic Odyssey rings</span> and other rewards.
        </Typography>
      </Box>

      {loading ? (
        <Box className="loading-container">
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} className="leaderboard-table-container">
          <Table className="leaderboard-table">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#171717" }}>
                <TableCell align="left">Rank</TableCell>
                <TableCell align="left">Player</TableCell>
                <TableCell align="right">XP</TableCell>
                <TableCell align="right">Silver</TableCell>
                <TableCell align="right">Lootbox</TableCell>
                <TableCell align="right">Score</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {playerPosition && (
                <TableRow className="player-position-row shining-row" sx={{ backgroundColor: "#171717" }}>
                  <TableCell align="left" style={{ color: "gold", fontSize: "18px" }}>
                    <Tooltip title="Your Position" arrow>
                      <span>{playerPosition.position}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="left" style={{color: 'gold'}}>You</TableCell>
                  <TableCell align="right">{playerPosition.xp}</TableCell>
                  <TableCell align="right">{playerPosition.silver}</TableCell>
                  <TableCell align="right">
                    {playerPosition.lootbox_level > 0 ? (
                      <img
                        src={`lootbox-${playerPosition.lootbox_level}.png`}
                        alt={`${playerPosition.lootbox_level}`}
                        style={{ width: 36 }}
                      />
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell align="right" style={{ fontSize: "18px", color: "gold" }}>
                    {playerPosition.score}
                  </TableCell>
                </TableRow>
              )}
              {leaderboard.map((player, index) => (
                <TableRow
                  key={player.address}
                  sx={{
                    backgroundColor: index % 2 === 0 ? "#292929" : "#171717",
                  }}
                >
                  <TableCell align="left" style={{ color: "gold", fontSize: "18px" }}>
                    {index + 1}
                  </TableCell>
                  <TableCell align="left">{formatPlayerName(player.username, player.address)}</TableCell>
                  <TableCell align="right">{player.xp}</TableCell>
                  <TableCell align="right">{player.silver}</TableCell>
                  <TableCell align="right">
                    {player.lootbox_level > 0 ? (
                      <img
                        src={`lootbox-${player.lootbox_level}.png`}
                        alt={`${player.lootbox_level}`}
                        style={{ width: 36 }}
                      />
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell align="right" style={{ fontSize: "18px", color: "gold" }}>
                    {player.score}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};

export default LeaderboardScreen;
