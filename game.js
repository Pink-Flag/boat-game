/*
    LittleJS Hello World Starter Game
*/

class Boat extends EngineObject {
  constructor(pos) {
    super(pos, vec2(1, 3), 0);

    // this.setCollision(1);

    this.damping = 0.95;
    this.angleVelocity = 0;
  }
  update() {
    const nextPos = this.pos.x + this.velocity.x;
    console.log(nextPos);
    if (
      nextPos - this.size.x / 2 < 0 ||
      nextPos + this.size.x / 2 > levelSize.x
    ) {
      console.log("hitting x");
      // this.velocity.x *= -1;
      // this.bounce();
    }
    if (this.pos.y + this.velocity.y > levelSize.y) {
      // this.velocity.y *= -1;
      console.log("hitting y");
      // this.bounce();
    }
    super.update();
  }
  bounce() {
    // speed up
    const speed = min(1.1 * this.velocity.length(), 1);
    this.velocity = this.velocity.normalize(speed);

    // scale bounce sound pitch by speed
  }
}

("use strict");

// popup errors if there are any (help diagnose issues on mobile devices)
//onerror = (...parameters)=> alert(parameters);

// game variables
let boat, levelSize, angle, canvas;

// medals

///////////////////////////////////////////////////////////////////////////////
function gameInit() {
  // create tile collision and visible tile layer
  canvasFixedSize = vec2(1280, 720);

  levelSize = vec2(1280, 720);
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdate() {
  let speed = 0.3;

  if (!boat) {
    boat = new Boat();
  }

  if (keyWasPressed(37, 0)) {
    //left
    boat.angleVelocity -= 0.01;
  }
  if (keyWasPressed(39, 0)) {
    //right

    boat.angleVelocity += 0.01;
  }
  if (keyWasPressed(40, 0)) {
    //down - not in use
  }
  if (
    (keyWasPressed(37, 0) && keyIsDown(39, 0)) ||
    (keyWasPressed(39, 0) && keyIsDown(37, 0))
  ) {
    //up
    boat.velocity.x += Math.sin(boat.angle) * speed;
    boat.velocity.y += Math.cos(boat.angle) * speed;
  }
  // boat.update();
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdatePost() {}

///////////////////////////////////////////////////////////////////////////////
function gameRender() {
  drawRect(cameraPos, levelSize, new Color(0, 0, 0.2), 0, 0);
}

///////////////////////////////////////////////////////////////////////////////
function gameRenderPost() {
  // draw to overlay canvas for hud rendering
  drawTextScreen("boat", vec2(overlayCanvas.width / 2, 80), 80, new Color(), 9);
}

///////////////////////////////////////////////////////////////////////////////
// Startup LittleJS Engine
engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost);
