#[cfg(not(feature = "library"))]

use cosmwasm_std::entry_point;
use cosmwasm_std::{
    from_binary, to_binary, Addr, BankMsg, Binary, Deps,
    DepsMut, Env, MessageInfo, Response, StdResult, SubMsg,
    WasmMsg,
};
use cw20::{
    Balance, Cw20Coin, Cw20CoinVerified, Cw20ExecuteMsg,
    Cw20ReceiveMsg,
};

use crate::{
    msg::{
        CreateMsg, DetailResponse, ExecuteMsg,
        InstantiateMsg, ListResponse, QueryMsg, ReceiveMsg,
    },
    state::{
        all_escrow_id, Escrow, GenericBalance, ESCROWS,
    },

    ContractError,
};

const CONTRACT_NAME: &str = "meomeocoj-cw20-escrow";
const CONTRACT_VERSION: &str = env!("CARGO_PKG_VERSION");

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    _info: MessageInfo,
    _msg: InstantiateMsg,
) -> StdResult<Response> {
    use cw2::set_contract_version;

    set_contract_version(
        deps.storage,
        CONTRACT_NAME,
        CONTRACT_VERSION,
    )?;

    Ok(Response::default())
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, ContractError> {
    match msg {
        ExecuteMsg::Create(msg) => execute_create(
            deps,
            msg,
            Balance::from(info.funds),
            &info.sender,
        ),
        ExecuteMsg::TopUp { id } => execute_top_up(
            deps,
            Balance::from(info.funds),
            id,
        ),
        ExecuteMsg::SetReceipient { id, recipient } => {
            execute_set_receipient(
                deps, info, id, recipient,
            )
        }
        ExecuteMsg::Approve { id } => {
            execute_approve(deps, env, info, id)
        }
        ExecuteMsg::Refund { id } => {
            execute_refund(deps, env, info, id)
        }
        ExecuteMsg::Receive(msg) => {
            execute_receive(deps, info, msg)
        }
    }
}

fn execute_receive(
    deps: DepsMut,
    info: MessageInfo,
    wrapper: Cw20ReceiveMsg,
) -> Result<Response, ContractError> {
    let msg: ReceiveMsg = from_binary(&wrapper.msg)?;

    let balance = Balance::Cw20(Cw20CoinVerified {
        address: info.sender,
        amount: wrapper.amount,
    });
    let sender =
        &deps.api.addr_validate(&wrapper.sender)?;
    match msg {
        ReceiveMsg::Create(msg) => {
            execute_create(deps, msg, balance, sender)
        }
        ReceiveMsg::TopUp { id } => {
            execute_top_up(deps, balance, id)
        }
    }
}

fn execute_refund(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    id: String,
) -> Result<Response, ContractError> {
    let escrow = ESCROWS.load(deps.storage, &id)?;

    if !escrow.is_expried(&env)
        && escrow.arbiter != info.sender
    {
        Err(ContractError::Unauthorized {})
    } else {
        ESCROWS.remove(deps.storage, &id);
        let msgs =
            send_token(&escrow.source, &escrow.balance)?;

        Ok(Response::new()
            .add_attribute("action", "refund")
            .add_attribute("id", id)
            .add_attribute("to", escrow.source.as_str())
            .add_submessages(msgs))
    }
}

fn execute_approve(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    id: String,
) -> Result<Response, ContractError> {
    let escrow = ESCROWS.load(deps.storage, &id)?;

    if info.sender != escrow.arbiter {
        return Err(ContractError::Unauthorized {});
    }

    if escrow.is_expried(&env) {
        return Err(ContractError::Expired {});
    }

    let recipient = escrow
        .recipient
        .ok_or(ContractError::RecipientNotSet {})?;

    let messages = send_token(&recipient, &escrow.balance)?;

    ESCROWS.remove(deps.storage, &id);

    Ok(Response::new()
        .add_attribute("action", "approve")
        .add_attribute("id", id.as_str())
        .add_attribute("to", recipient.as_str())
        .add_submessages(messages))
}

fn send_token(
    recipient: &Addr,
    balance: &GenericBalance,
) -> StdResult<Vec<SubMsg>> {
    let native_balance = &balance.native;

    let mut msgs = if native_balance.is_empty() {
        vec![]
    } else {
        vec![SubMsg::new(BankMsg::Send {
            to_address: recipient.into(),
            amount: native_balance.to_vec(),
        })]
    };

    let cw20_balance = &balance.cw20;

    let cw20_msgs: StdResult<Vec<_>> = cw20_balance
        .iter()
        .map(|c| -> StdResult<SubMsg> {
            let msg = Cw20ExecuteMsg::Transfer {
                recipient: recipient.into(),
                amount: c.amount,
            };

            let exec = SubMsg::new(WasmMsg::Execute {
                contract_addr: c.address.clone().into(),
                msg: to_binary(&msg)?,
                funds: vec![],
            });

            Ok(exec)
        })
        .collect();

    msgs.append(&mut cw20_msgs.unwrap());

    Ok(msgs)
}

fn execute_set_receipient(
    deps: DepsMut,
    info: MessageInfo,
    id: String,
    recipient: String,
) -> Result<Response, ContractError> {
    let mut escrow = ESCROWS.load(deps.storage, &id)?;

    if info.sender != escrow.arbiter {
        return Err(ContractError::Unauthorized {});
    }

    let recipient = deps.api.addr_validate(&recipient)?;

    escrow.recipient = Some(recipient.clone());

    ESCROWS.save(deps.storage, &id, &escrow)?;

    Ok(Response::new().add_attributes(vec![
        ("action", "set_recipient"),
        ("id", id.as_str()),
        ("recipient", recipient.as_str()),
    ]))
}

pub fn execute_create(
    deps: DepsMut,
    msg: CreateMsg,
    balance: Balance,
    sender: &Addr,
) -> Result<Response, ContractError> {
    let mut cw20_whitelist =
        msg.addr_whitelist(deps.api)?;

    let escrow_balance = match balance {
        Balance::Native(native) => GenericBalance {
            native: native.0,
            cw20: vec![],
        },
        Balance::Cw20(cw20) => {
            if !cw20_whitelist
                .iter()
                .any(|t| t == &cw20.address)
            {
                cw20_whitelist.push(cw20.address.clone())
            };
            GenericBalance {
                native: vec![],
                cw20: vec![cw20],
            }
        }
    };

    let recipient = msg.recipient.and_then(|addr| {
        deps.api.addr_validate(addr.as_str()).ok()
    });

    let escrow = Escrow {
        arbiter: deps.api.addr_validate(&msg.arbiter)?,
        recipient,
        source: sender.clone(),
        title: msg.title,
        description: msg.description,
        end_height: msg.end_height,
        balance: escrow_balance,
        cw20_whitelist,
    };

    ESCROWS.update(deps.storage, &msg.id, |exsiting| {
        match exsiting {
            Some(_) => Err(ContractError::AlreadyInUse {}),
            None => Ok(escrow),
        }
    })?;

    Ok(Response::new().add_attributes(vec![
        ("action", "create"),
        ("id", msg.id.as_str()),
    ]))
}

pub fn execute_top_up(
    deps: DepsMut,
    balance: Balance,
    id: String,
) -> Result<Response, ContractError> {
    if balance.is_empty() {
        return Err(ContractError::EmptyBalance {});
    }

    let mut escrow = ESCROWS.load(deps.storage, &id)?;

    if let Balance::Cw20(token) = &balance {
        // ensure the token is on the white list
        if !escrow
            .cw20_whitelist
            .iter()
            .any(|cw| cw == &token.address)
        {
            return Err(ContractError::NotInWhiteList {});
        }
    }

    escrow.balance.add_token(balance);

    ESCROWS.save(deps.storage, &id, &escrow)?;

    Ok(Response::new().add_attributes(vec![
        ("action", "top_up"),
        ("id", id.as_str()),
    ]))
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn query(
    deps: Deps,
    _env: Env,
    msg: QueryMsg,
) -> StdResult<Binary> {
    match msg {
        QueryMsg::List {} => to_binary(&query_list(deps)?),
        QueryMsg::Detail { id } => {
            to_binary(&query_detail(deps, id)?)
        }
    }
}

pub fn query_detail(
    deps: Deps,
    id: String,
) -> StdResult<DetailResponse> {
    let escrow = ESCROWS.load(deps.storage, &id)?;

    let cw20_whitelist = escrow.human_readable_whitelist();

    let native_balance = escrow.balance.native;

    let cw20_balance: StdResult<Vec<_>> = escrow
        .balance
        .cw20
        .into_iter()
        .map(|token| {
            Ok(Cw20Coin {
                address: token.address.into(),
                amount: token.amount,
            })
        })
        .collect();

    let recipient =
        escrow.recipient.map(|addr| addr.into_string());

    Ok(DetailResponse {
        id,
        arbiter: escrow.arbiter.into(),
        recipient,
        source: escrow.source.into(),
        title: escrow.title,
        description: escrow.description,
        end_height: escrow.end_height,
        native_balance,
        cw20_balance: cw20_balance?,
        cw20_whitelist,
    })
}

pub fn query_list(deps: Deps) -> StdResult<ListResponse> {
    Ok(ListResponse {
        ids: all_escrow_id(deps.storage)?,
    })
}

#[cfg(test)]
mod tests {
    use cosmwasm_std::testing::{
        mock_dependencies, mock_env, mock_info,
    };
    use cosmwasm_std::{
        attr, coin, coins, CosmosMsg, StdError, Uint128,
    };

    use super::*;

    fn do_instantiate(deps: DepsMut, msg: InstantiateMsg) {
        let info = mock_info(&String::from("anyone"), &[]);

        let res = instantiate(deps, mock_env(), info, msg);

        assert_eq!(0, res.unwrap().messages.len());
    }

    #[test]
    fn happy_path_native() {
        let mut deps = mock_dependencies();
        let msg = InstantiateMsg {};
        do_instantiate(deps.as_mut(), msg);
        let create = CreateMsg {
            id: "foobar".to_string(),
            arbiter: String::from("arbiter"),
            recipient: Some(String::from("recipient")),
            title: String::from("foo foo"),
            description: String::from("some description"),
            end_height: Some(100000000),
            cw20_whitelist: None,
        };

        let sender = String::from("source");
        let balance = coins(100, "token");
        let info = mock_info(&sender, &balance);

        let msg = ExecuteMsg::Create(create.clone());
        let res =
            execute(deps.as_mut(), mock_env(), info, msg)
                .unwrap();
        assert_eq!(0, res.messages.len());
        assert_eq!(("action", "create"), res.attributes[0]);

        let details = query_detail(
            deps.as_ref(),
            "foobar".to_string(),
        )
        .unwrap();
        assert_eq!(
            details,
            DetailResponse {
                id: "foobar".to_string(),
                arbiter: String::from("arbiter"),
                recipient: Some(String::from("recipient")),
                source: String::from("source"),
                title: "foo foo".to_string(),
                description: "some description".to_string(),
                end_height: Some(100000000),
                native_balance: balance.clone(),
                cw20_balance: vec![],
                cw20_whitelist: vec![],
            }
        );

        let id = create.id.clone();
        let info = mock_info(&create.arbiter, &[]);

        let approve = ExecuteMsg::Approve { id };

        let res = execute(
            deps.as_mut(),
            mock_env(),
            info,
            approve,
        )
        .unwrap();

        assert_eq!(1, res.messages.len());
        assert_eq!(
            ("action", "approve"),
            res.attributes[0]
        );
        assert_eq!(
            res.messages[0],
            SubMsg::new(CosmosMsg::Bank(BankMsg::Send {
                to_address: create.recipient.unwrap(),
                amount: balance
            }))
        );

        let id = create.id.clone();
        let info = mock_info(&create.arbiter, &[]);
        let err = execute(
            deps.as_mut(),
            mock_env(),
            info,
            ExecuteMsg::Approve { id },
        )
        .unwrap_err();
        assert!(matches!(
            err,
            ContractError::Std(StdError::NotFound { .. })
        ));
    }

    #[test]
    fn happy_path_cw20() {
        let mut deps = mock_dependencies();

        do_instantiate(deps.as_mut(), InstantiateMsg {});

        let create_msg = CreateMsg {
            id: "foo_bar".to_string(),
            arbiter: "arbiter".to_string(),
            recipient: Some("recipient".to_string()),
            title: "title".to_string(),
            description: "description".to_string(),
            end_height: None,
            cw20_whitelist: Some(vec![String::from(
                "cw20-token",
            )]),
        };

        let token_contract = String::from("token_contract");
        let info = mock_info(&token_contract, &[]);

        let res = execute(
            deps.as_mut(),
            mock_env(),
            info,
            ExecuteMsg::Receive(Cw20ReceiveMsg {
                sender: String::from("source"),
                amount: Uint128::new(100),
                msg: to_binary(&ExecuteMsg::Create(
                    create_msg.clone(),
                ))
                .unwrap(),
            }),
        )
        .unwrap();

        assert_eq!(0, res.messages.len());
        assert_eq!(("action", "create"), res.attributes[0]);

        let detail = query_detail(
            deps.as_ref(),
            create_msg.id.clone(),
        )
        .unwrap();

        assert_eq!(
            DetailResponse {
                id: "foo_bar".to_string(),
                arbiter: "arbiter".to_string(),
                recipient: Some("recipient".to_string()),
                source: String::from("source"),
                title: "title".to_string(),
                description: "description".to_string(),
                end_height: None,
                cw20_whitelist: vec![
                    String::from("cw20-token"),
                    String::from("token_contract")
                ],
                cw20_balance: vec![Cw20Coin {
                    address: token_contract.clone(),
                    amount: Uint128::new(100)
                }],
                native_balance: vec![],
            },
            detail
        );

        let id = create_msg.id.clone();
        let info = mock_info(&create_msg.arbiter, &[]);

        let approve = ExecuteMsg::Approve { id };

        let res = execute(
            deps.as_mut(),
            mock_env(),
            info,
            approve,
        )
        .unwrap();

        assert_eq!(1, res.messages.len());
        assert_eq!(
            ("action", "approve"),
            res.attributes[0]
        );

        let send_msg = Cw20ExecuteMsg::Transfer {
            recipient: create_msg.recipient.unwrap(),
            amount: Uint128::new(100),
        };

        assert_eq!(
            res.messages[0],
            SubMsg::new(CosmosMsg::Wasm(
                WasmMsg::Execute {
                    contract_addr: token_contract,
                    msg: to_binary(&send_msg).unwrap(),
                    funds: vec![]
                }
            ))
        );
        let id = create_msg.id.clone();

        let info = mock_info(&create_msg.arbiter, &[]);
        let err = execute(
            deps.as_mut(),
            mock_env(),
            info,
            ExecuteMsg::Approve { id },
        )
        .unwrap_err();
        assert!(matches!(
            err,
            ContractError::Std(StdError::NotFound { .. })
        ));
    }

    #[test]
    fn set_recipient_after_creation() {
        let mut deps = mock_dependencies();
        let create = CreateMsg {
            id: "foobar".to_string(),
            arbiter: String::from("arbiter"),
            recipient: None,
            title: String::from("foo foo"),
            description: String::from("some description"),
            end_height: Some(100000000),
            cw20_whitelist: None,
        };
        let sender = String::from("source");
        let balance = coins(100, "token");
        let info = mock_info(&sender, &balance);

        let msg = ExecuteMsg::Create(create.clone());
        let res =
            execute(deps.as_mut(), mock_env(), info, msg)
                .unwrap();
        assert_eq!(0, res.messages.len());
        assert_eq!(("action", "create"), res.attributes[0]);

        let id = create.id.clone();

        let res = execute(
            deps.as_mut(),
            mock_env(),
            mock_info("arbiter", &[]),
            ExecuteMsg::Approve { id },
        )
        .unwrap_err();

        assert!(matches!(
            res,
            ContractError::RecipientNotSet {}
        ));

        let msg = ExecuteMsg::SetReceipient {
            id: create.id.clone(),
            recipient: String::from("recipient"),
        };

        let info = mock_info("someoneelse", &[]);

        let res =
            execute(deps.as_mut(), mock_env(), info, msg)
                .unwrap_err();

        assert!(matches!(
            res,
            ContractError::Unauthorized {}
        ));

        let msg = ExecuteMsg::SetReceipient {
            id: create.id.clone(),
            recipient: String::from("recipient"),
        };

        let info = mock_info(&create.arbiter, &[]);
        let res =
            execute(deps.as_mut(), mock_env(), info, msg)
                .unwrap();
        assert_eq!(0, res.messages.len());
        assert_eq!(
            res.attributes,
            vec![
                attr("action", "set_recipient"),
                attr("id", create.id.as_str()),
                attr("recipient", "recipient")
            ]
        );
        let id = create.id.clone();
        let info = mock_info(&create.arbiter, &[]);
        let res = execute(
            deps.as_mut(),
            mock_env(),
            info,
            ExecuteMsg::Approve { id },
        )
        .unwrap();
        assert_eq!(1, res.messages.len());
        assert_eq!(
            ("action", "approve"),
            res.attributes[0]
        );
        assert_eq!(
            res.messages[0],
            SubMsg::new(CosmosMsg::Bank(BankMsg::Send {
                to_address: "recipient".to_string(),
                amount: balance,
            }))
        );
    }

    #[test]
    fn top_up_mixed_tokens() {
        let mut deps = mock_dependencies();

        do_instantiate(deps.as_mut(), InstantiateMsg {});

        let whitelist = vec![
            String::from("bar_token"),
            String::from("foo_token"),
        ];

        let create = CreateMsg {
            id: "foobar".to_string(),
            arbiter: String::from("arbiter"),
            recipient: Some(String::from("recipient")),
            title: String::from("foo foo"),
            description: String::from("some description"),
            end_height: Some(99999999),
            cw20_whitelist: Some(whitelist),
        };

        let source = "source".to_string();
        let balance =
            vec![coin(300, "random"), coin(200, "minh")];

        let info = mock_info(&source, &balance);

        let msg = ExecuteMsg::Create(create.clone());

        let res =
            execute(deps.as_mut(), mock_env(), info, msg)
                .unwrap();
        assert_eq!(0, res.messages.len());
        assert_eq!(("action", "create"), res.attributes[0]);

        let extra_native =
            vec![coin(200, "stake"), coin(300, "minh")];

        let info = mock_info(&source, &extra_native);
        let top_up = ExecuteMsg::TopUp {
            id: create.id.clone(),
        };
        let res = execute(
            deps.as_mut(),
            mock_env(),
            info,
            top_up,
        )
        .unwrap();

        assert_eq!(0, res.messages.len());
        assert_eq!(("action", "top_up"), res.attributes[0]);

        //Cw20 foregin token
        let bar_token = String::from("bar_token");
        let top_up = ExecuteMsg::TopUp {
            id: create.id.clone(),
        };
        let res = execute(
            deps.as_mut(),
            mock_env(),
            mock_info(&bar_token, &[]),
            ExecuteMsg::Receive(Cw20ReceiveMsg {
                sender: String::from("random"),
                amount: Uint128::new(1000),
                msg: to_binary(&top_up).unwrap(),
            }),
        )
        .unwrap();

        assert_eq!(("action", "top_up"), res.attributes[0]);
        assert_eq!(0, res.messages.len());

        let baz_token = "baz_token".to_string();
        let top_up = ExecuteMsg::TopUp {
            id: create.clone().id,
        };
        let info = mock_info(&baz_token, &[]);
        let res = execute(
            deps.as_mut(),
            mock_env(),
            info,
            ExecuteMsg::Receive(Cw20ReceiveMsg {
                sender: String::from("random"),
                amount: Uint128::new(1000),
                msg: to_binary(&top_up).unwrap(),
            }),
        )
        .unwrap_err();

        assert_eq!(res, ContractError::NotInWhiteList {});

        let foo_token = String::from("foo_token");
        let top_up = ExecuteMsg::TopUp {
            id: create.id.clone(),
        };
        let info = mock_info(&foo_token, &[]);
        let res = execute(
            deps.as_mut(),
            mock_env(),
            info,
            ExecuteMsg::Receive(Cw20ReceiveMsg {
                sender: String::from("random"),
                amount: Uint128::new(1000),
                msg: to_binary(&top_up).unwrap(),
            }),
        )
        .unwrap();

        assert_eq!(0, res.messages.len());
        assert_eq!(("action", "top_up"), res.attributes[0]);

        let res = execute(
            deps.as_mut(),
            mock_env(),
            mock_info(&create.arbiter, &[]),
            ExecuteMsg::Approve {
                id: create.id.clone(),
            },
        )
        .unwrap();

        assert_eq!(
            ("action", "approve"),
            res.attributes[0]
        );
        assert_eq!(3, res.messages.len());
        assert_eq!(
            res.messages[0],
            SubMsg::new(CosmosMsg::Bank(BankMsg::Send {
                to_address: create
                    .recipient
                    .clone()
                    .unwrap(),
                amount: vec![
                    coin(300, "random"),
                    coin(500, "minh"),
                    coin(200, "stake"),
                ],
            }))
        );
        // second one release bar cw20 token
        let send_msg = Cw20ExecuteMsg::Transfer {
            recipient: create.recipient.clone().unwrap(),
            amount: Uint128::new(1000),
        };
        assert_eq!(
            res.messages[1],
            SubMsg::new(CosmosMsg::Wasm(
                WasmMsg::Execute {
                    contract_addr: bar_token,
                    msg: to_binary(&send_msg).unwrap(),
                    funds: vec![]
                }
            ))
        );

        // third one release foo cw20 token
        let send_msg = Cw20ExecuteMsg::Transfer {
            recipient: create.recipient.unwrap(),
            amount: Uint128::new(1000),
        };
        assert_eq!(
            res.messages[2],
            SubMsg::new(CosmosMsg::Wasm(
                WasmMsg::Execute {
                    contract_addr: foo_token,
                    msg: to_binary(&send_msg).unwrap(),
                    funds: vec![]
                }
            ))
        );
    }
}
