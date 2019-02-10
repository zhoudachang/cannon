BehaviorTree.register('fire', new BehaviorTree.Task({
    title: 'fire',
    run: function (unit) {
        console.log('fire');
        if (unit.isFiring) {
            this.running();
            return;
        }
        var target = engine.units.map(i => i.index);
        let fireRange = calFireRange(unit.index, unit.fireRadius);
        let intersectArray = intersect(fireRange, target);
        if (intersectArray.length === 0) {
            this.fail();
        } else if (!unit.isFiring) {
            engine.targetIndex = intersectArray[0];
            engine.attack(() => {
                unit.flag = true;
                this.success();
            });
            this.running();
        }
    }
}));

BehaviorTree.register('move-fire', new BehaviorTree.Task({
    title: 'move-fire',
    run: function (unit) {
        console.log('move fire ');
        if (unit.isMoving || unit.isFiring) {
            this.running();
            return;
        }
        let moveRange = calMoveRange(game.map, unit.index, unit.moveRadius);
        let impArray = []; //4 length sub element
        engine.units.forEach(target => {
            var fireRange = calFireRange(target.index, unit.fireRadius);
            var itstArrays = intersect(moveRange, fireRange);
            if (itstArrays && itstArrays.length > 0) {
                itstArrays = itstArrays.map(itst => itst.concat(target.index));
                impArray = impArray.concat(itstArrays);
            }
        });
        if (impArray.length > 0) {
            let route = impArray[impArray.length - 1];
            engine.targetIndex = [route[0], route[1]];
            engine.driveUnit(() => {
                engine.targetIndex = [route[2], route[3]];
                engine.attack(() => {
                    unit.flag = true;
                    this.success();
                });
            });
            this.running();
        } else {
            this.fail();
        }
    }
}));

BehaviorTree.register('move', new BehaviorTree.Task({
    title: 'move',
    run: function (unit) {
        console.log('move');
        if (unit.isMoving) {
            this.running();
            return;
        }
        var moveRange = calMoveRange(game.map, unit.index, unit.moveRadius);
        if (moveRange.length > 1) {
            let unitVec = new THREE.Vector3(unit.index[0], 0, unit.index[1]);
            let distanceArray = engine.units.sort((a, b) => {
                // unit.
                var d = new THREE.Vector3(a.index[0], 0, a.index[1]).sub(unitVec.clone());
                var d2 = new THREE.Vector3(b.index[0], 0, b.index[1]).sub(unitVec.clone());
                if (d.length() > d2.length()) {
                    return 1;
                }
                return -1;
            });
            var routes = findPath(game.map, unit.index, distanceArray[0]);
            var moveRangeRoutes = routes.find(route => moveRange.find(mr => mr[0] === route[0] && mr[1] === route[1]));
            console.log(moveRangeRoutes);
            engine.targetIndex = moveRange[moveRange.length - 1];
            engine.driveUnit(() => {
                unit.flag = true;
                this.success();
            });
            this.running();
        } else {
            this.fail();
        }
    }
}));
BehaviorTree.register('idle', new BehaviorTree.Task({
    title: 'idle',
    run: function (unit) {
        console.log('idle');
        unit.flag = true;
        this.success();
    }
}));

class Engine {
    constructor() {
        //pending - selected - unitMove - penddingFire - unitFire - over - pending
        this.state = 'pending';
        this.mode = 0;
        this.ennemies = [];
        this.units = [];
        this.stuff = [];
        this.current;
        this.target;
        this.targetIndex;
        this.btree = new BehaviorTree({
            title: 'enemy action',
            tree: new BehaviorTree.Priority({
                nodes: [
                    'fire', 'move-fire', 'move', 'idle'
                ]
            })
        });
        this.hudSprites = new HUDSprites(this);
        this.effect = new Effect();
        // this.handlers = [];
    }

    resetUnit() {

    }

    driveUnit(callback) {
        this.isWorking = true;
        this.current.isMoving = true;
        var moveTimeLine = new TimelineLite();
        var routes = findPath(game.map, this.current.index, this.targetIndex);
        var routeArray = tweenPath(routes);
        moveTimeLine.add(TweenLite.to(this.current.tubeControl.rotation, .5, {
            y: 0
        }));
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
            this.isWorking = false;
            game.map[this.current.index[0]][this.current.index[1]] = 1;
            this.state = 'pendingFire';
            if (callback) {
                callback();
            }
            this.hudSprites.updateRadar();
        });
    }

    attack(callback) {
        this.isWorking = true;
        this.current.isFiring = true;
        var currnetVector = toPosition(this.current.index);
        var targetVector = toPosition(this.targetIndex); //new THREE.Vector3(this.targetIndex[1],0,this.targetIndex[0]);
        var dir = targetVector.clone().sub(currnetVector).normalize();
        var angle = this.current.tubeDirection.angleTo(dir);
        var dirProject = this.current.tubeDirection.clone().cross(dir);
        angle = (dirProject.y > 0 ? angle : -angle);
        TweenMax.to(this.current.tubeControl.rotation, .5, {
            y: angle,
            onComplete: () => {
                this.effect.fire(this.current.tubeTop.getWorldPosition(new THREE.Vector3()), 
                    this.current.tubeDirection.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), angle), 
                    callback);
            }
        });

    }

    selectedUnit(pos) {
        if (this.isWorking) {
            return;
        }
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
        if (this.isWorking) {
            return;
        }
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
                this.state = "pending";
                this.hudSprites.updateRound(game.round);
                console.log("round = " + game.round);
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
                    this.attack(() => {
                        this.current.isFiring = false;
                        this.current.flag = true;
                        this.isWorking = false;
                        // if(this.target){
                            var explodePosition = toPosition(this.targetIndex);
                            var ep_ = explodePosition.clone();
                            ep_.y += 1;
                            this.effect.explode(ep_);
                        // }
                    });
                    resetGround();
                    this.state = "pending";
                    break;
            }
        }
    }
}