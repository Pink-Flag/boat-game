//energy bar and power ups?
//particles to make water sparkle
//foam trail behind boat, ripple

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

  calculateMoveSpeed() {
    moveSpeed =
      Math.round(Math.abs(this.velocity.x + this.velocity.y * 100) * 10) / 10;
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

  trail(numOfParticles) {
    let trailPos = vec2(
      this.pos.x - this.velocity.x,
      this.pos.y - this.velocity.y
    );
    new ParticleEmitter(
      trailPos,
      this.angleVelocity,
      1,
      0.5,
      numOfParticles,
      1, // pos, angle, emitSize, emitTime, emitRate, emiteCone
      0,
      vec2(16), // tileIndex, tileSize
      new Color(1, 1, 1),
      new Color(0, 0, 0), // colorStartA, colorStartB
      new Color(1, 1, 1, 0),
      new Color(0, 0, 0, 0), // colorEndA, colorEndB
      2,
      0.2,
      0.2,
      0.1,
      this.angleVelocity, // particleTime, sizeStart, sizeEnd, particleSpeed, particleAngleSpeed
      0.99,
      1,
      1,
      PI,
      0.05, // damping, angleDamping, gravityScale, particleCone, fadeRate,
      0.1,
      1 // randomness, collide, additive, randomColorLinear, renderOrder
    );
  }
}

class Enemy extends EngineObject {
  constructor(pos, axis) {
    super(pos, vec2(1), 0);
    this.color = new Color(0.8, 0, 0);
    this.setCollision(1, 1);
    this.aim = -20;
    // this.axis = Math.floor(Math.random() * 2);
    this.axis = axis;
  }
  enemySeek() {
    let enemySpeed = Math.random() * (0.004 - 0.0002) + 0.0002;

    let attract = vec2(boatPos.x - this.pos.x, boatPos.y - this.pos.y);
    let angleRad = Math.atan2(attract.x, attract.y);
    this.velocity.x += Math.sin(angleRad) * enemySpeed;
    this.velocity.y += Math.cos(angleRad) * enemySpeed;
  }
  enemyHoldX() {
    if (this.pos.x > 57) {
      this.aim = -65;
    }
    if (this.pos.x < 15) {
      this.aim = 65;
    }

    let enemySpeed = Math.random() * (0.004 - 0.0002) + 0.0002;
    let attract = vec2(this.aim, 0);

    let angleRad = Math.atan2(attract.x, attract.y);
    // this.velocity.x += Math.sin(angleRad) * enemySpeed;
    this.velocity.x += Math.sin(angleRad) * enemySpeed;
  }

  enemyHoldY() {
    if (this.pos.y > 32) {
      this.aim = -35;
    }
    if (this.pos.y < 8) {
      this.aim = 35;
    }

    let enemySpeed = Math.random() * (0.004 - 0.0002) + 0.0002;
    let attract = vec2(boatPos.x - this.pos.x, this.aim);

    let angleRad = Math.atan2(attract.x, attract.y);
    // this.velocity.x += Math.sin(angleRad) * enemySpeed;
    this.velocity.y += Math.cos(angleRad) * enemySpeed;
  }

  moveEnemy() {
    let distance = boatPos.distance(this.pos);
    if (distance < 25) {
      this.enemySeek();
    } else {
      if (this.axis) {
        this.enemyHoldX();
      } else {
        this.enemyHoldY();
      }
    }
  }
  update() {
    const nextPos = this.pos.x + this.velocity.x;
    if (
      nextPos - this.size.x / 2 < 1 ||
      nextPos + this.size.x / 2 > levelSize.x - 1
    ) {
      this.velocity.x *= -0.25;
    }
    if (
      this.pos.y + this.velocity.y > levelSize.y - 1 ||
      this.pos.y + this.velocity.y < 1
    ) {
      this.velocity.y *= -0.25;
    }
    super.update();
  }
}

class Obstacle extends EngineObject {
  constructor(pos) {
    super(pos, vec2(1), 0);
    this.color = new Color(0.1, 0.9, 0.1);
    this.setCollision(0, 0);
    this.xStart = this.pos.x;
    this.yStart = this.pos.y;
    this.t = 0;
    this.dt = Math.PI / 1000;
    this.xrad = 15;
    this.yrad = 10;
  }
  moveObstacle() {
    this.pos.x = this.xStart + this.xrad * Math.sin(this.t + Math.PI / 2);
    this.pos.y = this.yStart + this.yrad * Math.sin(2 * this.t);
    this.t += this.dt;
    if (this.t >= 2 * Math.PI) {
      this.t -= 2 * Math.PI;
    }
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
  if (energy >= 50) {
    speed = 0.3;
  }
  if (energy < 50 && energy >= 25) {
    speed = 0.2;
  }
  if (energy < 25) {
    speed = 0.1;
  }
  if (energy < 5) {
    speed = 0.05;
  }
}

// class Shimmer extends Particle{
//   constructor(pos, tileIndex, tileSize, angle) {
//     super(pos, new Vector2, tileIndex, tileSize, angle)
//   }
// }

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
  pos1,
  pos2,
  moveSpeed,
  cargo = false;

///////////////////////////////////////////////////////////////////////////////
function gameInit() {
  // create tile collision and visible tile layer
  canvasFixedSize = vec2(1280, 720);
  levelSize = vec2(72, 40);
  cameraPos = levelSize.scale(0.5);
  new ParticleEmitter(
    vec2(36, 20),
    0,
    vec2(72, 40),
    0,
    8,
    PI, // pos, angle, emitSize, emitTime, emitRate, emiteCone
    0,
    vec2(16), // tileIndex, tileSize
    new Color(1, 1, 1),
    new Color(0, 0, 0), // colorStartA, colorStartB
    new Color(1, 1, 1, 0),
    new Color(0, 0, 0, 0), // colorEndA, colorEndB
    2,
    0.1,
    0.1,
    0,
    0.05, // particleTime, sizeStart, sizeEnd, particleSpeed, particleAngleSpeed
    0.99,
    1,
    1,
    PI,
    0.05, // damping, angleDamping, gravityScale, particleCone, fadeRate,
    0.5,
    1 // randomness, collide, additive, randomColorLinear, renderOrder
  );
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdate() {
  energyRegain();

  boat ||= new Boat(vec2(10, levelSize.y / 2 - 6));

  boatPos = boat.pos;
  boat.moveBoat();
  boat.calculateMoveSpeed();
  if (moveSpeed > 0.4) {
    boat.trail(moveSpeed / 10);
  }
  if (!enemy) {
    enemy = new Enemy(vec2(levelSize.x - 30, levelSize.y / 2 + 10), 0);
    enemy2 = new Enemy(vec2(levelSize.x - 10, levelSize.y / 2 - 15), 1);
  }

  if (enemy.pos.distance(enemy2.pos) > 10) {
    enemy.moveEnemy();
  }
  enemy2.moveEnemy();

  // obsticle ||= new Obstacle(vec2(levelSize.x - 50, levelSize.y / 2));
  obsticle ||= new Obstacle(
    vec2(Math.random() * (50 - 20) + 10, Math.random() * (30 - 10) + 10)
  );

  obsticle.moveObstacle();

  boat.whirlpool(obsticle.pos);

  function createSoul() {
    soul = new Soul(vec2(levelSize.x - 3, Math.random() * (35 - 5) + 5));
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
  drawRect(cameraPos, levelSize, new Color(0.31, 0.396, 0.651), 0, 0);
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
