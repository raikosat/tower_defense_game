class Sprite {
    constructor({ position = { x: 0, y: 0 }, imageSrc, frames = { max: 1 }, offset = { x: 0, y: 0 } , scale = 1, width, height}) {
        this.position = position;
        this.image = new Image();
        this.image.src = imageSrc;
        this.frames = {
            max: frames.max,
            frameX: 0,
            frameY: 0
        };
        this.offset = offset;
        this.scale = scale;
        this.width = width;
        this.height = height;
        this.frameTimer = 0;
    }

    draw() {
        // const width = this.width * this.scale;
        // const height = this.height * this.scale;
        // c.strokeStyle = 'white';
        // c.strokeRect(this.position.x, this.position.y, width, height);

        // c.beginPath();
        // c.arc(this.position.x + (this.width / 2), this.position.y + (this.height / 2), 10, 0, 2 * Math.PI);
        // c.strokeStyle = 'red';
        // c.stroke();

        const crop = {
            position: {
                x: this.width * this.frames.frameX,
                y: this.height * this.frames.frameY
            },
            width: this.width,
            height: this.height
        };
        c.drawImage(
            this.image,
            crop.position.x,
            crop.position.y,
            crop.width,
            crop.height,
            this.position.x + this.offset.x,
            this.position.y + this.offset.y,
            crop.width * this.scale,
            crop.height * this.scale
        );
    }

    update(speedGame, deltaTime, timeInterval) {
        // reponsible for animation
        if (this.frameTimer > (timeInterval)) {
            this.frames.frameX++;
            if (this.frames.frameX >= this.frames.max) {
                this.frames.frameX = 0;
            }
            this.frameTimer = 0;
        } else {
            this.frameTimer += deltaTime;
        }
    }
}