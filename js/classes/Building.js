class Building extends Sprite {
    constructor({ position = { x: 0, y: 0 }, scale, tower, buildingId}) {
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
        this.width = 64;
        this.height = 64;
        this.center = {
            x: this.position.x + this.width / 2,
            y: this.position.y + this.height / 2
        }
        this.projectiles = [];
        this.radius = tower.radius;
        this.target;
        this.elapsedSpawnTime = 0;
        this.damage = tower.damage;
        this.shop = new Shop({ position: {x: this.position.x - 40 , y: this.position.y - 30 }, imageSrc: tower.upgradeImg}, tower.tw1, tower.tw2, tower.tw3, tower.tw4);
        this.displayShop = false;
        this.frameShoot = tower.frameShoot;
        this.tower = tower;
    }

    draw() {
        super.draw();
        if (this.displayShop) {
            this.shop.update();
        } 
    }

    update(speedGame) {
        // c.beginPath();
        // c.arc(this.center.x, this.center.y, this.radius, 0, 2 * Math.PI);
        // c.stroke();

        this.draw();
        if (this.target || !this.target && this.frames.current !== 0) super.update(speedGame);
        if (this.target && this.frames.current === this.frameShoot && this.frames.elapsed % (this.frames.hold/ speedGame) === 0) this.shoot();
    }

    shoot() {
        var sound = document.createElement("audio");
        sound.src = './sound/stone-shooting.mp3';
        sound.setAttribute("preload", "auto");
        sound.setAttribute("controls", "none");
        sound.style.display = "none";
        document.body.appendChild(sound);
        sound.volume = 0.5;
        sound.play();

        setTimeout(() => {
            sound.remove();
        }, 500);
        this.projectiles.push(
            new Projecttile({
                position: {
                    x: this.center.x - 10,
                    y: this.center.y - 50
                },
                enemy: this.target,
                scale: 0.5
            })
        );
    }
}