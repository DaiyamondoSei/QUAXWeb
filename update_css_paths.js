const fs = require('fs');
const path = require('path');

// Get all HTML files in the current directory and subdirectories
const getAllHtmlFiles = (dir) => {
    let results = [];
    const list = fs.readdirSync(dir);
    
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            results = results.concat(getAllHtmlFiles(filePath));
        } else if (file.endsWith('.html')) {
            results.push(filePath);
        }
    });
    
    return results;
};

// Get all HTML files
const htmlFiles = getAllHtmlFiles('.');

// Regular expressions for finding CSS links
const cssLinkRegex = /<link[^>]*href=["']([^"']*\.css)["'][^>]*>/g;
const stylesCssRegex = /<link[^>]*href=["']styles\/styles\.css["'][^>]*>/;
const responsiveCssRegex = /<link[^>]*href=["']styles\/responsive\.css["'][^>]*>/;

// Process each HTML file
htmlFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    // Check if responsive.css is already included
    const responsiveCssIncluded = responsiveCssRegex.test(content);

    // Find the position of styles.css link
    const stylesCssMatch = content.match(stylesCssRegex);
    let insertionPoint = -1;

    if (stylesCssMatch) {
        insertionPoint = content.indexOf(stylesCssMatch[0]) + stylesCssMatch[0].length;
    } else {
        // If styles.css is not found, find the last stylesheet link
        const lastStylesheetMatch = content.match(cssLinkRegex);
        if (lastStylesheetMatch && lastStylesheetMatch.length > 0) {
             const lastMatch = lastStylesheetMatch[lastStylesheetMatch.length - 1];
             insertionPoint = content.lastIndexOf(lastMatch) + lastMatch.length;
        } else {
             // If no stylesheet links are found, find the closing </head> tag
             insertionPoint = content.indexOf('</head>');
        }
    }

    if (insertionPoint !== -1) {
        let contentModified = false;
        let contentToInsert = '';

        // Insert responsive.css if not already included
        if (!responsiveCssIncluded) {
            contentToInsert += '\n    <link rel="stylesheet" href="styles/responsive.css">';
            contentModified = true;
        }

        if (contentModified) {
            // Re-calculate insertion point based on potentially modified content
            let currentContent = content;
            const currentStylesCssMatch = currentContent.match(stylesCssRegex);
             let currentInsertionPoint = -1;

             if (currentStylesCssMatch) {
                 currentInsertionPoint = currentContent.indexOf(currentStylesCssMatch[0]) + currentStylesCssMatch[0].length;
             } else {
                 const lastStylesheetMatch = currentContent.match(cssLinkRegex);
                 if (lastStylesheetMatch && lastStylesheetMatch.length > 0) {
                      const lastMatch = lastStylesheetMatch[lastStylesheetMatch.length - 1];
                      currentInsertionPoint = currentContent.lastIndexOf(lastMatch) + lastMatch.length;
                 } else {
                      currentInsertionPoint = currentContent.indexOf('</head>');
                 }
             }

            const newContentWithInsert = 
                currentContent.slice(0, currentInsertionPoint) + 
                contentToInsert + 
                currentContent.slice(currentInsertionPoint);

             // Update local CSS paths (this part remains the same)
             const excludeRegex = /https?:\/\//;
             const finalContent = newContentWithInsert.replace(cssLinkRegex, (match, href) => {
                 // Don't modify external URLs
                 if (excludeRegex.test(href)) {
                     return match;
                 }
                 // Update local CSS paths
                 const newHref = href.replace(/^(?!styles\/)([^\/]+\.css)$/, 'styles/$1');
                 return match.replace(href, newHref);
             });

            if (finalContent !== originalContent) {
                 fs.writeFileSync(file, finalContent, 'utf8');
                 console.log(`Updated ${file}`);
            } else {
                 console.log(`No changes needed for ${file}`);
            }
        } else {
             console.log(`No changes needed for ${file}`);
        }
    }
}); 