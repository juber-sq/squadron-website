/* SQUADRON Client-Side Interactions */

document.addEventListener('DOMContentLoaded', () => {
  // Navigation Menu Toggle
  const header = document.querySelector('header');
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Change Header Styling on Scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    scrollSpy();
  });

  // Mobile Menu Active Toggle
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      
      // Animate Hamburger Lines
      const lines = menuToggle.querySelectorAll('span');
      if (navMenu.classList.contains('active')) {
        lines[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        lines[1].style.opacity = '0';
        lines[2].style.transform = 'rotate(-45deg) translate(6deg, -6deg)';
      } else {
        lines[0].style.transform = 'none';
        lines[1].style.opacity = '1';
        lines[2].style.transform = 'none';
      }
    });

    // Close Mobile Menu on link selection
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const lines = menuToggle.querySelectorAll('span');
        lines[0].style.transform = 'none';
        lines[1].style.opacity = '1';
        lines[2].style.transform = 'none';
      });
    });
  }

  // Scrollspy - Highlight Active Link
  const sections = document.querySelectorAll('section[id]');
  
  function scrollSpy() {
    const scrollY = window.pageYOffset;
    
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');
      
      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        const activeLink = document.querySelector(`.nav-menu a[href*=${sectionId}]`);
        if (activeLink) {
          navLinks.forEach(link => link.classList.remove('active'));
          activeLink.classList.add('active');
        }
      }
    });
  }

  // Dynamic Project Loader & Filtering
  const projectsGrid = document.getElementById('projectsGrid');
  const filterContainer = document.getElementById('galleryFilter');
  let projectsData = [];

  // Static Fallback Projects Array (used when opened locally via file:// without a server)
  const defaultProjects = [
    {
      "id": "smart-energy-meter",
      "name": "Smart Energy Meter",
      "description": "Industrial multi-phase energy monitoring system designed for real-time electrical analytics, data logging, and network reporting using high-accuracy instrumentation.",
      "technology": ["STM32", "ADE9000", "Modbus", "RS485", "FreeRTOS"],
      "category": "IoT & Power Systems",
      "image": "images/project-energy-meter.png"
    },
    {
      "id": "boat-autopilot-controller",
      "name": "Boat Autopilot Controller",
      "description": "High-reliability autonomous steering and marine navigation controller that processes IMU sensor fusion and GPS coordinates for precise vessel path-following.",
      "technology": ["STM32", "GPS", "IMU (MPU9250)", "CAN Bus", "PID Control"],
      "category": "Embedded Systems",
      "image": "images/project-boat-autopilot.png"
    },
    {
      "id": "multilayer-pcb-design",
      "name": "High-Density Multi-Layer PCB",
      "description": "Advanced 8-layer PCB layout designed for high-speed signal routing, controlled impedance, and minimal electromagnetic interference (EMI) compliance.",
      "technology": ["Altium Designer", "Impedance Matching", "BGA Routing", "HDI Layout"],
      "category": "Custom PCB Design",
      "image": "images/project-pcb-design.png"
    },
    {
      "id": "wireless-iot-sensor",
      "name": "Wireless Telemetry Node",
      "description": "Low-power industrial IoT transmitter node configured with long-range radio and battery management systems for remote environments.",
      "technology": ["ESP32", "LoRaWAN", "LiPo BMS", "I2C Sensors", "Deep Sleep Mode"],
      "category": "IoT & Power Systems",
      "image": "images/project-iot-sensor.png"
    }
  ];

  // Fetch projects data
  fetch('data/projects.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to load project database JSON');
      }
      return response.json();
    })
    .then(data => {
      projectsData = data;
      renderFilterButtons(data);
      renderProjects(data);
    })
    .catch(error => {
      console.warn('CORS restriction or network issue detected. Falling back to built-in projects data. Details:', error);
      projectsData = defaultProjects;
      renderFilterButtons(defaultProjects);
      renderProjects(defaultProjects);
    });

  // Extract Categories and build Filter Tabs
  function renderFilterButtons(projects) {
    if (!filterContainer) return;
    
    // Get unique categories
    const categories = ['all', ...new Set(projects.map(p => p.category))];
    
    filterContainer.innerHTML = categories.map((cat, i) => `
      <button class="filter-btn ${i === 0 ? 'active' : ''}" data-filter="${cat}">
        ${cat.charAt(0).toUpperCase() + cat.slice(1)}
      </button>
    `).join('');

    // Attach Event Listeners to Tabs
    const filterButtons = filterContainer.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filterValue = btn.getAttribute('data-filter');
        const filteredData = filterValue === 'all' 
          ? projectsData 
          : projectsData.filter(p => p.category === filterValue);
          
        // Smooth transition effect
        if (projectsGrid) {
          projectsGrid.style.opacity = '0';
          setTimeout(() => {
            renderProjects(filteredData);
            projectsGrid.style.opacity = '1';
          }, 200);
        }
      });
    });
  }

  // Render cards in DOM
  function renderProjects(projects) {
    if (!projectsGrid) return;
    
    if (projects.length === 0) {
      projectsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No products found in this category.</p>';
      return;
    }

    projectsGrid.innerHTML = projects.map(proj => `
      <div class="project-card" data-id="${proj.id}">
        <div class="project-image-box" onclick="openLightbox('${proj.id}')">
          <img src="${proj.image}" alt="${proj.name}" class="project-img" loading="lazy">
          <div class="project-image-overlay">
            <div class="zoom-icon">🔍</div>
          </div>
        </div>
        <div class="project-info">
          <div class="project-meta">
            <span class="project-category">${proj.category}</span>
          </div>
          <h3 class="project-title">${proj.name}</h3>
          <p class="project-desc">${proj.description}</p>
          <div class="project-tags">
            ${proj.technology.map(tech => `<span class="tag">${tech}</span>`).join('')}
          </div>
        </div>
      </div>
    `).join('');
  }

  // Lightbox Modal Controls
  const lightbox = document.getElementById('lightboxModal');
  const lImg = document.getElementById('lightboxImg');
  const lCategory = document.getElementById('lightboxCategory');
  const lTitle = document.getElementById('lightboxTitle');
  const lDesc = document.getElementById('lightboxDesc');
  const lTags = document.getElementById('lightboxTags');
  const lClose = document.getElementById('lightboxClose');

  window.openLightbox = function(projectId) {
    const project = projectsData.find(p => p.id === projectId);
    if (!project || !lightbox) return;

    // Fill Modal Data
    if (lImg) lImg.src = project.image;
    if (lCategory) lCategory.textContent = project.category;
    if (lTitle) lTitle.textContent = project.name;
    if (lDesc) lDesc.textContent = project.description;
    
    if (lTags) {
      lTags.innerHTML = project.technology.map(tech => `<span class="tag">${tech}</span>`).join('');
    }

    // Display Modal with Active animation classes
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden'; // Lock scrolling
  };

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    document.body.style.overflow = ''; // Unlock scrolling
  }

  if (lClose) {
    lClose.addEventListener('click', closeLightbox);
  }

  // Close lightbox on clicking backdrop
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });
  }

  // Close lightbox on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeLightbox();
    }
  });

  // Contact Form Submission (AJAX Formspree / Web3Forms)
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');

  if (contactForm && formStatus) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;
      
      // Disable button and show spinner status
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Sending... <i class="fas fa-spinner fa-spin"></i>';
      
      const formData = new FormData(contactForm);
      const accessKey = formData.get('access_key');

      // Setup clean response message
      function showStatus(message, isSuccess) {
        formStatus.textContent = message;
        formStatus.className = 'form-status ' + (isSuccess ? 'success' : 'error');
        
        // Reset submit button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;

        // Auto-fade status after 8 seconds
        setTimeout(() => {
          formStatus.style.display = 'none';
        }, 8000);
      }

      // Check if user has updated the placeholder key. If not, fallback to Demo Simulation Mode.
      if (!accessKey || accessKey === 'YOUR_ACCESS_KEY_HERE') {
        setTimeout(() => {
          showStatus('Demo Mode Success: Form submitted successfully! (Note: Please set a valid access_key key in index.html to receive actual emails).', true);
          contactForm.reset();
        }, 1500);
        return;
      }

      // Live Endpoint Submission
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      })
      .then(async (response) => {
        let json = await response.json();
        if (response.status == 200) {
          showStatus('Thank you! Your requirements have been submitted successfully. SQUADRON will contact you shortly.', true);
          contactForm.reset();
        } else {
          showStatus(json.message || 'Submission failed. Please try again or reach out directly via call.', false);
        }
      })
      .catch(error => {
        console.error('Submission Error:', error);
        showStatus('Network connection error. Please check your internet connection and try again.', false);
      });
    });
  }
});
