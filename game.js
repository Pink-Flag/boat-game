class Boat extends EngineObject {
  constructor(pos) {
    super(pos, vec2(1, 3), 0);
    this.damping = 0.95;
    this.angleVelocity = 0;
    this.setCollision(1, 1);
  }
  collideWithObject(o) {
    if (o === enemy) {
      console.log("it caught me");
    }
  }
  update() {
    const nextPos = this.pos.x + this.velocity.x;
    if (
      nextPos - this.size.x / 2 < 1 ||
      nextPos + this.size.x / 2 > levelSize.x - 1
    ) {
      this.velocity.x *= -0.25;
      this.bounce();
    }
    if (
      this.pos.y + this.velocity.y > levelSize.y - 1 ||
      this.pos.y + this.velocity.y < 1
    ) {
      this.velocity.y *= -0.25;

      this.bounce();
    }
    super.update();
  }
  bounce() {
    const speed = min(1.1 * this.velocity.length(), 1);
    this.velocity = this.velocity.normalize(speed);
  }
  moveBoat() {
    if (keyWasPressed(37, 0)) {
      //left
      this.angleVelocity -= 0.01;
    }
    if (keyWasPressed(39, 0)) {
      //right

      this.angleVelocity += 0.01;
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
}

class Enemy extends EngineObject {
  constructor(pos, boatPos) {
    super(pos, vec2(1), 0);
    this.color = new Color(0.8, 0, 0);
    this.setCollision(1, 1);
  }
  // console.log(this)
  moveEnemy() {
    let enemySpeed = Math.random() * (0.001 - 0.0002) + 0.0002;
    let attract = vec2(boatPos.x - this.pos.x, boatPos.y - this.pos.y);
    let angleRad = Math.atan2(attract.x, attract.y);
    this.velocity.x += Math.sin(angleRad) * enemySpeed;
    this.velocity.y += Math.cos(angleRad) * enemySpeed;
  }
}
("use strict");

// game variables
let boat, levelSize, angle, canvas, enemy, boatPos, enemy2;
let speed = 0.3;

///////////////////////////////////////////////////////////////////////////////
function gameInit() {
  // create tile collision and visible tile layer
  canvasFixedSize = vec2(1280, 720);
  levelSize = vec2(72, 40);
  cameraPos = levelSize.scale(0.5);
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdate() {
  if (!boat) {
    boat = new Boat(vec2(10, levelSize.y / 2 - 6));
  }
  boatPos = boat.pos;
  boat.moveBoat();
  if (!enemy) {
    enemy = new Enemy(vec2(levelSize.x - 30, levelSize.y / 2), boatPos);
    enemy2 = new Enemy(vec2(levelSize.x - 30, levelSize.y / 2), boatPos);
  }
  enemy.moveEnemy();
  console.log(enemy.velocity);
  enemy2.moveEnemy();
  console.log(enemy2.velocity);
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
