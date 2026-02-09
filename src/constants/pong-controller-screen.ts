/**
 * Pong — Controller Screen Code (p5.js)
 *
 * Runs on the smartphone. Shows a vertical touch slider to
 * control the paddle position, plus the current score. Touch/drag
 * sends normalized paddle Y (0–1) to the game screen.
 */
export const PONG_CONTROLLER_SCREEN_CODE = `
var paddleY = 0.5;
var playerScore = 0, aiScore = 0;
var touchActive = false;
var trackTop, trackBottom;

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  trackTop = 120;
  trackBottom = height - 60;

  AirCade.onStateUpdate(function(state) {
    playerScore = state.playerScore;
    aiScore = state.aiScore;
  });
}

function draw() {
  background(20);

  // Score
  fill(255); noStroke(); textSize(32);
  text(playerScore + '  :  ' + aiScore, width / 2, 50);

  // Labels
  textSize(12);
  fill(100, 200, 255);
  text('YOU', width / 2 - 50, 50);
  fill(255, 100, 100);
  text('CPU', width / 2 + 50, 50);

  // Track line
  stroke(60); strokeWeight(4);
  line(width / 2, trackTop, width / 2, trackBottom);

  // Track endpoints
  noStroke(); fill(60);
  ellipse(width / 2, trackTop, 12);
  ellipse(width / 2, trackBottom, 12);

  // Paddle handle
  var handleY = trackTop + paddleY * (trackBottom - trackTop);
  fill(100, 200, 255);
  ellipse(width / 2, handleY, 64);
  fill(20); textSize(14);
  text('|||', width / 2, handleY);

  // Instruction
  fill(80); textSize(13);
  text('Slide to move paddle', width / 2, height - 28);
}

function touchStarted() {
  touchActive = true;
  updatePaddle();
  return false;
}

function touchMoved() {
  if (touchActive) updatePaddle();
  return false;
}

function touchEnded() {
  touchActive = false;
  return false;
}

function mouseDragged() {
  updatePaddle();
  return false;
}

function mousePressed() {
  updatePaddle();
  return false;
}

function updatePaddle() {
  var y = mouseY;
  if (touches && touches.length > 0) y = touches[0].y;
  paddleY = constrain((y - trackTop) / (trackBottom - trackTop), 0, 1);
  AirCade.sendInput('paddle_move', { y: paddleY });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  trackTop = 120;
  trackBottom = height - 60;
}
`;
