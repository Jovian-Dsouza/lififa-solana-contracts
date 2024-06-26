pub use crate::errors::LifafaError;
pub mod errors;
pub mod states;
pub use states::*;

pub mod instructions;
use instructions::*;

use anchor_lang::prelude::*;
use anchor_lang::solana_program::pubkey::Pubkey;


declare_id!("AXBZp473xo61tmpSryZfuZMGBs2c1q2MdVh2yW7GLS1z");

pub const MAX_CLAIMS_ALLOWED: u16 = 1000; 
pub const MAX_OWNER_NAME: u16 = 32;
pub const MAX_DESC: u16 = 50; 
pub const LIFAFA_SEED: &str = "lifafa";
    
#[program]
mod lifafa {
    use super::*;

    pub fn create_sol_lifafa(
        ctx: Context<CreateSolLifafa>,
        id: u64,
        amount: u64, //In lamports
        time_limit_in_seconds: i64,
        max_claims: u16,
        owner_name: String,
        desc: String,
    ) -> Result<()>{
        instructions::create_sol_lifafa::create_sol_lifafa(
            ctx, 
            id, 
            amount, 
            time_limit_in_seconds, 
            max_claims, 
            owner_name,
            desc
        )
    }

    pub fn claim_sol_lifafa(ctx: Context<ClaimSolLifafa>, _id: u64) -> Result<()>  {
        instructions::claim_sol_lifafa::claim_sol_lifafa(ctx, _id)
    }

    pub fn delete_sol_lifafa(ctx: Context<DeleteSolLifafa>, _id: u64) -> Result<()> {      
        instructions::delete_sol_lifafa::delete_sol_lifafa(ctx, _id)
    }
}