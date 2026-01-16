-- ============================================================================
-- Update Bounty System to use VND currency
-- ============================================================================

-- Drop the old constraint
ALTER TABLE idea_bounties DROP CONSTRAINT IF EXISTS idea_bounties_amount_check;

-- Add new constraint for VND (min 10,000đ, max 100,000,000đ)
ALTER TABLE idea_bounties ADD CONSTRAINT idea_bounties_amount_check
  CHECK (amount >= 10000 AND amount <= 100000000);

-- Update amount column to handle larger VND values (no decimals needed)
ALTER TABLE idea_bounties ALTER COLUMN amount TYPE DECIMAL(15,0);

-- Update default currency to VND
ALTER TABLE idea_bounties ALTER COLUMN currency SET DEFAULT 'VND';

-- Update any existing USD bounties to VND equivalent (optional, multiply by 25000)
-- UPDATE idea_bounties SET amount = amount * 25000, currency = 'VND' WHERE currency = 'USD';
