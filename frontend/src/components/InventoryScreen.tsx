import React, { useEffect, useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { Button, Grid, Typography, Box } from '@mui/material';
import SiteNavigation from './SiteNavigation';
import useProgram from '../hooks/useProgram';
import './InventoryScreen.css';

const InventoryScreen: React.FC = () => {
  const wallet = useWallet();
  const connection = useConnection();
  const program = useProgram();

  const [playerAccount, setPlayerAccount] = useState<any>(null);
  const [inventoryAccount, setInventoryAccount] = useState<any>(null);
  const [rings, setRings] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      if (!wallet.publicKey || !program) {
        setLoading(false);
        setError('Wallet is not connected');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [playerPda] = await PublicKey.findProgramAddress(
          [Buffer.from('PLAYER'), wallet.publicKey.toBuffer()],
          program.programId
        );

        const [inventoryPda] = await PublicKey.findProgramAddress(
          [Buffer.from('INVENTORY'), wallet.publicKey.toBuffer()],
          program.programId
        );

        // @ts-ignore
        const player = await program.account.player.fetch(playerPda);
        setPlayerAccount(player);

        // Fetch inventory account if initialized
        try {
            // @ts-ignore
          const inventory = await program.account.inventory.fetch(inventoryPda);
          setInventoryAccount(inventory);
        } catch (err) {
          console.log('Inventory account not initialized');
          setInventoryAccount(null);
        }
      } catch (err) {
        setError('Failed to fetch accounts');
        setInventoryAccount(null);
        setPlayerAccount(null);
        console.error(err);
      }

      setLoading(false);
    };

    fetchAccounts();
  }, [wallet.publicKey, program]);

  const initializeInventory = async () => {
    if (!wallet.publicKey || !program) return;

    setLoading(true);
    setError(null);

    const [inventoryPda] = await PublicKey.findProgramAddress(
      [Buffer.from('INVENTORY'), wallet.publicKey.toBuffer()],
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
      setError('Failed to initialize inventory');
      console.error(err);
    }

    setLoading(false);
  };

  const renderInventoryItems = () => {
    const items = [];

    // Add hardcoded "PRESEASON BADGE"
    items.push({ name: 'PRE-SEASON BADGE', image: '/early-bird.png' });

    if (inventoryAccount) {
      // Add items from inventory account (for now only "Thief")
      inventoryAccount.items.forEach((item: any) => {
        if (item.thief) {
          items.push({ name: 'Albert - LVL1', image: '/albert.png' });
        }
      });

      // Add Lootbox if claimed in player account
      if (playerAccount && playerAccount.lootboxLevel > 0) {
        const lootboxImage = `/lootbox-${playerAccount.lootboxLevel}.png`;
        items.push({ name: `LOOTBOX LVL${playerAccount.lootboxLevel}`, image: lootboxImage });
      }
    }

    // Ensure at least 9 grid items
    while (items.length < 9) {
      items.push({ name: '', image: '' });
    }

    return items.map((item, index) => (
      <Grid item xs={4} key={index} className="inventory-grid-item">
        {item.image ? (
          <>
            <div className="inventory-item">
              <div className="shining-container">
                <div className="shining-effect"></div>
              </div>
              <img src={item.image} alt={item.name} />
              <Typography className="item-label">{item.name}</Typography>
            </div>
          </>
        ) : (
          <div className="inventory-item empty"></div>
        )}
      </Grid>
    ));
  };

  return (
    <div className="inventory-page">
      <SiteNavigation />
      <Box p={2} className="inventory-page-container">
        {loading && <p className="loading">Loading...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && playerAccount && (
          <>
            <div className="balances">
              <Typography variant="h6">Silver: {playerAccount.silver.toNumber()}</Typography>
              {/* <Typography variant="h6">Rings: 0 <img src="/rings.png" width="24" alt="ring" /></Typography> */}
            </div>
            {!inventoryAccount ? (
              <>
                <hr />
                <Button variant="contained" style={{background: '#f2b24e', color: "#000", width: "100%"}} color="primary" onClick={initializeInventory}>
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
