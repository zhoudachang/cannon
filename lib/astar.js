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
    var find_neighbours = function () {};
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