class SmokeParticle {
    constructor(pool) {
        this.pool = pool;
        this.color = {
            r: 0,
            g: 0,
            b: 0
        };
        var particleMat = new THREE.MeshLambertMaterial({
            transparent: true,
            opacity: .5,
            flatShading: THREE.FlatShading
        });
        var geom = new THREE.BoxGeometry(1, 1, 1);
        this.mesh = new THREE.Mesh(geom, particleMat);
    }

    initialize() {
        this.mesh.rotation.x = 0;
        this.mesh.rotation.y = 0;
        this.mesh.rotation.z = 0;
        this.mesh.position.x = 0;
        this.mesh.position.y = 0;
        this.mesh.position.z = 0;
        this.mesh.scale.x = 1;
        this.mesh.scale.y = 1;
        this.mesh.scale.z = 1;
        this.mesh.material.opacity = .5;
        this.pool.push(this);
    }

    updateColor() {
        this.mesh.material.color.setRGB(this.color.r, this.color.g, this.color.b);
    }

    fly() {
        var speed = 5;
        var initX = this.mesh.position.x;
        var initY = this.mesh.position.y;
        var initZ = this.mesh.position.z;
        var bezier = {
            type: "cubic",
            values: [{
                x: initX,
                y: initY,
                z: initZ
            }, {
                x: initX + 30 - Math.random() * 10,
                y: initY + 20 + Math.random() * 2,
                z: initZ + 20
            }, {
                x: initX + 10 + Math.random() * 20,
                y: initY + 40 + Math.random() * 5,
                z: initZ - 30
            }, {
                x: initX + 50 - Math.random() * 20,
                y: initY + 70 + Math.random() * 10,
                z: initZ + 20
            }]
        };

        TweenMax.to(this.mesh.position, speed, {
            bezier: bezier,
            ease: Strong.easeOut
        });

        TweenMax.to(this.mesh.rotation, speed, {
            x: Math.random() * Math.PI * 3,
            y: Math.random() * Math.PI * 3,
            ease: Strong.easeOut
        });

        TweenMax.to(this.mesh.scale, speed, {
            x: 5 + Math.random() * 5,
            y: 5 + Math.random() * 5,
            z: 5 + Math.random() * 5,
            ease: Strong.easeOut
        });
    }

    fire(f) {
        var speed = 1;
        var maxSneezingRate = 8;
        var initX = this.mesh.position.x;
        var initY = this.mesh.position.y;
        var initZ = this.mesh.position.z;
        TweenMax.to(this.mesh.position, speed, {
            z: initZ,
            y: initY + 4,
            x: initX - 5,
            ease: Strong.easeOut
        });
        TweenMax.to(this.mesh.rotation, speed, {
            x: Math.random() * Math.PI * 3,
            y: Math.random() * Math.PI * 3,
            ease: Strong.easeOut
        });
        var bezierScale = [{
            x: 1,
            y: 1,
            z: 1
        }, {
            x: f / maxSneezingRate + Math.random() * .3,
            y: f / maxSneezingRate + Math.random() * .3,
            z: f * 2 / maxSneezingRate + Math.random() * .3
        }, {
            x: f / maxSneezingRate + Math.random() * .5,
            y: f / maxSneezingRate + Math.random() * .5,
            z: f * 2 / maxSneezingRate + Math.random() * .5
        }, {
            x: f * 2 / maxSneezingRate + Math.random() * .5,
            y: f * 2 / maxSneezingRate + Math.random() * .5,
            z: f * 4 / maxSneezingRate + Math.random() * .5
        }, {
            x: f * 2 + Math.random() * 5,
            y: f * 2 + Math.random() * 5,
            z: f * 2 + Math.random() * 5
        }];
        TweenMax.to(this.mesh.scale, speed * 2, {
            bezier: bezierScale,
            ease: Strong.easeOut,
            onComplete: () => this.initialize()
        });

        TweenMax.to(this.mesh.material, speed, {
            opacity: 0,
            ease: Strong.easeOut
        });
        var bezierColor = [{
            r: 255 / 255,
            g: 205 / 255,
            b: 74 / 255
        }, {
            r: 255 / 255,
            g: 205 / 255,
            b: 74 / 255
        }, {
            r: 255 / 255,
            g: 205 / 255,
            b: 74 / 255
        }, {
            r: 247 / 255,
            g: 34 / 255,
            b: 50 / 255
        }, {
            r: 0 / 255,
            g: 0 / 255,
            b: 0 / 255
        }];
        TweenMax.to(this.color, speed, {
            bezier: bezierColor,
            ease: Strong.easeOut,
            onUpdate: () => this.updateColor()
        });
    }
}

class ParticleHolder {
    constructor(){
        this.particlePool = [];
    }

    getSmokeParticle() {
        var p;
        console.log(this.particlePool.length)
        if (!this.particlePool.length) {
            p = new SmokeParticle(this.particlePool);
            this.particlePool.push(p);
        }
        p = this.particlePool.pop();
        return p;
    }
}
