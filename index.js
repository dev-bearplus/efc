const script = () => {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.defaults({
        invalidateOnRefresh: true
    });

    const cvUnit = (val, unit) => {
        let result;
        switch (true) {
            case unit === 'vw':
                result = window.innerWidth * (val / 100);
                break;
            case unit === 'vh':
                result = window.innerHeight * (val / 100);
                break;
            case unit === 'rem':
                result = val / 10 * parseFloat($('html').css('font-size'));
                break;
            default: break;
        }
        return result;
    }
    const viewport = {
		get w() {
			return window.innerWidth;
		},
		get h() {
			return window.innerHeight;
		},
    }
    const device = { desktop: 991, tablet: 767, mobile: 479 }

    const debounce = (func, timeout = 300) => {
        let timer

        return (...args) => {
            clearTimeout(timer)
            timer = setTimeout(() => { func.apply(this, args) }, timeout)
        }
    }
    const isInViewport = (el, orientation = 'vertical') => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        if (orientation == 'horizontal') {
                return (
                    rect.left <= (window.innerWidth) &&
                    rect.right >= 0
                );
        } else {
                return (
                    rect.top <= (window.innerHeight) &&
                    rect.bottom >= 0
                );
        }
    }
    const refreshOnBreakpoint = () => {
        const breakpoints = Object.values(device).sort((a, b) => a - b);
        const initialViewportWidth = window.innerWidth || document.documentElement.clientWidth;
        const breakpoint = breakpoints.find(bp => initialViewportWidth < bp) || breakpoints[breakpoints.length - 1];
        window.addEventListener('resize', debounce(function () {
            const newViewportWidth = window.innerWidth || document.documentElement.clientWidth;
            if ((initialViewportWidth < breakpoint && newViewportWidth >= breakpoint) ||
                (initialViewportWidth >= breakpoint && newViewportWidth < breakpoint)) {
                location.reload();
            }
        }));
    }
    const documentHeightObserver = (() => {
        let previousHeight = document.documentElement.scrollHeight;
        let resizeObserver;
        let debounceTimer;

        function refreshScrollTrigger() {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                const currentHeight = document.documentElement.scrollHeight;

                if (currentHeight !== previousHeight) {
                    console.log("Document height changed. Refreshing ScrollTrigger...");
                    ScrollTrigger.refresh();
                    previousHeight = currentHeight;
                }
            }, 200); // Adjust the debounce delay as needed
        }

        return (action) => {
            if (action === "init") {
                console.log("Initializing document height observer...");
                resizeObserver = new ResizeObserver(refreshScrollTrigger);
                resizeObserver.observe(document.documentElement);
            }
            else if (action === "disconnect") {
                console.log("Disconnecting document height observer...");
                if (resizeObserver) {
                    resizeObserver.disconnect();
                }
            }
        };
    })();
    const getAllScrollTrigger = (fn) => {
        let triggers = ScrollTrigger.getAll();
        triggers.forEach(trigger => {
            if (fn === "refresh") {
                if (trigger.progress === 0) {
                    trigger[fn]?.();
                }
            } else {
                trigger[fn]?.();
            }
        });
    };
    const childSelect = (parent) => {
        return (child) => child ? $(parent).find(child) : parent;
    }
    const swiper = {
        setup: (parent, options = {}) => {
            return new Swiper(parent('.swiper').get(), {
                slidesPerView: options.onView || 1,
                spaceBetween: options.spacing || 0,
                allowTouchMove: options.touchMove || false,
                navigation: options.nav ? ({
                    nextEl: parent('.next').get(),
                    prevEl: parent('.prev').get(),
                    disabledClass: "disabled"
                }) : false,
                ...options,
                on: options.on
            })
        },
        changeCurrentItem: (parent, index, callback) => {
            parent(".curr-item").html(index);
            if (callback) callback();
        },
        initTotalSlide: (parent) => {
            let totalSlide = parent(".swiper-slide").length;
            parent(".total-slide").html(totalSlide);
        },
        initPagination: (parent) => {
            let totalSlide = parent(".swiper-slide").length;
            let paginationItem = parent('.bp-swiper-pagi-item');
            gsap.set(paginationItem, { width: `${100 / totalSlide}%`, left: 0 });
        },
        activePagination: (parent, index) => {
            let activeLine = parent('.bp-swiper-pagi-item')
            gsap.to(activeLine, { x: index * activeLine.width(), duration: 0.3, ease: 'expo' })
        },
        initClassName: (parent) => {
            parent('[data-swiper]').each((_, item) => {
                if ($(item).attr('data-swiper') == 'swiper')
                    $(item).addClass('swiper')
                else
                    $(item).addClass(`swiper-${$(item).attr('data-swiper')}`)
            })
        }
    };
    function resetScroll() {
        if (window.location.hash !== '') {
            if ($(window.location.hash).length >= 1) {
                $("html").animate({ scrollTop: $(window.location.hash).offset().top - 100 }, 1200);

                setTimeout(() => {
                    $("html").animate({ scrollTop: $(window.location.hash).offset().top - 100 }, 1200);
                }, 300);
            } else {
                scrollTop()
            }
        } else if (window.location.search !== '') {
            let searchObj = JSON.parse('{"' + decodeURI(location.search.substring(1)).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}')
            if (searchObj.sc) {
                if ($(`#${searchObj.sc}`).length >= 1) {
                    let target = `#${searchObj.sc}`;
                    setTimeout(() => {
                        smoothScroll.scrollTo(`#${searchObj.sc}`, {
                            offset: -100
                        })
                    }, 500);
                } else {
                    scrollTop()
                }
            }
        } else {
            scrollTop()
        }
    };
    function scrollTop(onComplete) {
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
        window.scrollTo(0, 0);
        smoothScroll.scrollToTop({
            onComplete: () => {
                onComplete?.();
                getAllScrollTrigger("refresh");
            }
        });
    }
    class ParallaxImage {
        constructor({ el, scaleOffset = 0.1 }) {
            this.el = el;
            this.elWrap = null;
            this.scaleOffset = scaleOffset;
            this.init();
        }
        init() {
            this.elWrap = this.el.parentElement;
            this.setup();
        }
        setup() {
            const scalePercent = 100 + 5 + ((this.scaleOffset - 0.1) * 100);
            gsap.set(this.el, {
                width: scalePercent + '%',
                height: $(this.el).hasClass('img-fill') ? scalePercent + '%' : 'auto'
            });
            this.scrub();
        }
        scrub() {
            let dist = this.el.offsetHeight - this.elWrap.offsetHeight;
            let total = this.elWrap.getBoundingClientRect().height + window.innerHeight;
            this.updateOnScroll(dist, total);
            smoothScroll.lenis.on('scroll', () => {
                this.updateOnScroll(dist, total);
            });
        }
        updateOnScroll(dist, total) {
            if (this.el) {
                if (isInViewport(this.elWrap)) {
                    let percent = this.elWrap.getBoundingClientRect().top / total;
                    gsap.quickSetter(this.el, 'y', 'px')(-dist * percent * 1.2);
                    gsap.set(this.el, { scale: 1 + (percent * this.scaleOffset) });
                }
            }
        }
    }
    class SmoothScroll {
		constructor() {
			this.lenis = null;
			this.scroller = {
				scrollX: window.scrollX,
				scrollY: window.scrollY,
				velocity: 0,
				direction: 0,
			};
			this.lastScroller = {
				scrollX: window.scrollX,
				scrollY: window.scrollY,
				velocity: 0,
				direction: 0,
			};
		}

		init() {
			this.reInit();

			$.easing.lenisEase = function (t) {
				return Math.min(1, 1.001 - Math.pow(2, -10 * t));
			};

			gsap.ticker.add((time) => {
				if (this.lenis) {
					this.lenis.raf(time * 1000);
				}
			});
			gsap.ticker.lagSmoothing(0);
		}

		reInit() {
			if (this.lenis) {
				this.lenis.destroy();
			}
			this.lenis = new Lenis();
			this.lenis.on("scroll", (e) => {
				this.updateOnScroll(e);
				ScrollTrigger.update();
			});
		}
		reachedThreshold(threshold) {
			if (!threshold) return false;
			const dist = distance(
				this.scroller.scrollX,
				this.scroller.scrollY,
				this.lastScroller.scrollX,
				this.lastScroller.scrollY
			);

			if (dist > threshold) {
				this.lastScroller = { ...this.scroller };
				return true;
			}
			return false;
		}

		updateOnScroll(e) {
			this.scroller.scrollX = e.scroll;
			this.scroller.scrollY = e.scroll;
			this.scroller.velocity = e.velocity;
            this.scroller.direction = e.direction;
            if (header) {
                header.updateOnScroll(this.lenis);
            }
		}

		start() {
			if (this.lenis) {
				this.lenis.start();
			}
			$(".body").css("overflow", "initial");
		}

		stop() {
			if (this.lenis) {
				this.lenis.stop();
			}
			$(".body").css("overflow", "hidden");
		}

		scrollTo(target, options = {}) {
			if (this.lenis) {
				this.lenis.scrollTo(target, options);
			}
		}

		scrollToTop(options = {}) {
            if (this.lenis) {
                this.lenis.scrollTo("top", { duration: .0001, immediate: true, lock: true, ...options });
            }
		}

		destroy() {
			if (this.lenis) {
				gsap.ticker.remove((time) => {
					this.lenis.raf(time * 1000);
				});
				this.lenis.destroy();
				this.lenis = null;
			}
		}
	}
	const smoothScroll = new SmoothScroll();
    smoothScroll.init();

    class TriggerSetup extends HTMLElement {
        constructor() {
            super();
            this.tlTrigger = null;
            this.onTrigger = () => { };
        }
        connectedCallback() {
            this.tlTrigger = gsap.timeline({
                scrollTrigger: {
                    trigger: $(this).find('section'),
                    start: 'top bottom+=50%',
                    end: 'bottom top-=50%',
                    once: true,
                    onEnter: () => {
                        this.onTrigger?.();
                    }
                }
            });
        }
        destroy() {
            if (this.tlTrigger) {
                this.tlTrigger.kill();
                this.tlTrigger = null;
            }
        }
    }

    class Header {
        constructor() {
            this.el = null;
            this.isOpen = false;
        }
        init(data) {
            this.el = document.querySelector('.header');
            if (viewport.w <= 991) {
                this.toggleNav();
            }
        }
        updateOnScroll(inst) {
            this.toggleHide(inst);
            this.toggleScroll(inst);
        }
        toggleScroll(inst) {
            if (inst.scroll > cvUnit(44, 'rem')) $(this.el).addClass("on-scroll");
            else $(this.el).removeClass("on-scroll");
        }
        toggleHide(inst) {
            if (inst.direction == 1) {
                if (inst.scroll > ($(this.el).height() * 3)) {
                    $(this.el).addClass('on-hide');
                }
            } else if (inst.direction == -1) {
                if (inst.scroll > ($(this.el).height() * 3)) {
                    $(this.el).addClass("on-hide");
                    $(this.el).removeClass("on-hide");
                }
            }
            else {
                $(this.el).removeClass("on-hide");
            }
        }
        toggleNav() {
            $(this.el).find('.header-toggle').on('click', this.handleClick.bind(this));
            $(this.el).find('.header-link, .header-logo, .header-btn').on('click', () => setTimeout(() => this.close(), 800));
        }
        handleClick(e) {
            e.preventDefault();
            this.isOpen ? this.close() : this.open();
        }
        open() {
            if (this.isOpen) return;
            $(this.el).addClass('on-open-nav');
            $(this.el).find('.header-toggle').addClass('active');
            const $mobileMenu = $(this.el).find('.header-act-mobile');
            gsap.fromTo($mobileMenu,
                { height: 0, opacity: 0 },
                { height: 'auto', opacity: 1, duration: 0.3, ease: 'power2.out' }
            );
            $mobileMenu.addClass('active');
            this.isOpen = true;
            // smoothScroll.lenis.stop();
        }
        close() {
            if (!this.isOpen) return;
            // $(this.el).removeClass('on-open-nav');
            // $(this.el).find('.header-toggle').removeClass('active');
            const $mobileMenu = $(this.el).find('.header-act-mobile');
            $mobileMenu.removeClass('active');
            gsap.to($mobileMenu, {
                height: 0,
                opacity: 0,
                duration: 0.3,
                ease: 'power2.in',
                onComplete: () => {
                    $(this.el).removeClass('on-open-nav');
                    $(this.el).find('.header-toggle').removeClass('active');
                }
            });
            this.isOpen = false;
            // smoothScroll.lenis.start();
        }
    }
    const header = new Header();
    header.init();

    const HomePage = {
        'home-hero-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    this.animationReveal();
                    this.animationScrub();
                    this.interact();
                };
            }
            animationReveal() {
                console.log('animationReveal');

            }
            animationScrub() {
            }
            interact() {
            }
            destroy() {
                super.destroy();
            }
        },
        'home-grow-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    this.animationReveal();
                    this.animationScrub();
                    this.interact();
                };
            }
            animationReveal() {
            }
            animationScrub() {
            }
            interact() {
                this.growSwiperEvent();
                this.setupReadMoreClamp();
            }
            growSwiperEvent() {
                $('.home-grow-list').css('gap', 0);
                let growSwiperEvent = new Swiper(".home-grow-cms", {
                    slidesPerView: "auto",
                    spaceBetween: cvUnit(10, 'rem'),
                    navigation: {
                        prevEl: ".home-grow-control-navi-item.prev",
                        nextEl: ".home-grow-control-navi-item.next",
                    },
                    pagination: {
                        el: '.home-grow-content-pagi',
                        bulletClass: 'home-grow-content-pagi-item',
                        bulletActiveClass: 'active',
                        clickable: true,
                    }
                });
                growSwiperEvent.slideTo(1);
            }
            setupReadMoreClamp() {
                const items = $(this).find('.home-grow-item');

                items.each((_, item) => {
                    const $item = $(item);
                    const $description = $item.find('.home-grow-item-content-description');
                    const $toggle = $item.find('.home-grow-item-link-read-more, .link-read-more').first();
                    const $toggleText = $toggle.find('.txt');

                    if (!$description.length || !$toggle.length) return;

                    const setState = (isExpanded) => {
                        if (isExpanded) {
                            $description.addClass('is-expanded');
                            $toggle.addClass('is-expanded');
                            $toggleText.text('Show less');
                        } else {
                            $description.removeClass('is-expanded');
                            $toggle.removeClass('is-expanded');
                            $toggleText.text('Read more');
                        }
                    };

                    setState($description.hasClass('is-expanded'));

                    $toggle.off('click.readMoreToggle').on('click.readMoreToggle', (e) => {
                        e.preventDefault();
                        setState(!$description.hasClass('is-expanded'));
                    });
                });
            }
            destroy() {
                super.destroy();
            }
        },
        'home-spending-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    this.animationReveal();
                    this.animationScrub();
                    this.interact();
                };
            }
            animationReveal() {
                console.log('animationReveal1');

            }
            animationScrub() {
            }
            interact() {
                console.log('interact');

                const swiperSpending = () => {
                    const parent = childSelect('.home-spending-list-swiper');
                    swiper.initClassName(parent);
                    // swiper.setup(parent, {
                    //     spacing: 100,
                    //     speed: 900,
                    //     effect: "slide",
                    //     centeredSlides: true,
                    //     loop: true,
                    //     touchMove: true,
                    //     nav: true,
                    //     breakpoints: {
                    //         768: {
                    //             slidesPerView: 'auto',
                    //         }
                    //     },
                    // })
                }
                // console.log(viewport.w, device.tablet);
                if(viewport.w < device.tablet) {
                    console.log('tesSwiperSpending');
                    swiperSpending();
                }
            }

            destroy() {
                super.destroy();
            }
        },
        'home-questions-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    this.animationReveal();
                    this.animationScrub();
                    this.interact();
                };
            }
            animationReveal() {
            }
            animationScrub() {
            }
            interact() {
                const accordionItems = $(this).find('.accordion');
                const animationDuration = 400;

                accordionItems.on('click', '.accordion-title', (e) => {
                    e.preventDefault();
                    const $clickedAccordion = $(e.currentTarget).closest('.accordion');
                    const isActive = $clickedAccordion.hasClass('active');
                    const $targetContent = $clickedAccordion.find('.accordion-content');

                    accordionItems.not($clickedAccordion).removeClass('active');
                    accordionItems.not($clickedAccordion).find('.accordion-content').stop(true, false).slideUp(animationDuration);
                    if (isActive) {
                        $clickedAccordion.removeClass('active');
                        $targetContent.stop(true, false).slideUp(animationDuration);
                    } else {
                        $clickedAccordion.addClass('active');
                        $targetContent.stop(true, false).slideDown(animationDuration);
                    }
                });
                accordionItems.not('.active').find('.accordion-content').hide();
            }
            destroy() {
                super.destroy();
            }
        },
    }
    class PageManager {
        constructor(page) {
            if (!page || typeof page !== 'object') {
                throw new Error('Invalid page configuration');
            }
            // Store registered component names to prevent duplicate registration
            this.registeredComponents = new Set();

            this.sections = Object.entries(page).map(([name, Component]) => {
                if (typeof Component !== 'function') {
                    throw new Error(`Section "${name}" must be a class constructor`);
                }

                // Only register the custom element if not already registered
                if (!this.registeredComponents.has(name)) {
                    try {
                        customElements.define(name, Component);
                        this.registeredComponents.add(name);
                    } catch (error) {
                        // Handle case where element is already defined
                        console.warn(`Custom element "${name}" is already registered`);
                    }
                }

                return new Component();
            });
        }

        // Method to cleanup sections if needed
        destroy() {
            this.sections.forEach(section => {
                if (typeof section.destroy === 'function') {
                    section.destroy();
                }
            });
        }
    }
    const pageName = $('.main-inner').attr('data-namespace');
    const pageConfig = {
        home: HomePage
    };
    const registry = {};
    registry[pageName]?.destroy();

    documentHeightObserver("init");
    refreshOnBreakpoint();
    scrollTop(() => pageConfig[pageName] && (registry[pageName] = new PageManager(pageConfig[pageName])));
}
window.onload = script
