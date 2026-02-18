// API Configuration
const API_URL = "http://localhost:5000/api";

// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initNavbar();
    initScrollProgress();
    initBackToTop();
    initUploadSection();
    initSearchSection();
    initSummarySection();
    initContactForm();
    initScrollReveal();
});

// Navbar Functionality
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    // Sticky navbar
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Mobile menu toggle
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
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Scroll Progress Bar
function initScrollProgress() {
    const scrollProgress = document.getElementById('scroll-progress');
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.body.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        scrollProgress.style.width = scrollPercent + '%';
    });
}

// Back to Top Button
function initBackToTop() {
    const backToTop = document.getElementById('back-to-top');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });
    
    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Upload Section Functionality
function initUploadSection() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const uploadInfo = document.getElementById('upload-info');
    const uploadBtn = document.getElementById('upload-btn');
    const uploadStatus = document.getElementById('upload-status');
    
    // Drag and drop functionality
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#00f3ff';
        uploadArea.style.backgroundColor = 'rgba(0, 243, 255, 0.1)';
    });
    
    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        uploadArea.style.backgroundColor = 'transparent';
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        uploadArea.style.backgroundColor = 'transparent';
        
        const files = e.dataTransfer.files;
        handleFiles(files);
    });
    
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
    
    function handleFiles(files) {
        if (files.length > 0) {
            const fileNames = Array.from(files).map(file => file.name).join(', ');
            uploadInfo.innerHTML = `<p>Selected: ${fileNames}</p>`;
            uploadInfo.style.color = '#4ade80';
        } else {
            uploadInfo.innerHTML = '<p>No files selected</p>';
            uploadInfo.style.color = 'var(--text-secondary)';
        }
    }
    
    // Upload button functionality
    uploadBtn.addEventListener('click', async () => {
        if (!fileInput.files.length) {
            showUploadStatus('Please select files to upload', 'error');
            return;
        }
        
        const formData = new FormData();
        for (let file of fileInput.files) {
            formData.append('files', file);
        }
        
        // Show loading state
        uploadBtn.disabled = true;
        uploadBtn.textContent = 'Uploading...';
        showUploadStatus('Uploading files...', 'info');
        
        try {
            const response = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showUploadStatus('Files uploaded successfully!', 'success');
                uploadInfo.innerHTML = '<p>No files selected</p>';
                uploadInfo.style.color = 'var(--text-secondary)';
                fileInput.value = '';
            } else {
                showUploadStatus(data.message || 'Upload failed', 'error');
            }
        } catch (error) {
            console.error('Upload error:', error);
            showUploadStatus('Connection error. Please try again.', 'error');
        } finally {
            uploadBtn.disabled = false;
            uploadBtn.textContent = 'Upload Documents';
        }
    });
    
    function showUploadStatus(message, type) {
        uploadStatus.textContent = message;
        uploadStatus.className = `upload-status ${type}`;
        setTimeout(() => {
            uploadStatus.textContent = '';
            uploadStatus.className = 'upload-status';
        }, 3000);
    }
}

// Search Section Functionality
function initSearchSection() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const searchLoading = document.getElementById('search-loading');
    const searchResults = document.getElementById('search-results');
    
    // Search button click
    searchBtn.addEventListener('click', performSearch);
    
    // Enter key search
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    async function performSearch() {
        const query = searchInput.value.trim();
        
        if (!query) {
            showSearchResults('<p>Please enter a search query</p>');
            return;
        }
        
        // Show loading state
        searchLoading.style.display = 'block';
        searchBtn.disabled = true;
        
        try {
            const response = await fetch(`${API_URL}/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query: query })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                displaySearchResults(data);
            } else {
                showSearchResults(`<p class="error">Search failed: ${data.message}</p>`);
            }
        } catch (error) {
            console.error('Search error:', error);
            showSearchResults('<p class="error">Connection error. Please try again.</p>');
        } finally {
            searchLoading.style.display = 'none';
            searchBtn.disabled = false;
        }
    }
    
    function displaySearchResults(data) {
        if (!data.results || data.results.length === 0) {
            showSearchResults('<p>No results found for your query.</p>');
            return;
        }
        
        let html = '';
        data.results.forEach((result, index) => {
            html += `
                <div class="result-item">
                    <h4>Result ${index + 1}</h4>
                    <p>${result.text.substring(0, 300)}${result.text.length > 300 ? '...' : ''}</p>
                    <div class="similarity-score">Similarity: ${(result.similarity * 100).toFixed(2)}%</div>
                </div>
            `;
        });
        
        // Add AI summary if available
        if (data.summary) {
            html += `
                <div class="result-item">
                    <h4>AI Summary</h4>
                    <p>${data.summary}</p>
                </div>
            `;
        }
        
        showSearchResults(html);
    }
    
    function showSearchResults(content) {
        searchResults.innerHTML = content;
    }
}

// AI Summary Section Functionality
function initSummarySection() {
    const summaryInput = document.getElementById('summary-input');
    const summaryBtn = document.getElementById('summary-btn');
    const summaryResult = document.getElementById('summary-result');
    
    summaryBtn.addEventListener('click', async () => {
        const text = summaryInput.value.trim();
        
        if (!text) {
            showSummaryResult('Please enter text to summarize');
            return;
        }
        
        // Show loading state
        summaryBtn.disabled = true;
        summaryBtn.textContent = 'Generating...';
        showSummaryResult('Generating summary...');
        
        try {
            const response = await fetch(`${API_URL}/summarize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: text })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showSummaryResult(data.summary || data.message);
            } else {
                showSummaryResult(`Error: ${data.message || 'Failed to generate summary'}`);
            }
        } catch (error) {
            console.error('Summary error:', error);
            showSummaryResult('Connection error. Please try again.');
        } finally {
            summaryBtn.disabled = false;
            summaryBtn.textContent = 'Generate Summary';
        }
    });
    
    function showSummaryResult(content) {
        summaryResult.innerHTML = `<p>${content}</p>`;
    }
}

// Contact Form Functionality
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const messageInput = document.getElementById('contact-message');
    
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Basic validation
        if (!nameInput.value.trim()) {
            alert('Please enter your name');
            return;
        }
        
        if (!emailInput.value.trim() || !isValidEmail(emailInput.value)) {
            alert('Please enter a valid email address');
            return;
        }
        
        if (!messageInput.value.trim()) {
            alert('Please enter your message');
            return;
        }
        
        // In a real application, you would send this to a backend
        alert('Thank you for your message! We will get back to you soon.');
        contactForm.reset();
    });
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

// Scroll Reveal Animation
function initScrollReveal() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe all sections for animation
    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
    
    // Observe feature cards
    document.querySelectorAll('.feature-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

// Utility Functions
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#4ade80' : type === 'error' ? '#f87171' : '#00f3ff'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after delay
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Smooth scrolling for anchor links
document.addEventListener('DOMContentLoaded', function() {
    // Add smooth scrolling to all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80; // Account for navbar height
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
});