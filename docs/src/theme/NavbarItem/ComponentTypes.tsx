import ComponentTypes from '@theme-original/NavbarItem/ComponentTypes';
import GitHubRepoNavbarItem from '@site/src/components/GitHubRepoNavbarItem';

// Register custom navbar item types. Docusaurus requires the "custom-" prefix.
export default {
  ...ComponentTypes,
  'custom-githubRepoLink': GitHubRepoNavbarItem,
};
