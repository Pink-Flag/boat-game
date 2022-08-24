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
  let xSpeed = 0;
  let ySpeed = 0;
  let speed = 0;

  if (!ball) {
    ball = new Ball();
    // ball = vec2(1, 2);
    // console.log(ball.pos.length(), "length????");
    // ball.velocity.x = -1;
    // ball.velocity.y = -1;
  }

  if (keyWasPressed(37, 0)) {
    //left
    xSpeed = -2;
    ball.angle -= 0.785;
  }
  if (keyWasPressed(39, 0)) {
    //right
    xSpeed = 2;
    ball.angle += 0.785;
  }
  if (keyWasPressed(40, 0)) {
    //down
    ySpeed = -2;
  }
  if (keyWasPressed(38, 0)) {
    //up
    ySpeed = 2;
    speed = 0.5;
    ball.applyForce(mousePos);
  }
  if (ball) {
    // console.log("Hello or something");

    // ball.angle = Math.atan2(mousePos.x, mousePos.y);
    let angle = ball.angle;

    if (angle < 0) {
      angle += 2 * Math.PI;
      console.log(angle, " <<<< in if");
    } else {
      console.log(angle);
    }
    // if (mouseWasPressed(0)) {
    ball.pos.x = ball.pos.x + speed * Math.sin(angle);
    ball.pos.y = ball.pos.y + speed * Math.cos(angle);
    // }
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
    "Good afternoon Boat",
    vec2(overlayCanvas.width / 2, 80),
    80,
    new Color(),
    9
  );
}

///////////////////////////////////////////////////////////////////////////////
// Startup LittleJS Engine
engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost);
