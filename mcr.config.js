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

    all: {
        dir: ['./src'],
        filter: {
            // exclude files
            '**/*.html': false,
            '**/assets/*': false,
            '**/*.d.ts': false,
            '**/*.json': false,

            // include files
            '**/*.css': 'css',
            '**/*': true
        }
    }
};
