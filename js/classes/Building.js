class Building extends Sprite {
    constructor({ position = { x: 0, y: 0 } }) {
        super({
            position,
            imageSrc: 'img/tower.png',
            frames: {
                max: 19,

            },
            offset: {
                x: 0,
                y: -80
            }
        });
        this.width = 64 * 2;
        this.height = 64;
        this.center = {
            x: this.position.x + this.width / 2,
            y: this.position.y + this.height / 2
        }
        this.projectiles = [];
        this.radius = 250;
        this.target;
        this.elapsedSpawnTime = 0;
        this.lv = 1;
        this.damage = 10;
        this.upLvPrice = 100;
        this.shop = false;
        this.xShop = this.center.x - 50;
        this.yShop = this.center.y - 240;
        this.wShop = 80;
        this.hShop = 80;
    }

    draw() {
        super.draw();
        // tower lv
        c.fillStyle = 'white';
        c.fillText('Lv' + this.lv, this.position.x + 115, this.position.y + 55);

        // up lv required
        if (this.lv < 3) {
            c.fillText(this.upLvPrice + 'Up', this.position.x + 115, this.position.y);
        }

        if (this.shop) {
            c.beginPath();
            c.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2);
            c.fillStyle = 'rgba(0, 0, 255, 0.2)';
            c.fill();

            if (this.lv < 3) {
                c.fillStyle = 'yellow';
                c.fillRect(this.xShop, this.yShop, this.wShop, this.hShop);
                c.font = "12px Changa One";
                c.fillStyle = 'black';
                c.fillText('Up Lv' + (this.lv + 1), this.center.x - 25, this.center.y - 210);
                c.fillText(this.upLvPrice + 'G', this.center.x - 25, this.center.y - 190);
            }
        }

    }

    update() {
        this.draw();
        if (this.target || !this.target && this.frames.current !== 0) super.update();
        if (this.target && this.frames.current === 6 && this.frames.elapsed % this.frames.hold === 0) this.shoot();
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
                    x: this.center.x - 20,
                    y: this.center.y - 110
                },
                enemy: this.target
            })
        );
    }
}