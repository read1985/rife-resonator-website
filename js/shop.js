class Shop {
    constructor() {
        this.products = [];
        this.filters = {
            category: 'all',
            priceRange: {
                min: 0,
                max: 2500
            },
            features: []
        };
        this.sortBy = 'default';
        this.init();
    }

    init() {
        this.loadProducts();
        this.initializeFilters();
        this.initializeSorting();
        this.handleURLParameters();
    }

    loadProducts() {
        // In a real application, this would be an API call
        this.products = [
            {
                id: 1,
                name: 'Wave5 Pro Resonator',
                category: 'resonators',
                price: 1995.00,
                originalPrice: null,
                description: 'Professional-grade resonator with advanced frequency capabilities and touch screen interface.',
                image: 'images/wave5-pro.jpg',
                features: ['touch-screen', 'portable', 'rechargeable', 'wireless'],
                rating: 5,
                reviewCount: 12,
                badge: 'new'
            },
            {
                id: 2,
                name: 'Wave3 Resonator',
                category: 'resonators',
                price: 1495.00,
                originalPrice: 1695.00,
                description: 'Compact and powerful resonator perfect for home use with essential features.',
                image: 'images/wave3.jpg',
                features: ['portable', 'rechargeable'],
                rating: 4.5,
                reviewCount: 8,
                badge: 'sale'
            },
            {
                id: 3,
                name: 'Starter Kit Package',
                category: 'packages',
                price: 2495.00,
                originalPrice: null,
                description: 'Complete package including Wave3 resonator, accessories, and training materials.',
                image: 'images/starter-kit.jpg',
                features: ['portable', 'rechargeable'],
                rating: 5,
                reviewCount: 15,
                badge: null
            }
            // Add more products as needed
        ];
    }

    initializeFilters() {
        // Category filters
        document.querySelectorAll('.category-filter a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('.category-filter a').forEach(a => a.classList.remove('active'));
                e.target.classList.add('active');
                this.filters.category = e.target.dataset.category;
                this.updateProducts();
            });
        });

        // Price range filter
        const priceRange = document.getElementById('price-range');
        const minPrice = document.getElementById('min-price');
        const maxPrice = document.getElementById('max-price');
        const applyPrice = document.querySelector('.apply-price');

        priceRange.addEventListener('input', (e) => {
            maxPrice.value = e.target.value;
        });

        applyPrice.addEventListener('click', () => {
            this.filters.priceRange.min = parseInt(minPrice.value) || 0;
            this.filters.priceRange.max = parseInt(maxPrice.value) || 2500;
            this.updateProducts();
        });

        // Feature filters
        document.querySelectorAll('.feature-filter input').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.filters.features = Array.from(document.querySelectorAll('.feature-filter input:checked'))
                    .map(input => input.value);
                this.updateProducts();
            });
        });
    }

    initializeSorting() {
        const sortSelect = document.querySelector('.sort-by select');
        sortSelect.addEventListener('change', (e) => {
            this.sortBy = e.target.value;
            this.updateProducts();
        });
    }

    handleURLParameters() {
        const params = new URLSearchParams(window.location.search);
        const category = params.get('category');
        const search = params.get('search');

        if (category) {
            const categoryLink = document.querySelector(`.category-filter a[data-category="${category}"]`);
            if (categoryLink) {
                categoryLink.click();
            }
        }

        if (search) {
            this.searchProducts(search);
        }
    }

    searchProducts(query) {
        query = query.toLowerCase();
        const filteredProducts = this.products.filter(product => 
            product.name.toLowerCase().includes(query) ||
            product.description.toLowerCase().includes(query)
        );
        this.renderProducts(filteredProducts);
        document.querySelector('.product-count').textContent = `Showing ${filteredProducts.length} results for "${query}"`;
    }

    filterProducts() {
        return this.products.filter(product => {
            const categoryMatch = this.filters.category === 'all' || product.category === this.filters.category;
            const priceMatch = product.price >= this.filters.priceRange.min && product.price <= this.filters.priceRange.max;
            const featuresMatch = this.filters.features.length === 0 || 
                this.filters.features.every(feature => product.features.includes(feature));
            
            return categoryMatch && priceMatch && featuresMatch;
        });
    }

    sortProducts(products) {
        switch(this.sortBy) {
            case 'price-low':
                return products.sort((a, b) => a.price - b.price);
            case 'price-high':
                return products.sort((a, b) => b.price - a.price);
            case 'newest':
                return products.sort((a, b) => b.id - a.id);
            default:
                return products;
        }
    }

    updateProducts() {
        const filteredProducts = this.filterProducts();
        const sortedProducts = this.sortProducts(filteredProducts);
        this.renderProducts(sortedProducts);
        this.updateProductCount(sortedProducts.length);
    }

    renderProducts(products) {
        const productsGrid = document.querySelector('.products-grid');
        productsGrid.innerHTML = products.map(product => `
            <div class="product-card" data-id="${product.id}" data-price="${product.price}">
                ${product.badge ? `<div class="product-badge ${product.badge}">${product.badge}</div>` : ''}
                <img src="${product.image}" alt="${product.name}">
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <div class="product-rating">
                        ${this.generateRatingStars(product.rating)}
                        <span>(${product.reviewCount} reviews)</span>
                    </div>
                    <div class="price-container">
                        <p class="price">
                            ${product.originalPrice ? `<span class="original-price">$${product.originalPrice.toFixed(2)}</span> ` : ''}
                            $${product.price.toFixed(2)}
                        </p>
                    </div>
                    <p class="description">${product.description}</p>
                    <button class="add-to-cart-btn">Add to Cart</button>
                    <a href="product-${product.id}.html" class="view-details">View Details</a>
                </div>
            </div>
        `).join('');

        // Reinitialize cart buttons
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Add to cart clicked');
                const productCard = e.target.closest('.product-card');
                if (productCard && window.cartInstance) {
                    console.log('Found product card:', productCard);
                    window.cartInstance.addToCart(productCard);
                } else {
                    console.error('No product card or cart instance found');
                }
            });
        });
    }

    generateRatingStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - Math.ceil(rating);

        return `
            ${Array(fullStars).fill('<i class="fas fa-star"></i>').join('')}
            ${hasHalfStar ? '<i class="fas fa-star-half"></i>' : ''}
            ${Array(emptyStars).fill('<i class="far fa-star"></i>').join('')}
        `;
    }

    updateProductCount(count) {
        const productCount = document.querySelector('.product-count span');
        productCount.textContent = `Showing ${count} product${count !== 1 ? 's' : ''}`;
    }
}

// Initialize shop functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.shop = new Shop();
}); 