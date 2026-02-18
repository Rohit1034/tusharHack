// Dynamic API Configuration
let API_URL;

if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Development
    API_URL = 'http://localhost:5000/api';
} else {
    // Production - Get from window variable or use relative path
    API_URL = window.API_BASE_URL || `${window.location.protocol}//${window.location.hostname}:5000/api`;
    
    // If we have a specific Render backend URL set via script tag
    if (window.RENDER_API_URL) {
        API_URL = window.RENDER_API_URL;
    }
}

console.log('Using API URL:', API_URL);
