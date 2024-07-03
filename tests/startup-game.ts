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

  before(async () => {
    [playerPda] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("PLAYER"), owner.toBuffer()],
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
    console.log(playerAccount);
    // Check if clean cash has been collected
    expect(playerAccount.cleanCash.gt(new anchor.BN(0))).to.be.true;
  });
});
