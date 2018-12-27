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

    constructor(){
        // this.mesh = new THREE.Object3D();
        var textureLoader = new THREE.TextureLoader();
        textureLoader.load( "/images/t1.png", this.createHUDSprites );
    }

    createHUDSprites( texture ) {
        var material = new THREE.SpriteMaterial( { map: texture } );
        var width = material.map.image.width;
        var height = material.map.image.height;
        console.log(width,height);
        var sprite = new THREE.Sprite( material );
        sprite.position.set( - WIDTH/2, - HEIGHT/2, 1 );
        sprite.scale.set( width/2, height/2, 1 );
        hudScene.add(sprite);
        // this.mesh.add(sprite);
    }

    render(){
    }
}