const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
const BUCKET_NAME = process.env.SUPABASE_BUCKET || 'cafe-emil-images';

let supabaseClient = null;

function isSupabaseConfigured() {
  return Boolean(
    SUPABASE_URL &&
    SUPABASE_URL.startsWith('http') &&
    SUPABASE_KEY &&
    SUPABASE_KEY.length > 10 &&
    !SUPABASE_URL.includes('your-project-id')
  );
}

function getSupabase() {
  if (!isSupabaseConfigured()) return null;
  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false },
    });
  }
  return supabaseClient;
}

// Fallback path to root data/cms-data.json
const rootCmsPath = path.join(__dirname, '..', 'data', 'cms-data.json');

function getLocalCmsData() {
  try {
    if (fs.existsSync(rootCmsPath)) {
      return JSON.parse(fs.readFileSync(rootCmsPath, 'utf8'));
    }
  } catch (err) {
    console.error('Error reading local cms-data.json fallback:', err);
  }
  return null;
}

// ---------------------------------------------------------------------------
// CMS Operations
// ---------------------------------------------------------------------------

async function getCmsData() {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('cms_content')
        .select('data')
        .eq('id', 'main')
        .single();

      if (data && data.data) {
        return data.data;
      }

      // If table is empty or first run, seed with local data
      const localSeed = getLocalCmsData();
      if (localSeed) {
        await supabase
          .from('cms_content')
          .upsert({ id: 'main', data: localSeed, updated_at: new Date().toISOString() });
        return localSeed;
      }
    } catch (err) {
      console.error('Supabase CMS query error, falling back to local data:', err.message);
    }
  }

  return getLocalCmsData();
}

async function saveCmsData(newData) {
  const currentData = await getCmsData();
  const updated = { ...currentData, ...newData };

  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase
      .from('cms_content')
      .upsert({
        id: 'main',
        data: updated,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Supabase save error:', error);
      throw new Error(`Kunne ikke gemme i Supabase: ${error.message}`);
    }
  }

  // Also sync to local file if writable
  try {
    fs.writeFileSync(rootCmsPath, JSON.stringify(updated, null, 2), 'utf8');
  } catch (e) {
    // Non-fatal if filesystem is read-only
  }

  return updated;
}

// ---------------------------------------------------------------------------
// Admin User Operations
// ---------------------------------------------------------------------------

async function getAdminUser(username) {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', username.toLowerCase())
        .single();

      if (data) return data;
    } catch (err) {
      //
    }
  }
  return null;
}

async function saveAdminUser(username, passwordHash) {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from('admin_users')
      .upsert({
        username: username.toLowerCase(),
        password_hash: passwordHash,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'username' });

    if (error) {
      console.error('Error updating admin user in Supabase:', error);
      throw new Error(`Fejl ved opdatering af bruger: ${error.message}`);
    }
    return data;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Image Storage Operations
// ---------------------------------------------------------------------------

async function uploadImage(filename, buffer, mimeType) {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase er ikke konfigureret. Tilføj SUPABASE_URL og SUPABASE_SERVICE_ROLE_KEY.');
  }

  // Ensure bucket exists
  try {
    await supabase.storage.createBucket(BUCKET_NAME, { public: true });
  } catch {
    // Bucket already exists
  }

  const cleanFilename = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const filePath = `uploads/${cleanFilename}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, buffer, {
      contentType: mimeType,
      upsert: true,
    });

  if (error) {
    console.error('Supabase upload error:', error);
    throw new Error(`Supabase Storage upload fejlede: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return {
    url: publicUrlData.publicUrl,
    filename: cleanFilename,
    path: filePath,
  };
}

async function listImages() {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .list('uploads', {
      limit: 100,
      sortBy: { column: 'created_at', order: 'desc' },
    });

  if (error) {
    console.error('Supabase list error:', error);
    return [];
  }

  return (data || [])
    .filter((item) => item.name && !item.name.startsWith('.'))
    .map((item) => {
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(`uploads/${item.name}`);

      return {
        name: item.name,
        url: urlData.publicUrl,
        size: item.metadata?.size || 0,
        updatedAt: item.created_at || new Date().toISOString(),
      };
    });
}

async function deleteImage(filename) {
  const supabase = getSupabase();
  if (!supabase) return;

  const filePath = filename.startsWith('uploads/') ? filename : `uploads/${filename}`;
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath]);

  if (error) {
    console.error('Supabase delete error:', error);
    throw new Error(`Supabase sletning fejlede: ${error.message}`);
  }
}

module.exports = {
  isSupabaseConfigured,
  getCmsData,
  saveCmsData,
  getAdminUser,
  saveAdminUser,
  uploadImage,
  listImages,
  deleteImage,
};
