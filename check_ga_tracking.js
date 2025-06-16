const fs = require('fs');
const path = require('path');

// Google Analytics tracking patterns to look for
const gaPatterns = [
    /gtag\(/,
    /google-analytics/,
    /GA_MEASUREMENT_ID/,
    /G-26J2F9R185/,
    /UA-/,
    /googletagmanager\.com\/gtag\/js/,
    /window\.dataLayer/,
    /gtag\('js', new Date\(\)\)/,
    /gtag\('config', 'G-26J2F9R185'\)/
];

// Function to check if a file has Google Analytics tracking
function hasGoogleAnalytics(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return gaPatterns.some(pattern => pattern.test(content));
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error.message);
        return false;
    }
}

// Function to recursively find all HTML files
function findHtmlFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
            findHtmlFiles(filePath, fileList);
        } else if (file.endsWith('.html')) {
            fileList.push(filePath);
        }
    });
    
    return fileList;
}

// Main function to analyze all HTML files
function analyzeGoogleAnalyticsTracking() {
    console.log('🔍 Analyzing Google Analytics tracking across all HTML files...\n');
    
    const htmlFiles = findHtmlFiles('.');
    const filesWithGA = [];
    const filesWithoutGA = [];
    
    htmlFiles.forEach(file => {
        const relativePath = path.relative('.', file);
        if (hasGoogleAnalytics(file)) {
            filesWithGA.push(relativePath);
        } else {
            filesWithoutGA.push(relativePath);
        }
    });
    
    console.log(`📊 Analysis Results:\n`);
    console.log(`Total HTML files found: ${htmlFiles.length}`);
    console.log(`Files WITH Google Analytics: ${filesWithGA.length}`);
    console.log(`Files WITHOUT Google Analytics: ${filesWithoutGA.length}\n`);
    
    if (filesWithGA.length > 0) {
        console.log('✅ Files WITH Google Analytics tracking:');
        filesWithGA.forEach(file => {
            console.log(`   ✓ ${file}`);
        });
        console.log('');
    }
    
    if (filesWithoutGA.length > 0) {
        console.log('❌ Files WITHOUT Google Analytics tracking:');
        filesWithoutGA.forEach(file => {
            console.log(`   ✗ ${file}`);
        });
        console.log('');
        
        // Filter out component files and other non-public files
        const publicFilesWithoutGA = filesWithoutGA.filter(file => {
            return !file.includes('components/') && 
                   !file.includes('development/') && 
                   !file.includes('public/admin/') &&
                   !file.includes('www.quanex.com_2025-04-18_20-45-26.report.html') &&
                   !file.includes('yandex_a01eff3f6325e6c7.html');
        });
        
        if (publicFilesWithoutGA.length > 0) {
            console.log('🚨 PUBLIC FILES MISSING Google Analytics tracking:');
            publicFilesWithoutGA.forEach(file => {
                console.log(`   - ${file}`);
            });
            console.log('\nTo add Google Analytics tracking, include this code in the <head> section:');
            console.log(`
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-26J2F9R185"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-26J2F9R185');
    </script>
            `);
        } else {
            console.log('🎉 All public HTML files have Google Analytics tracking!');
        }
        
        // Show component files separately
        const componentFiles = filesWithoutGA.filter(file => file.includes('components/'));
        if (componentFiles.length > 0) {
            console.log('\n📝 Note: Component files (in components/ directory) are typically included in other pages and don\'t need separate GA tracking.');
        }
    } else {
        console.log('🎉 All HTML files have Google Analytics tracking!');
    }
    
    // Calculate coverage percentage for public files
    const publicFiles = htmlFiles.filter(file => {
        const relativePath = path.relative('.', file);
        return !relativePath.includes('components/') && 
               !relativePath.includes('development/') && 
               !relativePath.includes('public/admin/') &&
               !relativePath.includes('www.quanex.com_2025-04-18_20-45-26.report.html') &&
               !relativePath.includes('yandex_a01eff3f6325e6c7.html');
    });
    
    const publicFilesWithGA = filesWithGA.filter(file => {
        return !file.includes('components/') && 
               !file.includes('development/') && 
               !file.includes('public/admin/') &&
               !file.includes('www.quanex.com_2025-04-18_20-45-26.report.html') &&
               !file.includes('yandex_a01eff3f6325e6c7.html');
    });
    
    const coveragePercentage = ((publicFilesWithGA.length / publicFiles.length) * 100).toFixed(1);
    console.log(`\n📈 Google Analytics Coverage (Public Files): ${coveragePercentage}%`);
}

// Run the analysis
analyzeGoogleAnalyticsTracking(); 