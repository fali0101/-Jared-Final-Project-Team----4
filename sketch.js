// # Time-based
// # Mechanism: Time-based
// # Pattern: edge-to-edge rolling yarn and menu cards.
// # Function: home scene, mode cards, paw preview, walking home cats.
// # Color: warm cream floor and soft yarn colors.
// # PawPlay Modes
const MECHANIC = 'time';
const BUILD_STEP = 1;
const USE_MENU = true;
const USE_SCRATCH = true;
const USE_BUBBLE = true;
const USE_NOISE = false;

let gameState = 'home';
let buttons = {};
let yarnBalls = [];
let homeCats = [];
let scratchCats = [];
let bubbleCats = [];
let swimmers = [];
let bubbles = [];
let bursts = [];
let scratches = [];
let debris = [];
let curlBits = [];
let lastScratch = null;
let nextHomeCat = 90;
let nextScratchCat = 300;
let nextBubbleCat = 420;
let homeCatIndex = 0;
let scratchCatIndex = 0;
let bubbleCatIndex = 0;
let selectedColor = 2;
let scratchEnergy = 0;
let score = 0;
let nextRewardScore = 10;
let modalOpen = false;
let modalText = 'You noticed a gentle detail.';
let scratchSound, popSound;
let audioStarted = false;
let bonusReady = false;
let bonusBursts = [];
let lastKickPoint = null;
let activeBall = null;
let ballGrab = { x: 0, y: 0 };
let ballDragNow = null;
let ballDragPrev = null;

// # Cat Colors
const CAT_COLORS = [
  { name: 'black', fur: '#2b2929', pad: '#eab0b5', line: '#171313' },
  { name: 'cream', fur: '#efe6d4', pad: '#e4b2a1', line: '#b9a28b' },
  { name: 'ginger', fur: '#c99555', pad: '#ebb3a4', line: '#8f6038' },
  { name: 'white', fur: '#f7f3ea', pad: '#ebaeb5', line: '#b4aaa0' },
  { name: 'gray', fur: '#8f918d', pad: '#dfb4ba', line: '#5c5e5b' }
];

const PRAISE = [
  'Keep going at your own pace.',
  'You are observing beautifully.',
  'Small focus can become calm.',
  'Nice work, stay curious.',
  'Let the motion guide you.'
];

function preload() {
  soundFormats('wav');
  scratchSound = loadSound('assets/audio/scratch.wav');
  popSound = loadSound('assets/audio/bubble_pop.wav');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  textFont('Arial');
  textAlign(CENTER, CENTER);
  noCursor();
  noiseSeed(27);
  randomSeed(46);
  buildButtons();
  buildYarn();
}

function buildButtons() {
  const gap = min(48, width * 0.05);
  const cardW = min(310, max(230, width * 0.34));
  const cardH = min(240, max(190, height * 0.28));
  buttons.scratch = { x: width / 2 - cardW / 2 - gap / 2, y: height * 0.54, w: cardW, h: cardH, label: 'Scratch Studio' };
  buttons.bubble = { x: width / 2 + cardW / 2 + gap / 2, y: height * 0.54, w: cardW, h: cardH, label: 'Bubble Bay' };
  buttons.home = { x: 80, y: 39, w: 124, h: 46, label: 'HOME' };
  buttons.clear = { x: width - 92, y: height - 58, w: 132, h: 48, label: 'CLEAR' };
  buttons.prev = { x: width - 166, y: 39, w: 34, h: 32, label: '<' };
  buttons.next = { x: width - 30, y: 39, w: 34, h: 32, label: '>' };
  buttons.modalHome = { x: width / 2 - 82, y: height / 2 + 78, w: 128, h: 44, label: 'HOME' };
  buttons.modalClose = { x: width / 2 + 82, y: height / 2 + 78, w: 128, h: 44, label: 'X' };
}

function buildYarn() {
  yarnBalls = [];
  for (let i = 0; i < 9; i++) {
    const dir = i % 2 === 0 ? 1 : -1;
    const startX = dir === 1 ? -random(70, width + 260) : width + random(70, width + 260);
    yarnBalls.push({
      x: startX,
      y: height * random(0.68, 0.91),
      r: random(18, 48),
      c: random(['#debd55', '#6d9dc5', '#d7835f', '#92b99b', '#9b8bb6']),
      speed: random(0.42, 1.12),
      dir,
      vx: 0,
      vy: 0,
      flying: false,
      phase: random(TWO_PI),
      born: frameCount - random(220)
    });
  }
}

function draw() {
  drawHome();
}

function drawHome() {
  drawCreamBackground();
  if (BUILD_STEP >= 5) drawQuietThemeBits('home');
  drawTimeBackground();
  if (USE_MENU) {
    drawMenuTitle();
    if (USE_SCRATCH) drawModeCard(buttons.scratch, 'Scratch Studio', 'User Input', drawScratchPreview);
    if (USE_BUBBLE) drawModeCard(buttons.bubble, 'Bubble Bay', 'Noise + Random', drawBubblePreview);
  } else {
    fill(43, 42, 39);
    noStroke();
    textSize(56);
    textStyle(BOLD);
    text('PAWPLAY', width / 2, height * 0.28);
    textStyle(NORMAL);
    textSize(18);
    fill(107, 96, 83);
    text('Time-based', width / 2, height * 0.28 + 54);
  }
}

function drawMenuTitle() {
  fill(45, 42, 38);
  textSize(42);
  textStyle(BOLD);
  text('Choose a Mode', width / 2, height * 0.19);
  textStyle(NORMAL);
}

function drawModeCard(btn, title, tag, previewFn) {
  push();
  rectMode(CENTER);
  noStroke();
  fill(255, 252, 246, 236);
  rect(btn.x, btn.y, btn.w, btn.h, 18);
  stroke(220, 211, 197);
  strokeWeight(2);
  noFill();
  rect(btn.x, btn.y, btn.w, btn.h, 18);
  fill(246, 238, 226);
  noStroke();
  rect(btn.x, btn.y - 42, 96, 96, 16);
  previewFn(btn.x, btn.y - 42);
  fill(52, 49, 45);
  textSize(22);
  textStyle(BOLD);
  text(title, btn.x, btn.y + 42);
  textStyle(NORMAL);
  fill(126, 111, 94);
  textSize(13);
  text(tag, btn.x, btn.y + 72);
  pop();
}

function drawBubblePreview(x, y) {
  push();
  translate(x, y);
  noStroke();
  fill(180, 225, 244);
  rect(-40, -40, 80, 80, 14);
  drawSeaCreature(-12, -3, 0.55, '#79aee0', 1, 'fish');
  drawSeaCreature(23, 13, 0.5, '#b9a7df', -1, 'jelly');
  stroke(255, 255, 255, 180);
  noFill();
  circle(20, -22, 12);
  circle(-28, 22, 9);
  pop();
}

function drawCreamBackground() {
  background(250, 247, 239);
  noStroke();
  for (let i = 0; i < 80; i++) {
    fill(120, 108, 88, 9);
    circle((i * 97 + 132) % width, (i * 53 + 204) % height, 1 + (i % 3));
  }
}

// # Time-Based
function drawTimeBackground() {
  noStroke();
  fill(239, 231, 217);
  rect(0, height * 0.63, width, height * 0.37);
  stroke(214, 200, 179, 150);
  strokeWeight(1);
  for (let x = 0; x < width; x += 24) line(x, height * 0.66, x + 18, height);

  for (const ball of yarnBalls) {
    updateYarnMotion(ball);
    drawYarnBall(ball.x, ball.y, ball.r, ball.c, frameCount * 0.035 * ball.dir + ball.x * 0.01);
  }

  const delays = [150, 240, 360, 470, 610];
  if (frameCount >= nextHomeCat && homeCats.length < 5) {
    homeCats.push(new TimedCat('home', homeCatIndex));
    homeCatIndex++;
    nextHomeCat = frameCount + delays[homeCatIndex % delays.length];
  }
  for (let i = homeCats.length - 1; i >= 0; i--) {
    homeCats[i].update();
    homeCats[i].display();
    if (homeCats[i].done) homeCats.splice(i, 1);
  }
  drawHomeHint();
}

// # Time-based yarn: idle balls roll edge to edge; thrown balls land and keep rolling.
function updateYarnMotion(ball) {
  if (ball === activeBall) return;
  if (ball.flying) {
    ball.vy += 0.26;
    ball.x += ball.vx;
    ball.y += ball.vy;
    ball.vx *= 0.996;
    ball.vy *= 0.996;
    const top = ball.r + 8;
    const floor = height - ball.r - 10;
    if (ball.y > floor) {
      ball.y = floor;
      if (abs(ball.vy) < 1.4) {
        ball.flying = false;
        ball.dir = ball.vx >= 0 ? 1 : -1;
        ball.speed = constrain(abs(ball.vx), 0.55, 1.8);
        ball.vx = 0;
        ball.vy = 0;
      } else {
        ball.vy *= -0.68;
        ball.vx *= 0.94;
      }
    }
    if (ball.y < top) {
      ball.y = top;
      ball.vy *= -0.58;
    }
    if (ball.x < -ball.r * 2 || ball.x > width + ball.r * 2) resetYarnBall(ball);
  } else {
    ball.x += ball.speed * ball.dir;
    if ((ball.dir === 1 && ball.x - ball.r > width + 80) || (ball.dir === -1 && ball.x + ball.r < -80)) resetYarnBall(ball);
  }
}

function drawHomeHint() {
  push();
  textAlign(RIGHT, CENTER);
  textSize(12);
  textStyle(BOLD);
  noStroke();
  fill(85, 75, 64, 170);
  text('Drag to play yarn', width - 24, height - 24);
  textStyle(NORMAL);
  pop();
}

function resetYarnBall(ball) {
  ball.dir = random() < 0.5 ? -1 : 1;
  ball.r = random(18, 48);
  ball.x = ball.dir === 1 ? -random(ball.r + 60, ball.r + 180) : width + random(ball.r + 60, ball.r + 180);
  ball.y = height * random(0.68, 0.91);
  ball.c = random(['#debd55', '#6d9dc5', '#d7835f', '#92b99b', '#9b8bb6']);
  ball.speed = random(0.45, 1.35);
  ball.vx = 0;
  ball.vy = 0;
  ball.flying = false;
  ball.phase = random(TWO_PI);
  ball.born = frameCount;
}

class TimedCat {
  constructor(scene, index) {
    this.scene = scene;
    this.index = index;
    this.dir = index % 2 === 0 ? 1 : -1;
    this.x = this.dir === 1 ? -90 : width + 90;
    this.y = scene === 'home' ? height * (0.71 + (index % 4) * 0.05) : random(160, height - 110);
    this.speed = [0.95, 1.18, 1.35, 1.05, 1.25][index % 5];
    this.color = ['#d9b071', '#34383f', '#9fa2a0', '#f4efe4', '#c48642'][index % 5];
    this.ballR = [20, 24, 27, 22, 29][index % 5];
    // # Time-based cat marks: each walking cat may have no mark or one small mark.
    this.marks = buildCatMarks(index);
    this.done = false;
    this.phase = random(TWO_PI);
  }
  update() {
    this.x += this.speed * this.dir;
    this.pose = this.speed < 1.12 ? 'walk' : 'run';
    if (this.dir === 1 && this.x > width + 120) this.done = true;
    if (this.dir === -1 && this.x < -120) this.done = true;
  }
  display() {
    if (this.scene === 'home') {
      const bx = this.x + this.dir * 55 + sin(frameCount * 0.11 + this.phase) * 5;
      drawYarnBall(bx, this.y + 24, this.ballR, '#d8a449', frameCount * 0.12);
    }
    drawCat(this.x, this.y, this.scene === 'home' ? 0.78 : 0.58, this.color, this.dir, this.pose, this.marks);
  }
}

function buildCatMarks(index) {
  const options = [
    [],
    [{ x: -20, y: 16, w: 7, h: 6, kind: 'spot' }],
    [],
    [{ x: -7, y: 19, w: 8, h: 4, kind: 'stripe' }],
    [{ x: -18, y: 13, w: 5, h: 7, kind: 'spot' }],
    [],
    [{ x: 2, y: 15, w: 6, h: 5, kind: 'spot' }]
  ];
  return options[index % options.length];
}

// # User Input
// # Noise Random
// # Drag Kick
function drawYarnBall(x, y, r, c, rot) {
  push();
  translate(x, y);
  rotate(rot);
  noStroke();
  fill(65, 55, 45, 34);
  ellipse(4, r * 0.72, r * 1.6, r * 0.42);
  fill(c);
  circle(0, 0, r * 2);
  stroke(lerpColor(color(c), color(50, 45, 42), 0.45));
  strokeWeight(max(1.2, r * 0.08));
  noFill();
  arc(0, 0, r * 1.28, r * 0.72, -2.6, 0.2);
  arc(0, 0, r * 1.1, r * 1.2, 0.15, 2.6);
  arc(0, 0, r * 1.35, r * 1.55, 2.8, 5.7);
  stroke(255, 255, 255, 75);
  strokeWeight(1.2);
  arc(-r * 0.18, -r * 0.22, r * 0.72, r * 0.48, -2.4, -0.3);
  pop();
}

function drawCat(x, y, sc, c, dir, pose, marks = []) {
  push();
  translate(x, y);
  scale(dir * sc, sc);
  const body = color(c);
  const dark = lerpColor(body, color(32), 0.5);
  const step = pose === 'run' ? sin(frameCount * 0.16) * 5 : sin(frameCount * 0.1) * 3;
  const px = 5.2;
  noStroke();
  fill(45, 38, 32, 24);
  ellipse(4, 42, 82, 16);
  fill(body);
  rect(-30, 9, 54, 28, 5);
  rect(16, 0, 26, 25, 4);
  triangle(18, 1, 24, -14, 29, 1);
  triangle(33, 1, 40, -13, 41, 5);
  rect(-25, 34, px, 20 + step, 2);
  rect(-9, 34, px, 20 - step, 2);
  rect(8, 34, px, 20 + step, 2);
  rect(23, 32, px, 20 - step, 2);
  stroke(body);
  strokeWeight(5.5);
  noFill();
  arc(-34, 13, 36, 40, 2.8, 5.5);
  noStroke();
  fill(dark);
  for (const mark of marks) {
    if (mark.kind === 'stripe') rect(mark.x, mark.y, mark.w, mark.h, 2);
    else ellipse(mark.x + mark.w / 2, mark.y + mark.h / 2, mark.w, mark.h);
  }
  const blink = (frameCount + floor(abs(x))) % 180 > 164;
  if (blink) {
    stroke(34);
    strokeWeight(1.5);
    line(24, 10, 29, 10);
    line(34, 10, 39, 10);
    noStroke();
  } else {
    fill(255);
    rect(24, 7, 4, 6, 1);
    rect(34, 7, 4, 6, 1);
    fill(34);
    rect(25, 9, 2, 3);
    rect(35, 9, 2, 3);
  }
  rect(30, 16, 4, 2, 1);
  stroke(dark);
  strokeWeight(1);
  line(22, 16, 10, 13);
  line(22, 20, 10, 22);
  line(39, 16, 50, 13);
  line(39, 20, 50, 22);
  if (pose === 'run') {
    stroke(95, 74, 57, 130);
    strokeWeight(1.2);
    line(26, 53, 37, 58);
  }
  pop();
}

// # Perlin noise and randomness: quiet themed bits for home and Scratch.
// # Cat Head Follow
function drawPawShape(x, y, sc, c, pressed) {
  push();
  translate(x, y);
  scale(sc);
  noStroke();
  fill(c.fur);
  ellipse(0, 4, 25, 20);
  ellipse(-16, -8, 9, 13);
  ellipse(-5, -16, 9, 13);
  ellipse(6, -16, 9, 13);
  ellipse(17, -8, 9, 13);
  fill(c.pad);
  ellipse(0, 7, 11, 8);
  ellipse(-16, -8, 4, 6);
  ellipse(-5, -16, 4, 6);
  ellipse(6, -16, 4, 6);
  ellipse(17, -8, 4, 6);
  if (pressed) {
    fill(c.line);
    drawSoftClaw(-15, -15, -0.16);
    drawSoftClaw(-5, -22, -0.02);
    drawSoftClaw(6, -22, 0.02);
    drawSoftClaw(16, -15, 0.16);
  }
  pop();
}

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

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  buildButtons();
  buildYarn();
}

