import { getProductById } from '@/lib/products';
import ProductForm from '@/components/admin/ProductForm';
import Link from 'next/link';

export const metadata = {
  title: 'Edit Produk — Admin Tenun Ikat Nura',
};

export default async function EditProductPage({ params }) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return (
      <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#fff' }}>
        <h2 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '2rem', marginBottom: '1rem' }}>
          Produk Tidak Ditemukan
        </h2>
        <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>
          Produk dengan ID/Slug &quot;{id}&quot; tidak ditemukan di dalam database atau katalog.
        </p>
        <Link
          href="/admin/products"
          style={{
            background: '#c5a059',
            color: '#0f0e0d',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          Kembali ke Daftar Produk
        </Link>
      </div>
    );
  }

  return <ProductForm initialData={product} isEdit={true} />;
}
