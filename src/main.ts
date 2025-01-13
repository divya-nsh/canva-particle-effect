const canvas = document.getElementById("cw") as HTMLCanvasElement;
const ctx = canvas?.getContext("2d") as CanvasRenderingContext2D;
const input = document.querySelector("#connecting-effect") as HTMLInputElement;

//Global Variables-----------------//
const cursor = {
  x: 0,
  y: 0,
};
let hue = 0;
let connectingEffect = false;
let maxParticleSize = 10;

//-------------------------------//
function getRandomSpeed(max = 5) {
  return Math.random() * max - max / 2;
}

class Particle {
  x = cursor.x;
  y = cursor.y;
  size = Math.floor(Math.random() * maxParticleSize);
  speedX = getRandomSpeed(3);
  speedY = getRandomSpeed(3);
  color = `hsl(${hue},100%,50%)`;
  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.size > 0) this.size -= 0.07;
  }
}

const particles = new Set<Particle>();

function drawParticles(count = 10, x?: number, y?: number) {
  for (let i = 0; i < count; i++) {
    const particle = new Particle();
    if (x) particle.x = x;
    if (y) particle.y = y;
    particle.draw();
    particles.add(particle);
  }
}

function animate() {
  ctx.fillStyle = `rgba(0, 0, 0, 0.1)`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const particlesArr = Array.from(particles.values());
  ctx.lineWidth = 0.5;
  //Update particles and Garbage Collect
  for (let i = 0; i < particlesArr.length; i++) {
    const particle = particlesArr[i];
    particle.draw();
    particle.update();
    if (particle.size <= 0) {
      particles.delete(particle);
    }
    if (!connectingEffect) continue;
    //Based on Pythagoras Theorem
    for (let j = i + 1; j < particlesArr.length; j++) {
      const nextParticle = particlesArr[j];
      const dx = Math.abs(particle.x - nextParticle.x);
      const dy = Math.abs(particle.y - nextParticle.y);
      const distance = Math.sqrt(dx * 2 + dy * 2);

      if (distance > 5 && distance < 20 && nextParticle.size > 0) {
        ctx.beginPath();
        ctx.strokeStyle = nextParticle.color;
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(nextParticle.x, nextParticle.y);
        ctx.stroke();
      }
    }
  }

  hue = hue >= 360 ? 0 : hue + 1;
  window.requestAnimationFrame(animate);
}

function setCanvaSize() {
  canvas.height = innerHeight;
  canvas.width = innerWidth;
}

animate();
setCanvaSize();

//-------------------------- Listners------------------------------------//
addEventListener("mousemove", (e) => {
  cursor.x = Math.floor(e.clientX);
  cursor.y = Math.floor(e.clientY);
  drawParticles(connectingEffect ? 2 : 20);
});

//preventDefault() & passive:false to disable browser pull-to-refresh in touch or mobile devices
addEventListener(
  "touchmove",
  (e) => {
    if (window.scrollY === 0 && e.touches[0].clientY > 0) {
      e.preventDefault();
    }

    cursor.x = Math.floor(e.touches[0].clientX);
    cursor.y = Math.floor(e.touches[0].clientY);
    drawParticles(connectingEffect ? 1 : 30);
  },
  { passive: false }
);

addEventListener("click", (e) => {
  // Speed boast particles
  for (let i = 0; i < 50; i++) {
    const particle = new Particle();
    particle.draw();
    particle.speedX = getRandomSpeed(10);
    particle.speedY = getRandomSpeed(10);
    particles.add(particle);
  }
});

addEventListener("resize", setCanvaSize);

const storedValue = localStorage.getItem("connecting-effect");
if (storedValue && storedValue === "1") {
  connectingEffect = true;
}

input.checked = connectingEffect;
input.addEventListener("click", (e) => {
  particles.clear();
  connectingEffect = !connectingEffect;
  localStorage.setItem("connecting-effect", connectingEffect ? "1" : "0");
  input.checked = connectingEffect;
});

document.querySelector(".option")?.addEventListener("click", (e) => {
  e.stopPropagation();
});
