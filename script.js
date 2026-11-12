class FuturisticAudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.masterGain = null;
    this.droneOsc1 = null;
    this.droneOsc2 = null;
    this.droneFilter = null;
    this.hasPlayedTouchChime = false;
  }
  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
  }
  startAmbient() {
    this.init();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (this.isPlaying) return;
    this.droneOsc1 = this.ctx.createOscillator();
    this.droneOsc2 = this.ctx.createOscillator();
    this.droneFilter = this.ctx.createBiquadFilter();
    this.droneOsc1.type = 'sawtooth';
    this.droneOsc1.frequency.setValueAtTime(65, this.ctx.currentTime);
    this.droneOsc2.type = 'sine';
    this.droneOsc2.frequency.setValueAtTime(130.8, this.ctx.currentTime);
    this.droneFilter.type = 'lowpass';
    this.droneFilter.frequency.setValueAtTime(220, this.ctx.currentTime);
    this.droneFilter.Q.setValueAtTime(2.5, this.ctx.currentTime);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.2, this.ctx.currentTime + 1.2);
    this.droneOsc1.connect(this.droneFilter);
    this.droneOsc2.connect(this.droneFilter);
    this.droneFilter.connect(gain);
    gain.connect(this.masterGain);
    this.droneOsc1.start();
    this.droneOsc2.start();
    this.isPlaying = true;
  }
  stopAmbient() {
    if (!this.isPlaying || !this.droneOsc1) return;
    try {
      this.droneOsc1.stop();
      this.droneOsc2.stop();
      this.droneOsc1.disconnect();
      this.droneOsc2.disconnect();
    } catch (e) {}
    this.isPlaying = false;
  }
  playTouchChime() {
    if (!this.isPlaying || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const chimeGain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.35);
    chimeGain.gain.setValueAtTime(0.12, now);
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
    osc.connect(chimeGain);
    chimeGain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 1.2);
  }
}
const audio = new FuturisticAudioEngine();
function init3DRobotHero() {
  const stage = document.getElementById("robotStage");
  const wrapper = document.getElementById("robotWrapper");
  const shadow = document.querySelector(".robot-floor-shadow");
  if (!stage || !wrapper) return;
  let mouseX = 0;
  let mouseY = 0;
  let currentRotX = 0;
  let currentRotY = 0;
  let isHovered = false;
  const maxTilt = 14;
  stage.addEventListener("mouseenter", () => {
    isHovered = true;
  });
  stage.addEventListener("mouseleave", () => {
    isHovered = false;
    mouseX = 0;
    mouseY = 0;
  });
  window.addEventListener("mousemove", (e) => {
    const rect = stage.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    mouseX = Math.max(-1, Math.min(1, x));
    mouseY = Math.max(-1, Math.min(1, y));
  });
  function renderRobot3D() {
    const targetY = mouseX * maxTilt;
    const targetX = -mouseY * maxTilt;
    currentRotX += (targetX - currentRotX) * 0.07;
    currentRotY += (targetY - currentRotY) * 0.07;
    wrapper.style.transform = `rotateX(${currentRotX.toFixed(2)}deg) rotateY(${currentRotY.toFixed(2)}deg) translateZ(40px)`;
    if (shadow) {
      const shadowX = -currentRotY * 1.8;
      const shadowScale = 1 - Math.abs(currentRotX) * 0.015;
      shadow.style.transform = `translateX(${shadowX}px) translateZ(-80px) scale(${shadowScale})`;
    }
    requestAnimationFrame(renderRobot3D);
  }
  requestAnimationFrame(renderRobot3D);
}
function initChromeHandsScroll() {
  const section = document.getElementById('handsSection');
  const leftHand = document.getElementById('leftHand');
  const rightHand = document.getElementById('rightHand');
  const centerText = document.getElementById('centerText');
  const scrollHint = document.getElementById('scrollHint');
  const touchSpark = document.getElementById('touchSpark');
  if (!section || !leftHand || !rightHand || !centerText) return;
  let targetProgress = 0;
  let currentProgress = 0;
  let mouseX = 0;
  let mouseY = 0;
  let hasTriggeredChime = false;
  window.addEventListener('scroll', () => {
    const rect = section.getBoundingClientRect();
    const sectionHeight = section.offsetHeight - window.innerHeight;
    const scrolledInside = -rect.top;
    const progress = scrolledInside / sectionHeight;
    targetProgress = Math.min(Math.max(progress, 0), 1);
    if (scrollHint) {
      scrollHint.style.opacity = targetProgress > 0.06 ? '0' : '1';
    }
  });
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 22;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 16;
  });
  function animateHands() {
    currentProgress += (targetProgress - currentProgress) * 0.08;
    const leftX = -105 + (currentProgress * 100);
    const rightX = 105 - (currentProgress * 100);
    const rotateAngle = (1 - currentProgress) * 5;
    const pFactor = currentProgress;
    const pX = mouseX * pFactor;
    const pY = mouseY * pFactor;
    leftHand.style.transform = `translate3d(calc(${leftX}% + ${pX}px), calc(-50% + ${pY}px), 0) rotate(${-rotateAngle}deg)`;
    rightHand.style.transform = `translate3d(calc(${rightX}% - ${pX}px), calc(-50% - ${pY}px), 0) rotate(${rotateAngle}deg)`;
    const textProgress = Math.min(Math.max((currentProgress - 0.65) / 0.28, 0), 1);
    centerText.style.opacity = textProgress;
    centerText.style.transform = `scale(${0.92 + textProgress * 0.08}) translate3d(0, ${(1 - textProgress) * 15}px, 0)`;
    if (touchSpark) {
      if (currentProgress > 0.90) {
        const sparkScale = Math.min((currentProgress - 0.90) / 0.10, 1);
        touchSpark.style.opacity = sparkScale;
        touchSpark.style.transform = `translate(-50%, -50%) scale(${sparkScale * 1.4})`;
        if (!hasTriggeredChime) {
          audio.playTouchChime();
          hasTriggeredChime = true;
        }
      } else {
        touchSpark.style.opacity = 0;
        touchSpark.style.transform = `translate(-50%, -50%) scale(0)`;
        hasTriggeredChime = false;
      }
    }
    requestAnimationFrame(animateHands);
  }
  requestAnimationFrame(animateHands);
}
document.addEventListener("DOMContentLoaded", () => {
  init3DRobotHero();
  initChromeHandsScroll();
  const soundBtn = document.getElementById("soundToggleBtn");
  const soundLabel = document.getElementById("soundLabel");
  if (soundBtn) {
    soundBtn.addEventListener("click", () => {
      if (!audio.isPlaying) {
        audio.startAmbient();
        soundBtn.classList.add("active");
        if (soundLabel) soundLabel.textContent = "AUDIO: LIVE";
      } else {
        audio.stopAmbient();
        soundBtn.classList.remove("active");
        if (soundLabel) soundLabel.textContent = "AUDIO: MUTED";
      }
    });
  }
});
