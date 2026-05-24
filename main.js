const ball = document.querySelector(".tennis-ball");
const ballSize = 36;
const topStart = 12;
const bottomEndGap = 18;
const bounceCount = 3;

let vh = window.innerHeight;
let vw = window.innerWidth;

// Fixed horizontal position: 90% from left edge, but with a small margin from the right edge
// This keeps the ball aligned with the scrollbar area
function getFixedRightPosition() {
    // Place the ball so its right edge is 16px from the viewport's right edge
    const rightMargin = 6;
    return vw - ballSize - rightMargin;
}

function updateBallMotion() {
    const scrollTop = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    let progress = maxScroll > 0 ? scrollTop / maxScroll : 0;
    progress = Math.min(1, Math.max(0, progress));

    // Update viewport dimensions (in case of zoom/resize)
    vw = window.innerWidth;
    vh = window.innerHeight;

    // Vertical position (same as before)
    const maxY = vh - ballSize - bottomEndGap;
    const y = topStart + (progress * (maxY - topStart));

    // Fixed horizontal position: near the right edge (like a scrollbar)
    const fixedLeft = getFixedRightPosition();

    // Bounce effect: temporarily move left, then return to fixedLeft
    const bouncePhase = (progress * bounceCount) % 1;
    // Parabola from 0 to 1 and back to 0
    const parabola = 4 * bouncePhase * (1 - bouncePhase);
    // How far left it swings – 6% of viewport width, max 40px
    const swingDistance = Math.min(vw * 0.06, 40);
    const leftOffset = parabola * swingDistance; // moves left during bounce

    // Final left edge = fixed position - left offset (so it goes left and returns)
    let finalLeft = fixedLeft - leftOffset;

    // Clamp to keep ball fully inside the viewport
    finalLeft = Math.min(Math.max(finalLeft, 0), vw - ballSize);

    // Convert left edge to the required translateX value
    // The ball is fixed at left: 50%, so its left edge is at (vw/2 - ballSize + translateX)
    // Solve: finalLeft = vw/2 - ballSize + xOffset  →  xOffset = finalLeft - vw/2 + ballSize
    const xOffset = finalLeft - (vw * 0.5) + ballSize;

    // Rotation
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
});

updateBallMotion();

// (The rest of your active nav and smooth scroll code remains unchanged)
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