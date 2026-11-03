import React, {type ReactNode} from 'react';

// Floating "Ask AI" pill that opens the Kapa widget. Kapa's own launcher is hidden
// (data-launcher-button-hidden) because its logo-over-label layout can't be restyled
// into a horizontal pill from the outside. Styles live in src/css/custom.css.
export default function Root({children}: {children: ReactNode}): ReactNode {
  return (
    <>
      {children}
      <button
        type="button"
        className="kapa-launcher"
        aria-label="Ask AI"
        onClick={() => (window as any).Kapa?.open({ mode: 'ai' })}
      >
        <img
          className="kapa-launcher__logo"
          src="https://avatars.githubusercontent.com/u/118297816?s=200&v=4"
          alt=""
          width={22}
          height={22}
        />
        <span>Ask AI</span>
      </button>
    </>
  );
}
