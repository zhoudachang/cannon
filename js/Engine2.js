class Engine {
    constructor() {
        var that = this;
        BehaviorTree.register('fire', new BehaviorTree.Task({
            title: 'fire',
            run: function (unit) {
                // this.fail();
                if (unit && unit.working) {
                    if(unit.index[0] == 3){
                    }
                //     this.fail();
                //     return;
                // } else {
                //     console.log(unit);
                //     this.fail();
                }
                this.fail();
            }
        }));
        
        BehaviorTree.register('move', new BehaviorTree.Task({
            title: 'move',
            run: function(unit) {
                if (unit && unit.working) {
                    this.success();
                    return;
                } else {
                    if(unit.index[0] > 4){
                        unit.destIndex = [4,　rnd(0,9)];
                        that.driveUnit(unit, () => {
                            unit.working = false;
                        });
                    }
                    this.success();
                }
            }
        }));

        this.btree = new BehaviorTree({
            title: 'enemy action',
            tree: new BehaviorTree.Priority({
                nodes: ['fire', 'move']
            })
        });
        this.ennemies = [];
        this.clock = new THREE.Clock();
        this.spawnInterval = 5;
        this.mesh = new THREE.Object3D();
        this.attackPoints = [];
    }

    boot() {
        let ennemy = new Tank();
        ennemy.index = [9, 1];
        ennemy.mesh.position.copy(toPosition(ennemy.index));
        this.ennemies.push(ennemy);
        this.mesh.add(ennemy.mesh);
    }

    spawn() {
        if (this.clock.getElapsedTime() >= this.spawnInterval) {
            this.clock.start();

        }

    }

    driveUnit(unit,callback) {
        unit.working = true;
        var moveTimeLine = new TimelineLite();
        var routes = findPath(game.map, unit.index, unit.destIndex);
        var routeArray = tweenPath(routes);
        moveTimeLine.add(TweenLite.to(unit.horizontalControl.rotation, .5, {
            y: 0
        }));
        routeArray.forEach(route => {
            var vars = {};
            var routeDirection;
            var t = .5;
            if (route.x) {
                vars.x = "+=" + route.x
                t = Math.abs(route.x * t);
                routeDirection = new THREE.Vector3(route.x, 0, 0).normalize();
            } else if (route.z) {
                vars.z = "+=" + route.z
                t = Math.abs(route.z * t);
                routeDirection = new THREE.Vector3(0, 0, route.z).normalize();
            }
            var angle = unit.direction.angleTo(routeDirection);
            var dirProject = unit.direction.clone().cross(routeDirection);
            unit.direction = routeDirection;
            unit.tubeDirection = routeDirection;
            if (dirProject.y > 0) {
                moveTimeLine.add(TweenLite.to(unit.mesh.rotation, .1, {
                    y: "+=" + angle
                }));
            } else {
                moveTimeLine.add(TweenLite.to(unit.mesh.rotation, .1, {
                    y: "-=" + angle
                }));
            }
            // let t = route
            moveTimeLine.add(TweenLite.to(unit.mesh.position, t, vars));
        });

        moveTimeLine.call(() => {
            game.map[unit.index[0]][unit.index[1]] = 0;
            unit.index = unit.destIndex;
            game.map[unit.index[0]][unit.index[1]] = 1;
            if (callback) {
                callback();
            }
        });
    }
    update() {
        var ennemy;
        for (var i = 0; i < this.ennemies.length; i++) {
            if (!this.ennemies[i].working) {
                ennemy = this.ennemies[i];
                this.btree.setObject(ennemy);
                break;
            }
        }
        this.btree.step();
        this.spawn();
    }
}