class Blog {
    constructor() {
        this.currentPage = 1;
        this.postsPerPage = 6;
        this.activeCategory = 'all';
        this.activeTag = 'all';
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadPosts();
    }

    bindEvents() {
        // Category filters
        document.querySelectorAll('.blog-categories a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('.blog-categories a').forEach(a => a.classList.remove('active'));
                e.target.classList.add('active');
                this.activeCategory = e.target.dataset.category;
                this.currentPage = 1;
                this.loadPosts();
            });
        });

        // Tag filters
        document.querySelectorAll('.blog-tags a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('.blog-tags a').forEach(a => a.classList.remove('active'));
                e.target.classList.add('active');
                this.activeTag = e.target.dataset.tag;
                this.currentPage = 1;
                this.loadPosts();
            });
        });

        // Search
        const searchForm = document.querySelector('.blog-search form');
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const query = searchForm.querySelector('input').value.trim();
                if (query) {
                    this.searchPosts(query);
                }
            });
        }

        // Load more button
        const loadMoreButton = document.querySelector('.load-more-posts');
        if (loadMoreButton) {
            loadMoreButton.addEventListener('click', () => {
                this.currentPage++;
                this.loadPosts(true);
            });
        }
    }

    async loadPosts(append = false) {
        const postsContainer = document.querySelector('.blog-posts');
        const loadMoreButton = document.querySelector('.load-more-posts');
        
        if (!append) {
            postsContainer.innerHTML = '<div class="loading">Loading posts...</div>';
        }

        try {
            // In a real application, this would be an API call
            const posts = await this.fetchPosts();
            const filteredPosts = this.filterPosts(posts);
            const paginatedPosts = this.paginatePosts(filteredPosts);

            if (!append) {
                postsContainer.innerHTML = '';
            }

            paginatedPosts.forEach(post => {
                postsContainer.appendChild(this.createPostElement(post));
            });

            // Update load more button visibility
            if (loadMoreButton) {
                const totalPages = Math.ceil(filteredPosts.length / this.postsPerPage);
                loadMoreButton.style.display = this.currentPage >= totalPages ? 'none' : 'block';
            }

            // Update post count
            const postCount = document.querySelector('.post-count');
            if (postCount) {
                postCount.textContent = `Showing ${Math.min(this.currentPage * this.postsPerPage, filteredPosts.length)} of ${filteredPosts.length} posts`;
            }

        } catch (error) {
            postsContainer.innerHTML = '<div class="error">Error loading posts. Please try again later.</div>';
        }
    }

    async fetchPosts() {
        // In a real application, this would fetch from an API
        // For demonstration, we'll return mock data
        return [
            {
                id: 1,
                title: 'Understanding Frequency Therapy',
                excerpt: 'Learn about the principles behind frequency therapy and how it can benefit your health...',
                image: 'images/blog/frequency-therapy.jpg',
                category: 'education',
                tags: ['frequency', 'health', 'therapy'],
                author: 'Dr. Sarah Johnson',
                date: '2024-01-02',
                readTime: '5 min read'
            },
            {
                id: 2,
                title: 'The History of Rife Technology',
                excerpt: 'Discover the fascinating history of Royal Raymond Rife and his groundbreaking research...',
                image: 'images/blog/rife-history.jpg',
                category: 'history',
                tags: ['rife', 'research', 'history'],
                author: 'Michael Thompson',
                date: '2024-01-01',
                readTime: '8 min read'
            },
            // Add more posts as needed
        ];
    }

    filterPosts(posts) {
        return posts.filter(post => {
            const categoryMatch = this.activeCategory === 'all' || post.category === this.activeCategory;
            const tagMatch = this.activeTag === 'all' || post.tags.includes(this.activeTag);
            return categoryMatch && tagMatch;
        });
    }

    paginatePosts(posts) {
        const start = (this.currentPage - 1) * this.postsPerPage;
        const end = start + this.postsPerPage;
        return posts.slice(start, end);
    }

    createPostElement(post) {
        const article = document.createElement('article');
        article.className = 'blog-post';
        article.innerHTML = `
            <div class="post-image">
                <img src="${post.image}" alt="${post.title}">
                <div class="post-category">${post.category}</div>
            </div>
            <div class="post-content">
                <div class="post-meta">
                    <span class="post-date">${this.formatDate(post.date)}</span>
                    <span class="post-author">by ${post.author}</span>
                    <span class="read-time">${post.readTime}</span>
                </div>
                <h2 class="post-title">
                    <a href="blog-post.html?id=${post.id}">${post.title}</a>
                </h2>
                <p class="post-excerpt">${post.excerpt}</p>
                <div class="post-tags">
                    ${post.tags.map(tag => `<a href="#" data-tag="${tag}">#${tag}</a>`).join('')}
                </div>
                <a href="blog-post.html?id=${post.id}" class="read-more">Read More</a>
            </div>
        `;

        // Add event listeners to tag links
        article.querySelectorAll('.post-tags a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const tag = e.target.dataset.tag;
                document.querySelector(`.blog-tags a[data-tag="${tag}"]`)?.click();
            });
        });

        return article;
    }

    formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }

    async searchPosts(query) {
        const postsContainer = document.querySelector('.blog-posts');
        postsContainer.innerHTML = '<div class="loading">Searching posts...</div>';

        try {
            const posts = await this.fetchPosts();
            const searchResults = posts.filter(post => 
                post.title.toLowerCase().includes(query.toLowerCase()) ||
                post.excerpt.toLowerCase().includes(query.toLowerCase()) ||
                post.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
            );

            postsContainer.innerHTML = '';
            
            if (searchResults.length === 0) {
                postsContainer.innerHTML = `
                    <div class="no-results">
                        <h3>No posts found</h3>
                        <p>No posts match your search for "${query}". Try different keywords or browse our categories.</p>
                    </div>
                `;
                return;
            }

            searchResults.forEach(post => {
                postsContainer.appendChild(this.createPostElement(post));
            });

            // Update post count
            const postCount = document.querySelector('.post-count');
            if (postCount) {
                postCount.textContent = `Found ${searchResults.length} posts for "${query}"`;
            }

            // Hide load more button during search
            const loadMoreButton = document.querySelector('.load-more-posts');
            if (loadMoreButton) {
                loadMoreButton.style.display = 'none';
            }

        } catch (error) {
            postsContainer.innerHTML = '<div class="error">Error searching posts. Please try again later.</div>';
        }
    }
}

// Initialize blog functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.blog-posts')) {
        new Blog();
    }
}); 