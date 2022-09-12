class Boat extends EngineObject {
  constructor(pos) {
    super(pos, vec2(3, 3), 0);

    this.damping = 0.95;
    this.angleVelocity = 0;
    this.setCollision(1, 1, 1);
    this.tileSize = vec2(16, 16);
    this.renderOrder = 2;
    this.oar = "left";
  }
  update() {
    const nextPos = this.pos.x + this.velocity.x;
    if (
      nextPos - this.size.x / 2 < 1 ||
      nextPos + this.size.x / 2 + 2 > levelSize.x - 1
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
      this.trail(50, 5);

      sound_siderow.play();
    }
    if (keyWasPressed(39, 0)) {
      //right
      this.angleVelocity += 0.01;
      if (energy > 0) {
        energy -= 0.5;
      }
      this.trail(50, 5);
      sound_siderow.play();
    }
    if (keyWasPressed(38, 0)) {
      moveObject(this, speed);
      sound_row.play();
      if (energy > 0) {
        energy -= 1;
      }
    }
    if (
      (keyWasPressed(37, 0) && keyIsDown(39, 0)) ||
      (keyWasPressed(39, 0) && keyIsDown(37, 0))
    ) {
      //up
      moveObject(this, speed);
      sound_row.play();
      if (energy > 0) {
        energy -= 1;
      }
    }
  }

  boatAnimations() {
    if (keyIsDown(37, 0)) {
      // left
      this.tileIndex = 2;
      this.oar = "right";
    } else if (keyIsDown(39, 0)) {
      // right
      this.tileIndex = 0;
      this.oar = "left";
    } else if (keyIsDown(38, 0)) {
      // up
      if (this.oar == "left") {
        this.tileIndex = 0;
      } else {
        this.tileIndex = 2;
      }
    } else {
      if (this.oar == "left") {
        this.tileIndex = 1;
      } else {
        this.tileIndex = 3;
      }
    }
    // if (keyIsDown(37, 0) && keyIsDown(38, 0)) {
    //   this.tilePos = vec2(2, 0);
    // }
    // if (keyIsDown(39, 0) && keyIsDown(38, 0)) {
    //   this.tilePos = vec2(3, 0);
    // }
  }

  calculateMoveSpeed() {
    moveSpeed =
      Math.round(Math.abs(this.velocity.x + this.velocity.y * 100) * 10) / 10;
  }

  whirlpool(obstaclePos) {
    let distance = obstaclePos.distance(this.pos);
    let whirlSpeed = (11 - distance) / 1000;
    if (distance < 8) {
      attractObject(this, whirlSpeed, obstaclePos);
    }
  }

  trail(numOfParticles, cone = 0.6) {
    let trailPos = vec2(
      this.pos.x - this.velocity.x,
      this.pos.y - this.velocity.y
    );
    let emitter = new ParticleEmitter(
      trailPos,
      this.angleVelocity,
      1,
      0.5,
      numOfParticles,
      cone, // pos, angle, emitSize, emitTime, emitRate, emiteCone
      -1,
      vec2(16), // tileIndex, tileSize
      new Color(1, 1, 1),
      new Color(0, 0, 0), // colorStartA, colorStartB
      new Color(1, 1, 1, 0),
      new Color(0, 0, 0, 0), // colorEndA, colorEndB
      2,
      0.07,
      0.07,
      0.05,
      this.angleVelocity, // particleTime, sizeStart, sizeEnd, particleSpeed, particleAngleSpeed
      0.99,
      1,
      1,
      Math.PI,
      0.05, // damping, angleDamping, gravityScale, particleCone, fadeRate,
      0.1,
      1 // randomness, collide, additive, randomColorLinear, renderOrder
    );

    emitter.mass = 1;
    emitter.elasticity = 0.5;
  }
}

//////////////////////////////////////////////////////////////

class Enemy extends EngineObject {
  constructor(pos, axis, active = false, home) {
    super(pos, vec2(2, 3.91), 0);
    this.color = new Color(0.8, 0, 0);
    this.setCollision(1, 1, 1);
    this.aim = -20;
    this.axis = axis;
    this.tileSize = vec2(16, 16);
    this.tileIndex = 1;
    this.renderOrder = 2;
    this.active = active;
    this.home = home;
    this.isHome = false;
  }
  seekHome() {
    attractObject(this, 0.001, this.home, true);
  }
  enemySeek(speed = calculateEnemySpeed(), slowEnemy = false) {
    if (slowEnemy) {
      if (this.pos.distance(boatPos) > 15) {
        attractObject(this, speed, boatPos, true);
      }
    } else {
      attractObject(this, speed, boatPos, true);
    }
  }
  enemyHoldX() {
    if (this.pos.x > 57) {
      this.aim = -65;
    }
    if (this.pos.x < 15) {
      this.aim = 65;
    }
    let speed = calculateEnemySpeed();
    let attract = vec2(this.aim, 0);
    this.angle = Math.atan2(attract.x, attract.y);
    this.velocity.x += Math.sin(this.angle) * speed;
  }

  enemyHoldY() {
    if (this.pos.y > 32) {
      this.aim = -35;
    }
    if (this.pos.y < 8) {
      this.aim = 35;
    }

    let speed = calculateEnemySpeed();
    let attract = vec2(0, this.aim);
    this.angle = Math.atan2(attract.x, attract.y);
    this.velocity.y += Math.cos(this.angle) * speed;
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
  trail(numOfParticles, trailVelocity = 0.05) {
    let trailPos = vec2(
      this.pos.x - this.velocity.x,
      this.pos.y - this.velocity.y
    );
    let emitter = new ParticleEmitter(
      trailPos,
      this.angle,
      1,
      0.5,
      numOfParticles,
      0.5, // pos, angle, emitSize, emitTime, emitRate, emiteCone
      -1,
      vec2(16), // tileIndex, tileSize
      new Color(1, 1, 1),
      new Color(0, 0, 0), // colorStartA, colorStartB
      new Color(1, 1, 1, 0),
      new Color(0, 0, 0, 0), // colorEndA, colorEndB
      2,
      0.07,
      0.07,
      trailVelocity,
      this.angleVelocity, // particleTime, sizeStart, sizeEnd, particleSpeed, particleAngleSpeed
      0.99,
      1,
      1,
      PI,
      0.05, // damping, angleDamping, gravityScale, particleCone, fadeRate,
      0.1,
      1 // randomness, collide, additive, randomColorLinear, renderOrder
    );

    emitter.mass = 1;
    emitter.elasticity = 0.5;
  }
  sparks() {
    let sparkPos = vec2(
      this.pos.x + Math.sin(this.angle),
      this.pos.y + Math.cos(this.angle)
    );
    let sparkEmitter = new ParticleEmitter(
      sparkPos,
      this.angleVelocity,
      1,
      0.5,
      15,
      Math.PI, // pos, angle, emitSize, emitTime, emitRate, emiteCone
      -1,
      vec2(16), // tileIndex, tileSize
      new Color(1, 0, 0),
      new Color(0, 0, 0), // colorStartA, colorStartB
      new Color(0.9, 0.9, 0.1, 0),
      new Color(0, 0, 0, 0), // colorEndA, colorEndB
      2,
      0.2,
      0.2,
      0.2,
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

  collideWithBoatDetection() {
    if (isOverlapping(this.pos, vec2(2.5, 4.41), boatPos, vec2(2.5, 4.41))) {
      if (!isGameOver) {
        sound_crash.play();
      }
      energy -= 1;
      if (canSpark && !isGameOver) {
        this.sparks();
        canSpark = false;
      }
      function flipSpark() {
        canSpark = true;
      }
      setTimeout(flipSpark, 1000);
    }
  }

  restrictMovement() {
    const nextPos = this.pos.x + this.velocity.x;
    if (this.active) {
      if (
        nextPos - this.size.x / 2 < 1 ||
        nextPos + this.size.x / 2 + 2 > levelSize.x - 1
      ) {
        this.velocity.x *= -0.25;
      }
      if (
        this.pos.y + this.velocity.y > levelSize.y - 1 ||
        this.pos.y + this.velocity.y < 1
      ) {
        this.velocity.y *= -0.25;
      }
    }
  }
  update() {
    this.restrictMovement();
    super.update();
  }
}

////////////////////////////////////////////////////////////////////////////////////////

class Obstacle extends EngineObject {
  constructor(pos, home) {
    super(pos, vec2(1), 0);
    this.color = new Color(0.1, 0.9, 0.1);
    this.setCollision(0, 0);
    this.start = home;
    this.offCanvas = pos;
    this.t = 0;
    this.dt = Math.PI / 1000;
    this.xrad = 15;
    this.yrad = 10;
    this.renderOrder = -1;
    this.home = home;
    this.speed = 0.001;
  }
  moveObstacle() {
    this.pos.x = this.start.x + this.xrad * Math.sin(this.t + Math.PI / 2);
    this.pos.y = this.start.y + this.yrad * Math.sin(2 * this.t);
    this.t += this.dt;
    if (this.t >= 2 * Math.PI) {
      this.t -= 2 * Math.PI;
    }
  }
  scoreCheck() {
    if (
      (score >= 3 && score < 6) ||
      (score >= 9 && score < 12) ||
      score >= 15
    ) {
      if (!obstacleIsHome) {
        this.seekHome();
      }

      if (this.pos.distance(vec2(this.home.x + 15, this.home.y)) < 1) {
        obstacleIsHome = true;
      }

      if (obstacleIsHome) {
        this.moveObstacle();
      }
    } else {
      this.obstacleOffCanvas();
    }
  }
  obstacleOffCanvas() {
    if (this.pos.distance(this.offCanvas) > 1) {
      attractObject(this, this.speed, this.offCanvas);
    } else {
      obstacleIsHome = false;
      this.t = 0;
      this.xrad = 15;
      this.yrad = 10;
    }
  }

  seekHome() {
    attractObject(this, this.speed, vec2(this.home.x + 15, this.home.y));
  }
  whirl() {
    let emitter = new ParticleEmitter(
      this.pos,
      this.angle,
      0,
      1,
      10,
      0, // pos, angle, emitSize, emitTime, emitRate, emiteCone
      -1,
      vec2(16), // tileIndex, tileSize
      new Color(1, 1, 1),
      new Color(0, 0, 0), // colorStartA, colorStartB
      new Color(1, 1, 1, 0),
      new Color(0, 0, 0, 0), // colorEndA, colorEndB
      2,
      0.1,
      0.1,
      0.1,
      0.05, // particleTime, sizeStart, sizeEnd, particleSpeed, particleAngleSpeed
      0.99,
      1,
      1,
      PI,
      0.05, // damping, angleDamping, gravityScale, particleCone, fadeRate,
      0.5,
      1 // randomness, collide, additive, randomColorLinear, renderOrder
    );
    emitter.trailScale = 1;
  }
  collideWithBoatDetection() {
    if (isOverlapping(this.pos, vec2(2, 3), boatPos, vec2(1.6, 3))) {
      if (!isGameOver) {
        sound_whirlpool.play();
      }
      energy -= 1;
    }
  }
}

////////////////////////////////////////////////////////////////////////////////////////

class Dock extends EngineObject {
  constructor(pos) {
    super(pos, vec2(4, 2), 0);
    this.color = new Color(0.9, 0.9, 0.1, 0);
    this.renderOrder = -10;
    this.tileIndex = -1;
  }
}
////////////////////////////////////////////////////////////////////////////////////////

class SoulQueue extends EngineObject {
  constructor(pos, color) {
    super(pos, vec2(1, 1), 0);
    this.color = color;
    this.renderOrder = 2;
    this.tileIndex = -1;
    this.startPos = pos;
    this.renderOrder = 5;
  }

  seekDock() {
    if (dockPos.distance(this.pos) > 3) {
      attractObject(this, 0.0005, vec2(dockPos.x + 1, dockPos.y));
    }
    if (dockPos.distance(this.pos) < 1) {
      soulAtDock = true;
    }
  }
}

////////////////////////////////////////////////////////////////////////////////////////

class Port extends EngineObject {
  constructor(pos) {
    super(pos, vec2(2, 4), 0);
    this.color = new Color(0.9, 0.9, 0.1);
    this.renderOrder = 1;
    this.tileIndex = -1;
  }
}

////////////////////////////////////////////////////////////////////////////////////////

class Boost extends EngineObject {
  constructor(pos) {
    super(pos, vec2(1, 1), 0);
    this.color = new Color(0.9, 0, 0);
    this.renderOrder = 2;
    this.tileIndex = -1;
  }
  boatCollectBoost() {
    if (isOverlapping(this.pos, vec2(1, 1), boatPos, vec2(1.6, 3))) {
      sound_boost.play(1, 0);
      boost.pos = vec2(100, 100);
      if (energy <= 75) {
        energy += 25;
      } else {
        energy = 100;
      }
    }
  }
}

////////////////////////////////////////////////////////////////////////////////////////

class SlowEnemy extends Enemy {
  constructor(pos) {
    super(pos);
    this.color = new Color(0.9, 0.9, 0.1);
    this.renderOrder = 2;
    this.tileIndex = 2;
    this.tileSize = vec2(32, 16);
    this.speed = 0.1;
    this.active = true;
    this.attract = vec2(boatPos.x - this.pos.x, boatPos.y - this.pos.y);
    this.angle = Math.atan2(this.attract.x, this.attract.y);
  }
  shoot() {
    if (
      this.pos.distance(boatPos) < 40 &&
      new Date().getTime() - 5000 > bulletTime
    ) {
      let bulletSpeed = 0.09;
      new Bullet(
        this.pos,
        vec2(
          Math.sin(this.angle) * bulletSpeed,
          Math.cos(this.angle) * bulletSpeed
        ),
        this.angle
      );
      sound_shoot.play();
      bulletTime = new Date().getTime();
    }
  }
  update() {
    this.restrictMovement();
    super.update();
  }
}

////////////////////////////////////////////////////////////////////////////////////////

class Bullet extends EngineObject {
  constructor(pos, velocity, angle) {
    super(pos, vec2());
    this.color = new Color(1, 1, 0);
    this.velocity = velocity;
    this.angle = angle;
    this.damping = 1;
    this.gravityScale = 0;
    this.tileIndex = 4;
    this.tileSize = vec2(16, 16);
    this.renderOrder = 100;
    this.drawSize = vec2(3, 3);
    this.range = 2;
    this.setCollision(1);
  }

  update() {
    const nextPos = this.pos.x + this.velocity.x;

    if (
      nextPos - this.size.x / 2 - 1 < 1 ||
      nextPos + this.size.x / 2 + 4 > levelSize.x
    ) {
      this.sparks();
      sound_explosion.play();
      this.destroy();
    }
    if (
      this.pos.y + this.velocity.y > levelSize.y ||
      this.pos.y + this.velocity.y < 1
    ) {
      this.destroy();
    }

    if (isGameOver) {
      this.destroy();
    }

    super.update();
  }

  collideWithObject(o) {
    if (o === boat) {
      let bulletDistance = slowEnemyPos.distance(boatPos) / 10;
      energy -= 21 - 3 * bulletDistance;
      this.sparks();
      sound_explosion.play();
      this.destroy();
    } else if ([enemy, enemy2, enemy3, obstacle].includes(o)) {
      this.sparks();
      sound_explosion.play();
      this.destroy();
    }
  }

  sparks() {
    new ParticleEmitter(
      this.pos,
      this.angle,
      1,
      0.5,
      20,
      Math.PI, // pos, angle, emitSize, emitTime, emitRate, emiteCone
      -1,
      vec2(16), // tileIndex, tileSize
      new Color(1, 0, 0),
      new Color(0, 0, 0), // colorStartA, colorStartB
      new Color(0.9, 0.9, 0.1, 0),
      new Color(0, 0, 0, 0), // colorEndA, colorEndB
      2,
      0.2,
      0.2,
      0.2,
      this.angle, // particleTime, sizeStart, sizeEnd, particleSpeed, particleAngleSpeed
      0.99,
      1,
      1,
      PI,
      0.05, // damping, angleDamping, gravityScale, particleCone, fadeRate,
      0.1,
      1,
      0,
      1,
      3
      // randomness, collide, additive, randomColorLinear, renderOrder
    );
  }
}
