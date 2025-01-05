// Navigation functionality
class Navigation {
    constructor() {
        this.init();
    }

    init() {
        // Mobile menu toggle
        const menuToggle = document.querySelector('.menu-toggle');
        const mobileMenu = document.querySelector('.mobile-menu');
        
        if (menuToggle && mobileMenu) {
            menuToggle.addEventListener('click', () => {
                mobileMenu.classList.toggle('active');
            });
        }

        // Dropdown menus
        document.querySelectorAll('.has-dropdown').forEach(item => {
            item.addEventListener('mouseenter', function() {
                this.querySelector('.dropdown-menu').style.display = 'block';
            });
            
            item.addEventListener('mouseleave', function() {
                this.querySelector('.dropdown-menu').style.display = 'none';
            });
        });
    }
}

// Search functionality
class Search {
    constructor() {
        this.init();
    }

    init() {
        const searchToggle = document.querySelector('.search-toggle');
        const searchForm = document.querySelector('.search-form');
        
        if (searchToggle && searchForm) {
            searchToggle.addEventListener('click', (e) => {
                e.preventDefault();
                searchForm.classList.toggle('active');
            });
        }
    }

    performSearch(query) {
        // Implement search functionality
        console.log('Searching for:', query);
    }
}

// Initialize functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Navigation();
    new Search();
}); 