import { NextResponse } from 'next/server';
import {
  calculateShippingCost,
  calculateItemsTotalWeight,
  isRajaOngkirConfigured,
} from '@/lib/rajaOngkir';

/**
 * POST /api/shipping/cost
 * Calculate domestic shipping costs via RajaOngkir / Komerce API v1
 * 
 * Expected payload:
 * {
 *   "destinationId": "12345", // Location ID from Komerce destination search
 *   "courier": "jne",         // 'jne' | 'pos' | 'tiki' | 'sicepat' | 'jnt'
 *   "items": [                // Recommended: items array to calculate total weight securely from database
 *     { "productId": "...", "quantity": 1 }
 *   ],
 *   "weight": 1000            // Fallback only if items not provided (must be >= 1g)
 * }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { destinationId, courier = 'jne', items } = body;

    if (!destinationId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Parameter destinationId wajib diisi.',
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

    // Determine weight:
    // If items are provided, calculate total weight server-side from database products.
    // Client-submitted weight is NEVER trusted when items are present.
    let totalWeight = 0;
    if (Array.isArray(items) && items.length > 0) {
      totalWeight = await calculateItemsTotalWeight(items);
    } else if (body.weight !== undefined && body.weight !== null) {
      totalWeight = parseInt(body.weight, 10);
    } else {
      totalWeight = 1000; // Default fallback: 1000g (1 kg)
    }

    if (isNaN(totalWeight) || totalWeight < 1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Berat pengiriman harus berupa angka bulat minimal 1 gram.',
        },
        { status: 400 }
      );
    }

    const services = await calculateShippingCost({
      destinationId,
      weight: totalWeight,
      courier,
    });

    return NextResponse.json({
      success: true,
      data: services,
      weight: totalWeight,
    });
  } catch (error) {
    console.error('[Shipping Cost API POST] Error:', error.message);

    const status = error.statusCode || 500;
    const message = error.isConfigError
      ? (error.message || 'Layanan pengiriman belum dikonfigurasi.')
      : (error.message || 'Gagal menghitung ongkos kirim.');

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status }
    );
  }
}
