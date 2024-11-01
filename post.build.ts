import {PluginOption} from "vite";
import path from "path";
import fs from "fs";


function storageRPostBuild(opt: {outDir?: string}): PluginOption {
    return {
        name: 'storager-post-build',
        apply: 'build',
        writeBundle(options) {
            const dir = opt.outDir || options.dir || './dist';
            const indexHTML = path.resolve(dir, './index.html');
            const indexPHP = path.resolve(dir, './index.php');
            const csrfProtectionFile = path.resolve(dir, './php/csrf-protection.php');
            let csrfProtection = '<?php\n' +
                'session_start();\n';

            if (!fs.existsSync(indexHTML)) {
                console.error('Could not find index.html file.');
                process.exit(1);
            }

            if (fs.existsSync(csrfProtectionFile)) {
                csrfProtection = fs.readFileSync(csrfProtectionFile, 'utf8').toString();
            }

            const indexContent = fs
                .readFileSync(indexHTML, 'utf8')
                .toString()
                .replace('</head>',
                    "<input type=\"hidden\" id=\"csrf_token\" value=\"<?php echo $_SESSION['csrf_token']; ?>\"></head>")
                .replace('<!doctype html>', csrfProtection + '<!doctype html>');


            fs.writeFileSync(indexPHP, indexContent);

            fs.copyFileSync('./php/update.php', path.join(dir, './update.php'));
            const uploadsFolder = path.join(dir, './uploads');
            if (!fs.existsSync(uploadsFolder)) {
                fs.mkdirSync(path.join(dir, './uploads'))
            }

        },
    };
}


export default storageRPostBuild;
