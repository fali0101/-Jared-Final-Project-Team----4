// # User input mechanic
// # Mechanism: mouse press, drag, release, keyboard, buttons.
// # Pattern: navigation cards, scratch marks, yarn control, score clicks, modal buttons.
// # Function: lets the player choose modes and directly control one active object at a time.
// # Color: cream buttons, dark text, switchable cat-paw colours.
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

function drawScratchPreview(x, y) {
  push();
  translate(x, y + 18);
  stroke(96, 66, 46, 170);
  strokeWeight(1.5);
  line(-22, -28, -5, 24);
  line(0, -30, 10, 25);
  line(19, -25, 27, 20);
  drawPawShape(0, 18, 0.68, CAT_COLORS[2], false);
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


function drawScratch() {
  drawScratchBackground();
  if (BUILD_STEP >= 5) drawQuietThemeBits('scratch');
  drawTopBar('Scratch Studio', CAT_COLORS[selectedColor].name);
  updateScratchMarks();
  updateDebris();
  updateCurlBits();
  updateBonusBursts();
  if (BUILD_STEP >= 4) updateScratchCats();
  if (mouseIsPressed && mouseY > 90) addScratchAt(mouseX, mouseY, pmouseX, pmouseY);
  if (BUILD_STEP >= 6) drawPeekCat(width / 2, height - 8, 1.08, CAT_COLORS[selectedColor], 'open');
  drawButton(buttons.clear, '#fff2d7', '#403b33');
}

function drawScratchBackground() {
  background(246, 239, 228);
  noStroke();
  fill(236, 222, 203);
  rect(0, 80, width, height - 80);
  stroke(208, 183, 149, 86);
  for (let x = 0; x < width; x += 18) line(x, 80, x + map(noise(x * 0.03, frameCount * 0.001), 0, 1, -3, 3), height);
}

// # User Input
function addScratchAt(x, y, px, py) {
  if (dist(x, y, px, py) < 7 || frameCount % 4 !== 0) return;
  beginAudio();
  if (scratchSound && frameCount % 13 === 0) scratchSound.play(0, 1, 0.18);
  const node = new ScratchSet(x, y, lastScratch);
  scratches.push(node);
  lastScratch = { x, y };
  if (BUILD_STEP >= 3 && random() < 0.34) debris.push(new Debris(x + random(-10, 10), y + random(-6, 8)));
  while (scratches.length > 150) scratches.splice(0, scratches.length - 150);
  while (debris.length > 65) debris.splice(0, debris.length - 65);
}

class ScratchSet {
  constructor(x, y, prev) {
    this.x = x;
    this.y = y;
    this.prev = prev && dist(x, y, prev.x, prev.y) < 288 ? prev : { x, y: y - 18 };
    this.offsets = [
      { x: -17, sy: -11, ey: 5, bend: -15 },
      { x: -6, sy: 0, ey: -8, bend: 10 },
      { x: 6, sy: 9, ey: 0, bend: -8 },
      { x: 17, sy: -4, ey: 12, bend: 14 }
    ];
    this.alpha = 220;
  }
  display() {
    stroke(92, 64, 44, this.alpha);
    strokeWeight(1.35);
    for (let off of this.offsets) {
      const sx = this.prev.x + off.x;
      const sy = this.prev.y + off.sy;
      const ex = this.x + off.x;
      const ey = this.y + off.ey;
      const dx = ex - sx;
      const dy = ey - sy;
      const len = max(1, sqrt(dx * dx + dy * dy));
      const nx = -dy / len;
      const ny = dx / len;
      const bend = off.bend + sin((this.x + off.x) * 0.035) * 7 + constrain(len * 0.06, 0, 12);
      noFill();
      bezier(
        sx, sy,
        sx + dx * 0.28 + nx * bend, sy + dy * 0.28 + ny * bend,
        sx + dx * 0.72 - nx * bend * 0.75, sy + dy * 0.72 - ny * bend * 0.75,
        ex, ey
      );
      noStroke();
      fill(91, 62, 43, this.alpha * 0.78);
      circle(ex, ey, 2.3);
      stroke(92, 64, 44, this.alpha);
    }
  }
}


function updateScratchMarks() { for (const s of scratches) s.display(); }

function drawTopBar(title, rightText) {
  noStroke();
  fill(255, 252, 247, 235);
  rect(buttons.home.x - buttons.home.w / 2, buttons.home.y - buttons.home.h / 2, buttons.home.w, buttons.home.h, 12);
  rect(width / 2 - 150, 16, 300, 46, 12);
  rect(width - 144, 16, 92, 46, 12);
  fill(48, 45, 41);
  textSize(16);
  textStyle(BOLD);
  text('HOME', buttons.home.x, buttons.home.y);
  text(title, width / 2, 39);
  textStyle(NORMAL);
  textSize(14);
  text(rightText, width - 98, 39);
  if (BUILD_STEP >= 7 && (gameState === 'scratch' || gameState === 'bubble')) {
    drawButton(buttons.prev, '#fffaf1', '#403b33');
    drawButton(buttons.next, '#fffaf1', '#403b33');
  }
  if (BUILD_STEP >= 7 && gameState === 'scratch') {
    fill(112, 96, 78);
    textSize(10);
    text('Use < > keys', width - 98, 67);
  }
}

function drawScoreBadge() {
  push();
  rectMode(CENTER);
  noStroke();
  fill(255, 252, 247, 230);
  rect(width - 250, 39, 100, 34, 10);
  fill(48, 45, 41);
  textSize(13);
  textStyle(BOLD);
  text('Score ' + score, width - 250, 39);
  textStyle(NORMAL);
  pop();
}

function drawButton(btn, bg, fg) {
  push();
  rectMode(CENTER);
  noStroke();
  fill(bg);
  rect(btn.x, btn.y, btn.w, btn.h, 14);
  stroke(255, 255, 255, 220);
  strokeWeight(2);
  noFill();
  rect(btn.x, btn.y, btn.w, btn.h, 14);
  noStroke();
  fill(fg);
  textSize(btn.label === 'X' ? 24 : 18);
  textStyle(BOLD);
  text(btn.label, btn.x, btn.y + 1);
  textStyle(NORMAL);
  pop();
}

function drawModal() {
  push();
  noStroke();
  fill(45, 52, 58, 70);
  rect(0, 0, width, height);
  rectMode(CENTER);
  fill(255, 252, 246, 246);
  rect(width / 2, height / 2, min(430, width - 48), 238, 18);
  stroke(222, 211, 196);
  strokeWeight(2);
  noFill();
  rect(width / 2, height / 2, min(430, width - 48), 238, 18);
  noStroke();
  fill(45, 42, 38);
  textStyle(BOLD);
  textSize(28);
  text('Congratulations', width / 2, height / 2 - 58);
  textStyle(NORMAL);
  textSize(16);
  fill(101, 88, 74);
  text(modalText, width / 2, height / 2 - 18);
  if (BUILD_STEP >= 7) {
    drawButton(buttons.modalHome, '#fff2d7', '#403b33');
    drawButton(buttons.modalClose, '#e7f3f5', '#403b33');
  }
  pop();
}

function mousePressed() {
  beginAudio();
  lastKickPoint = { x: mouseX, y: mouseY };
  if (modalOpen) {
    if (BUILD_STEP >= 7 && overButton(buttons.modalHome)) { gameState = 'home'; modalOpen = false; return false; }
    if (BUILD_STEP >= 7 && overButton(buttons.modalClose)) { modalOpen = false; return false; }
    return false;
  }
  if (gameState === 'home' && USE_MENU) {
    if (BUILD_STEP >= 2 && USE_SCRATCH && overButton(buttons.scratch)) { gameState = 'scratch'; return false; }
    if (BUILD_STEP >= 2 && USE_BUBBLE && overButton(buttons.bubble)) { gameState = 'bubble'; return false; }
    if (BUILD_STEP >= 4) grabHomeBall(mouseX, mouseY);
  }
  if (BUILD_STEP >= 4 && gameState === 'home' && !USE_MENU) grabHomeBall(mouseX, mouseY);
  if ((gameState === 'scratch' || gameState === 'bubble') && overButton(buttons.home)) { gameState = 'home'; return false; }
  if (gameState === 'scratch') {
    if (overButton(buttons.clear)) { scratches = []; debris = []; curlBits = []; lastScratch = null; return false; }
    if (BUILD_STEP >= 7 && overButton(buttons.prev)) { selectedColor = (selectedColor + CAT_COLORS.length - 1) % CAT_COLORS.length; return false; }
    if (BUILD_STEP >= 7 && overButton(buttons.next)) { selectedColor = (selectedColor + 1) % CAT_COLORS.length; return false; }
    if (mouseY > 92 && useScratchBonus(mouseX, mouseY)) return false;
    if (mouseY > 92) addScratchAt(mouseX, mouseY, mouseX, mouseY - 10);
  }
  if (gameState === 'bubble') {
    if (BUILD_STEP >= 7 && overButton(buttons.prev)) { selectedColor = (selectedColor + CAT_COLORS.length - 1) % CAT_COLORS.length; return false; }
    if (BUILD_STEP >= 7 && overButton(buttons.next)) { selectedColor = (selectedColor + 1) % CAT_COLORS.length; return false; }
  }
  if (BUILD_STEP >= 4 && gameState === 'bubble') {
    for (const s of swimmers) {
      if (s.contains(mouseX, mouseY)) {
        if (popSound) popSound.play(0, 1, 0.22);
        s.hit = 20;
        s.vanish = 24;
        score++;
        bursts.push(new PopBurst(s.x, s.y, s.c));
        if (BUILD_STEP >= 6 && score >= nextRewardScore) {
          modalText = random(PRAISE);
          modalOpen = true;
          nextRewardScore += 10;
        }
        break;
      }
    }
  }
  return false;
}

function mouseDragged() {
  if (BUILD_STEP >= 4 && gameState === 'home') {
    dragHomeBall(mouseX, mouseY);
    lastKickPoint = { x: mouseX, y: mouseY };
  }
  if (!modalOpen && gameState === 'scratch') {
    if (!useScratchBonus(mouseX, mouseY)) addScratchAt(mouseX, mouseY, pmouseX, pmouseY);
  }
  return false;
}

function mouseReleased() {
  lastScratch = null;
  lastKickPoint = null;
  releaseHomeBall();
  return false;
}

function keyPressed() {
  beginAudio();
  if (BUILD_STEP >= 7 && (gameState === 'scratch' || gameState === 'bubble')) {
    if (keyCode === LEFT_ARROW) selectedColor = (selectedColor + CAT_COLORS.length - 1) % CAT_COLORS.length;
    if (keyCode === RIGHT_ARROW) selectedColor = (selectedColor + 1) % CAT_COLORS.length;
  }
  return false;
}

function beginAudio() {
  if (audioStarted) return;
  userStartAudio();
  audioStarted = true;
}

// # Drag Kick
function grabHomeBall(x, y) {
  activeBall = null;
  for (let i = yarnBalls.length - 1; i >= 0; i--) {
    const ball = yarnBalls[i];
    if (dist(x, y, ball.x, ball.y) < ball.r + 28) {
      activeBall = ball;
      ballGrab = { x: ball.x - x, y: ball.y - y };
      ballDragNow = { x, y };
      ballDragPrev = { x, y };
      ball.vx = 0;
      ball.vy = 0;
      ball.flying = true;
      return true;
    }
  }
  return false;
}

function dragHomeBall(x, y) {
  if (!activeBall) return false;
  ballDragPrev = ballDragNow || { x, y };
  ballDragNow = { x, y };
  activeBall.x = x + ballGrab.x;
  activeBall.y = constrain(y + ballGrab.y, activeBall.r + 8, height - activeBall.r - 10);
  activeBall.phase += 0.18;
  return true;
}

function releaseHomeBall() {
  if (!activeBall) return;
  const dx = ballDragNow && ballDragPrev ? ballDragNow.x - ballDragPrev.x : mouseX - pmouseX;
  const dy = ballDragNow && ballDragPrev ? ballDragNow.y - ballDragPrev.y : mouseY - pmouseY;
  const mag = constrain(sqrt(dx * dx + dy * dy), 1, 58);
  const angle = atan2(dy, dx);
  activeBall.vx = constrain(cos(angle) * mag * 0.32, -13, 13);
  activeBall.vy = constrain(sin(angle) * mag * 0.27, -11, 11);
  if (abs(activeBall.vx) < 2.2) activeBall.vx = dx >= 0 ? 2.2 : -2.2;
  activeBall.flying = true;
  activeBall.phase += 0.7;
  activeBall = null;
  ballDragNow = null;
  ballDragPrev = null;
}

function overButton(btn) {
  return btn && mouseX > btn.x - btn.w / 2 && mouseX < btn.x + btn.w / 2 && mouseY > btn.y - btn.h / 2 && mouseY < btn.y + btn.h / 2;
}

// # Shape: user-controlled paw cursor and mouse-follow cat eyes.
function drawPeekCat(x, y, sc, catColor, mood) {
  push();
  translate(x, y);
  scale(sc);
  const fur = color(catColor.fur);
  const dark = color(catColor.line);
  noStroke();
  fill(45, 38, 32, 26);
  ellipse(0, 28, 190, 18);
  fill(fur);
  if (mood === 'focus') {
    beginShape();
    vertex(-78, 18);
    vertex(-78, -39);
    bezierVertex(-88, -68, -91, -96, -68, -79);
    bezierVertex(-38, -58, -24, -56, -5, -61);
    bezierVertex(16, -57, 39, -63, 53, -102);
    bezierVertex(65, -119, 75, -66, 76, -28);
    vertex(76, 18);
    endShape(CLOSE);
    triangle(-78, -21, -111, -10, -78, 0);
    triangle(76, -23, 112, -12, 76, -3);
  } else {
    rect(-78, -58, 156, 82, 18);
    triangle(-70, -52, -55, -112, -22, -54);
    triangle(28, -54, 64, -112, 75, -50);
    ellipse(-108, 12, 48, 24);
    ellipse(108, 12, 48, 24);
  }
  stroke(dark);
  strokeWeight(2);
  if (mood === 'focus') {
    line(-78, -1, -132, -12);
    line(-77, 7, -132, 6);
    line(-77, 15, -126, 25);
    line(78, -1, 132, -12);
    line(77, 7, 132, 6);
    line(77, 15, 126, 25);
  } else {
    line(-80, -2, -122, -12);
    line(-80, 7, -124, 7);
    line(-80, 16, -120, 25);
    line(80, -2, 122, -12);
    line(80, 7, 124, 7);
    line(80, 16, 120, 25);
  }
  noStroke();
  const left = mood === 'focus' ? { x: -33, y: -19 } : { x: -34, y: -23 };
  const right = mood === 'focus' ? { x: 33, y: -19 } : { x: 34, y: -23 };
  const blink = frameCount % 220 > 207;
  fill('#ffffff');
  if (mood === 'focus') {
    drawCatEyeWhite(left.x, left.y, 52, 32, -0.26);
    drawCatEyeWhite(right.x, right.y, 52, 32, 0.26);
  } else {
    ellipse(left.x, left.y, 48, 54);
    ellipse(right.x, right.y, 48, 54);
  }
  fill(30);
  const maxX = mood === 'focus' ? 6 : 8;
  const maxY = mood === 'focus' ? 3 : 7;
  const pupilH = mood === 'focus' ? 10 : 27;
  const lx = BUILD_STEP >= 7 ? constrain((mouseX - (x + left.x * sc)) * 0.018, -maxX, maxX) : 0;
  const ly = BUILD_STEP >= 7 ? constrain((mouseY - (y + left.y * sc)) * 0.014, -maxY, maxY) : 0;
  const rx = BUILD_STEP >= 7 ? constrain((mouseX - (x + right.x * sc)) * 0.018, -maxX, maxX) : 0;
  const ry = BUILD_STEP >= 7 ? constrain((mouseY - (y + right.y * sc)) * 0.014, -maxY, maxY) : 0;
  if (blink) {
    stroke(30);
    strokeWeight(3);
    line(left.x - 18, left.y - 1, left.x + 18, left.y - 1);
    line(right.x - 18, right.y - 1, right.x + 18, right.y - 1);
    noStroke();
  } else if (mood === 'focus') {
    ellipse(left.x + lx, left.y + ly - 2, 7, pupilH);
    ellipse(right.x + rx, right.y + ry - 2, 7, pupilH);
  } else {
    rect(left.x + lx - 2.5, left.y + ly - pupilH / 2, 5, pupilH, 3);
    rect(right.x + rx - 2.5, right.y + ry - pupilH / 2, 5, pupilH, 3);
  }
  if (mood !== 'focus') {
    fill(catColor.pad);
    triangle(-6, 5, 6, 5, 0, 11);
  }
  pop();
}

function drawCatEyeWhite(cx, cy, w, h, tilt) {
  push();
  translate(cx, cy);
  rotate(tilt);
  beginShape();
  vertex(-w * 0.5, -h * 0.06);
  bezierVertex(-w * 0.28, -h * 0.36, w * 0.16, -h * 0.42, w * 0.5, -h * 0.23);
  bezierVertex(w * 0.44, h * 0.25, w * 0.03, h * 0.42, -w * 0.35, h * 0.28);
  bezierVertex(-w * 0.48, h * 0.18, -w * 0.53, h * 0.04, -w * 0.5, -h * 0.06);
  endShape(CLOSE);
  pop();
}

function drawPawCursor(x, y, c, pressed) {
  push();
  translate(x, y);
  drawPawShape(0, 0, pressed ? 0.72 : 0.6, c, pressed);
  pop();
}

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

function drawSoftClaw(x, y, rot) {
  push();
  translate(x, y);
  rotate(rot);
  scale(0.67);
  beginShape();
  vertex(-1.5, 1);
  bezierVertex(-2.8, -1.8, -1.8, -5.8, 0, -6.8);
  bezierVertex(1.8, -5.8, 2.8, -1.8, 1.5, 1);
  bezierVertex(0.7, 1.7, -0.7, 1.7, -1.5, 1);
  endShape(CLOSE);
  pop();
}