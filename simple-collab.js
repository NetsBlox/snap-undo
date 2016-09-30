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
    this._customBlocks = {};
    this._customBlockOwner = {};
    this._owners = {};

    this.spliceConnections = {'bottom/block': true};
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

SimpleCollaborator.prototype.getId = function (block) {
    var id = '';
    while (!block.id) {
        if (block.parent === null) {  // template block
            return null;
        }
        id = block.parent.children.indexOf(block) + '/' + id;
        block = block.parent;
        if (!block) {
            throw Error('Cannot get id from element');
        }
    }
    id = block.id + '/' +  id;
    return id;
};

SimpleCollaborator.prototype.serializeBlock = function(block) {
    if (block.id) {
        return block.id;
    }

    if (block instanceof CommentMorph) {
        return block.toXML(this.serializer);
    }

    return block.toScriptXML(this.serializer);
};

SimpleCollaborator.prototype.deserializeBlock = function(ser) {
    if (ser[0] !== '<') {
        return this._blocks[ser];
    } else if (ser.indexOf('<script>') === 0) {
        return this.serializer.loadScript(this.serializer.parse(ser));
    } else {  // Comment
        return this.serializer.loadComment(this.serializer.parse(ser));
    }
};

/* * * * * * * * * * * * Updating internal rep * * * * * * * * * * * */
SimpleCollaborator.prototype._setField = function(pId, connId, value) {
    console.assert(!this.blockChildren[pId] || !this.blockChildren[pId][connId],'Connection occupied!');

    if (!this.fieldValues[pId]) {
        this.fieldValues[pId] = {};
    }

    this.fieldValues[pId][connId] = value;

    this.onSetField(pId, connId, value);
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
    'addCustomBlock',  // (definition)
    'deleteCustomBlock',  // (definition)
    'toggleBoolean',
    'ringify',
    'unringify',
    'setSelector',
    'addBlock',
    'setBlockSpec',
    'setCommentText',
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
        position = new Point(x, y),
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

    if (firstBlock.snapSound) {
        firstBlock.snapSound.play();
    }

    // TODO: Check if it is added to a custom block definition
    if (!this._customBlocks[ownerId]) {  // not a custom block
        owner.scripts.add(firstBlock);
        owner.scripts.changed();
        firstBlock.changed();
    } else {
        // Create a BlockEditorMorph for the given block
        // TODO
        var def = this._customBlocks[ownerId],
            owner = this._customBlockOwner[ownerId],
            editor = this._getCustomBlockEditor(ownerId, owner),
            scripts = editor.body.contents;

        console.log('adding block to custom block def:', ownerId);
        position = position.add(editor.position());
        scripts.add(firstBlock);
        editor.updateDefinition();
    }

    firstBlock.setPosition(position);

    // Register generic hat blocks?
    // TODO
};

SimpleCollaborator.prototype.world = function() {
    var ownerId = Object.keys(this._owners)[0],
        owner = this._owners[ownerId];

    return owner ? owner.parentThatIsA(WorldMorph) : null;
};

SimpleCollaborator.prototype._getCustomBlockEditor = function(blockId, owner) {
    // Check for the block editor in the world children for this definition
    var children = this.world() ? this.world().children : [],
        editor = detect(children, function(child) {
        return child instanceof BlockEditorMorph && child.definition.id === blockId;
    });
    return editor || new BlockEditorMorph(this._customBlocks[blockId], owner);
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
    } else if (block instanceof ReporterBlockMorph || block instanceof CommentMorph) {
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
    this.updateCommentsPositions(block);
};

SimpleCollaborator.prototype.onRemoveBlock = function(id, userDestroy) {
    var method = userDestroy ? 'userDestroy' : 'destroy';
    if (this._blocks[id]) {
        this._blocks[id][method]();
        delete this._blocks[id];
    }
};

SimpleCollaborator.prototype.onSetBlockPosition = function(id, x, y) {
    // Disconnect from previous...
    var block = this._blocks[id],
        scripts = block.parentThatIsA(ScriptsMorph),
        oldParent = block.parent,
        position = new Point(x, y);

    console.assert(block, 'Block "' + id + '" does not exist! Cannot set position');

    if (oldParent && oldParent.revertToDefaultInput) {
        oldParent.revertToDefaultInput(block);
    }

    scripts.add(block);
    // Check if editing a custom block
    var editor = block.parentThatIsA(BlockEditorMorph);
    if (editor) {  // not a custom block
        position = position.add(editor.position());
    }
    block.setPosition(position);

    if (!(oldParent instanceof ScriptsMorph)) {
        if (oldParent.reactToGrabOf) {
            oldParent.reactToGrabOf(block);
        }
        oldParent.fixLayout();
        oldParent.changed();

        scripts.drawNew();
        scripts.changed();
    }

    if (block.fixBlockColor) {  // not a comment
        block.fixBlockColor();
    }
    block.changed();

    this.updateCommentsPositions(block);
};

SimpleCollaborator.prototype.updateCommentsPositions = function(block) {
    if (block.topBlock) {  // Update comment positions
        var topBlock = block.topBlock();
        topBlock.allComments().forEach(function (comment) {
            comment.align(topBlock);
        });
    }
};

SimpleCollaborator.prototype.onBlockDisconnected = function(id, pId, conn) {
    var block = this._blocks[id],
        scripts = block.parentThatIsA(ScriptsMorph);

    // TODO: This is not sizing the ring appropriately...
    scripts.add(block);
};

SimpleCollaborator.prototype.onAddListInput = function(id) {
    var block = this.getBlockFromId(id);
    block.addInput();
};

SimpleCollaborator.prototype.onRemoveListInput = function(id) {
    var block = this.getBlockFromId(id);
    block.removeInput();
};

SimpleCollaborator.prototype.onSetBlockSpec = function(id, spec) {
    var block = this.getBlockFromId(id);
    block.userSetSpec(spec);
};

SimpleCollaborator.prototype.onSetField = function(pId, connId, value) {
    var parent = this.getBlockFromId(pId),
        block = parent.children[connId];

    console.assert(block instanceof InputSlotMorph,
        'Unexpected block type: ' + block.constructor);
    block.setContents(value);
};

SimpleCollaborator.prototype.onSetCommentText = function(id, text) {
    var block = this.getBlockFromId(id);
    block.contents.text = text;
    block.contents.drawNew();
    block.contents.changed();
    block.layoutChanged();
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
    var block = this._blocks[id];
    if (block) {
        var ring = block.unringify();
        delete this._blocks[ring.id];
    }
};

SimpleCollaborator.prototype.onToggleBoolean = function(id, fromValue) {
    var block = this.getBlockFromId(id),
        iter = 0,
        prev;

    if (typeof fromValue !== 'boolean') {
        fromValue = null;
    }

    while (prev !== fromValue) {
        prev = block.value;
        block.toggleValue();
    }
    if (isNil(block.value)) {return; }
    block.reactToSliderEdit();
};

////////////////////////// Custom Blocks //////////////////////////
SimpleCollaborator.prototype.onAddCustomBlock = function(id, ownerId, opts, creatorId) {
    var def = new CustomBlockDefinition(opts.spec),
        owner = this._owners[ownerId],
        ide = owner.parentThatIsA(IDE_Morph),
        stage = owner.parentThatIsA(StageMorph),
        body;

    // Create the CustomBlockDefinition
    // Record the owner?
    // TODO
    def = new CustomBlockDefinition(opts.spec);
    def.type = opts.blockType;
    def.category = opts.category;
    def.isGlobal = opts.isGlobal;
    def.id = id;
    if (def.type === 'reporter' || def.type === 'predicate') {
        body = Process.prototype.reify.call(
            null,
            SpriteMorph.prototype.blockForSelector('doReport'),
            new List(),
            true // ignore empty slots for custom block reification
        );
        body.outerContext = null;
        def.body = body;
    }

    // Update the palette
    if (def.isGlobal) {
        stage.globalBlocks.push(def);
    } else {
        owner.customBlocks.push(def);
    }
    ide.flushPaletteCache();
    ide.refreshPalette();
    this._customBlocks[id] = def;
    this._customBlockOwner[id] = owner;

    if (creatorId === this.id) {
        new BlockEditorMorph(def, owner).popUp();
    }
};

SimpleCollaborator.prototype.onDeleteCustomBlock = function(id, ownerId) {
    var definition = this._customBlocks[id],
        rcvr = this._owners[ownerId],
        stage,
        ide,
        idx;

    rcvr.deleteAllBlockInstances(definition);
    if (definition.isGlobal) {
        stage = rcvr.parentThatIsA(StageMorph);
        idx = stage.globalBlocks.indexOf(definition);
        if (idx !== -1) {
            stage.globalBlocks.splice(idx, 1);
        }
    } else {
        idx = rcvr.customBlocks.indexOf(definition);
        if (idx !== -1) {
            rcvr.customBlocks.splice(idx, 1);
        }
    }
    ide = rcvr.parentThatIsA(IDE_Morph);
    if (ide) {
        ide.flushPaletteCache();
        ide.refreshPalette();
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
