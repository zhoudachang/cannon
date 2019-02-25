function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

class Controller {
    constructor(cannon){
        this.target = cannon;
        this.mesh = new THREE.Object3D();
        let center = new THREE.Vector2(0,- HEIGHT / 2 + 64);
        let controllerRadius = 64;
        this.textureLoader = new THREE.TextureLoader();
        this.textureLoader.load('images/j.jpg',(texture) => {
            let mat = new THREE.SpriteMaterial({
                map: texture,
                transparent: true,
                opacity: 0.6
            });
            let controller = new THREE.Sprite(mat);
            controller.scale.set(controllerRadius*2,controllerRadius*2,1);
            controller.position.set(center.x,center.y,1);
            this.mesh.add(controller);
        });
        this.textureLoader.load('images/circle.png',(texture) => {
            let mat = new THREE.SpriteMaterial({
                map: texture,
            });
            let circle = new THREE.Sprite(mat);
            circle.name = 'circle';
            circle.scale.set(40,40,1);
            circle.position.set(center.x,center.y,1);
            this.mesh.add(circle);
        });
        let convertPosition = (x,y) => {
            let x_ = x - WIDTH/2;
            let y_ = - y + HEIGHT/2;
            return new THREE.Vector2(x_,y_);
        };
        let moveListenner = (event) => {
            let movex = event.layerX;
            let movey = event.layerY;
            let dp = convertPosition(movex,movey);
            let c = this.mesh.getObjectByName('circle');
            // let dpsubct = dp.sub(center);
            let dpsubct = dp.sub(center).max(new THREE.Vector2(-controllerRadius,-controllerRadius)).min(new THREE.Vector2(controllerRadius,controllerRadius));

            // if(dpsubct.length() <= controllerRadius){
            //     c.position.set(dp.x,dp.y - HEIGHT / 2 + controllerRadius ,1);
            // } else {
            //     let nor = dpsubct.normalize();
            //     c.position.set(controllerRadius * nor.x,controllerRadius * nor.y - HEIGHT / 2 + controllerRadius,1);
            // }
            // this.target.horizontalControl.rotation.y = - Math.PI/2 * c.position.x / controllerRadius;
            // let yd = center.y - c.position.y;
            // // console.log(- Math.PI / 4 * c.position.y / controllerRadius);
            // this.target.verticalController.rotation.z =  Math.PI / 4 * yd / controllerRadius;
            // let x_ = dpsubct.x > controllerRadius?controllerRadius:dpsubct.x;
            // let y_ = dpsubct.y > controllerRadius?controllerRadius:dpsubct.y - HEIGHT/2 + controllerRadius;
            console.log(dpsubct);
            c.position.set(dpsubct.x,dpsubct.y - HEIGHT/2 + controllerRadius,1);
        }
        document.addEventListener("mousedown", (event) => {
            document.addEventListener("mousemove",moveListenner);
            let x = event.layerX;
            let y = event.layerY;
            let dp = convertPosition(x,y);
            let c = this.mesh.getObjectByName('circle');
            let dpsubct = dp.sub(center).max(new THREE.Vector2(- controllerRadius, - controllerRadius)).min(new THREE.Vector2(controllerRadius,controllerRadius));
            // let x_ = dpsubct.x > controllerRadius?controllerRadius:dpsubct.x;
            // let y_ = dpsubct.y > controllerRadius?controllerRadius:dpsubct.y - HEIGHT/2 + controllerRadius;
            // console.log(x_,y_);
            console.log(dpsubct);
            c.position.set(dpsubct.x,dpsubct.y - HEIGHT/2 + controllerRadius,1);
            // if(dpsubct.length() <= controllerRadius){
            //     c.position.set(dp.x,dp.y - HEIGHT / 2 + controllerRadius,1);
            // } else {
            //     let nor = dpsubct.normalize();
            //     c.position.set(controllerRadius * nor.x,controllerRadius * nor.y - HEIGHT / 2 + controllerRadius,1);
            // }
            //range => 
            // this.target.horizontalControl.rotation.y = - Math.PI /2 * c.position.x / controllerRadius;
            // let yd = center.y - c.position.y;
            // console.log(- Math.PI / 4 * c.position.y / controllerRadius);
            // this.target.verticalController.rotation.z =  Math.PI / 4 * yd / controllerRadius;



        }, false);
        document.addEventListener("mouseup", (event) => {
            let c = this.mesh.getObjectByName('circle');
            c.position.set(center.x,center.y,1);
            this.target.horizontalControl.rotation.y = 0;
            this.target.verticalController.rotation.z = 0;
            document.removeEventListener("mousemove",moveListenner);
        }, false);
    }


}



class BottomSprite {
    constructor() {
        this.mesh = new THREE.Object3D();
        this.background;
        this.detailImg;
        // this.hp;
        this.height = HEIGHT / 5;
        this.margin = 10;
        this.resourcePath = "images/";
        this.lines = ['button_hp.png','button_mov.png','button_att.png','button_lv.png'];
    }
}

class HUDSprites {
    constructor(engine) {
        this.textureLoader = new THREE.TextureLoader();
        this.mesh = new THREE.Object3D();
        this.current;
        this.bottomSprite;
        this.resourcePath = "images/";
        this.initBottom();
        if (engine) {
            this.engine = engine;
            this.switch = true;
            this.radarMap = new THREE.Object3D();
            this.mesh.add(this.radarMap);
            this.unitWidth = 16;
            this.radarMargin = 2;
            this.bgWidth = this.unitWidth * game.segmentsLength;
            this.ennemySprite;
            this.unitSprite;
            this.createRadarMap(engine);
            this.roundMat;
            this.initHUD();
        }
    }

    update() {
        this.bottomSprite.background.position.set(0, - HEIGHT / 2 + this.bottomSprite.height / 2 + this.bottomSprite.margin / 2, 1);
        this.bottomSprite.background.scale.set(WIDTH - this.bottomSprite.margin, this.bottomSprite.height, 1);
        if (this.current) {

        }
    }

    initBottom() {
        this.textureLoader.load(this.resourcePath+ "radar_bg.png", (texture) => {
            var material = new THREE.SpriteMaterial({
                map: texture,
                transparent: true,
                opacity: 0.3
            });
            this.bottomSprite = new BottomSprite();
            this.bottomSprite.background = new THREE.Sprite(material);
            this.bottomSprite.background.position.set(0, - HEIGHT / 2 + this.bottomSprite.height / 2 + this.bottomSprite.margin / 2, 1);
            this.bottomSprite.background.scale.set(WIDTH - this.bottomSprite.margin, this.bottomSprite.height, 1);
            this.bottomSprite.mesh.add(this.bottomSprite.background);
            this.mesh.add(this.bottomSprite.mesh);
            // this.textureLoader.load("images/radar_unit.png", (detailTexture) => {
            //     var detailMaterial = new THREE.SpriteMaterial({
            //         map: detailTexture
            //     });
            //     this.bottomSprite.detailImg = new THREE.Sprite(detailMaterial);
            //     this.bottomSprite.detailImg.position.set(- WIDTH / 2 + this.bottomSprite.height / 2 + this.bottomSprite.margin, 
            //         - HEIGHT / 2 + this.bottomSprite.height / 2 + this.bottomSprite.margin / 2, 1.1);
            //     this.bottomSprite.detailImg.scale.set(this.bottomSprite.height, this.bottomSprite.height - this.bottomSprite.margin, 1);
            //     this.bottomSprite.mesh.add(this.bottomSprite.detailImg);
            // });
            let lineCount = 0;
            let hpHeight = this.bottomSprite.height/this.bottomSprite.lines.length - this.bottomSprite.margin/2;
            this.bottomSprite.lines.forEach((item) => {
                this.textureLoader.load(this.bottomSprite.resourcePath + item, (texture) => {
                    let hpSpriteMat = new THREE.SpriteMaterial({
                        map: texture
                    });
                    let spriteWidth = hpSpriteMat.map.image.width;//default width
                    let lineSprite = new THREE.Sprite(hpSpriteMat);
                    lineSprite.scale.set(spriteWidth, hpHeight, 1);
                    let posx = - WIDTH / 2 + spriteWidth / 2 + this.bottomSprite.margin * 2 + this.bottomSprite.height;
                    let posy = - HEIGHT / 2 + this.bottomSprite.height - hpHeight/2 - (hpHeight+this.bottomSprite.margin/2)*lineCount;// - hpHeight/2 - hpHeight*lineCount -  this.bottomSprite.margin;
                    lineSprite.position.set(posx, posy , 1.1);
                    this.bottomSprite.mesh.add(lineSprite);
                    lineCount ++;
                });
            });
        });
    }

    initHUD() {
        this.textureLoader.load("images/round.png", (texture) => {
            this.roundMat = new THREE.SpriteMaterial({
                map: texture
            });
        });
    }

    createRadarMap() {
        this.textureLoader.load("images/radar_bg.png", (texture) => {
            var material = new THREE.SpriteMaterial({
                map: texture,
                transparent: true,
                opacity: 0.3
            });
            var bgSprite = new THREE.Sprite(material);
            bgSprite.scale.set(this.bgWidth, this.bgWidth, 1);
            bgSprite.position.set(WIDTH / 2 - this.bgWidth / 2 - this.radarMargin, HEIGHT / 2 - this.bgWidth / 2 - this.radarMargin, 1);
            this.radarMap.add(bgSprite);
            this.textureLoader.load("images/radar_unit.png", (texture) => {
                var material = new THREE.SpriteMaterial({
                    map: texture,

                });
                var width = material.map.image.width;
                this.unitWidth = width;
                this.ennemySprite = new THREE.Sprite(material);
                this.updateRadar();
            });
        });

    }

    updateRound(roundCount) {
        if (this.roundMat) {
            let roundSprite = new THREE.Sprite(this.roundMat);
            roundSprite.scale.set(this.roundMat.map.image.width * 10, this.roundMat.map.image.height * 10, 1);
            roundSprite.position.set(- WIDTH / 2 - this.roundMat.map.image.width, 0, 1);
            this.mesh.add(roundSprite);
            TweenLite.to(roundSprite.position, 5, { x: WIDTH / 2 + this.roundMat.map.image.width * 10 });
        }
    }

    updateRadar() {
        if (this.switch && this.ennemySprite) {
            if (this.radarMap.children.length > 1) {
                this.radarMap.children = this.radarMap.children.slice(0, 1);
            }
            this.engine.ennemies.forEach(ennemy => {
                var unitClone = this.ennemySprite.clone();
                let x = (WIDTH / 2) - ennemy.index[1] * this.unitWidth - this.radarMargin - this.unitWidth / 2;
                let y = (HEIGHT / 2 - this.unitWidth * game.segmentsLength) + ennemy.index[0] * this.unitWidth + this.unitWidth / 2 - this.radarMargin;
                unitClone.position.set(x, y, 1.1);
                unitClone.scale.set(this.unitWidth, this.unitWidth, 1);
                this.radarMap.add(unitClone);
            });
            this.engine.units.forEach(ennemy => {
                var unitClone = this.ennemySprite.clone();
                let x = (WIDTH / 2) - ennemy.index[1] * this.unitWidth - this.radarMargin - this.unitWidth / 2;
                let y = (HEIGHT / 2 - this.unitWidth * game.segmentsLength) + ennemy.index[0] * this.unitWidth + this.unitWidth / 2 - this.radarMargin;
                unitClone.position.set(x, y, 1.1);
                unitClone.scale.set(this.unitWidth, this.unitWidth, 1);
                this.radarMap.add(unitClone);
            });
        }
    }
}