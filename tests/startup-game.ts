import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { expect } from "chai";
import { StartupGame } from "../target/types/startup_game";

describe("startup-game", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.StartupGame as Program<StartupGame>;

  let owner = provider.wallet.publicKey;
  let playerPda: anchor.web3.PublicKey;
  let inventoryPda: anchor.web3.PublicKey;

  before(async () => {
    [playerPda] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("PLAYER"), owner.toBuffer()],
      program.programId
    );

    [inventoryPda] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("INVENTORY"), owner.toBuffer()],
      program.programId
    );
  });

  it("Player account is initialized", async () => {
    const owner = provider.wallet.publicKey;

    await program.methods
      .initializePlayer()
      .accounts({
        owner: owner,
      })
      .rpc();

    const playerAccount = await program.account.player.fetch(playerPda);

    expect(playerAccount.isInitialized).to.be.true;
    expect(playerAccount.owner.toString()).to.equal(owner.toString());
  });

  it("CannabisFarm purchase should fail due to InsufficientExperience", async () => {
    try {
      const roomType = { cannabisFarm: {} };
      await program.methods
        .purchaseRoom(roomType)
        .accounts({
          player: playerPda,
        })
        .rpc();
    } catch (err) {
      expect(err.error.errorMessage).to.equal("Insufficient experience to purchase this room.");
    }
  });

  it("Saferoom purchase should fail due to not enough funds", async () => {
    try {
      const roomType = { saferoom: {} };
      await program.methods
        .purchaseRoom(roomType)
        .accounts({
          player: playerPda,
        })
        .rpc();
    } catch (err) {
      expect(err.error.errorMessage).to.equal("Insufficient funds.");
    }
  });

  it("Fails to claim quest that is not completed", async () => {
    try {
      // Quest 1: Build Laundry
      await program.methods
        .claimQuestReward(0)
        .accounts({
          player: playerPda,
        })
        .rpc();
    } catch (err) {
      expect(err.error.errorMessage).to.equal("The quest has not been completed.");
    }
  });

  it("Laundry purchase should be successful", async () => {
    const roomType = { laundry: {} };
    await program.methods
      .purchaseRoom(roomType)
      .accounts({
        player: playerPda,
      })
      .rpc();

    const playerAccount = await program.account.player.fetch(playerPda);
    expect(playerAccount.rooms.length).to.equal(1);
    expect(playerAccount.rooms[0].roomType).deep.equal(roomType);
  });

  it("Claim 'Quest 1: Build Laundry' reward successfully", async () => {
    await program.methods
      .claimQuestReward(0)
      .accounts({
        player: playerPda,
      })
      .rpc();

    const updatedPlayerAccount = await program.account.player.fetch(playerPda);
    expect(Number(updatedPlayerAccount.silver)).to.equal(100);
  });

  it("Fails to claim the same quest reward again", async () => {
    try {
      await program.methods
        .claimQuestReward(0)
        .accounts({
          player: playerPda,
        })
        .rpc();
    } catch (err) {
      expect(err.error.errorMessage).to.equal("The quest reward has already been claimed.");
    }

    const updatedPlayerAccount = await program.account.player.fetch(playerPda);
    expect(Number(updatedPlayerAccount.silver)).to.equal(100);
  });

  it("Another Laundry purchase attempt should fail due to RoomAlreadyOwned", async () => {
    try {
      const roomType = { laundry: {} };
      await program.methods
        .purchaseRoom(roomType)
        .accounts({
          player: playerPda,
        })
        .rpc();
    } catch (err) {
      expect(err.error.errorMessage).to.equal("Room already owned.");
    }
  });

  it("Purchase UnlicensedBar and collect dirty cash after 5 seconds", async () => {
    // Purchase the Unlicensed Bar
    const unlicensedBarType = { unlicensedBar: {} };
    await program.methods
      .purchaseRoom(unlicensedBarType)
      .accounts({
        player: playerPda,
      })
      .rpc();

    // Wait for 5 seconds to give the room time to produce dirty cash
    await new Promise((resolve) => setTimeout(resolve, 5000));

    await program.methods
      .collectDirtyCash()
      .accounts({
        player: playerPda,
      })
      .rpc();

    const playerAccount = await program.account.player.fetch(playerPda);
    // Check if dirty cash has been collected
    expect(playerAccount.dirtyCash.gt(new anchor.BN(0))).to.be.true;
  });

  it("Claim 'Quest 2: Build Unlicensed Bar' reward successfully", async () => {
    await program.methods
      .claimQuestReward(1)
      .accounts({
        player: playerPda,
      })
      .rpc();

    const updatedPlayerAccount = await program.account.player.fetch(playerPda);
    expect(Number(updatedPlayerAccount.silver)).to.equal(200);
  });
  /*
  it("Collect clean cash from Laundry after 5 seconds", async () => {
    // Wait for 5 seconds to give the room time to produce clean cash
    await new Promise((resolve) => setTimeout(resolve, 5000));

    await program.methods
      .collectCleanCash()
      .accounts({
        player: playerPda,
      })
      .rpc();

    const playerAccount = await program.account.player.fetch(playerPda);

    // Check if clean cash has been collected
    expect(playerAccount.cleanCash.gt(new anchor.BN(0))).to.be.true;
  });
*/
  it("Fails to recruit enforcers without Security Room", async () => {
    try {
      await program.methods
        .recruitUnits(new anchor.BN(5), new anchor.BN(0))
        .accounts({
          player: playerPda,
        })
        .rpc();
    } catch (err) {
      expect(err.error.errorMessage).to.equal("No Security Room.");
    }
  });

  it("Fails to claim lootbox: player has insufficient experience", async () => {
    try {
      await program.methods
        .claimLootbox()
        .accounts({
          player: playerPda,
        })
        .rpc();
    } catch (err) {
      expect(err.error.errorMessage).to.equal("The player has insufficient experience.");
    }
  });

  it("Initialize Inventory if not already initialized and recruit Thief", async () => {
    let inventoryAccount;
    try {
      inventoryAccount = await program.account.inventory.fetch(inventoryPda);
      console.log("Inventory account found:", inventoryAccount);
    } catch (err) {
      console.log("Inventory not found, initializing...");
      await program.methods
        .initializeInventory()
        .accounts({
          owner: owner,
        })
        .rpc();

      inventoryAccount = await program.account.inventory.fetch(inventoryPda);
    }

    expect(inventoryAccount.isInitialized).to.be.true;

    await program.methods
      .recruitTeamMember({ thief: {} })
      .accounts({
        player: playerPda,
        inventory: inventoryPda,
      })
      .rpc();

    inventoryAccount = await program.account.inventory.fetch(inventoryPda);
    expect(inventoryAccount.items[0]).deep.equal({ thief: {} });
  });

  it("Claim 'Quest 11: Recruit Thief' reward successfully", async () => {
    await program.methods
      .claimQuestReward(11)
      .accounts({
        player: playerPda,
      })
      .rpc();

    const updatedPlayerAccount = await program.account.player.fetch(playerPda);
    expect(Number(updatedPlayerAccount.silver)).to.equal(300);
  });

  it("Claim OKX Lootbox successfully", async () => {
    await program.methods
      .claimOkxLootbox()
      .accounts({
        inventory: inventoryPda,
        // owner: owner,
      })
      .rpc();

    const inventoryAccount = await program.account.inventory.fetch(inventoryPda);
    expect(inventoryAccount.items).to.deep.include({ okxLootbox: {} });
  });

  it("Fail to claim OKX Lootbox again", async () => {
    try {
      await program.methods
        .claimOkxLootbox()
        .accounts({
          inventory: inventoryPda,
          //owner: owner,
        })
        .rpc();
    } catch (err) {
      expect(err.error.errorMessage).to.equal("Item already claimed.");
    }

    const inventoryAccount = await program.account.inventory.fetch(inventoryPda);
    expect(inventoryAccount.items.filter((item) => item.okxLootbox).length).to.equal(1);
  });

  it("Successfully open OKX Lootbox", async () => {
    await program.methods
      .openOkxLootbox()
      .accounts({
        player: playerPda,
        inventory: inventoryPda,
        // owner: owner,
      })
      .rpc();

    const inventoryAccount = await program.account.inventory.fetch(inventoryPda);
    expect(inventoryAccount.items).to.deep.include({ openedOkxLootbox: {} });

    const playerAccount = await program.account.player.fetch(playerPda);
    expect(Number(playerAccount.dirtyCash)).to.gte(1000);
    expect(Number(playerAccount.silver)).to.gte(250);
  });

  it("Fail to claim OKX Lootbox after opening", async () => {
    try {
      await program.methods
        .claimOkxLootbox()
        .accounts({
          inventory: inventoryPda,
          // owner: owner,
        })
        .rpc();
    } catch (err) {
      expect(err.error.errorMessage).to.equal("Item already claimed.");
    }

    const inventoryAccount = await program.account.inventory.fetch(inventoryPda);
    expect(inventoryAccount.items.filter((item) => item.okxLootbox || item.openedOkxLootbox).length).to.equal(1);
  });
});
