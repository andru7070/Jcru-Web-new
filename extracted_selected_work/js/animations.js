(function ($) {
    "use strict";

    var stackElement = function () {
        if ($(".stack-element").length > 0) {
            let scrollTriggerInstances = [];

            const updateTotalHeight = () => {
                const containerHeight = $(".stack-element-main").outerHeight();

                scrollTriggerInstances.forEach((instance) => instance.kill());
                scrollTriggerInstances = [];

                const elements = document.querySelectorAll(".element:not(:last-child)");

                elements.forEach((element, index) => {
                    const elementHeight = element.offsetHeight;

                    const pinTrigger = ScrollTrigger.create({
                        trigger: element,
                        scrub: 1,
                        start: "top top+=30",
                        end: `+=${containerHeight - elementHeight}`,
                        pin: true,
                        pinSpacing: false,
                        animation: gsap.to(element, {
                            scale: 0.9,
                            opacity: 0,
                        }),
                    });

                    scrollTriggerInstances.push(pinTrigger);
                });
            };

            updateTotalHeight();

            let resizeTimeout;
            window.addEventListener("resize", () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(updateTotalHeight, 150);
            });
        }
    };

    var scrollEffectFade = () => {
        if ($(".effectFade").length) {
            gsap.registerPlugin(ScrollTrigger);

            document.querySelectorAll(".effectFade").forEach((el) => {
                let fromVars = { autoAlpha: 0 };
                let toVars = { autoAlpha: 1, duration: 1, ease: "power3.out" };
                let wrapper = null;
                let startPush = "top 95%";
                let delay = el.dataset.delay ? parseFloat(el.dataset.delay) : 0;
                toVars.delay = delay;

                if (el.classList.contains("fadeUp") && !el.classList.contains("no-div")) {
                    wrapper = document.createElement("div");
                    wrapper.classList.add("overflow-hidden");
                    el.parentNode.insertBefore(wrapper, el);
                    wrapper.appendChild(el);
                }

                if (el.classList.contains("no-div")) {
                    wrapper = null;
                }
                if (el.classList.contains("fadeUp")) {
                    fromVars.y = 50;
                    toVars.y = 0;
                } else if (el.classList.contains("fadeDown")) {
                    fromVars.y = -50;
                    toVars.y = 0;
                } else if (el.classList.contains("fadeLeft")) {
                    fromVars.x = -50;
                    toVars.x = 0;
                } else if (el.classList.contains("fadeRight")) {
                    fromVars.x = 50;
                    toVars.x = 0;
                } else if (el.classList.contains("fadeRotateX")) {
                    fromVars.rotationX = 45;
                    fromVars.yPercent = 100;
                    fromVars.transformOrigin = "top center -50";
                    toVars.rotationX = 0;
                    toVars.yPercent = 0;
                    toVars.transformOrigin = "top center -50";
                    toVars.duration = 1;
                    toVars.ease = "power3.out";
                    if (wrapper) {
                        wrapper.style.perspective = "400px";
                    }
                } else if (el.classList.contains("fadeZoom")) {
                    fromVars.scale = 0.8;
                    toVars.scale = 1;
                }

                if (el.classList.contains("view-visible")) {
                    startPush = "top 101%";
                }

                gsap.set(el, fromVars);

                gsap.to(el, {
                    ...toVars,
                    scrollTrigger: {
                        trigger: el,
                        start: startPush,
                        toggleActions: "play none none none",
                    },
                });
            });
        }
    };

    // Expose functions globally or initialize them here if preferred
    window.initSelectedWorkAnimations = function () {
        stackElement();
        scrollEffectFade();
    };

})(jQuery);
