async function loadIncludes() {
    try {
        const [headerHTML, navbar, footer] = await Promise.all([
            fetch('/header.html').then(r => r.text()),
            fetch('/navbar.html').then(r => r.text()),
            fetch('/footer.html').then(r => r.text())
        ]);

        // --- Core Fix ---
        // 1. Create a temporary container to parse the header HTML string
        const parser = new DOMParser();
        const doc = parser.parseFromString(headerHTML, 'text/html');

        // 2. Extract critical elements (links, meta) from the parsed content
        //    And append them directly to the main document's <head>
        const elementsToMove = doc.querySelectorAll('meta, link, style, script');
        
        elementsToMove.forEach(element => {
            // Check if the element is an external resource link/script
            if (element.tagName === 'META' || element.tagName === 'LINK' || (element.tagName === 'SCRIPT' && element.src)) {
                // Insert the styles/meta/external scripts into the actual <head>
                document.head.appendChild(element.cloneNode(true));
                element.remove(); // Remove it from the doc fragment so it doesn't get inserted twice
            }
        });
        // ------------------
        
        // 3. Now, inject the remaining (visible) content of the header file
        //    into its placeholder (which is now just for visible elements).
        document.getElementById('header-placeholder').innerHTML = doc.documentElement.innerHTML;
        
        // 4. Inject the navbar and footer as before
        document.getElementById('navbar-placeholder').innerHTML = navbar;
        document.getElementById('footer-placeholder').innerHTML = footer;

        // Fade in after content loaded
        document.querySelectorAll('#header-placeholder, #navbar-placeholder, #footer-placeholder')
            .forEach(el => el.classList.add('loaded'));
            
        // Move the Bootstrap JS script to the end of the <body> for proper loading
        const bootstrapScript = document.head.querySelector('script[src*="bootstrap.bundle.min.js"]');
        if (bootstrapScript) {
            document.body.appendChild(bootstrapScript);
        }

        document.getElementById('main-placeholder').style.display = 'block';

    } catch (err) {
        console.error('Error loading includes:', err);
    }
}

// Run on page load
document.addEventListener('DOMContentLoaded', loadIncludes);