#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Make sure we're in the server directory
try {
  process.chdir(__dirname);
  console.log(`Working directory: ${process.cwd()}`);
} catch (err) {
  console.error(`Error changing directory: ${err}`);
  process.exit(1);
}

// Files to process
const filesToProcess = [
  'netlify/functions/api.ts',
  'admin/faqRoutes.ts',
  'services/chatbot.ts',
  'services/enhancedChatbot.ts',
  'services/embeddingService.ts',
  'services/embeddingInitService.ts',
  'data/faq.ts',
  'data/orders.ts',
  'data/products.ts',
  'routes.ts',
  'storage.ts',
];

// Target directory for processed files
const targetDir = 'dist-netlify';

// Create the target directory
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Create netlify functions directory
if (!fs.existsSync(`${targetDir}/netlify/functions`)) {
  fs.mkdirSync(`${targetDir}/netlify/functions`, { recursive: true });
}

// Copy netlify schema and types
fs.mkdirSync(`${targetDir}/netlify`, { recursive: true });
fs.copyFileSync('netlify/schema.ts', `${targetDir}/netlify/schema.ts`);
fs.copyFileSync('netlify/types.ts', `${targetDir}/netlify/types.ts`);

// Process each file
filesToProcess.forEach(filePath => {
  // Make sure file exists
  if (!fs.existsSync(filePath)) {
    console.log(`File ${filePath} doesn't exist, skipping`);
    return;
  }
  
  console.log(`Processing ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace imports
  content = content.replace(
    /import\s+\{([^}]+)\}\s+from\s+['"]@shared\/schema['"]/g,
    'import { $1 } from "../netlify/types"'
  );
  
  // Also replace relative imports that might reference shared schema
  content = content.replace(
    /import\s+\{([^}]+)\}\s+from\s+['"]\.\.\/shared\/schema['"]/g,
    'import { $1 } from "../netlify/types"'
  );
  
  // Create the target file directory if it doesn't exist
  const targetFilePath = path.join(targetDir, filePath);
  const targetFileDir = path.dirname(targetFilePath);
  
  if (!fs.existsSync(targetFileDir)) {
    fs.mkdirSync(targetFileDir, { recursive: true });
  }
  
  // Save the modified file
  fs.writeFileSync(targetFilePath, content);
});

// Make sure the data directory exists
fs.mkdirSync(`${targetDir}/data`, { recursive: true });

// Compile with TypeScript
console.log('Compiling with TypeScript...');
try {
  // Create a temporary tsconfig for the build
  const tsConfig = {
    compilerOptions: {
      target: "ES2020",
      module: "ESNext",
      moduleResolution: "node",
      esModuleInterop: true,
      skipLibCheck: true,
      allowJs: true,
      outDir: "dist",
      baseUrl: "."
    },
    include: [`${targetDir}/**/*.ts`],
    exclude: ["node_modules"]
  };

  // Write the tsconfig
  fs.writeFileSync('netlify-tsconfig.json', JSON.stringify(tsConfig, null, 2));
  
  // Run tsc with the config
  execSync('tsc --project netlify-tsconfig.json');
  console.log('TypeScript compilation successful!');
  
  // Copy the compiled files to ensure netlify directory structure
  console.log('Ensuring netlify functions directory structure...');
  if (!fs.existsSync('dist/netlify/functions')) {
    fs.mkdirSync('dist/netlify/functions', { recursive: true });
  }
  
  // Copy netlify function to the correct location if needed
  if (fs.existsSync(`dist/${targetDir}/netlify/functions/api.js`)) {
    execSync(`cp -r dist/${targetDir}/netlify/functions/* dist/netlify/functions/`);
  }
  
  // Copy data files
  if (!fs.existsSync('dist/data')) {
    fs.mkdirSync('dist/data', { recursive: true });
  }
  
  // Copy original data files directly (not the compiled versions)
  ['data/faq.ts', 'data/orders.ts', 'data/products.ts'].forEach(dataFile => {
    if (fs.existsSync(dataFile)) {
      const targetFile = dataFile.replace('.ts', '.js');
      // Simple conversion from TS to JS for data files
      let content = fs.readFileSync(dataFile, 'utf8');
      // Replace imports
      content = content.replace(
        /import\s+\{([^}]+)\}\s+from\s+(['"])(@shared\/schema|\.\.\/shared\/schema)\2/g,
        '// Import from "../netlify/types" for Netlify'
      );
      content = content.replace(/export\s+const/, 'export default');
      fs.writeFileSync(`dist/${targetFile}`, content);
    }
  });
  
  console.log('Build completed successfully!');
} catch (error) {
  console.error('TypeScript compilation failed:', error.message);
  console.error(error);
  process.exit(1);
}