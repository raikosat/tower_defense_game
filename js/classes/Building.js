class Building extends Sprite {
    constructor({ position = { x: 0, y: 0 }, scale }) {
        super({
            position,
            imageSrc: 'img/tower.png',
            frames: {
                max: 19,

            },
            offset: {
                x: 2,
                y: -20
            },
            scale: scale
        });
        this.width = 64;
        this.height = 64;
        this.center = {
            x: this.position.x + this.width / 2,
            y: this.position.y + this.height / 2
        }
        this.projectiles = [];
        this.radius = 250;
        this.target;
        this.elapsedSpawnTime = 0;
        this.damage = 10;
        this.shop = false;
        this.xShop = this.center.x - 50;
        this.yShop = this.center.y - 240;
        this.wShop = 80;
        this.hShop = 80;
    }

    draw() {
        super.draw();
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
                    x: this.center.x - 40,
                    y: this.center.y - 50
                },
                enemy: this.target,
                scale: 0.5
            })
        );
    }
}