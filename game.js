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
  dock,
  bank,
  soul,
  introSoul,
  introEnemy,
  introSlowEnemy,
  introPort,
  bank2,
  bank3,
  energy = 100,
  port,
  shimmer,
  slowEnemy,
  score = 0,
  speed = 0.3,
  technicalArea,
  introBoat,
  obstacleIsHome = false,
  enemy2IsHome = false,
  enemy3IsHome = false,
  startGame = false,
  moveSpeed,
  secondScreen = false,
  cargo = false,
  isGameOver = false,
  boost,
  canSpark = true,
  slowEnemyPos,
  soulAtDock = false,
  isSoulInBoat = false,
  dockPos,
  queue = [],
  energyBarColour = new Color(0, 1, 0.5);

///////////////////////////////////////////////////////////////////////////////
function gameInit() {
  // create tile collision and visible tile layer
  canvasFixedSize = vec2(1280, 720);
  levelSize = vec2(76, 40);
  cameraPos = levelSize.scale(0.5);
  initTileCollision(vec2(5, 5));
  const tileLayer = new TileLayer(vec2(), undefined, 64);
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdate() {
  // display intro screens

  if (!startGame) {
    if (!secondScreen) {
      introScreen();
    }
    if (keyWasReleased(32, 0)) {
      secondScreen = true;
    }
    if (secondScreen) {
      controllsScreen();
    }

    if (secondScreen) {
      if (keyWasPressed(32, 0)) {
        introEnemy.destroy();
        introSlowEnemy.destroy();
        introPort.destroy();
        boost.pos = vec2(100, 100);
        introSoul.destroy();
        startGame = true;
        sound_music.play();
      }
    }
  } else {
    // game update

    energyRegain();
    checkGameOver();

    // create instances of game objects

    boat ||= new Boat(vec2(10, levelSize.y / 2 - 6));
    boatPos = boat.pos;
    port ||= new Port(vec2(2, levelSize.y / 2));
    obstacle ||= new Obstacle(
      vec2(20, -20),
      vec2(Math.random() * (50 - 20) + 15, Math.random() * (30 - 10) + 10)
    );

    slowEnemy ||= new SlowEnemy(vec2(60, 30));
    slowEnemyPos = slowEnemy.pos;

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

    if (enemy.pos.distance(enemy2.pos) > 10 && !isGameOver) {
      enemy.moveEnemy();
      enemy.trail(3);
    }
    enemy.collideWithBoatDetection();
    enemy2.collideWithBoatDetection();
    enemy3.collideWithBoatDetection();

    obstacle.collideWithBoatDetection();
    boat.pullTowardsWhirlpool(obstacle.pos);

    // show boost at intervals

    if (
      (boat.getAliveTime() - currentAliveTime) % 30 === 0 &&
      !isGameOver &&
      boat.getAliveTime() - currentAliveTime > 10
    ) {
      showBoost();
    }

    if (!dock) {
      createDock();
    }

    // game physics

    slowEnemy.collideWithBoatDetection();
    boat.calculateMoveSpeed();
    boat.boatAnimations();
    if (boost) {
      boost.boatCollectBoost();
    }

    // enemy logic

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

      slowEnemy.enemySeek(0.0003, true);
      slowEnemy.shoot();
      slowEnemy.trail(3, -0.05);
      boat.moveBoat();
      obstacle.scoreCheck();

      enemy2.trail(3);
      if (moveSpeed > 0.8) {
        boat.trail(moveSpeed);
      }
    }
    if (isGameOver) {
      shimmer.emitRate = 0;
    }

    // soul queue logic

    dockSoul();
    collectSoul();

    if (queue.length === 0) {
      queue.push(new SoulQueue(dockPos, new Color(0.89, 0.0, 0.0), 4));
    }

    if (queue.length < 3) {
      queue.push(new SoulQueue(vec2(79, 16), randomColour()));
    }

    if (!soulAtDock) {
      queue[0].seekDock();
    }

    if (queue[0].pos.x < -2) {
      soulAtDock = false;
      queue.shift().destroy();
      createDock();
    }

    if (isSoulInBoat) {
      soulInBoat();
    }
    // energy bar logic

    energyCheck();

    energyBarColourCheck();

    // reset game when game over

    if (isGameOver && keyWasPressed(32, 0)) {
      gameReset();
    }
  }
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdatePost() {}

///////////////////////////////////////////////////////////////////////////////
function gameRender() {
  // render river
  drawRect(cameraPos, levelSize, new Color(0.36, 0.411, 0.623), 0, 0);
}

///////////////////////////////////////////////////////////////////////////////
function gameRenderPost() {
  // render HUD

  if (!isGameOver && startGame) {
    createShimmer();
    drawTextScreen(
      `Score : ${score}`,
      vec2(overlayCanvas.width / 2 - 420, 20),
      35,
      new Color(),
      6
    );
    drawTextScreen(
      " Energy :",
      vec2(overlayCanvas.width / 2 + 120, 20),
      35,
      new Color(),
      6
    );
    let energybar = vec2(energy / 6, 1);
    drawRect(vec2(50 + energy / 12, 41), energybar, energyBarColour, 0, 0);
  }
  //render banks

  if (startGame) {
    const leftBank = drawRect(
      vec2(0, levelSize.y / 2),
      vec2(4, 40),
      new Color(0.61, 0.47, 0.34),
      0,
      0
    );

    drawRect(
      vec2(74, levelSize.y / 2),
      vec2(4, 40),
      new Color(0.61, 0.47, 0.34),
      0,
      0
    );
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
