document.addEventListener('DOMContentLoaded', function() {
    const toggleItems = document.querySelectorAll('.toggle-item');
    
    toggleItems.forEach(item => {
        const header = item.querySelector('.toggle-header');
        
        header.addEventListener('click', () => {
            // Close all other items
            toggleItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current item
            item.classList.toggle('active');
        });
    });

    // Latest Frequencies section
    const frequencyItems = document.querySelectorAll('.frequency-item');
    
    frequencyItems.forEach(item => {
        const header = item.querySelector('h3');
        
        header.addEventListener('click', () => {
            // Close all other items
            frequencyItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current item
            item.classList.toggle('active');
        });
    });
}); 