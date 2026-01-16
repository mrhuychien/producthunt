-- ============================================================================
-- Update Bounty System to use VND currency
-- ============================================================================

-- Step 1: Drop the old constraint first
ALTER TABLE idea_bounties DROP CONSTRAINT IF EXISTS idea_bounties_amount_check;

-- Step 2: Convert existing USD bounties to VND (multiply by 25000)
UPDATE idea_bounties SET amount = amount * 25000, currency = 'VND' WHERE currency = 'USD' OR currency IS NULL;

-- Step 3: Update amount column to handle larger VND values
ALTER TABLE idea_bounties ALTER COLUMN amount TYPE DECIMAL(15,0);

-- Step 4: Add new constraint for VND (min 10,000đ, max 100,000,000đ)
ALTER TABLE idea_bounties ADD CONSTRAINT idea_bounties_amount_check
  CHECK (amount >= 10000 AND amount <= 100000000);

-- Step 5: Update default currency to VND
ALTER TABLE idea_bounties ALTER COLUMN currency SET DEFAULT 'VND';
