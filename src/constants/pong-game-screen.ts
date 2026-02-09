/**
 * Pong — Game Screen Code (p5.js)
 *
 * Runs on the big screen (Console). Renders the ball, both paddles,
 * score, and center line. Player paddle position is received from
 * the controller via AirCade.onPlayerInput(). AI paddle tracks the
 * ball. State is broadcast to the controller every frame.
 */
export const PONG_GAME_SCREEN_CODE = `
var ball, playerPaddle, aiPaddle;
var playerScore = 0, aiScore = 0;
var PADDLE_W = 15, PADDLE_H = 100, BALL_SIZE = 15;
var AI_SPEED = 4;
var gw, gh;

function setup() {
  createCanvas(windowWidth, windowHeight);
  gw = width; gh = height;
  resetBall(1);
  playerPaddle = { y: gh / 2 };
  aiPaddle = { y: gh / 2 };

  AirCade.onPlayerInput(function(input) {
    if (input.inputType === 'paddle_move') {
      playerPaddle.y = input.data.y * gh;
    }
  });
}

function draw() {
  background(20);

  // Center dashed line
  stroke(80); strokeWeight(2);
  for (var i = 0; i < gh; i += 30) line(gw / 2, i, gw / 2, i + 15);

  // Update ball
  ball.x += ball.vx;
  ball.y += ball.vy;

  // Bounce top / bottom
  if (ball.y - BALL_SIZE / 2 <= 0 || ball.y + BALL_SIZE / 2 >= gh) ball.vy *= -1;

  // Player paddle collision (left)
  if (
    ball.x - BALL_SIZE / 2 <= 50 + PADDLE_W &&
    ball.x - BALL_SIZE / 2 >= 50 &&
    ball.y >= playerPaddle.y - PADDLE_H / 2 &&
    ball.y <= playerPaddle.y + PADDLE_H / 2
  ) {
    ball.vx = abs(ball.vx) * 1.05;
    ball.vy += (ball.y - playerPaddle.y) * 0.1;
  }

  // AI paddle collision (right)
  if (
    ball.x + BALL_SIZE / 2 >= gw - 50 - PADDLE_W &&
    ball.x + BALL_SIZE / 2 <= gw - 50 &&
    ball.y >= aiPaddle.y - PADDLE_H / 2 &&
    ball.y <= aiPaddle.y + PADDLE_H / 2
  ) {
    ball.vx = -abs(ball.vx) * 1.05;
    ball.vy += (ball.y - aiPaddle.y) * 0.1;
  }

  // Speed cap
  ball.vx = constrain(ball.vx, -12, 12);
  ball.vy = constrain(ball.vy, -8, 8);

  // Scoring
  if (ball.x < 0) { aiScore++; resetBall(1); }
  else if (ball.x > gw) { playerScore++; resetBall(-1); }

  // AI movement
  if (aiPaddle.y < ball.y - 10) aiPaddle.y += AI_SPEED;
  else if (aiPaddle.y > ball.y + 10) aiPaddle.y -= AI_SPEED;
  aiPaddle.y = constrain(aiPaddle.y, PADDLE_H / 2, gh - PADDLE_H / 2);

  // Constrain player paddle
  playerPaddle.y = constrain(playerPaddle.y, PADDLE_H / 2, gh - PADDLE_H / 2);

  // Draw paddles
  noStroke(); rectMode(CENTER);
  fill(100, 200, 255);
  rect(50 + PADDLE_W / 2, playerPaddle.y, PADDLE_W, PADDLE_H, 4);
  fill(255, 100, 100);
  rect(gw - 50 - PADDLE_W / 2, aiPaddle.y, PADDLE_W, PADDLE_H, 4);

  // Draw ball
  fill(255);
  ellipse(ball.x, ball.y, BALL_SIZE);

  // Draw scores
  textSize(48); textAlign(CENTER, TOP);
  fill(100, 200, 255); text(playerScore, gw / 4, 30);
  fill(255, 100, 100); text(aiScore, 3 * gw / 4, 30);

  // Broadcast state to controller
  if (frameCount % 3 === 0) {
    AirCade.broadcastState({
      playerScore: playerScore,
      aiScore: aiScore,
      ballX: ball.x / gw,
      ballY: ball.y / gh
    });
  }
}

function resetBall(dir) {
  ball = { x: gw / 2, y: gh / 2, vx: 5 * dir, vy: random(-3, 3) };
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  gw = width; gh = height;
}
`;
