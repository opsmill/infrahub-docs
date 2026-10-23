import React, {type ReactElement} from 'react';
import {useActivePlugin} from '@docusaurus/plugin-content-docs/client';
import DefaultNavbarItem from '@theme/NavbarItem/DefaultNavbarItem';
import type {Props as DefaultNavbarItemProps} from '@theme/NavbarItem/DefaultNavbarItem';

type Props = Omit<DefaultNavbarItemProps, 'href'> & {
  defaultHref: string;
  hrefByPluginId: Record<string, string>;
};

// Each docs plugin is synced from a different repository, so the header link follows the plugin of the current page.
export default function GitHubLinkNavbarItem({
  defaultHref,
  hrefByPluginId,
  ...props
}: Props): ReactElement {
  const activePlugin = useActivePlugin();
  const href = (activePlugin && hrefByPluginId[activePlugin.pluginId]) ?? defaultHref;
  return <DefaultNavbarItem {...props} href={href} />;
}
