class Engine {
    constructor() {
        //pending - selected - unitMove - penddingFire - unitFire - over - pending
        this.state = 'pending';
        this.mode = 0;
        this.ennemies = [];
        this.units = [];
        this.current;
        this.target;
        this.targetIndex;
        this.btree = new BehaviorTree({
            title: 'enemy action',
            tree: new BehaviorTree.Priority({
                nodes: [
                    'fire','move-fire','move', 'idle'
                ]
            })
        });
    }
    driveUnit(callback) {
        this.current.isMoving = true;
        var moveTimeLine = new TimelineLite();
        var routes = findPath(game.map, this.current.index, this.targetIndex);
        var routeArray = tweenPath(routes);
        moveTimeLine.add(TweenLite.to(this.current.tubeControl.rotation, .5, { y: 0 }));
        routeArray.forEach(route => {
            var vars = {};
            var routeDirection;
            if (route.x) {
                vars.x = "+=" + route.x
                routeDirection = new THREE.Vector3(route.x, 0, 0).normalize();
            } else if (route.z) {
                vars.z = "+=" + route.z
                routeDirection = new THREE.Vector3(0, 0, route.z).normalize();
            }
            var angle = this.current.direction.angleTo(routeDirection);
            var dirProject = this.current.direction.clone().cross(routeDirection);
            this.current.direction = routeDirection;
            this.current.tubeDirection = routeDirection;
            if (dirProject.y > 0) {
                moveTimeLine.add(TweenLite.to(this.current.mesh.rotation, .1, {
                    y: "+=" + angle
                }));
            } else {
                moveTimeLine.add(TweenLite.to(this.current.mesh.rotation, .1, {
                    y: "-=" + angle
                }));
            }
            moveTimeLine.add(TweenLite.to(this.current.mesh.position, .5, vars));
        });
        moveTimeLine.call(() => {
            this.current.isMoving = false;
            game.map[this.current.index[0]][this.current.index[1]] = 0;
            this.current.index = this.targetIndex;
            game.map[this.current.index[0]][this.current.index[1]] = 1;
            this.state = 'pendingFire';
            if (callback) {
                callback();
            }
        });
    }

    attack(callback) {
        let speed = 1;
        this.current.isFiring = true;
        var attackTimeLine = new TimelineLite();
        var currnetVector = toPosition(this.current.index);
        var targetVector = toPosition(this.targetIndex);//new THREE.Vector3(this.targetIndex[1],0,this.targetIndex[0]);
        var dir = targetVector.clone().sub(currnetVector).normalize();
        var angle = this.current.tubeDirection.angleTo(dir);
        var dirProject = this.current.tubeDirection.clone().cross(dir);
        angle = (dirProject.y > 0 ? angle : -angle);
        attackTimeLine.add(TweenLite.to(this.current.tubeControl.rotation, .5, { y: angle }));
        this.current.mesh.updateMatrixWorld();
        let p = ["-=0", "-=0.98", "-=0.97", "-=0.96", "-=0.95", "-=0.94", "-=0.93", "-=0.92", "-=0.91","-0.90"];
        for (var i = 0; i < 10; i++) {
            let f = new Particle();
            let maxSneezingRate = 1;
            f.mesh.position.copy(this.current.tubeTop.getWorldPosition(new THREE.Vector3()));
            f.mesh.translateOnAxis(this.current.tubeDirection, 1);
            f.color = {
                r: 255 / 255,
                g: 205 / 255,
                b: 74 / 255
            };
            f.mesh.material.color.setRGB(f.color.r, f.color.g, f.color.b);
            f.mesh.material.opacity = 1;
            this.current.mesh.parent.add(f.mesh);
            let af = 1;
            let bezierColor = [{
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
            let bezierScale = [{ x: 1, y: 1, z: 1 }, {
                x: af / maxSneezingRate + Math.random() * .3,
                y: af / maxSneezingRate + Math.random() * .3,
                z: af * 2 / maxSneezingRate + Math.random() * .3
            }, {
                x: af / maxSneezingRate + Math.random() * .5,
                y: af / maxSneezingRate + Math.random() * .5,
                z: af * 2 / maxSneezingRate + Math.random() * .5
            }, {
                x: af * 2 / maxSneezingRate + Math.random() * .5,
                y: af * 2 / maxSneezingRate + Math.random() * .5,
                z: af * 4 / maxSneezingRate + Math.random() * .5
            }, {
                x: af * 2 + Math.random() * 5,
                y: af * 2 + Math.random() * 5,
                z: af * 2 + Math.random() * 5
            }];
            let fdir = this.current.tubeDirection.clone();
            attackTimeLine.add(
                [ TweenMax.to(f.mesh.position, speed, {
                        x:f.mesh.position.x + fdir.x * 10,
                        y:f.mesh.position.y + fdir.y * 10 + 5,
                        z:f.mesh.position.z + fdir.z * 10,
                    }),
                    TweenMax.to(f.mesh.rotation, speed, {
                        x: Math.random() * Math.PI * 3,
                        z: Math.random() * Math.PI * 3,
                    }),
                    TweenMax.to(f.mesh.scale, speed, {
                        bezier: bezierScale,
                        ease: Strong.easeOut
                    }),
                    TweenMax.to(f.mesh.material,speed, {
                        opacity: 0,
                        ease: Strong.easeOut
                    }),
                    TweenMax.to(f.color, speed, {
                        bezier: bezierColor,
                        ease: Strong.easeOut,
                        onUpdate: () => f.updateColor()
                    })], p[i], "start", 0);
        }
        attackTimeLine.call(() => { 
            if(callback){
                callback();
            }
            this.current.isFiring = false;
            console.log('fire finished');
        });
    }

    selectedUnit(pos) {
        var select;
        this.units.forEach(item => {
            if (item.index[0] == pos[0] && item.index[1] == pos[1]) {
                select = item;
                this.current = select;
                return;
            }
        });
        return select;
    }

    selectedEnnemy(pos) {
        var select;
        this.ennemies.forEach(item => {
            if (item.index[0] == pos[0] && item.index[1] == pos[1]) {
                select = item;
                this.target = select;
                return;
            }
        });
        return select;
    }

    controlSide() {
        for (var i = 0; i < this.units.length; i++) {
            if (!this.units[i].flag) {
                return true;
            }
        }
        return false;
    }

    update() {
        if (!this.controlSide()) {
            var ennemy;
            for (var i = 0; i < this.ennemies.length; i++) {
                if (!this.ennemies[i].flag) {
                    ennemy = this.ennemies[i];
                    this.current = ennemy;
                    this.btree.setObject(ennemy);
                    break;
                }
            }
            if (!ennemy) {
                game.round += 1;
                this.units.map(i => i.flag = false);
                this.ennemies.map(i => i.flag = false);
                this.current = null;
                console.log("round = " + game.round);
                this.state = "pending";
            } else {
                this.btree.step();
            }

        } else {
            switch (this.state) {
                case "pending":
                    resetGround();
                    break;
                case "selected":
                    var result = calMoveRange(game.map, this.current.index, this.current.moveRadius);
                    if (!result || result.length == 1) {
                        this.state = "pendingFire";
                        return;
                    }
                    renderGround(result, 2);
                    this.state = "pendingMove";
                    break;
                case "unitMove":
                    this.driveUnit();
                    this.state = "moving";
                    break;
                case "pendingFire":
                    resetGround();
                    var fireRange = calFireRange(this.current.index, this.current.fireRadius);
                    if (fireRange) {
                        renderGround(fireRange, 3);
                    }
                    break;
                case "unitFire":
                    // this.current.shoot();
                    this.attack();
                    resetGround();
                    this.state = "pending";
                    this.current.flag = true;
                    break;
            }
        }
    }
}