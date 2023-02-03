class Enemy extends Sprite {
    constructor({ position = { x: 0, y: 0 }, lv = 1, health = 100, healthMax = 100, imageSrc, framesMax, scale, offset }) {
        super({
            position, imageSrc: imageSrc, frames: {
                max: framesMax
            },
            scale: scale,
            offset: offset
        });
        this.position = position;
        this.width = 100;
        this.height = 100;
        this.waypointIndex = 0;
        this.center = {
            x: this.position.x + (this.width / 2),
            y: this.position.y + (this.height / 2)
        };
        this.radius = 50;
        this.health = health;
        this.healthMax = healthMax;
        this.velocity = {
            x: 0,
            y: 0
        };
        this.bounes = 5;
        this.lv = lv;
    }

    draw() {
        super.draw();
        c.fillStyle = 'white';
        const xoffsetLv = this.lv === 3 ? 100 : 55;
        const yoffsetLv = 75;
        c.fillText('Lv' + this.lv, this.position.x + xoffsetLv + this.offset.x, this.position.y + yoffsetLv);

        // health bar
        const xoffsetHealth = this.lv === 3 ? 20 : 0;
        const yoffsetHealth = this.lv === 3 ? 50 : 15;
        c.fillStyle = 'red';
        c.fillRect(this.position.x + xoffsetHealth, this.position.y - yoffsetHealth, this.width, 10);

        c.fillStyle = 'green';
        c.fillRect(this.position.x + xoffsetHealth, this.position.y - yoffsetHealth, this.width * (this.health / this.healthMax), 10);
    }

    update() {
        this.draw();
        super.update();
        const waypoint = waypoints[this.waypointIndex];
        const yDistance = waypoint.y - this.center.y;
        const xDistance = waypoint.x - this.center.x;
        const angle = Math.atan2(yDistance, xDistance);

        const speed = 1;
        this.velocity.x = Math.cos(angle) * speed;
        this.velocity.y = Math.sin(angle) * speed;

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.center = {
            x: this.position.x + (this.width / 2),
            y: this.position.y + (this.height / 2)
        };

        if (
            Math.abs(Math.round(this.center.x) - Math.round(waypoint.x)) < Math.abs(this.velocity.x) &&
            Math.abs(Math.round(this.center.y) - Math.round(waypoint.y)) < Math.abs(this.velocity.y) &&
            this.waypointIndex < (waypoints.length - 1)
        ) {
            this.waypointIndex += 1;
        }
    }
}