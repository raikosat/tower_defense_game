const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
canvas.width = 1280;
canvas.height = 768;
c.fillStyle = 'white';
c.fillRect(0, 0, canvas.width, canvas.height);

const placementTilesData2D = [];
const buildings = [];
const placementTiles = [];
const explosions = [];
const enemies = [];
const enemiesDie = [];
const image = new Image();
image.src = './img/gameMap.png';
const mouse = {
    x: undefined,
    y: undefined
}
const priceTower = 50;
let activeTile = undefined;
let upActiveTile = undefined;
let wave = 1;
let waves = rounds;
let enemyCount = 3;
let hearts = 10;
let coins = 100;

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

image.onload = () => {
    animate();
}

function spawnEnemies() {
    showWave();
    const round = waves[wave - 1];
    const enemiesRound = round.enemies;

    let count = 1;
    for (let k = 0; k < enemiesRound.length; k++) {
        const enemiesDetails = enemiesRound[k];
        for (let i = 1; i < enemiesDetails.count + 1; i++) {
            const xOffset = count * 100;
            count++;
            enemies.push(new Enemy({
                position: {
                    x: waypoints[0].x - xOffset,
                    y: waypoints[0].y
                },
                lv: enemiesDetails.lv,
                health: 100 + ((enemiesDetails.lv - 1) * 50),
                healthMax: 100 + ((enemiesDetails.lv - 1) * 50),
                imageSrc: 'img/orc.png',
                framesMax: 7
            }));

        }
    }
}
spawnEnemies();

function showWave() {
    document.querySelector('#wave').innerHTML = 'WAVE ' + wave;
    document.querySelector('#wave').style.display = 'flex';
    setTimeout(() => {
        document.querySelector('#wave').style.display = 'none';
    }, 1000)
}

function animate() {
    const animationId = requestAnimationFrame(animate);
    c.drawImage(image, 0, 0);
    document.querySelector('#coins').innerHTML = coins;

    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.update();
        if (enemy.position.x > canvas.width) {
            hearts -= 1;
            enemies.splice(i, 1);
            document.querySelector('#hearts').innerHTML = hearts;

            if (hearts === 0) {
                cancelAnimationFrame(animationId);
                document.querySelector('#gameOver').style.display = 'flex';
            }
        }
    }

    for (let i = explosions.length - 1; i >= 0; i--) {
        const explosion = explosions[i];
        explosion.draw();
        explosion.update();

        if (explosion.frames.current >= explosion.frames.max - 1) {
            explosions.splice(i, 1);
        }
    }

    for (let i = enemiesDie.length - 1; i >= 0; i--) {
        const enemyDie = enemiesDie[i];
        enemyDie.draw();
        enemyDie.update();

        if (enemyDie.frames.current >= enemyDie.frames.max - 1) {
            enemiesDie.splice(i, 1);
        }
    }

    // tracking total amount of enemies
    if (enemies.length === 0) {
        wave++;
        if (wave < waves.length) {
            spawnEnemies();
        } else {
            document.querySelector('#gameOver').innerHTML = "WIN";
            document.querySelector('#gameOver').style.display = 'flex';
        }
    }

    placementTiles.forEach((tile) => {
        tile.update(mouse);
    });

    buildings.forEach((building) => {
        building.update();
        building.target = null;
        const validEnemies = enemies.filter(enemy => {
            const xDifference = enemy.center.x - building.center.x;
            const yDifference = enemy.center.y - building.center.y;
            const distance = Math.hypot(xDifference, yDifference);
            return distance < enemy.radius + building.radius;
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
                projectile.enemy.health -= building.damage * building.lv;
                if (projectile.enemy.health <= 0) {
                    const enemyIndex = enemies.findIndex((enemy) => {
                        return projectile.enemy === enemy;
                    });
                    if (enemyIndex > -1) {
                        enemiesDie.push(new Enemy({
                            position: {
                                x: projectile.enemy.position.x,
                                y: projectile.enemy.position.y
                            },
                            lv: projectile.enemy.lv,
                            health: 0,
                            healthMax: 100 + ((projectile.enemy.lv - 1) * 50),
                            imageSrc: 'img/orcdie.png',
                            framesMax: 7
                        }));

                        enemies.splice(enemyIndex, 1);
                        coins += projectile.enemy.bounes;
                        document.querySelector('#coins').innerHTML = coins;
                    };
                }
                explosions.push(new Sprite({
                    position: { x: projectile.position.x, y: projectile.position.y },
                    imageSrc: './img/explosion.png',
                    frames: { max: 4 },
                    offset: { x: 0, y: 0 }
                }));
                building.projectiles.splice(i, 1);
            }
        }
    });
}

function upLvTower() {
    if (upActiveTile && upActiveTile.isOccupied && coins >= 150 * upActiveTile.building.lv && upActiveTile.building.lv < 3) {
        coins -= 150 * upActiveTile.building.lv;
        upActiveTile.building.lv += 1;
        upActiveTile.building.upLvPrice = upActiveTile.building.lv * 150;
        document.querySelector('#dialog').style.display = 'none';
        upActiveTile = null;
    }
}

function closeDialog() {
    document.querySelector('#dialog').style.display = 'none';
}

canvas.addEventListener('click', (event) => {
    if (activeTile && !activeTile.isOccupied && coins - priceTower >= 0) {
        // new building
        coins -= priceTower;
        const building = new Building({
            position: {
                x: activeTile.position.x,
                y: activeTile.position.y
            }
        });
        buildings.push(building);
        activeTile.building = building;
        activeTile.isOccupied = true;
        buildings.sort((a, b) => {
            return a.position.y - b.position.y
        });
    } else if (activeTile && activeTile.isOccupied && coins >= activeTile.building.upLvPrice * activeTile.building.lv && activeTile.building.lv < 3) {
        // tower up level
        document.querySelector('#dialog').style.display = 'flex';
        upActiveTile = activeTile;
    }
    console.log();
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