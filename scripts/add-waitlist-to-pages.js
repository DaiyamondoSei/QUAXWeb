const fs = require('fs');
const path = require('path');

// List of HTML files to process
const htmlFiles = [
    'consciousness_accelerator.html',
    'quantum_parameters.html',
    'app_features.html',
    'academic_alignment.html',
    'advanced_concepts.html',
    'project_proposal.html',
    'business_model.html',
    'scientific_validation.html',
    'consciousness_bands.html',
    'curriculum.html',
    'app_screens.html',
    'advanced_progression.html',
    'implementation_plan.html',
    'technical_implementation.html',
    'partnerships.html',
    'contact.html',
    'privacy.html',
    'terms.html',
    'search.html',
    '404.html'
];

// CSS and JS links to add
const cssLink = '<link rel="stylesheet" href="styles/waitlist-cta.css">';
const jsScript = '<script src="js/waitlist-cta.js" defer></script>';

// Process each HTML file
htmlFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${file}`);
        return;
    }
    
    // Read file content
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if the links are already present
    if (content.includes(cssLink) && content.includes(jsScript)) {
        console.log(`Links already present in ${file}`);
        return;
    }
    
    // Add CSS link before </head>
    if (!content.includes(cssLink)) {
        content = content.replace('</head>', `${cssLink}\n</head>`);
    }
    
    // Add JS script before </body>
    if (!content.includes(jsScript)) {
        content = content.replace('</body>', `${jsScript}\n</body>`);
    }
    
    // Write back to file
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
});

console.log('Done!'); 