#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get API URL from environment variables
const apiUrl = process.env.REACT_APP_API_URL || 
               process.env.VITE_API_URL || 
               process.env.API_URL ||
               'http://localhost:5000/api';

// Create config content
const configContent = `// Dynamic API Configuration (Generated at build time)
let API_URL = "${apiUrl}";

console.log('Using API URL:', API_URL);
`;

// Write to frontend config
const configPath = path.join(__dirname, 'frontend', 'js', 'config.js');
fs.writeFileSync(configPath, configContent);

console.log('✅ Config generated with API URL:', apiUrl);
