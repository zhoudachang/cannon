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
        moveTimeLine.add(TweenLite.to(this.current.tubeControl.rotation,.5,{y:0}));
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

    attack(){
        this.current.isFiring = true;
        var moveTimeLine = new TimelineLite();
        console.log(this.current.index,this.targetIndex);
        var currnetVector = toPosition(this.current.index);
        var targetVector = toPosition(this.targetIndex);//new THREE.Vector3(this.targetIndex[1],0,this.targetIndex[0]);
        var dir = targetVector.sub(currnetVector).normalize();
        var angle = this.current.tubeDirection.angleTo(dir);
        var dirProject = this.current.tubeDirection.clone().cross(dir);
        angle = (dirProject.y > 0 ? angle: -angle);
        moveTimeLine.add(TweenLite.to(this.current.tubeControl.rotation,.5,{y:angle}));
        
        moveTimeLine.call(() => {this.current.isFiring = false});
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

    selectedEnnemy(pos){
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
            if(!ennemy){
                game.round +=1;
                this.units.map(i => i.flag = false);
                this.ennemies.map(i => i.flag = false);
                this.current = null;
                console.log("round = " + game.round);
                this.state = "pending";
            }else {
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