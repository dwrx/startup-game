use anchor_lang::error_code;

#[error_code]
pub enum PlayerError {
    #[msg("The player account is already initialized.")]
    AlreadyInitialized,
}

#[error_code]
pub enum RoomError {
    #[msg("Insufficient experience to purchase this room.")]
    InsufficientExperience,
    #[msg("Room already owned.")]
    RoomAlreadyOwned,
    #[msg("Insufficient funds.")]
    InsufficientFunds,
}
