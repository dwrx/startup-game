use anchor_lang::error_code;

#[error_code]
pub enum PlayerError {
    #[msg("The player account is already initialized.")]
    AlreadyInitialized,
    #[msg("The player has insufficient experience.")]
    InsufficientExperience,
    #[msg("The lootbox has already been claimed.")]
    LootboxAlreadyClaimed,
    #[msg("The quest has not been completed.")]
    QuestNotCompleted,
    #[msg("The quest reward has already been claimed.")]
    RewardAlreadyClaimed,
    #[msg("The lootbox has not been claimed yet.")]
    LootboxNotClaimed,
    #[msg("The player has reached the maximum lootbox level.")]
    MaxLevelReached,
    #[msg("The player does not have enough silver.")]
    InsufficientSilver,
    #[msg("Heist already in progress.")]
    HeistAlreadyInProgress,
    #[msg("Insufficient units for heist.")]
    InsufficientUnitsForHeist,
    #[msg("Not enough time has passed to complete the heist.")]
    HeistNotYetComplete,
    #[msg("No active heist.")]
    NoActiveHeist,
    #[msg("Timestamp overflow.")]
    TimeOverflow,
}

#[error_code]
pub enum RoomError {
    #[msg("Insufficient experience to purchase this room.")]
    InsufficientExperience,
    #[msg("Room already owned.")]
    RoomAlreadyOwned,
    #[msg("Insufficient funds.")]
    InsufficientFunds,
    #[msg("Player has too many units recruited.")]
    Overflow,
    #[msg("Security Room level too low.")]
    SecurityRoomLevelTooLow,
    #[msg("No Security Room.")]
    NoSecurityRoom,
}

#[error_code]
pub enum InventoryError {
    #[msg("The inventory account is already initialized.")]
    AlreadyInitialized,
    #[msg("Insufficient experience.")]
    InsufficientExperience,
    #[msg("Insufficient funds.")]
    InsufficientFunds,
    #[msg("The inventory has not been initialized.")]
    UninitializedAccount,
    #[msg("The inventory item is not allowed.")]
    InvalidItem,
    #[msg("The inventory already has this team member.")]
    AlreadyRecruited,
    #[msg("Item already claimed.")]
    AlreadyClaimed,
    #[msg("Lootbox not found in inventory.")]
    LootboxNotFound,
    #[msg("Overflow occurred.")]
    Overflow,
}
