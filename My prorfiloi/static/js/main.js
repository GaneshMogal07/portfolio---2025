document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');

    // Handle navigation clicks with smooth scrolling
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const sectionId = link.getAttribute('href').substring(1);
                const targetSection = document.getElementById(sectionId);
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // Initialize form elements
    const contactForm = document.getElementById('contact-form');
    const formMessage = document.getElementById('form-message');
    const certificationsContainer = document.getElementById('certifications-list');

    // Initialize certifications on page load
    if (certificationsContainer) {
        loadCertifications();
    }

    // Contact form handling
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Disable form while submitting
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...';
            
            const formData = new FormData(contactForm);

            fetch('/send_message', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                formMessage.textContent = data.message;
                formMessage.className = 'mt-3 alert ' + 
                    (data.status === 'success' ? 'alert-success' : 'alert-danger');
                
                if (data.status === 'success') {
                    contactForm.reset();
                    // Scroll to the message
                    formMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            })
            .catch(error => {
                console.error('Error:', error);
                formMessage.textContent = 'An error occurred. Please try again later.';
                formMessage.className = 'mt-3 alert alert-danger';
            })
            .finally(() => {
                // Re-enable form
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            });
        });
    }

    
});

// Certification functions
function loadCertifications() {
    if (!certificationsContainer) {
        console.error('Certifications container not found');
        return;
    }

    // Show loading state
    certificationsContainer.innerHTML = '<div class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';

    fetch('/api/certifications')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(certifications => {
            if (!Array.isArray(certifications)) {
                throw new Error('Invalid certification data received');
            }
            
            if (certifications.length === 0) {
                certificationsContainer.innerHTML = '<div class="col-12 text-center"><p class="text-muted">No certifications available.</p></div>';
                return;
            }

            certificationsContainer.innerHTML = certifications.map(cert => `
                <div class="certification-card col-md-6 col-lg-4 mb-4">
                    <div class="card h-100 shadow-sm">
                        <div class="card-body d-flex flex-column">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <h5 class="card-title mb-0">${cert.name}</h5>
                                <span class="badge bg-primary">${cert.level}</span>
                            </div>
                            ${cert.image_url ? `
                                <div class="certification-image-container mt-3">
                                    <img src="${cert.image_url}" alt="${cert.name}" class="img-fluid rounded certification-image">
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `).join('');
        })
        .catch(error => {
            console.error('Error loading certifications:', error);
            certificationsContainer.innerHTML = `
                <div class="col-12 text-center">
                    <div class="alert alert-danger" role="alert">
                        Failed to load certifications. Please try again later.
                    </div>
                </div>
            `;
        });
}