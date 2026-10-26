/**
 * Redirect table for the Infrahub Backup "guides" reorganization.
 *
 * The pages under /backup/guides/ moved to /backup/backup/ (backup and
 * restore), /backup/collect/ (troubleshooting bundles), and /backup/ (self
 * update). All paths are relative to the site root, matching the
 * docs-backup plugin's routeBasePath "backup".
 *
 * Usage in docusaurus.config.ts:
 *
 *   import { redirects_backup_guides } from './redirects-backup-guides';
 *   // ...
 *   plugins: [
 *     ['@docusaurus/plugin-client-redirects', { redirects: [...redirects_backup_guides] }],
 *   ],
 */

type Redirect = { from: string | string[]; to: string };

export const redirects_backup_guides: Redirect[] = [
  { to: '/backup/backup/install', from: '/backup/guides/install' },
  { to: '/backup/backup/create', from: '/backup/guides/backup-instance' },
  { to: '/backup/backup/restore', from: '/backup/guides/restore-backup' },
  { to: '/backup/backup/kubernetes-backup', from: '/backup/guides/kubernetes-backup' },
  { to: '/backup/backup/kubernetes-restore', from: '/backup/guides/kubernetes-restore' },
  { to: '/backup/collect/install', from: '/backup/guides/install-collect' },
  { to: '/backup/collect/create', from: '/backup/guides/collect-troubleshooting-bundle' },
  { to: '/backup/self-update', from: '/backup/guides/self-update' },
];
