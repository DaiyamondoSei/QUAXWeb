class Breadcrumbs {
    constructor() {
        this.breadcrumbsContainer = document.createElement('nav');
        this.breadcrumbsContainer.className = 'breadcrumbs';
        this.breadcrumbsContainer.setAttribute('aria-label', 'Breadcrumb');
    }

    generateBreadcrumbs() {
        const path = window.location.pathname;
        const segments = path.split('/').filter(segment => segment);
        
        let breadcrumbs = [
            { name: 'Home', url: '/' }
        ];

        let currentPath = '';
        segments.forEach(segment => {
            currentPath += `/${segment}`;
            const name = this.formatSegmentName(segment);
            breadcrumbs.push({ name, url: currentPath });
        });

        return breadcrumbs;
    }

    formatSegmentName(segment) {
        // Remove file extension and replace hyphens with spaces
        return segment
            .replace(/\.html$/, '')
            .replace(/-/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    render() {
        const breadcrumbs = this.generateBreadcrumbs();
        const breadcrumbsHTML = breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return `
                <li class="breadcrumb-item ${isLast ? 'active' : ''}">
                    ${isLast ? 
                        `<span aria-current="page">${crumb.name}</span>` :
                        `<a href="${crumb.url}">${crumb.name}</a>`
                    }
                </li>
            `;
        }).join('');

        this.breadcrumbsContainer.innerHTML = `
            <ol class="breadcrumb-list">
                ${breadcrumbsHTML}
            </ol>
        `;

        return this.breadcrumbsContainer;
    }
}

// Initialize breadcrumbs
document.addEventListener('DOMContentLoaded', () => {
    const breadcrumbs = new Breadcrumbs();
    const mainContent = document.querySelector('main') || document.querySelector('.content');
    if (mainContent) {
        mainContent.insertBefore(breadcrumbs.render(), mainContent.firstChild);
    }
}); 