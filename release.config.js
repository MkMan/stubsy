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
        message: 'chore(release): releasing ${nextRelease.version}',
      },
    ],
    '@semantic-release/npm',
    [
      '@semantic-release/github',
      {
        assets: [
          { path: 'dist/**', label: 'Distribution' },
          { path: 'package.json', label: 'Package manifest' },
        ],
      },
    ],
  ],
  preset: 'angular',
};
