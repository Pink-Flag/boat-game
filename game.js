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

let ball, levelSize;

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
  {
    if (!ball && (mouseWasPressed(0) || gamepadWasPressed(0))) {
      ball = new Ball();
      // ball = vec2(1, 2);
      console.log(ball.pos.length(), "length????");
      // ball.velocity.x = -1;
      // ball.velocity.y = -1;
    }
  }
  if (keyWasPressed(37, 0)) {
    //left

    ball.velocity.x -= 0.5;
    // ball.pos.rotate(10);
    // ball.angleVelocity -= 0.01;
    console.log(ball);

    console.log(ball.angle);
  }
  if (keyWasPressed(39, 0)) {
    //right
    ball.velocity.x += 0.5;
    // ball.pos.rotate(10);
    console.log(ball.angle);

    // ball.angleVelocity += 0.01;
    console.log(ball);
  }
  if (keyWasPressed(40, 0)) {
    //down
    ball.velocity.y -= 0.5;
  }
  if (keyWasPressed(38, 0)) {
    //up
    ball.velocity.y += 0.5;
    console.log(ball);
  }
  if (ball) {
    // console.log(ball.pos, ball.pos.length());
    console.log(ball.pos.normalize(ball.pos.length()));
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
    "Hello Boat",
    vec2(overlayCanvas.width / 2, 80),
    80,
    new Color(),
    9
  );
}

///////////////////////////////////////////////////////////////////////////////
// Startup LittleJS Engine
engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost);
