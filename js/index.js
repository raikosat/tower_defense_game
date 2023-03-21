const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
canvas.width = 1280;
canvas.height = 768;
c.fillStyle = 'white';
c.font = "12px Changa One";
c.fillRect(0, 0, canvas.width, canvas.height);

const placementTilesData2D = [];
const buildings = [];
const placementTiles = [];
const explosions = [];
const enemies = [];
const enemiesDie = [];
const image = new Image();
image.src = './img/map/gameMap.png';
const mouse = {
    x: undefined,
    y: undefined
}
const priceTower = 70;
let activeTile = undefined;
let activeTileShopping = undefined;
let wave = 1;
let enemyCount = 3;
let hearts = 10;
let coins = 250;
let isShoping = false;
let speedGame = 1;
let speedMaxGame = 3;

const heart = new Sprite({
    position: { x: canvas.width - 90, y: 15 },
    imageSrc: './img/icon/heart.png',
    scale: 0.1,
    width: 270,
    height: 229
});

const coin = new Sprite({
    position: { x: canvas.width - 180, y: 10 },
    imageSrc: './img/icon/coin.png',
    scale: 0.18,
    width: 160,
    height: 160
});

const b_skip = new Sprite({
    position: { x: canvas.width - 270, y: 10 },
    imageSrc: './img/icon/b_skip.png',
    scale: 0.35,
    width: 130,
    height: 78
});

function initPlacementTilesData() {
    for (let i = 0; i < placementTilesData.length; i += 20) {
        placementTilesData2D.push(placementTilesData.slice(i, i + 20));
    }
}
initPlacementTilesData();

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
createPlacementTilesData2D();

function soundBackground() {
    var sound = document.createElement("audio");
    sound.src = './sound/sound-background.mp3';
    sound.setAttribute("preload", "auto");
    sound.setAttribute("controls", "none");
    sound.style.display = "none";
    sound.loop = true;
    document.body.appendChild(sound);
    sound.play();
}

image.onload = () => {
    c.drawImage(image, 0, 0);
}

function startGame() {
    document.querySelector('#startGame').style.display = 'none';
    soundBackground();
    this.drawHeart();
    this.drawCoin();
    this.drawSkip();
    this.drawLandFlag();
    setTimeout(() => {
        spawnEnemies();
        animate();
    }, 1000);
}

function spawnEnemies() {
    showWave();
    const turn = wavesMap1[wave - 1];
    const enemiesTurn = turn.enemies;

    for (let k = 0; k < enemiesTurn.length; k++) {
        const enemiesDetails = enemiesTurn[k];
        const monster = enemiesDetails.monster;
        let xOffset = 0;
        for (let i = 0; i < enemiesDetails.count; i++) {
            if (i == 0) {
                xOffset = 100;
            } else if (i % 6 == 0) {
                xOffset += 800;
            } else {
                xOffset += 40;
            }
            this.createEnemy(xOffset, monster);
        }
    }
}

function showWave() {
    document.querySelector('#wave').style.display = 'flex';
    document.querySelector('#wave').innerHTML = 'WAVE ' + wave;
    setTimeout(() => {
        document.querySelector('#wave').style.display = 'none';
    }, 3000);
}

function animate() {
    const animationId = requestAnimationFrame(animate);
    c.drawImage(image, 0, 0);
    this.drawHeart();
    this.drawCoin();
    this.drawSkip();

    // enemy into end map
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.update(speedGame);
        if (enemy.position.x > canvas.width) {
            hearts -= 1;
            enemies.splice(i, 1);
            if (hearts <= 0) {
                cancelAnimationFrame(animationId);
                document.querySelector('#gameOver').style.display = 'flex';
            }
        }
    }

    // animation explosions
    for (let i = explosions.length - 1; i >= 0; i--) {
        const explosion = explosions[i];
        explosion.draw();
        explosion.update(speedGame);
        if (explosion.frames.frameX >= explosion.frames.max - 1) {
            explosions.splice(i, 1);
        }
    }

    // animation enemies die
    for (let i = enemiesDie.length - 1; i >= 0; i--) {
        const enemyDie = enemiesDie[i];
        enemyDie.update(speedGame);

        if (enemyDie.frames.frameX >= enemyDie.frames.max - 1) {
            enemiesDie.splice(i, 1);
        }
    }

    // tracking total amount of enemies
    if (enemies.length === 0) {
        wave++;
        if (wave <= wavesMap1.length) {
            spawnEnemies();
        } else {
            document.querySelector('#gameOver').innerHTML = "WIN";
            document.querySelector('#gameOver').style.display = 'flex';
        }
    }

    // order display shop of building and shop of land
    if (activeTile && activeTile.displayShop) {
        this.animationBuilding();
        this.drawLandFlag();
    } else {
        this.drawLandFlag();
        this.animationBuilding();
    }
}

function animationBuilding() {
    buildings.sort((a, b) => {
        return a.displayShop - b.displayShop;
    });
    buildings.forEach((building) => {
        building.update(speedGame);
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
            projectile.update(speedGame);

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
                this.createExplosions(projectile, building.damage);
                building.projectiles.splice(i, 1);
            }
        }
    });
}

function sound(soundSrc) {
    var sound = document.createElement("audio");
    sound.src = soundSrc;
    sound.setAttribute("preload", "auto");
    sound.setAttribute("controls", "none");
    sound.style.display = "none";
    document.body.appendChild(sound);
    sound.play();
    setTimeout(() => {
        sound.remove();
    }, 500);
}

canvas.addEventListener('click', (event) => {
    //click skip button
    if (event.clientX > b_skip.position.x &&
        event.clientX < b_skip.position.x + (b_skip.image.width * b_skip.scale) &&
        event.clientY > b_skip.position.y &&
        event.clientY < b_skip.position.y + (b_skip.image.height * b_skip.scale)) {
        speedGame = (speedGame == 1 ? speedMaxGame : 1);
        this.drawSkip();
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

    if (mouse.x > b_skip.position.x && mouse.x < b_skip.position.x + (b_skip.image.width * b_skip.scale) &&
        mouse.y > b_skip.position.y && mouse.y < b_skip.position.y + (b_skip.image.height * b_skip.scale)) {
        b_skip.image.src = './img/icon/b_skip_selected.png';
    } else {
        b_skip.image.src = './img/icon/b_skip.png';
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
        } else if (tile.isOccupied)  {
            tile.building.hover = false;
        }
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
        height: monster.walk.height
    }));
}

function createEnemyDie(projectile) {
    sound('./sound/orc-death.mp3');
    enemiesDie.push(new Enemy({
        position: {
            x: projectile.enemy.position.x,
            y: projectile.enemy.position.y
        },
        health: 0,
        healthMax: projectile.enemy.monster.health,
        imageSrc: projectile.enemy.monster.die.imageDeathSrc,
        framesMax: projectile.enemy.monster.die.framesMax,
        scale: projectile.enemy.monster.die.scale,
        width: projectile.enemy.monster.die.width,
        height: projectile.enemy.monster.die.height,
        waypoints: projectile.enemy.waypoints,
        dead: true
    }));
}

function createExplosions(projectile, damage) {
    explosions.push(new Explostion({
        position: { x: projectile.position.x, y: projectile.position.y },
        damage: damage
    }));
}

function drawHeart() {
    heart.draw();
    c.fillStyle = 'white';
    c.font = "bold 24px Changa One cursive";
    c.fillText(hearts, canvas.width - 50, 35);
}

function drawCoin() {
    coin.draw();
    c.fillStyle = 'white';
    c.font = "bold 24px Changa One cursive";
    c.fillText(coins, canvas.width - 140, 35);
}

function drawSkip() {
    b_skip.draw();
    c.fillStyle = 'white';
    c.font = "bold 22px Changa One cursive";
    c.fillText('X' + speedGame, canvas.width - 220, 33);
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
    activeTile.displayShop = true;
    isShoping = true;
    activeTileShopping = activeTile;
}

function closeShopOfLand(activeTile) {
    activeTile.displayShop = false;
    isShoping = false;
    activeTileShopping = undefined;
}

function openShopOfBuilding(activeTile) {
    activeTile.building.displayShop = true;
    isShoping = true;
    activeTileShopping = activeTile;
}

function closeShopOfBuilding(activeTile) {
    activeTile.building.displayShop = false;
    isShoping = false;
    activeTileShopping = undefined;
}

function checkBuyBuilding(event, activeTileShopping) {
    if (event.clientX > activeTileShopping.shop.slot1.position.x && event.clientX < activeTileShopping.shop.slot1.position.x + activeTileShopping.shop.slot1.width &&
        event.clientY > activeTileShopping.shop.slot1.position.y && event.clientY < activeTileShopping.shop.slot1.position.y + activeTileShopping.shop.slot1.height) {
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
    }
}

function checkUpgradeBuilding(event, activeTileShopping) {
    // detroy building
    if (event.clientX > activeTileShopping.building.shop.slot3.position.x &&
            event.clientX < activeTileShopping.building.shop.slot3.position.x + activeTileShopping.building.shop.slot3.width &&
            event.clientY > activeTileShopping.building.shop.slot3.position.y &&
            event.clientY < activeTileShopping.building.shop.slot3.position.y + activeTileShopping.building.shop.slot3.height) {
        coins += 30;
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
    } else if (event.clientX > activeTileShopping.building.shop.slot1.position.x &&
        event.clientX < activeTileShopping.building.shop.slot1.position.x + activeTileShopping.building.shop.slot1.width &&
        event.clientY > activeTileShopping.building.shop.slot1.position.y &&
        event.clientY < activeTileShopping.building.shop.slot1.position.y + activeTileShopping.building.shop.slot1.height &&
        coins - priceTower >= 0) {
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
}

function hoverShopOfLand() {
    if (activeTileShopping && mouse.x > activeTileShopping.shop.slot1.position.x && mouse.x < activeTileShopping.shop.slot1.position.x + (activeTileShopping.shop.slot1.width) &&
        mouse.y > activeTileShopping.shop.slot1.position.y && mouse.y < activeTileShopping.shop.slot1.position.y + (activeTileShopping.shop.slot1.height)) {
        activeTileShopping.shop.slot1Hover = true;
    } else if (activeTileShopping && mouse.x > activeTileShopping.shop.slot2.position.x && mouse.x < activeTileShopping.shop.slot2.position.x + (activeTileShopping.shop.slot2.width) &&
        mouse.y > activeTileShopping.shop.slot2.position.y && mouse.y < activeTileShopping.shop.slot2.position.y + (activeTileShopping.shop.slot2.height)) {
        activeTileShopping.shop.slot2Hover = true;
    } else if (activeTileShopping && mouse.x > activeTileShopping.shop.slot3.position.x && mouse.x < activeTileShopping.shop.slot3.position.x + (activeTileShopping.shop.slot3.width) &&
        mouse.y > activeTileShopping.shop.slot3.position.y && mouse.y < activeTileShopping.shop.slot3.position.y + (activeTileShopping.shop.slot3.height)) {
        activeTileShopping.shop.slot3Hover = true;
    } else if (activeTileShopping && mouse.x > activeTileShopping.shop.slot4.position.x && mouse.x < activeTileShopping.shop.slot4.position.x + (activeTileShopping.shop.slot4.width) &&
        mouse.y > activeTileShopping.shop.slot4.position.y && mouse.y < activeTileShopping.shop.slot4.position.y + (activeTileShopping.shop.slot4.height)) {
        activeTileShopping.shop.slot4Hover = true;
    } else if (activeTileShopping) {
        activeTileShopping.shop.slot1Hover = false;
        activeTileShopping.shop.slot2Hover = false;
        activeTileShopping.shop.slot3Hover = false;
        activeTileShopping.shop.slot4Hover = false;
    }
}

function hoverShopOfbuilding() {
    if (activeTileShopping && activeTileShopping.building && mouse.x > activeTileShopping.building.shop.slot1.position.x && mouse.x < activeTileShopping.building.shop.slot1.position.x + (activeTileShopping.building.shop.slot1.width) &&
        mouse.y > activeTileShopping.building.shop.slot1.position.y && mouse.y < activeTileShopping.building.shop.slot1.position.y + (activeTileShopping.building.shop.slot1.height)) {
        activeTileShopping.building.shop.slot1Hover = true;
    } else if (activeTileShopping && activeTileShopping.building && mouse.x > activeTileShopping.building.shop.slot2.position.x && mouse.x < activeTileShopping.building.shop.slot2.position.x + (activeTileShopping.building.shop.slot2.width) &&
        mouse.y > activeTileShopping.building.shop.slot2.position.y && mouse.y < activeTileShopping.building.shop.slot2.position.y + (activeTileShopping.building.shop.slot2.height)) {
        activeTileShopping.building.shop.slot2Hover = true;
    } else if (activeTileShopping && activeTileShopping.building && mouse.x > activeTileShopping.building.shop.slot3.position.x && mouse.x < activeTileShopping.building.shop.slot3.position.x + (activeTileShopping.building.shop.slot3.width) &&
        mouse.y > activeTileShopping.building.shop.slot3.position.y && mouse.y < activeTileShopping.building.shop.slot3.position.y + (activeTileShopping.building.shop.slot3.height)) {
        activeTileShopping.building.shop.slot3Hover = true;
    } else if (activeTileShopping && activeTileShopping.building && mouse.x > activeTileShopping.building.shop.slot4.position.x && mouse.x < activeTileShopping.building.shop.slot4.position.x + (activeTileShopping.building.shop.slot4.width) &&
        mouse.y > activeTileShopping.building.shop.slot4.position.y && mouse.y < activeTileShopping.building.shop.slot4.position.y + (activeTileShopping.building.shop.slot4.height)) {
        activeTileShopping.building.shop.slot4Hover = true;
    } else if (activeTileShopping && activeTileShopping.building) {
        activeTileShopping.building.shop.slot1Hover = false;
        activeTileShopping.building.shop.slot2Hover = false;
        activeTileShopping.building.shop.slot3Hover = false;
        activeTileShopping.building.shop.slot4Hover = false;
    }
}