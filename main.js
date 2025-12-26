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
    const pointer = {
        x: $(window).width() / 2,
        y: $(window).height() / 2,
        xNor: $(window).width() / 2 / $(window).width(),
        yNor: $(window).height() / 2 / $(window).height(),
      };
      const xSetter = (el) => gsap.quickSetter(el, "x", `px`);
      const ySetter = (el) => gsap.quickSetter(el, "y", `px`);
      const xGetter = (el) => gsap.getProperty(el, "x");
      const yGetter = (el) => gsap.getProperty(el, "y");
      const lerp = (a, b, t = 0.08) => {
        return a + (b - a) * t;
      };
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
    const isTouchDevice = () => {
        return (
          "ontouchstart" in window ||
          navigator.maxTouchPoints > 0 ||
          navigator.msMaxTouchPoints > 0
        );
      };
    if (!isTouchDevice()) {
    $("html").attr("data-has-cursor", "true");
    window.addEventListener("pointermove", function (e) {
        updatePointer(e);
    });
    } else {
    $("html").attr("data-has-cursor", "false");
    window.addEventListener("pointerdown", function (e) {
        updatePointer(e);
    });
    }
    function updatePointer(e) {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.xNor = (e.clientX / $(window).width() - 0.5) * 2;
    pointer.yNor = (e.clientY / $(window).height() - 0.5) * 2;
    if (cursor.userMoved != true) {
        cursor.userMoved = true;
        cursor.init();
    }
    }
    class Marquee {
        constructor(list, item, duration = 40, direction) {
           this.list = list;
           this.item = item;
           this.duration = duration;
           this.direction = direction || 'left';
        }
        setup() {
           let itemWidth = this.item.width();
           const windowWidth = $(window).width();
           console.log(itemWidth, windowWidth);
           if (!itemWidth || itemWidth <= 0 || !windowWidth || windowWidth <= 0) {
              return;
           }
           const cloneAmount = Math.ceil(windowWidth / itemWidth) + 1;
           if (!Number.isFinite(cloneAmount) || cloneAmount <= 0 || cloneAmount > 1000) {
              return;
           }
  
           let itemClone = this.item.clone();
           this.list.html('');
           new Array(cloneAmount).fill().forEach(() => {
              let html = itemClone.clone()
              html.css('animation-duration', `${Math.ceil(itemWidth / this.duration)}s`);
              if(this.direction == 'left') {
                 html.addClass('marquee-left');
              } else {
                 html.addClass('marquee-right');
              }
              this.list.append(html);
           });
        }
        play() {
           if(this.direction == 'left') {
              $(this.list).find('.marquee-left').addClass('anim');
           } else {
              $(this.list).find('.marquee-right').addClass('anim');
           }
        }
    }
    class Loading {
        constructor() {}
        isDoneLoading() {
          return true;
        }
      }
    let load = new Loading();
    class Cursor {
    constructor() {
        this.targetX = pointer.x;
        this.targetY = pointer.y;
        this.userMoved = false;
        xSetter(".cursor-main")(this.targetX);
        ySetter(".cursor-main")(this.targetY);
    }
    init() {
        requestAnimationFrame(this.update.bind(this));
        $(".cursor-main .cursor-inner").addClass("active");
    }
    isUserMoved() {
        return this.userMoved;
    }
    update() {
        if (this.userMoved || load.isDoneLoading()) {
        this.updatePosition();
        }
        requestAnimationFrame(this.update.bind(this));
    }
    updateHtml () {
        $('[data-cursor="bg"]').each((idx, el) => {
            let bg = '--cl-' + ($(el).attr('data-bg')  || 'white')
            $(el).find('.txt, .heading').css({
                'position': 'relative',
                'z-index': '2'
            })
            $(el).find('.ic-embed:not(.ic-arr-main):not(.ic-arr-clone)').css({
                'position': 'relative',
                'z-index': '2'
            })
            let btnDot = $(document.createElement('div')).addClass('bg-dot');
            let btnDotInner = $(document.createElement('div')).addClass('bg-dot-inner').css('background-color', `var(${bg})`);
            btnDot.append(btnDotInner)
            $(el).append(btnDot)
        })
    }
    updatePosition() {
        this.targetX = pointer.x;
        this.targetY = pointer.y;
        let targetInnerX = xGetter(".cursor-main");
        let targetInnerY = yGetter(".cursor-main");

        if ($("[data-cursor]:hover").length) {
        this.onHover();
        } else {
        this.reset();
        }

        if (
        Math.hypot(this.targetX - targetInnerX, this.targetY - targetInnerY) >
            1 ||
        Math.abs(smoothScroll.lenis.velocity) > 0.1
        ) {
        xSetter(".cursor-main")(lerp(targetInnerX, this.targetX, 0.1));
        ySetter(".cursor-main")(
            lerp(targetInnerY, this.targetY - smoothScroll.lenis.velocity / 16, 0.1)
        );
        }
        ['blue', 'black'].forEach(color => {
        const inSectionColor = $(`[data-section="${color}"]`).toArray().some(el => this.isMouseInSection(el));
        if(inSectionColor) {
            $('.cursor-inner').addClass(`on-${color}`);
        } else {
            $('.cursor-inner').removeClass(`on-${color}`);
        }
        });
        if ($('[data-cursor="drag"]:hover').length) {
        const midX = viewport.w / 2;
        let controlPrev = $('[data-cursor="drag"]:hover').attr('data-control-prev');
        let controlNext = $('[data-cursor="drag"]:hover').attr('data-control-next');
        if (pointer.x > midX) {
            // Bên phải -> prev
            $(".cursor").removeClass("left").addClass("right");
            if ($(`.${controlNext}`).hasClass("swiper-button-disabled")) {
            $(".cursor").addClass("disabled");
            } else {
            $(".cursor").removeClass("disabled");
            }
        } else {
            // Bên trái -> next
            $(".cursor").removeClass("right").addClass("left");
        
            if ($(`.${controlPrev}`).hasClass("swiper-button-disabled")) {
            $(".cursor").addClass("disabled");
            } else {
            $(".cursor").removeClass("disabled");
            }
        }
        } else {
        $(".cursor").removeClass("left right disabled");
        }      
    }
    isMouseInSection(el) {
        const rect = el.getBoundingClientRect();
        return (
        pointer.x >= rect.left &&
        pointer.x <= rect.right &&
        pointer.y >= rect.top &&
        pointer.y <= rect.bottom
        );
    }
    
    onHover() {
        let type = $("[data-cursor]:hover").attr("data-cursor");
        let gotBtnSize = false;
        if ($("[data-cursor]:hover").length) {
        switch (type) {
            case "hidden":
                $(".cursor").addClass("on-hover-hidden");
                break;
            case 'bg':
                $('.cursor').addClass('on-hover-hidden');
                let targetBg;
                targetBg = $('[data-cursor="bg"]:hover')
                this.targetX = targetBg.get(0).getBoundingClientRect().left + targetBg.get(0).getBoundingClientRect().width / 2;
                this.targetY = targetBg.get(0).getBoundingClientRect().top + targetBg.get(0).getBoundingClientRect().height / 2;
                let bgDotX, bgDotY;
                if (!gotBtnSize) {
                    if ($('[data-cursor]:hover').hasClass('home-ser-item-btn')) {
                        gsap.set('html', {'--cursor-width': targetBg.get(0).getBoundingClientRect().width + cvUnit(130, 'rem'), '--cursor-height': targetBg.get(0).getBoundingClientRect().height + cvUnit(130, 'rem')})
                    } else if ($('[data-cursor]:hover').hasClass('sm-menu')) {  
                        gsap.set('html', {'--cursor-width': targetBg.get(0).getBoundingClientRect().width * 1.6, '--cursor-height': targetBg.get(0).getBoundingClientRect().height * 1.3})
                    } else {
                        gsap.set('html', {'--cursor-width': targetBg.get(0).getBoundingClientRect().width*1.4, '--cursor-height': targetBg.get(0).getBoundingClientRect().height*1.4})
                    }

                    bgDotX = (pointer.x - targetBg.get(0).getBoundingClientRect().left)
                    bgDotY = (pointer.y - targetBg.get(0).getBoundingClientRect().top)
                    xSetter('[data-cursor]:hover .bg-dot')(lerp(bgDotX, (pointer.x - targetBg.get(0).getBoundingClientRect().left)), .12)
                    ySetter('[data-cursor]:hover .bg-dot')(lerp(bgDotY, (pointer.y - targetBg.get(0).getBoundingClientRect().top)), .12)
                    gotBtnSize = true
                } else {
                    bgDotX = xGetter('[data-cursor]:hover .bg-dot')
                    bgDotY = yGetter('[data-cursor]:hover .bg-dot')
                    xSetter('[data-cursor]:hover .bg-dot')(lerp(bgDotX, (pointer.x - targetBg.get(0).getBoundingClientRect().left)), .12)
                    ySetter('[data-cursor]:hover .bg-dot')(lerp(bgDotY, (pointer.y - targetBg.get(0).getBoundingClientRect().top)), .12)
                }

                break;
            case "txtLink":
                $(".cursor-inner").addClass("on-hover-sm");
                let targetEl;
                if (
                    $("[data-cursor]:hover").attr("data-cursor-txtLink") == "parent"
                ) {
                    targetEl = $("[data-cursor]:hover").parent();
                } else if (
                    $("[data-cursor]:hover").attr("data-cursor-txtLink") == "child"
                ) {
                    targetEl = $("[data-cursor]:hover").find(
                    "[data-cursor-txtLink-child]"
                    );
                } else {
                    targetEl = $("[data-cursor]:hover");
                }

                let targetGap = cvUnit(8, 'rem');
                this.targetX =
                targetEl.get(0).getBoundingClientRect().left;
                $('[data-cursor]:hover .txt').css('transform', `translateX(${targetGap + $(".cursor-inner.on-hover-sm").width()}px)`)
                this.targetY =
                    targetEl.get(0).getBoundingClientRect().top +
                    targetEl.get(0).getBoundingClientRect().height / 2;
                break;
            default:
                break;
        }
        } else {
        gotBtnSize = false;
        }
    }
    reset() {
        $(".cursor").removeClass("on-hover-hidden");
        $('[data-cursor] .txt').css('transform', 'translateX(0px)')
    }
    }
    let cursor = new Cursor();
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
            this.listDependent = [];
        }
        init(data) {
            this.el = document.querySelector('.header');
            if (viewport.w <= 991) {
                this.interact();
            }
        }
        updateOnScroll(inst) {
            this.toggleHide(inst);
            this.toggleScroll(inst);
            this.onHideDependent(inst);
        }
        onHideDependent() {
            let heightHeader = $(this.el).outerHeight();
            if(!$(this.el).hasClass('on-hide')) {
               this.listDependent.forEach((item) => {
                  $(item).css('top', heightHeader);
               });
            } else {
               this.listDependent.forEach((item) => {
                  $(item).css('top', 0);
               });
            }
        }
        registerDependent(dependentEl) {
        this.listDependent.push(dependentEl);
        }
        unregisterDependent(dependentEl) {
        if (this.listDependent.includes(dependentEl)) {
            this.listDependent = this.listDependent.filter((item) => item !== dependentEl);
        }
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
        interact() {
            if(viewport.w <= 991) {
                $(this.el).find('.header-toggle').on('click', (e)=>{
                    e.preventDefault();
                    $(e.currentTarget).toggleClass('active');
                    $(this.el).find('.header-menu').toggleClass('active');
                });
                $(window).on('click', (e) => {
                    if (!$(e.target).closest('.header-toggle').length && !$(e.target).closest('.header-menu').length) {
                    $(this.el).find('.header-toggle').removeClass('active');
                    $(this.el).find('.header-menu').removeClass('active');
                    }
                });
                $('.header-menu-item-wrap.parent').on('click','.header-menu-item', (e)=>{
                    e.preventDefault();
                    $(e.currentTarget).closest('.header-menu-item-wrap').toggleClass('active');
                    $(e.currentTarget).closest('.header-menu-item-wrap').find('.header-menu-sub-wrap').slideToggle();
                });
                $('.header-lang').on('click', (e)=>{
                    e.preventDefault();
                    $(e.currentTarget).closest('.header-lang-wrap').find('.header-lang-dropdown').toggleClass('active');
                    $(e.currentTarget).toggleClass('active');
                });
                $(window).on('click', (e) => {
                    if (!$(e.target).closest('.header-lang-wrap').length) {
                        $(e.currentTarget).removeClass('active');
                        $(this.el).find('.header-lang-dropdown').removeClass('active');
                    }
                });
            }
        }
    }
    const header = new Header();
    header.init();

    const HomePage = {
        'home-trust-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    this.animationReveal();
                };
            }
            animationReveal() {
                 let marquee = new Marquee($('.home-trust-logo-main'), $('.home-trust-logo-list'), 40);
                 marquee.setup();
                 marquee.play();
            }
        },
        'home-testi-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    this.animationReveal();
                    this.animationScrub();
                    this.interact();
                };
            }
            animationReveal() {
                let swiper = new Swiper('.home-testi-cms.swiper', {
                    slidesPerView: 'auto',
                    spaceBetween: cvUnit(20, 'rem'),
                    navigation: {
                        nextEl: '.home-testi-control-item.item-next',
                        prevEl: '.home-testi-control-item.item-prev',
                    },
                    pagination: {
                        el: '.home-testi-pagi',
                        bulletClass: 'home-testi-pagi-item',
                        bulletActiveClass: 'active',
                        clickable: true,  
                      },
                    breakpoints: {
                        991: {
                            slidesPerView: 2,
                        }
                    },
                });
            }
            animationScrub() {
            }
            interact() {
            }
            destroy() {
                super.destroy();
            }
        },
        'home-pricing-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    this.animationReveal();
                };
            }
            animationReveal() {
                if(viewport.w < 992) {
                    this.initSwiper();
                }
            }
            animationScrub() {
            }
            interact() {
            }
            initSwiper() {
                $('.home-pricing-head-cms').addClass('swiper');
                $('.home-pricing-head-list').addClass('swiper-wrapper');
                $('.home-pricing-head-item').addClass('swiper-slide');
                const swiper = new Swiper('.home-pricing-head-cms', {
                    slidesPerView: 1,
                    spaceBetween: cvUnit(0, 'rem'),
                    pagination: {
                        el: '.home-pricing-pagi',
                        bulletClass: 'home-pricing-pagi-item',
                        bulletActiveClass: 'active',
                        clickable: true,
                    },
                    breakpoints: {
                        768: {
                            slidesPerView: 'auto',
                        }
                    },
                    on: {
                        slideChange: (swiper) => {
                            let indexActive = swiper.activeIndex;
                            $('.home-pricing-content').each((_, item) => {
                                $(item).find('.home-pricing-content-item').removeClass('active');
                                $(item).find('.home-pricing-content-item').eq(indexActive).addClass('active');
                            });
                        }
                    }
                });
            }
            destroy() {
                super.destroy();
            }
        },
        'home-resource-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    this.animationReveal();
                    this.animationScrub();
                    this.interact();
                };
            }
            animationReveal() {
                if(viewport.w < 992) {
                    this.initSwiper();
                }
            }
            initSwiper() {
                $('.home-resource-cms').addClass('swiper');
                $('.home-resource-list').addClass('swiper-wrapper');
                $('.home-resource-item').addClass('swiper-slide');
                const swiper = new Swiper('.home-resource-cms', {
                    slidesPerView: 'auto',
                    spaceBetween: cvUnit(16, 'rem'),
                    pagination: {
                        el: '.home-resource-pagi',
                        bulletClass: 'home-resource-pagi-item',
                        bulletActiveClass: 'active',
                        clickable: true,
                    },
                });
            }
            animationScrub() {
            }
            interact() {
            }
            destroy() {
                super.destroy();
            }
        },
        'faq-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    this.animationReveal();
                };
            }
            animationReveal() {
                $('.faq-item-sub').hide();
                this.activeFaqItem($(this).find('.faq-item').eq(0));
                $('.faq-item').on('click', (e) => {
                    e.preventDefault();
                    this.activeFaqItem(e.currentTarget);
                });
            }
            activeFaqItem(item) {
                const $item = $(item);
                const $itemSub = $item.find('.faq-item-sub');
                const isActive = $item.hasClass('active');
                
                if (isActive) {
                    $item.removeClass('active');
                    $itemSub.slideUp();
                } else {
                    $('.faq-item').removeClass('active');
                    $('.faq-item-sub').slideUp();
                    $item.addClass('active');
                    $itemSub.slideDown();
                }
            }
            destroy() {
                super.destroy();
            }
        },
    }
    const FaqPage = {
        'faq-hero-wrap': class extends TriggerSetup {
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
            }
            destroy() {
                super.destroy();
            }
        },
        'faq-main-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    this.animationReveal();
                    this.animationScrub();
                    this.interact();
                    this.checkScrollTo();
                };
            }
            animationReveal() {
                this.updateUICateNew();
                if(viewport.w <= 991) {
                    header.registerDependent($('.faq-main-category-sticky'));
                }
                let topInit = (viewport.h - $('.faq-main-tab-inner').outerHeight())/2;
                if($('.faq-main-tab-main').outerHeight() > $('.faq-main-tab-inner').outerHeight()) {
                    $('.faq-main-tab-inner').attr('data-lenis-prevent', 'true');
                 }
                $('.faq-main-tab-inner').css('top', topInit + 'px');
                this.initContent();
                this.searchFaqOnType();

            }
            checkScrollTo() {
                // get parameter from url
                let urlParams = new URLSearchParams(window.location.search);
                let id = urlParams.get('id');
                let category = urlParams.get('category');
                if(id) {  
                    if(!$(`#${id}`).length) {
                        return;
                    }
                    if (!$(`#${id}`).find('.faq-main-item-head').hasClass('active')) {
                        $(`#${id}`).find('.faq-main-item-head').trigger('click')
                    }
                    let scrollOffset = (viewport.h - $(`#${id}`).outerHeight() )/ 2;
                    smoothScroll.scrollTo(`#${id}`, {offset: -scrollOffset});
                    return
                }
                if(category) {
                    $('.faq-main-category-item').removeClass('active');
                    $(`.faq-main-category-item[data-category-slug="${category}"]`).addClass('active');
                    let dataTitle = $(`.faq-main-category-item[data-category-slug="${category}"]`).attr('data-title');
                    let offset = -100;
                    const content = $(`.faq-main-view-item-title h2[data-title="${dataTitle}"]`)[0];
                    smoothScroll.scrollTo(content, {
                        offset: offset,
                        duration: 1,
                    });
                    return;
                }
            }
            getUrl(id='', category='') {
                let url = new URL(window.location.href);
                if(id) {
                    url.searchParams.set('id', id);
                }
                else {
                    url.searchParams.delete('id');
                }
                if(category) {
                    url.searchParams.set('category', category);
                }
                else {
                    let categoryTitle = $(`#${id}`).closest('.faq-main-view-item').find('.faq-main-view-item-title .heading').attr('data-title');
                    let categorySlug = $(`.faq-main-category-item[data-title="${categoryTitle}"]`).attr('data-category-slug');
                    url.searchParams.set('category', categorySlug);
                }
                return url.toString();
            }
            initContent() {
                $('.faq-main-view-item-title h2').each((idx, item) => {
                    $(item).attr('data-title', 'toch-' + idx);
                })
                $('.faq-main-category-cms').each((idx, itemCate) => {
                    $(itemCate).find('.faq-main-category-item').each((idx, item) => {
                        $(item).attr('data-title', 'toch-' + idx);
                    })
                })
            }
            updateUICateNew() {
                const itemSearch = $('.faq-hero-form-dropdown-item').eq(0).clone();
                const listSearch = $('.faq-hero-form-dropdown-inner');
                listSearch.html('')
                $('.faq-main-view-item').each((idx, faq) => {
                    $(faq).find('.faq-main-item').each((idx, item) => {
                        let newItemSearch  = itemSearch.clone();
                        let dataScroll = $(item).find('.faq-main-item-inner').attr('id');
                        let title = $(item).find('.faq-main-item-title .txt').text();
                        newItemSearch.attr('data-scrollto', dataScroll);
                        newItemSearch.find('.fs-16').text(title);
                        listSearch.append(newItemSearch);
                    })
                })
            }
            searchFaqOnType() {
                let faqs = $('.faq-hero-form-dropdown-item');
                let input = $('#faq-search');
                let dropdown = $('.faq-hero-form-dropdown');
                let form = $('#form-faq-search');
                form.attr('action','')
    
                form.on('submit', function(e) {
                    e.preventDefault();
                    return false;
                })
                input.on('keyup change', function(e) {
                    e.preventDefault();
                    if (e.keyCode == '13') {
                        return false;
                    }
                    let value = $(this).val()
                    let compValue = value.toLowerCase().trim().replaceAll(' ','').replaceAll('-','');
    
                    faqs.each((e) => {
                        let ques = faqs.eq(e).find('.fs-16').text()
                        let compQues = ques.toLowerCase().trim().replaceAll(' ','').replaceAll('-','');
                        if (compQues.includes(compValue)) {
                            faqs.eq(e).removeClass('hidden');
                        } else {
                            faqs.eq(e).addClass('hidden');
                        }
    
                        let maskedText = new RegExp("(" + value + ")","gi");
                        const newQues = faqs.eq(e).find('.fs-16').text().replace(maskedText, "<span class='hl'>$1</span>")
                        faqs.eq(e).find('.fs-16').html(newQues)
                    })
    
                    if (dropdown.find('.faq-hero-form-dropdown-inner').height() == 0) {
                        dropdown.find('.faq-hero-form-dropdown-empty').slideDown();
                    } else {
                        dropdown.find('.faq-hero-form-dropdown-empty').slideUp();
                    }
                    if($('.faq-hero-form-dropdown-inner').outerHeight() > $('.faq-hero-form-dropdown').outerHeight()) {
                        $('.faq-hero-form-dropdown').attr('data-lenis-prevent', 'true');
                    }
                    else {
                        $('.faq-hero-form-dropdown').removeAttr('data-lenis-prevent');
                    }
    
                    if (input.val() != '') {
                        dropdown.addClass('open');
                    } else {
                        dropdown.removeClass('open');
                    }
                })
                input.on('focus', function(e) {
                    if($('.faq-main-category-sticky-inner').hasClass('active')) {
                        $('.faq-main-category-sticky-inner').removeClass('active');
                    }
                    if (input.val() != '') {
                        dropdown.addClass('open');
                    }
                })
                input.on('blur', function(e) {
                    if (!dropdown.is(':hover')) {
                        dropdown.removeClass('open')
                    }
                })
                $('.faq-hero-form-dropdown-item').on('click',(e) => {
                    e.preventDefault();
                    let faqId = $(e.currentTarget).attr('data-scrollto');
                    dropdown.removeClass('open')
                    // scroll to the faq item center screen 
                    if (!$(`#${faqId}`).find('.faq-main-item-head').hasClass('active')) {
                        $(`#${faqId}`).find('.faq-main-item-head').trigger('click')
                    }
                    let scrollOffset = (viewport.h - $(`#${faqId}`).outerHeight() )/ 2;
                    smoothScroll.scrollTo(`#${faqId}`, {offset: -scrollOffset})
                    window.history.pushState({}, '', this.getUrl(faqId));
                })
            }
            animationScrub() {
            }
            interact() {
                if(viewport.w <= 991) {
                    $('.faq-main-category-sticky-inner').on('click', (e) => {
                        e.preventDefault();
                        $(e.currentTarget).toggleClass('active');
                    });
                }
                const $contentHeaders = $('.faq-main-view-item-title h2');
                $('.faq-main-category-item').on('click', (e) => {
                    e.preventDefault();
                    if(viewport.w <= 991) {
                        $('.faq-main-category-sticky-ic .embed-ic').html($(e.currentTarget).find('.faq-main-category-item-ic .w-embed').html());
                        $('.faq-main-category-sticky-title .txt').text($(e.currentTarget).find('.faq-main-category-item-title .txt').text());
                        $('.faq-main-category-sticky-inner').removeClass('active');
                    }
                    $('.faq-main-category-item').removeClass('active');
                    $(e.currentTarget).addClass('active');
                    const SCROLL_OFFSET = -100;
                    const dataTitle = $(e.currentTarget).attr('data-title');
                    const content = $(`.faq-main-view-item-title h2[data-title="${dataTitle}"]`)[0];
                    smoothScroll.scrollTo(content, {
                        offset: SCROLL_OFFSET,
                        duration: 1,
                    });
                    let slug = $(e.currentTarget).attr('data-category-slug');
                    window.history.pushState({}, '', this.getUrl('', slug));
                });
                smoothScroll.lenis.on('scroll', () => {
                    this.itemContentActiveCheck($contentHeaders);
                 });
                 $('.faq-main-item-head').on('click', (e) => {
                    e.preventDefault();
                    if (!$(e.currentTarget).hasClass('active')) {
                        $('.faq-main-item-head').removeClass('active');
                        $('.faq-main-item-head').closest('.faq-main-item').find('.faq-main-item-content').slideUp();
                        $(e.currentTarget).addClass('active');
                        $(e.currentTarget).closest('.faq-main-item').find('.faq-main-item-content').slideDown();
                    } else {
                        $(e.currentTarget).removeClass('active');
                        $(e.currentTarget).closest('.faq-main-item').find('.faq-main-item-content').slideUp();
                    }
                    let id = $(e.currentTarget).closest('.faq-main-item-inner').attr('id');
                    window.history.pushState({}, '', this.getUrl(id));
                 })
                 $('.faq-main-item-relates-item-link').on('click', (e) => {
                    e.preventDefault();
                    const scrollTo = $(e.currentTarget).attr('data-scrollto');
                    if (!$(`#${scrollTo}`).find('.faq-main-item-head').hasClass('active')) {
                        $(`#${scrollTo}`).find('.faq-main-item-head').trigger('click')
                    }
                    let scrollOffset = (viewport.h - $(`#${scrollTo}`).outerHeight() )/ 2;
                    smoothScroll.scrollTo(`#${scrollTo}`, {
                        offset: -scrollOffset,
                        duration: 1,
                    });
                    window.history.pushState({}, '', this.getUrl(scrollTo));
                 })
            }
            itemContentActiveCheck(el) {
                for (let i = 0; i < $(el).length; i++) {
                    let top = $(el).eq(i).get(0).getBoundingClientRect().top;
                    let dataTitle = $(el).eq(i).attr('data-title');
                    if (top > 0 && top - $(el).eq(i).height() < ($(window).height()/2)) {
                        $('.faq-main-category-item').removeClass('active');
                        $(`.faq-main-category-item[data-title="${dataTitle}"]`).addClass('active');
                        if(viewport.w <= 991) {
                            $('.faq-main-category-sticky-ic .embed-ic').html($(`.faq-main-category-item[data-title="${dataTitle}"]`).find('.faq-main-category-item-ic .w-embed').html());
                            $('.faq-main-category-sticky-title .txt').text($(`.faq-main-category-item[data-title="${dataTitle}"]`).find('.faq-main-category-item-title .txt').eq(0).text());
                            $('.faq-main-category-sticky-inner').removeClass('active');
                        }
                    }
                }
            }
            destroy() {
                super.destroy();
            }
        }
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
        home: HomePage,
        faq: FaqPage
    };
    cursor.updateHtml();
    cursor.init();
    const registry = {};
    registry[pageName]?.destroy();

    documentHeightObserver("init");
    refreshOnBreakpoint();
    scrollTop(() => pageConfig[pageName] && (registry[pageName] = new PageManager(pageConfig[pageName])));
}
window.onload = script
