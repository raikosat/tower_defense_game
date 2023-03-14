class Shop extends Sprite {
    constructor({ position = { x: 0, y: 0 } , imageSrc}) {
        super({
            position,
            imageSrc: imageSrc
        });
        this.position = position;
        this.slot1 = {position: {x: this.position.x, y: this.position.y}, width: 50, height: 50};
        this.slot2 = {position: {x: this.position.x + 92, y: this.position.y}, width: 50, height: 50};
        this.slot3 = {position: {x: this.position.x, y: this.position.y + 78}, width: 50, height: 50};
        this.slot4 = {position: {x: this.position.x + 92, y: this.position.y + 78}, width: 50, height: 50};
    }

    draw() {
        // c.strokeStyle = 'white';
        // c.strokeRect(this.slot1.position.x, this.slot1.position.y, this.slot1.width, this.slot1.height);
        // c.strokeRect(this.slot2.position.x, this.slot2.position.y, this.slot2.width, this.slot2.height);
        // c.strokeRect(this.slot3.position.x, this.slot3.position.y, this.slot3.width, this.slot3.height);
        // c.strokeRect(this.slot4.position.x, this.slot4.position.y, this.slot4.width, this.slot4.height);
        super.draw();
    }

    update() {
        this.draw();
    }
}