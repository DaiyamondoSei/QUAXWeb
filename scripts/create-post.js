#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function createPost() {
  console.log('🌟 Creating a new Entanglement Log post...\n');
  
  const title = await question('📝 Post title: ');
  const author = await question('✍️ Author name: ');
  const category = await question('🏷️ Category (e.g., Quantum Science, Community, Personal Growth): ');
  const excerpt = await question('💭 Brief excerpt: ');
  const image = await question('🖼️ Image path (optional, e.g., /images/post-image.jpg.webp): ');
  
  // Generate slug from title
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  
  // Create frontmatter
  const frontmatter = `---
title: "${title}"
author: ${author}
date: ${new Date().toISOString().split('T')[0]}
category: ${category}
excerpt: ${excerpt}${image ? `\nimage: ${image}` : ''}
---

`;
  
  // Create file path
  const postsDir = path.join(process.cwd(), 'posts');
  const filePath = path.join(postsDir, `${slug}.md`);
  
  // Ensure posts directory exists
  if (!fs.existsSync(postsDir)) {
    fs.mkdirSync(postsDir, { recursive: true });
  }
  
  // Write the file
  fs.writeFileSync(filePath, frontmatter);
  
  console.log('\n✅ Post created successfully!');
  console.log(`📁 File: ${filePath}`);
  console.log(`🔗 URL: /entanglement-log/${slug}`);
  console.log('\n💡 Next steps:');
  console.log('1. Edit the markdown file to add your content');
  console.log('2. Add any images referenced in the post');
  console.log('3. Test the post locally with: npm run dev');
  console.log('4. Deploy to see it live on your site');
  
  rl.close();
}

createPost().catch(console.error); 