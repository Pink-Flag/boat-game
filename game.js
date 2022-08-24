/*
    LittleJS Hello World Starter Game
*/

class Ball extends EngineObject {
  constructor(pos) {
    super(pos, vec2(1, 3), 0);
    console.log(Ball);

    // make a bouncy ball
    this.setCollision(1);
    this.velocity = vec2(-1, -1).scale(0.2);
    this.elasticity = 1;
    this.damping = 0.95;
    this.angleVelocity = 0;
    this.gravityScale = 1;
    console.log(EngineObject);
  }
}

("use strict");

let ball, levelSize, angle;

// popup errors if there are any (help diagnose issues on mobile devices)
//onerror = (...parameters)=> alert(parameters);

// game variables
let particleEmiter;

// medals

///////////////////////////////////////////////////////////////////////////////
function gameInit() {
  // create tile collision and visible tile layer
  canvasFixedSize = vec2(1280, 720);
  levelSize = vec2(72, 40);
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdate() {
  let speed = 0.3;
  let friction = 0.96;

  if (!ball) {
    ball = new Ball();

    ball.velocity = vec2(1, 1);
  }

  if (keyWasPressed(37, 0)) {
    //left

    ball.angleVelocity -= 0.02;
  }
  if (keyWasPressed(39, 0)) {
    //right

    ball.angleVelocity += 0.02;
  }
  if (keyWasPressed(40, 0)) {
    //down
  }
  if (keyWasPressed(38, 0)) {
    //up
    console.log("up");
    ball.velocity.x += Math.sin(ball.angle) * speed;
    ball.velocity.y += Math.cos(ball.angle) * speed;
    // ball.velocity.x;
  } else {
    ball.velocity.x *= friction;
    ball.velocity.y *= friction;
  }
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdatePost() {}

///////////////////////////////////////////////////////////////////////////////
function gameRender() {
  // draw a grey square in the background without using webgl
}

///////////////////////////////////////////////////////////////////////////////
function gameRenderPost() {
  // draw to overlay canvas for hud rendering
  drawTextScreen(
    ball.angle,
    vec2(overlayCanvas.width / 2, 80),
    80,
    new Color(),
    9
  );
}

///////////////////////////////////////////////////////////////////////////////
// Startup LittleJS Engine
engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost);
