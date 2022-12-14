function energyRegain() {
  if (energy < 100) {
    energy += 0.05;
  }
}

function energyBarColourCheck() {
  if (energy < 20) {
    energyBarColour = new Color(1, 0, 0);
  } else if (energy < 40) {
    energyBarColour = new Color(1, 0.5, 0);
  } else if (energy < 60) {
    energyBarColour = new Color(1, 1, 0);
  } else if (energy < 80) {
    energyBarColour = new Color(0.5, 1, 0);
  } else {
    energyBarColour = new Color(0, 1, 0);
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

function checkGameOver() {
  if (energy <= 0 || isGameOver) {
    isGameOver = true;
    gameOver();
  }
}

function gameOver() {
  energy = 0;

  drawTextScreen(
    "GAME OVER",
    vec2(overlayCanvas.width / 2, overlayCanvas.height * 0.33),
    100,
    new Color(),
    12
  );
  drawTextScreen(
    `you scored ${score} points`,
    vec2(overlayCanvas.width / 2, overlayCanvas.height * 0.5),
    60,
    new Color(),
    8
  );
  drawTextScreen(
    "press space to start again",
    vec2(overlayCanvas.width / 2, overlayCanvas.height * 0.61),
    45,
    new Color(),
    8
  );
}
function createDock() {
  dock = new Dock(vec2(levelSize.x - 4, Math.random() * (35 - 5) + 5));
  dockPos = dock.pos;
}

function dockSoul() {
  if (isOverlapping(boatPos, vec2(1, 3), port.pos, vec2(2, 4))) {
    if (cargo) {
      boat.color = new Color(0.9, 0.9, 0.9);
      if (energy < 80) {
        energy += 20;
      } else {
        energy = 100;
      }
      score++;
      sound_dock.play(1, 0);

      queue[0].pos = vec2(port.pos.x - 1, port.pos.y);
      attractObject(queue[0], 0.12, vec2(-10, 20), true);
    }
    cargo = false;
    isSoulInBoat = false;
  }
}

function soulInBoat() {
  queue[0].angle = boat.angle;
}

function collectSoul() {
  if (
    isOverlapping(boatPos, vec2(1, 3), dock.pos, vec2(2, 2)) &&
    !cargo &&
    soulAtDock
  ) {
    dock.destroy();
    sound_collect.play(1, 0);
    isSoulInBoat = true;
    queue[0].pos = boatPos;
    cargo = true;
  }
}

function introScreen() {
  drawTextScreen(
    `River of Woe `,
    vec2(overlayCanvas.width / 2, overlayCanvas.height * 0.2),
    100,
    new Color(),
    12
  );
  drawTextScreen(
    `by Matthew Johnson & Kristina Petrova`,
    vec2(overlayCanvas.width / 2, overlayCanvas.height * 0.32),
    30,
    new Color(),
    6
  );
  drawTextScreen(
    `art by Tom McGlynn`,
    vec2(overlayCanvas.width / 2, overlayCanvas.height * 0.38),
    30,
    new Color(),
    6
  );

  drawTextScreen(
    `You are Charon, the ferryman of Hades, who needs to carry the souls

    of the newly deceased across the river Acheron to the world of the dead.
    `,
    vec2(overlayCanvas.width / 2, overlayCanvas.height * 0.55),
    35,
    new Color(),
    6
  );

  drawTextScreen(
    "press space to continue",
    vec2(overlayCanvas.width / 2, overlayCanvas.height * 0.8),
    30,
    new Color(),
    6
  );
}
function controllsScreen() {
  boat ||= new Boat(vec2(10, 33.5));
  boat.angle = 2.5;
  boatPos = boat.pos;
  introSoul ||= new SoulQueue(vec2(8, 23.5), new Color(1, 1, 1), 4.8);
  introPort ||= new Port(vec2(12, 23.5));
  introEnemy ||= new Enemy(vec2(12, 18.5));
  introSlowEnemy ||= new SlowEnemy(vec2(16, 18.5));
  introSlowEnemy.angle = 0;
  introSlowEnemy.drawSize = vec2(2, 4);
  boost ||= new Boost(vec2(14, 14));

  drawTextScreen(
    `- press up arrow to row your boat forward
    
     - press left and right arrows to turn left and right

     - Collect the soul and return it to the dock

     - Avoid the enemies and obstacles

     - Collect the boost to regain energy
    `,
    vec2(overlayCanvas.width / 2, overlayCanvas.height * 0.2),
    40,
    new Color(),
    6,
    new Color(0, 0, 0),
    "center"
  );
  drawTextScreen(
    "press space to continue.",
    vec2(overlayCanvas.width / 2, overlayCanvas.height * 0.84),
    30,
    new Color(),
    6
  );
}

function gameReset() {
  isGameOver = false;
  energy = 100;
  score = 0;
  boat.pos = vec2(10, levelSize.y / 2 - 6);
  boat.angle = 0;
  shimmer.emitRate = 15;
  enemy.pos = vec2(levelSize.x - 30, levelSize.y / 2 + 10);
  enemy2.pos = vec2(22, -22);
  enemy3.pos = vec2(10, -27);
  slowEnemy.pos = vec2(60, 30);
  currentAliveTime = boat.getAliveTime();
  enemy3.active = false;
  obstacle.pos = vec2(20, -20);
  queue.shift().destroy();
  dockPos = dock.pos;
  queue = [];
  queue.push(new SoulQueue(dockPos, new Color(1, 1, 1), 4));

  if (cargo) {
    isSoulInBoat = false;
    cargo = false;
    createDock();
  }
}

function showBoost() {
  boost.pos = vec2(
    Math.random() * (50 - 20) + 10,
    Math.random() * (30 - 10) + 10
  );
  function destroyBoost() {
    boost.pos = vec2(100, 100);
  }
  setTimeout(destroyBoost, 10000);
}
function createShimmer() {
  shimmer = new ParticleEmitter(
    vec2(36, 20),
    0,
    vec2(68, 40),
    1,
    0.5,
    PI, // pos, angle, emitSize, emitTime, emitRate, emiteCone
    -1,
    vec2(16), // tileIndex, tileSize
    new Color(1, 1, 1),
    new Color(0, 0, 1), // colorStartA, colorStartB
    new Color(1, 1, 1, 0),
    new Color(0, 0, 1, 0), // colorEndA, colorEndB
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
    1,
    0,
    1,
    0
    // randomness, collide, additive, randomColorLinear, renderOrder
  );
}

function randomColour() {
  return new Color(
    Math.random() * (0.392 - 0.001) + 0.001,
    Math.random() * (0.392 - 0.001) + 0.001,
    Math.random() * (0.392 - 0.001) + 0.001
  );
}

function moveObject(obj, speed) {
  obj.velocity.x += Math.sin(obj.angle) * speed;
  obj.velocity.y += Math.cos(obj.angle) * speed;
}

function attractObject(obj, speed, goalPos, isEnemy = false) {
  let attract = vec2(goalPos.x - obj.pos.x, goalPos.y - obj.pos.y);
  let angleRad = Math.atan2(attract.x, attract.y);
  obj.velocity.x += Math.sin(angleRad) * speed;
  obj.velocity.y += Math.cos(angleRad) * speed;
  if (isEnemy) {
    obj.angle = angleRad;
  }
}

function calculateEnemySpeed() {
  return Math.random() * (0.004 - 0.0002) + 0.0002;
}
