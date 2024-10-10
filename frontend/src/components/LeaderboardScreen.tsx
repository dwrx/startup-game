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
  Button,
} from "@mui/material";
import { Link } from "react-router-dom";
import "./LeaderboardScreen.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

type Player = {
  address: string;
  xp: number;
  rings: number;
  rings_claimed?: number;
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
  const [claiming, setClaiming] = useState<boolean>(false);
  const [claimTx, setClaimTx] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const addressParam = wallet.publicKey ? `?address=${wallet.publicKey.toBase58()}` : "";
      const response = await fetch(`${API_BASE_URL}/api/v1/leaderboard${addressParam}`);
      const result = await response.json();

      if (result.success) {
        setClaimTx(result.claimTx);
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

  useEffect(() => {
    fetchLeaderboard();
  }, [wallet.publicKey]);

  const formatPlayerName = (username: string | null, address: string) => {
    if (username) return username;
    return `${address.slice(0, 3)}...${address.slice(-3)}`;
  };

  const claimRings = async (address: string) => {
    if (claiming || !wallet.publicKey) return;
    setClaiming(true);
    const response = await fetch(`${API_BASE_URL}/api/v1/claim-odyssey-reward`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questId: 9999, address: wallet.publicKey.toBase58() }),
    });
    const result = await response.json();
    if (result.success) {
      console.log("Rings claimed successfully");
    } else {
      console.error("Failed to claim rings:", result.message);
    }
    await fetchLeaderboard();
    setClaiming(false);
  };

  return (
    <div className="leaderboard-page">
      <SiteNavigation />
      <Box className="leaderboard-header">
        <Typography variant="h6" gutterBottom>
          A snapshot was taken on October 1st at 9 AM UTC. Top-1000 players are eligible to claim Rings. 
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
                <TableCell align="right" style={{display: 'flex'}}><img src="/rings.png" width="24" alt="" className="rings-img" /> <span style={{color: "rgb(215, 151, 58)"}}>Rings</span></TableCell>
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
                  <TableCell align="right" style={{ fontSize: "18px", color: "rgb(215, 151, 58)" }}>
                  {playerPosition.rings_claimed === 0 && <span>{`${playerPosition.rings} Rings` || '???'}</span>}
                    <div>
                      {(playerPosition.rings > 0 && playerPosition.rings_claimed === 0) && (
                        <Button variant="contained" className="claim-rings-btn" style={{backgroundColor: '#f2b24e', color: "black" }} onClick={() => claimRings(playerPosition.address)}>
                          {claiming ? "Claiming..." : "Claim"}
                        </Button>
                      )}
                      {(playerPosition.rings > 0 && playerPosition.rings_claimed === 1) && (
                        <p>
                          <a href={`https://explorer.sonic.game/tx/${claimTx}`} style={{color: '#fff'}} target="_blank" rel="noreferrer noopener">
                            <span>CLAIMED {playerPosition.rings} RINGS</span>
                          </a>
                        </p>
                      )}
                    </div>
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
                  <TableCell align="left"><Link to={`/inventory?player=${player.address}`} style={{color: 'white'}}>{formatPlayerName(player.username, player.address)}</Link></TableCell>
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
                  <TableCell align="right" style={{ fontSize: "18px", color: "rgb(215, 151, 58)" }}>
                    {player.rings || '???'}
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
