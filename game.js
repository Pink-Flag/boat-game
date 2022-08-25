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
}

("use strict");

// popup errors if there are any (help diagnose issues on mobile devices)
//onerror = (...parameters)=> alert(parameters);

// game variables
let boat, levelSize, angle;

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
  let friction = 0.96;

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
