class Enemy extends Sprite {
    constructor({ position = { x: 0, y: 0 }, lv = 1, health = 100, healthMax = 100 }) {
        super({
            position, imageSrc: 'img/orc.png', frames: {
                max: 7
            }
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
        c.fillText('Lv' + this.lv, this.position.x + 55, this.position.y + 75);

        // health bar
        c.fillStyle = 'red';
        c.fillRect(this.position.x, this.position.y - 15, this.width, 10);

        c.fillStyle = 'green';
        c.fillRect(this.position.x, this.position.y - 15, this.width * (this.health / this.healthMax), 10);
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