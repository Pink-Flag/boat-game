("use strict");
// game global variables
let boat,
  levelSize,
  angle,
  canvas,
  enemy,
  boatPos,
  enemy2,
  bulletTime = 5000,
  enemy3,
  currentAliveTime = 0,
  obstacle,
  soul,
  energy = 100,
  port,
  shimmer,
  slowEnemy,
  score = 0,
  speed = 0.3,
  technicalArea,
  obstacleIsHome = false,
  enemy2IsHome = false,
  enemy3IsHome = false,
  pos1,
  pos2,
  moveSpeed,
  cargo = false,
  isGameOver = false,
  boost,
  canSpark = true;
energyBarColour = new Color(0, 1, 0.5);

///////////////////////////////////////////////////////////////////////////////
function gameInit() {
  // create tile collision and visible tile layer
  canvasFixedSize = vec2(1280, 720);
  levelSize = vec2(72, 40);
  cameraPos = levelSize.scale(0.5);
  createShimmer();
  initTileCollision(vec2(5, 5));
  const tileLayer = new TileLayer(vec2(), undefined, 64);
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdate() {
  energyRegain();
  checkGameOver();

  boat ||= new Boat(vec2(10, levelSize.y / 2 - 6));
  boatPos = boat.pos;
  port ||= new Port(vec2(2, levelSize.y / 2));
  obstacle ||= new Obstacle(
    vec2(20, -20),
    vec2(Math.random() * (50 - 20) + 15, Math.random() * (30 - 10) + 10)
  );
  boost ||= new Boost(vec2(100, 100));
  slowEnemy ||= new SlowEnemy(vec2(60, 30));

  if (
    (boat.getAliveTime() - currentAliveTime) % 30 === 0 &&
    !isGameOver &&
    boat.getAliveTime() - currentAliveTime > 10
  ) {
    showBoost();
  }

  if (!soul) {
    createSoul();
  }

  slowEnemy.collideWithBoatDetection();
  boat.calculateMoveSpeed();
  if (boost) {
    boost.boatCollectBoost();
  }

  if (!enemy) {
    enemy = new Enemy(vec2(levelSize.x - 30, levelSize.y / 2 + 10), 0, true);
    enemy2 = new Enemy(
      vec2(22, -22),
      1,
      false,
      vec2(levelSize.x - 10, levelSize.y / 2 - 15)
    );
    enemy3 = new Enemy(
      vec2(10, -27),
      2,
      false,
      vec2(levelSize.x / 2, levelSize.y / 2)
    );
  }

  console.log(enemy3.pos);
  if (enemy.pos.distance(enemy2.pos) > 10 && !isGameOver) {
    enemy.moveEnemy();
    enemy.trail(3);
  }
  enemy.collideWithBoatDetection();
  enemy2.collideWithBoatDetection();
  enemy3.collideWithBoatDetection();

  obstacle.tileIndex = -1;
  obstacle.collideWithBoatDetection();
  boat.whirlpool(obstacle.pos);

  if (!isGameOver) {
    if (score >= 6) {
      if (enemy2.isHome === false) {
        enemy2.seekHome();
      }
      if (enemy2.pos.distance(enemy2.home) < 1) {
        enemy2.isHome = true;
      }
      if (enemy2.isHome) {
        enemy2.moveEnemy();
        enemy2.active = true;
      }
    }

    if (score >= 12) {
      if (enemy3.isHome === false) {
        enemy3.seekHome();
      }
      if (enemy3.pos.distance(enemy3.home) < 1) {
        enemy3.isHome = true;
      }
      if (enemy3.isHome) {
        enemy3.moveEnemy();
        enemy3.active = true;
      }
    }
    // if (score > 5 && enemy3.pos.y < 0) {
    //   enemy3.enemySeek();
    // } else if (score > 5 && enemy3.pos.y > 1) {
    //   enemy3.moveEnemy();
    //   enemy3.active = true;
    // }
    slowEnemy.enemySeek(0.0003, false);
    slowEnemy.shoot();
    slowEnemy.trail(3, -0.05);
    boat.moveBoat();
    obstacle.scoreCheck();

    // obstacle.moveObstacle();
    enemy2.trail(3);
    if (moveSpeed > 0.8) {
      boat.trail(moveSpeed);
    }
  }

  if (isGameOver) {
    shimmer.emitRate = 0;
  }

  dockSoul();
  collectSoul();

  energyCheck();
  boat.tileIndex = 0;

  energyBarColourCheck();

  if (isGameOver && keyWasPressed(32, 0)) {
    gameReset();
  }
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
  if (!isGameOver) {
    drawTextScreen(
      score,
      vec2(overlayCanvas.width / 2, 80),
      80,
      new Color(),
      9
    );
    let energybar = vec2(energy / 6, 1);
    drawRect(vec2(50 + energy / 12, 38), energybar, energyBarColour, 0, 0);
  } else {
    drawRect(cameraPos, levelSize, new Color(0.21, 0.21, 0.21), 0, 0);
  }
}

///////////////////////////////////////////////////////////////////////////////
// Startup LittleJS Engine
engineInit(
  gameInit,
  gameUpdate,
  gameUpdatePost,
  gameRender,
  gameRenderPost,
  "tiles.png"
);
