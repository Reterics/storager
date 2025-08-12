export default {
  // logging: 'debug',
  provider: 'v8',

  name: 'StorageR Coverage Report',

  reports: ['console-details', 'v8'],
  lcov: true,

  outputDir: 'coverage',

  onEnd: (results) => {
    console.log(`coverage report generated: ${results.reportPath}`);
  },

  filter: {
    // exclude files/folders from coverage
    '**/*.+(svg|css)': false,
    '**/*.html': false,
    '**/assets/*': false,
    '**/*.d.ts': false,
    '**/*.json': false,
    'tests/**': false,
    '**/*.test.ts': false,
    '**/*.test.tsx': false,
    '**/*.spec.ts': false,
    '**/*.spec.tsx': false,
    'tests/setup.js': false,
    '**/interfaces/*.ts': false,

    // include files
    '**/*.css': 'css',
    '**/*': true,
  },
};
