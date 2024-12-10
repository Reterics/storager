import pkg from './package.json';

export default {
    defineViteConfig: {
        'import.meta.env.PACKAGE_VERSION': JSON.stringify(pkg.version),
        'import.meta.env.PACKAGE_TITLE': JSON.stringify(pkg.displayName),
        'import.meta.env.PACKAGE_DESCRIPTION': JSON.stringify(pkg.description),
        'import.meta.env.BUILD_TIME': new Date(2024, 10, 26, 23, 59).getTime(),
    }
};
