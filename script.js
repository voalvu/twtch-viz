class Carousel {
    constructor(centerImageName, key, first, idx) {
        this.first = first;
        this.centerImageName = centerImageName;
        this.key = key;
        this.seedImage;
        this.images = [];
        this.thumbnails = [];
        this.numImages = 0;
        this.angleOffset = 0;
        this.currentRadius = 400;
        this.scaleFactor = 1;
        this.detectDist = 25;
        this.imageBeingHovered = false;
        this.centerOffsetX = 0; // Offset for the center image
        this.centerOffsetY = 0; // Offset for the center image
        this.stableRadius = 400;
        this.loaded = false;
        this.isFocused = true;
        this.idx = idx;
        this.cache = new Map(); // Cache for thumbnails
    }

    async preload() {
        this.seedImage = await this.loadImageWithCache(`http://127.0.0.1:8001/${this.centerImageName}.jpg`);
        console.log("PRELOADING");
        console.log('key', this.key);
        console.log(this.centerImageName);
        
        await fetch('http://127.0.0.1:8001/')
            .then(response => response.text())
            .then(async data => {
                const regex = /href="([^"]*\.(jpg|jpeg|png|gif|webp))"/g;
                let matches;

                while ((matches = regex.exec(data)) !== null) {
                    const imageUrl = `http://127.0.0.1:8001/${matches[1]}`;
                    if (matches[1].split('_').pop().includes(this.key)) {
                        this.thumbnails.push(await this.loadImageWithCache(`http://127.0.0.1:8001/thumbnails/${matches[1]}`))
                        this.thumbnails[this.thumbnails.length-1].url = matches[1]
                        this.images.push(await this.loadImageWithCache(imageUrl));
                        this.images[this.images.length - 1].url = matches[1];
                    } else if (!this.seedImage && matches[1].split('_')[0].includes(this.key)) {
                        this.seedImage = await this.loadImageWithCache(imageUrl);
                    }
                }

                this.numImages = this.images.length;
                console.log(data);
            })
            .catch(error => console.error('Error fetching image list:', error));
        this.loaded = true;
    }

    async loadImageWithCache(url) {
        if (this.cache.has(url)) {
            return this.cache.get(url);
        } else {
            try{
            const img = await loadImage(url);
            console.log(img)
            this.cache.set(url, img);
            return img;
            }catch(e){
                console.log(e)
            }
            return false
        }
    }

    display() {
        if(!this.first){
            console.log(this.idx)
        }
        //background(255);
        imageMode(CENTER);
        if(!this.isFocused){

        this.scaleFactor = 0.5;

        this.centerOffsetX = -500; // Shift center image to the right
        if(this.idx)
            this.centerOffsetX+=200*this.idx
        this.centerOffsetY = -250;   // Keep the vertical position the same
        }else{
            this.scaleFactor = 1
            this.centerOffsetX = 0
            this.centerOffsetY = 0
        }
        image(this.seedImage, width / 2 + this.centerOffsetX, height / 2 + this.centerOffsetY, 300 * this.scaleFactor, 300 * this.scaleFactor);

        this.angleOffset += 0.005;

        for (let i = 0; i < this.numImages; i++) {
            let angle = map(i, 0, this.numImages, 0, TWO_PI) + this.angleOffset;
            let x = width / 2 + cos(angle) * this.currentRadius +this.centerOffsetX;
            let y = height / 2 + sin(angle) * this.currentRadius +this.centerOffsetY;

            let isHovered = dist(mouseX, mouseY, x, y) < this.detectDist;

            if (this.imageBeingHovered && !isHovered) {
                this.imageBeingHovered = false;
                this.detectDist = 25;
            }

            if (!this.imageBeingHovered) {
                if (this.thumbnails[i]) {
                    if (isHovered) {
                        this.detectDist += 100;
                        this.imageBeingHovered = true;
                        stroke(0, 255, 0);
                        strokeWeight(4);
                        this.currentRadius += 100;
                    } else {
                        this.currentRadius = this.stableRadius;
                        stroke(0);
                        strokeWeight(1);
                    }
                    ellipse(x, y, 100*this.scaleFactor, 100*this.scaleFactor);
                    fill(255);
                    image(this.thumbnails[i], x, y, 100 * this.scaleFactor, 100 * this.scaleFactor);
                }
            }
        }
    }

    handleMousePressed() {
        let returned_img;
        let i = 0
        let angle = map(i, 0, this.numImages, 0, TWO_PI) + this.angleOffset;

        let x = width / 2 + cos(angle) * this.currentRadius;
            let y = height / 2 + sin(angle) * this.currentRadius;


        if(!this.isFocused && dist(mouseX,mouseY,width/2+this.centerOffsetX,height/2+this.centerOffsetY)<100){
            this.isFocused = true
            this.stableRadius +=300;
            return
        }
        for (let i = 0; i < this.numImages; i++) {
            let angle = map(i, 0, this.numImages, 0, TWO_PI) + this.angleOffset;
            let x = width / 2 + cos(angle) * this.currentRadius;
            let y = height / 2 + sin(angle) * this.currentRadius;

            if (dist(mouseX, mouseY, x, y) < 50) {
                console.log(`Image source: ${this.images[i].url}`);
                let clickedImage = this.images[i];
                
                //this.seedImage = clickedImage;
                
                this.isFocused = false
                
                this.stableRadius -=300;


                this.images = this.images.filter(img => img.url.split('_').pop() === clickedImage.url.split('_').pop());
                this.numImages = this.images.length;
                returned_img = clickedImage.url
                break;
            }
        }
        return returned_img
    }
}

let carousel;
let carousels = [];


function preload() {
    carousel = new Carousel('test1_2024_12_30_test2', 'test3', true);
    carousel.preload();
}

function setup() {
    createCanvas(windowWidth, windowHeight);
}
let counter = 0
function draw() {
    background(255)
    carousel.display();

    //console.log(carousels)
    //console.log(carousel.loaded)
    let slit = 0
    if(carousels.length>0){
 
        //console.log("is main focues",carousel.isFocused)
        if(!carousel.isFocused){
        }
        else{
            for(let car of carousels){
                car.isFocused = false
            }
            
        }
        //console.log(carousels[0].loaded)
        let idx = 0
        for(let car of carousels){
            //console.log(idx, car.loaded)
            if(car.loaded){
                car.display()
            }
            idx+=1
        }
        
    }
    
    counter+=1
}

async function mousePressed () {
    let returned_img = carousel.handleMousePressed();
    console.log("CLICK, returned_img",returned_img)
    if(returned_img){
        carousels.push(new Carousel(returned_img.split('.')[0], returned_img.split('_')[0], false, carousels.length+1))
        await carousels[carousels.length-1].preload()
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
