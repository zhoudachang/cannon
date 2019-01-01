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

class HUDSprites {
    constructor(engine) {
        this.engine = engine;
        this.switch = true;
        this.mesh = new THREE.Object3D();
        this.textureLoader = new THREE.TextureLoader();
        this.radarMap = new THREE.Object3D();
        this.mesh.add(this.radarMap);
        this.unitWidth = 16;
        this.radarMargin = 2;
        this.bgWidth = this.unitWidth * game.segmentsLength;
        this.ennemySprite;
        this.unitSprite;
        // this.textureLoader.load( "/images/t1.png", (texture) => {
        //     var material = new THREE.SpriteMaterial( { map: texture } );
        //     var width = material.map.image.width;
        //     var height = material.map.image.height;
        //     var sprite = new THREE.Sprite( material );
        //     sprite.name = "unitImage";
        //     sprite.position.set( - WIDTH /2 + width/2 , - HEIGHT/2 + height/2, 1 );
        //     console.log(sprite.scale);
        //     sprite.scale.set( width, height, 1 );
        //     this.mesh.add(sprite);
        // });
        engine.on('drive',() => {
            this.updateRadar();
        });
        this.createRadarMap(engine);
    }

    createRadarMap() {
        this.textureLoader.load("images/radar_bg.png", (texture) => {
            var material = new THREE.SpriteMaterial({
                map: texture
            });
            // var width = material.map.image.width;
            // var height = material.map.image.height;
            var bgSprite = new THREE.Sprite(material);
            bgSprite.scale.set(this.bgWidth, this.bgWidth, 1);
            bgSprite.position.set(WIDTH / 2 - this.bgWidth / 2 - this.radarMargin, HEIGHT / 2 - this.bgWidth / 2 - this.radarMargin, 1);
            this.radarMap.add(bgSprite);
            this.textureLoader.load("images/radar_ennemy.png", (texture) => {
                var material = new THREE.SpriteMaterial({
                    map: texture
                });
                var width = material.map.image.width;
                this.unitWidth = width;
                this.ennemySprite = new THREE.Sprite(material);
                this.updateRadar();
            });
        });

    }

    updateRadar() {
        if (this.switch && this.ennemySprite) {
            if(this.radarMap.children.length > 1){
                this.radarMap.children = this.radarMap.children.slice(0,1);
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