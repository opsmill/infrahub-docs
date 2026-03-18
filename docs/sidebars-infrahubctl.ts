import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';
import {readdirSync} from 'fs';
import {join} from 'path';
import {getCommandItems} from './sidebar-utils';

const docsDir = join(__dirname, 'docs-python-sdk', 'infrahubctl');
const commandItems = getCommandItems(readdirSync(docsDir));

const sidebars: SidebarsConfig = {
  infrahubctlSidebar: [
    {
      type: 'doc',
      id: 'infrahubctl',
      label: 'Infrahubctl CLI Tool',
    },
    {
      type: 'category',
      label: 'Commands',
      items: commandItems,
    },
  ],
};

export default sidebars;