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
    //restrict boat movement inside camera view

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
  }

  calculateMoveSpeed() {
    moveSpeed =
      Math.round(Math.abs(this.velocity.x + this.velocity.y * 100) * 10) / 10;
  }

  pullTowardsWhirlpool(obstaclePos) {
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
      0.15,
      0.15,
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
    super(pos, vec2(3, 3), 0);
    // this.color = new Color(0.8, 0, 0);
    this.setCollision(1, 1, 1);
    this.aim = -20;
    this.axis = axis;
    this.tileSize = vec2(16, 16);
    this.tileIndex = 9;
    this.renderOrder = 2;
    this.active = active;
    this.home = home;
    this.isHome = false;
  }
  seekHome() {
    //move enemy towards starting position
    attractObject(this, 0.001, this.home, true);
  }
  enemySeek(speed = calculateEnemySpeed(), slowEnemy = false) {
    // logic to make enemy seek player
    if (slowEnemy) {
      if (this.pos.distance(boatPos) > 15) {
        // stops slowEnemy from attempting to ram player
        attractObject(this, speed, boatPos, true);
      } else {
        let attract = vec2(boatPos.x - this.pos.x, boatPos.y - this.pos.y);
        this.angle = Math.atan2(attract.x, attract.y);
      }
    } else {
      attractObject(this, speed, boatPos, true);
    }
  }
  enemyHoldX() {
    // when player is out of range of enemy, this sets a holding pattern
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
    // checks distance of enemy to player and sets appropriate movement
    let distance = boatPos.distance(this.pos);
    if (Math.floor(this.getAliveTime()) % 2 == 0) {
      this.tileIndex = 8;
    } else {
      this.tileIndex = 9;
    }

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
      0.15,
      0.15,
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
    if (isOverlapping(this.pos, vec2(3.2, 3.2), boatPos, vec2(3.2, 3.2))) {
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
    super(pos, vec2(2), 0);

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
    this.tileIndex = 7;
    this.drawSize = vec2(3);
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
    //moves obstacle to starting position
    attractObject(this, this.speed, vec2(this.home.x + 15, this.home.y));
  }

  collideWithBoatDetection() {
    if (isOverlapping(this.pos, vec2(2, 3), boatPos, vec2(1.6, 3))) {
      if (!isGameOver) {
        sound_whirlpool.play();
      }
      energy -= 1;
    }
  }
  update() {
    if (!isGameOver) {
      // stops obstacle spinning at game over
      this.angleVelocity = 0.2;
    } else {
      this.angleVelocity = 0;
    }
    super.update();
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
  constructor(pos, color, angle) {
    super(pos, vec2(1, 1), 0);
    this.color = color;
    this.renderOrder = 2;
    this.tileIndex = 6;
    this.drawSize = vec2(5, 5);
    this.startPos = pos;
    this.renderOrder = 5;
    this.angle = angle;
  }

  seekDock() {
    if (dockPos.distance(this.pos) > 3) {
      attractObject(this, 0.0005, vec2(dockPos.x + 1, dockPos.y), true);
    }
    if (dockPos.distance(this.pos) < 1) {
      soulAtDock = true;
    }
  }
  restrictMovement() {
    // this stops the boat from getting stuck in an inifinte loop when a soul is onboard and you try to exit the screen
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

class Port extends EngineObject {
  constructor(pos) {
    super(pos, vec2(2, 4), 0);
    this.renderOrder = 1;
    this.tileIndex = 4;
    this.tileSize = vec2(16, 32);
  }
}

////////////////////////////////////////////////////////////////////////////////////////

class Boost extends EngineObject {
  constructor(pos) {
    super(pos, vec2(2, 2), 0);
    this.drawSize = vec2(4, 4);

    this.renderOrder = 2;
    this.tileIndex = 13;
  }
  boatCollectBoost() {
    if (isOverlapping(this.pos, vec2(1, 1), boatPos, vec2(1.6, 3))) {
      sound_boost.play(1, 0);
      this.collectFireworks();
      boost.pos = vec2(100, 100);
      if (energy <= 75) {
        energy += 25;
      } else {
        energy = 100;
      }
    }
  }
  collectFireworks() {
    new ParticleEmitter(
      this.pos,
      this.angle,
      1,
      0.5,
      20,
      Math.PI, // pos, angle, emitSize, emitTime, emitRate, emiteCone
      -1,
      vec2(16), // tileIndex, tileSize
      new Color(1, 1, 0),
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

////////////////////////////////////////////////////////////////////////////////////////

class SlowEnemy extends Enemy {
  constructor(pos) {
    super(pos);
    this.color = new Color(0.9, 0.9, 0.1);
    this.renderOrder = 8;
    this.tileIndex = 5;
    this.tileSize = vec2(16, 32);
    this.drawSize = vec2(4, 8);
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
    this.tileIndex = 10;
    this.tileSize = vec2(16, 16);
    this.renderOrder = 2;
    this.drawSize = vec2(3, 3);
    this.range = 2;
    this.setCollision(1);
  }
  trail() {
    let trailPos = vec2(
      this.pos.x - this.velocity.x,
      this.pos.y - this.velocity.y
    );
    let emitter = new ParticleEmitter(
      trailPos,
      this.angleVelocity,
      1,
      0.2,
      1,
      2, // pos, angle, emitSize, emitTime, emitRate, emiteCone
      -1,
      vec2(16), // tileIndex, tileSize
      new Color(1, 0, 0),
      new Color(0, 0, 0), // colorStartA, colorStartB
      new Color(0.9, 0.9, 0.1, 0),
      new Color(0, 0, 0, 0), // colorEndA, colorEndB
      2,
      0.15,
      0.15,
      0.05,
      this.angleVelocity, // particleTime, sizeStart, sizeEnd, particleSpeed, particleAngleSpeed
      0.99,
      1,
      1,
      Math.PI,
      0.05, // damping, angleDamping, gravityScale, particleCone, fadeRate,
      0.1,
      100 // randomness, collide, additive, randomColorLinear, renderOrder
    );

    emitter.mass = 1;
    emitter.elasticity = 0.5;
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
    this.trail();
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

class Bank extends EngineObject {
  constructor(pos) {
    super(pos, vec2(4, 16), 0);

    this.setCollision(1, 1, 1);
    this.tileSize = vec2(16, 32);
    this.color = new Color(0.5, 0.5, 0.5);
    this.tileIndex = 4;
    this.renderOrder = 2;
  }
}
