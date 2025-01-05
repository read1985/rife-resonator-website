document.addEventListener('DOMContentLoaded', function() {
    // Load header component
    fetch('components/header.html')
        .then(response => response.text())
        .then(html => {
            // Replace the existing header with the component
            document.querySelector('header').outerHTML = html;
            
            // Add active class to current page link
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            document.querySelectorAll('.nav-links a').forEach(link => {
                if (link.getAttribute('href') === currentPage) {
                    link.parentElement.classList.add('active');
                }
            });
        })
        .catch(error => console.error('Error loading header:', error));

    // Load footer component
    fetch('components/footer.html')
        .then(response => response.text())
        .then(html => {
            // Find all elements from footer to end of body
            const elementsToReplace = document.querySelectorAll('footer, .copyright-bar, #cart-sidebar');
            // Remove them
            elementsToReplace.forEach(el => el.remove());
            // Insert the new footer component
            document.body.insertAdjacentHTML('beforeend', html);
        })
        .catch(error => console.error('Error loading footer:', error));
}); 