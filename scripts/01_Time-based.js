// # Time-based mechanic
// # Mechanism: frameCount, velocity, sine motion, timed blinking.
// # Pattern: rolling yarn, walking cats, background rhythm, reward timing.
// # Function: keeps motion alive without needing user clicks.
// # Color: warm home tones and matching cat colours.
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


function updateScratchCats() {
  const gaps = [300, 360, 430, 330];
  if (frameCount > nextScratchCat) {
    scratchCats.push(new TimedCat('scratch', scratchCatIndex));
    scratchCatIndex++;
    nextScratchCat = frameCount + gaps[scratchCatIndex % gaps.length];
  }
  for (let i = scratchCats.length - 1; i >= 0; i--) {
    scratchCats[i].update();
    scratchCats[i].display();
    if (scratchCats[i].done) scratchCats.splice(i, 1);
  }
}


function updateBubbleCats() {
  const gaps = [480, 390, 560, 430];
  if (frameCount > nextBubbleCat) {
    bubbleCats.push(new TimedCat('scratch', bubbleCatIndex + 2));
    bubbleCatIndex++;
    nextBubbleCat = frameCount + gaps[bubbleCatIndex % gaps.length];
  }
  for (let i = bubbleCats.length - 1; i >= 0; i--) {
    bubbleCats[i].y = height - 95;
    bubbleCats[i].update();
    bubbleCats[i].display();
    if (bubbleCats[i].done) bubbleCats.splice(i, 1);
  }
}


function drawIdleBlinkCat(x, y, sc, c) {
  push();
  translate(x, y);
  scale(sc);
  const blink = (frameCount % 190) > 160;
  const body = color(c);
  noStroke();
  fill(45, 38, 32, 25);
  ellipse(0, 48, 76, 15);
  fill(body);
  rect(-28, 12, 50, 34, 8);
  rect(12, 2, 27, 28, 5);
  triangle(15, 4, 21, -13, 28, 4);
  triangle(31, 4, 40, -9, 39, 10);
  rect(-19, 42, 6, 18, 3);
  rect(11, 42, 6, 18, 3);
  stroke(body);
  strokeWeight(5);
  noFill();
  arc(-29, 20, 34, 38, 2.8, 5.4);
  stroke(40);
  strokeWeight(2);
  if (blink) {
    line(19, 11, 25, 11);
    line(31, 11, 37, 11);
  } else {
    fill(35);
    noStroke();
    rect(20, 9, 3, 4);
    rect(33, 9, 3, 4);
  }
  stroke(65, 55, 48, 140);
  strokeWeight(1);
  line(18, 18, 5, 15);
  line(18, 22, 5, 24);
  line(38, 18, 50, 15);
  line(38, 22, 50, 24);
  pop();
}

// # Cat Head Follow

// # Shape: yarn balls and walking cats for the time-based home motion.
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
  // # AI-assisted: ChatGPT helped organize this walking-cat leg animation; four legs move with frameCount sine timing.
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

