/**
 * Go Top
 * Infinite Slide
 * Update Clock
 * Cursor Trail
 * Counter
 * Scroll Link
 * Setting Color
 * Open Menu
 * Click Active
 */

(function ($) {
    "use strict";

    /* Go Top
    -------------------------------------------------------------------------*/
    var goTop = function () {
        var $goTop = $("#goTop");
        var $borderProgress = $(".border-progress");
        var $footer = $(".tf-footer");

        $(window).on("scroll", function () {
            var scrollTop = $(window).scrollTop();
            var docHeight = $(document).height() - $(window).height();
            var scrollPercent = (scrollTop / docHeight) * 100;
            var progressAngle = (scrollPercent / 100) * 360;

            $borderProgress.css("--progress-angle", progressAngle + "deg");

            var windowBottom = scrollTop + $(window).height();
            var hasFooter = $footer.length > 0;
            var footerOffset = hasFooter ? $footer.offset().top : Infinity;

            if (scrollTop > 100 && windowBottom < footerOffset) {
                $goTop.addClass("show");
            } else {
                $goTop.removeClass("show");
            }
        });

        $goTop.on("click", function () {
            $("html, body").animate({ scrollTop: 0 }, 100);
        });
    };
    /* Infinite Slide 
    -------------------------------------------------------------------------*/
    var infiniteSlide = function () {
        if ($(".infiniteSlide").length > 0) {
            $(".infiniteSlide").each(function () {
                var $this = $(this);
                var style = $this.data("style") || "left";
                var clone = $this.data("clone") || 2;
                var speed = $this.data("speed") || 50;
                $this.infiniteslide({
                    speed: speed,
                    direction: style,
                    clone: clone,
                    pauseonhover: false,
                });
            });
        }
    };
    /* Update Clock
    -------------------------------------------------------------------------*/
    var updateClock = () => {
        function startClocks(selector = ".clock") {
            function updateClock() {
                const now = new Date();
                const timeString = now.toLocaleTimeString("en-GB");
                document.querySelectorAll(selector).forEach((el) => {
                    el.textContent = timeString;
                });
            }
            updateClock();
            setInterval(updateClock, 1000);
        }

        startClocks(".clock");
    };
    /* Cursor Trail
    -------------------------------------------------------------------------*/
    var cursorTrail = () => {
        const canvas = document.getElementById("trail");
        const ctx = canvas.getContext("2d");
        let w = window.innerWidth,
            h = window.innerHeight;
        canvas.width = w;
        canvas.height = h;

        let points = [];
        let ripples = [];

        window.addEventListener("resize", () => {
            w = window.innerWidth;
            h = window.innerHeight;
            canvas.width = w;
            canvas.height = h;
        });

        window.addEventListener("mousemove", (e) => {
            points.push({ x: e.clientX, y: e.clientY });
            if (points.length > 10) points.shift();
        });

        window.addEventListener("click", (e) => {
            ripples.push({
                x: e.clientX,
                y: e.clientY,
                radius: 0,
                alpha: 1,
            });
        });

        function draw() {
            ctx.clearRect(0, 0, w, h);

            if (points.length > 1) {
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                for (let i = 1; i < points.length; i++) {
                    ctx.lineTo(points[i].x, points[i].y);
                }
                let last = points[points.length - 1];
                let grad = ctx.createLinearGradient(points[0].x, points[0].y, last.x, last.y);
                grad.addColorStop(0, "black");
                grad.addColorStop(1, "white");
                ctx.strokeStyle = grad;
                ctx.lineWidth = 3;
                ctx.lineCap = "round";
                ctx.stroke();
            }

            ripples.forEach((r, i) => {
                ctx.beginPath();
                ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(255,255,255,${r.alpha})`;
                ctx.lineWidth = 2;
                ctx.stroke();
                r.radius += 1;
                r.alpha -= 0.02;
            });
            ripples = ripples.filter((r) => r.alpha > 0);

            requestAnimationFrame(draw);
        }
        draw();
    };
    /* Counter Odo
    -------------------------------------------------------------------------*/
    var counterOdo = () => {
        function isElementInViewport($el) {
            var top = $el.offset().top;
            var bottom = top + $el.outerHeight();
            var viewportTop = $(window).scrollTop();
            var viewportBottom = viewportTop + $(window).height();
            return bottom > viewportTop && top < viewportBottom;
        }
        if ($(".counter-scroll").length > 0) {
            $(window).on("scroll", function () {
                $(".wg-counter").each(function () {
                    var $counter = $(this);
                    if (isElementInViewport($counter) && !$counter.hasClass("counted")) {
                        $counter.addClass("counted");
                        var targetNumber = $counter.find(".odometer").data("number");
                        setTimeout(function () {
                            $counter.find(".odometer").text(targetNumber);
                        }, 0);
                    }
                });
            });
        }
    };
    /* Setting Color
    -------------------------------------------------------------------------*/
    const settingColor = () => {
        if (!$(".settings-color").length) return;

        const COLOR_KEY = "selectedColorIndex";

        const savedIndex = localStorage.getItem(COLOR_KEY);

        if (savedIndex !== null) {
            setColor(savedIndex);
            setActiveItem(savedIndex - 1);
        }

        $(".choose-item").on("click", function () {
            const index = $(this).index();
            setColor(index + 1);
            setActiveItem(index);
            localStorage.setItem(COLOR_KEY, index + 1);
        });

        function setColor(index) {
            $("body").attr("data-color-primary", "color-primary-" + index);
        }

        function setActiveItem(index) {
            $(".choose-item").removeClass("active").eq(index).addClass("active");
        }
    };
    /* Open Menu
    -------------------------------------------------------------------------*/
    var openMbMenu = () => {
        $(".open-mb-menu").on("click", function () {
            $(".offcanvas-menu").addClass("show");
            $("body").toggleClass("overflow-hidden");
        });

        $(".close-mb-menu").on("click", function () {
            $(".offcanvas-menu").removeClass("show");
            $("body").toggleClass("overflow-hidden");
        });
    };
    /* Click Active
    -------------------------------------------------------------------------*/
    var clickActive = () => {
        $(".btn-active").on("mouseenter", function () {
            var $btn = $(this);
            if ($btn.hasClass("active")) {
            } else {
                $(".main-action-active .btn-active").removeClass("active");
                $btn.addClass("active");
            }
        });
    };

    /* Sticky Header
    -------------------------------------------------------------------------*/
    var headerSticky = function () {
        var $header = $("header");
        $(window).on("scroll", function () {
            var scrollTop = $(window).scrollTop();
            if (scrollTop > 100) {
                $header.addClass("is-sticky");
            } else {
                $header.removeClass("is-sticky");
            }
        });
    };

    /* Decode Text Effect
    -------------------------------------------------------------------------*/
    var decodeTextEffect = function () {
        var characters = "0123456789abcdefghijklmnopqrstuvwxyz";
        $(".decode-text").each(function () {
            var $text = $(this);
            var $container = $text.closest(".service-accordion_item");
            var originalText = $text.text();
            var interval = null;

            $container.on("mouseenter", function () {
                var iteration = 0;
                clearInterval(interval);
                interval = setInterval(() => {
                    $text.text(
                        originalText
                            .split("")
                            .map((char, index) => {
                                if (index < iteration) {
                                    return originalText[index];
                                }
                                if (char === " ") return " ";
                                return characters[Math.floor(Math.random() * characters.length)];
                            })
                            .join("")
                    );

                    if (iteration >= originalText.length) {
                        clearInterval(interval);
                    }
                    iteration += 1.5;
                }, 20);
            });

            $container.on("mouseleave", function () {
                clearInterval(interval);
                $text.text(originalText);
            });
        });
    };

    /* Hover Video Cards
    -------------------------------------------------------------------------*/
    var hoverVideoCards = function () {
        $(".hover-video-card").each(function () {
            var $card = $(this);
            var $video = $card.find("video").get(0);

            if ($video) {
                $card.on("mouseenter", function () {
                    $video.play();
                });

                $card.on("mouseleave", function () {
                    $video.pause();
                });
            }
        });
    };

    /* Hover YouTube Video Cards
    -------------------------------------------------------------------------*/
    var hoverYoutubeCards = function () {
        $(".filter-grid-item[data-youtube-id]").each(function () {
            var $card = $(this);
            var youtubeId = $card.attr("data-youtube-id");
            var $imageContainer = $card.find(".blog-image");
            var hoverTimeout;

            if (youtubeId && $imageContainer.length) {
                // Ensure parent position is relative for absolute positioning of iframe
                $imageContainer.css("position", "relative");

                $card.on("mouseenter", function () {
                    // Small delay to prevent loading iframe on quick accidental hovers
                    hoverTimeout = setTimeout(function () {
                        if ($imageContainer.find(".hover-yt-iframe").length === 0) {
                            var iframeHtml = `<iframe class="hover-yt-iframe" src="https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&controls=0&modestbranding=1&loop=1&playlist=${youtubeId}&playsinline=1" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; z-index: 2; pointer-events: none; border-radius: 12px; object-fit: cover;" allow="autoplay; encrypted-media"></iframe>`;
                            $imageContainer.append(iframeHtml);

                            // Fade in effect
                            var $iframe = $imageContainer.find(".hover-yt-iframe");
                            $iframe.css({ opacity: 0, transition: 'opacity 0.4s ease' });
                            setTimeout(() => { $iframe.css('opacity', 1); }, 50);
                        }
                    }, 300);
                });

                $card.on("mouseleave", function () {
                    clearTimeout(hoverTimeout);
                    var $iframe = $imageContainer.find(".hover-yt-iframe");
                    if ($iframe.length) {
                        $iframe.css('opacity', 0);
                        setTimeout(() => { $iframe.remove(); }, 400);
                    }
                });
            }
        });
    };

    // Dom Ready
    $(function () {
        infiniteSlide();
        updateClock();
        cursorTrail();
        goTop();
        // settingColor();
        counterOdo();
        openMbMenu();
        clickActive();
        headerSticky();
        decodeTextEffect();
        hoverVideoCards();
        hoverYoutubeCards();
        itemFiltering();
        videoModal();
    });

    /* Category Filtering
    -------------------------------------------------------------------------*/
    var itemFiltering = function () {
        if ($(".filter-bar").length > 0) {
            $(".filter-item").on("click", function () {
                var filterValue = $(this).attr("data-filter");

                // Update active state
                $(".filter-item").removeClass("active");
                $(this).addClass("active");

                if (filterValue === "all") {
                    const seenIds = new Set();
                    const toShow = [];
                    const toHide = [];

                    $(".filter-grid-item").each(function () {
                        const id = $(this).attr("data-youtube-id");
                        if (id) {
                            if (seenIds.has(id)) {
                                toHide.push(this);
                            } else {
                                seenIds.add(id);
                                toShow.push(this);
                            }
                        } else {
                            toShow.push(this);
                        }
                    });

                    if (toHide.length > 0) {
                        gsap.to(toHide, {
                            autoAlpha: 0,
                            scale: 0.95,
                            y: 20,
                            duration: 0.3,
                            ease: "power2.in",
                            onComplete: function () {
                                $(this.targets()).css("display", "none");
                            }
                        });
                    }

                    gsap.to(toShow, {
                        autoAlpha: 1,
                        scale: 1,
                        y: 0,
                        duration: 0.6,
                        delay: toHide.length > 0 ? 0.2 : 0,
                        stagger: {
                            each: 0.05,
                            from: "start",
                            grid: "auto"
                        },
                        ease: "power2.out",
                        onStart: function () {
                            $(this.targets()).css("display", "block");
                        }
                    });
                } else {
                    const $toShow = $(`.filter-grid-item[data-category="${filterValue}"]`);
                    const $toHide = $(`.filter-grid-item:not([data-category="${filterValue}"])`);

                    gsap.to($toHide, {
                        autoAlpha: 0,
                        scale: 0.95,
                        y: 20,
                        duration: 0.3,
                        ease: "power2.in",
                        onComplete: function () {
                            $(this.targets()).css("display", "none");
                        }
                    });

                    gsap.to($toShow, {
                        autoAlpha: 1,
                        scale: 1,
                        y: 0,
                        duration: 0.6,
                        delay: 0.2, // Small delay for the hide to start
                        stagger: 0.05,
                        ease: "power2.out",
                        onStart: function () {
                            $(this.targets()).css("display", "block");
                        }
                    });
                }
            });

            // Trigger the active filter immediately on load to handle duplicate hiding for the "All" view
            // Use a slight timeout to ensure DOM and GSAP are fully ready
            setTimeout(function () {
                $(".filter-item.active").trigger("click");
            }, 100);
        }
    };

    /* YouTube Video Modal
    -------------------------------------------------------------------------*/
    var videoModal = function () {
        const $modal = $("#videoModal");
        const $container = $("#videoContainer");
        const $close = $("#closeModal");

        $(document).on("click", ".article-blog[data-youtube-id]", function () {
            const youtubeId = $(this).data("youtube-id");
            if (youtubeId) {
                const iframeHtml = `<iframe src="https://www.youtube.com/embed/${youtubeId}?autoplay=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
                $container.html(iframeHtml);
                $modal.addClass("show");
                $("body").addClass("overflow-hidden");
            }
        });

        const closeModal = function () {
            $modal.removeClass("show");
            $container.html("");
            $("body").removeClass("overflow-hidden");
        };

        $close.on("click", closeModal);

        $modal.on("click", function (e) {
            if ($(e.target).is($modal)) {
                closeModal();
            }
        });

        $(document).on("keydown", function (e) {
            if (e.key === "Escape" && $modal.hasClass("show")) {
                closeModal();
            }
        });
    };

    /* Custom Selected Work YouTube Video Modal
    -------------------------------------------------------------------------*/
    var customVideoModal = function () {
        const $customModal = $("#customVideoModal");
        const $customContainer = $("#videoIframeContainer");
        const $customClose = $("#closeVideoModal");

        $(document).on("click", ".js-open-video-modal", function (e) {
            e.preventDefault();
            const youtubeUrl = $(this).data("youtube-url");

            if (youtubeUrl) {
                // Determine if we need to append ?autoplay=1 or &autoplay=1
                const autoplayParam = youtubeUrl.includes("?") ? "&autoplay=1" : "?autoplay=1";
                const embedUrl = youtubeUrl + autoplayParam;

                const iframeHtml = `<iframe width="100%" height="100%" src="${embedUrl}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;

                $customContainer.html(iframeHtml);
                $customModal.addClass("show");
                $("body").addClass("overflow-hidden");

                // Pause any background videos while modal is open
                $("video").each(function () {
                    $(this).get(0).pause();
                });
            }
        });

        const closeCustomModal = function () {
            $customModal.removeClass("show");
            $customContainer.html(""); // Erase iframe to stop playback instantly
            $("body").removeClass("overflow-hidden");
        };

        $customClose.on("click", closeCustomModal);

        $customModal.on("click", function (e) {
            // Close if clicking the overlay, not the content
            if ($(e.target).is($customModal) || $(e.target).hasClass("video-modal-content")) {
                closeCustomModal();
            }
        });

        $(document).on("keydown", function (e) {
            if (e.key === "Escape" && $customModal.hasClass("show")) {
                closeCustomModal();
            }
        });
    };

    // Initialize custom modal (add to Dom Ready if needed, or self-initialize)
    $(function () {
        customVideoModal();
    });


})(jQuery);
