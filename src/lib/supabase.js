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
 * Supports primary bucket name with fallback if manual bucket name variations exist.
 * @param {string} bucket - Bucket name, e.g. 'product-images'
 * @param {string} path   - Storage path, e.g. 'products/abc123.jpg'
 * @param {Buffer} buffer - File content
 * @param {string} contentType - MIME type, e.g. 'image/jpeg'
 * @returns {Promise<{ publicUrl: string, bucket: string }>}
 */
export async function uploadToStorage(bucket, path, buffer, contentType) {
  const supabase = getSupabaseAdmin();
  let targetBucket = bucket || 'product-images';

  let { error } = await supabase.storage
    .from(targetBucket)
    .upload(path, buffer, {
      contentType,
      upsert: true,
    });

  // If bucket not found, check alternate singular/plural bucket name without altering Supabase settings
  if (error && (error.message?.toLowerCase().includes('not found') || error.statusCode === '404' || error.status === 400)) {
    const alternateBucket = targetBucket === 'product-images' ? 'product-image' : (targetBucket === 'product-image' ? 'product-images' : null);
    if (alternateBucket) {
      const altResult = await supabase.storage
        .from(alternateBucket)
        .upload(path, buffer, {
          contentType,
          upsert: true,
        });
      if (!altResult.error) {
        targetBucket = alternateBucket;
        error = null;
      }
    }
  }

  if (error) {
    throw new Error(`[Storage Upload] Gagal upload file "${path}" ke bucket "${targetBucket}": ${error.message}`);
  }

  const { data } = supabase.storage.from(targetBucket).getPublicUrl(path);

  if (!data?.publicUrl) {
    throw new Error(`[Storage] Gagal mendapatkan public URL untuk "${path}" di bucket "${targetBucket}".`);
  }

  return { publicUrl: data.publicUrl, bucket: targetBucket };
}

/**
 * Delete a file from Supabase Storage.
 * @param {string} bucket
 * @param {string} path
 */
export async function deleteFromStorage(bucket, path) {
  const supabase = getSupabaseAdmin();
  let targetBucket = bucket || 'product-images';

  let { error } = await supabase.storage.from(targetBucket).remove([path]);
  if (error && (error.message?.toLowerCase().includes('not found') || error.statusCode === '404')) {
    const alternateBucket = targetBucket === 'product-images' ? 'product-image' : (targetBucket === 'product-image' ? 'product-images' : null);
    if (alternateBucket) {
      await supabase.storage.from(alternateBucket).remove([path]);
    }
  }
}
