class Enemy extends Sprite {
    constructor({ position = { x: 0, y: 0 }, health = 100, healthMax = 100, imageSrc, framesMax, scale = 1, offset, speed = 1, waypoints, monster, width, height, dead = false, frameYMax }) {
        super({
            position,
            imageSrc: imageSrc,
            frames: {
                max: framesMax
            },
            scale: scale,
            offset: offset,
            width: width,
            height: height
        });
        this.position = position;
        this.width = width;
        this.height = height;
        this.widthScale = this.width * scale;
        this.heightScale = this.height * scale;
        this.center = {
            x: this.position.x + this.widthScale / 2,
            y: this.position.y + this.heightScale / 2
        }
        this.waypointIndex = 0;
        this.radius = 20;
        this.health = health;
        this.healthMax = healthMax;
        this.velocity = {
            x: 0,
            y: 0
        };
        this.bounes = monster.bonus;
        this.speed = speed;
        this.waypoints = waypoints;
        this.monster = monster;
        this.dead = dead;
        this.frameYMax = frameYMax;
        this.imageBonus = new Image();
        this.imageBonus.src = 'img/icon/coin.png';
    }

    draw() {
        if (this.dead) this.drawBonus();
        super.draw();
        this.drawHealthBar();
    }

    update(speedGame, deltaTime, timeInterval) {
        // c.strokeStyle = 'black';
        // c.strokeRect(this.position.x, this.position.y, this.width, this.height);

        // c.beginPath();
        // c.arc(this.center.x, this.center.y, this.radius, 0, 2 * Math.PI);
        // c.strokeStyle = 'red';
        // c.stroke();

        if (!this.waypoints) return;
        const waypoint = this.waypoints[this.waypointIndex];

        if (this.dead || this.frameYMax === 1) {
            this.frames.frameY = 0;
        } else {
            if (waypoint.x > this.center.x) {
                this.frames.frameY = 0;
            } else {
                this.frames.frameY = 1;
            }
        }

        super.update(speedGame, deltaTime, timeInterval);

        const yDistance = waypoint.y - this.center.y;
        const xDistance = waypoint.x - this.center.x;
        const angle = Math.atan2(yDistance, xDistance);

        this.velocity.x = (Math.cos(angle) * this.speed) * speedGame;
        this.velocity.y = (Math.sin(angle) * this.speed) * speedGame;

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.center = {
            x: this.position.x + (this.widthScale / 2),
            y: this.position.y + (this.heightScale / 2)
        };

        if (
            Math.abs(Math.round(this.center.x) - Math.round(waypoint.x)) < Math.abs(this.velocity.x) + 1 &&
            Math.abs(Math.round(this.center.y) - Math.round(waypoint.y)) < Math.abs(this.velocity.y) + 1 &&
            this.waypointIndex < (this.waypoints.length - 1)
        ) {
            this.waypointIndex += 1;
        }
    }

    drawHealthBar() {
        const widthHealth = 50;
        // health bar
        const xoffsetHealth = 5;
        const yoffsetHealth = 7;
        c.fillStyle = 'red';
        c.fillRect(this.position.x + xoffsetHealth, this.position.y - yoffsetHealth, widthHealth, 5);

        c.fillStyle = 'green';
        c.fillRect(this.position.x + xoffsetHealth, this.position.y - yoffsetHealth, widthHealth * (this.health / this.healthMax), 5);
    }

    drawBonus() {
        const sx = this.position.x + this.widthScale - 25;
        const sy = this.position.y + this.heightScale;
        const w = 160 * 0.12;
        const h = 160 * 0.12;
        c.drawImage(this.imageBonus, 0, 0, 160, 160, sx, sy, w, h);
        c.font = "bold 16px 'Press Start 2P', cursive";
        c.fillStyle = 'rgb(255,215,0)';
        c.fillText(this.bounes, sx + 22, sy + 18);
    }
}