class PlacementTile extends Sprite {
    constructor({ position = { x: 0, y: 0 } }) {
        super({
            position,
            imageSrc: 'img/flag.png'
        });
        this.position = position;
        this.size = 64;
        this.isOccupied = false;
        this.building;
        this.shop = new Shop({ position: {x: this.position.x - 40 , y: this.position.y - 30 }, imageSrc: 'img/shop.png'});
        this.shop1 = new Shop({ position: {x: this.position.x - 40 , y: this.position.y - 30 }, imageSrc: 'img/shop1.png'});
        this.displayShop = false;
    }

    draw() {
        if (!this.isOccupied) {
            super.draw();
        }
        if (this.displayShop && !this.isOccupied) {
            this.shop.update();
        } else if (this.displayShop && this.isOccupied) {
            this.shop1.update();
        }
    }

    update() {
        this.draw();
    }
}
