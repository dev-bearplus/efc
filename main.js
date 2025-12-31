const script = () => {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.defaults({
        invalidateOnRefresh: true
    });
    const reinitializeWebflow = (data) => {
		if (!window.Webflow) return;

		try {
			window.Webflow.destroy();
			window.Webflow.ready();
			const ix2 = window.Webflow.require("ix2");
			if (ix2 && typeof ix2.init === "function") {
				ix2.init();
			}
			const forms = window.Webflow.require("forms");
			if (forms && typeof forms.ready === "function") {
				forms.ready();
			}
			["slider", "tabs", "dropdown", "navbar"].forEach((module) => {
				try {
					const mod = window.Webflow.require(module);
					if (mod && typeof mod.ready === "function") {
						mod.ready();
					}
				} catch (e) {}
			});
			if (window.Webflow.redraw) {
				window.Webflow.redraw.up();
         }

         if (data) {
            let parser = new DOMParser();
            let dom = parser.parseFromString(data.next.html, "text/html");
            let webflowPageId = $(dom).find("html").attr("data-wf-page");
            $("html").attr("data-wf-page", webflowPageId);
         }
		} catch (e) {
			console.warn("Webflow reinit failed:", e);
		}
   };
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
    const formSubmitEvent = (function () {
        const init = ({
           onlyWorkOnThisFormName,
           onSuccess,
           onFail
        }) => {
           let inputSubmit = $(`#${getIDFormName(onlyWorkOnThisFormName)} button[type="submit"] .heading`);
  
           $(document).on('ajaxSend', function (event, xhr, settings) {
              if (settings.url.includes("https://webflow.com/api/v1/form/")) {
                    inputSubmit?.text('Please wait...');
              }
           });
           $(document).on('ajaxComplete', function (event, xhr, settings) {
              if (settings.url.includes("https://webflow.com/api/v1/form/")) {
                    const isSuccessful = xhr.status === 200
                    const isWorkOnAllForm = onlyWorkOnThisFormName == undefined
                    const isCorrectForm = !isWorkOnAllForm && settings.data.includes(getSanitizedFormName(onlyWorkOnThisFormName));
  
                    if (isWorkOnAllForm) {
                       if (isSuccessful) {
                          onSuccess?.()
                          inputSubmit?.text('Submit');
                       } else {
                          onFail?.()
                       }
                    } else if (isCorrectForm) {
                       if (isSuccessful) {
                          onSuccess?.()
                          inputSubmit?.text('Submit');
                       } else {
                          onFail?.()
                       }
                    }
              }
           });
        }
        function getIDFormName(name) {
           return name.toLowerCase().replaceAll(" ", "-");
        }
        function getSanitizedFormName(name) {
           return name.replaceAll(" ", "+")
        }
        return {
           init
        }
     })();
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
                // Cache DOM elements
                this.$els = {};
                this.searchIndex = -1;
                this.searchTimeout = null;
                this.SCROLL_OFFSET = -100;
                this.DEBOUNCE_DELAY = 150;
                
                this.onTrigger = () => {
                    this.cacheElements();
                    this.animationReveal();
                    this.interact();
                    this.checkScrollTo();
                };
            }
            
            cacheElements() {
                this.$els = {
                    tabInner: $('.faq-main-tab-inner'),
                    tabMain: $('.faq-main-tab-main'),
                    categorySticky: $('.faq-main-category-sticky'),
                    categoryStickyInner: $('.faq-main-category-sticky-inner'),
                    categoryStickyIc: $('.faq-main-category-sticky-ic .embed-ic'),
                    categoryStickyTitle: $('.faq-main-category-sticky-title .txt'),
                    categoryItems: $('.faq-main-category-item'),
                    viewItemTitles: $('.faq-main-view-item-title h2'),
                    searchInput: $('#faq-search'),
                    searchForm: $('#form-faq-search'),
                    searchDropdown: $('.faq-hero-form-dropdown'),
                    dropdownInner: $('.faq-hero-form-dropdown-inner'),
                    dropdownEmpty: $('.faq-hero-form-dropdown-empty'),
                    itemHeads: $('.faq-main-item-head'),
                    relatesLinks: $('.faq-main-item-relates-item-link')
                };
            }
            
            animationReveal() {
                this.updateUICateNew();
                if(viewport.w <= 991) {
                    header.registerDependent(this.$els.categorySticky);
                }
                const topInit = (viewport.h - this.$els.tabInner.outerHeight()) / 2;
                if(this.$els.tabMain.outerHeight() > this.$els.tabInner.outerHeight()) {
                    this.$els.tabInner.attr('data-lenis-prevent', 'true');
                }
                this.$els.tabInner.css('top', topInit + 'px');
                this.initContent();
                this.searchFaqOnType();
            }
            
            checkScrollTo() {
                const urlParams = new URLSearchParams(window.location.search);
                const id = urlParams.get('id');
                const category = urlParams.get('category');
                
                if(id) {
                    const $target = $(`#${id}`);
                    if(!$target.length) return;
                    
                    const $head = $target.find('.faq-main-item-head');
                    if (!$head.hasClass('active')) {
                        $head.trigger('click');
                    }
                    this.scrollToFaq(id);
                    return;
                }
                
                if(category) {
                    const $categoryItem = $(`.faq-main-category-item[data-category-slug="${category}"]`);
                    this.$els.categoryItems.removeClass('active');
                    $categoryItem.addClass('active');
                    
                    const dataTitle = $categoryItem.attr('data-title');
                    const content = $(`.faq-main-view-item-title h2[data-title="${dataTitle}"]`)[0];
                    if(content) {
                        smoothScroll.scrollTo(content, {
                            offset: this.SCROLL_OFFSET,
                            duration: 1,
                        });
                    }
                }
            }
            
            scrollToFaq(faqId) {
                const $target = $(`#${faqId}`);
                if(!$target.length) return;
                
                const scrollOffset = (viewport.h - $target.outerHeight()) / 2;
                smoothScroll.scrollTo(`#${faqId}`, {offset: -scrollOffset});
            }
            
            getUrl(id = '', category = '') {
                const url = new URL(window.location.href);
                
                if(id) {
                    url.searchParams.set('id', id);
                    if(!category) {
                        const $target = $(`#${id}`);
                        if($target.length) {
                            const categoryTitle = $target.closest('.faq-main-view-item')
                                .find('.faq-main-view-item-title .heading')
                                .attr('data-title');
                            if(categoryTitle) {
                                const categorySlug = $(`.faq-main-category-item[data-title="${categoryTitle}"]`)
                                    .attr('data-category-slug');
                                if(categorySlug) {
                                    url.searchParams.set('category', categorySlug);
                                }
                            }
                        }
                    }
                } else {
                    url.searchParams.delete('id');
                }
                
                if(category) {
                    url.searchParams.set('category', category);
                }
                
                return url.toString();
            }
            
            initContent() {
                // Batch DOM updates
                this.$els.viewItemTitles.each((idx, item) => {
                    item.setAttribute('data-title', 'toch-' + idx);
                });
                
                $('.faq-main-category-cms').each((idx, itemCate) => {
                    $(itemCate).find('.faq-main-category-item').each((idx, item) => {
                        item.setAttribute('data-title', 'toch-' + idx);
                    });
                });
            }
            
            updateUICateNew() {
                const $firstItem = $('.faq-hero-form-dropdown-item').eq(0);
                if(!$firstItem.length) return;
                
                const itemTemplate = $firstItem.clone();
                const fragment = document.createDocumentFragment();
                
                $('.faq-main-view-item').each((idx, faq) => {
                    $(faq).find('.faq-main-item').each((idx, item) => {
                        const $item = $(item);
                        const newItem = itemTemplate.clone();
                        const dataScroll = $item.find('.faq-main-item-inner').attr('id');
                        const title = $item.find('.faq-main-item-title .txt').text();
                        
                        newItem.attr('data-scrollto', dataScroll);
                        newItem.find('.fs-16').text(title);
                        fragment.appendChild(newItem[0]);
                    });
                });
                
                this.$els.dropdownInner.empty().append(fragment);
            }
            
            debounce(func, delay) {
                return (...args) => {
                    clearTimeout(this.searchTimeout);
                    this.searchTimeout = setTimeout(() => func.apply(this, args), delay);
                };
            }
            
            filterSearchResults(value) {
                if(!value) return;
                
                const compValue = value.toLowerCase().replace(/[\s-]/g, '');
                const regex = new RegExp("(" + value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ")", "gi");
                const $items = $('.faq-hero-form-dropdown-item');
                
                $items.each((idx, el) => {
                    const $el = $(el);
                    const $textEl = $el.find('.fs-16');
                    const originalText = $textEl.text();
                    const compText = originalText.toLowerCase().replace(/[\s-]/g, '');
                    
                    if (compText.includes(compValue)) {
                        $el.removeClass('hidden');
                        const highlightedText = originalText.replace(regex, "<span class='hl'>$1</span>");
                        $textEl.html(highlightedText);
                    } else {
                        $el.addClass('hidden');
                    }
                });
                
                this.updateDropdownUI();
            }
            
            updateDropdownUI() {
                const innerHeight = this.$els.dropdownInner.height();
                const dropdownHeight = this.$els.searchDropdown.outerHeight();
                
                if (innerHeight === 0) {
                    this.$els.dropdownEmpty.slideDown();
                } else {
                    this.$els.dropdownEmpty.slideUp();
                }
                
                if(innerHeight > dropdownHeight) {
                    this.$els.searchDropdown.attr('data-lenis-prevent', 'true');
                } else {
                    this.$els.searchDropdown.removeAttr('data-lenis-prevent');
                }
            }
            
            handleSearchKeyboard(e, $itemsActive) {
                switch (e.key) {
                    case 'Tab':
                    case 'ArrowDown':
                        e.preventDefault();
                        this.searchIndex = (this.searchIndex + 1) % $itemsActive.length;
                        this.setActiveSearchItem($itemsActive);
                        break;
                    
                    case 'ArrowUp':
                        e.preventDefault();
                        this.searchIndex = (this.searchIndex - 1 + $itemsActive.length) % $itemsActive.length;
                        this.setActiveSearchItem($itemsActive);
                        break;
                    
                    case 'Enter':
                        e.preventDefault();
                        // Nếu chưa chọn item nào (searchIndex = -1), auto-select item đầu tiên
                        if (this.searchIndex < 0 && $itemsActive.length > 0) {
                            this.searchIndex = 0;
                        }
                        // Select item nếu có item được chọn
                        if (this.searchIndex >= 0 && $itemsActive.length > 0) {
                            this.selectSearchItem($itemsActive.eq(this.searchIndex));
                        }
                        break;
                    
                    case 'Escape':
                        this.$els.searchDropdown.removeClass('open');
                        break;
                }
            }
            
            setActiveSearchItem($items) {
                $items.removeClass('active');
                if(this.searchIndex >= 0 && this.searchIndex < $items.length) {
                    const $activeItem = $items.eq(this.searchIndex);
                    $activeItem.addClass('active');
                    
                    const activeEl = $activeItem[0];
                    if (activeEl) {
                        // scroll cộng thêm .4rem
                        activeEl.scrollIntoView({
                            behavior: 'smooth',
                            block: 'nearest'
                        });
                    }
                }
            }
            
            selectSearchItem($item) {
                const faqId = $item.attr('data-scrollto');
                if(!faqId) return;
                
                const $target = $(`#${faqId}`);
                if(!$target.length) return;
                
                const $head = $target.find('.faq-main-item-head');
                if (!$head.hasClass('active')) {
                    $head.trigger('click');
                }
                
                this.scrollToFaq(faqId);
                window.history.pushState({}, '', this.getUrl(faqId));
                setTimeout(() => {
                    this.$els.searchDropdown.removeClass('open');
                }, 100);
            }
            
            searchFaqOnType() {
                this.$els.searchForm.attr('action', '').on('submit', (e) => {
                    e.preventDefault();
                    return false;
                });
                
                const debouncedFilter = this.debounce((value) => {
                    this.filterSearchResults(value);
                }, this.DEBOUNCE_DELAY);
                
                this.$els.searchInput.on('keyup', (e) => {
                    e.preventDefault();
                    const value = this.$els.searchInput.val();
                    
                    // Chỉ handle keyboard navigation cho các phím điều hướng và Enter
                    if(['Tab', 'ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(e.key)) {
                        const $itemsActive = this.$els.searchDropdown.find('.faq-hero-form-dropdown-item:not(.hidden)');
                        this.handleSearchKeyboard(e, $itemsActive);
                    } else {
                        // User đang gõ text → reset search index và filter
                        $('.faq-hero-form-dropdown-item').removeClass('active');
                        this.searchIndex = -1;
                        debouncedFilter(value);
                    }
                    
                    // Toggle dropdown
                    if (value !== '') {
                        this.$els.searchDropdown.addClass('open');
                    } else {
                        this.$els.searchDropdown.removeClass('open');
                    }
                });
                
                // Handle input changes (paste, etc.) - không reset searchIndex
                this.$els.searchInput.on('input', (e) => {
                    const value = this.$els.searchInput.val();
                    $('.faq-hero-form-dropdown-item').removeClass('active');
                    this.searchIndex = -1;
                    debouncedFilter(value);
                    
                    // Toggle dropdown
                    if (value !== '') {
                        this.$els.searchDropdown.addClass('open');
                    } else {
                        this.$els.searchDropdown.removeClass('open');
                    }
                });
                
                this.$els.searchInput.on('focus', () => {
                    this.$els.categoryStickyInner.removeClass('active');
                    if (this.$els.searchInput.val() !== '') {
                        this.$els.searchDropdown.addClass('open');
                    }
                });
                
                this.$els.searchInput.on('blur', () => {
                    if (!this.$els.searchDropdown.is(':hover')) {
                        this.$els.searchDropdown.removeClass('open');
                    }
                });
                
                // Use event delegation
                this.$els.searchDropdown.on('click', '.faq-hero-form-dropdown-item', (e) => {
                    e.preventDefault();
                    this.selectSearchItem($(e.currentTarget));
                });
            }
            
            updateMobileCategoryUI($currentTarget) {
                if(viewport.w > 991) return;
                
                const $itemIc = $currentTarget.find('.faq-main-category-item-ic .w-embed');
                const $itemTitle = $currentTarget.find('.faq-main-category-item-title .txt');
                
                this.$els.categoryStickyIc.html($itemIc.html());
                this.$els.categoryStickyTitle.text($itemTitle.text());
                this.$els.categoryStickyInner.removeClass('active');
            }
            
            interact() {
                if(viewport.w <= 991) {
                    this.$els.categoryStickyInner.on('click', (e) => {
                        e.preventDefault();
                        $(e.currentTarget).toggleClass('active');
                    });
                }
                
                this.$els.categoryItems.on('click', (e) => {
                    e.preventDefault();
                    const $current = $(e.currentTarget);
                    
                    this.updateMobileCategoryUI($current);
                    this.$els.categoryItems.removeClass('active');
                    $current.addClass('active');
                    
                    const dataTitle = $current.attr('data-title');
                    const content = $(`.faq-main-view-item-title h2[data-title="${dataTitle}"]`)[0];
                    
                    if(content) {
                        smoothScroll.scrollTo(content, {
                            offset: this.SCROLL_OFFSET,
                            duration: 1,
                        });
                    }
                    
                    const slug = $current.attr('data-category-slug');
                    window.history.pushState({}, '', this.getUrl('', slug));
                });
                
                // Throttled scroll handler
                let scrollTicking = false;
                smoothScroll.lenis.on('scroll', () => {
                    if(!scrollTicking) {
                        window.requestAnimationFrame(() => {
                            this.itemContentActiveCheck();
                            scrollTicking = false;
                        });
                        scrollTicking = true;
                    }
                });
                
                this.$els.itemHeads.on('click', (e) => {
                    e.preventDefault();
                    const $current = $(e.currentTarget);
                    const $item = $current.closest('.faq-main-item');
                    const $content = $item.find('.faq-main-item-content');
                    
                    if (!$current.hasClass('active')) {
                        this.$els.itemHeads.removeClass('active');
                        $('.faq-main-item-content').slideUp();
                        $current.addClass('active');
                        $content.slideDown();
                    } else {
                        $current.removeClass('active');
                        $content.slideUp();
                    }
                    
                    const id = $current.closest('.faq-main-item-inner').attr('id');
                    window.history.pushState({}, '', this.getUrl(id));
                });
                
                this.$els.relatesLinks.on('click', (e) => {
                    e.preventDefault();
                    const scrollTo = $(e.currentTarget).attr('data-scrollto');
                    
                    const $target = $(`#${scrollTo}`);
                    if(!$target.length) return;
                    
                    const $head = $target.find('.faq-main-item-head');
                    if (!$head.hasClass('active')) {
                        $head.trigger('click');
                    }
                    
                    this.scrollToFaq(scrollTo);
                    window.history.pushState({}, '', this.getUrl(scrollTo));
                });
            }
            
            itemContentActiveCheck() {
                const viewportHeight = $(window).height();
                const halfHeight = viewportHeight / 2;
                
                this.$els.viewItemTitles.each((i, el) => {
                    const rect = el.getBoundingClientRect();
                    const dataTitle = el.getAttribute('data-title');
                    
                    if (rect.top > 0 && rect.top - $(el).height() < halfHeight) {
                        const $categoryItem = $(`.faq-main-category-item[data-title="${dataTitle}"]`);
                        
                        this.$els.categoryItems.removeClass('active');
                        $categoryItem.addClass('active');
                        
                        if(viewport.w <= 991 && $categoryItem.length) {
                            this.updateMobileCategoryUI($categoryItem);
                        }
                    }
                });
            }
            
            destroy() {
                // Cleanup event handlers
                if(this.$els.searchInput) {
                    this.$els.searchInput.off();
                    this.$els.searchForm.off();
                    this.$els.searchDropdown.off();
                }
                if(this.$els.categoryItems) {
                    this.$els.categoryItems.off();
                    this.$els.categoryStickyInner.off();
                    this.$els.itemHeads.off();
                    this.$els.relatesLinks.off();
                }
                clearTimeout(this.searchTimeout);
                super.destroy();
            }
        }
    }
    const SchedulePage = {
        'schedule-hero-wrap': class extends TriggerSetup {
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
                const $formSuccess = $('.schedule-form-success');
                const $inputGr = $('.schedule-hero-form-input-gr');
                const $selectWrap = $('.schedule-hero-form-select-wrap');
                const $selectDropdown = $('.schedule-hero-form-select-dropdown');
                
                const formReset = (form) => {
                    $(form)[0].reset();
                    reinitializeWebflow();
                    $('.schedule-hero-form-option-input-wrap').slideUp();
                    $inputGr.removeClass('active');
                    $('.input:not(.input-hidden)').closest('.schedule-hero-form-input-gr').removeClass('filled');
                    $selectWrap.removeClass('filled open');
                    $('.schedule-hero-form-select-inner .txt').text('Select');
                }
                
                const onSuccessForm = (form) => {
                    console.log('success');
                    $formSuccess.addClass('active');
                    formReset(form);
                    setTimeout(() => {
                        $formSuccess.removeClass('active');
                    }, 5000);
                }
                
                $('.schedule-form-success-btn').on('click', (e) => {
                    e.preventDefault();
                    $formSuccess.removeClass('active');
                });
                
                formSubmitEvent.init({
                    onlyWorkOnThisFormName: "Schedule a demo",
                    onSuccess: () => onSuccessForm("#schedule-a-demo form"),
                });
                
                $('input[type="checkbox"]').on('change', (e) => {
                    const $current = $(e.currentTarget);
                    const $inputWrap = $current.closest('.schedule-hero-form-option-item')
                        .find('.schedule-hero-form-option-input-wrap');
                    $inputWrap[$current.is(':checked') ? 'slideDown' : 'slideUp']();
                });
                
                $('.schedule-hero-form-input').on('focus', (e) => {
                    $(e.currentTarget).closest('.schedule-hero-form-input-gr').addClass('active');
                });
                
                $('.schedule-hero-form-input').on('blur', (e) => {
                    const $current = $(e.currentTarget);
                    const $parent = $current.closest('.schedule-hero-form-input-gr').length 
                        ? $current.closest('.schedule-hero-form-input-gr') 
                        : $current.closest('.schedule-hero-form-option-input-inner');
                    
                    $parent.removeClass('active')
                        .toggleClass('filled', !!$current.val());
                });
                
                $('.schedule-hero-form-select-inner').on('click', (e) => {
                    e.preventDefault();
                    const $current = $(e.currentTarget);
                    const $parent = $current.closest('.schedule-hero-form-select-wrap');
                    const $dropdown = $parent.find('.schedule-hero-form-select-dropdown');
                    
                    $selectWrap.not($parent).removeClass('open');
                    $selectDropdown.not($dropdown).removeClass('active');
                    
                    if($current.closest('.schedule-hero-form-input-gr').hasClass('active')) {
                        $current.closest('.schedule-hero-form-input-gr').removeClass('active');
                    }
                    else {
                        $('.schedule-hero-form-input-gr').removeClass('active');
                        $current.closest('.schedule-hero-form-input-gr').addClass('active');
                    }
                    $parent.toggleClass('active open');
                    $dropdown.toggleClass('active');
                });
                
                $(document).on('click', (e) => {
                    if (!$(e.target).closest('.schedule-hero-form-select-wrap').length) {
                        $selectWrap.removeClass('open');
                        if($(e.target).closest('.schedule-hero-form-input').length) {
                            // i want to remove all class active for $inputGr but  the one that is closest to the target add class active
                            $inputGr.removeClass('active');
                            $(e.target).closest('.schedule-hero-form-input-gr').addClass('active');
                        }
                        $selectDropdown.removeClass('active');
                    }
                });
                
                $('.schedule-hero-form-select-dropdown-item').on('click', (e) => {
                    e.preventDefault();
                    const $current = $(e.currentTarget);
                    const text = $current.find('.txt').text();
                    const $parent = $current.closest('.schedule-hero-form-select-wrap');
                    const $selectInner = $parent.find('.schedule-hero-form-select-inner');
                    
                    $inputGr.removeClass('active');
                    $parent.addClass('filled').removeClass('open');
                    $parent.find('.schedule-hero-form-select-dropdown').removeClass('active');
                    $selectInner.find('.txt').text(text);
                    $selectInner.find('input').val(text);
                    
                    $('.schedule-hero-form-select-dropdown-item').removeClass('active');
                    $current.addClass('active');
                });
                
                $('.schedule-hero-form-submit').on('click', (e) => {
                    if (!this.checkFormValid()) {
                        e.preventDefault();
                        console.log('Form invalid');
                    }
                });
                
                $('button[type="submit"]').on("pointerenter", function () {
                    $(this).prop("disabled", false);
                });
            }
            checkEmailValid(emailValue) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if(emailRegex.test(emailValue)) {
                    return true;
                } else {
                    return false;
                }
            }
            checkPhoneValid(phoneValue) {
                // nếu có dấu + thì cũng oke, chỉnh lại phoneRegex
                const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4}$/;
                if(phoneRegex.test(phoneValue)) {
                    return true;
                } else {
                    return false;
                }
            }
            checkFormValid() {
                const messageEmail = "Invalid email";
                const messagePhone = "invalid phone number";
                const fisrtName = $('input[name="First-Name"]');
                const lastName = $('input[name="Last-Name"]');
                const email = $('input[name="Email"]');
                const phone = $('input[name="Phone"]');
                const schoolName = $('input[name="School-Name"]');
                const contactRadio = $('input[name="contact"]');
                const contactRadioChecked = contactRadio.filter(':checked');
                const systemCheckbox = $('input[name="system"]');
                const systemChecked = systemCheckbox.filter(':checked');
                const country = $('input[name="Country"]');
                const size = $('input[name="Size"]');
                const challenge = $('input[name="Challenge"]');
                console.log(contactRadioChecked);
                let isValid = true;
                if(!country.val()) {
                    country.closest('.schedule-hero-form-input-gr').addClass('error');
                    isValid = false;
                }
                else {
                    country.closest('.schedule-hero-form-input-gr').removeClass('error');
                }
                if(!size.val()) {
                    size.closest('.schedule-hero-form-input-gr').addClass('error');
                    isValid = false;
                }
                else {
                    size.closest('.schedule-hero-form-input-gr').removeClass('error');
                }
                if(!challenge.val()) {
                    challenge.closest('.schedule-hero-form-input-gr').addClass('error');
                    isValid = false;
                }
                else {
                    challenge.closest('.schedule-hero-form-input-gr').removeClass('error');
                }
                if(systemChecked.length == 0) {
                    systemCheckbox.closest('.schedule-hero-form-option-wrap').addClass('error');
                    isValid = false;
                }
                else {

                    systemCheckbox.closest('.schedule-hero-form-option-wrap').removeClass('error');
                    systemChecked.each((i, el) => {
                        const inputDetail = $(el).closest('.schedule-hero-form-option-item').find('.schedule-hero-form-option-input-inner input');
                        if(!inputDetail.val()) {
                            inputDetail.closest('.schedule-hero-form-option-input-inner').addClass('error');
                            isValid = false;
                        }
                        else {
                            inputDetail.closest('.schedule-hero-form-option-input-inner').removeClass('error');
                        }
                    });
                }
                if(contactRadioChecked.length !== 1) {
                    contactRadio.closest('.schedule-hero-form-option-wrap').addClass('error');
                    isValid = false;
                }
                else {
                    contactRadio.closest('.schedule-hero-form-option-wrap').removeClass('error');
                }
                if(!fisrtName.val()) {
                    fisrtName.closest('.schedule-hero-form-input-gr').addClass('error');
                    isValid = false;
                }
                else {
                    fisrtName.closest('.schedule-hero-form-input-gr').removeClass('error');
                }
                if(!lastName.val()) {
                    lastName.closest('.schedule-hero-form-input-gr').addClass('error');
                    isValid = false;
                }
                else {
                    lastName.closest('.schedule-hero-form-input-gr').removeClass('error');
                }
                if(!email.val()) {
                    email.closest('.schedule-hero-form-input-gr').addClass('error');
                    isValid = false;
                }
                else if(!this.checkEmailValid(email.val())) {
                    email.closest('.schedule-hero-form-input-gr').find('.schedule-hero-form-valid .txt').text(messageEmail);
                    email.closest('.schedule-hero-form-input-gr').addClass('error');
                    isValid = false;
                }
                else {
                    email.closest('.schedule-hero-form-input-gr').removeClass('error');
                }
                if(!phone.val()) {
                    phone.closest('.schedule-hero-form-input-gr').addClass('error');
                    isValid = false;
                }
                else if(!this.checkPhoneValid(phone.val())) {
                    phone.closest('.schedule-hero-form-input-gr').find('.schedule-hero-form-valid .txt').text(messagePhone);
                    phone.closest('.schedule-hero-form-input-gr').addClass('error');
                    isValid = false;
                }
                else {
                    phone.closest('.schedule-hero-form-input-gr').removeClass('error');
                }
                if(!schoolName.val()) {
                    schoolName.closest('.schedule-hero-form-input-gr').addClass('error');
                    isValid = false;
                }
                else {
                    schoolName.closest('.schedule-hero-form-input-gr').removeClass('error');
                }
                console.log(isValid);
                return isValid;
            }
            destroy() {
                super.destroy();
            }
        },
        'schedule-benefit-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    this.animationReveal();
                }
            }
            animationReveal() {
                console.log('test', viewport.w);
                if(viewport.w < 768) {
                    this.initSwiper();
                }
            }
            initSwiper() {
                $('.schedule-benefit-cms').addClass('swiper');
                $('.schedule-benefit-item').addClass('swiper-slide');
                $('.schedule-benefit-list').addClass('swiper-wrapper');
                let swiper = new Swiper('.schedule-benefit-cms', {
                    slidesPerView: 'auto',
                    spaceBetween: cvUnit(16, 'rem'),
                    pagination: {
                        el: '.schedule-benefit-pagi',
                        bulletClass: 'schedule-benefit-pagi-item',
                        bulletActiveClass: 'active'
                    }
                });
            }
            destroy() {
                super.destroy();
            }
        },
    }
    const ContactPage = {
        'contact-hero-wrap': class extends TriggerSetup {
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
                const $formSuccess = $('.schedule-form-success');
                const $inputGr = $('.schedule-hero-form-input-gr');
                const $selectWrap = $('.schedule-hero-form-select-wrap');
                const $selectDropdown = $('.schedule-hero-form-select-dropdown');
                
                const formReset = (form) => {
                    $(form)[0].reset();
                    reinitializeWebflow();
                    $('.schedule-hero-form-option-input-wrap').slideUp();
                    $inputGr.removeClass('active');
                    $('.input:not(.input-hidden)').closest('.schedule-hero-form-input-gr').removeClass('filled');
                    $selectWrap.removeClass('filled open');
                    $('.schedule-hero-form-select-inner .txt').text('Select');
                }
                
                const onSuccessForm = (form) => {
                    console.log('success');
                    $formSuccess.addClass('active');
                    formReset(form);
                    setTimeout(() => {
                        $formSuccess.removeClass('active');
                    }, 5000);
                }
                
                $('.schedule-form-success-btn').on('click', (e) => {
                    e.preventDefault();
                    $formSuccess.removeClass('active');
                });
                
                formSubmitEvent.init({
                    onlyWorkOnThisFormName: "Contact Form",
                    onSuccess: () => onSuccessForm("#contact-form form"),
                });
                
                $('input[type="checkbox"]').on('change', (e) => {
                    const $current = $(e.currentTarget);
                    const $inputWrap = $current.closest('.schedule-hero-form-option-item')
                        .find('.schedule-hero-form-option-input-wrap');
                    $inputWrap[$current.is(':checked') ? 'slideDown' : 'slideUp']();
                });
                
                $('.schedule-hero-form-input').on('focus', (e) => {
                    $(e.currentTarget).closest('.schedule-hero-form-input-gr').addClass('active');
                });
                
                $('.schedule-hero-form-input').on('blur', (e) => {
                    const $current = $(e.currentTarget);
                    const $parent = $current.closest('.schedule-hero-form-input-gr').length 
                        ? $current.closest('.schedule-hero-form-input-gr') 
                        : $current.closest('.schedule-hero-form-option-input-inner');
                    
                    $parent.removeClass('active')
                        .toggleClass('filled', !!$current.val());
                });
                
                $('.schedule-hero-form-select-inner').on('click', (e) => {
                    e.preventDefault();
                    const $current = $(e.currentTarget);
                    const $parent = $current.closest('.schedule-hero-form-select-wrap');
                    const $dropdown = $parent.find('.schedule-hero-form-select-dropdown');
                    
                    $selectWrap.not($parent).removeClass('open');
                    $selectDropdown.not($dropdown).removeClass('active');
                    
                    if($current.closest('.schedule-hero-form-input-gr').hasClass('active')) {
                        $current.closest('.schedule-hero-form-input-gr').removeClass('active');
                    }
                    else {
                        $('.schedule-hero-form-input-gr').removeClass('active');
                        $current.closest('.schedule-hero-form-input-gr').addClass('active');
                    }
                    $parent.toggleClass('active open');
                    $dropdown.toggleClass('active');
                });
                
                $(document).on('click', (e) => {
                    if (!$(e.target).closest('.schedule-hero-form-select-wrap').length) {
                        $selectWrap.removeClass('open');
                        if($(e.target).closest('.schedule-hero-form-input').length) {
                            // i want to remove all class active for $inputGr but  the one that is closest to the target add class active
                            $inputGr.removeClass('active');
                            $(e.target).closest('.schedule-hero-form-input-gr').addClass('active');
                        }
                        $selectDropdown.removeClass('active');
                    }
                });
                
                $('.schedule-hero-form-select-dropdown-item').on('click', (e) => {
                    e.preventDefault();
                    const $current = $(e.currentTarget);
                    const text = $current.find('.txt').text();
                    const $parent = $current.closest('.schedule-hero-form-select-wrap');
                    const $selectInner = $parent.find('.schedule-hero-form-select-inner');
                    
                    $inputGr.removeClass('active');
                    $parent.addClass('filled').removeClass('open');
                    $parent.find('.schedule-hero-form-select-dropdown').removeClass('active');
                    $selectInner.find('.txt').text(text);
                    $selectInner.find('input').val(text);
                    
                    $('.schedule-hero-form-select-dropdown-item').removeClass('active');
                    $current.addClass('active');
                });
                
                $('.schedule-hero-form-submit').on('click', (e) => {
                    if (!this.checkFormValid()) {
                        e.preventDefault();
                        console.log('Form invalid');
                    }
                });
                
                $('button[type="submit"]').on("pointerenter", function () {
                    $(this).prop("disabled", false);
                });
            }
            checkEmailValid(emailValue) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if(emailRegex.test(emailValue)) {
                    return true;
                } else {
                    return false;
                }
            }
            checkPhoneValid(phoneValue) {
                // tôi k muốn check độ dài

                const phoneRegex =  /^[\+]?[0-9\s\-\.\(\)]+$/;
                if(phoneRegex.test(phoneValue)) {
                    return true;
                } else {
                    return false;
                }
            }
            checkFormValid() {
                const messageEmail = "Invalid email";
                const messagePhone = "invalid phone number";
                const fisrtName = $('input[name="First-Name"]');
                const lastName = $('input[name="Last-Name"]');
                const email = $('input[name="Email"]');
                const phone = $('input[name="Phone"]');
                const schoolName = $('input[name="School-Name"]');
                const country = $('input[name="Country"]');
                const message = $('textarea[name="Message"]');
                const challenge = $('input[name="Challenge"]');
                let isValid = true;
                if(!challenge.val()) {
                    challenge.closest('.schedule-hero-form-input-gr').addClass('error');
                    isValid = false;
                }
                else {
                    challenge.closest('.schedule-hero-form-input-gr').removeClass('error');
                }
                if(!country.val()) {
                    country.closest('.schedule-hero-form-input-gr').addClass('error');
                    isValid = false;
                }
                else {
                    country.closest('.schedule-hero-form-input-gr').removeClass('error');
                }
                if(!fisrtName.val()) {
                    fisrtName.closest('.schedule-hero-form-input-gr').addClass('error');
                    isValid = false;
                }
                else {
                    fisrtName.closest('.schedule-hero-form-input-gr').removeClass('error');
                }
                if(!message.val()) {
                    message.closest('.schedule-hero-form-input-gr').addClass('error');
                    isValid = false;
                }
                else {
                    message.closest('.schedule-hero-form-input-gr').removeClass('error');
                }
                if(!lastName.val()) {
                    lastName.closest('.schedule-hero-form-input-gr').addClass('error');
                    isValid = false;
                }
                else {
                    lastName.closest('.schedule-hero-form-input-gr').removeClass('error');
                }
                if(!email.val()) {
                    email.closest('.schedule-hero-form-input-gr').addClass('error');
                    isValid = false;
                }
                else if(!this.checkEmailValid(email.val())) {
                    email.closest('.schedule-hero-form-input-gr').find('.schedule-hero-form-valid .txt').text(messageEmail);
                    email.closest('.schedule-hero-form-input-gr').addClass('error');
                    isValid = false;
                }
                else {
                    email.closest('.schedule-hero-form-input-gr').removeClass('error');
                }
                if(!phone.val()) {
                    phone.closest('.schedule-hero-form-input-gr').addClass('error');
                    isValid = false;
                }
                else if(!this.checkPhoneValid(phone.val())) {
                    phone.closest('.schedule-hero-form-input-gr').find('.schedule-hero-form-valid .txt').text(messagePhone);
                    phone.closest('.schedule-hero-form-input-gr').addClass('error');
                    isValid = false;
                }
                else {
                    phone.closest('.schedule-hero-form-input-gr').removeClass('error');
                }
                if(!schoolName.val()) {
                    schoolName.closest('.schedule-hero-form-input-gr').addClass('error');
                    isValid = false;
                }
                else {
                    schoolName.closest('.schedule-hero-form-input-gr').removeClass('error');
                }
                console.log(isValid);
                return isValid;
            }
            destroy() {
                super.destroy();
            }
        },
        'contact-benefit-wrap': class extends TriggerSetup {
            constructor() {
                super();
                this.onTrigger = () => {
                    this.animationReveal();
                }
            }
            animationReveal() {
                console.log('test', viewport.w);
                if(viewport.w < 992) {
                    this.initSwiper();
                }
            }
            initSwiper() {
                $('.contact-benefit-cms').addClass('swiper');
                $('.contact-benefit-item').addClass('swiper-slide');
                $('.contact-benefit-list').addClass('swiper-wrapper');
                let swiper = new Swiper('.contact-benefit-cms', {
                    slidesPerView: 'auto',
                    spaceBetween: cvUnit(16, 'rem'),
                    pagination: {
                        el: '.contact-benefit-pagi',
                        bulletClass: 'contact-benefit-pagi-item',
                        bulletActiveClass: 'active'
                    }
                });
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
        home: HomePage,
        faq: FaqPage,
        schedule: SchedulePage,
        contact: ContactPage
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
