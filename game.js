// constricted ai
//energy bar and power ups?

class Boat extends EngineObject {
  constructor(pos) {
    super(pos, vec2(1, 3), 0);
    this.damping = 0.95;
    this.angleVelocity = 0;
    this.setCollision(1, 1);
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
      if (energy > 0) {
        energy -= 0.5;
      }
    }
    if (keyWasPressed(39, 0)) {
      //right
      this.angleVelocity += 0.01;
      if (energy > 0) {
        energy -= 0.5;
      }
    }
    if (keyWasPressed(40, 0)) {
      //down - not in use
    }
    if (
      (keyWasPressed(37, 0) && keyIsDown(39, 0)) ||
      (keyWasPressed(39, 0) && keyIsDown(37, 0))
    ) {
      //up
      this.velocity.x += Math.sin(this.angle) * speed;
      this.velocity.y += Math.cos(this.angle) * speed;
      if (energy > 0) {
        energy -= 1;
      }
    }
  }
  whirlpool(obsticlePos) {
    let distance = obsticlePos.distance(this.pos);
    let whirlSpeed = (11 - distance) / 1000;
    if (distance < 8) {
      let attract = vec2(
        obsticlePos.x - this.pos.x,
        obsticlePos.y - this.pos.y
      );
      let angleRad = Math.atan2(attract.x, attract.y);
      this.velocity.x += Math.sin(angleRad) * whirlSpeed;
      this.velocity.y += Math.cos(angleRad) * whirlSpeed;
    }
  }
}

class Enemy extends EngineObject {
  constructor(pos) {
    super(pos, vec2(1), 0);
    this.color = new Color(0.8, 0, 0);
    this.setCollision(1, 1);
  }
  moveEnemy(technicalArea) {
    let enemySpeed = Math.random() * (0.004 - 0.0002) + 0.0002;
    let attract = vec2(boatPos.x - this.pos.x, boatPos.y - this.pos.y);
    let angleRad = Math.atan2(attract.x, attract.y);
    if (technicalArea) {
      this.velocity.x += Math.sin(angleRad) * enemySpeed;
      this.velocity.y += Math.cos(angleRad) * enemySpeed;
    }
  }
}

class Obstacle extends EngineObject {
  constructor(pos) {
    super(pos, vec2(1), 0);
    this.color = new Color(0.1, 0.9, 0.1);
    this.setCollision(0, 0);
  }
}
class Soul extends EngineObject {
  constructor(pos) {
    super(pos, vec2(2, 2), 0);
    this.color = new Color(0.9, 0.9, 0.1);
  }
}

class Port extends EngineObject {
  constructor(pos) {
    super(pos, vec2(2, 4), 0);
    this.color = new Color(0.9, 0.9, 0.1);
  }
}

function energyRegain() {
  if (energy < 100) {
    energy += 0.05;
  }
}

function energyCheck() {
  if (energy > -40) {
    speed = 0.3;
  }
  if (energy < 40 && energy >= 20) {
    speed = 0.2;
  }
  if (energy < 20) {
    speed = 0.1;
  }
}

("use strict");

// game variables
let boat,
  levelSize,
  angle,
  canvas,
  enemy,
  boatPos,
  enemy2,
  obsticle,
  soul,
  energy = 100,
  port,
  score = 0,
  speed = 0.3,
  technicalArea,
  cargo = false;

///////////////////////////////////////////////////////////////////////////////
function gameInit() {
  // create tile collision and visible tile layer
  canvasFixedSize = vec2(1280, 720);
  levelSize = vec2(72, 40);
  cameraPos = levelSize.scale(0.5);
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdate() {
  energyRegain();
  if (!boat) {
    boat = new Boat(vec2(10, levelSize.y / 2 - 6));
  }
  boatPos = boat.pos;
  boat.moveBoat();
  if (!enemy) {
    enemy = new Enemy(vec2(levelSize.x - 30, levelSize.y / 2 + 10));
    enemy2 = new Enemy(vec2(levelSize.x - 10, levelSize.y / 2 - 15));
  }

  enemy.moveEnemy(boatPos.x < (levelSize.x / 3) * 2);

  enemy2.moveEnemy(boatPos.x > levelSize.x / 3);

  if (!obsticle) {
    obsticle = new Obstacle(vec2(levelSize.x - 50, levelSize.y / 2));
  }
  boat.whirlpool(obsticle.pos);

  function createSoul() {
    soul = new Soul(vec2(levelSize.x - 5, levelSize.y / 2));
  }

  if (!soul) {
    createSoul();
  }
  if (!port) {
    port = new Port(vec2(2, levelSize.y / 2));
  }
  if (isOverlapping(boatPos, vec2(1, 3), soul.pos, vec2(2, 2))) {
    soul.destroy();
    cargo = true;
    boat.color = new Color(0.9, 0.9, 0.1);
  }
  if (isOverlapping(boatPos, vec2(1, 3), port.pos, vec2(2, 4))) {
    if (cargo) {
      boat.color = new Color(0.9, 0.9, 0.9);
      if (energy < 80) {
        energy += 20;
      } else {
        energy = 100;
      }
      score++;
      createSoul();
    }
    cargo = false;
  }
  energyCheck();
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
  drawTextScreen(score, vec2(overlayCanvas.width / 2, 80), 80, new Color(), 9);
  let energybar = vec2(energy / 6, 1);
  drawRect(vec2(50 + energy / 12, 38), energybar, new Color(0, 1, 0.5), 0, 0);
}

///////////////////////////////////////////////////////////////////////////////
// Startup LittleJS Engine
engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost);
