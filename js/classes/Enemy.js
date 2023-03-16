class Enemy extends Sprite {
    constructor({ position = { x: 0, y: 0 }, lv = 1, health = 100, healthMax = 100, imageSrc, framesMax, scale, offset, speed = 1 , waypoints}) {
        super({
            position, imageSrc: imageSrc, frames: {
                max: framesMax
            },
            scale: scale,
            offset: offset
        });
        this.position = position;
        this.width = 74;
        this.height = 55;
        this.waypointIndex = 0;
        this.center = {
            x: this.position.x + (this.width / 2),
            y: this.position.y + (this.height / 2)
        };
        this.radius = 10;
        this.health = health;
        this.healthMax = healthMax;
        this.velocity = {
            x: 0,
            y: 0
        };
        this.bounes = 5;
        this.speed = speed;
        this.waypoints = waypoints;
    }

    draw() {
        super.draw();
        this.drawHealthBar();
    }

    update() {
        this.draw();
        super.update();
        if (!this.waypoints) return;
        const waypoint = this.waypoints[this.waypointIndex];
        const yDistance = waypoint.y - this.center.y;
        const xDistance = waypoint.x - this.center.x;
        const angle = Math.atan2(yDistance, xDistance);

        this.velocity.x = Math.cos(angle) * this.speed;
        this.velocity.y = Math.sin(angle) * this.speed;

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.center = {
            x: this.position.x + (this.width / 2),
            y: this.position.y + (this.height / 2)
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
        const widthHealth = this.width * this.scale;
        // health bar
        const xoffsetHealth = 5;
        const yoffsetHealth = 15;
        c.fillStyle = 'red';
        c.fillRect(this.position.x + xoffsetHealth, this.position.y - yoffsetHealth, widthHealth, 5);

        c.fillStyle = 'green';
        c.fillRect(this.position.x + xoffsetHealth, this.position.y - yoffsetHealth, widthHealth * (this.health / this.healthMax), 5);
    }
}