import React, {type ReactNode, useEffect} from 'react';
import clsx from 'clsx';
import Translate from '@docusaurus/Translate';
import type {Props} from '@theme/NotFound/Content';
import Heading from '@theme/Heading';

export default function NotFoundContent({className}: Props): ReactNode {
  useEffect(() => {
    // Only run on the client (browser)
    if (typeof window !== 'undefined' && typeof plausible === 'function') {
      plausible('404');
    }
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        textAlign: 'center',
        backgroundImage: 'url("/img/404.jpg")',
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
        <main className={clsx('container margin-vert--xl', className)}>
          <div className="row">
            <div className="col col--6 col--offset-3">
              <Heading as="h1" className="hero__title">
                <Translate
                  id="theme.NotFound.title"
                  description="The title of the 404 page">
                  Page Not Found
                </Translate>
              </Heading>
              <p>
                <Translate
                  id="theme.NotFound.p1"
                  description="The first paragraph of the 404 page">
                  Sorry, we couldn't find the page you're looking for.
                </Translate>
              </p>
              <p>
                <a href="/" style={{ marginTop: '20px', textDecoration: 'none', color: '#fff' }}>
                  <Translate
                    id="theme.NotFound.p2"
                    description="The 2nd paragraph of the 404 page"> 
                    Go back to the homepage
                  </Translate>
                </a>
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
