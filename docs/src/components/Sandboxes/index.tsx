import React, { useEffect, useRef, useState } from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

// Maintained in opsmill/infrahub-sandbox-pipelines (docs/components/Sandboxes), where its tests run. opsmill/infrahub-docs
// keeps an identical copy at docs/src/components/Sandboxes: the documentation sync stops when the two differ. The generated
// MDX pages import this module and pass the public catalogue as plain data, so nothing here reads Infrahub or runs metadata as code.

export type Application = { name: string; driver: string; version: string; url: string };
export type Account = { username: string; password: string; role: 'guest' | 'admin-guest' };
export type Sandbox = {
  name: string;
  title: string;
  description: string | null;
  status: 'available' | 'maintenance';
  applications: Application[];
  accounts: Account[];
  walkthroughUrl: string | null;
  repositoryUrl: string;
};

// Must match the `routeBasePath` the documentation site gives this section.
const ROUTE_BASE = '/sandboxes';
const ROLE_LABELS: Record<Account['role'], string> = { guest: 'Guest', 'admin-guest': 'Admin guest' };
// Guest logins come first, then admin guest logins, whatever order the catalogue lists them in.
const ROLE_ORDER: Account['role'][] = ['guest', 'admin-guest'];
const INFRAHUB_LOGO = '/img/infrahub-logo.svg';
// The "Permissions and roles" page of the Infrahub documentation. It is a page of the same site, so the link works in the
// preview and on docs.infrahub.app. A test checks that the page exists in the documentation site.
const RBAC_DOCS = '/deploy-manage/user-management/permissions-roles/overview';

// What each login may do in Infrahub. Written from shared/rbac.yml of opsmill/infrahub-sandbox-pipelines and from the actions checked
// on 2026-10-30 that its README.md lists under "Permissions in every sandbox". Change this text whenever the roles in shared/rbac.yml
// change: a test of that repository compares the two.
// A login can still change its own password and create tokens for itself, which Infrahub does not cover with permissions, so
// the Cannot lists say "other accounts".
type RoleDetails = { summary: string; can: string[]; cannot: string[] };
const ROLE_DETAILS: Record<Account['role'], RoleDetails> = {
  guest: {
    summary: 'Explore, and try changes on a branch.',
    can: ['Read data', 'Create a branch and write data on it', 'Open a proposed change'],
    cannot: [
      'Write data on the main branch',
      'Approve or merge a proposed change',
      'Merge a branch',
      'Load a schema, or change other accounts, groups, roles, permissions, repositories or webhooks',
    ],
  },
  'admin-guest': {
    summary: 'A guest, plus writing data on the main branch and merging.',
    can: ['Everything a guest can do', 'Write data on the main branch', 'Approve and merge proposed changes, and merge branches'],
    cannot: [
      'Approve its own proposed change',
      'Delete a branch that another login created',
      'Load a schema, or change other accounts, groups, roles, permissions, repositories or webhooks',
    ],
  },
};

function roleRank(account: Account): number {
  const rank = ROLE_ORDER.indexOf(account.role);
  return rank === -1 ? ROLE_ORDER.length : rank;
}

function roleLabel(account: Account): string {
  return (ROLE_LABELS[account.role] ?? account.role).toLowerCase();
}

function isInfrahub(application: Application): boolean {
  return application.driver.startsWith('infrahub');
}

// Only web addresses become links, whatever the catalogue contains.
function safeUrl(url: string | null | undefined): string | undefined {
  return url && /^https?:\/\//i.test(url) ? url : undefined;
}

// Copies the text with the browser clipboard, and with a hidden text field where the clipboard is not available.
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const previous = document.activeElement as HTMLElement | null;
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.appendChild(field);
    field.select();
    try {
      return document.execCommand('copy');
    } catch {
      return false;
    } finally {
      document.body.removeChild(field);
      previous?.focus(); // Keeps the keyboard position on the button that was pressed.
    }
  }
}

// `label` names the text for assistive technology, for example "guest password", because several logins share a page.
function CopyButton({ value, label }: { value: string; label: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearTimeout(timer.current);
    };
  }, []);
  const copy = async () => {
    const copied = await copyText(value);
    if (!mounted.current) return;
    setState(copied ? 'copied' : 'failed');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState('idle'), 1500);
  };
  const announcement = state === 'copied' ? `Copied ${label}` : state === 'failed' ? `Could not copy ${label}` : '';
  return (
    <>
      <button type="button" className={styles.copyButton} onClick={copy} aria-label={`Copy ${label}`}>
        {state === 'copied' ? 'Copied' : state === 'failed' ? 'Copy failed' : 'Copy'}
      </button>
      <span className={styles.visuallyHidden} role="status">
        {announcement}
      </span>
    </>
  );
}

// Only a sandbox under maintenance is flagged: "available" is the normal state and tells a visitor nothing.
function StatusPill({ status }: { status: Sandbox['status'] }) {
  if (status === 'available') return null;
  return <span className={`${styles.pill} ${styles.pillMaintenance}`}>Under maintenance</span>;
}

function ButtonLink({
  href,
  children,
  secondary = false,
  icon,
}: {
  href?: string;
  children: React.ReactNode;
  secondary?: boolean;
  icon?: React.ReactNode;
}) {
  if (!href) return null;
  return (
    <Link className={`${styles.button} ${secondary ? styles.buttonSecondary : ''}`} href={href}>
      {icon}
      {children} <span aria-hidden="true">→</span>
    </Link>
  );
}

// An open book, for the walkthrough. It is decoration: the button's text names it.
function BookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z" />
      <path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function SandboxCard({ sandbox }: { sandbox: Sandbox }) {
  return (
    <div className={styles.card}>
      {sandbox.status === 'maintenance' ? (
        <div className={styles.cardTop}>
          <StatusPill status={sandbox.status} />
        </div>
      ) : null}
      <h2 className={styles.cardTitle}>
        <Link to={`${ROUTE_BASE}/${sandbox.name}`}>{sandbox.title}</Link>
      </h2>
      {sandbox.description ? <p className={styles.cardDescription}>{sandbox.description}</p> : <div className={styles.cardDescription} />}
      <div className={styles.pills}>
        {sandbox.applications.map((application) => (
          <span className={styles.pill} key={application.name}>
            {application.name}
            {application.version && isInfrahub(application) ? ` ${application.version}` : ''}
          </span>
        ))}
      </div>
      <div className={styles.actions}>
        <ButtonLink href={`${ROUTE_BASE}/${sandbox.name}`}>Open sandbox</ButtonLink>
      </div>
    </div>
  );
}

export function SandboxCatalogue({ sandboxes }: { sandboxes: Sandbox[] }) {
  return (
    <div className={styles.catalogue}>
      <p className={styles.subtitle}>
        Try Infrahub in a hosted demo. Open a sandbox to see its logins and applications.
      </p>
      <p className={styles.note}>Sandboxes reset every night, so the changes you make are temporary.</p>
      <div className={styles.resultsHeader}>
        <p>{sandboxes.length === 1 ? 'All 1 sandbox' : `All ${sandboxes.length} sandboxes`}</p>
      </div>
      {sandboxes.length === 0 ? (
        <p>There are no public sandboxes listed at present.</p>
      ) : (
        <div className={styles.grid}>
          {sandboxes.map((sandbox) => (
            <SandboxCard key={sandbox.name} sandbox={sandbox} />
          ))}
        </div>
      )}
    </div>
  );
}

export function SandboxSummary({
  description,
  status,
  walkthroughUrl,
}: {
  description: string | null;
  status: Sandbox['status'];
  walkthroughUrl: string | null;
}) {
  const walkthrough = safeUrl(walkthroughUrl);
  return (
    <div>
      {description ? <p>{description}</p> : null}
      {status === 'maintenance' || walkthrough ? (
        <div className={styles.actions}>
          <StatusPill status={status} />
          <ButtonLink href={walkthrough} icon={<BookIcon />}>
            Walkthrough
          </ButtonLink>
        </div>
      ) : null}
    </div>
  );
}

function PermissionList({ title, items, kind, className }: { title: string; items: string[]; kind: 'can' | 'cannot'; className: string }) {
  return (
    <div className={className}>
      <div className={`${styles.permissionTitle} ${kind === 'can' ? styles.permissionCan : styles.permissionCannot}`}>{title}</div>
      <ul className={styles.permissionList}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

// The logins are accounts of one application, so `applicationName` says which one they open.
export function VisitorLogins({ accounts, applicationName }: { accounts: Account[]; applicationName?: string }) {
  return (
    <div className={styles.loginBox}>
      <p className={styles.loginCaption}>
        {applicationName ? (
          <>
            These shared logins let you explore how Infrahub&apos;s <Link to={RBAC_DOCS}>RBAC</Link> works.
          </>
        ) : (
          'These logins are shared by all visitors.'
        )}
      </p>
      <div className={styles.logins}>
        {[...accounts].sort((a, b) => roleRank(a) - roleRank(b)).map((account) => {
          const details = ROLE_DETAILS[account.role];
          return (
            // A card always has the same six parts, in the same order, so that the cards can share their row heights:
            // the summaries, the logins, the dividers, and the Can and Cannot lists line up across the cards.
            <div className={styles.loginCard} key={account.username}>
              <div className={styles.eyebrow}>{ROLE_LABELS[account.role] ?? account.role}</div>
              <p className={styles.roleSummary}>{details?.summary}</p>
              <div className={styles.loginRow}>
                <span>Username</span>
                <code>{account.username}</code>
                <CopyButton value={account.username} label={`${roleLabel(account)} username`} />
              </div>
              <div className={styles.loginRow}>
                <span>Password</span>
                <code style={{ whiteSpace: 'pre-wrap' }}>{account.password}</code>
                <CopyButton value={account.password} label={`${roleLabel(account)} password`} />
              </div>
              {details ? (
                <PermissionList title="Can" items={details.can} kind="can" className={styles.permissionFirst} />
              ) : (
                <div />
              )}
              {details ? (
                <PermissionList title="Cannot" items={details.cannot} kind="cannot" className={styles.permissionSecond} />
              ) : (
                <div />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// The visitor logins are Infrahub accounts, which `seed` creates in the one Infrahub application of a sandbox. They are shown
// inside that application's card. A sandbox with logins and no Infrahub application still lists them, above the applications.
export function ApplicationCards({
  applications,
  accounts = [],
  demoTitle,
}: {
  applications: Application[];
  accounts?: Account[];
  demoTitle?: string;
}) {
  const logo = useBaseUrl(INFRAHUB_LOGO);
  const owner = applications.find(isInfrahub);
  const others = applications.filter((application) => application !== owner);
  return (
    <>
      {!owner && accounts.length > 0 ? <VisitorLogins accounts={accounts} /> : null}
      <div className={styles.apps}>
        {owner ? (
          <div className={`${styles.card} ${styles.cardWide}`}>
            <div className={styles.eyebrow}>Application</div>
            <div className={styles.appHeader}>
              <h3 className={`${styles.cardTitle} ${styles.appTitle}`}>
                <img className={styles.appLogo} src={logo} alt="" width={28} height={28} />
                {owner.name}
              </h3>
              <ButtonLink href={safeUrl(owner.url)}>Open {owner.name}</ButtonLink>
            </div>
            <h4 className={styles.subheading}>Visitor logins</h4>
            {accounts.length > 0 ? (
              <VisitorLogins accounts={accounts} applicationName={owner.name} />
            ) : (
              <p>No visitor login is listed for this demo.</p>
            )}
          </div>
        ) : null}
        {owner && others.length > 0 ? (
          <p className={styles.appsIntro}>
            To fully explore {demoTitle ? `the ${demoTitle} demo` : 'this demo'}, you also need these applications. They run alongside Infrahub.
          </p>
        ) : null}
        {others.map((application) => (
          <div className={styles.card} key={application.name}>
            <div className={styles.eyebrow}>Application</div>
            <h3 className={`${styles.cardTitle} ${styles.appTitle}`}>
              {isInfrahub(application) ? <img className={styles.appLogo} src={logo} alt="" width={28} height={28} /> : null}
              {application.name}
            </h3>
            <div className={styles.actions}>
              <ButtonLink href={safeUrl(application.url)}>Open {application.name}</ButtonLink>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export function NextSteps({ repositoryUrl }: { repositoryUrl: string }) {
  const repository = safeUrl(repositoryUrl);
  return (
    <div className={styles.actions}>
      {repository ? (
        <Link className={styles.detailsLink} href={repository}>
          Source repository
        </Link>
      ) : null}
      <Link className={styles.detailsLink} to={ROUTE_BASE}>
        All public sandboxes
      </Link>
    </div>
  );
}
