import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const indexHTML = path.resolve(__dirname, './dist/index.html');
const indexPHP = path.resolve(__dirname, './dist/index.php');
const csrfProtectionFile = path.resolve(__dirname, './php/csrf-protection.php');
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

fs.copyFileSync(path.join(__dirname, './php/update.php'), path.join(__dirname, './dist/update.php'));
const uploadsFolder = path.join(__dirname, './dist/uploads');
if (!fs.existsSync(uploadsFolder)) {
    fs.mkdirSync(path.join(__dirname, './dist/uploads'))
}

