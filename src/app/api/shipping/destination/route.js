import { NextResponse } from 'next/server';
import { searchDestinations, isRajaOngkirConfigured } from '@/lib/rajaOngkir';

/**
 * GET /api/shipping/destination?search=...
 * Search domestic destinations (city, district, subdistrict) via RajaOngkir / Komerce API v1
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('search') || searchParams.get('q') || '';

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: 'Parameter pencarian (search) wajib diisi minimal 2 karakter.',
        },
        { status: 400 }
      );
    }

    if (!isRajaOngkirConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Layanan pengiriman belum dikonfigurasi (API key belum diatur).',
        },
        { status: 503 }
      );
    }

    const destinations = await searchDestinations(query);

    return NextResponse.json({
      success: true,
      data: destinations,
    });
  } catch (error) {
    console.error('[Shipping Destination API GET] Error:', error.message);

    const status = error.statusCode || 500;
    const message = error.isConfigError
      ? 'Layanan pengiriman belum dikonfigurasi.'
      : (error.message || 'Gagal mencari tujuan pengiriman.');

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status }
    );
  }
}
