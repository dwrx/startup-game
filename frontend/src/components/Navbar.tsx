import React, { useEffect, useState, useRef } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PublicKey } from "@solana/web3.js";
import {
  useMediaQuery,
  Drawer,
  Button,
  Box,
  Tooltip,
  createTheme,
  ThemeProvider,
  Menu,
  MenuItem,
  IconButton,
} from "@mui/material";
// import SettingsIcon from '@mui/icons-material/Settings';
import useProgram from "../hooks/useProgram";
import { allRooms } from "../rooms";
import MissionsModal from "./MissionsModal";
import TeamModal from "./TeamModal";
import HeistsModal from "./HeistsModal";
import Balances from "./Balances";
import "../styles.css";

const theme = createTheme({
  components: {
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: "14px",
          backgroundColor: "#000",
          color: "#fff",
          borderRadius: "5px",
          padding: "10px",
          boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
        },
      },
    },
  },
});

const Navbar: React.FC = () => {
  const wallet = useWallet();
  const program = useProgram();
  const [balances, setBalances] = useState({
    cleanCash: 0,
    dirtyCash: 0,
    silver: 0,
    xp: 0,
    enforcers: 0,
    hitmen: 0,
  });
  const [estimatedDirtyCash, setEstimatedDirtyCash] = useState(0);
  const [estimatedCleanCash, setEstimatedCleanCash] = useState(0);
  const [missionsModalOpen, setMissionsModalOpen] = useState<boolean>(false);
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [heistsModalOpen, setHeistsModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width:768px)");

  const { connection } = useConnection();

  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const fetchBalances = async () => {
    if (!wallet.connected || !wallet.publicKey || !program) return;

    const [playerPda] = await PublicKey.findProgramAddress(
      [Buffer.from("PLAYER"), wallet.publicKey.toBuffer()],
      program.programId
    );

    try {
      // @ts-ignore
      const playerAccount = await program.account.player.fetch(playerPda);
      setBalances({
        cleanCash: playerAccount.cleanCash.toNumber(),
        dirtyCash: playerAccount.dirtyCash.toNumber(),
        silver: playerAccount.silver.toNumber(),
        xp: playerAccount.experience.toNumber(),
        enforcers: playerAccount.enforcers.toNumber(),
        hitmen: playerAccount.hitmen.toNumber(),
      });

      return playerAccount;
    } catch (err) {
      console.error("Failed to fetch balances", err);
    }
  };

  const estimatePendingRewards = async (playerAccount: any) => {
    try {
      const slot = await connection.getSlot();
      const currentTime = await connection.getBlockTime(slot);

      let totalDirtyCash = 0;
      let totalCleanCash = 0;
      const availableDirtyCash = playerAccount.dirtyCash.toNumber();

      playerAccount.rooms.forEach((room: any) => {
        const elapsedTime = Number(currentTime) - Number(room.lastCollected);

        const roomInfo = allRooms.find((r) => Object.keys(r.roomType)[0] === Object.keys(room.roomType)[0]);
        if (!roomInfo) return;

        const yieldPerSecond = roomInfo.yield / 60;
        const potentialReward = Math.min(elapsedTime * yieldPerSecond, room.storageCapacity.toNumber());

        if (["unlicensedBar", "cannabisFarm", "stripClub", "casino"].includes(Object.keys(room.roomType)[0])) {
          totalDirtyCash += potentialReward;
        }

        if (["laundry", "fastFoodRestaurant", "fitnessCenter"].includes(Object.keys(room.roomType)[0])) {
          totalCleanCash += potentialReward;
        }
      });

      totalCleanCash = Math.min(totalCleanCash, availableDirtyCash * 0.7);

      setEstimatedDirtyCash(Math.round(totalDirtyCash > 0 ? totalDirtyCash : 0));
      setEstimatedCleanCash(Math.round(totalCleanCash > 0 ? totalCleanCash : 0));
    } catch (err) {
      console.error("Failed to estimate rewards", err);
    }
  };

  useEffect(() => {
    if (wallet.connected && wallet.publicKey) {
      setMissionsModalOpen(true);
    }
    const fetchAndEstimate = async () => {
      const playerAccount = await fetchBalances();
      if (playerAccount) {
        estimatePendingRewards(playerAccount);
      }
    };

    fetchAndEstimate();
    const interval = setInterval(fetchAndEstimate, 2000);

    return () => clearInterval(interval);
  }, [wallet.connected, wallet.publicKey, program]);

  const handleCollectDirtyCash = async () => {
    if (!wallet.connected || !wallet.publicKey || !program) return;

    const [playerPda] = await PublicKey.findProgramAddress(
      [Buffer.from("PLAYER"), wallet.publicKey.toBuffer()],
      program.programId
    );

    try {
      await program.methods
        .collectDirtyCash()
        .accounts({
          player: playerPda,
          owner: wallet.publicKey,
        })
        .rpc();

      fetchBalances();
    } catch (err) {
      console.error("Failed to collect dirty cash", err);
    }
  };

  const handleCollectCleanCash = async () => {
    if (!wallet.connected || !wallet.publicKey || !program) return;

    const [playerPda] = await PublicKey.findProgramAddress(
      [Buffer.from("PLAYER"), wallet.publicKey.toBuffer()],
      program.programId
    );

    try {
      await program.methods
        .collectCleanCash()
        .accounts({
          player: playerPda,
          owner: wallet.publicKey,
        })
        .rpc();

      fetchBalances();
    } catch (err) {
      console.error("Failed to collect clean cash", err);
    }
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.2;
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <div className="navbar">
        {isMobile ? (
          <>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer(true)}
              className="menu-button"
            >
              ☰
            </IconButton>

            <Drawer
              anchor="left"
              open={drawerOpen}
              onClose={toggleDrawer(false)}
              PaperProps={{
                sx: { width: "30%" },
              }}
            >
              <div className="drawer-content">
                <Button className="mobile-quests-button" variant="outlined" onClick={() => setMissionsModalOpen(true)}>
                  Quests
                </Button>
                <Button className="mobile-quests-button" variant="outlined" onClick={() => setTeamModalOpen(true)}>
                  Team
                </Button>
                <Button className="mobile-quests-button" variant="outlined" onClick={() => setHeistsModalOpen(true)}>
                  Heists
                </Button>
                <Balances {...balances} />
              </div>
            </Drawer>
          </>
        ) : (
          <Balances {...balances} />
        )}
        <div className="navbar-right">
          <Button
            variant="outlined"
            onClick={() => setMissionsModalOpen(true)}
            className="desktop-only"
            style={{
              marginRight: "10px",
              height: "100%",
              color: "black",
              backgroundColor: "gold",
              borderColor: "gold",
            }}
          >
            <div className="shining-container">
              <div className="shining-effect"></div>
            </div>
            Quests
          </Button>
          <Button
            variant="outlined"
            onClick={() => setTeamModalOpen(true)}
            className="desktop-only"
            style={{
              marginRight: "10px",
              height: "100%",
              color: "black",
              backgroundColor: "gold",
              borderColor: "gold",
            }}
          >
            Team
          </Button>
          <Button
            variant="outlined"
            onClick={() => setHeistsModalOpen(true)}
            className="desktop-only"
            style={{
              marginRight: "10px",
              height: "100%",
              color: "black",
              backgroundColor: "gold",
              borderColor: "gold",
            }}
          >
            Heists
          </Button>

          <Box display="flex" alignItems="center" height="100%">
            <Tooltip title="Collect dirty cash generated from illegal activities.">
              <Button
                variant="outlined"
                onClick={handleCollectDirtyCash}
                style={{
                  marginRight: "10px",
                  height: "100%",
                  color: "white",
                  borderColor: '#04c983',
                  backgroundColor: 'rgba(16, 185, 129, .3)',
                }}
              >
                Collect ${estimatedDirtyCash}{" "}
                <img src="/dirty-money.png" style={{ paddingLeft: "5px" }} width="32" alt="Dirty Cash" />
              </Button>
            </Tooltip>
            <Tooltip title="Launder collected dirty cash to convert it into clean cash, losing 30% in the process.">
              <Button
                variant="outlined"
                onClick={handleCollectCleanCash}
                style={{
                  marginRight: "10px",
                  height: "100%",
                  color: "white",
                  borderColor: '#04c983',
                  backgroundColor: 'rgba(16, 185, 129, .3)',
                }}
              >
                Launder ${estimatedCleanCash}{" "}
                <img src="/clean-money.png" style={{ paddingLeft: "5px" }} width="32" alt="Clean Cash" />
              </Button>
            </Tooltip>
            <IconButton className="desktop-only" onClick={handleMenuClick}>
              {/* <SettingsIcon /> */}⚙️
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              style={{ overflow: "visible" }}
            >
              <MenuItem onClick={toggleAudio}>{isPlaying ? "Mute Sound 🔇" : "Play Sound 🔊"}</MenuItem>
              <MenuItem onClick={() => (window.location.href = "/")}>Home Page</MenuItem>
              <MenuItem>
                <WalletMultiButton />
              </MenuItem>
            </Menu>
          </Box>
        </div>
        <MissionsModal open={missionsModalOpen} onClose={() => setMissionsModalOpen(false)} />
        <HeistsModal open={heistsModalOpen} enforcers={balances.enforcers} hitmen={balances.hitmen} onClose={() => setHeistsModalOpen(false)} />
        <TeamModal
          open={teamModalOpen}
          onClose={() => setTeamModalOpen(false)}
          playerXp={balances.xp}
          playerDirtyCash={balances.dirtyCash}
        />
        <audio ref={audioRef} src="/background-music.mp3" loop />
      </div>
    </ThemeProvider>
  );
};

export default Navbar;
