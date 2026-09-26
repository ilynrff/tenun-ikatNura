'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from './login.module.css';

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/admin';

  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Autentikasi gagal. Silakan periksa kredensial Anda.');
        setIsLoading(false);
        return;
      }

      // Update client-side auth context with ADMIN role
      if (data.user) {
        login(data.user.email, password, { role: 'ADMIN', name: data.user.name });
      }

      // Redirect to admin dashboard
      router.push(redirectPath);
      router.refresh();
    } catch (err) {
      setError('Terjadi kesalahan jaringan atau server. Silakan coba lagi.');
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.pageContainer}>
      <div className={styles.ambientGlow} />

      <div className={styles.loginCard}>
        <div className={styles.header}>
          <div className={styles.brandLabel}>TENUN IKAT NURA</div>
          <h1 className={styles.title}>Panel Administrator</h1>
          <p className={styles.subtitle}>
            Masuk untuk mengelola produk, stok, dan etalase toko.
          </p>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label htmlFor="admin-email" className={styles.label}>
              Email Administrator
            </label>
            <input
              id="admin-email"
              type="email"
              required
              placeholder="admin@tenunikatnura.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              disabled={isLoading}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="admin-password" className={styles.label}>
              Kata Sandi
            </label>
            <input
              id="admin-password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              disabled={isLoading}
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? 'Memverifikasi...' : 'MASUK KE ADMIN'}
          </button>
        </form>

        <Link href="/" className={styles.backLink}>
          &larr; Kembali ke Beranda Toko
        </Link>
      </div>
    </main>
  );
}
