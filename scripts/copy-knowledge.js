const fs = require('fs');
const path = require('path');

function copyKnowledgeFile() {
  const sourcePath = path.join(__dirname, '..', 'knowledge.json');
  const targetPath = path.join(__dirname, '..', 'netlify', 'functions', 'knowledge.json');
  
  try {
    // Check if source file exists
    if (!fs.existsSync(sourcePath)) {
      console.error('Source knowledge.json not found at:', sourcePath);
      process.exit(1);
    }
    
    // Create target directory if it doesn't exist
    const targetDir = path.dirname(targetPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    // Copy the file
    fs.copyFileSync(sourcePath, targetPath);
    console.log('✅ knowledge.json copied to netlify/functions/');
    
    // Verify the copy
    const sourceStats = fs.statSync(sourcePath);
    const targetStats = fs.statSync(targetPath);
    
    if (sourceStats.size === targetStats.size) {
      console.log(`✅ File sizes match: ${sourceStats.size} bytes`);
    } else {
      console.error('❌ File sizes do not match!');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error copying knowledge.json:', error.message);
    process.exit(1);
  }
}

copyKnowledgeFile(); 