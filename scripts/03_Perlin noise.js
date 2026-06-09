// # Perlin noise and randomness mechanic
// # Mechanism: noise(), random positions, drifting particles, varied spawn timing.
// # Pattern: sea animals, bubbles, scratch debris, quiet theme details.
// # Function: makes the scenes feel organic without distracting from interaction.
// # Color: soft underwater blues and low-opacity decorative details.
function buildSwimmers() {
  swimmers = [];
  const count = USE_NOISE ? 6 : 0;
  for (let i = 0; i < count; i++) swimmers.push(new SeaAnimal(i));
}


class Debris {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = random(-0.55, 0.55);
    this.vy = random(0.35, 1.2);
    this.size = random(1.7, 3.4);
    this.life = random(34, 64);
    this.alpha = 135;
    this.spin = random(TWO_PI);
  }
  update() {
    this.vy += 0.035;
    this.x += this.vx;
    this.y += this.vy;
    this.spin += 0.06;
    this.life--;
    this.alpha *= 0.965;
  }
  display() {
    push();
    translate(this.x, this.y);
    rotate(this.spin);
    noStroke();
    fill(183, 139, 104, this.alpha);
    ellipse(0, 0, this.size * 1.5, this.size);
    pop();
  }
  dead() { return this.life <= 0 || this.y > height + 20 || this.alpha < 5; }
}

class CurlBit extends Debris {
  constructor(x, y) {
    super(x + random(-18, 18), y + random(-12, 12));
    this.size = random(5, 9);
    this.life = 90;
  }
  display() {
    noFill();
    stroke(150, 104, 71, this.alpha);
    strokeWeight(1.6);
    arc(this.x, this.y, this.size * 2, this.size * 1.3, 0, PI * 1.35);
  }
}

class BonusBurst {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.life = 80;
    this.alpha = 185;
  }
  update() {
    this.life--;
    this.alpha *= 0.96;
  }
  display() {
    stroke(82, 56, 40, this.alpha);
    strokeWeight(2);
    for (let i = 0; i < 4; i++) {
      const off = -18 + i * 12;
      line(this.x + off, this.y - 36, this.x + off + 4, this.y + 40);
    }
    noFill();
    stroke(154, 109, 75, this.alpha * 0.8);
    strokeWeight(1.4);
    arc(this.x - 28, this.y + 28, 28, 16, 0, PI * 1.35);
    arc(this.x + 30, this.y + 20, 24, 14, PI * 0.1, PI * 1.42);
  }
  dead() { return this.life <= 0 || this.alpha < 5; }
}


function updateDebris() {
  for (let i = debris.length - 1; i >= 0; i--) {
    debris[i].update();
    debris[i].display();
    if (debris[i].dead()) debris.splice(i, 1);
  }
}

function updateCurlBits() {
  for (let i = curlBits.length - 1; i >= 0; i--) {
    curlBits[i].update();
    curlBits[i].display();
    if (curlBits[i].dead()) curlBits.splice(i, 1);
  }
}

function updateBonusBursts() {
  for (let i = bonusBursts.length - 1; i >= 0; i--) {
    bonusBursts[i].update();
    bonusBursts[i].display();
    if (bonusBursts[i].dead()) bonusBursts.splice(i, 1);
  }
}

function useScratchBonus(x, y) {
  if (!bonusReady) return false;
  bonusBursts.push(new BonusBurst(x, y));
  for (let i = 0; i < 8; i++) curlBits.push(new CurlBit(x, y));
  scratchEnergy = 0;
  bonusReady = false;
  return true;
}


function drawBubbleBay() {
  drawBubbleBack();
  drawTopBar('Bubble Bay', CAT_COLORS[selectedColor].name);
  if (BUILD_STEP >= 4) drawScoreBadge();
  if (!modalOpen) {
    if (BUILD_STEP >= 3) updateSwimmers(true);
    if (BUILD_STEP >= 3) updateBubbles(true);
    if (BUILD_STEP >= 4) updateBubbleCats();
  } else {
    if (BUILD_STEP >= 3) updateSwimmers(false);
    if (BUILD_STEP >= 3) updateBubbles(false);
  }
  if (BUILD_STEP >= 4) updateBursts();
  if (BUILD_STEP >= 6) drawPeekCat(width / 2, height - 8, 1.08, CAT_COLORS[selectedColor], 'focus');
}

function drawBubbleBack() {
  background(218, 242, 249);
  noStroke();
  for (let y = 0; y < height; y += 28) {
    fill(176, 222, 236, map(y, 0, height, 34, 112));
    rect(0, y, width, 28);
  }
  stroke(255, 255, 255, 38);
  strokeWeight(2);
  noFill();
  for (let i = 0; i < 8; i++) {
    beginShape();
    for (let x = -20; x <= width + 20; x += 30) vertex(x, height * 0.2 + i * 55 + sin(x * 0.012 + frameCount * 0.012 + i) * 8);
    endShape();
  }
}

// # Noise Random
function updateSwimmers(glow) {
  for (const s of swimmers) {
    s.update();
    s.display(glow);
  }
}

function updateBubbles(active) {
  if (active && bubbles.length < 7 && random() < 0.014) bubbles.push(new Bubble());
  for (let i = bubbles.length - 1; i >= 0; i--) {
    bubbles[i].update();
    bubbles[i].display();
    if (bubbles[i].dead()) bubbles.splice(i, 1);
  }
}

class SeaAnimal {
  constructor(i) {
    this.i = i;
    this.resetFromEdge();
    this.x = random(width);
  }
  resetFromEdge() {
    this.seed = random(1000);
    this.x = random() < 0.5 ? -random(90, 260) : width + random(90, 260);
    this.y = random(130, height - 70);
    this.size = random(0.74, 1.1);
    this.kind = random(['fish', 'whale', 'jelly', 'squid']);
    this.c = random(['#77a9d9', '#f2b46f', '#9bb9e7', '#8fc8bd', '#c6b2df']);
    this.speed = random(0.002, 0.0048);
    this.vanish = 0;
    this.hit = 0;
  }
  update() {
    if (this.vanish > 0) {
      this.vanish--;
      if (this.vanish === 0) this.resetFromEdge();
      return;
    }
    const tx = map(noise(this.seed, frameCount * this.speed), 0, 1, 60, width - 60);
    const ty = map(noise(this.seed + 80, frameCount * this.speed), 0, 1, 125, height - 60);
    this.x = lerp(this.x, tx, 0.01 + this.speed);
    this.y = lerp(this.y, ty, 0.01 + this.speed * 0.7);
    this.hit = max(0, this.hit - 1);
  }
  display(glow) {
    if (this.vanish > 0) return;
    const dir = noise(this.seed + 20, frameCount * 0.004) > 0.5 ? 1 : -1;
    if (glow && this.hit > 0) {
      noFill();
      stroke(255, 245, 176, map(this.hit, 0, 20, 0, 160));
      strokeWeight(3);
      circle(this.x, this.y, 58 * this.size);
    }
    drawSeaCreature(this.x, this.y, this.size, this.c, dir, this.kind);
  }
  contains(x, y) { return this.vanish === 0 && dist(x, y, this.x, this.y) < 38 * this.size; }
}

class Bubble {
  constructor() {
    this.x = random(35, width - 35);
    this.y = height + random(10, 60);
    this.r = random(7, 19);
    this.vy = random(0.45, 1.25);
    this.seed = random(1000);
    this.alpha = random(90, 155);
  }
  update() {
    this.y -= this.vy;
    this.x += map(noise(this.seed, frameCount * 0.01), 0, 1, -0.75, 0.75);
    this.alpha *= 0.998;
  }
  display() {
    noFill();
    stroke(255, 255, 255, this.alpha);
    strokeWeight(1.5);
    circle(this.x, this.y, this.r * 2);
    arc(this.x - this.r * 0.18, this.y - this.r * 0.2, this.r * 0.8, this.r * 0.6, PI, PI * 1.55);
  }
  dead() { return this.y < -40 || this.alpha < 20; }
}

class PopBurst {
  constructor(x, y, c) {
    this.x = x;
    this.y = y;
    this.c = c;
    this.life = 24;
  }
  update() { this.life--; }
  display() {
    push();
    translate(this.x, this.y);
    stroke(colorAlpha(this.c, map(this.life, 0, 24, 0, 190)));
    strokeWeight(2);
    noFill();
    for (let i = 0; i < 7; i++) {
      const a = i * TWO_PI / 7;
      const r = map(this.life, 24, 0, 8, 30);
      line(cos(a) * r * 0.35, sin(a) * r * 0.35, cos(a) * r, sin(a) * r);
    }
    pop();
  }
  dead() { return this.life <= 0; }
}

function updateBursts() {
  for (let i = bursts.length - 1; i >= 0; i--) {
    bursts[i].update();
    bursts[i].display();
    if (bursts[i].dead()) bursts.splice(i, 1);
  }
}


function drawSoftNoiseOverlay() {
  noStroke();
  for (let i = 0; i < 26; i++) {
    const x = noise(i * 9.1, frameCount * 0.002) * width;
    const y = noise(i * 11.7 + 50, frameCount * 0.0025) * height;
    fill(120, 132, 126, 10);
    circle(x, y, 2 + (i % 3));
  }
}

// # Perlin noise and randomness: quiet themed bits for home and Scratch.
function drawQuietThemeBits(scene) {
  push();
  noStroke();
  const count = scene === 'home' ? 18 : 14;
  for (let i = 0; i < count; i++) {
    const drift = frameCount * (scene === 'home' ? 0.18 : 0.26);
    const x = (noise(i * 4.7, frameCount * 0.002) * width + i * 71) % width;
    const y = (height * 0.12 + ((i * 83 + drift) % (height * 0.78)));
    const alpha = scene === 'home' ? 22 : 18;
    fill(scene === 'home' ? color(190, 165, 116, alpha) : color(128, 96, 62, alpha));
    if (scene === 'home') circle(x, y, 2 + (i % 3));
    else ellipse(x, y, 3 + (i % 2), 2);
  }
  pop();
}

// # Shape: sea creatures for the Perlin-noise Bubble Bay layer.
function drawSeaCreature(x, y, sc, c, dir, kind) {
  push();
  translate(x, y);
  scale(dir * sc, sc);
  const body = color(c);
  const light = lerpColor(body, color(255), 0.42);
  const lineC = lerpColor(body, color(45), 0.28);
  noStroke();
  if (kind === 'whale') {
    fill(body);
    ellipse(0, 0, 60, 32);
    triangle(26, -5, 46, -19, 41, 2);
    triangle(26, 5, 46, 19, 41, -2);
    fill(light);
    arc(-8, 4, 44, 28, 0.08, PI - 0.1, CHORD);
    fill(35);
    circle(-16, -5, 5);
    stroke(255, 255, 255, 130);
    strokeWeight(1.2);
    for (let i = 0; i < 4; i++) line(-24 + i * 7, 8, -19 + i * 6, 18);
  } else if (kind === 'jelly') {
    fill(body);
    arc(0, -2, 38, 32, PI, TWO_PI, CHORD);
    fill(light);
    arc(-4, -7, 22, 14, PI, TWO_PI, CHORD);
    stroke(lineC);
    strokeWeight(2);
    noFill();
    for (let i = -2; i <= 2; i++) {
      beginShape();
      for (let j = 0; j < 4; j++) vertex(i * 6 + sin(frameCount * 0.02 + j + i) * 3, 10 + j * 6);
      endShape();
    }
  } else if (kind === 'squid') {
    fill(body);
    ellipse(0, -4, 30, 42);
    triangle(-15, -9, 0, -32, 15, -9);
    fill(light);
    ellipse(0, -10, 16, 24);
    stroke(lineC);
    strokeWeight(2);
    for (let i = -2; i <= 2; i++) line(i * 5, 15, i * 7, 29 + abs(i) * 2);
    noStroke();
    fill(35);
    circle(-5, -2, 4);
    circle(5, -2, 4);
  } else {
    fill(body);
    ellipse(0, 0, 46, 25);
    triangle(21, 0, 39, -13, 38, 13);
    fill(light);
    ellipse(-8, -4, 18, 10);
    fill(35);
    circle(-15, -4, 5);
    stroke(lineC);
    strokeWeight(1.3);
    noFill();
    arc(3, 0, 10, 18, -1.1, 1.1);
    arc(12, 0, 10, 17, -1.1, 1.1);
  }
  pop();
}

function colorAlpha(hex, a) {
  const cc = color(hex);
  return color(red(cc), green(cc), blue(cc), a);
}

