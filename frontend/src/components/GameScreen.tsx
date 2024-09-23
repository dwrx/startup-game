import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import "../styles.css";
import Navbar from "./Navbar";
import Room from "./Room";
import useProgram from "../hooks/useProgram";
import { legalRooms as allLegalRooms, illegalRooms as allIllegalRooms } from "../rooms";
import { JSX } from "react/jsx-runtime";

const GameScreen: React.FC = () => {
  const wallet = useWallet();
  const program = useProgram();
  const [playerData, setPlayerData] = useState<any>(null);
  const [legalRooms, setLegalRooms] = useState<any[]>([]);
  const [illegalRooms, setIllegalRooms] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any>(null);
  const allRooms = [...allLegalRooms, ...allIllegalRooms];

  useEffect(() => {
    const fetchPlayerData = async () => {
      if (!wallet.publicKey || !program) return;

      const [playerPda] = await PublicKey.findProgramAddress(
        [Buffer.from("PLAYER"), wallet.publicKey.toBuffer()],
        program.programId
      );

      try {
        // @ts-ignore
        const playerAccount = await program.account.player.fetch(playerPda);
        setPlayerData(playerAccount);

        const legal = playerAccount.rooms.filter(
          (room: any) => room.roomType.laundry || room.roomType.fastFoodRestaurant || room.roomType.fitnessCenter
        );
        const illegal = playerAccount.rooms.filter(
          (room: any) =>
            room.roomType.cannabisFarm ||
            room.roomType.casino ||
            room.roomType.unlicensedBar ||
            room.roomType.saferoom ||
            room.roomType.securityRoom ||
            room.roomType.stripClub
        );

        setLegalRooms(legal);
        setIllegalRooms(illegal);

        console.log("Player account:", JSON.stringify(playerAccount));
      } catch (err) {
        console.error("Failed to fetch player account:", err);
      }

      try {
        const [inventoryPda] = await PublicKey.findProgramAddress(
          [Buffer.from("INVENTORY"), wallet.publicKey.toBuffer()],
          program.programId
        );
        // @ts-ignore
        const inventoryAccount = await program.account.inventory.fetch(inventoryPda);
        setInventory(inventoryAccount);
      } catch (err) {
        console.log("Inventory account not initialized", err);
        setInventory(null);
      }
    };

    fetchPlayerData();
  }, [wallet.publicKey, program]);

  const handlePurchase = (room: any, isLegal: boolean) => {
    return; 

    if (isLegal) {
      setLegalRooms([...legalRooms, room]);
    } else {
      setIllegalRooms([...illegalRooms, room]);
    }
  };

  const checkUpgradeAvailability = (room: any) => {
    if (!inventory || !inventory.items) {
      return false;
    }
    const matchedRoom = allRooms.find((r) => JSON.stringify(r.roomType) === JSON.stringify(room.roomType));
    console.log('matchedRoom', matchedRoom);
    if (!matchedRoom || !matchedRoom.upgradeItem) {
      return false;
    }
    const playerHasItem = inventory.items.find((item: any) => item[matchedRoom.upgradeItem.name]);
    return !!playerHasItem;
  };

  const renderRooms = (rooms: any[], startIndex: number, isLegal: boolean) => {
    const roomComponents: JSX.Element[] = [];
    if (!playerData) {
      return roomComponents;
    }
    for (let i = 0; i < rooms.length; i++) {
      const isUpgradeAvailable = checkUpgradeAvailability(rooms[i]);
      roomComponents.push(
        <Room
          key={startIndex + i}
          className={`room room-${startIndex + i + 1}`}
          isLegal={isLegal}
          playerCash={playerData.cleanCash.toNumber()}
          playerLevel={playerData.experience.toNumber()}
          onPurchase={handlePurchase}
          roomData={rooms[i]}
          isUpgradeAvailable={isUpgradeAvailable}
        />
      );
    }

    const placeholdersCount = isLegal ? 3 - rooms.length : 6 - rooms.length;
    for (let i = 0; i < placeholdersCount; i++) {
      roomComponents.push(
        <Room
          key={startIndex + rooms.length + i}
          className={`room room-${startIndex + rooms.length + i + 1}`}
          isLegal={isLegal}
          playerCash={playerData.cleanCash.toNumber()}
          playerLevel={playerData.experience.toNumber()}
          onPurchase={handlePurchase}
        />
      );
    }

    return roomComponents;
  };

  return (
    <div className="game-screen">
      <Navbar />
      <div className="game-container">
        <div className="background">
          {renderRooms(legalRooms, 0, true)}
          {renderRooms(illegalRooms, 3, false)}
        </div>
      </div>
    </div>
  );
};

export default GameScreen;
