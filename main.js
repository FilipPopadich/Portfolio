gsap.registerPlugin(ScrollTrigger);

const ball = document.querySelector(".tennis-ball");
const ballSize = 36;
const topStart = 12;
const bottomEndGap = 18;
const bounceCount = 3;

let vh = window.innerHeight;
let vw = window.innerWidth;

function getFixedRightPosition() {
    const rightMargin = 5;
    return vw - ballSize - rightMargin;
}

function updateBallMotion() {
    const scrollTop = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    let progress = maxScroll > 0 ? scrollTop / maxScroll : 0;
    progress = Math.min(1, Math.max(0, progress));
    vw = window.innerWidth;
    vh = window.innerHeight;
    const maxY = vh - ballSize - bottomEndGap;
    const y = topStart + (progress * (maxY - topStart));
    const fixedLeft = getFixedRightPosition();
    const bouncePhase = (progress * bounceCount) % 1;
    const parabola = 4 * bouncePhase * (1 - bouncePhase);
    const swingDistance = Math.min(vw * 0.06, 40);
    const leftOffset = parabola * swingDistance;
    let finalLeft = fixedLeft - leftOffset;
    finalLeft = Math.min(Math.max(finalLeft, 0), vw - ballSize);
    const xOffset = finalLeft - (vw * 0.5) + ballSize;
    const totalRotation = progress * bounceCount * 720;
    ball.style.transform = `translateX(calc(-100% + ${xOffset}px)) translateY(${y}px) rotate(${totalRotation}deg)`;
}

ScrollTrigger.create({
    trigger: "body",
    start: 0,
    end: "max",
    scrub: 0.75,
    onUpdate: updateBallMotion,
    invalidateOnRefresh: true
});

window.addEventListener("resize", () => {
    vh = window.innerHeight;
    vw = window.innerWidth;
    updateBallMotion();
    ScrollTrigger.refresh();
});

updateBallMotion();

const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

function updateActiveNavOnScroll() {
    const viewportMid = window.innerHeight / 2;
    let bestSectionId = null;
    let bestDistance = Infinity;

    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const sectionMid = rect.top + rect.height / 2;
        const distance = Math.abs(sectionMid - viewportMid);
        if (distance < bestDistance && rect.bottom > 50 && rect.top < window.innerHeight - 50) {
            bestDistance = distance;
            bestSectionId = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === `#${bestSectionId}`) {
            link.classList.add('active-nav');
        } else {
            link.classList.remove('active-nav');
        }
    });
}

window.addEventListener('scroll', updateActiveNavOnScroll);
window.addEventListener('resize', updateActiveNavOnScroll);
updateActiveNavOnScroll();

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === "#" || targetId === "#/" || targetId === "") return;
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
            e.preventDefault();
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            history.pushState(null, null, targetId);
            setTimeout(updateActiveNavOnScroll, 120);
        }
    });
});