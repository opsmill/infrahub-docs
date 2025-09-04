import React, {type ReactNode} from 'react';
import NotFound from '@theme-original/NotFound';
import type NotFoundType from '@theme/NotFound';
import type {WrapperProps} from '@docusaurus/types';
import { useEffect } from 'react';

type Props = WrapperProps<typeof NotFoundType>;

export default function NotFoundWrapper(props: Props): ReactNode {
  useEffect(() => {
    // Only run on the client (browser)
    if (typeof window !== 'undefined' && typeof plausible === 'function') {
      plausible('404');
    }
  }, []);
  return (
    <>
      <NotFound {...props} />
    </>
  );
}
