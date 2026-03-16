/**
 * Seed script: Create initial admin invites for Wayfinder launch.
 *
 * Usage: node backend/scripts/seed-invites.js
 *
 * Creates 5 admin invites that can be distributed to your first users.
 * These invites have a 30-day expiration and aren't tied to specific emails.
 */

import { createAdminInvite, ensureInvitesDir } from '../services/invites.js';

async function seedInvites() {
  await ensureInvitesDir();

  console.log('\n🧭 Creating Wayfinder admin invites...\n');

  const invites = [];
  for (let i = 0; i < 5; i++) {
    const result = await createAdminInvite('');
    if (result.success) {
      invites.push(result);
      console.log(`  ✓ Invite code: ${result.code}  (expires: ${new Date(result.expiresAt).toLocaleDateString()})`);
    }
  }

  console.log(`\n✅ Created ${invites.length} invites.`);
  console.log('\nShare these links with your first users:');
  console.log('(Replace YOUR_DOMAIN with your actual domain)\n');

  invites.forEach(inv => {
    console.log(`  https://wayfinderai.org/?invite=${inv.code}`);
  });

  console.log('\nThese invites expire in 30 days and can be used by anyone.\n');
}

seedInvites().catch(console.error);
