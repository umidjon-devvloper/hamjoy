const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const sdkRoot = path.resolve(projectRoot, '../../packages/sdk');
const typesRoot = path.resolve(projectRoot, '../../packages/types');

const config = getDefaultConfig(projectRoot);

// Watch the two linked workspace packages so edits trigger a rebuild.
config.watchFolders = [sdkRoot, typesRoot];

// Honour the "exports" field so @joymee/sdk and @joymee/types resolve to
// their TypeScript sources (Metro + Babel can transpile .ts).
config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_enableSymlinks = true;

// When Metro walks into packages/sdk (which has no node_modules of its own),
// it still needs to resolve helpers like @babel/runtime. Point it at the
// mobile app's node_modules so those lookups succeed.
config.resolver.nodeModulesPaths = [path.join(projectRoot, 'node_modules')];

module.exports = config;
