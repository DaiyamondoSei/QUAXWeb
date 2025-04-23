const fs = require('fs');
const path = require('path');

// Get all HTML files in the current directory
const htmlFiles = fs.readdirSync('.')
    .filter(file => file.endsWith('.html'));

// Regular expressions for finding CSS links
const cssLinkRegex = /<link[^>]*href=["']([^"']*\.css)["'][^>]*>/g;
const excludeRegex = /https?:\/\//;

// Process each HTML file
htmlFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let modified = content.replace(cssLinkRegex, (match, href) => {
        // Don't modify external URLs
        if (excludeRegex.test(href)) {
            return match;
        }
        // Update local CSS paths
        const newHref = href.replace(/^(?!styles\/)([^\/]+\.css)$/, 'styles/$1');
        return match.replace(href, newHref);
    });
    
    // Write the modified content back to the file
    fs.writeFileSync(file, modified, 'utf8');
    console.log(`Updated ${file}`);
}); 