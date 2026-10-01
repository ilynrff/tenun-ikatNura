import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Admin Client — uses Service Role Key for server-side operations only.
 * NEVER expose this to the browser. Use ONLY in API Routes and Server Components.
 */
function createSupabaseAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      '[Supabase Admin] SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY harus dikonfigurasi di .env.local'
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

/**
 * Singleton Supabase Admin client.
 * Only instantiated server-side; throws if env vars are missing.
 */
let _supabaseAdmin = null;

export function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createSupabaseAdmin();
  }
  return _supabaseAdmin;
}

/**
 * Upload a file buffer to Supabase Storage.
 * @param {string} bucket - Bucket name, e.g. 'product-images'
 * @param {string} path   - Storage path, e.g. 'products/abc123.jpg'
 * @param {Buffer} buffer - File content
 * @param {string} contentType - MIME type, e.g. 'image/jpeg'
 * @returns {Promise<{ publicUrl: string }>}
 */
export async function uploadToStorage(bucket, path, buffer, contentType) {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    throw new Error(`[Storage Upload] Gagal upload file "${path}": ${error.message}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);

  if (!data?.publicUrl) {
    throw new Error(`[Storage] Gagal mendapatkan public URL untuk "${path}".`);
  }

  return { publicUrl: data.publicUrl };
}

/**
 * Delete a file from Supabase Storage.
 * @param {string} bucket
 * @param {string} path
 */
export async function deleteFromStorage(bucket, path) {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    console.warn(`[Storage Delete] Gagal menghapus "${path}":`, error.message);
  }
}
