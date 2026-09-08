const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { getCmsData, saveCmsData, saveAdminUser, isSupabaseConfigured } = require('./supabase');
require('dotenv').config();

async function runSeed() {
  console.log('--- Café Emil Supabase Database Seeder ---');
  
  if (!isSupabaseConfigured()) {
    console.log('Notice: Supabase is not configured yet in server/.env.');
    console.log('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to seed into cloud.');
    return;
  }

  console.log('Supabase credentials found. Seeding database...');

  // 1. Seed CMS Data
  const cmsFilePath = path.join(__dirname, '..', 'data', 'cms-data.json');
  if (fs.existsSync(cmsFilePath)) {
    const raw = JSON.parse(fs.readFileSync(cmsFilePath, 'utf8'));
    console.log(`Seeding CMS data (${raw.menuItems?.length || 0} menu items)...`);
    await saveCmsData(raw);
    console.log('✓ CMS content seeded successfully into table cms_content!');
  }

  // 2. Seed Admin User
  const defaultUser = 'admin';
  const defaultPass = 'CafeEmil2025!';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(defaultPass, salt);

  console.log(`Seeding default admin user "${defaultUser}"...`);
  await saveAdminUser(defaultUser, hash);
  console.log('✓ Admin user seeded successfully into table admin_users!');

  console.log('--- Seeding Complete ---');
}

if (require.main === module) {
  runSeed().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
}

module.exports = { runSeed };
