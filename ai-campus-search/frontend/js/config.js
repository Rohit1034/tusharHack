// Dynamic API Configuration
let API_URL;

if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Development
    API_URL = 'http://localhost:5000/api';
} else {
    // Production - Use environment variables or check window object
    // This should be set via Vercel environment variables
    if (typeof process !== 'undefined' && process.env.REACT_APP_API_URL) {
        API_URL = process.env.REACT_APP_API_URL;
    } else if (typeof process !== 'undefined' && process.env.VITE_API_URL) {
        API_URL = process.env.VITE_API_URL;
    } else if (window.RENDER_API_URL) {
        API_URL = window.RENDER_API_URL;
    } else {
        // Fallback - should be injected by Vercel
        console.error('API URL not configured! Set REACT_APP_API_URL or VITE_API_URL in Vercel environment variables.');
        API_URL = '/api'; // This won't work - requires env vars
    }
}

console.log('Using API URL:', API_URL);
