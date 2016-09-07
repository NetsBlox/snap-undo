// If not the leader, send operations to the leader for approval
// TODO

function SimpleCollaborator() {
    this.lastSeen = 0;

    this.id = null;
    this.rank = null;
    this.isLeader = false;
    this.addedBlocks = {};
    this.removedBlocks = {};
    this.blockChildren = {};
    this.blockToParent = {};

    // Helpers
    this._blocks = {};
    this._owners = {};
    this.positionOf = {};  // Last writer, highest rank wins

    this.initialize();
};

SimpleCollaborator.prototype.initialize = function() {
    var url = 'ws://' + window.location.host,
        ws = new WebSocket(url),
        self = this;

    ws.onopen = function() {
        logger.debug('websocket connected!');
    };

    ws.onclose = function() {
        self.isLeader = false;
    };

    ws.onmessage = function(raw) {
        var msg = JSON.parse(raw.data);

        if (msg.type === 'rank') {
            self.rank = msg.value;
            self.id = 'client_' + self.rank;
            self.time[self.rank] = 0;
            logger.info('assigned rank of', self.rank);
        } else if (msg.type === 'leader-appoint') {
            self.isLeader = true;
            logger.info('Appointed leader!');
        } else {  // block action
            self.onMessage(msg);
        }
        logger.debug('received msg:', msg);
    };

    this._ws = ws;
    this.serializer = new SnapSerializer();
};

SimpleCollaborator.prototype.acceptEvent = function(msg) {
    msg.id = msg.id || this.lastSeen + 1;
    this.lastSeen = msg.id;
    this.send(msg);
    SimpleCollaborator.Events[msg.type].call(this, msg.args);
};

SimpleCollaborator.prototype.send = function(json) {
    json.id = json.id || this.lastSeen + 1;
    json.args = Array.prototype.map.call(json.args, function(arg) {
        if (arg instanceof BlockMorph) {
            return {
                isBlock: true,
                id: arg.id,
                selector: arg.selector
            };
        } else if (arg instanceof SpriteMorph) {
            return {isSprite: true, id: arg.id};
        }
        return arg;
    });
    this._ws.send(JSON.stringify(json));
};

SimpleCollaborator.prototype.newId = function() {
    return 'item_' + this.lastSeen;
};

/* * * * * * * * * * * * Updating internal rep * * * * * * * * * * * */
SimpleCollaborator.prototype._addBlock = function(id, owner, isLocal) {
    if (this.addedBlocks[id]) {
        // TODO: Check if the block has a position. If not, then we should set
        // it...
        return logger.debug('Block "' + id + '" already added. skipping...');
    }

    // Create the unique id
    logger.log('<<< adding block', id);

    // Store in 2P Set (can only add once)
    this.addedBlocks[id] = id;
    if (!this.removedBlocks[id]) {
        this.onBlockAdded(id, owner, isLocal);
    } else {
        delete this.removedBlocks[id];
    }
};

SimpleCollaborator.prototype._moveBlock = function(id, pId, connId) {
    // TODO: Create the target region to snap to...
    // This is tricky since getting the target region is related to the position...
    // and we can't trust position...
    //
    // "target" contains: (CommandBlockMorph)
    //   - loc (connId)
    //   - type
    //   - element (pId)
    //
    //      OR 
    //
    // "target" === "element" (ReporterBlockMorph | CommentMorph)
    //   This is the element it is replacing...
    //
    // I could merge loc, type into a single connection id for the CBM...
    // The second case is a little trickier... I should represent it the same way...
    //   I need a good way to represent the connection areas... Spec?
    logger.log('<<< moveBlock', id, 'to', pId, 'at', connId);
    if (pId && !this.blockChildren[pId]) {
        this.blockChildren[pId] = {};
    }

    if (this.blockChildren[pId][connId]) {  // conflict!
        // TODO: Check if concurrent. If so, place them in order of the rank
        logger.log('CONFLICT!', pId, connId, 'is already occupied!');
    } else {  // create connection
        if (!pId) {  // disconnect
            var oldParent = this.blockToParent[id] || null;

            delete this.blockToParent[id];
            if (oldParent) {
                delete this.blockChildren[oldParent.id][oldParent.conn];
            }
        } else {
            this.blockChildren[pId][connId] = id;
            this.blockToParent[id] = {
                id: pId,
                conn: connId
            };
        }
        this.onBlockMoved(id, pId, connId);
        // TODO: Update records appropriately if inserting node between others...
    }
};

SimpleCollaborator.prototype._removeBlock = function(id) {
    logger.log('<<< removeBlock', id);
    this.removedBlocks[id] = true;
    this.onBlockRemoved.apply(this, arguments);
};

SimpleCollaborator.prototype._setBlockPosition = function(id, x, y) {
    logger.log('<<< setting position of ', id, 'to', x, ',', y);
    this.positionOf[id] = [x, y];
    this.onSetBlockPosition(id, x, y);
};

/* * * * * * * * * * * * On UI Events * * * * * * * * * * * */
SimpleCollaborator.prototype.addBlock = function(block, owner) {
    var position = block.position(),
        args = Array.prototype.slice.call(arguments),
        msg;

    args.push(position);
    block.id = this.newId();

    msg = {
        type: '_addBlock',
        args: args
    };

    if (this.isLeader) {
        this.acceptEvent(msg);
    } else {
        this.send(msg);
    }

    block.destroy();
};

SimpleCollaborator.prototype.setBlockPosition = function(block, x, y) {
    var msg = {
        type: '_setBlockPosition',
        args: [block.id, x, y]
    };

    if (this.isLeader) {
        this.acceptEvent(msg);
    } else {
        var oldPos = this.positionOf[block.id];
        block.setPosition(new Point(oldPos[0], oldPos[1]));
        this.send(msg);
        // TODO: Move back to starting position in case it is not accepted
    }
};

SimpleCollaborator.prototype.moveBlock = function(block, pId, target) {
    var connId = target.loc + '/' + target.type;

    // If the block doesn't exist, create it
    if (!this._blocks[block.id]) {
        var scripts = block.parentThatIsA(ScriptsMorph);
        this.addBlock(block, scripts.parent);
    }

    // If connecting CommandBlockMorphs, make sure the blocks are in
    // the correct order
    if (target.loc === 'top') {  // switch!
        var parent = block,
            x,
            y;

        logger.info('Switching parent and block...');
        connId = 'top';
        block = this._blocks[pId];
        pId = parent.id;

        // Correct the position
        offsetY = parent.bottomBlock().bottom() - parent.bottom();
        bottom = block.top() + parent.corner - offsetY;
        y = bottom - parent.height();
        x = block.left();
        this.setBlockPosition(parent, x, y);
    }

    var msg = {
        type: '_moveBlock',
        args: [block.id, pId, connId]
    };

    if (this.isLeader) {
        this.acceptEvent(msg);
    } else {
        this.send(msg);
    }
};

SimpleCollaborator.prototype.removeBlock = function(blockId) {
    var msg = {
        type: '_removeBlock',
        args: arguments
    };

    if (this.isLeader) {
        this.acceptEvent(msg);
    } else {
        this.send(msg);
    }
};

/* * * * * * * * * * * * Updating Snap! * * * * * * * * * * * */
SimpleCollaborator.prototype.onBlockAdded = function(id, ownerId, isLocal) {
    var block = this._blocks[id],
        owner = this._owners[ownerId],
        world = this.ide.parentThatIsA(WorldMorph),
        hand = world.hand;

    if (!isLocal) {  // check if remote
        owner.scripts.add(block);
        //block.cachedFullImage = null;
        //block.cachedFullBounds = null;
        block.changed();
        //block.removeShadow();
        //block.justDropped(hand);
        //block.snap(null);
        //owner.scripts.adjustBounds();
    }
};

SimpleCollaborator.prototype.onBlockMoved = function(id, pId, connId) {
    // Convert the pId, connId back to the target...
    var block = this._blocks[id],
        parent = this._blocks[pId],
        target = null;

    if (!pId) {
        target = null;
    } else if (block instanceof CommandBlockMorph) {
        target = {};
        target.loc = connId.split('/')[0];
        target.type = connId.split('/')[1];
        target.element = parent;
    } else if (block instanceof ReporterBlockMorph) {  // target should be the input to replace
        target = parent.children[connId];
    } else {
        logger.error('Unsupported "onBlockMoved":', block);
    }

    block.snap(target);
};

SimpleCollaborator.prototype.onBlockRemoved = function(id) {
    if (this._blocks[id]) {
        this._blocks[id].destroy();
    }
};

SimpleCollaborator.prototype.onSetBlockPosition = function(id, x, y) {
    // Disconnect from previous...
    // TODO
    this._blocks[id].setPosition(new Point(x, y));
};

/* * * * * * * * * * * * On Remote Events * * * * * * * * * * * */
SimpleCollaborator.prototype.onMessage = function(msg) {
    var method = msg.type,
        accepted = true;

    if (this.isLeader) {
        // Verify that the lastSeen value is the same as the current
        accepted = this.lastSeen === (msg.id - 1);
        if (accepted) {
            this.acceptEvent(msg);
        }
    } else {
        if (SimpleCollaborator.Events[method]) {
            SimpleCollaborator.Events[method].call(this, msg.args);
            this.lastSeen = msg.id;
        }
    }
};

// Remote message handlers
SimpleCollaborator.Events = {
    _addBlock: function(args) {
        var block = SpriteMorph.prototype.blockForSelector(args[0].selector, true),
            ownerId = args[1].id,
            hand = this.ide.parentThatIsA(WorldMorph).hand;

        block.isDraggable = true;
        block.isTemplate = false;
        block.id = args[0].id;
        this._blocks[block.id] = block;

        this._addBlock(block.id, ownerId);
        this.positionOf[block.id] = [args[2].x, args[2].y];
        block.setPosition(new Point(args[2].x, args[2].y));
    },

    _setBlockPosition: function(args) {
        // TODO: Check if the block should be detached
        var blockId = args[0];
        this._setBlockPosition.apply(this, args);
    },

    _moveBlock: function(args) {
        // If the block doesn't exist, create it
        if (!this._blocks[args[0]]) {
            // FIXME: Set the position
            logger.error('Received move event for nonexistent block:', args[0]);
        } else if (!this._blocks[args[1]]) {
            // FIXME
            logger.error('Received move event for nonexistent block:', args[1]);
        }

        this._moveBlock.apply(this, args);
    },

    _removeBlock: function(args) {
        var id = args[0];
        this._removeBlock(id);
    }
};

SnapCollaborator = new SimpleCollaborator();
