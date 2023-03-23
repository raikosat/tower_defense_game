const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
canvas.width = 1280;
canvas.height = 768;
c.fillStyle = 'white';
c.font = "bold 12px 'Press Start 2P', cursive";
c.fillRect(0, 0, canvas.width, canvas.height);

const placementTilesData2D = [];
const buildings = [];
const placementTiles = [];
const explosions = [];
const enemies = [];
const enemiesDie = [];
const image = new Image();
// image.src = 'img/map/gameMap.png';
image.src = 'img/background.png';
const mouse = {
    x: undefined,
    y: undefined
}
const priceTower = 70;
const soundBg = new Audio();
soundBg.src = 'sound/sound-background.mp3';
soundBg.loop = true;
soundBg.volume = 0.5;

let activeTile = undefined;
let activeTileShopping = undefined;
let waveCurrent = 1;
let hearts = 10;
let coins = 250;
let isShoping = false;
let speedGame = 1;
let speedMaxGame = 3;
const fps = 50;
let timeInterval = 1000 / fps;
let lastTime = 0;
let isPaused = false;

const heart = new Sprite({
    position: { x: canvas.width - 130, y: 13 },
    imageSrc: 'img/icon/heart.png',
    scale: 0.22,
    width: 189,
    height: 160
});

const coin = new Sprite({
    position: { x: heart.position.x - 150, y: 10 },
    imageSrc: 'img/icon/coin.png',
    scale: 0.25,
    width: 160,
    height: 160
});

const i_monster = new Sprite({
    position: { x: coin.position.x - 160, y: 10 },
    imageSrc: 'img/icon/loading_spawn.png',
    scale: 0.26,
    width: 162,
    height: 145
});

const b_skip = new Sprite({
    position: { x: 100, y: canvas.height - 50 },
    imageSrc: 'img/icon/b_skip.png',
    scale: 0.35,
    width: 130,
    height: 78
});

const b_pause = new Sprite({
    position: { x: 20, y: canvas.height - 50 },
    imageSrc: 'img/icon/b_pause.png',
    scale: 0.35,
    width: 169,
    height: 78
});

function initPlacementTilesData() {
    for (let i = 0; i < placementTilesData.length; i += 20) {
        placementTilesData2D.push(placementTilesData.slice(i, i + 20));
    }
}

function createPlacementTilesData2D() {
    placementTilesData2D.forEach((row, y) => {
        row.forEach((symbol, x) => {
            if (symbol === 14) {
                // add building placement tile here
                placementTiles.push(
                    new PlacementTile({
                        position: {
                            x: x * 64,
                            y: y * 64
                        },
                        tw1: tower1,
                        tw2: undefined,
                        tw3: undefined,
                        tw4: undefined
                    })
                )
            }
        });
    });
}

function soundBackground() {
    soundBg.play();
}

image.onload = () => {
    c.drawImage(image, 0, 0);
}

function reset() {
    hearts = 10;
    coins = 250;
    speedGame = 1;
    waveCurrent = 1;
    buildings.splice(0, buildings.length);
    placementTiles.splice(0, placementTiles.length);
    explosions.splice(0, explosions.length);
    enemies.splice(0, enemies.length);
    enemiesDie.splice(0, enemiesDie.length);
    this.initPlacementTilesData();
}

function drawIcon() {
    const width = (heart.position.x + (heart.width * heart.scale) + 75) - i_monster.position.x;
    const height = i_monster.height * i_monster.scale + 10;
    c.fillStyle = 'rgb(255, 255, 255, 0.5)';
    c.fillRect(i_monster.position.x - 5, i_monster.position.y - 5, width, height);
    drawHeart();
    drawCoin();
    drawIMonster();
    drawSkip();
    drawPause();
}

function startGame() {
    document.querySelector('#flex-container').style.display = 'none';
    document.querySelector('#startGame').style.display = 'none';
    document.querySelector('#continue').style.display = 'none';
    document.querySelector('#restart').style.display = 'none';
    document.querySelector('#gameOver').style.display = 'none';
    image.src = 'img/map/gameMap.png';
    c.drawImage(image, 0, 0);
    reset();
    createPlacementTilesData2D();
    soundBackground();
    drawIcon();
    drawLandFlag();
    isPaused = false;
    setTimeout(() => {
        spawnEnemies();
        animate(0);
    }, 1000);
}

function continueGame() {
    document.querySelector('#flex-container').style.display = 'none';
    document.querySelector('#continue').style.display = 'none';
    document.querySelector('#restart').style.display = 'none';
    isPaused = false;
    animate(lastTime);
}

function pauseGame() {
    isPaused = true;
    document.querySelector('#flex-container').style.display = 'flex';
    document.querySelector('#restart').style.display = 'flex';
    document.querySelector('#continue').style.display = 'flex';
}

function spawnEnemies() {
    showWave();
    const turn = wavesMap1[waveCurrent - 1];
    const enemiesTurn = turn.enemies;

    for (let k = 0; k < enemiesTurn.length; k++) {
        const enemiesDetails = enemiesTurn[k];
        const monster = enemiesDetails.monster;
        let xOffset = 0;
        for (let i = 0; i < enemiesDetails.count; i++) {
            if (i == 0) {
                xOffset = 100;
            } else if (i % 5 == 0) {
                xOffset += 800;
            } else {
                xOffset += 40;
            }
            this.createEnemy(xOffset, monster);
        }
    }
}

function showWave() {
    document.querySelector('#flex-container').style.display = 'flex';
    document.querySelector('#wave').style.display = 'flex';
    document.querySelector('#wave').innerHTML = 'WAVE ' + waveCurrent;
    setTimeout(() => {
        document.querySelector('#flex-container').style.display = 'none';
        document.querySelector('#wave').style.display = 'none';
        isLoadingSpawnEnemies = true;
    }, 1500);
}

const imageLoadingSpawn = new Image();
imageLoadingSpawn.src = 'img/icon/loading_spawn.png';
let timeLoadingSpawnEnemies = 0;
let isLoadingSpawnEnemies = false;
let endAngle = 0;
function loadingSpawnEnemies() {
    if (!isLoadingSpawnEnemies) return;
    timeLoadingSpawnEnemies++;
    const x = 50;
    const y = 450;
    const scale = 0.3;
    const widthScale = imageLoadingSpawn.width * scale;
    const heightScale = imageLoadingSpawn.height * scale;

    c.beginPath();
    c.fillStyle = 'rgb(255,250,250, 0.3)';
    c.arc(x + widthScale / 2, y + heightScale / 2, 30, 0, Math.PI * 2);
    c.fill();

    c.drawImage(imageLoadingSpawn, 0, 0, imageLoadingSpawn.width, imageLoadingSpawn.height,
        x, y, widthScale, heightScale
    );
    // c.strokeStyle = 'white';
    // c.strokeRect(x, y, widthScale, heightScale);

    c.beginPath();
    c.strokeStyle = 'green';
    c.lineWidth = 4;
    if (endAngle < 2 && timeLoadingSpawnEnemies % (3 / speedGame) === 0) {
        endAngle += 0.02;
    }
    if (endAngle >= 2) {
        isLoadingSpawnEnemies = false;
        endAngle = 0;
    }
    c.arc(x + widthScale / 2, y + heightScale / 2, 30, 0, Math.PI * endAngle);
    c.stroke();
}

function animate(timeStamp) {
    if (isPaused) {
        return;
    }
    c.drawImage(image, 0, 0);
    drawIcon();
    loadingSpawnEnemies();

    timeInterval = 1000 / (fps * speedGame);
    let deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    const animationId = requestAnimationFrame(animate);

    if (!isLoadingSpawnEnemies) {
        trackingEnemyIntoEndMap(deltaTime, animationId);
    }

    animationExplosions(deltaTime);

    animationEnemiesDie(deltaTime);

    trackingTotalAmountOfEnemies(deltaTime);

    // order display shop of building and shop of land
    if (activeTile && activeTile.displayShop) {
        animationBuilding(speedGame, deltaTime, timeInterval);
        drawLandFlag();
    } else {
        drawLandFlag();
        animationBuilding(speedGame, deltaTime, timeInterval);
    }
}

function animationExplosions(deltaTime) {
    // animation explosions
    for (let i = explosions.length - 1; i >= 0; i--) {
        const explosion = explosions[i];
        explosion.draw();
        explosion.update(speedGame, deltaTime, timeInterval);
        if (explosion.frames.frameX >= explosion.frames.max - 1) {
            explosions.splice(i, 1);
        }
    }
}

function animationEnemiesDie(deltaTime) {
    // animation enemies die
    for (let i = enemiesDie.length - 1; i >= 0; i--) {
        const enemyDie = enemiesDie[i];
        enemyDie.draw();
        enemyDie.update(speedGame, deltaTime, timeInterval);

        if (enemyDie.frames.frameX >= enemyDie.frames.max - 1) {
            enemiesDie.splice(i, 1);
        }
    }
}

function trackingTotalAmountOfEnemies() {
    // tracking total amount of enemies
    if (enemies.length === 0) {
        waveCurrent++;
        if (waveCurrent <= wavesMap1.length) {
            spawnEnemies();
        } else {
            document.querySelector('#gameOver').innerHTML = "WIN";
            document.querySelector('#gameOver').style.display = 'flex';
        }
    }
}

function trackingEnemyIntoEndMap(deltaTime, animationId) {
    // tracking enemy into end map
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.draw();
        enemy.update(speedGame, deltaTime, timeInterval);
        if (enemy.position.x > canvas.width) {
            hearts -= 1;
            enemies.splice(i, 1);
            if (hearts <= 0) {
                cancelAnimationFrame(animationId);
                document.querySelector('#flex-container').style.display = 'flex';
                document.querySelector('#restart').style.display = 'flex';
                document.querySelector('#gameOver').style.display = 'flex';
            }
        }
    }
}

function animationBuilding(speedGame, deltaTime, timeInterval) {
    buildings.sort((a, b) => {
        return a.displayShop - b.displayShop;
    });
    buildings.forEach((building) => {
        building.update(speedGame, deltaTime, timeInterval);
        building.target = null;
        const validEnemies = enemies.filter(enemy => {
            const xDifference = enemy.center.x - building.center.x;
            const yDifference = enemy.center.y - building.center.y;
            const distance = Math.hypot(xDifference, yDifference);
            return (distance < enemy.radius + building.radius && enemy.position.x > 0 && enemy.position.y > 0);
        });
        building.target = validEnemies[0];

        for (let i = building.projectiles.length - 1; i >= 0; i--) {
            const projectile = building.projectiles[i];
            projectile.update(speedGame, deltaTime, timeInterval);

            const xDifference = projectile.enemy.center.x - projectile.position.x;
            const yDifference = projectile.enemy.center.y - projectile.position.y;
            const distance = Math.hypot(xDifference, yDifference);

            // this is when a projectile hits an enemy
            if (distance < projectile.enemy.radius + projectile.radius) {
                // enemy health and enemy removal
                projectile.enemy.health -= building.damage;
                if (projectile.enemy.health <= 0) {
                    const enemyIndex = enemies.findIndex((enemy) => {
                        return projectile.enemy === enemy;
                    });
                    if (enemyIndex > -1) {
                        this.createEnemyDie(projectile);

                        enemies.splice(enemyIndex, 1);
                        coins += projectile.enemy.bounes;
                    };
                }
                const stone_break = new Audio();
                stone_break.src = './sound/stone_break.ogg';
                stone_break.volume = 0.3;
                stone_break.play();
                this.createExplosions(projectile, building.damage);
                building.projectiles.splice(i, 1);
            }
        }
    });
}

function clickSound() {
    const click = new Audio();
    click.src = './sound/click_sound.mp3';
    click.play();
}

function destroySound() {
    const click = new Audio();
    click.src = './sound/building_destroy.wav';
    click.play();
}

canvas.addEventListener('click', (event) => {
    //click skip button
    if (event.clientX > b_skip.position.x &&
        event.clientX < b_skip.position.x + (b_skip.image.width * b_skip.scale) &&
        event.clientY > b_skip.position.y &&
        event.clientY < b_skip.position.y + (b_skip.image.height * b_skip.scale)) {
        speedGame = (speedGame == 1 ? speedMaxGame : 1);
        this.drawSkip();
    } else if (event.clientX > b_pause.position.x &&
        event.clientX < b_pause.position.x + (b_pause.image.width * b_pause.scale) &&
        event.clientY > b_pause.position.y &&
        event.clientY < b_pause.position.y + (b_pause.image.height * b_pause.scale)) {
        this.pauseGame();
    } else if (activeTile && !activeTile.displayShop && !activeTile.isOccupied && !isShoping) {
        // handle display shop of land
        this.openShopOfLand(activeTile);
    } else if (activeTile && activeTile.displayShop && !activeTile.isOccupied && isShoping) {
        // handle close shop of land
        this.closeShopOfLand(activeTile);
    } else if (activeTile && activeTile.isOccupied && !activeTile.building.displayShop && !isShoping && !activeTile.building.loading) {
        // handle display shop of building
        this.openShopOfBuilding(activeTile);
    } else if (activeTile && activeTile.isOccupied && activeTile.building.displayShop && isShoping) {
        // handle close shop of building
        this.closeShopOfBuilding(activeTile);
    } else if (activeTileShopping && !activeTileShopping.isOccupied) {
        // handle buy building in shop of building
        this.checkBuyBuilding(event, activeTileShopping);
    } else if (activeTileShopping && activeTileShopping.isOccupied) {
        // handle upgrate building
        this.checkUpgradeBuilding(event, activeTileShopping);
    }
});

window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;

    // button skip
    if (mouse.x > b_skip.position.x && mouse.x < b_skip.position.x + (b_skip.image.width * b_skip.scale) &&
        mouse.y > b_skip.position.y && mouse.y < b_skip.position.y + (b_skip.image.height * b_skip.scale)) {
        b_skip.image.src = './img/icon/b_skip_selected.png';
    } else {
        b_skip.image.src = './img/icon/b_skip.png';
    }

    // button pause
    if (mouse.x > b_pause.position.x && mouse.x < b_pause.position.x + (b_pause.image.width * b_pause.scale) &&
        mouse.y > b_pause.position.y && mouse.y < b_pause.position.y + (b_pause.image.height * b_pause.scale) && !isPaused) {
        b_pause.image.src = './img/icon/b_pause_selected.png';
    } else {
        b_pause.image.src = './img/icon/b_pause.png';
    }

    this.hoverShopOfLand();

    this.hoverShopOfbuilding();

    activeTile = null;
    for (let i = 0; i < placementTiles.length; i++) {
        const tile = placementTiles[i];
        if (mouse.x > tile.position.x && mouse.x < tile.position.x + tile.size &&
            mouse.y > tile.position.y && mouse.y < tile.position.y + tile.size &&
            !tile.isOccupied) {
            activeTile = tile;
            tile.hover = true;
            break;
        } else {
            tile.hover = false;
        }
        if (mouse.x > tile.position.x && mouse.x < tile.position.x + tile.size &&
            mouse.y > tile.position.y && mouse.y < tile.position.y + tile.size &&
            tile.isOccupied) {
            activeTile = tile;
            activeTile.building.hover = true;
            break;
        } else if (tile.isOccupied) {
            tile.building.hover = false;
        }
    }
});

window.addEventListener('keydown', (event) => {
    const key = event.key;
    if (key === 'Escape') {
        this.pauseGame();
    }
});

function createEnemy(xOffset, monster) {
    const wp = this.randomWaypoints();
    enemies.push(new Enemy({
        position: {
            x: wp[0].x - xOffset,
            y: wp[0].y
        },
        health: monster.health,
        healthMax: monster.health,
        imageSrc: monster.walk.imageSrc,
        framesMax: monster.walk.framesMax,
        scale: monster.walk.scale,
        offset: { x: 0, y: 0 },
        speed: monster.speed,
        waypoints: wp,
        monster: monster,
        width: monster.walk.width,
        height: monster.walk.height,
        frameYMax: monster.walk.frameYMax
    }));
}

function createEnemyDie(projectile) {
    const sound = new Audio();;
    sound.src = './sound/orc-death.mp3';
    sound.play();
    const enemy = projectile.enemy;
    const monster = projectile.enemy.monster;
    enemiesDie.push(new Enemy({
        position: {
            x: enemy.position.x,
            y: enemy.position.y
        },
        health: 0,
        healthMax: monster.health,
        imageSrc: monster.die.imageDeathSrc,
        framesMax: monster.die.framesMax,
        scale: monster.die.scale,
        width: monster.die.width,
        height: monster.die.height,
        waypoints: enemy.waypoints,
        dead: true,
        monster: monster
    }));
}

function createExplosions(projectile, damage) {
    explosions.push(new Explosion({
        position: { x: projectile.position.x, y: projectile.position.y },
        damage: damage
    }));
}

function drawHeart() {
    heart.draw();
    c.font = "bold 27px 'Press Start 2P', cursive";
    c.fillStyle = 'black';
    c.fillText(hearts, heart.position.x + (heart.width * heart.scale) + 8, heart.position.y + heart.height * heart.scale - 2);
    c.fillStyle = 'yellow';
    c.fillText(hearts, heart.position.x + (heart.width * heart.scale) + 10, heart.position.y + heart.height * heart.scale);
}

function drawCoin() {
    coin.draw();
    c.font = "bold 27px 'Press Start 2P', cursive";
    c.fillStyle = 'black';
    c.fillText(coins, coin.position.x + (coin.width * coin.scale) + 8, coin.position.y + coin.height * coin.scale - 2);
    c.fillStyle = 'yellow';
    c.fillText(coins, coin.position.x + (coin.width * coin.scale) + 10, coin.position.y + coin.height * coin.scale);
}

function drawIMonster() {
    i_monster.draw();
    const content = waveCurrent + '/' + wavesMap1.length;
    c.font = "bold 25px 'Press Start 2P', cursive";
    c.fillStyle = 'black';
    c.fillText(content, i_monster.position.x + (i_monster.width * i_monster.scale) + 8, i_monster.position.y + i_monster.height * i_monster.scale - 2);
    c.fillStyle = 'yellow';
    c.fillText(content, i_monster.position.x + (i_monster.width * i_monster.scale) + 10, i_monster.position.y + i_monster.height * i_monster.scale);
}

function drawSkip() {
    if (speedGame === 3) {
        b_skip.image.src = './img/icon/b_skip_selected.png';
    }
    b_skip.draw();
    c.font = "bold 22px 'Press Start 2P', cursive";
    c.fillStyle = 'black';
    c.fillText('X' + speedGame, b_skip.position.x + 48, b_skip.position.y + 25);
    c.fillStyle = 'yellow';
    c.fillText('X' + speedGame, b_skip.position.x + 50, b_skip.position.y + 27);
}

function drawPause() {
    b_pause.draw();
}

function drawLandFlag() {
    placementTiles.sort((a, b) => {
        return (a.displayShop - b.displayShop)
    });
    placementTiles.forEach((tile) => {
        tile.update();
    });
}

function randomWaypoints() {
    const rdIndex = Math.floor((Math.random() * 11));
    if (rdIndex > 6) {
        return waypoints1_map1;
    } else if (rdIndex > 3) {
        return waypoints2_map1;
    } else {
        return waypoints3_map1;
    }
}

function openShopOfLand(activeTile) {
    this.clickSound();
    activeTile.displayShop = true;
    isShoping = true;
    activeTileShopping = activeTile;
}

function closeShopOfLand(activeTile) {
    this.clickSound();
    activeTile.displayShop = false;
    isShoping = false;
    activeTileShopping = undefined;
}

function openShopOfBuilding(activeTile) {
    this.clickSound();
    activeTile.building.displayShop = true;
    isShoping = true;
    activeTileShopping = activeTile;
}

function closeShopOfBuilding(activeTile) {
    this.clickSound();
    activeTile.building.displayShop = false;
    isShoping = false;
    activeTileShopping = undefined;
}

function checkBuyBuilding(event, activeTileShopping) {
    if (event.clientX > activeTileShopping.shop.slot1.position.x && event.clientX < activeTileShopping.shop.slot1.position.x + activeTileShopping.shop.slot1.width &&
        event.clientY > activeTileShopping.shop.slot1.position.y && event.clientY < activeTileShopping.shop.slot1.position.y + activeTileShopping.shop.slot1.height) {
        this.clickSound();
        if (activeTileShopping && !activeTileShopping.isOccupied && coins - priceTower >= 0) {
            // buy new building
            coins -= priceTower;
            const tower = activeTileShopping.shop.slot1.tower;
            const building = new Building({
                position: {
                    x: activeTileShopping.position.x,
                    y: activeTileShopping.position.y
                },
                scale: tower.scale,
                tower: tower,
                buildingId: (Math.floor(Math.random() * 100) * Math.floor(Math.random() * 100)),
                width: 128,
                height: 144
            });
            buildings.push(building);
            activeTileShopping.building = building;
            activeTileShopping.isOccupied = true;
            buildings.sort((a, b) => {
                return a.position.y - b.position.y
            });
            this.closeShopOfLand(activeTileShopping);
        }
    } else if (event.clientX > activeTileShopping.shop.slot2.position.x && event.clientX < activeTileShopping.shop.slot2.position.x + activeTileShopping.shop.slot2.width &&
        event.clientY > activeTileShopping.shop.slot2.position.y && event.clientY < activeTileShopping.shop.slot2.position.y + activeTileShopping.shop.slot2.height) {
        this.clickSound();
    } else if (event.clientX > activeTileShopping.shop.slot3.position.x && event.clientX < activeTileShopping.shop.slot3.position.x + activeTileShopping.shop.slot3.width &&
        event.clientY > activeTileShopping.shop.slot3.position.y && event.clientY < activeTileShopping.shop.slot3.position.y + activeTileShopping.shop.slot3.height) {
        this.clickSound();
    } else if (event.clientX > activeTileShopping.shop.slot4.position.x && event.clientX < activeTileShopping.shop.slot4.position.x + activeTileShopping.shop.slot4.width &&
        event.clientY > activeTileShopping.shop.slot4.position.y && event.clientY < activeTileShopping.shop.slot4.position.y + activeTileShopping.shop.slot4.height) {
        this.clickSound();
    }
}

function checkUpgradeBuilding(event, activeTileShopping) {
    const slot1 = activeTileShopping.building.shop.slot1;
    const slot2 = activeTileShopping.building.shop.slot2;
    const slot3 = activeTileShopping.building.shop.slot3;
    const slot4 = activeTileShopping.building.shop.slot4;
    // detroy building
    if (event.clientX > slot3.position.x && event.clientX < slot3.position.x + slot3.width &&
        event.clientY > slot3.position.y && event.clientY < slot3.position.y + slot3.height) {
        this.destroySound();
        coins += 50;
        for (let index = 0; index < buildings.length; index++) {
            const building = buildings[index];
            if (building.position.x === activeTileShopping.building.position.x &&
                building.position.y === activeTileShopping.building.position.y) {
                buildings.splice(index, 1);
                break;
            }
        }
        activeTileShopping.building = undefined;
        activeTileShopping.isOccupied = false;
        buildings.sort((a, b) => {
            return a.position.y - b.position.y
        });
        activeTileShopping.displayShop = false;
        isShoping = false;
        activeTileShopping = undefined;
    } else if (event.clientX > slot1.position.x && event.clientX < slot1.position.x + slot1.width &&
        event.clientY > slot1.position.y && event.clientY < slot1.position.y + slot1.height) {
        this.clickSound();
        if (coins - priceTower >= 0 && !activeTileShopping.building.upgrade) {
            // upgrade building slot 1
            for (let index = 0; index < buildings.length; index++) {
                const building = buildings[index];
                if (building.buildingId === activeTileShopping.building.buildingId) {
                    buildings.splice(index, 1);
                    coins -= priceTower;
                    const tower = activeTileShopping.building.tower.tw1;
                    const building = new Building({
                        position: {
                            x: activeTileShopping.position.x,
                            y: activeTileShopping.position.y
                        },
                        scale: tower.scale,
                        tower: tower,
                        buildingId: (Math.floor(Math.random() * 100) * Math.floor(Math.random() * 100)),
                        width: 128,
                        height: 144
                    });
                    building.upgrade = true;
                    buildings.push(building);
                    activeTileShopping.building = building;
                    buildings.sort((a, b) => {
                        return a.position.y - b.position.y
                    });
                    this.closeShopOfLand(activeTileShopping);
                    break;
                }
            }
        }
    } else if (event.clientX > slot2.position.x && event.clientX < slot2.position.x + slot2.width &&
        event.clientY > slot2.position.y && event.clientY < slot2.position.y + slot2.height) {
        this.clickSound();
    } else if (event.clientX > slot4.position.x && event.clientX < slot4.position.x + slot4.width &&
        event.clientY > slot4.position.y && event.clientY < slot4.position.y + slot4.height) {
        this.clickSound();
    }
}

function hoverShopOfLand() {
    if (!activeTileShopping) return;
    const shop = activeTileShopping.shop;
    const slot1 = shop.slot1;
    const slot2 = shop.slot2;
    const slot3 = shop.slot3;
    const slot4 = shop.slot4;
    if (mouse.x > slot1.position.x && mouse.x < slot1.position.x + slot1.width &&
        mouse.y > slot1.position.y && mouse.y < slot1.position.y + slot1.height) {
        shop.slot1Hover = true;
    } else if (mouse.x > slot2.position.x && mouse.x < slot2.position.x + slot2.width &&
        mouse.y > slot2.position.y && mouse.y < slot2.position.y + slot2.height) {
        shop.slot2Hover = true;
    } else if (mouse.x > slot3.position.x && mouse.x < slot3.position.x + slot3.width &&
        mouse.y > slot3.position.y && mouse.y < slot3.position.y + slot3.height) {
        shop.slot3Hover = true;
    } else if (mouse.x > slot4.position.x && mouse.x < slot4.position.x + slot4.width &&
        mouse.y > slot4.position.y && mouse.y < slot4.position.y + slot4.height) {
        shop.slot4Hover = true;
    } else {
        shop.slot1Hover = false;
        shop.slot2Hover = false;
        shop.slot3Hover = false;
        shop.slot4Hover = false;
    }
}

function hoverShopOfbuilding() {
    if (!activeTileShopping) return;
    if (!activeTileShopping.building) return;
    const shop = activeTileShopping.building.shop;
    const slot1 = shop.slot1;
    const slot2 = shop.slot2;
    const slot3 = shop.slot3;
    const slot4 = shop.slot4;
    if (mouse.x > slot1.position.x && mouse.x < slot1.position.x + slot1.width &&
        mouse.y > slot1.position.y && mouse.y < slot1.position.y + slot1.height) {
        shop.slot1Hover = true;
    } else if (mouse.x > slot2.position.x && mouse.x < slot2.position.x + slot2.width &&
        mouse.y > slot2.position.y && mouse.y < slot2.position.y + slot2.height) {
        shop.slot2Hover = true;
    } else if (mouse.x > slot3.position.x && mouse.x < slot3.position.x + slot3.width &&
        mouse.y > slot3.position.y && mouse.y < slot3.position.y + slot3.height) {
        shop.slot3Hover = true;
    } else if (mouse.x > slot4.position.x && mouse.x < slot4.position.x + slot4.width &&
        mouse.y > slot4.position.y && mouse.y < slot4.position.y + slot4.height) {
        shop.slot4Hover = true;
    } else {
        shop.slot1Hover = false;
        shop.slot2Hover = false;
        shop.slot3Hover = false;
        shop.slot4Hover = false;
    }
}