class PlacementTile extends Sprite {
    constructor({ position = { x: 0, y: 0 } , tw1, tw2, tw3, tw4}) {
        super({
            position,
            imageSrc: 'img/buildings/flag.png',
            width: 64,
            height: 64
        });
        this.placementTileId;
        this.position = position;
        this.size = 64;
        this.isOccupied = false;
        this.building;
        this.shop = new Shop({ position: {x: this.position.x - 40 , y: this.position.y - 30 }, imageSrc: 'img/store/shop.png', width: 142, height: 127, tw1, tw2, tw3, tw4});
        this.displayShop = false;
        this.hover = false;
    }

    draw() {
        if (!this.isOccupied && !this.hover) {
            this.image.src = 'img/buildings/flag.png';
            super.draw();
        } else if (!this.isOccupied && this.hover) {
            this.image.src = 'img/buildings/flag_selected.png';
            super.draw();
        }
    }

    update() {
        this.draw();
        if (this.displayShop && !this.isOccupied) {
            this.shop.update();
        } 
    }
}
