// Metro config tuned for pnpm workspaces + isolated linker.
// We teach Metro:
//  1) Watch BOTH the mobile app and the workspace root (so hoisted deps + the SDK compile).
//  2) Walk node_modules starting from mobile/ then from the root — this lets Metro's
//     "haste" resolver find packages hoisted at root (via public-hoist-pattern).
//  3) Enable symlinks (default on in Metro ≥0.80) so pnpm's symlinked deps work.
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
config.resolver.disableHierarchicalLookup = false;
config.resolver.unstable_enableSymlinks = true;
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
