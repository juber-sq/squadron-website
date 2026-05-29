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
      "id": "iot-mcb",
      "name": "IoT MCB",
      "description": "Smart internet-connected Miniature Circuit Breaker (MCB) featuring remote automated trip controls, real-time current telemetry, and Wi-Fi load management overlays.",
      "technology": ["ESP32", "Relays", "Wi-Fi", "ADC", "Telemetry Sensors"],
      "category": "IoT & Power Systems",
      "image": "images/project-iot-mcb.jpg"
    },
    {
      "id": "precision-power-supply",
      "name": "10V 10A CV/CC High Precision Power Supply",
      "description": "High-stability laboratory-grade linear power supply with constant voltage (CV) and constant current (CC) regulation circuits, designed for low-ripple calibration testing.",
      "technology": ["Linear Regulator", "CV/CC Loop", "Digital Meter", "Toroidal Transformer", "Calibration"],
      "category": "IoT & Power Systems",
      "image": "images/project-power-supply-1.jpg",
      "images": [
        "images/project-power-supply-1.jpg",
        "images/project-power-supply-2.jpg",
        "images/project-power-supply-3.jpg",
        "images/project-power-supply-4.jpg",
        "images/project-power-supply-5.jpg"
      ]
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
  const lightboxImageBox = document.querySelector('.lightbox-image-box');
  const lCategory = document.getElementById('lightboxCategory');
  const lTitle = document.getElementById('lightboxTitle');
  const lDesc = document.getElementById('lightboxDesc');
  const lTags = document.getElementById('lightboxTags');
  const lClose = document.getElementById('lightboxClose');

  let currentProjectImages = [];
  let currentImageIndex = 0;

  function updateLightboxImage() {
    const lImg = document.getElementById('lightboxImg');
    if (lImg && currentProjectImages.length > 0) {
      lImg.src = currentProjectImages[currentImageIndex];
      
      // Update dots indicator active class
      const dots = document.querySelectorAll('.lightbox-slider-dot');
      dots.forEach((dot, idx) => {
        if (idx === currentImageIndex) {
          dot.classList.add('active');
          dot.style.background = 'var(--accent)';
          dot.style.boxShadow = '0 0 8px var(--accent)';
        } else {
          dot.classList.remove('active');
          dot.style.background = 'rgba(255, 255, 255, 0.4)';
          dot.style.boxShadow = 'none';
        }
      });
    }
  }

  window.openLightbox = function(projectId) {
    const project = projectsData.find(p => p.id === projectId);
    if (!project || !lightbox) return;

    // Fill Modal Data
    if (lCategory) lCategory.textContent = project.category;
    if (lTitle) lTitle.textContent = project.name;
    if (lDesc) lDesc.textContent = project.description;
    
    if (lTags) {
      lTags.innerHTML = project.technology.map(tech => `<span class="tag">${tech}</span>`).join('');
    }

    // Handle Image Gallery / Single Image
    if (lightboxImageBox) {
      // Determine if project has multiple images
      if (project.images && project.images.length > 0) {
        currentProjectImages = project.images;
      } else {
        currentProjectImages = [project.image];
      }
      currentImageIndex = 0;

      if (currentProjectImages.length > 1) {
        // Multi-image slider layout
        lightboxImageBox.innerHTML = `
          <div class="lightbox-slider" style="position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; overflow: hidden; min-height: 350px; background: #000;">
            <button id="lightboxPrevBtn" style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); background: rgba(5, 8, 17, 0.7); color: #fff; border: 1px solid var(--border-color); width: 40px; height: 40px; border-radius: 50%; cursor: pointer; z-index: 10; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; transition: all 0.2s;"><i class="fa-solid fa-chevron-left"></i></button>
            <img src="${currentProjectImages[0]}" alt="${project.name}" id="lightboxImg" class="lightbox-img" style="width: 100%; height: 100%; object-fit: cover;">
            <button id="lightboxNextBtn" style="position: absolute; right: 15px; top: 50%; transform: translateY(-50%); background: rgba(5, 8, 17, 0.7); color: #fff; border: 1px solid var(--border-color); width: 40px; height: 40px; border-radius: 50%; cursor: pointer; z-index: 10; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; transition: all 0.2s;"><i class="fa-solid fa-chevron-right"></i></button>
            <div class="lightbox-slider-dots" style="position: absolute; bottom: 15px; display: flex; gap: 8px; z-index: 10;">
              ${currentProjectImages.map((_, i) => `<span class="lightbox-slider-dot ${i === 0 ? 'active' : ''}" data-index="${i}" style="width: 8px; height: 8px; border-radius: 50%; background: ${i === 0 ? 'var(--accent)' : 'rgba(255, 255, 255, 0.4)'}; cursor: pointer; transition: all 0.2s; ${i === 0 ? 'box-shadow: 0 0 8px var(--accent);' : ''}"></span>`).join('')}
            </div>
          </div>
        `;

        // Bind Arrow Events
        const prevBtn = document.getElementById('lightboxPrevBtn');
        const nextBtn = document.getElementById('lightboxNextBtn');

        if (prevBtn) {
          prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            currentImageIndex = (currentImageIndex - 1 + currentProjectImages.length) % currentProjectImages.length;
            updateLightboxImage();
          });
          prevBtn.addEventListener('mouseenter', () => { prevBtn.style.borderColor = 'var(--accent)'; prevBtn.style.color = 'var(--accent)'; });
          prevBtn.addEventListener('mouseleave', () => { prevBtn.style.borderColor = ''; prevBtn.style.color = ''; });
        }

        if (nextBtn) {
          nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            currentImageIndex = (currentImageIndex + 1) % currentProjectImages.length;
            updateLightboxImage();
          });
          nextBtn.addEventListener('mouseenter', () => { nextBtn.style.borderColor = 'var(--accent)'; nextBtn.style.color = 'var(--accent)'; });
          nextBtn.addEventListener('mouseleave', () => { nextBtn.style.borderColor = ''; nextBtn.style.color = ''; });
        }

        // Bind Dot Navigation
        const dots = document.querySelectorAll('.lightbox-slider-dot');
        dots.forEach(dot => {
          dot.addEventListener('click', (e) => {
            e.stopPropagation();
            currentImageIndex = parseInt(dot.getAttribute('data-index'));
            updateLightboxImage();
          });
        });

      } else {
        // Single image layout
        lightboxImageBox.innerHTML = `
          <img src="${currentProjectImages[0]}" alt="${project.name}" id="lightboxImg" class="lightbox-img" style="width: 100%; height: 100%; object-fit: cover;">
        `;
      }
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

  // Contact Form Submission (AJAX Formspree)
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
      const action = contactForm.getAttribute('action') || 'https://formspree.io/aslamsearch@gmail.com';

      // Setup clean response message
      function showStatus(message, isSuccess) {
        formStatus.textContent = message;
        formStatus.className = 'form-status ' + (isSuccess ? 'success' : 'error');
        formStatus.style.display = 'block';
        
        // Reset submit button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;

        // Auto-fade status after 8 seconds
        setTimeout(() => {
          formStatus.style.display = 'none';
        }, 8000);
      }

      // Live Endpoint Submission to Formspree
      fetch(action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      })
      .then(async (response) => {
        if (response.ok) {
          showStatus('Thank you! Your requirements have been submitted successfully. SQUADRON will contact you shortly.', true);
          contactForm.reset();
        } else {
          const json = await response.json();
          const errorMsg = (json && json.errors && json.errors.map(err => err.message).join(', ')) || (json && json.error) || 'Submission failed. Please try again or reach out directly via call.';
          showStatus(errorMsg, false);
        }
      })
      .catch(error => {
        console.error('Submission Error:', error);
        showStatus('Network connection error. Please check your internet connection and try again.', false);
      });
    });
  }


  // Projects Showcase Slider Logic
  const sliderWrapper = document.getElementById('showcaseSliderWrapper');
  const sliderDotsContainer = document.getElementById('sliderDots');
  const sliderPrevBtn = document.getElementById('sliderPrevBtn');
  const sliderNextBtn = document.getElementById('sliderNextBtn');
  const sliderContainer = document.getElementById('sliderContainer');

  const slideItems = [
    'images/slide_images/slide1.jpg',
    'images/slide_images/slide2.jpg',
    'images/slide_images/slide3.jpg',
    'images/slide_images/slide4.jpg',
    'images/slide_images/slide5.jpg',
    'images/slide_images/slide6.jpg'
  ];

  if (sliderWrapper && sliderDotsContainer) {
    // Fisher-Yates Shuffle Utility to randomize slide order
    function shuffleSlides(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }

    const shuffledSlides = shuffleSlides([...slideItems]);
    let currentSlide = 0;
    let autoPlayTimer = null;

    // Render slide items
    sliderWrapper.innerHTML = shuffledSlides.map(src => `
      <div class="slide">
        <img src="${src}" alt="Showcase Slide Image">
      </div>
    `).join('');

    // Render dot indicators
    sliderDotsContainer.innerHTML = shuffledSlides.map((_, i) => `
      <span class="slider-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>
    `).join('');

    const dots = sliderDotsContainer.querySelectorAll('.slider-dot');

    function goToSlide(index) {
      currentSlide = (index + shuffledSlides.length) % shuffledSlides.length;
      sliderWrapper.style.transform = `translateX(-${currentSlide * 100}%)`;
      
      // Update active classes on dots
      dots.forEach((dot, i) => {
        if (i === currentSlide) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    }

    // Controls Event Listeners
    if (sliderPrevBtn) {
      sliderPrevBtn.addEventListener('click', () => {
        goToSlide(currentSlide - 1);
        resetAutoPlay();
      });
    }

    if (sliderNextBtn) {
      sliderNextBtn.addEventListener('click', () => {
        goToSlide(currentSlide + 1);
        resetAutoPlay();
      });
    }

    // Dot Navigation Event Listeners
    dots.forEach(dot => {
      dot.addEventListener('click', (e) => {
        const index = parseInt(e.target.getAttribute('data-index'));
        goToSlide(index);
        resetAutoPlay();
      });
    });

    // Auto Play Functionality
    function startAutoPlay() {
      autoPlayTimer = setInterval(() => {
        goToSlide(currentSlide + 1);
      }, 5000); // Change slides every 5 seconds
    }

    function stopAutoPlay() {
      if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
      }
    }

    function resetAutoPlay() {
      stopAutoPlay();
      startAutoPlay();
    }

    // Pause autoplay on mouse enter
    if (sliderContainer) {
      sliderContainer.addEventListener('mouseenter', stopAutoPlay);
      sliderContainer.addEventListener('mouseleave', startAutoPlay);
    }

    // Start auto play initially
    startAutoPlay();
  }
});
