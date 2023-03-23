class Explosion extends Sprite {
    constructor({ position = { x: 0, y: 0 }, damage}) {
        super({
            position: position,
            imageSrc: './img/buildings/explosion.png',
            frames: { max: 4 },
            offset: { x: 0, y: 0 },
            scale: 0.5,
            width: 78,
            height: 84
        });
        this.position = position;
        this.damage = damage;
    }

    draw() {
        super.draw();
        // dislay dame
        c.font = "9px 'Press Start 2P', cursive";
        c.fillStyle = 'rgb(255,0,0, 0.7)';
        c.fillText(this.damage, this.position.x, this.position.y);
    }

    update(speedGame, deltaTime, timeInterval) {
        super.update(speedGame, deltaTime, timeInterval);
    }
}