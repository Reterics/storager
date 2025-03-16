import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: 'tests/e2e', // Only run tests from this directory
    timeout: 180000, // 60 seconds timeout
    use: {
        baseURL: 'http://localhost/storager', // For dev: http://localhost:5173
        headless: false, // Set true if you don't want to see the browser during tests
        trace: 'on',
        video: 'on',
    },
    projects: [
        {
            name: 'chromium',
            use: { browserName: 'chromium' },
        }
    ],
});
