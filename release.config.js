module.exports = {
  branches: ['main'],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/changelog',
      {
        changelogFile: 'CHANGELOG.md',
      },
    ],
    [
      '@semantic-release/git',
      {
        message: 'chore(release): releasing ${nextRelease.version} [skip ci]',
      },
    ],
    '@semantic-release/npm',
    [
      '@semantic-release/github',
      {
        assets: [{ path: 'dist/**' }, { path: 'package.json' }],
      },
    ],
  ],
  preset: 'angular',
};
