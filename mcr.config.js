export default {
    // logging: 'debug',
    provider: 'v8',

    name: 'StorageR Coverage Report',

    reports: [
        'console-details',
        'v8'
    ],
    lcov: true,

    outputDir: 'coverage',

    onEnd: (results) => {
        console.log(`coverage report generated: ${results.reportPath}`);
    },

    filter: {
        '**/*.+(svg|css)': false,
        '**/*.html': false,
        '**/assets/*': false,
        '**/*.d.ts': false,
        '**/*.json': false,
        '**/*.test.tsx': false,
        '**/interfaces/*.ts': false,

        // include files
        '**/*.css': 'css',
        '**/*': true
    }
};
