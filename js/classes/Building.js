class Building extends Sprite {
    constructor({ position = { x: 0, y: 0 }, scale, tower, buildingId, width, height }) {
        super({
            position,
            imageSrc: tower.imageSrc,
            frames: {
                max: tower.framsMax,
            },
            offset: {
                x: tower.offset.x,
                y: tower.offset.y
            },
            scale: scale
        });
        this.buildingId = buildingId;
        this.width = width;
        this.height = height;
        this.widthScale = this.width * scale;
        this.heightScale = this.height * scale;
        this.center = {
            x: this.position.x + this.widthScale / 2,
            y: this.position.y + this.heightScale / 2
        };
        this.projectiles = [];
        this.radius = tower.radius;
        this.target;
        this.elapsedSpawnTime = 0;
        this.damage = tower.damage;
        this.shop = new Shop({ position: { x: this.position.x - 40, y: this.position.y - 30 }, imageSrc: tower.upgradeImg, width: 142, height: 127, tw1: tower.tw1, tw2: tower.tw2, tw3: tower.tw3, tw4: tower.tw4 });
        this.displayShop = false;
        this.frameShoot = tower.frameShoot;
        this.tower = tower;
        this.loading = true;
        this.loadingPercent = 0;
        this.elapsed = 0;
        this.frameHold = 3;
        this.upgrade = false;
    }

    draw() {
        super.draw();
        if (this.displayShop) {
            this.shop.update();
        }
    }

    update(speedGame, deltaTime, timeInterval) {
        // c.beginPath();
        // c.arc(this.center.x, this.center.y, this.radius, 0, 2 * Math.PI);
        // c.strokeStyle = 'red';
        // c.stroke();

        this.elapsed++;
        if (this.loading) {
            this.image.src = './img/buildings/loading.png';
            this.frames.max = 1;
            if (this.loadingPercent < 100 && Math.round(this.elapsed % (0.6 / speedGame)) == 0) {
                this.loadingPercent += 1;
            }
            if (this.loadingPercent >= 100) {
                const building_finish = new Audio();
                building_finish.src = './sound/building_finish.wav';
                building_finish.play();
                this.loading = false;
            }
            c.fillStyle = 'green';
            c.fillRect(this.position.x, this.position.y + this.heightScale, (this.widthScale * this.loadingPercent) / 100, 5);
            this.draw();
            return;
        } else if (this.hover) {
            this.image.src = this.tower.image_selected;
            this.frames.max = this.tower.framsMax;
        } else {
            this.image.src = this.tower.imageSrc;
            this.frames.max = this.tower.framsMax;
        }
        this.draw();

        if (this.target || !this.target && this.frames.frameX !== 0) {
            if (speedGame === 3) {
                if (this.elapsed % (this.frameHold/speedGame) === 0) {
                    this.frames.frameX++;
                    if (this.frames.frameX >= this.frames.max) {
                        this.frames.frameX = 0;
                    }
                    this.frameTimer = 0;
                } else {
                    this.frameTimer += deltaTime;
                }
            } else {
                super.update(speedGame, deltaTime, timeInterval);
            }
        }
        if (speedGame === 3) {
            if (this.target && this.frames.frameX === this.frameShoot && this.elapsed % (this.frameHold/speedGame) === 0) this.shoot();
        } else {
            if (this.target && this.frames.frameX === this.frameShoot && this.frameTimer > (timeInterval)) this.shoot();
        }
    }

    shoot() {
        const stone_shooting = new Audio();
        stone_shooting.src = './sound/stone-shooting1.flac';
        stone_shooting.play();
        this.projectiles.push(
            new Projecttile({
                position: {
                    x: this.center.x - 10,
                    y: this.center.y - 50
                },
                enemy: this.target,
                scale: 0.5,
                width: 32,
                height: 26
            })
        );
    }
}