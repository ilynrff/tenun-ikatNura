import { NextResponse } from 'next/server';
import { verifyServerAdmin } from '@/lib/auth';
import { uploadToStorage } from '@/lib/supabase';

const BUCKET = 'product-images';
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * POST /api/admin/upload
 * Accepts multipart/form-data with one or more "file" fields.
 * Returns { urls: string[] } — public URLs of uploaded images.
 *
 * Security:
 *  - Admin session cookie required (HMAC-SHA256 verified)
 *  - File type whitelist: JPEG, PNG, WebP
 *  - Max 5 MB per file
 *  - Service Role Key used server-side only; never exposed to browser
 */
export async function POST(request) {
  // 1. Auth guard
  const { authorized } = await verifyServerAdmin();
  if (!authorized) {
    return NextResponse.json({ error: 'Akses ditolak. Login sebagai admin terlebih dahulu.' }, { status: 401 });
  }

  // 2. Parse multipart form
  let formData;
  try {
    formData = await request.formData();
  } catch (err) {
    return NextResponse.json({ error: 'Gagal membaca data form upload.' }, { status: 400 });
  }

  const files = formData.getAll('file');
  if (!files || files.length === 0) {
    return NextResponse.json({ error: 'Tidak ada file yang dikirim.' }, { status: 400 });
  }

  const uploadedUrls = [];
  const errors = [];

  for (const file of files) {
    // Validate type
    if (!ALLOWED_TYPES.includes(file.type)) {
      errors.push(`File "${file.name}" memiliki tipe yang tidak diizinkan (${file.type}). Gunakan JPG, PNG, atau WebP.`);
      continue;
    }

    // Validate size
    if (file.size > MAX_SIZE_BYTES) {
      errors.push(`File "${file.name}" terlalu besar (${(file.size / 1024 / 1024).toFixed(1)} MB). Maksimal 5 MB.`);
      continue;
    }

    try {
      // Read file as buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Generate unique storage path
      const ext = file.name.split('.').pop().toLowerCase();
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 9);
      const storagePath = `products/${timestamp}-${randomId}.${ext}`;

      const { publicUrl } = await uploadToStorage(BUCKET, storagePath, buffer, file.type);
      uploadedUrls.push(publicUrl);
    } catch (err) {
      console.error('[Upload API] Error uploading file:', err.message);
      errors.push(`Gagal mengupload file "${file.name}": ${err.message}`);
    }
  }

  if (uploadedUrls.length === 0) {
    return NextResponse.json(
      { error: 'Semua file gagal diupload.', details: errors },
      { status: 500 }
    );
  }

  return NextResponse.json({
    urls: uploadedUrls,
    uploaded: uploadedUrls.length,
    failed: errors.length,
    errors: errors.length > 0 ? errors : undefined,
  });
}
