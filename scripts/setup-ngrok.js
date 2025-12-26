#!/usr/bin/env node
/**
 * Download and setup ngrok for the project
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { execSync } = require('child_process');

const NGROK_VERSION = 'v3.12.0';
const PLATFORM = process.platform;
const ARCH = process.arch;

function getNgrokDownloadUrl() {
  let platformArch;
  
  if (PLATFORM === 'darwin') {
    platformArch = ARCH === 'arm64' ? 'darwin-arm64' : 'darwin-amd64';
  } else if (PLATFORM === 'linux') {
    platformArch = ARCH === 'arm64' ? 'linux-arm64' : 'linux-amd64';
  } else if (PLATFORM === 'win32') {
    platformArch = 'windows-amd64';
  } else {
    throw new Error(`Unsupported platform: ${PLATFORM}`);
  }

  return `https://bin.equinox.io/c/bNyj1mQVY4c/${NGROK_VERSION}/ngrok-${NGROK_VERSION}-${platformArch}.zip`;
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ngrok: ${response.statusCode}`));
        return;
      }

      const totalSize = parseInt(response.headers['content-length'], 10);
      let downloadedSize = 0;

      response.on('data', (chunk) => {
        downloadedSize += chunk.length;
        const progress = Math.round((downloadedSize / totalSize) * 100);
        process.stdout.write(`\rDownloading ngrok: ${progress}%`);
      });

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        console.log('\nDownload complete!');
        resolve(destPath);
      });
    }).on('error', (error) => {
      fs.unlink(destPath, () => {});
      reject(error);
    });
  });
}

function extractZip(zipPath, destPath) {
  console.log('Extracting ngrok...');
  
  return new Promise((resolve, reject) => {
    try {
      execSync(`unzip -o "${zipPath}" -d "${destPath}"`, { stdio: 'inherit' });
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

function makeExecutable(filePath) {
  try {
    fs.chmodSync(filePath, '755');
  } catch (error) {
    console.warn('Could not make ngrok executable:', error.message);
  }
}

async function downloadNgrok() {
  const binDir = path.join(process.cwd(), 'bin');
  const zipPath = path.join(binDir, 'ngrok.zip');

  console.log('Setting up ngrok for IPA Scrabble...\n');

  // Create bin directory if it doesn't exist
  if (!fs.existsSync(binDir)) {
    fs.mkdirSync(binDir, { recursive: true });
  }

  const downloadUrl = getNgrokDownloadUrl();
  console.log(`Download URL: ${downloadUrl}`);

  try {
    // Download ngrok
    await downloadFile(downloadUrl, zipPath);

    // Extract
    await extractZip(zipPath, binDir);

    // Make executable
    const ngrokPath = path.join(binDir, 'ngrok');
    if (fs.existsSync(ngrokPath)) {
      makeExecutable(ngrokPath);
    }

    // Clean up zip file
    fs.unlinkSync(zipPath);

    console.log('\n✅ Ngrok setup complete!');
    console.log(`📂 Location: ${ngrokPath}`);

    // Verify installation
    try {
      execSync(`"${ngrokPath}" version`, { stdio: 'pipe' });
      console.log('✅ Ngrok is ready to use!');
    } catch (error) {
      console.warn('⚠️  Could not verify ngrok installation');
    }

  } catch (error) {
    console.error('\n❌ Error setting up ngrok:', error.message);
    console.log('\nYou can also install ngrok manually:');
    console.log('1. Visit https://ngrok.com/download');
    console.log('2. Download for your platform');
    console.log(`3. Place the executable in: ${binDir}`);
    process.exit(1);
  }
}

// Run setup
downloadNgrok();
