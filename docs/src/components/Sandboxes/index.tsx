import React, { useEffect, useRef, useState } from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Details from '@theme/Details';
import IconExternalLink from '@theme/Icon/ExternalLink';
import styles from './styles.module.css';

// Maintained in opsmill/infrahub-sandbox-pipelines (docs/components/Sandboxes), where its tests run. opsmill/infrahub-docs
// keeps an identical copy at docs/src/components/Sandboxes: the documentation sync stops when the two differ. The generated
// MDX pages import this module and pass the public catalogue as plain data, so nothing here reads Infrahub or runs metadata as code.

export type Application = { name: string; driver: string; version: string; url: string };
// apiToken is the default API token of the login. Only a sandbox that has the tokens turned on gives one, and it is not the same in every sandbox
export type Account = { username: string; password: string; role: 'guest' | 'admin-guest'; apiToken?: string };
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

// ---- The page layout read from Infrahub: an overview with a comparison, and a page for each sandbox -----------------------------------
// The components above are the ones the pages used before. They stay until every page is generated with the components below, so a
// documentation site that still holds old pages keeps building.

type Status = Sandbox['status'];
// A piece of text from Infrahub, already split by the generator: plain text, bold, italic, or a link. Nothing is HTML.
export type Run = { text?: string; strong?: string; em?: string; href?: string };
// A paragraph or a bullet list of a text from Infrahub, in the order it was written.
export type Block = { p: Run[] } | { ul: Run[][] };
export type Button = { label: string; compact: string; url: string; primary: boolean };
export type CompareSandbox = {
  name: string;
  title: string;
  status: Status;
  summary: Run[] | null;
  activity: Run[] | null;
  endpoints?: { name: string; url: string }[];
  buttons?: Button[]; // What the pages generated before `endpoints` pass
  docsUrl: string | null;
  repositoryUrl: string;
};

const CONTACT: Run[] = [
  { text: 'Talk to OpsMill: ' },
  { text: 'book a meeting with OpsMill', href: 'https://cal.com/team/opsmill/meet' },
  { text: ' to discuss your use case, or ask questions in the ' },
  { text: 'OpsMill Discord', href: 'https://discord.gg/opsmill' },
  { text: '.' },
];

// What each login may do in Infrahub. Written from shared/rbac.yml of opsmill/infrahub-sandbox-pipelines and from the actions checked
// on 2026-10-30 that its README.md lists under "Permissions in every sandbox". Change this text whenever the roles in shared/rbac.yml
// change: a test of that repository compares the two.
// A login can still change its own password and create tokens for itself, which Infrahub does not cover with permissions, so
// the cannot sentences say "other accounts".
// `can` and `cannot` finish the sentences "<login> can ..." and "It cannot ...". `guest` is the user name of the guest login, when the sandbox has one.
type LoginDetails = { summary: string; can: (guest?: string) => React.ReactNode; cannot: string };
// What a sandbox whose only login is an admin guest tells it: there is no guest login to compare with
const ADMIN_ALONE = 'to explore, change data on any branch, and review and merge Proposed Changes';
const LOAD_OR_CHANGE = 'load a schema, or change other accounts, groups, roles, permissions, repositories or webhooks';
const LOGIN_DETAILS: Record<Account['role'], LoginDetails> = {
  guest: {
    summary: 'to explore, create a branch, change data on it and open a Proposed Change',
    can: () => 'read data, create a branch and write data on it, and open a Proposed Change',
    cannot: `write data on the main branch, approve or merge a Proposed Change, merge a branch, ${LOAD_OR_CHANGE}`,
  },
  'admin-guest': {
    summary: 'to also review and merge it',
    can: (guest) => (
      <>
        do everything {guest ? <code>{guest}</code> : 'a guest'} can, write data on the main branch, approve and merge Proposed Changes, and merge branches
      </>
    ),
    cannot: `approve its own Proposed Change, delete a branch that another login created, ${LOAD_OR_CHANGE}`,
  },
};
// An address of another site, or a page of this documentation.
function safeLink(url: string | null | undefined): string | undefined {
  return url && (/^https?:\/\//i.test(url) || (/^\/(?!\/)/.test(url) && !url.includes('\\'))) ? url : undefined;
}

// With `newTab`, a link to another site opens in a new tab and shows the icon that says so, as the other links of a card do.
function Runs({ runs, newTab = false }: { runs: Run[]; newTab?: boolean }) {
  return (
    <>
      {runs.map((run, index) => {
        if (run.strong !== undefined) return <strong key={index}>{run.strong}</strong>;
        if (run.em !== undefined) return <em key={index}>{run.em}</em>;
        const href = safeLink(run.href);
        if (href && newTab && safeUrl(href)) {
          return (
            <NewTabLink key={index} href={href}>
              {run.text}
            </NewTabLink>
          );
        }
        if (href) {
          return (
            <Link key={index} href={href}>
              {run.text}
            </Link>
          );
        }
        return <React.Fragment key={index}>{run.text}</React.Fragment>;
      })}
    </>
  );
}

// The name of an endpoint as a table shows it: "service portal" becomes "Service portal".
function endpointName(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function BlockList({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block, index) =>
        'p' in block ? (
          <p key={index}>
            <Runs runs={block.p} />
          </p>
        ) : (
          <ul key={index}>
            {block.ul.map((item, itemIndex) => (
              <li key={itemIndex}>
                <Runs runs={item} />
              </li>
            ))}
          </ul>
        ),
      )}
    </>
  );
}

// An application a visitor opens. `login` is true on Infrahub, whose accounts the visitor logins are, and the row lists them there.
// The other rows show no login: an application that signs in to Infrahub with them, such as a portal, asks for them itself.
export type Endpoint = { name: string; url: string; login: boolean };

// The opening of a sandbox page: what the sandbox is, then a table with one row for each application a visitor can open, with its address
// and the logins it takes, in the style of the login table of the overview page. `buttons` is what the pages generated before `endpoints` pass: one plain link for each application.
export function SandboxIntro({
  description,
  status,
  buttons = [],
  endpoints,
  accounts = [],
}: {
  description: Run[] | null;
  status: Status;
  buttons?: Button[];
  endpoints?: Endpoint[];
  accounts?: Account[];
}) {
  const ordered = [...accounts].sort((a, b) => roleRank(a) - roleRank(b));
  const logins = ordered.map((account) => (
    // A login and an endpoint name stay on one line: the address column wraps instead
    <div key={account.username} style={{ whiteSpace: 'nowrap' }}>
      {ROLE_LABELS[account.role] ?? account.role} <code style={{ whiteSpace: 'pre' }}>{`${account.username}/${account.password}`}</code>
    </div>
  ));
  return (
    <div>
      {status === 'maintenance' ? (
        <p>
          <StatusPill status={status} />
        </p>
      ) : null}
      {description ? (
        <p>
          <Runs runs={description} />
        </p>
      ) : null}
      {endpoints ? (
        <div className={styles.loginTable}>
          <table>
            <thead>
              <tr>
                <th scope="col">Endpoint</th>
                <th scope="col">Address</th>
                <th scope="col">Login</th>
              </tr>
            </thead>
            <tbody>
              {endpoints.map((endpoint) => {
                const href = safeUrl(endpoint.url);
                return (
                  <tr key={endpoint.url}>
                    <th scope="row" style={{ whiteSpace: 'nowrap' }}>
                      {endpointName(endpoint.name)}
                    </th>
                    <td>{href ? <Link href={href}>{href.replace(/^https?:\/\//i, '').replace(/\/$/, '')}</Link> : null}</td>
                    <td>{endpoint.login ? (ordered.length ? logins : 'No visitor login is listed') : null}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
      {/* Plain links, one to a line, as the other links of a page */}
      {(endpoints ? [] : buttons).map((button) => {
        const href = safeUrl(button.url);
        return href ? (
          <p key={button.url}>
            <Link href={href}>{button.label}</Link>
          </p>
        ) : null;
      })}
    </div>
  );
}

export function SandboxBlocks({ blocks }: { blocks: Block[] }) {
  return <BlockList blocks={blocks} />;
}

// Which password goes with which login, whatever the number of logins: one sentence when they share it, one for each login when they do not.
function Passwords({ accounts }: { accounts: Account[] }) {
  const passwords = new Set(accounts.map((account) => account.password));
  if (passwords.size === 1) {
    const which = accounts.length === 1 ? 'The login uses' : accounts.length === 2 ? 'Both logins use' : 'All logins use';
    return (
      <>
        {which} the password <code>{accounts[0].password}</code>.
      </>
    );
  }
  return (
    <>
      {accounts.map((account) => (
        <React.Fragment key={account.username}>
          <code>{account.username}</code> uses the password <code>{account.password}</code>.{' '}
        </React.Fragment>
      ))}
    </>
  );
}

// The logins are the same kind in every sandbox, so this part of the page has the same words in each. The user names and passwords come
// from Infrahub, so they stay correct when one changes.
// The default API token of each login: it works with the API and the Python SDK at once, without a login to generate a token first, and has the permissions of its login.
// The tokens are public, as the passwords of the logins are. The address of the Infrahub is only used to write the example.
function ApiTokens({ accounts, infrahubUrl }: { accounts: Account[]; infrahubUrl?: string }) {
  const address = safeUrl(infrahubUrl) ?? 'https://<the address of this Infrahub>';
  const example = accounts[0];
  return (
    <>
      <h3>API tokens</h3>
      <p>
        Each login has an API token, so you can use the API or the Python SDK at once, without generating a token first. A token has the permissions of its login. The tokens are public,
        like the passwords. A token stays the same after the nightly reset, and changes when the sandbox is built again: this page shows the current one.
      </p>
      <div className={styles.loginTable}>
        <table>
          <thead>
            <tr>
              <th scope="col">Login</th>
              <th scope="col">API token</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <tr key={account.username}>
                <td>
                  {ROLE_LABELS[account.role] ?? account.role} (<code>{account.username}</code>)
                </td>
                <td>
                  <span className={styles.loginValue}>
                    <code>{account.apiToken}</code>
                    <CopyButton value={account.apiToken ?? ''} label={`${roleLabel(account)} API token`} />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>For example, this request asks which account the {roleLabel(example)} token belongs to:</p>
      <pre>
        <code>{`curl -s -X POST ${address}/graphql/main \\
  -H "X-INFRAHUB-KEY: ${example.apiToken ?? ''}" \\
  -H "Content-Type: application/json" \\
  -d '{"query": "{ AccountProfile { name { value } } }"}'`}</code>
      </pre>
      <p>
        The answer shows the name of the account that holds the token. Its name ends with <code>-api</code>, and it has the permissions of the login. The Python SDK reads the address and the token
        from the variables <code>INFRAHUB_ADDRESS</code> and <code>INFRAHUB_API_TOKEN</code>.
      </p>
    </>
  );
}

export function SandboxLogin({ accounts, infrahubUrl }: { accounts: Account[]; infrahubUrl?: string }) {
  // A login with a role that is not known goes last
  const rank = (account: Account) => (ROLE_ORDER.indexOf(account.role) === -1 ? ROLE_ORDER.length : ROLE_ORDER.indexOf(account.role));
  const ordered = [...accounts].sort((a, b) => rank(a) - rank(b));
  const guest = ordered.find((account) => account.role === 'guest');
  const admin = ordered.find((account) => account.role === 'admin-guest');
  if (ordered.length === 0) return <p>No visitor login is listed for this sandbox.</p>;
  return (
    <>
      <p>
        {ordered.map((account, index) => (
          <React.Fragment key={account.username}>
            {index === 0 ? 'Log in as ' : ' Log in as '}
            {ROLE_LABELS[account.role] ?? account.role} (<code style={{ whiteSpace: 'pre-wrap' }}>{`${account.username}/${account.password}`}</code>){' '}
            {account.role === 'admin-guest' && !guest ? ADMIN_ALONE : (LOGIN_DETAILS[account.role]?.summary ?? '')}.
          </React.Fragment>
        ))}
      </p>
      {guest && admin ? (
        <>
          <p>A visit that uses both logins:</p>
          <ol>
            <li>
              Log in as <code>{guest.username}</code>, create a branch, and change data on it.
            </li>
            <li>Open a Proposed Change for the branch, then log out.</li>
            <li>
              Log in as <code>{admin.username}</code>, review the Proposed Change and merge it.
            </li>
          </ol>
        </>
      ) : null}
      {ordered.some((account) => account.apiToken) ? <ApiTokens accounts={ordered.filter((account) => account.apiToken)} infrahubUrl={infrahubUrl} /> : null}
      <p>The sandbox is reset every night, so the changes you make are removed.</p>
      {/* The same collapsible block the documentation site gives a <details> written in Markdown */}
      <Details summary={<summary>What each login can and cannot do</summary>}>
        {ordered.map((account) => {
          const details = LOGIN_DETAILS[account.role];
          return details ? (
            <p key={account.username}>
              <code>{account.username}</code> can {details.can(guest?.username)}. It cannot {details.cannot}.
            </p>
          ) : null;
        })}
      </Details>
    </>
  );
}

// The next steps of a sandbox come from Infrahub. The way to contact OpsMill is the same for every sandbox, so it is added here.
export function SandboxNextSteps({ blocks, repositoryUrl }: { blocks: Block[]; repositoryUrl: string }) {
  const repository = safeUrl(repositoryUrl);
  const shown: Block[] = blocks.length
    ? [...blocks]
    : [
        {
          ul: repository
            ? [[{ text: 'Run the demo yourself: clone the ' }, { text: 'GitHub project', href: repository }, { text: ' and follow its guide.' }]]
            : [],
        },
      ];
  const last = shown[shown.length - 1];
  if ('ul' in last) shown[shown.length - 1] = { ul: [...last.ul, CONTACT] };
  else shown.push({ ul: [CONTACT] });
  return <BlockList blocks={shown} />;
}

function Row({ label, cells }: { label: string; cells: (React.ReactNode | null)[] }) {
  if (cells.every((cell) => cell === null)) return null;
  return (
    <tr>
      <th scope="row">{label}</th>
      {cells.map((cell, index) => (
        <td key={index}>{cell}</td>
      ))}
    </tr>
  );
}

// What each login is for, in the table of the overview page.
const LOGIN_USE: Record<Account['role'], string> = {
  guest: 'Change data on a branch and open a Proposed Change',
  'admin-guest': 'Review and merge Proposed Changes',
};

// The overview page lists the logins that every sandbox has: one column for each login, and a button that copies each value.
export function SandboxLoginTable({ accounts }: { accounts: Account[] }) {
  const ordered = [...accounts].sort((a, b) => roleRank(a) - roleRank(b));
  const value = (account: Account, key: 'username' | 'password') => (
    <span className={styles.loginValue}>
      <code style={{ whiteSpace: 'pre-wrap' }}>{account[key]}</code>
      <CopyButton value={account[key]} label={`${roleLabel(account)} ${key}`} />
    </span>
  );
  return (
    <div className={styles.loginTable}>
      <table>
        <thead>
          <tr>
            <th />
            {ordered.map((account) => (
              <th scope="col" key={account.username}>
                {ROLE_LABELS[account.role] ?? account.role}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <Row label="Username" cells={ordered.map((account) => value(account, 'username'))} />
          <Row label="Password" cells={ordered.map((account) => value(account, 'password'))} />
          <Row label="Use it to" cells={ordered.map((account) => LOGIN_USE[account.role] ?? null)} />
        </tbody>
      </table>
    </div>
  );
}

// The overview page compares the sandboxes: one row for each, the same columns in every row, so the table grows down, not across, as
// sandboxes are added. A column that no sandbox fills is left out.
export function SandboxCompare({ sandboxes }: { sandboxes: CompareSandbox[] }) {
  if (sandboxes.length === 0) return <p>There are no sandboxes listed at present.</p>;
  const text = (runs: Run[] | null) => (runs ? <Runs runs={runs} /> : null);
  const lines = (
    [
      ['For teams that', (sandbox: CompareSandbox) => sandbox.summary],
      ['What you do', (sandbox: CompareSandbox) => sandbox.activity],
    ] as const
  ).filter(([, value]) => sandboxes.some((sandbox) => value(sandbox)));
  // The visible text of a link is short; its name for assistive technology says which sandbox it belongs to.
  const links = (sandbox: CompareSandbox) =>
    [
      { label: 'Sandbox guide', name: `${sandbox.title} sandbox guide`, href: `${ROUTE_BASE}/${sandbox.name}` },
      { label: 'Documentation', name: `${sandbox.title} documentation`, href: safeUrl(sandbox.docsUrl) },
      { label: 'GitHub repository', name: `${sandbox.title} repository`, href: safeUrl(sandbox.repositoryUrl) },
    ].filter((link) => link.href);
  // The pages generated before `endpoints` pass `buttons`: the button of Infrahub, and "Open the <name>" for the others
  const endpoints = (sandbox: CompareSandbox) =>
    sandbox.endpoints ??
    (sandbox.buttons ?? []).map((button) => ({ name: button.primary ? 'Infrahub' : button.compact.replace(/^Open the /, ''), url: button.url }));
  return (
    <div className={styles.compare}>
      <table>
        <thead>
          <tr>
            <th scope="col">Sandbox</th>
            <th scope="col">Endpoints</th>
            {lines.map(([label]) => (
              <th scope="col" key={label}>
                {label}
              </th>
            ))}
            <th scope="col">Read more</th>
          </tr>
        </thead>
        <tbody>
          {sandboxes.map((sandbox) => (
            <tr key={sandbox.name}>
              <th scope="row">
                <div className={styles.compareTitle}>
                  <Link to={`${ROUTE_BASE}/${sandbox.name}`}>{sandbox.title}</Link>
                </div>
                {sandbox.status === 'maintenance' ? (
                  <div>
                    <StatusPill status={sandbox.status} />
                  </div>
                ) : null}
              </th>
              <td>
                {/* Each link opens its application in a new tab; its name for assistive technology says which sandbox it belongs to */}
                <ul className={styles.compareLinks}>
                  {endpoints(sandbox).map((endpoint) => {
                    const href = safeUrl(endpoint.url);
                    return href ? (
                      <li key={endpoint.url}>
                        <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`${sandbox.title} ${endpointName(endpoint.name)}`}>
                          {endpointName(endpoint.name)} <IconExternalLink />
                        </a>
                      </li>
                    ) : null;
                  })}
                </ul>
              </td>
              {lines.map(([label, value]) => (
                <td key={label}>{text(value(sandbox))}</td>
              ))}
              <td>
                <ul className={styles.compareLinks}>
                  {links(sandbox).map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} aria-label={link.name}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// "Run Infrahub on your own machine": the GitHub project of each demo.
export function SandboxRepositories({ sandboxes }: { sandboxes: CompareSandbox[] }) {
  return (
    <ul>
      {sandboxes.map((sandbox) => (
        <li key={sandbox.name}>
          {sandbox.title}: the{' '}
          {safeUrl(sandbox.repositoryUrl) ? <Link href={safeUrl(sandbox.repositoryUrl)}>{sandbox.title} GitHub project</Link> : `${sandbox.title} GitHub project`}
        </li>
      ))}
    </ul>
  );
}

// The Explore Infrahub page shows one card for each sandbox, one under the other, and under the cards the logins that every sandbox has.
// A card shows the title of the sandbox, its paragraphs (its two card texts, or its description), a link to its documentation and a link
// that opens it at the end of the last paragraph, and a button to its page in the sandboxes section.
export type ExploreSandbox = {
  name: string;
  title: string;
  status: Status;
  paragraphs: Run[][];
  docsUrl: string | null;
  sandboxUrl: string | null;
};

// A link that opens in a new tab, with the icon that says so.
function NewTabLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children} <IconExternalLink />
    </a>
  );
}

// "Open sandbox" opens the login page of the sandbox, so the logins come right after the cards.
function ExploreLogins({ accounts }: { accounts: Account[] }) {
  const ordered = [...accounts].sort((a, b) => roleRank(a) - roleRank(b));
  const guest = ordered.find((account) => account.role === 'guest');
  const admin = ordered.find((account) => account.role === 'admin-guest');
  if (ordered.length === 0) return null;
  return (
    <p className={styles.exploreLogins}>
      {guest && admin ? (
        <>
          Log in as <code>{guest.username}</code> to explore, or as <code>{admin.username}</code> to also review and merge changes.
        </>
      ) : (
        ordered.map((account, index) => (
          <React.Fragment key={account.username}>
            {index === 0 ? '' : ' '}Log in as <code>{account.username}</code>.
          </React.Fragment>
        ))
      )}{' '}
      <Passwords accounts={ordered} />
    </p>
  );
}

export function SandboxExploreCards({ sandboxes, accounts = [] }: { sandboxes: ExploreSandbox[]; accounts?: Account[] }) {
  if (sandboxes.length === 0) return null;
  return (
    <div className={styles.exploreCards}>
      {sandboxes.map((sandbox) => {
        const docs = safeUrl(sandbox.docsUrl);
        const open = safeUrl(sandbox.sandboxUrl);
        const links = (
          <>
            {docs ? (
              <>
                {' '}
                <NewTabLink href={docs}>Documentation »</NewTabLink>
              </>
            ) : null}
            {open ? (
              <>
                {' '}
                <NewTabLink href={open}>Open sandbox</NewTabLink>
              </>
            ) : null}
          </>
        );
        // The links go at the end of the last paragraph, or alone when the sandbox has no text
        const paragraphs = sandbox.paragraphs.length ? sandbox.paragraphs : [[]];
        return (
          <div className={`${styles.card} ${styles.exploreCard}`} key={sandbox.name}>
            <div className={styles.exploreText}>
              {sandbox.status === 'maintenance' ? (
                <div className={styles.cardTop}>
                  <StatusPill status={sandbox.status} />
                </div>
              ) : null}
              <h3 className={styles.cardTitle}>{sandbox.title}</h3>
              {paragraphs.map((runs, index) => (
                <p className={styles.cardDescription} key={index}>
                  <Runs runs={runs} newTab />
                  {index === paragraphs.length - 1 ? links : null}
                </p>
              ))}
            </div>
            <div className={styles.exploreAction}>
              <ButtonLink href={`${ROUTE_BASE}/${sandbox.name}`}>Learn more</ButtonLink>
            </div>
          </div>
        );
      })}
      <ExploreLogins accounts={accounts} />
    </div>
  );
}
