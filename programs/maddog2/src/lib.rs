use anchor_lang::prelude::*;
// use std::collections::HashMap;
use anchor_spl::token::{self, Mint, Token, TokenAccount, MintTo};
use anchor_spl::associated_token::AssociatedToken;
// use solana_program::sysvar::Sysvar;
// use solana_program::sysvar::recent_blockhashes::RecentBlockhashes;
// use solana_program::program_option::COption;
// extern crate solana_program;

declare_id!("8VuGUv5uju3mbbfK919X3Z6Fs8sAwQQvgt1fcvephyVr");

#[program]
pub mod maddog {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, total_supply: u64) -> Result<()> {
    msg!("Mint Authority: {:?}", ctx.accounts.mint_authority.key());
    msg!("Mint Account: {:?}", ctx.accounts.mint.key());
    msg!("Token Account: {:?}", ctx.accounts.token_account.key());

    // Cek apakah token_account benar-benar kosong atau ada saldo
    let token_balance = ctx.accounts.token_account.amount;
    msg!("Token Account Balance: {}", token_balance);

    let cpi_accounts = MintTo {
        mint: ctx.accounts.mint.to_account_info(),
        to: ctx.accounts.token_account.to_account_info(),
        authority: ctx.accounts.mint_authority.to_account_info(),
    };

    let cpi_context = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
    token::mint_to(cpi_context, total_supply)?;

    msg!("Minting successful!");
    Ok(())
}

}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init, 
        payer = mint_authority, 
        mint::decimals = 9, 
        mint::authority = mint_authority
    )]
    pub mint: Account<'info, Mint>, 

    #[account(
        init,
        payer = mint_authority,
        associated_token::mint = mint,
        associated_token::authority = mint_authority
    )]
    pub token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub mint_authority: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}



#[error_code]
pub enum ErrorCode {
    #[msg("Invalid mint authority.")]
    InvalidAuthority,
}