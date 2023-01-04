use cosmwasm_schema::{cw_serde, QueryResponses};
use cosmwasm_std::{Addr, Api, Coin, StdResult};
use cw20::{Cw20Coin, Cw20ReceiveMsg};

#[cw_serde]
pub struct InstantiateMsg {}

#[cw_serde]
pub enum ExecuteMsg {
    Create(CreateMsg),
    TopUp { id: String },
    SetReceipient { id: String, recipient: String },
    Approve { id: String },
    Refund { id: String },
    Receive(Cw20ReceiveMsg),
}

#[cw_serde]
pub struct CreateMsg {
    pub id: String,
    pub arbiter: String,
    pub recipient: Option<String>,
    pub title: String,
    pub description: String,
    pub end_height: Option<u64>,
    pub cw20_whitelist: Option<Vec<String>>,
}

impl CreateMsg {
    pub fn addr_whitelist(
        &self,
        api: &dyn Api,
    ) -> StdResult<Vec<Addr>> {
        match self.cw20_whitelist.as_ref() {
            Some(v) => v
                .iter()
                .map(|h| api.addr_validate(h))
                .collect(),
            None => Ok(vec![]),
        }
    }
}

#[cw_serde]
pub enum ReceiveMsg {
    Create(CreateMsg),
    TopUp { id: String },
}

#[cw_serde]
#[derive(QueryResponses)]
pub enum QueryMsg {
    #[returns[ListResponse]]
    List {},
    #[returns(DetailResponse)]
    Detail { id: String },
}

#[cw_serde]
pub struct ListResponse {
    // List escrow id
    pub ids: Vec<String>,
}

#[cw_serde]
pub struct DetailResponse {
    pub id: String,
    pub arbiter: String,
    pub recipient: Option<String>,
    pub source: String,
    pub title: String,
    pub description: String,
    pub end_height: Option<u64>,
    pub native_balance: Vec<Coin>,
    pub cw20_balance: Vec<Cw20Coin>,
    pub cw20_whitelist: Vec<String>,
}
