module.exports = {
  branches: ['main'],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/changelog',
      {
        changelogFile: 'docs/CHANGELOG.md',
      },
    ],
    [
      '@semantic-release/git',
      {
        assets: ['docs/CHANGELOG.md'],
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
