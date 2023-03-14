class Sprite {
    constructor({ position = { x: 0, y: 0 }, imageSrc, frames = { max: 1 }, offset = { x: 0, y: 0 } , scale = 1}) {
        this.position = position;
        this.image = new Image();
        this.image.src = imageSrc;
        this.frames = {
            max: frames.max,
            current: 0,
            elapsed: 0,
            hold: 3
        };
        this.offset = offset;
        this.scale = scale;
    }

    draw() {
        const width = this.image.width / this.frames.max * this.scale;
        const height = this.image.height * this.scale;
        // console.log(width, height);
        // console.log(this.width, this.height);
        c.strokeStyle = 'white';
        c.strokeRect(this.position.x, this.position.y, width, height);

        c.fillStyle = 'red';
        c.beginPath();
        c.arc(this.position.x + (this.width / 2), this.position.y + (this.height / 2), 10, 0, 2 * Math.PI);
        c.stroke();

        const cropWidth = this.image.width / this.frames.max;
        const crop = {
            position: {
                x: cropWidth * this.frames.current,
                y: 0
            },
            width: cropWidth,
            height: this.image.height
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

    update() {
        // reponsible for animation
        this.frames.elapsed++;
        if (this.frames.elapsed % this.frames.hold === 0) {
            this.frames.current++;
            if (this.frames.current >= this.frames.max) {
                this.frames.current = 0;
            }
        }
    }
}