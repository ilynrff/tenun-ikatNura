-- ==============================================================================
-- TENUN IKAT NURA — ADMIN ORDER MANAGEMENT SCHEMA MIGRATION (TAHAP 4.5.2)
-- ==============================================================================
-- File       : supabase/manual_order_management.sql
-- Target     : Supabase PostgreSQL (SQL Editor)
-- Sifat      : Idempotent (ADD COLUMN IF NOT EXISTS), Nullable, 100% Backward-Compatible
-- Keterangan : Menambahkan kolom pendukung Admin Order Management pada tabel "orders"
--              dan "order_items" dalam satu transaksi DDL atomik.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. PRE-CHECK QUERY (READ-ONLY)
--    Jalankan query ini secara terpisah di SQL Editor terlebih dahulu untuk
--    memeriksa struktur tabel dan kolom aktual di schema 'public' sebelum DDL.
-- ------------------------------------------------------------------------------
/*
SELECT 
    table_schema,
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('orders', 'order_items')
ORDER BY table_name, ordinal_position;
*/

-- ==============================================================================
-- PERINGATAN PENTING SEBELUM MENJALANKAN DDL:
-- Sintaks `ADD COLUMN IF NOT EXISTS` di PostgreSQL HANYA memeriksa keberadaan nama
-- kolom, dan TIDAK memvalidasi kesesuaian tipe data jika kolom sudah ada sebelumnya.
-- Apabila hasil PRE-CHECK di atas menunjukkan bahwa salah satu kolom ("courier",
-- "shippingService", "trackingNumber", "adminNotes", "color") sudah ada tetapi
-- bertipe data selain TEXT, JANGAN jalankan blok transaksi di bawah. Hentikan
-- proses dan periksa struktur database Supabase Anda terlebih dahulu.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 2. DDL MIGRATION TRANSACTION (DDL & COMMENTS)
--    Dibungkus dalam satu blok transaksi atomik BEGIN ... COMMIT.
--    Catatan: Nama kolom wajib diapit tanda petik ganda ("") quoted camelCase
--    agar sesuai dengan pemetaan query Prisma Client.
-- ------------------------------------------------------------------------------
BEGIN;

-- A. Penambahan kolom pada tabel "orders"
ALTER TABLE "orders" 
  ADD COLUMN IF NOT EXISTS "courier" TEXT,
  ADD COLUMN IF NOT EXISTS "shippingService" TEXT,
  ADD COLUMN IF NOT EXISTS "trackingNumber" TEXT,
  ADD COLUMN IF NOT EXISTS "adminNotes" TEXT;

-- B. Penambahan kolom pada tabel "order_items"
ALTER TABLE "order_items" 
  ADD COLUMN IF NOT EXISTS "color" TEXT;

-- C. Dokumentasi Metadata Kolom (PostgreSQL COMMENTS)
COMMENT ON COLUMN "orders"."courier" IS 'Nama kurir ekspedisi pengiriman (misal: JNE, J&T, POS)';
COMMENT ON COLUMN "orders"."shippingService" IS 'Jenis layanan ekspedisi yang dipilih pelanggan (misal: REG, YES, OKE)';
COMMENT ON COLUMN "orders"."trackingNumber" IS 'Nomor resi pengiriman yang diinput oleh admin saat paket dikirim';
COMMENT ON COLUMN "orders"."adminNotes" IS 'Catatan internal administrator (terpisah dari kolom note pelanggan)';
COMMENT ON COLUMN "order_items"."color" IS 'Variasi warna pakaian tenun yang dipesan pembeli';

COMMIT;

-- ------------------------------------------------------------------------------
-- 3. POST-CHECK QUERY (READ-ONLY)
--    Jalankan query ini secara terpisah setelah transaksi COMMIT berhasil
--    dieksekusi untuk memastikan kelima kolom baru telah terdaftar di schema 'public'.
-- ------------------------------------------------------------------------------
/*
SELECT 
    table_schema,
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('orders', 'order_items')
  AND column_name IN ('courier', 'shippingService', 'trackingNumber', 'adminNotes', 'color')
ORDER BY table_name, column_name;
*/
