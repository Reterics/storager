import pkg from './package.json';


export default {
    defineViteConfig: {
        'import.meta.env.PACKAGE_VERSION': JSON.stringify(pkg.version),
        'import.meta.env.PACKAGE_TITLE': JSON.stringify(pkg.displayName),
        'import.meta.env.PACKAGE_DESCRIPTION': JSON.stringify(pkg.description),
    }
};
