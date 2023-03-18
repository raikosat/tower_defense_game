class Projecttile extends Sprite {
    constructor({ position = { x: 0, y: 0 }, enemy, scale , width, height}) {
        super({ position, imageSrc: 'img/buildings/projectile.png' , scale, width, height});
        this.velocity = {
            x: 0,
            y: 0
        };
        this.enemy = enemy;
        this.radius = 5;
        this.width = width;
        this.height = height;
        this.widthScale = this.width * scale;
        this.heightScale = this.height * scale;
        this.center = {
            x: this.position.x + this.widthScale / 2,
            y: this.position.y + this.heightScale / 2
        };
    }

    update(speedGame) {
        super.draw();

        // c.beginPath();
        // c.arc(this.center.x, this.center.y, this.radius, 0, 2 * Math.PI);
        // c.strokeStyle = 'red';
        // c.stroke();

        const angle = Math.atan2(
            this.enemy.center.y - this.position.y,
            this.enemy.center.x - this.position.x
        );

        const power = 5;
        this.velocity.x = Math.cos(angle) * power;
        this.velocity.y = Math.sin(angle) * power;

        this.position.x += this.velocity.x * speedGame;
        this.position.y += this.velocity.y * speedGame;

        // this.center = {
        //     x: this.position.x + this.widthScale / 2,
        //     y: this.position.y + this.heightScale / 2
        // };
    }
}