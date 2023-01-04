use cosmwasm_std::StdError;
use thiserror::Error;

#[derive(Error, Debug, PartialEq)]
pub enum ContractError {
    #[error("{0}")]
    Std(#[from] StdError),

    #[error("Unauthorized")]
    Unauthorized {},

    #[error("Already in use escrow")]
    AlreadyInUse {},

    #[error("Empty balance")]
    EmptyBalance {},

    #[error("Token is not in the whitelist")]
    NotInWhiteList {},

    #[error("Escrow is expired")]
    Expired {},

    #[error("Recipient is not set")]
    RecipientNotSet {},
}
