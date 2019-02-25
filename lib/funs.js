function toPosition(pos) {
    var x = game.stageWidth / 2 - game.segmentsLength * pos[0] - 5;
    var z = -game.stageHeight / 2 + game.segmentsLength * pos[1] + 5;
    return new THREE.Vector3(x, 0, z);
}

function toIndex(matIndex) {
    var x = Math.floor(matIndex % (game.segmentsLength * 2) / 2);
    var y = Math.floor(matIndex / (game.segmentsLength * 2));
    return [y, x];
}

function toFaceIndex(unitIndex) {
    if (unitIndex[0] >= 0 && unitIndex[1] >= 0) {
        var index1 = unitIndex[0] * game.segmentsLength * 2 + 2 * unitIndex[1];
        return index1;
    }
}

function tweenPath(routes) {
    var routeArray = [];
    var previous = toPosition(routes.shift());
    routes.forEach(route => {
        var stepPos = toPosition(route);
        if (stepPos.x != previous.x) {
            if (routeArray.length && routeArray[routeArray.length - 1].x) {
                routeArray[routeArray.length - 1].x += (stepPos.x - previous.x);
            } else {
                var angle = "-=" + Math.PI / 2;
                if (stepPos.x > previous.x) {
                    angle = "-=" + Math.PI / 2;
                }
                routeArray.push({
                    x: stepPos.x - previous.x,
                    agl: angle
                });
            }
        } else {
            if (routeArray.length && routeArray[routeArray.length - 1].z) {
                routeArray[routeArray.length - 1].z += (stepPos.z - previous.z);
            } else {
                var angle = "-=" + Math.PI / 2;
                if (stepPos.x > previous.x) {
                    angle = "-=" + Math.PI / 2;
                }
                routeArray.push({
                    z: stepPos.z - previous.z,
                    agl: angle
                });
            }
        }
        previous = stepPos;
    });
    return routeArray;
}

function Manhattan(Point, Goal) {
    return Math.max(Math.abs(Point.x - Goal.x), Math.abs(Point.y - Goal.y));
};

function findPath(map, start, end) {
    var width = map[0].length;
    var height = map.length;
    var size = width * height;
    var distance = Manhattan;
    var can_walk = function (x, y) {
        var res = map[x] != null && map[x][y] != null && (map[x][y] == 0);
        return res;
    };
    var find_neighbours = function () { };
    var get_neighbours = function (x, y) {
        // North South East West
        var N = y + 1;
        var S = y - 1;
        var E = x - 1;
        var W = x + 1;
        // Check we don't go off the map or hit a wall
        myN = N > -1 && can_walk(x, N);
        myS = S < height && can_walk(x, S);
        myE = E < width && can_walk(E, y);
        myW = W > -1 && can_walk(W, y);
        // Results
        result = [];
        if (myN) result.push({
            x: x,
            y: N
        });
        if (myE) result.push({
            x: E,
            y: y
        });
        if (myS) result.push({
            x: x,
            y: S
        });
        if (myW) result.push({
            x: W,
            y: y
        });
        return result;
    };

    function Node(Parent, Point) {
        var node = {
            Parent: Parent,
            value: Point.x + (Point.y * width),
            x: Point.x,
            y: Point.y,
            f: 0,
            g: 0
        };
        return node;
    }

    function calculate_path() {
        var p_start = Node(null, {
            x: start[0],
            y: start[1]
        });
        var p_end = Node(null, {
            x: end[0],
            y: end[1]
        });

        var AStar = new Array(size);
        var open = [p_start];
        var closed = [];
        var result = [];
        var neighbours, curr_node, curr_path;
        var length, max, min, i, j;
        while (length = open.length) {
            max = size;
            min = -1;
            for (var i = 0; i < length; i++) {
                if (open[i].f < max) {
                    max = open[i].f;
                    min = i;
                }
            }
            curr_node = open.splice(min, 1)[0];
            if (curr_node.value === p_end.value) {
                curr_path = closed[closed.push(curr_node) - 1];
                do {
                    result.push([curr_path.x, curr_path.y]);
                }
                while (curr_path = curr_path.Parent) {
                    AStar = closed = open = [];
                    result.reverse();
                }
            } else {
                neighbours = get_neighbours(curr_node.x, curr_node.y);
                for (var i = 0, j = neighbours.length; i < j; i++) {
                    curr_path = Node(curr_node, neighbours[i]);
                    if (!AStar[curr_path.value]) {
                        curr_path.g = curr_node.g + distance(neighbours[i], curr_node);
                        curr_path.f = curr_path.g + distance(neighbours[i], p_end);
                        open.push(curr_path);
                        AStar[curr_path.value] = true;
                    }
                }
                closed.push(curr_node);
            }
        }
        return result;
    }
    return calculate_path();
}

function calFireRange(targetIndex, radius) {
    if (!radius) {
        return;
    }
    var moveCount = radius * (4 + (radius - 1) * 2) + 1;
    var deltaX = -radius;
    var deltaY = 0;
    var result = [];
    for (var i = 0; i < moveCount; i++) {
        if ((targetIndex[0] + deltaX) < 10 && (targetIndex[1] + deltaY) < 10 && (targetIndex[0] + deltaX) >= 0 && (targetIndex[1] + deltaY) >= 0) {
            result.push([targetIndex[0] + deltaX, targetIndex[1] + deltaY]);
        }
        if ((Math.abs(deltaX) + Math.abs(deltaY) == radius) && deltaY >= 0) {
            deltaX++;
            deltaY = Math.abs(deltaX) - radius;
        } else {
            deltaY++;
        }
    }
    return result;
}

function calMoveRange(map, index, radius) {
    var tempList = [
        []
    ];
    tempList[0] = index;
    var rangeList = [
        []
    ];
    rangeList[0] = index;
    var checkRange = function (node, tempList) {
        var route = Math.abs(node[0] - index[0]) + Math.abs(node[1] - index[1]);
        if (route <= radius) {
            if (!rangeList.find(e => e[0] == node[0] && e[1] == node[1]) &&
                node[0] < 10 && node[0] >= 0 && node[1] >= 0 && //&& node[1] < 10
                map[node[0]][node[1]] != null && map[node[0]][node[1]] == 0) {
                rangeList.push(node);
                tempList.push(node);
            }
        }
    }
    var rangeScan = function () {
        var tempList_ = [];
        for (var i = 0; i < tempList.length; i++) {
            var node = tempList[i];
            checkRange([node[0], node[1] - 1], tempList_);
            checkRange([node[0], node[1] + 1], tempList_);
            checkRange([node[0] + 1, node[1]], tempList_);
            checkRange([node[0] - 1, node[1]], tempList_);
        }
        return tempList_;
    };
    var countPoint = 0;
    while (countPoint < radius) {
        tempList = rangeScan();
        countPoint++
    }
    return rangeList;
}

function intersect(a, b) {
    return Array.from(new Set(a.filter(v => b.find(v2 => {return v2[0] === v[0]&&v2[1] === v[1]}))));
}

function rnd(n, m){
    var random = Math.floor(Math.random()*(m-n+1)+n);
    return random;
}