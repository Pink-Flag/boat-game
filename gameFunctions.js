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
function createSoul() {
  soul = new Soul(vec2(levelSize.x - 4, Math.random() * (35 - 5) + 5));
  // soul = new Soul(vec2(72, 30));
  dockPos = soul.pos;
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
      createSoul();
      soulAtDock = false
      // queue[0].seekDock();
    }
    cargo = false;
  }
}
function collectSoul() {
  if (isOverlapping(boatPos, vec2(1, 3), soul.pos, vec2(2, 2)) && !cargo) {
    soul.destroy();
    sound_collect.play(1, 0);
    queue.shift().destroy();
    cargo = true;
    boat.color = new Color(0.9, 0.9, 0.1);
    
  }
}

function introScreen() {
  drawTextScreen(
    "River of Woe",
    vec2(overlayCanvas.width / 2, overlayCanvas.height * 0.2),
    100,
    new Color(),
    12
  );
  drawTextScreen(
    "You are Charon, the ferryman of Hades, who needs to carry the souls",
    vec2(overlayCanvas.width / 2, overlayCanvas.height * 0.4),
    35,
    new Color(),
    6
  );
  drawTextScreen(
    "of the newly deceased who had received the rites of burial across",
    vec2(overlayCanvas.width / 2, overlayCanvas.height * 0.48),
    35,
    new Color(),
    6
  );
  drawTextScreen(
    "the river Acheron that devides the world of the living from the ",
    vec2(overlayCanvas.width / 2, overlayCanvas.height * 0.56),
    35,
    new Color(),
    6
  );
  drawTextScreen(
    "world of the dead.",
    vec2(overlayCanvas.width / 2, overlayCanvas.height * 0.64),
    35,
    new Color(),
    6
  );
  drawTextScreen(
    "press space to continue.",
    vec2(overlayCanvas.width / 2, overlayCanvas.height * 0.84),
    30,
    new Color(),
    6
  );
}
function controllsScreen() {
  drawTextScreen(
    "- press left arrow + right arrow to row forward",
    vec2(overlayCanvas.width / 2 - 50, overlayCanvas.height * 0.3),
    40,
    new Color(),
    6
  );
  drawTextScreen(
    "- press left arrow to turn left",
    vec2(overlayCanvas.width / 2 - 205, overlayCanvas.height * 0.4),
    40,
    new Color(),
    6
  );
  drawTextScreen(
    "- press right arrow to turn right",
    vec2(overlayCanvas.width / 2 - 180, overlayCanvas.height * 0.5),
    40,
    new Color(),
    6
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
  obstacle.xStart = Math.random() * (50 - 20) + 20;
  obstacle.yStart = Math.random() * (30 - 10) + 10;

  if (cargo) {
    boat.color = new Color(0.9, 0.9, 0.9);
    cargo = false;
    createSoul();
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
