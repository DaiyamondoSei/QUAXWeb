
// Component Loader
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.component-include').forEach(include => {
        const componentName = include.getAttribute('data-component');
        fetch(`components/${componentName}`)
            .then(response => response.text())
            .then(html => {
                include.innerHTML = html;
            })
            .catch(error => console.error('Error loading component:', error));
    });
});
