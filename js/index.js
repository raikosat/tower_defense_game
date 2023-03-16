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
const priceTower = 50;
let activeTile = undefined;
let activeTileShopping = undefined;
let wave = 1;
let waves = rounds;
let enemyCount = 3;
let hearts = 10;
let coins = 250;
let isShoping = false;

const heart = new Sprite({
    position: { x: canvas.width - 90, y: 15 },
    imageSrc: './img/icon/heart.png',
    scale: 0.1
});

const coin = new Sprite({
    position: { x: canvas.width - 180, y: 10 },
    imageSrc: './img/icon/coin.png',
    scale: 0.18
}); 

for (let i = 0; i < placementTilesData.length; i += 20) {
    placementTilesData2D.push(placementTilesData.slice(i, i + 20));
}

placementTilesData2D.forEach((row, y) => {
    row.forEach((symbol, x) => {
        if (symbol === 14) {
            // add building placement tile here
            placementTiles.push(
                new PlacementTile({
                    position: {
                        x: x * 64,
                        y: y * 64
                    }
                })
            )
        }
    });
});

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
    this.drawLandFlag();
    setTimeout(() => {
        spawnEnemies();
        animate();
    }, 1000);
}

function spawnEnemies() {
    showWave();
    const round = waves[wave - 1];
    const enemiesRound = round.enemies;

    for (let k = 0; k < enemiesRound.length; k++) {
        const enemiesDetails = enemiesRound[k];
        let xOffset = 0;
        for (let i = 1; i < enemiesDetails.count + 1; i++) {
            if (i == 1) {
                xOffset = 100;
            } else if (i % 6 == 0) {
                xOffset += 200;
            } else {
                xOffset += 40;
            }
            this.createEnemy(xOffset);
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
    this.drawLandFlag();

    // enemy into end map
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.update();
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
        explosion.update();

        if (explosion.frames.current >= explosion.frames.max - 1) {
            explosions.splice(i, 1);
        }
    }

    // animation enemies die
    for (let i = enemiesDie.length - 1; i >= 0; i--) {
        const enemyDie = enemiesDie[i];
        enemyDie.update();

        if (enemyDie.frames.current >= enemyDie.frames.max - 1) {
            enemiesDie.splice(i, 1);
        }
    }

    // tracking total amount of enemies
    if (enemies.length === 0) {
        wave++;
        if (wave <= waves.length) {
            spawnEnemies();
        } else {
            document.querySelector('#gameOver').innerHTML = "WIN";
            document.querySelector('#gameOver').style.display = 'flex';
        }
    }

    buildings.forEach((building) => {
        building.update();
        building.target = null;
        const validEnemies = enemies.filter(enemy => {
            const xDifference = enemy.center.x - building.center.x;
            const yDifference = enemy.center.y - building.center.y;
            const distance = Math.hypot(xDifference, yDifference);
            return (distance < enemy.radius + building.radius && enemy.position.x > 0 &&  enemy.position.y > 0);
        });
        building.target = validEnemies[0];

        for (let i = building.projectiles.length - 1; i >= 0; i--) {
            const projectile = building.projectiles[i];
            projectile.update();

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
                this.createExplosions(projectile);
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
    if (activeTile && !activeTile.displayShop && !isShoping) {
        activeTile.displayShop = true;
        isShoping = true;
        activeTileShopping = activeTile;
    } else if (activeTile && activeTile.displayShop) {
        activeTile.displayShop = false;
        isShoping = false;
        activeTileShopping = undefined;
    } else if (activeTileShopping && !activeTileShopping.isOccupied) {
        if (event.clientX > activeTileShopping.shop.slot1.position.x && event.clientX < activeTileShopping.shop.slot1.position.x + activeTileShopping.shop.slot1.width &&
            event.clientY > activeTileShopping.shop.slot1.position.y && event.clientY < activeTileShopping.shop.slot1.position.y + activeTileShopping.shop.slot1.height) {
            if (activeTileShopping && !activeTileShopping.isOccupied && coins - priceTower >= 0) {
                // new building
                coins -= priceTower;
                const building = new Building({
                    position: {
                        x: activeTileShopping.position.x,
                        y: activeTileShopping.position.y
                    },
                    scale: 0.5
                });
                buildings.push(building);
                activeTileShopping.building = building;
                activeTileShopping.isOccupied = true;
                buildings.sort((a, b) => {
                    return a.position.y - b.position.y
                });
                activeTileShopping.displayShop = false;
                isShoping = false;
                activeTileShopping = undefined;
            }
        }
    } else if (activeTileShopping && activeTileShopping.isOccupied) {
        if (event.clientX > activeTileShopping.shop.slot3.position.x && event.clientX < activeTileShopping.shop.slot3.position.x + activeTileShopping.shop.slot3.width &&
            event.clientY > activeTileShopping.shop.slot3.position.y && event.clientY < activeTileShopping.shop.slot3.position.y + activeTileShopping.shop.slot3.height) {
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
        }
    }
});

window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;

    activeTile = null;
    for (let i = 0; i < placementTiles.length; i++) {
        const tile = placementTiles[i];
        if (mouse.x > tile.position.x && mouse.x < tile.position.x + tile.size &&
            mouse.y > tile.position.y && mouse.y < tile.position.y + tile.size) {
            activeTile = tile;
            break;
        }

    }
});

function createEnemy(xOffset) {
    const wp = this.randomWaypoints();
    enemies.push(new Enemy({
        position: {
            x: wp[0].x - xOffset,
            y: wp[0].y
        },
        health: 100,
        healthMax: 100,
        imageSrc: 'img/characters/orc.png',
        framesMax: 7,
        scale: 0.7,
        offset: { x: 0, y: 0 },
        speed: 0.8,
        waypoints: wp
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
        healthMax: 100,
        imageSrc: 'img/characters/orcdie.png',
        framesMax: 7,
        scale: 0.7
    }));
}

function createExplosions(projectile) {
    explosions.push(new Sprite({
        position: { x: projectile.position.x, y: projectile.position.y },
        imageSrc: './img/buildings/explosion.png',
        frames: { max: 4 },
        offset: { x: 0, y: 0 },
        scale: 0.5
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

function drawLandFlag() {
    placementTiles.forEach((tile) => {
        tile.update(mouse);
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