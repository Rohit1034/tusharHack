const API_URL = "http://localhost:5000/api";

// Dashboard functionality
document.addEventListener('DOMContentLoaded', async function() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Initialize dashboard components
    initNavbar();
    initWelcomeMessage();
    initSearch();
    initUpload();
    initAnimations();
    
    // Load initial data
    await loadRecommendations();
    await loadRecentSearches();
});

// Initialize navbar functionality
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const logoutBtn = document.getElementById('logoutBtn');
    
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
    
    // Logout functionality
    if (logoutBtn) {
        console.log('Logout button found, adding event listener');
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Logout button clicked');
            try {
                logout();
            } catch (error) {
                console.error('Logout error:', error);
                // Fallback redirect
                window.location.href = 'login.html';
            }
        });
    } else {
        console.log('Logout button not found');
    }
}

// Initialize welcome message
function initWelcomeMessage() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const welcomeText = document.getElementById('welcomeText');
    if (welcomeText && user.name) {
        welcomeText.textContent = `Welcome, ${user.name}`;
    }
}

// Initialize search functionality
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const searchLoading = document.getElementById('searchLoading');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
}

// Initialize upload functionality
function initUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadStatus = document.getElementById('uploadStatus');
    
    // Drag and drop functionality
    if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('active');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('active');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('active');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                fileInput.files = files;
                updateFileNameDisplay(files);
            }
        });
        
        fileInput.addEventListener('change', function(e) {
            updateFileNameDisplay(e.target.files);
        });
    }
    
    if (uploadBtn) {
        uploadBtn.addEventListener('click', uploadFile);
    }
}

// Update file name display
function updateFileNameDisplay(files) {
    const uploadStatus = document.getElementById('uploadStatus');
    if (files.length > 0) {
        const fileNames = Array.from(files).map(file => file.name).join(', ');
        if (uploadStatus) {
            uploadStatus.innerHTML = `<p class="upload-status success">Selected: ${fileNames}</p>`;
        }
    }
}

// Initialize animations
function initAnimations() {
    // Fade in hero section
    const heroElements = document.querySelectorAll('.dashboard-hero .fade-in');
    heroElements.forEach((el, index) => {
        setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, index * 200);
    });
    
    // Scroll reveal animation
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.reveal').forEach(el => {
        observer.observe(el);
    });
}

// Upload file function
async function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const departmentSelect = document.getElementById('departmentSelect');
    const uploadProgress = document.getElementById('uploadProgress');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const uploadStatus = document.getElementById('uploadStatus');
    
    if (!fileInput.files[0]) {
        if (uploadStatus) {
            uploadStatus.innerHTML = '<p class="upload-status error">Please select a file to upload</p>';
        }
        return;
    }
    
    if (!departmentSelect.value) {
        if (uploadStatus) {
            uploadStatus.innerHTML = '<p class="upload-status error">Please select a department</p>';
        }
        return;
    }
    
    // Show progress
    if (uploadProgress) {
        uploadProgress.style.display = 'block';
    }
    
    const formData = new FormData();
    
    // Handle multiple files
    for (let i = 0; i < fileInput.files.length; i++) {
        formData.append('files', fileInput.files[i]);
    }
    formData.append('department', departmentSelect.value);
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        // Simulate progress for better UX
        simulateProgress(progressFill, progressText);
        
        const result = await response.json();
        
        if (response.ok) {
            if (uploadStatus) {
                uploadStatus.innerHTML = '<p class="upload-status success">Files uploaded successfully!</p>';
            }
            // Reset form
            fileInput.value = '';
            departmentSelect.value = '';
            setTimeout(() => {
                if (uploadProgress) {
                    uploadProgress.style.display = 'none';
                }
                if (uploadStatus) {
                    uploadStatus.innerHTML = '';
                }
            }, 3000);
        } else {
            if (uploadStatus) {
                uploadStatus.innerHTML = `<p class="upload-status error">${result.message || 'Upload failed'}</p>`;
            }
        }
    } catch (error) {
        console.error('Upload error:', error);
        if (uploadStatus) {
            uploadStatus.innerHTML = '<p class="upload-status error">An error occurred during upload</p>';
        }
    }
}

// Simulate upload progress
function simulateProgress(progressFill, progressText) {
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
        }
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
        if (progressText) {
            progressText.textContent = `Uploading... ${Math.round(progress)}%`;
        }
    }, 200);
}

// Perform search function
async function performSearch() {
    const query = document.getElementById('searchInput').value.trim();
    const searchLoading = document.getElementById('searchLoading');
    const searchResults = document.getElementById('searchResults');
    const aiSummary = document.getElementById('aiSummary');
    
    if (!query) {
        if (searchResults) {
            searchResults.innerHTML = '<p>Please enter a search query</p>';
        }
        return;
    }
    
    // Show loading
    if (searchLoading) {
        searchLoading.style.display = 'block';
    }
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ query })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            displaySearchResults(data.results);
            displayAiSummary(data.summary);
            // Update recent searches
            updateRecentSearches(query);
        } else {
            if (searchResults) {
                searchResults.innerHTML = `<div class="result-item error">${data.message || 'Search failed'}</div>`;
            }
        }
    } catch (error) {
        console.error('Search error:', error);
        if (searchResults) {
            searchResults.innerHTML = '<div class="result-item error">An error occurred during search</div>';
        }
    } finally {
        if (searchLoading) {
            searchLoading.style.display = 'none';
        }
    }
}

// Display search results
function displaySearchResults(results) {
    const container = document.getElementById('searchResults');
    
    if (!container) return;
    
    if (results.length === 0) {
        container.innerHTML = '<p class="result-item">No results found</p>';
        return;
    }
    
    let html = '';
    results.forEach((result, index) => {
        html += `
            <div class="result-item reveal">
                <strong>Result ${index + 1} (Relevance: ${(result.similarity * 100).toFixed(2)}%)</strong>
                <p>${result.text.substring(0, 300)}${result.text.length > 300 ? '...' : ''}</p>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Display AI summary
function displayAiSummary(summary) {
    const container = document.getElementById('aiSummary');
    
    if (!container) return;
    
    if (!summary) {
        container.innerHTML = '<p>No summary available</p>';
        return;
    }
    
    container.innerHTML = `<p>${summary}</p>`;
}

// Update recent searches
function updateRecentSearches(query) {
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user.searchHistory) {
            user.searchHistory = [];
        }
        
        user.searchHistory.push({
            query: query,
            timestamp: new Date().toISOString()
        });
        
        // Keep only last 10 searches
        if (user.searchHistory.length > 10) {
            user.searchHistory = user.searchHistory.slice(-10);
        }
        
        localStorage.setItem('user', JSON.stringify(user));
        loadRecentSearches(); // Refresh display
    } catch (error) {
        console.error('Error updating search history:', error);
    }
}

// Load recommendations
async function loadRecommendations() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/search/recommendations`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            displayRecommendations(data);
        } else {
            document.getElementById('recommendations').innerHTML = '<p>No recommendations available</p>';
        }
    } catch (error) {
        console.error('Error loading recommendations:', error);
        document.getElementById('recommendations').innerHTML = '<p>Error loading recommendations</p>';
    }
}

// Display recommendations
function displayRecommendations(recommendations) {
    const container = document.getElementById('recommendations');
    
    if (!container) return;
    
    if (recommendations.length === 0) {
        container.innerHTML = '<p>No recommendations available</p>';
        return;
    }
    
    let html = '';
    recommendations.forEach((doc, index) => {
        html += `
            <div class="recommendation-item reveal">
                <strong>${doc.title || `Document ${index + 1}`}</strong>
                <p>${doc.description || 'No description available'}</p>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Load recent searches
async function loadRecentSearches() {
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const searchHistory = user.searchHistory || [];
        
        const container = document.getElementById('recentSearches');
        if (!container) return;
        
        if (searchHistory.length === 0) {
            container.innerHTML = '<p>No recent searches yet</p>';
            return;
        }
        
        // Show last 5 searches
        const recent = searchHistory.slice(-5).reverse();
        let html = '';
        
        recent.forEach(search => {
            html += `
                <div class="recent-search-item reveal">
                    <strong>${search.query}</strong>
                    <small>${new Date(search.timestamp).toLocaleString()}</small>
                </div>
            `;
        });
        
        container.innerHTML = html;
    } catch (error) {
        console.error('Error loading recent searches:', error);
        const container = document.getElementById('recentSearches');
        if (container) {
            container.innerHTML = '<p>Error loading recent searches</p>';
        }
    }
}