/*
    LittleJS Hello World Starter Game
*/

class Ball extends EngineObject {
  constructor(pos) {
    super(pos, vec2(1), 0);

    // make a bouncy ball
    this.setCollision(1);
    this.velocity = vec2(-1, -1).scale(0.2);
    this.elasticity = 1;
    this.damping = 0.8;
  }

  update() {
    // if (this.pos.y < 0) {
    //   // destroy ball if it goes below the level
    //   ball = 0;
    //   this.destroy();
    // }

    // // bounce on sides and top
    // const nextPos = this.pos.x + this.velocity.x;
    // if (
    //   nextPos - this.size.x / 2 < 0 ||
    //   nextPos + this.size.x / 2 > levelSize.x
    // ) {
    //   this.velocity.x *= -1;
    //   this.bounce();
    // }
    // if (this.pos.y + this.velocity.y > levelSize.y) {
    //   this.velocity.y *= -1;
    //   this.bounce();
    // }

    // update physics
    super.update();
  }

  collideWithObject(o) {
    if (o == paddle && this.velocity.y < 0) {
      // put english on the ball when it collides with paddle
      this.velocity = this.velocity.rotate(0.2 * (this.pos.x - o.pos.x));
      this.velocity.y = max(abs(this.velocity.y), 0.2);
      this.bounce();
      return 0;
    }
    return 1;
  }

  bounce() {
    // speed up
    const speed = min(1.1 * this.velocity.length(), 1);
    this.velocity = this.velocity.normalize(speed);
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
    // spawn ball
    if (!ball && (mouseWasPressed(0) || gamepadWasPressed(0))) {
      ball = new Ball(vec2(1, 1));
      ball.velocity.x = -1;
      ball.velocity.y = -1;
      console.log(ball);
    }
  }
  if (keyWasPressed(37, 0)) {
    ball.velocity.x -= 1;
  }
  if (keyWasPressed(39, 0)) {
    ball.velocity.x += 1;
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
