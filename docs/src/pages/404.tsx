import React from 'react';
import Layout from '@theme/Layout';

export default function NotFound() {
  return (
    <Layout title="Page Not Found">
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          textAlign: 'center',
          backgroundImage: 'url("https://www.opsmill.com/wp-content/uploads/2024/07/captain_blackhook_In_manga_style_a_light_orange_otter_with_a__414352f0-1739-4324-886f-87fe16934d96_1.webp")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)', // Adjust opacity as needed (0.6 = 60% opacity)
          }}
        />
        <div style={{ position: 'relative', zIndex: 1, color: 'white' }}>
          <h1>404 - Page Not Found</h1>
          <p>Sorry, we couldn't find the page you're looking for.</p>
          <a href="/" style={{ marginTop: '20px', textDecoration: 'none', color: '#fff' }}>
            Go back to the homepage
          </a>
        </div>
      </div>
    </Layout>
  );
}