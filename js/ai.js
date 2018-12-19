"use strict";
const INIT = Symbol('INIT');
const RUNNING = Symbol('RUNNING');
const SUCCESS = Symbol('SUCCESS');
const FAILURE = Symbol('FAILURE');

class TreeNode {
    constructor(parent = null, children = []) {
        this._parent = parent;
        this._children = children;
    }
    set Parent(parent) {
        this._parent = parent;
    }
    get Parent() {
        return this._parent;
    }
    get Children() {
        return this._children;
    }
    addChild(child, importance = -1) {
        child.Parent = this;
        if (importance > -1) {
            this._children = this._children
                .slice(0, importance)
                .concat([child])
                .concat(this._children.slice(importance))
        } else {
            this._children.push(child);
        }
    }
    removeChild(child) {
        const idx = this._children.indexOf(child);
        if (idx !== -1) {
            this._children.splice(idx, 1);
        }
    }
    get IsRoot() {
        return this.Parent === null;
    }
    get Root() {
        let curr = this.Parent;
        while (!curr.IsRoot) {
            curr = curr.Parent;
        }
        return curr;
    }
}

class Node extends TreeNode {
    constructor(parent, children) {
        super(parent, children)
        this._status = INIT;
    }
    tick() {
        const c = this.Children;
        const l = c.length;
        for (let i = l - 1; i >= 0; i--) {
            console.log('Node.tick i=%d', i);
            const c = this.Children[i];
            const cs = c.tick();
            if (this.policy(c)) {
                return c.Status;
            }
        }
        return FAILURE;
    }
    get Status() {
        return this._status;
    }
    policy(child) {
        // throw new Error('policy is abstract');
        console.log('policy')
    }
}

class RootNode extends Node {
}

class Task {
    execute() {
        throw new Error('execute is abstract')
    }
}

class ActionTask extends Task {
    execute(action, ctx) {
        this._action = action;
        this._ctx = ctx !== undefined ? ctx : this;
    }
    execute() {
        return this._action.apply(this._ctx, []);
    }
}

class ActionNode extends Node {
    constructor(task) {
        super();
        this._task = task;
    }
    get Task() {
        return this._task;
    }
    execute() {
        try {
            return this.Task.execute();
        } catch (e) {
            return FAILURE;
        }
    }
    addChild(child, importance = -1) {
        throw new Error('Execution nodes can not have children');
    }
}
class ConditionNode extends Node {
    constructor() {

    }
    addChild(child, importance = -1) {
        throw new Error('Execution nodes can not have children');
    }
}

class SelectorNode extends Node {
    policy(child) {
        return child.Status !== FAILURE;
    }
}

class SequenceNode extends Node {
    policy(child) {
        return child.Status === FAILURE || child.Status === RUNNING;
    }
}

class ParallelNode extends Node {

}


