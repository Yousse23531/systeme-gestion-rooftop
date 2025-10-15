#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting Café Management System Desktop App...\n');

// Check if we're in development or production mode
const isDev = process.argv.includes('--dev') || process.argv.includes('-d');

if (isDev) {
  console.log('📱 Development Mode: Starting with hot reload...');
  
  // Start the Vite dev server and Electron concurrently
  const electronProcess = spawn('npm', ['run', 'electron:dev'], {
    stdio: 'inherit',
    shell: true,
    cwd: __dirname
  });

  electronProcess.on('error', (err) => {
    console.error('❌ Failed to start development server:', err);
    process.exit(1);
  });

  electronProcess.on('close', (code) => {
    console.log(`\n📱 Development server closed with code ${code}`);
    process.exit(code);
  });

  // Handle Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down development server...');
    electronProcess.kill('SIGINT');
  });

} else {
  console.log('📦 Production Mode: Building and starting desktop app...');
  
  // First, build the web app
  console.log('🔨 Building web application...');
  const buildProcess = spawn('npm', ['run', 'build'], {
    stdio: 'inherit',
    shell: true,
    cwd: __dirname
  });

  buildProcess.on('close', (code) => {
    if (code !== 0) {
      console.error('❌ Build failed with code:', code);
      process.exit(1);
    }

    console.log('✅ Build completed successfully!');
    console.log('🚀 Starting desktop application...');

    // Start Electron
    const electronProcess = spawn('npm', ['run', 'electron'], {
      stdio: 'inherit',
      shell: true,
      cwd: __dirname
    });

    electronProcess.on('error', (err) => {
      console.error('❌ Failed to start desktop app:', err);
      process.exit(1);
    });

    electronProcess.on('close', (code) => {
      console.log(`\n📱 Desktop app closed with code ${code}`);
      process.exit(code);
    });

    // Handle Ctrl+C
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down desktop app...');
      electronProcess.kill('SIGINT');
    });
  });
}

