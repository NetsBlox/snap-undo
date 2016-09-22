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
    this.send(msg);
    this[msg.type].apply(this, msg.args);
    this.lastSeen = msg.id;
};

SimpleCollaborator.prototype.send = function(json) {
    json.id = json.id || this.lastSeen + 1;
    this._ws.send(JSON.stringify(json));
};

SimpleCollaborator.prototype.newId = function(index) {
    // This is the same across devices since it uses the currently last seen value
    var id = 'item_' + this.lastSeen;

    if (index !== undefined) {
        id += '_' + index;
    }

    return id;
};

SimpleCollaborator.prototype.serializeBlock = function(block) {
    if (block.id) {
        return block.id;
    }

    return block.toScriptXML(this.serializer);
        //.replace(/^\<script\>/, '')
        //.replace(/\<\/script\>$/, '');
};

SimpleCollaborator.prototype.deserializeBlock = function(ser) {
    if (ser[0] !== '<') {
        return this._blocks[ser];
    } else {
        return this.serializer.loadScript(this.serializer.parse(ser));
    }
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

SimpleCollaborator.prototype._moveBlock = function(block, target) {
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
    logger.log('<<< moveBlock', block, 'to', target);
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
        //this.onMoveBlock(id, pId, connId);
        //// TODO: Update records appropriately if inserting node between others...
    //}
    this.onMoveBlock(block, target);
};

SimpleCollaborator.prototype._removeBlock = function(id, userDestroy) {
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
    'ringify',
    'unringify',
    'setSelector',
    'addBlock',
    'addListInput',
    'removeListInput',
    'moveBlock',
    'addVariable',
    'deleteVariable',
    'setField',
    'removeBlock',
    'setBlockPosition'
].forEach(function(method) {
    SimpleCollaborator.prototype[method] = function() {
        var args = Array.prototype.slice.apply(arguments),
            fnName = '_' + method,
            msg;

        if (!this[fnName]) {
            fnName = 'on' + method.substring(0,1).toUpperCase() + method.substring(1);
        }

        msg = {
            type: fnName,
            args: args
        };

        if (this.isLeader) {
            this.acceptEvent(msg);
        } else {
            this.send(msg);
        }
    };
});

/* * * * * * * * * * * * Updating Snap! * * * * * * * * * * * */
SimpleCollaborator.prototype.onAddBlock = function(type, ownerId, x, y) {
    var block,
        owner = this._owners[ownerId],
        world = this.ide.parentThatIsA(WorldMorph),
        hand = world.hand,
        i = 1,
        firstBlock;

    firstBlock = this.deserializeBlock(type);
    block = firstBlock;

    while (block) {
        block.isDraggable = true;
        block.isTemplate = false;
        block.id = this.newId(i);
        this._blocks[block.id] = block;

        block = block.nextBlock ? block.nextBlock() : null;
        ++i;
    }

    this.positionOf[firstBlock.id] = [x, y];
    firstBlock.setPosition(new Point(x, y));

    owner.scripts.add(firstBlock);
    owner.scripts.changed();
    firstBlock.changed();
};

SimpleCollaborator.prototype.getBlockFromId = function(id) {
    var ids = id.split('/'),
        blockId = ids.shift(),
        block = this._blocks[blockId];

    for (var i = 0; i < ids.length; i++) {
        if (ids[i]) {
            block = block.children[ids[i]];
        }
    }
    return block;
};

SimpleCollaborator.prototype.onMoveBlock = function(id, target) {
    // Convert the pId, connId back to the target...
    var block = this.deserializeBlock(id),
        isNewBlock = !block.id,
        scripts;

    if (block instanceof CommandBlockMorph) {
        target.element = this.getBlockFromId(target.element);
        scripts = target.element.parentThatIsA(ScriptsMorph);
    } else if (block instanceof ReporterBlockMorph) {  // target should be the input to replace
        target = this.getBlockFromId(target);
        scripts = target.parentThatIsA(ScriptsMorph);
    } else {
        logger.error('Unsupported "onMoveBlock":', block);
    }

    if (isNewBlock) {
        block.id = this.newId();
        this._blocks[block.id] = block;
        scripts.add(block);
    } else {
        if (block.parent && block.parent.reactToGrabOf) {
            block.parent.reactToGrabOf(block);
        }
    }

    block.snap(target);
};

SimpleCollaborator.prototype.onBlockRemoved = function(id, userDestroy) {
    var method = userDestroy ? 'userDestroy' : 'destroy';
    if (this._blocks[id]) {
        this._blocks[id][method]();
        delete this._blocks[id];
    }
};

SimpleCollaborator.prototype.onSetBlockPosition = function(id, x, y) {
    // Disconnect from previous...
    var block = this._blocks[id],
        scripts = block.parentThatIsA(ScriptsMorph);

    console.assert(block, 'Block "' + id + '" does not exist! Cannot set position');

    if (!(block.parent instanceof ScriptsMorph)) {
        block.parent.revertToDefaultInput(block);
        block.parent.fixLayout();
        block.parent.changed();

        scripts.drawNew();
        scripts.changed();
    }

    block.setPosition(new Point(x, y));

    scripts.add(block);
    block.fixBlockColor();
    block.changed();
};

SimpleCollaborator.prototype.onBlockDisconnected = function(id, pId, conn) {
    var block = this._blocks[id],
        scripts = block.parentThatIsA(ScriptsMorph);

    scripts.add(block);
};

SimpleCollaborator.prototype.onAddListInput = function(pId, id) {
    var parent = this._blocks[pId],
        block = parent.children[id];

    block.addInput();
};

SimpleCollaborator.prototype.onRemoveListInput = function(pId, id) {
    var parent = this._blocks[pId],
        block = parent.children[id];

    block.removeInput();
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

SimpleCollaborator.prototype.onRingify = function(id) {
    if (this._blocks[id]) {
        var ring = this._blocks[id].ringify();
        ring.id = this.newId();
        this._blocks[ring.id] = ring;
    }
};

SimpleCollaborator.prototype.onUnringify = function(id) {
    if (this._blocks[id]) {
        var ring = this._blocks[id].unringify();
        ring.id = this.newId();
        this._blocks[ring.id] = ring;
    }
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
