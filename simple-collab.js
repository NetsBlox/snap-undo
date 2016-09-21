// If not the leader, send operations to the leader for approval
function SimpleCollaborator() {
    this.lastSeen = 0;

    this.id = null;
    this.rank = null;
    this.isLeader = false;
    this.addedBlocks = {};
    this.removedBlocks = {};
    this.blockChildren = {};
    this.blockToParent = {};
    this.fieldValues = {};

    // Helpers
    this._blocks = {};
    this.spliceConnections = {'bottom/block': true};
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
    this[msg.type].apply(this, msg.args);
};

SimpleCollaborator.prototype.send = function(json) {
    json.id = json.id || this.lastSeen + 1;
    this._ws.send(JSON.stringify(json));
};

SimpleCollaborator.prototype.newId = function() {
    return 'item_' + this.lastSeen;
};

/* * * * * * * * * * * * Updating internal rep * * * * * * * * * * * */
SimpleCollaborator.prototype._setField = function(pId, connId, value) {
    console.assert(!this.blockChildren[pId] || !this.blockChildren[pId][connId],'Connection occupied!');

    if (!this.fieldValues[pId]) {
        this.fieldValues[pId] = {};
    }

    this.fieldValues[pId][connId] = value;

    this.onFieldSet(pId, connId, value);
};

SimpleCollaborator.prototype._addBlock = function(id, type, ownerId, x, y) {
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
        this.onBlockAdded.apply(this, arguments);
    } else {
        delete this.removedBlocks[id];
    }
};

SimpleCollaborator.prototype._moveBlock = function(id, target) {
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
    logger.log('<<< moveBlock', id, 'to', target);
    //console.assert(pId, 'No parent block defined!');
    //if (!this.blockChildren[pId]) {
        //this.blockChildren[pId] = {};
    //}

    //if (this.blockChildren[pId][connId]) {  // conflict!
        //// If the block is a command, insert between
        //// TODO
        //logger.log('CONFLICT!', pId, connId, 'is already occupied!');
    //} else {  // create connection
        //if (!pId) {  // disconnect
            //var oldParent = this.blockToParent[id] || null;

            //delete this.blockToParent[id];
            //if (oldParent) {
                //delete this.blockChildren[oldParent.id][oldParent.conn];
            //}
            //this.onBlockDisconnected(id, oldParent.id, oldParent.conn);
        //} else {
            //this.blockChildren[pId][connId] = id;
            //this.blockToParent[id] = {
                //id: pId,
                //conn: connId
            //};
        //}
        //this.onBlockMoved(id, pId, connId);
        //// TODO: Update records appropriately if inserting node between others...
    //}
    this.onBlockMoved(id, target);
};

SimpleCollaborator.prototype._removeBlock = function(id) {
    logger.log('<<< removeBlock', id);
    this.removedBlocks[id] = true;
    this.onBlockRemoved.apply(this, arguments);
};

SimpleCollaborator.prototype._setBlockPosition = function(id, x, y) {
    logger.log('<<< setting position of ', id, 'to', x, ',', y);
    this.positionOf[id] = [x, y];

    // Check if this is causing a disconnect
    var parent = this.blockToParent[id];
    if (parent) {
        delete this.blockChildren[parent.id][parent.conn];
        this.onBlockDisconnected(id, parent.id, parent.conn);
    }

    this.onSetBlockPosition(id, x, y);
};

SimpleCollaborator.prototype._setSelector = function(id, selector) {
    this.onSetSelector(id, selector);
};

// / / / / / / / / / / / Variables / / / / / / / / / / / //
SimpleCollaborator.prototype._addVariable = function(name, ownerId) {
    this.onAddVariable(name, ownerId);
};

SimpleCollaborator.prototype._deleteVariable = function(name, ownerId) {
    this.onDeleteVariable(name, ownerId);
};

/* * * * * * * * * * * * On UI Events * * * * * * * * * * * */
[
    'setSelector',
    'moveBlock',
    'addVariable',
    'deleteVariable',
    'setField',
    'removeBlock',
    'setBlockPosition'
].forEach(function(method) {
    SimpleCollaborator.prototype[method] = function() {
        var args = Array.prototype.slice.apply(arguments),
            msg;

        msg = {
            type: '_' + method,
            args: args
        };

        if (this.isLeader) {
            this.acceptEvent(msg);
        } else {
            this.send(msg);
        }
    };
});

SimpleCollaborator.prototype.addBlock = function(/*blockType, ownerId, x, y*/) {
    var args = Array.prototype.slice.apply(arguments),
        msg;

    args.unshift(this.newId());
    msg = {
        type: '_addBlock',
        args: args
    };

    if (this.isLeader) {
        this.acceptEvent(msg);
    } else {
        this.send(msg);
    }
};

//SimpleCollaborator.prototype.moveBlock = function(block, target) {
    ////var connId = target.loc + '/' + target.type;

    //// If the block doesn't exist, create it
    ////if (!this._blocks[block.id]) {
        ////var scripts = block.parentThatIsA(ScriptsMorph);
        ////this.addBlock(block, scripts.parent);
    ////}

    //// If connecting CommandBlockMorphs, make sure the blocks are in
    //// the correct order
    //// TODO: Should probably move some of this to Snap itself
    ////if (target.loc === 'top') {  // switch!
        ////var parent = block,
            ////x,
            ////y;

        ////logger.info('Switching parent and block...');
        ////connId = 'top';
        ////block = this._blocks[pId];
        ////pId = parent.id;

        ////// Correct the position
        ////offsetY = parent.bottomBlock().bottom() - parent.bottom();
        ////bottom = block.top() + parent.corner - offsetY;
        ////y = bottom - parent.height();
        ////x = block.left();
        ////this.setBlockPosition(parent.id, x, y);
    ////}

    //// What if I just serialize the target in a nice way? Then I can send it and replay
    //// it easily - shouldn't need to do anything extra...
    //// TODO

    //var msg = {
        //type: '_moveBlock',
        //args: [block.id, pId, connId]
    //};

    //if (this.isLeader) {
        //this.acceptEvent(msg);
    //} else {
        //this.send(msg);
    //}
//};

/* * * * * * * * * * * * Updating Snap! * * * * * * * * * * * */
SimpleCollaborator.prototype.onBlockAdded = function(id, type, ownerId, x, y) {
    var block,
        owner = this._owners[ownerId],
        world = this.ide.parentThatIsA(WorldMorph),
        hand = world.hand;

    // TODO: Should I serialize blocks rather than just storing the 'type'?
    if (type.indexOf('reportGetVar') === 0) {
        var name = type.split('/').slice(1).join('/');
        block = new ReporterBlockMorph();
        if (modules.objects !== undefined) {
            block.color = SpriteMorph.prototype.blockColor.variables;
            block.category = 'variables';
        } else {
            block.color = new Color(243, 118, 29);
            block.category = null;
        }
        block.setSpec(name);
        block.selector = 'reportGetVar';
    } else {
        block = SpriteMorph.prototype.blockForSelector(type, true);
    }
    block.isDraggable = true;
    block.isTemplate = false;
    block.id = id;
    this._blocks[block.id] = block;

    if (arguments.length === 5) {
        this.positionOf[block.id] = [x, y];
        block.setPosition(new Point(x, y));
    } else {
        // TODO: Connect to another block
    }

    owner.scripts.add(block);
    block.changed();
};

SimpleCollaborator.prototype.onBlockMoved = function(id, target) {
    // Convert the pId, connId back to the target...
    var block = this._blocks[id];
        //parent = this._blocks[pId];

    if (block instanceof CommandBlockMorph) {
        if (typeof target.element === 'string') {
            target.element = this._blocks[target.element];
        } else {
            target.element = this._blocks[target.element.pId].children[target.element.id];
        }
    } else if (block instanceof ReporterBlockMorph) {  // target should be the input to replace
        target = this._blocks[target.pId].children[target.id];
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
    var parentInfo = this.blockToParent[id],
        parent;

    if (parentInfo) {
        parent = this._blocks[id]
        parent
    }

    this._blocks[id].setPosition(new Point(x, y));
    this._blocks[id].snap(null);
};

SimpleCollaborator.prototype.onBlockDisconnected = function(id, pId, conn) {
    var block = this._blocks[id],
        scripts = block.parentThatIsA(ScriptsMorph);

    scripts.add(block);
};

SimpleCollaborator.prototype.onFieldSet = function(pId, connId, value) {
    var parent = this._blocks[pId],
        block = parent.children[connId];

    console.assert(block instanceof InputSlotMorph,
        'Unexpected block type: ' + block.constructor);
    block.setContents(value);
};

SimpleCollaborator.prototype.onSetSelector = function(id, sel) {
    var block = this._blocks[id];
    block.setSelector(sel);
};

SimpleCollaborator.prototype.onAddVariable = function(name, ownerId) {
    // Get the sprite or the stage
    var owner;
    if (ownerId !== true) {
        owner = this._owners[ownerId];
    } else {
        owner = this._owners[Object.keys(this._owners)[0]];
    }
    owner.addVariable(name, ownerId === true)
};

SimpleCollaborator.prototype.onDeleteVariable = function(name, ownerId) {
    var owner = this._owners[ownerId];
    owner.deleteVariable(name)
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
        if (this[method]) {
            this[method].apply(this, msg.args);
            this.lastSeen = msg.id;
        }
    }
};

SnapCollaborator = new SimpleCollaborator();
