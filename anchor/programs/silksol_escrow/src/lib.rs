//! SilkSol Escrow Vault — parametric freight-delay cover on Solana.
//!
//! Each policy gets its own PDA vault holding collateral (lamports on Devnet).
//! An oracle reports the observed dwell time, anyone can crank the deterministic
//! trigger (`dwell_hours > threshold_hours`), and an eligible vault pays the
//! beneficiary. No discretionary or ML logic runs on-chain.

use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("Gu7gKXNnp95qTvaDwoq3NB9JCqBQLmriHQgKrFzJAr9Z");

pub const VAULT_SEED: &[u8] = b"vault";
pub const MAX_SHIPMENT_ID_LEN: usize = 32;

#[program]
pub mod silksol_escrow {
    use super::*;

    /// Creates the policy vault PDA and locks `collateral_lamports` from the authority.
    pub fn initialize_vault(
        ctx: Context<InitializeVault>,
        policy_id: u64,
        shipment_id: String,
        collateral_lamports: u64,
        threshold_hours: u32,
        oracle: Pubkey,
        beneficiary: Pubkey,
    ) -> Result<()> {
        require!(
            !shipment_id.is_empty() && shipment_id.len() <= MAX_SHIPMENT_ID_LEN,
            EscrowError::InvalidShipmentId
        );
        require!(collateral_lamports > 0, EscrowError::ZeroCollateral);
        require!(threshold_hours > 0, EscrowError::ZeroThreshold);

        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.key(),
                system_program::Transfer {
                    from: ctx.accounts.authority.to_account_info(),
                    to: ctx.accounts.vault.to_account_info(),
                },
            ),
            collateral_lamports,
        )?;

        let now = Clock::get()?.unix_timestamp;
        let vault = &mut ctx.accounts.vault;
        vault.authority = ctx.accounts.authority.key();
        vault.oracle = oracle;
        vault.beneficiary = beneficiary;
        vault.policy_id = policy_id;
        vault.shipment_id = shipment_id;
        vault.collateral = collateral_lamports;
        vault.threshold_hours = threshold_hours;
        vault.dwell_hours = 0;
        vault.risk_score = 0;
        vault.eligible = false;
        vault.settled = false;
        vault.created_at = now;
        vault.updated_at = now;
        vault.bump = ctx.bumps.vault;

        emit!(VaultInitialized {
            vault: vault.key(),
            shipment_id: vault.shipment_id.clone(),
            collateral: collateral_lamports,
            threshold_hours,
        });
        Ok(())
    }

    /// Oracle-signed telemetry update: observed dwell time and off-chain risk score.
    pub fn submit_telemetry(ctx: Context<SubmitTelemetry>, dwell_hours: u32, risk_score: u8) -> Result<()> {
        require!(risk_score <= 100, EscrowError::InvalidRiskScore);
        let vault = &mut ctx.accounts.vault;
        require!(!vault.settled, EscrowError::AlreadySettled);

        vault.dwell_hours = dwell_hours;
        vault.risk_score = risk_score;
        vault.updated_at = Clock::get()?.unix_timestamp;

        emit!(TelemetrySubmitted { vault: vault.key(), dwell_hours, risk_score });
        Ok(())
    }

    /// Permissionless, deterministic check: `dwell_hours > threshold_hours`.
    pub fn evaluate_trigger(ctx: Context<EvaluateTrigger>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        require!(!vault.settled, EscrowError::AlreadySettled);

        // Sticky: once the trigger fired, later telemetry cannot revoke the claim.
        vault.eligible = vault.eligible || vault.dwell_hours > vault.threshold_hours;

        emit!(TriggerEvaluated {
            vault: vault.key(),
            dwell_hours: vault.dwell_hours,
            threshold_hours: vault.threshold_hours,
            eligible: vault.eligible,
        });
        Ok(())
    }

    /// Pays the locked collateral to the beneficiary once the trigger fired.
    /// Permissionless: funds can only ever go to the stored beneficiary.
    pub fn settle_payout(ctx: Context<SettlePayout>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        require!(vault.eligible, EscrowError::NotEligible);
        require!(!vault.settled, EscrowError::AlreadySettled);

        let amount = vault.collateral;
        vault.sub_lamports(amount)?;
        ctx.accounts.beneficiary.add_lamports(amount)?;
        vault.settled = true;
        vault.updated_at = Clock::get()?.unix_timestamp;

        emit!(SettlementLogged {
            vault: vault.key(),
            shipment_id: vault.shipment_id.clone(),
            beneficiary: vault.beneficiary,
            amount,
            dwell_hours: vault.dwell_hours,
            threshold_hours: vault.threshold_hours,
        });
        Ok(())
    }

    /// Authority closes the vault and reclaims rent (plus collateral if never triggered).
    /// Blocked while a payout is owed, so the insurer cannot rug an eligible claim.
    pub fn close_vault(ctx: Context<CloseVault>) -> Result<()> {
        let vault = &ctx.accounts.vault;
        require!(vault.settled || !vault.eligible, EscrowError::PayoutPending);
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(policy_id: u64)]
pub struct InitializeVault<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init,
        payer = authority,
        space = 8 + EscrowVault::INIT_SPACE,
        seeds = [VAULT_SEED, authority.key().as_ref(), &policy_id.to_le_bytes()],
        bump,
    )]
    pub vault: Account<'info, EscrowVault>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SubmitTelemetry<'info> {
    pub oracle: Signer<'info>,
    #[account(mut, has_one = oracle @ EscrowError::UnauthorizedOracle)]
    pub vault: Account<'info, EscrowVault>,
}

#[derive(Accounts)]
pub struct EvaluateTrigger<'info> {
    #[account(mut)]
    pub vault: Account<'info, EscrowVault>,
}

#[derive(Accounts)]
pub struct SettlePayout<'info> {
    #[account(mut, has_one = beneficiary @ EscrowError::WrongBeneficiary)]
    pub vault: Account<'info, EscrowVault>,
    /// CHECK: only receives lamports; must match `vault.beneficiary`.
    #[account(mut)]
    pub beneficiary: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct CloseVault<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(mut, has_one = authority, close = authority)]
    pub vault: Account<'info, EscrowVault>,
}

#[account]
#[derive(InitSpace)]
pub struct EscrowVault {
    pub authority: Pubkey,
    pub oracle: Pubkey,
    pub beneficiary: Pubkey,
    pub policy_id: u64,
    #[max_len(MAX_SHIPMENT_ID_LEN)]
    pub shipment_id: String,
    pub collateral: u64,
    pub threshold_hours: u32,
    pub dwell_hours: u32,
    pub risk_score: u8,
    pub eligible: bool,
    pub settled: bool,
    pub created_at: i64,
    pub updated_at: i64,
    pub bump: u8,
}

#[event]
pub struct VaultInitialized {
    pub vault: Pubkey,
    pub shipment_id: String,
    pub collateral: u64,
    pub threshold_hours: u32,
}

#[event]
pub struct TelemetrySubmitted {
    pub vault: Pubkey,
    pub dwell_hours: u32,
    pub risk_score: u8,
}

#[event]
pub struct TriggerEvaluated {
    pub vault: Pubkey,
    pub dwell_hours: u32,
    pub threshold_hours: u32,
    pub eligible: bool,
}

#[event]
pub struct SettlementLogged {
    pub vault: Pubkey,
    pub shipment_id: String,
    pub beneficiary: Pubkey,
    pub amount: u64,
    pub dwell_hours: u32,
    pub threshold_hours: u32,
}

#[error_code]
pub enum EscrowError {
    #[msg("Shipment id must be 1-32 bytes")]
    InvalidShipmentId,
    #[msg("Collateral must be greater than zero")]
    ZeroCollateral,
    #[msg("Threshold must be greater than zero")]
    ZeroThreshold,
    #[msg("Risk score must be 0-100")]
    InvalidRiskScore,
    #[msg("Only the vault oracle can submit telemetry")]
    UnauthorizedOracle,
    #[msg("Vault is already settled")]
    AlreadySettled,
    #[msg("Trigger condition not met: dwell_time <= threshold")]
    NotEligible,
    #[msg("Beneficiary does not match the vault")]
    WrongBeneficiary,
    #[msg("Payout is owed; settle before closing")]
    PayoutPending,
}
