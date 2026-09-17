'use client';

import { useAuth } from '@/context/AuthContext';
import styles from './AccountDrawer.module.css';

export default function AccountDrawer() {
  const {
    user,
    isLoggedIn,
    logout,
    isAccountDrawerOpen,
    closeAccountDrawer,
    openAuthModal,
  } = useAuth();

  return (
    <>
      <div
        className={`${styles.backdrop} ${isAccountDrawerOpen ? styles.backdropOpen : ''}`}
        onClick={closeAccountDrawer}
        aria-hidden="true"
      />

      <aside
        className={`${styles.drawer} ${isAccountDrawerOpen ? styles.drawerOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Akun Saya"
      >
        <div className={styles.header}>
          <h2 className={styles.title}>MY ACCOUNT</h2>
          <button
            onClick={closeAccountDrawer}
            className={styles.closeBtn}
            aria-label="Tutup panel akun"
          >
            &times;
          </button>
        </div>

        <div className={styles.body}>
          {!isLoggedIn ? (
            /* STATE A: NOT LOGGED IN */
            <div>
              <p className={styles.subtitle}>Welcome to Tenun Ikat Nura</p>
              
              <button
                onClick={() => {
                  closeAccountDrawer();
                  openAuthModal('login');
                }}
                className={styles.loginBtn}
              >
                LOGIN
              </button>

              <div className={styles.registerBox}>
                <p className={styles.registerPrompt}>Don&apos;t have an account?</p>
                <button
                  onClick={() => {
                    closeAccountDrawer();
                    openAuthModal('register');
                  }}
                  className={styles.registerBtn}
                >
                  Create an Account
                </button>
              </div>
            </div>
          ) : (
            /* STATE B: LOGGED IN */
            <div>
              <h3 className={styles.greeting}>Hello, {user.name}</h3>
              <p className={styles.userEmail}>{user.email}</p>

              <div className={styles.menuList}>
                <button
                  type="button"
                  onClick={() => alert('Profil Pengguna: ' + user.name + ' (' + user.email + ')')}
                  className={styles.menuItem}
                  style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%', cursor: 'pointer' }}
                >
                  My Profile
                </button>
                <button
                  type="button"
                  onClick={() => alert('Pesanan Saya: Belum ada pesanan aktif.')}
                  className={styles.menuItem}
                  style={{ background: 'none', border: 'none', textAlign: 'left', width: '100%', cursor: 'pointer' }}
                >
                  My Orders
                </button>
              </div>

              <button onClick={logout} className={styles.logoutBtn}>
                LOGOUT
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
