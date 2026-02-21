(function ($) {
    "use strict";

    // Spacer/Utility for GSAP
    gsap.registerPlugin(ScrollTrigger);

    // Initialize Swiper
    var initSwiper = function () {
        $(".tf-swiper").each(function (index, element) {
            var $this = $(element);
            var preview = $this.data("preview") || 1;
            var tablet = $this.data("tablet") || 1;
            var mobile = $this.data("mobile") || 1;
            var mobileSm = $this.data("mobile-sm") || 1;
            var spacing = $this.data("space") || 0;
            var loop = $this.data("loop") || false;
            var atPlay = $this.data("auto") || false;
            var delay = $this.data("delay") || 1000;
            var speed = $this.data("speed") || 1000;
            var direction = $this.data("direction") || "horizontal";

            new Swiper($this[0], {
                direction: direction,
                speed: speed,
                slidesPerView: mobile,
                spaceBetween: spacing,
                loop: loop,
                autoplay: atPlay ? {
                    delay: delay,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                } : false,
                breakpoints: {
                    575: {
                        slidesPerView: mobileSm,
                        spaceBetween: spacing,
                    },
                    768: {
                        slidesPerView: tablet,
                        spaceBetween: spacing,
                    },
                    1200: {
                        slidesPerView: preview,
                        spaceBetween: spacing,
                    },
                },
            });
        });
    };

    // GSAP Animation for Award Images
    var gsapA2 = () => {
        if ($(".gsap-anime-2").length) {
            const cards = document.querySelectorAll(".flip-image");
            let initialStates = [];
            let isExpanded = false;

            // Store initial positions/rotations for reset
            function captureInitialState() {
                initialStates = [];
                cards.forEach(card => {
                    const rect = card.getBoundingClientRect();
                    const style = window.getComputedStyle(card);
                    initialStates.push({
                        x: gsap.getProperty(card, "x"),
                        y: gsap.getProperty(card, "y"),
                        rotation: gsap.getProperty(card, "rotation"),
                        rotateX: gsap.getProperty(card, "rotateX"),
                        rotateY: gsap.getProperty(card, "rotateY"),
                        width: rect.width,
                        height: rect.height,
                        zIndex: style.zIndex
                    });
                });
            }

            function animate() {
                const isMobile = window.innerWidth < 767;
                const cardW = isMobile ? 150 : 325;
                const cardH = isMobile ? 150 : 325;

                const parent = cards[0].parentElement;
                parent.style.position = "relative";
                // Ensure parent has height
                if (parent.clientHeight === 0) {
                    // small hack if parent height isn't set yet
                    // parent.style.height = "600px"; 
                }

                const centerX = parent.clientWidth / 2 - cardW / 2;
                const centerY = parent.clientHeight / 2 - cardH / 2;

                cards.forEach((card, i) => {
                    card.style.position = "absolute";
                    card.style.zIndex = i + 1;
                });

                const tl = gsap.timeline({
                    defaults: { ease: "power3.out" },
                    scrollTrigger: {
                        trigger: ".gsap-anime-2",
                        start: "top 80%",
                        toggleActions: "play none none reverse",
                        onComplete: captureInitialState // Capture state after animation
                    },
                });

                tl.to(cards, {
                    x: centerX,
                    y: centerY,
                    opacity: 1,
                    duration: 1,
                    stagger: 0.1,
                }).to(cards, {
                    x: (i) => {
                        if (i === 0) return centerX - (isMobile ? 180 : 400);
                        if (i === 1) return centerX - (isMobile ? 110 : 240);
                        if (i === 2) return centerX - (isMobile ? 40 : 80);
                        if (i === 3) return centerX + (isMobile ? 40 : 80);
                        if (i === 4) return centerX + (isMobile ? 110 : 240);
                        if (i === 5) return centerX + (isMobile ? 180 : 400);
                        return centerX;
                    },
                    y: (i) => {
                        if (i === 0) return centerY - (isMobile ? 120 : 300);
                        if (i === 1) return centerY - (isMobile ? 70 : 180);
                        if (i === 2) return centerY - (isMobile ? 25 : 60);
                        if (i === 3) return centerY + (isMobile ? 25 : 60);
                        if (i === 4) return centerY + (isMobile ? 70 : 180);
                        if (i === 5) return centerY + (isMobile ? 120 : 300);
                        return centerY;
                    },
                    rotation: -10,
                    rotateX: 4,
                    rotateY: 10,
                    duration: 1,
                    ease: "power2.out",
                    delay: 0.3,
                    onComplete: captureInitialState
                });
            }

            // Click Handler for Flip/Expand
            cards.forEach((card, index) => {
                // Hover Effects
                card.addEventListener('mouseenter', function () {
                    if (isExpanded) return;
                    gsap.to(this.querySelector('.flip-card-inner'), {
                        scale: 1.15,
                        duration: 0.05,
                        ease: "back.out(4)"
                    });
                });

                card.addEventListener('mouseleave', function () {
                    if (isExpanded) return;
                    gsap.to(this.querySelector('.flip-card-inner'), {
                        scale: 1,
                        duration: 0.05,
                        ease: "power2.out"
                    });
                });

                card.addEventListener('click', function (e) {
                    if (isExpanded) return; // Prevent clicking others if one is expanded
                    if (e.target.closest('.close-btn')) return; // Ignore close button click here

                    isExpanded = true;
                    // captureInitialState(); // Ensure we have the latest state before expanding

                    const state = initialStates[index];
                    const inner = this.querySelector('.flip-card-inner');
                    const frontImg = this.querySelector('.flip-card-front img');

                    // 1. Center and Scale Up
                    this.classList.add('is-expanded');

                    // Reset 3D rotations from the stack animation to 0 for a clean flip
                    gsap.to(this, {
                        x: parentElementCenterX(this), // Center X
                        y: parentElementCenterY(this), // Center Y
                        rotation: 0,
                        rotateX: 0,
                        rotateY: 0,
                        zIndex: 9999,
                        duration: 0.5,
                        ease: "power2.inOut",
                        onComplete: () => {
                            // 2. Flip to show back (now front via 360)
                            gsap.to(inner, {
                                rotationY: 360,
                                duration: 0.8,
                                ease: "power2.inOut"
                            });

                            // Optional: Scale up
                            gsap.to(this, {
                                scale: 1.5, // Adjust based on needs, for full screen this logic needs valid calculation
                                duration: 0.5
                            });
                        }
                    });
                });

                // Close Handler
                const closeBtn = card.querySelector('.close-btn');
                if (closeBtn) {
                    closeBtn.addEventListener('click', function (e) {
                        e.stopPropagation(); // Prevent card click
                        const cardElement = this.closest('.flip-image');
                        const inner = cardElement.querySelector('.flip-card-inner');
                        const state = initialStates[index];

                        // 1. Close (Continue spin to 720)
                        gsap.to(inner, {
                            rotationY: 720,
                            duration: 0.8,
                            ease: "power2.inOut",
                            onComplete: () => {
                                // 2. Return to stack position
                                gsap.to(cardElement, {
                                    x: state.x,
                                    y: state.y,
                                    rotation: state.rotation,
                                    rotateX: state.rotateX,
                                    rotateY: state.rotateY,
                                    scale: 1,
                                    zIndex: state.zIndex,
                                    duration: 0.6,
                                    ease: "power2.out",
                                    onComplete: () => {
                                        cardElement.classList.remove('is-expanded');
                                        isExpanded = false;
                                        // Silent reset for next time
                                        gsap.set(inner, { rotationY: 0 });
                                    }
                                });
                            }
                        });
                    });
                }
            });

            // Helper to find center of the container
            function parentElementCenterX(card) {
                const parent = document.querySelector('.flip-image-list');
                const pRect = parent.getBoundingClientRect();
                return (pRect.width - card.offsetWidth) / 2;
            }
            function parentElementCenterY(card) {
                const parent = document.querySelector('.flip-image-list');
                const pRect = parent.getBoundingClientRect();
                return (pRect.height - card.offsetHeight) / 2;
            }


            // small delay to ensure layout is ready
            setTimeout(() => {
                animate();
            }, 100);

            window.addEventListener("resize", () => {
                gsap.killTweensOf(".flip-image");
                animate();
            });
        }
    };

    $(function () {
        initSwiper();
        gsapA2();
    });

})(jQuery);
