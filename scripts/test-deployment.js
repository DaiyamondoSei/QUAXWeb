const fs = require('fs');
const path = require('path');

// Test configuration files
const configFiles = [
    'netlify.toml',
    '_headers',
    'netlify/functions/handle-form.js'
];

// Test HTML files for Netlify Forms
const htmlFiles = [
    'contact.html'
];

// Test for required files
console.log('Testing configuration files...');
configFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file} exists`);
    } else {
        console.error(`❌ ${file} is missing`);
    }
});

// Test for Netlify Forms attributes
console.log('\nTesting Netlify Forms setup...');
htmlFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('data-netlify="true"')) {
        console.log(`✅ ${file} has Netlify Forms attributes`);
    } else {
        console.error(`❌ ${file} is missing Netlify Forms attributes`);
    }
});

// Test for Netlify Analytics
console.log('\nTesting Netlify Analytics setup...');
const indexContent = fs.readFileSync('index.html', 'utf8');
if (indexContent.includes('netlify-identity-widget.js')) {
    console.log('✅ Netlify Analytics script is present');
} else {
    console.error('❌ Netlify Analytics script is missing');
}

// Test for security headers
console.log('\nTesting security headers...');
const headersContent = fs.readFileSync('_headers', 'utf8');
const requiredHeaders = [
    'X-Frame-Options',
    'X-XSS-Protection',
    'X-Content-Type-Options',
    'Content-Security-Policy',
    'Strict-Transport-Security'
];

requiredHeaders.forEach(header => {
    if (headersContent.includes(header)) {
        console.log(`✅ ${header} is configured`);
    } else {
        console.error(`❌ ${header} is missing`);
    }
});

console.log('\nDeployment testing complete!'); 