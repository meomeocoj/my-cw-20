use cosmwasm_schema::cw_serde;
use cosmwasm_std::{Addr, Coin, Env, StdResult, Storage};
use cw20::{Balance, Cw20CoinVerified};
use cw_storage_plus::Map;

#[cw_serde]
#[derive(Default)]
pub struct GenericBalance {
    pub native: Vec<Coin>,
    pub cw20: Vec<Cw20CoinVerified>,
}

impl GenericBalance {
    pub fn add_token(&mut self, add: Balance) {
        match add {
            Balance::Native(native) => {
                for token in native.0 {
                    let index = self
                        .native
                        .iter()
                        .enumerate()
                        .find_map(|(i, val)| {
                            if val.denom == token.denom {
                                Some(i)
                            } else {
                                None
                            }
                        });
                    match index {
                        Some(idx) => {
                            self.native[idx].amount +=
                                token.amount
                        }
                        None => self.native.push(token),
                    }
                }
            },
            Balance::Cw20(token) => {
                let index = self
                    .cw20
                    .iter()
                    .enumerate()
                    .find_map(|(i, val)| {
                        if val.address == token.address {
                            Some(i)
                        } else {
                            None
                        }
                    });
                match index {
                    Some(idx) => {
                        self.cw20[idx].amount +=
                            token.amount
                    }
                    None => self.cw20.push(token),
                }
            }
        }
    }
}

#[cw_serde]
pub struct Escrow {
    pub arbiter: Addr,
    pub source: Addr,
    pub recipient: Option<Addr>,
    pub title: String,
    pub description: String,
    pub end_height: Option<u64>,
    pub balance: GenericBalance,
    pub cw20_whitelist: Vec<Addr>,
}

impl Escrow {
    pub fn is_expried(&self, env: &Env) -> bool {
        if let Some(end_height) = self.end_height {
            if env.block.height > end_height {
                return true;
            }
        }
        false
    }

    pub fn human_readable_whitelist(&self) -> Vec<String> {
        self.cw20_whitelist
            .iter()
            .map(|a| a.to_string())
            .collect()
    }
}

pub const ESCROWS: Map<&str, Escrow> = Map::new("escrows");

pub fn all_escrow_id(
    storage: &dyn Storage,
) -> StdResult<Vec<String>> {
    ESCROWS
        .keys(
            storage,
            None,
            None,
            cosmwasm_std::Order::Ascending,
        )
        .collect()
}
