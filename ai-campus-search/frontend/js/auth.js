// API Configuration is loaded from config.js
// const API_URL is set globally by config.js

// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    // Initialize authentication components
    initAuthForms();
    initPasswordToggles();
    initPasswordStrength();
    initNavbar();
});

// Initialize Authentication Forms
function initAuthForms() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember')?.checked;
    const loginBtn = document.getElementById('login-btn');
    const messageDiv = document.getElementById('auth-message');
    
    // Validation
    if (!email || !password) {
        showMessage('Please fill in all required fields', 'error');
        return;
    }
    
    // Show loading state
    setButtonLoading(loginBtn, true);
    showMessage('', '');
    
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Store token and user data
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Store remember me preference
            if (remember) {
                localStorage.setItem('rememberMe', 'true');
            } else {
                localStorage.removeItem('rememberMe');
            }
            
            showMessage('Login successful! Redirecting...', 'success');
            
            // Redirect based on role
            setTimeout(() => {
                if (data.user.role === 'admin') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'dashboard.html';
                }
            }, 1500);
        } else {
            showMessage(data.message || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('Connection error. Please try again.', 'error');
    } finally {
        setButtonLoading(loginBtn, false);
    }
}

// Handle Register
async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const role = document.getElementById('role').value;
    const department = document.getElementById('department').value;
    const interests = document.getElementById('interests').value;
    const registerBtn = document.getElementById('register-btn');
    const messageDiv = document.getElementById('auth-message');
    
    // Validation
    if (!name || !email || !password || !confirmPassword || !role || !department) {
        showMessage('Please fill in all required fields', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage('Password must be at least 6 characters long', 'error');
        return;
    }
    
    // Show loading state
    setButtonLoading(registerBtn, true);
    showMessage('', '');
    
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                email,
                password,
                role,
                department,
                interests: interests ? interests.split(',').map(item => item.trim()).filter(item => item) : []
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('Registration successful! Redirecting to login...', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            showMessage(data.message || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showMessage('Connection error. Please try again.', 'error');
    } finally {
        setButtonLoading(registerBtn, false);
    }
}

// Password Toggle Functionality
function initPasswordToggles() {
    const toggleButtons = document.querySelectorAll('.toggle-password');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const input = document.getElementById(targetId);
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
}

// Password Strength Indicator
function initPasswordStrength() {
    const passwordInput = document.getElementById('password');
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');
    
    if (passwordInput && strengthBar && strengthText) {
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            const strength = calculatePasswordStrength(password);
            updateStrengthIndicator(strength);
        });
    }
}

function calculatePasswordStrength(password) {
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 15;
    
    // Character variety
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^A-Za-z0-9]/.test(password)) strength += 15;
    
    return Math.min(strength, 100);
}

function updateStrengthIndicator(strength) {
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');
    
    if (!strengthBar || !strengthText) return;
    
    strengthBar.style.setProperty('--strength', `${strength}%`);
    strengthBar.querySelector('::after')?.style?.setProperty('width', `${strength}%`);
    
    // Update text and color based on strength
    if (strength < 30) {
        strengthText.textContent = 'Weak';
        strengthText.style.color = 'var(--danger)';
    } else if (strength < 60) {
        strengthText.textContent = 'Medium';
        strengthText.style.color = 'var(--warning)';
    } else {
        strengthText.textContent = 'Strong';
        strengthText.style.color = 'var(--success)';
    }
}

// Navbar Functionality (reused from index)
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (!navbar) return; // Skip if no navbar on page
    
    // Sticky navbar
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Mobile menu toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
        
        // Close mobile menu when clicking links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
    }
}

// Utility Functions
function setButtonLoading(button, loading) {
    if (loading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

function showMessage(message, type) {
    const messageDiv = document.getElementById('auth-message');
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = `auth-message ${type}`;
        
        // Clear success messages after 3 seconds
        if (type === 'success') {
            setTimeout(() => {
                messageDiv.textContent = '';
                messageDiv.className = 'auth-message';
            }, 3000);
        }
    }
}

// Check authentication status on protected pages
function checkAuth() {
    const token = localStorage.getItem('token');
    const currentPage = window.location.pathname.split('/').pop();
    
    const protectedPages = ['dashboard.html', 'admin.html'];
    
    // Only redirect from protected pages if not authenticated
    if (protectedPages.includes(currentPage) && !token) {
        window.location.href = 'login.html';
        return false;
    }
    
    // Don't auto-redirect from login/register pages
    // Let users stay on auth pages to login/logout
    
    return true;
}

// Initialize auth check
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
});

// Logout function
function logout() {
    console.log('Logout function called');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('rememberMe');
    console.log('Storage cleared, redirecting to login.html');
    window.location.href = 'login.html';
}

// Direct logout handler for onclick
function handleLogout() {
    console.log('Handle logout called');
    logout();
}