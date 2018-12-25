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
                    'move-fire', 'fire', 'move', 'idle'
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

    attack() {
        this.current.isFiring = true;
        var attackTimeLine = new TimelineLite();
        console.log(this.current.index, this.targetIndex);
        var currnetVector = toPosition(this.current.index);
        var targetVector = toPosition(this.targetIndex);//new THREE.Vector3(this.targetIndex[1],0,this.targetIndex[0]);
        var dir = targetVector.clone().sub(currnetVector).normalize();
        var angle = this.current.tubeDirection.angleTo(dir);
        var dirProject = this.current.tubeDirection.clone().cross(dir);
        angle = (dirProject.y > 0 ? angle : -angle);
        attackTimeLine.add(TweenLite.to(this.current.tubeControl.rotation, .5, { y: angle }));
        this.current.mesh.updateMatrixWorld();
        for (var i = 0; i < 5; i++) {
            // var bezierColor = ;
            var f = new Particle();
            var maxSneezingRate = 1;
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
            var initX = f.mesh.position.x;
            var initY = f.mesh.position.y;
            var initZ = f.mesh.position.z;
            // var bezierScale = [{ x: 1, y: 1, z: 1 }, {
            //     x: f / maxSneezingRate + Math.random() * .3,
            //     y: f / maxSneezingRate + Math.random() * .3,
            //     z: f * 2 / maxSneezingRate + Math.random() * .3
            // }, {
            //     x: f / maxSneezingRate + Math.random() * .5,
            //     y: f / maxSneezingRate + Math.random() * .5,
            //     z: f * 2 / maxSneezingRate + Math.random() * .5
            // }, {
            //     x: f * 2 / maxSneezingRate + Math.random() * .5,
            //     y: f * 2 / maxSneezingRate + Math.random() * .5,
            //     z: f * 4 / maxSneezingRate + Math.random() * .5
            // }, {
            //     x: f * 2 + Math.random() * 5,
            //     y: f * 2 + Math.random() * 5,
            //     z: f * 2 + Math.random() * 5
            // }];
            var linePosition = 0;
            attackTimeLine.add([
                TweenLite.to(f.mesh.position, 1, { x: initX, y: initY, z : initZ + 5 }), 
                TweenLite.to(f.mesh.rotation, 1, { x: Math.random() * Math.PI * 3, y: Math.random() * Math.PI * 3 }),
                // TweenLite.to(f.mesh.scale, 1 , { x:3,y:3,z:3, ease: Strong.easeOut}),// onComplete: () => f.initialize()
                TweenLite.to(f.mesh.material, 1, { opacity: 0, ease: Strong.easeOut }),
            ],"-=0.9");
            // linePosition += 0.1*i;
        }
        attackTimeLine.call(() => { this.current.isFiring = false });
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