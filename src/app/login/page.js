'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';
import styles from '@/components/auth/AuthModal.module.css';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email || !password) return;

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      router.push(callbackUrl);
    } else {
      setErrorMessage(result.message || 'Email atau kata sandi tidak sesuai.');
    }
  };

  const registerHref = callbackUrl && callbackUrl !== '/'
    ? `/register?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : '/register';

  return (
    <div className={styles.modal} style={{ position: 'relative', width: '460px', maxWidth: '100%' }}>
      <div className={styles.content}>
        <div className={styles.brandLabel}>Tenun Ikat Nura</div>
        <h1 className={styles.title}>WELCOME BACK</h1>

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
            Silakan <strong>masuk</strong> atau <strong>buat akun baru</strong> terlebih dahulu untuk melanjutkan checkout dan memantau pesanan Anda.
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
            <label htmlFor="login-page-email" className={styles.label}>
              Email
            </label>
            <input
              id="login-page-email"
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
            <label htmlFor="login-page-password" className={styles.label}>
              Password
            </label>
            <input
              id="login-page-password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              disabled={isSubmitting}
            />
          </div>

          <button
            type="button"
            onClick={() => alert('Lupa Password: Silakan hubungi Customer Service Admin WhatsApp Tenun Ikat Nura.')}
            className={styles.forgotLink}
          >
            Forgot Password?
          </button>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'LOGGING IN...' : 'LOGIN'}
          </button>
        </form>

        <div className={styles.switchBox}>
          Don&apos;t have an account?
          <Link href={registerHref} className={styles.switchBtn}>
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 20px 60px 20px', backgroundColor: '#ECE6DA' }}>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
