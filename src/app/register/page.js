'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import styles from '@/components/auth/AuthModal.module.css';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!fullName || !email || !password) return;

    setIsSubmitting(true);
    const result = await register({ fullName, email, phone, password });
    setIsSubmitting(false);

    if (result.success) {
      router.push(callbackUrl);
    } else {
      setErrorMessage(result.message || 'Pendaftaran gagal. Silakan coba lagi.');
    }
  };

  const loginHref = callbackUrl && callbackUrl !== '/'
    ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : '/login';

  return (
    <div className={styles.modal} style={{ position: 'relative', width: '460px', maxWidth: '100%' }}>
      <div className={styles.content}>
        <div className={styles.brandLabel}>Tenun Ikat Nura</div>
        <h1 className={styles.title}>CREATE YOUR ACCOUNT</h1>

        {callbackUrl.includes('checkout') && (
          <div
            style={{
              backgroundColor: 'rgba(197, 154, 61, 0.12)',
              border: '1px solid rgba(197, 154, 61, 0.35)',
              borderRadius: '2px',
              padding: '12px 14px',
              marginBottom: '18px',
              fontSize: '0.85rem',
              color: '#4A3A2F',
              lineHeight: '1.45',
              textAlign: 'center',
            }}
          >
            Silakan <strong>buat akun baru</strong> untuk melanjutkan checkout dan memantau pesanan karya tenun Anda.
          </div>
        )}

        {errorMessage && (
          <div
            style={{
              backgroundColor: '#FDF2F0',
              border: '1px solid #F1BFB6',
              borderLeft: '4px solid #A34839',
              borderRadius: '2px',
              padding: '10px 14px',
              marginBottom: '16px',
              fontSize: '0.82rem',
              color: '#8A2D1F',
            }}
            role="alert"
          >
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label htmlFor="reg-page-name" className={styles.label}>
              Full Name
            </label>
            <input
              id="reg-page-name"
              type="text"
              required
              placeholder="Nama Lengkap Anda"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={styles.input}
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="reg-page-email" className={styles.label}>
              Email
            </label>
            <input
              id="reg-page-email"
              type="email"
              required
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="reg-page-phone" className={styles.label}>
              Phone Number
            </label>
            <input
              id="reg-page-phone"
              type="tel"
              placeholder="0812-XXXX-XXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={styles.input}
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="reg-page-password" className={styles.label}>
              Password
            </label>
            <input
              id="reg-page-password"
              type="password"
              required
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <div className={styles.switchBox}>
          Already have an account?
          <Link href={loginHref} className={styles.switchBtn}>
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 20px 60px 20px', backgroundColor: '#ECE6DA' }}>
        <Suspense fallback={null}>
          <RegisterForm />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
