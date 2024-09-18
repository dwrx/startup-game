import React, { useEffect, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { Button, Grid, Typography, Box } from "@mui/material";
import { useLocation } from "react-router-dom";
import SiteNavigation from "./SiteNavigation";
import useProgram from "../hooks/useProgram";
import "./InventoryScreen.css";

const InventoryScreen: React.FC = () => {
  const location = useLocation();
  const wallet = useWallet();
  const connection = useConnection();
  const program = useProgram();

  const [playerAccount, setPlayerAccount] = useState<any>(null);
  const [inventoryAccount, setInventoryAccount] = useState<any>(null);
  const [rings, setRings] = useState<number>(0);
  const [isOKApp, setIsOKApp] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showInfoWindow, setShowInfoWindow] = useState<boolean>(false);

  const getPlayerFromUrl = (): PublicKey | null => {
    const params = new URLSearchParams(location.search);
    const playerParam = params.get("player");

    if (playerParam) {
      try {
        return new PublicKey(playerParam);
      } catch (e) {
        console.error("Invalid public key in URL:", playerParam);
        return null;
      }
    }
    return null;
  };

  const fetchAccounts = async (playerAddress: PublicKey | null = null) => {
    const pubKey = playerAddress !== null ? playerAddress : wallet.publicKey;
    if (!pubKey || !program) {
      setLoading(false);
      setError("Wallet is not connected");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [playerPda] = await PublicKey.findProgramAddress(
        [Buffer.from("PLAYER"), pubKey.toBuffer()],
        program.programId
      );

      const [inventoryPda] = await PublicKey.findProgramAddress(
        [Buffer.from("INVENTORY"), pubKey.toBuffer()],
        program.programId
      );

      // @ts-ignore
      const player = await program.account.player.fetch(playerPda);
      setPlayerAccount(player);

      try {
        // @ts-ignore
        const inventory = await program.account.inventory.fetch(inventoryPda);
        setInventoryAccount(inventory);
      } catch (err) {
        console.log("Inventory account not initialized");
        setInventoryAccount(null);
      }
    } catch (err) {
      setError("Failed to fetch accounts");
      setInventoryAccount(null);
      setPlayerAccount(null);
      console.error(err);
    }

    setLoading(false);
  };

  useEffect(() => {
    const ua = navigator.userAgent;
    setIsOKApp(/OKApp/i.test(ua));

    const playerFromUrl = getPlayerFromUrl();
    if (playerFromUrl) {
      fetchAccounts(playerFromUrl);
    } else if (wallet.publicKey) {
      fetchAccounts();
    } else {
      setLoading(false);
      setError("Wallet is not connected");
    }
  }, [wallet.publicKey, program]);

  const initializeInventory = async () => {
    if (!wallet.publicKey || !program) return;

    setLoading(true);
    setError(null);

    const [inventoryPda] = await PublicKey.findProgramAddress(
      [Buffer.from("INVENTORY"), wallet.publicKey.toBuffer()],
      program.programId
    );

    try {
      await program.rpc.initializeInventory({
        accounts: {
          inventory: inventoryPda,
          owner: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
      });
      setInventoryAccount({ items: [] });
    } catch (err) {
      setError("Failed to initialize inventory");
      console.error(err);
    }

    setLoading(false);
  };

  const renderInventoryItems = () => {
    const itemsMap: { [key: string]: any } = {};

    // Add Lootbox if claimed in player account
    if (playerAccount && playerAccount.lootboxLevel > 0) {
      const lootboxImage = `/lootbox-${playerAccount.lootboxLevel}.png`;
      const lootboxKey = `LOOTBOX LVL${playerAccount.lootboxLevel}`;
      itemsMap[lootboxKey] = {
        name: lootboxKey,
        image: lootboxImage,
        count: 1,
      };
    }

    // Add hardcoded "PRE-SEASON BADGE"
    // itemsMap["PRE-SEASON BADGE"] = {
    //   name: "PRE-SEASON BADGE",
    //   image: "/early-bird.png",
    //   count: 1,
    // };

    if (inventoryAccount) {
      inventoryAccount.items.forEach((item: any) => {
        let itemKey = "";
        let itemImage = "";

        if (item.thief) {
          itemKey = "Albert - LVL1";
          itemImage = "/albert.png";
        } else if (item.okxLootbox) {
          itemKey = "OKX LOOTBOX";
          itemImage = "/okx-promo.png";
        } else if (item.openedOkxLootbox) {
          itemKey = "OKX LOOTBOX (Opened)";
          itemImage = "/okx-promo.png";
        } else if (item.washingMachine) {
          itemKey = "Washing Machine";
          itemImage = "/loot/washing-machine.png";
        } else if (item.microwaveOven) {
          itemKey = "Microwave Oven";
          itemImage = "/loot/microwave-oven.png";
        } else if (item.whiskey) {
          itemKey = "Whiskey";
          itemImage = "/loot/whiskey.png";
        } else if (item.slotMachine) {
          itemKey = "Slot Machine";
          itemImage = "/loot/slot-machine.png";
        } else if (item.cannabisSeeds) {
          itemKey = "Cannabis Seeds";
          itemImage = "/loot/cannabis-seeds.png";
        } else if (item.vipLoungeFurniture) {
          itemKey = "VIP Lounge Furniture";
          itemImage = "/loot/vip-lounge-furniture.png";
        } else if (item.boxingSandbag) {
          itemKey = "Boxing Sandbag";
          itemImage = "/loot/boxing-sandbag.png";
        }

        if (itemKey) {
          if (itemsMap[itemKey]) {
            itemsMap[itemKey].count++;
          } else {
            itemsMap[itemKey] = {
              name: itemKey,
              image: itemImage,
              count: 1,
              opened: itemKey.includes("Opened") ? true : undefined,
            };
          }
        }
      });
    }

    // Ensure at least 9 grid items
    const itemsArray = Object.values(itemsMap);
    while (itemsArray.length < 9) {
      itemsArray.push({ name: "", image: "", count: 0 });
    }

    return itemsArray.map(
      (item: { name: string; image: string; count: number; opened: boolean | undefined }, index: number) => (
        <Grid item xs={4} key={index} className="inventory-grid-item">
          {item.image ? (
            <div className={`inventory-item ${item.opened ? "grayscale" : ""}`}>
              <div className="shining-container">
                <div className="shining-effect"></div>
              </div>
              <img src={item.image} alt={item.name} />
              {item.count > 1 && <span className="item-count">{item.count}</span>}
              {item.opened && <span className="opened-label">OPENED</span>}
              <Typography className="item-label">
                {item.opened ? (
                  item.name
                ) : item.name === "OKX LOOTBOX" ? (
                  <Button
                    variant="contained"
                    style={{ backgroundColor: "#f2b24e", color: "#000", marginTop: "10px" }}
                    onClick={() => openLootbox()}
                  >
                    Open
                  </Button>
                ) : (
                  item.name
                )}
              </Typography>
            </div>
          ) : (
            <div className="inventory-item empty"></div>
          )}
        </Grid>
      )
    );
  };

  const claimLootbox = async () => {
    if (!wallet.publicKey || !program) return;

    setLoading(true);
    setError(null);

    try {
      const [inventoryPda] = await PublicKey.findProgramAddress(
        [Buffer.from("INVENTORY"), wallet.publicKey.toBuffer()],
        program.programId
      );
      await program.rpc.claimOkxLootbox({
        accounts: {
          inventory: inventoryPda,
          owner: wallet.publicKey,
        },
      });
      // Re-fetch accounts after claiming
      fetchAccounts();
    } catch (err) {
      setError("Failed to claim OKX Lootbox");
      console.error(err);
    }

    setLoading(false);
  };

  const openLootbox = async () => {
    if (!wallet.publicKey || !program) return;

    setLoading(true);
    setError(null);

    try {
      const [playerPda] = await PublicKey.findProgramAddress(
        [Buffer.from("PLAYER"), wallet.publicKey.toBuffer()],
        program.programId
      );

      const [inventoryPda] = await PublicKey.findProgramAddress(
        [Buffer.from("INVENTORY"), wallet.publicKey.toBuffer()],
        program.programId
      );
      await program.rpc.openOkxLootbox({
        accounts: {
          player: playerPda,
          inventory: inventoryPda,
          owner: wallet.publicKey,
        },
      });
      // Re-fetch accounts after opening
      fetchAccounts();
      setShowInfoWindow(true);
    } catch (err) {
      setError("Failed to open OKX Lootbox");
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div className="inventory-page" style={{ overflowY: "scroll" }}>
      <SiteNavigation />
      {isOKApp &&
        !loading &&
        playerAccount &&
        inventoryAccount &&
        !inventoryAccount.items.some((item: any) => item.okxLootbox || item.openedOkxLootbox) && (
          <Box className="okx-banner">
            <Box className="banner-text">
              <Typography variant="h6" className="banner-title">
                You are eligible to claim exclusive loot box for OKX Wallet users.
              </Typography>
              <Button
                variant="contained"
                onClick={() => claimLootbox()}
                style={{ backgroundColor: "#f2b24e", color: "#000", marginTop: "10px" }}
              >
                Claim
              </Button>
            </Box>
            <Box className="banner-image">
              <img src="/okx-promo.png" alt="OKX loot box" />
            </Box>
          </Box>
        )}
      <Box p={2} className="inventory-page-container" style={{ marginBottom: "75px" }}>
        {loading && <p className="loading">Loading...</p>}
        {error && <p className="error">{error}</p>}
        {showInfoWindow && (
          <div className="info-window">
            <Box className="info-content">
              <Typography variant="body1" className="opening-result">
                You received 1000{" "}
                <img src="/dirty-money.png" width="24" alt="dirty cash" style={{ verticalAlign: "middle" }} />, 250{" "}
                <img src="/silver.png" width="24" style={{ verticalAlign: "middle" }} alt="silver" /> and 1{" "}
                <img src="/rings.png" width="24" style={{ verticalAlign: "middle" }} alt="rings" />
              </Typography>
            </Box>
          </div>
        )}
        {!loading && playerAccount && (
          <>
            <div className="balances">
              <Typography variant="h6">Silver: {playerAccount.silver.toNumber()}</Typography>
              {/* <Typography variant="h6">Rings: 0 <img src="/rings.png" width="24" alt="ring" /></Typography> */}
            </div>
            {!inventoryAccount ? (
              <>
                <hr />
                <Button
                  variant="contained"
                  style={{ background: "#f2b24e", color: "#000", width: "100%" }}
                  color="primary"
                  onClick={initializeInventory}
                >
                  Initialize Inventory
                </Button>
              </>
            ) : (
              <Grid container spacing={2} className="inventory-grid">
                {renderInventoryItems()}
              </Grid>
            )}
          </>
        )}
      </Box>
    </div>
  );
};

export default InventoryScreen;
