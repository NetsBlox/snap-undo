// If not the leader, send operations to the leader for approval
function SimpleCollaborator() {
    this.lastSeen = 0;
    this.idCount = 0;

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
    this._costumes = {};
    this._costumeToOwner = {};
    this._soundToOwner = {};

    this._sounds = {};

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
    };

    this._ws = ws;
    this.serializer = new SnapSerializer();
};

SimpleCollaborator.prototype.acceptEvent = function(msg) {
    var method = this._getMethodFor(msg.type);

    logger.debug('received event:', msg);
    msg.id = msg.id || this.lastSeen + 1;
    this.send(msg);
    this[method].apply(this, msg.args);
    this.lastSeen = msg.id;
    this.idCount = 0;
};

SimpleCollaborator.prototype.send = function(json) {
    json.id = json.id || this.lastSeen + 1;
    this._ws.send(JSON.stringify(json));
};

SimpleCollaborator.prototype.newId = function(index) {
    // This is the same across devices since it uses the currently last seen value
    var id = 'item_' + this.lastSeen;

    if (this.idCount !== 0) {
        id += '_' + this.idCount;
    }
    this.idCount++;

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
    var ownerId = Object.keys(this._owners).pop(),
        owner,
        stage;

    if (ownerId) {  // Update the stage for custom blocks
        owner = this._owners[ownerId],
        stage = owner.parentThatIsA(StageMorph);

        this.serializer.project = {
            stage: stage,
            sprites: {}
        };
    }

    if (ser[0] !== '<') {
        return this._blocks[ser];
    } else if (ser.indexOf('<script>') === 0) {
        return this.serializer.loadScript(this.serializer.parse(ser));
    } else {  // Comment
        return this.serializer.loadComment(this.serializer.parse(ser));
    }
};

SimpleCollaborator.prototype.registerOwner = function(owner) {
    owner.id = this.newId();
    this._owners[owner.id] = owner;
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
    'addSprite',
    'removeSprite',
    'renameSprite',
    'toggleDraggable',
    'duplicateSprite',
    'importSprites',

    'addSound',
    'renameSound',
    'removeSound',

    'setStageSize',

    'addCostume',
    'renameCostume',
    'removeCostume',
    'updateCostume',
    'importMedia',

    'addCustomBlock',  // (definition)
    'deleteCustomBlock',  // (definition)
    'deleteCustomBlocks',  // (definition)

    'addBlock',
    'removeBlock',
    'importBlocks',
    'setSelector',
    'setBlockSpec',

    'toggleBoolean',
    'updateBlockLabel',
    'deleteBlockLabel',
    'setCustomBlockType',
    'ringify',
    'unringify',
    'setCommentText',
    'addListInput',
    'removeListInput',
    'moveBlock',
    'addVariable',
    'deleteVariable',
    'setField',
    'setBlockPosition'
].forEach(function(method) {
    SimpleCollaborator.prototype[method] = function() {
        var args = Array.prototype.slice.apply(arguments),
            msg;

        msg = {
            type: method,
            args: args
        };

        if (this.isLeader) {
            this.acceptEvent(msg);
        } else {
            this.send(msg);
        }
    };
});

SimpleCollaborator.prototype._getMethodFor = function(action) {
    var method = '_' + action;
    if (!this[method]) {
        method = 'on' + action.substring(0,1).toUpperCase() + action.substring(1);
    }

    return method;
};

/* * * * * * * * * * * * Updating Snap! * * * * * * * * * * * */
SimpleCollaborator.prototype.getAdjustedPosition = function(position, scripts) {
    // Adjust the position given the scroll value
    var dy,
        dx;

    if (scripts.scrollFrame) {
        //dy = scripts.top() - scripts.scrollFrame.top();
        //dx = scripts.left() - scripts.scrollFrame.left();

        return position.add(new Point(dx, dy));
    } else {
        return position;
    }
};

SimpleCollaborator.prototype.onAddBlock = function(type, ownerId, x, y) {
    var block,
        owner = this._owners[ownerId],
        world = this.ide().parentThatIsA(WorldMorph),
        hand = world.hand,
        position = new Point(x, y),
        i = 1,
        firstBlock;

    firstBlock = this.deserializeBlock(type);
    block = firstBlock;

    while (block) {
        block.isDraggable = true;
        block.isTemplate = false;
        block.id = this.newId();
        this._blocks[block.id] = block;

        block = block.nextBlock ? block.nextBlock() : null;
        ++i;
    }

    if (firstBlock.snapSound) {
        firstBlock.snapSound.play();
    }

    if (!this._customBlocks[ownerId]) {  // not a custom block
        position = this.getAdjustedPosition(position, owner.scripts);

        firstBlock.setPosition(position);
        owner.scripts.add(firstBlock);
        owner.scripts.changed();
        firstBlock.changed();
        owner.scripts.adjustBounds();
    } else {
        var def = this._customBlocks[ownerId],
            editor = this._getCustomBlockEditor(ownerId),
            scripts = editor.body.contents;

        position = position.add(editor.position());
        position = this.getAdjustedPosition(position, scripts);
        firstBlock.setPosition(position);
        scripts.add(firstBlock);
        editor.updateDefinition();
    }

    this.positionOf[firstBlock.id] = [position.x, position.y];

    // Register generic hat blocks?
    // TODO
};

SimpleCollaborator.prototype.world = function() {
    var ownerId = Object.keys(this._owners)[0],
        owner = this._owners[ownerId];

    return owner ? owner.parentThatIsA(WorldMorph) : null;
};

SimpleCollaborator.prototype._getCustomBlockEditor = function(blockId) {
    // Check for the block editor in the world children for this definition
    var children = this.world() ? this.world().children : [],
        owner = this._customBlockOwner[blockId],
        editor = detect(children, function(child) {
        return child instanceof BlockEditorMorph && child.definition.id === blockId;
    });

    if (!editor) {  // Create new editor dialog
        editor = new BlockEditorMorph(this._customBlocks[blockId], owner);
        editor.popUp();  // need to guarantee the correct pos
        editor.setInitialDimensions();
        editor.cancel();
    }

    return editor;
};

SimpleCollaborator.prototype.getBlockFromId = function(id) {
    var ids = id.split('/'),
        blockId = ids.shift(),
        block = this._blocks[blockId],
        editor = block.parentThatIsA(BlockEditorMorph),
        customBlockId;

    // If the block is part of a custom block def, refresh it
    if (editor) {
        var customBlockId = editor.definition.id,
            found = false,
            current,
            next;

        currentEditor = this._getCustomBlockEditor(customBlockId);
        if (editor !== currentEditor) {  // update the block record
            editor = currentEditor;
            current = editor.body.contents.children.slice();
            // Search through the blocks for the given id...
            while (!found && current.length) {
                next = [];
                for (var i = current.length; i--;) {
                    // Check for the given id
                    if (!current[i]) continue;

                    if (current[i].id === blockId) {
                        this._blocks[blockId] = current[i];
                        block = this._blocks[blockId];
                        found = true;
                        break;
                    }

                    // Get the next nodes
                    if (current[i].inputs) {
                        next = next.concat(current[i].inputs());
                    }

                    if (current[i].nextBlock) {
                        next.push(current[i].nextBlock());
                    }
                }
                current = next;
            }
        }
    }

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
        // Check if connecting to the beginning of a custom block definition
        if (this._customBlocks[target.element]) {
            target.element = this._getCustomBlockEditor(target.element)
                .body.contents  // get ScriptsMorph of BlockEditorMorph
                .children.find(function(child) {
                    return child instanceof PrototypeHatBlockMorph
                });
        } else {  // basic connection for sprite/stage/etc
            target.element = this.getBlockFromId(target.element);
        }
        scripts = target.element.parentThatIsA(ScriptsMorph);
    } else if (block instanceof ReporterBlockMorph || block instanceof CommentMorph) {
        target = this.getBlockFromId(target);
        scripts = target.parentThatIsA(ScriptsMorph);

        // Disconnect the given block
        this.disconnectBlock(block, scripts);
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
    this._updateBlockDefinitions(block);
};

SimpleCollaborator.prototype.onRemoveBlock = function(id, userDestroy) {
    var method = userDestroy ? 'userDestroy' : 'destroy',
        block = this.getBlockFromId(id),
        scripts = block.parentThatIsA(ScriptsMorph),
        parent = block.parent;

    if (block) {
        // Check the parent and revert to default input
        if (parent && parent.revertToDefaultInput) {
            parent.revertToDefaultInput(block);
        }

        // Remove the block
        block[method]();
        delete this._blocks[id];
        this._updateBlockDefinitions(block);

        // Update parent block's UI
        if (parent) {
            if (parent.reactToGrabOf) {
                parent.reactToGrabOf(block);
            }
            if (parent.fixLayout) parent.fixLayout();
            parent.changed();

            if (scripts) {
                scripts.drawNew();
                scripts.changed();
            }
        }
    }
};

SimpleCollaborator.prototype._updateBlockDefinitions = function(block) {
    var editor = block.parentThatIsA(BlockEditorMorph);
    if (editor) {
        editor.updateDefinition();
    }
};

SimpleCollaborator.prototype.onSetBlockPosition = function(id, x, y) {
    // Disconnect from previous...
    var block = this.getBlockFromId(id),
        scripts = block.parentThatIsA(ScriptsMorph),
        oldParent = block.parent,
        position = new Point(x, y);

    console.assert(block, 'Block "' + id + '" does not exist! Cannot set position');

    if (oldParent && oldParent.revertToDefaultInput) {
        oldParent.revertToDefaultInput(block);
    }

    // Check if editing a custom block
    var editor = block.parentThatIsA(BlockEditorMorph);
    if (editor) {  // not a custom block
        position = position.add(editor.position());
        scripts = editor.body.contents;
        this.positionOf[id] = [position.x, position.y];
    }

    position = this.getAdjustedPosition(position, scripts);
    block.setPosition(position);
    scripts.add(block);

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

    // Save the block definition
    this._updateBlockDefinitions(block);
};

SimpleCollaborator.prototype.updateCommentsPositions = function(block) {
    if (block.topBlock) {  // Update comment positions
        var topBlock = block.topBlock();
        topBlock.allComments().forEach(function (comment) {
            comment.align(topBlock);
        });
    }
};

SimpleCollaborator.prototype.disconnectBlock = function(block, scripts) {
    var oldParent = block.parent;

    if (scripts) block.parent = scripts;

    scripts = scripts || block.parentThatIsA(ScriptsMorph);
    if (oldParent) {
        if (oldParent.revertToDefaultInput) oldParent.revertToDefaultInput(block);

        if (!(oldParent instanceof ScriptsMorph)) {
            if (oldParent.reactToGrabOf) {
                oldParent.reactToGrabOf(block);
            }
            if (oldParent.fixLayout) {
                oldParent.fixLayout();
            }
            oldParent.changed();

            if (scripts) {
                scripts.drawNew();
                scripts.changed();
            }
        }
    }

    if (block.fixBlockColor) {  // not a comment
        block.fixBlockColor();
    }
};

SimpleCollaborator.prototype.onBlockDisconnected = function(id, pId, conn) {
    var block = this.getBlockFromId(id),
        scripts = block.parentThatIsA(ScriptsMorph);

    // TODO: This is not sizing the ring appropriately...
    scripts.add(block);
};

SimpleCollaborator.prototype.onAddListInput = function(id) {
    var block = this.getBlockFromId(id);
    block.addInput();
    this._updateBlockDefinitions(block);
};

SimpleCollaborator.prototype.onRemoveListInput = function(id) {
    var block = this.getBlockFromId(id);
    block.removeInput();
    this._updateBlockDefinitions(block);
};

SimpleCollaborator.prototype.onSetBlockSpec = function(id, spec) {
    var block = this.getBlockFromId(id);
    block.userSetSpec(spec);
    this._updateBlockDefinitions(block);
};

SimpleCollaborator.prototype.onSetField = function(pId, connId, value) {
    var parent = this.getBlockFromId(pId),
        block = parent.children[connId];

    console.assert(block instanceof InputSlotMorph,
        'Unexpected block type: ' + block.constructor);
    block.setContents(value);
    this._updateBlockDefinitions(block);
};

SimpleCollaborator.prototype.onSetCommentText = function(id, text) {
    var block = this.getBlockFromId(id);
    block.contents.text = text;
    block.contents.drawNew();
    block.contents.changed();
    block.layoutChanged();
    this._updateBlockDefinitions(block);
};

SimpleCollaborator.prototype.onSetSelector = function(id, sel) {
    var block = this.getBlockFromId(id);
    block.setSelector(sel);
    block.changed();
    this._updateBlockDefinitions(block);
};

SimpleCollaborator.prototype.onAddVariable = function(name, ownerId) {
    // Get the sprite or the stage
    var owner,
        isGlobal = ownerId === true;

    if (!isGlobal) {
        owner = this._owners[ownerId];
    } else {
        owner = this._owners[Object.keys(this._owners)[0]];
    }

    owner.addVariable(name, isGlobal)
    if (!owner.showingVariableWatcher(name, isGlobal)) {
        owner.toggleVariableWatcher(name, isGlobal);
    }

    var ide = owner.parentThatIsA(IDE_Morph);
    ide.flushBlocksCache('variables'); // b/c of inheritance
    ide.refreshPalette();
};

SimpleCollaborator.prototype.onDeleteVariable = function(name, ownerId) {
    var owner = this._owners[ownerId];
    owner.deleteVariable(name)
};

SimpleCollaborator.prototype.onRingify = function(id) {
    var block = this.getBlockFromId(id);

    if (block) {
        var ring = block.ringify();
        ring.id = this.newId();
        this._blocks[ring.id] = ring;
    }
    this._updateBlockDefinitions(block);
};

SimpleCollaborator.prototype.onUnringify = function(id) {
    var block = this.getBlockFromId(id);
    if (block) {
        var ring = block.unringify();
        delete this._blocks[ring.id];
    }
    this._updateBlockDefinitions(block);
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
    if (isNil(block.value)) {
        return;
    }
    block.reactToSliderEdit();
    this._updateBlockDefinitions(block);
};

////////////////////////// Custom Blocks //////////////////////////
SimpleCollaborator.prototype.onAddCustomBlock = function(id, ownerId, opts, creatorId) {
    var def = new CustomBlockDefinition(opts.spec),
        owner = this._owners[ownerId],
        ide = owner.parentThatIsA(IDE_Morph),
        stage = owner.parentThatIsA(StageMorph),
        addedReporter = false,
        editor,
        body;

    // Create the CustomBlockDefinition
    def = new CustomBlockDefinition(opts.spec);
    def.type = opts.blockType;
    def.category = opts.category;
    def.isGlobal = opts.isGlobal;
    def.id = id;
    if (def.type === 'reporter' || def.type === 'predicate') {
        var reporter = SpriteMorph.prototype.blockForSelector('doReport');
        reporter.id = this.newId();
        body = Process.prototype.reify.call(
            null,
            reporter,
            new List(),
            true // ignore empty slots for custom block reification
        );
        body.outerContext = null;
        def.body = body;
        addedReporter = true;
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


    if (addedReporter) {  // Add reporter to the _blocks dictionary
        var scripts,
            hat;

        // Update the reporter to the one in the editor
        editor = new BlockEditorMorph(def, owner);
        scripts = editor.body.contents;
        hat = scripts.children[0];
        reporter = hat.nextBlock();

        this._blocks[reporter.id] = reporter;
    }

    if (creatorId === this.id) {
        if (!editor) {
            editor = new BlockEditorMorph(def, owner);
        }
        editor.popUp();
    }
};

SimpleCollaborator.prototype.onDeleteCustomBlocks = function(ids, ownerId) {
    var collab = this;

    return ids.map(function(id) {
        collab.onDeleteCustomBlock(id, ownerId);
    });
};

SimpleCollaborator.prototype.onDeleteCustomBlock = function(id, ownerId) {
    var definition = this._customBlocks[id],
        rcvr = this._owners[ownerId],
        stage,
        ide,
        idx;

    rcvr.deleteAllBlockInstances(definition);
    if (definition.isGlobal) {
        stage = this.ide().stage;
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

SimpleCollaborator.prototype._getCustomCmdBlock = function(id) {
    var editor = this._getCustomBlockEditor(id),
        scripts = editor.body.contents,
        hat = detect(scripts.children,
            function(block) {return block instanceof PrototypeHatBlockMorph;}),
        customBlock = hat.inputs()[0];

    console.assert(hat.inputs().length === 1);

    return customBlock;
};

SimpleCollaborator.prototype._getFragment = function(id, index) {
    var customBlock = this._getCustomCmdBlock(id),
        frag = customBlock.children[index];

    return frag;
};

SimpleCollaborator.prototype.onUpdateBlockLabel = function(id, index, type, label) {
    var fragLabel = new BlockLabelFragment(label),
        fragment = this._getFragment(id, index),
        editor = fragment.parentThatIsA(BlockEditorMorph);

    fragLabel.type = type;
    fragment.updateBlockLabel(fragLabel);
    editor.updateDefinition();
};

SimpleCollaborator.prototype.onDeleteBlockLabel = function(id, index) {
    var fragment = this._getFragment(id, index),
        editor = fragment.parentThatIsA(BlockEditorMorph);

    fragment.fragment.isDeleted = true;
    fragment.updateBlockLabel(fragment.fragment);
    editor.updateDefinition();
};

SimpleCollaborator.prototype.onSetCustomBlockType = function(id, cat, type) {
    var customBlock = this._getCustomCmdBlock(id),
        hat = customBlock.parentThatIsA(PrototypeHatBlockMorph),
        editor = customBlock.parentThatIsA(BlockEditorMorph),
        definition = this._customBlocks[id];

    // Update the block definition and the hat block
    hat.blockCategory = definition.category = cat;
    hat.type = definition.type = type;
    editor.updateDefinition();
    customBlock.refreshPrototype();
};

////////////////////////// Sprites //////////////////////////
SimpleCollaborator.prototype.ide = function() {
    var ownerId = Object.keys(this._owners)[0];

    return this._owners[ownerId].parentThatIsA(IDE_Morph);
};

SimpleCollaborator.prototype._loadCostume = function(savedCostume, callback) {
    var model = this.serializer.parse(savedCostume),
        costume = this.serializer.loadValue(model),
        onLoad,
        wearCostume = function() {
            costume.loaded = true;
            if (onLoad) {
                onLoad();
            }
            callback(costume);
        };

    if (costume.loaded === true) {
        wearCostume();
    } else {
        onLoad = costume.loaded;
        costume.loaded = wearCostume;
    }
};

SimpleCollaborator.prototype.onAddSprite = function(opts, creatorId) {
    var ide = this.ide(),
        myself = this,
        sprite = new SpriteMorph(ide.globalVariables);

    sprite.name = opts.name;
    sprite.setCenter(ide.stage.center());
    ide.stage.add(sprite);
    ide.sprites.add(sprite);
    ide.corral.addSprite(sprite);

    // randomize sprite properties
    if (!opts.costume) {
        sprite.setHue(opts.hue);
        sprite.setBrightness(opts.brightness);
        sprite.turn(opts.dir);
    } else {
        this._loadCostume(opts.costume, function(costume) {
            costume.loaded = true;
            sprite.addCostume(costume);
            sprite.wearCostume(costume);
            ide.hasChangedMedia = true;
            myself._registerCostume(costume, sprite);
        });
    }

    if (opts.x !== undefined && opts.y !== undefined) {
        sprite.setXPosition(opts.x);
        sprite.setYPosition(opts.y);
    }

    if (creatorId === this.id) {
        ide.selectSprite(sprite);
    }

    this.registerOwner(sprite);
};

SimpleCollaborator.prototype.onRemoveSprite = function(spriteId) {
    var sprite = this._owners[spriteId];
    this.ide().removeSprite(sprite);
};

SimpleCollaborator.prototype.onDuplicateSprite = function(spriteId, x, y, creatorId) {
    var sprite = this._owners[spriteId],
        ide = this.ide(),
        dup = ide.duplicateSprite(sprite);

    dup.setPosition(new Point(x, y));
    dup.keepWithin(ide.stage);

    if (creatorId === this.id) {
        ide.selectSprite(dup);
    }
    this.registerOwner(dup);
};

SimpleCollaborator.prototype.onRenameSprite = function(spriteId, name) {
    var sprite = this._owners[spriteId],
        ide = this.ide();

    sprite.setName(name);
    // If current sprite is spriteId, update the spriteBar namefield
    if (ide.currentSprite === sprite) {
        ide.spriteBar.nameField.setContents(name);
    }
};

SimpleCollaborator.prototype.onToggleDraggable = function(spriteId, draggable) {
    var sprite = this._owners[spriteId],
        ide = this.ide();

    sprite.isDraggable = draggable;
    if (ide.currentSprite === sprite) {
        ide.spriteBar.padlock.refresh();
    }
};

SimpleCollaborator.prototype._registerCostume = function(costume, sprite) {
    costume.id = this.newId();
    this._costumes[costume.id] = costume;
    this._costumeToOwner[costume.id] = sprite;
};

SimpleCollaborator.prototype.onAddCostume = function(savedCostume, ownerId, creatorId) {
    var ide = this.ide(),
        wardrobeMorph,
        sprite = this._owners[ownerId],
        myself = this;

    // Get the wardrobe morph...
    this._loadCostume(savedCostume, function(cos) {
        sprite.addCostume(cos);
        if (ide.spriteEditor instanceof WardrobeMorph) {
            ide.spriteEditor.updateList();
        }
        if (ide && ide.currentSprite === sprite) {
            ide.currentSprite.wearCostume(cos);
        }

        myself._registerCostume(cos, sprite);

        if (creatorId === myself.id) {
            ide.spriteBar.tabBar.tabTo('costumes');
        }
    });
};

SimpleCollaborator.prototype.onUpdateCostume = function(id, savedCostume) {
    var ide = this.ide(),
        sprite = this._costumeToOwner[id],
        myself = this,
        world = ide.parentThatIsA(WorldMorph);

    this._loadCostume(savedCostume, function(cos) {
        var oldCostume = myself._costumes[id];
        oldCostume.rotationCenter = cos.rotationCenter;
        oldCostume.contents = cos.contents;
        oldCostume.version = Date.now();
        world.changed();

        if (ide.currentSprite === sprite) {
            ide.currentSprite.wearCostume(oldCostume);
        }
        ide.hasChangedMedia = true;
    });
};

SimpleCollaborator.prototype.onRemoveCostume = function(id) {
    var costume = this._costumes[id],
        sprite = this._costumeToOwner[id],
        idx = sprite.costumes.asArray().indexOf(costume),
        ide = this.ide(),
        wardrobe;

    sprite.costumes.remove(idx);

    // Check for the wardrobe
    if (ide.spriteEditor instanceof WardrobeMorph) {
        ide.spriteEditor.updateList();
    }

    if (sprite.costume === costume) {
        sprite.wearCostume(null);
    }

    delete this._costumes[id];
};

SimpleCollaborator.prototype.onRenameCostume = function(id, newName) {
    var costume = this._costumes[id],
        ide = this.ide();

    costume.name = newName;
    costume.version = Date.now();
    ide.hasChangedMedia = true;
    return costume;
};

SimpleCollaborator.prototype.onAddSound = function(serialized, ownerId, creatorId) {
    var owner = this._owners[ownerId],
        sound = this.serializer.loadValue(this.serializer.parse(serialized)),
        ide = this.ide();

    owner.addSound(sound);
    ide.hasChangedMedia = true;

    // register the sound
    sound.id = this.newId();
    this._sounds[sound.id] = sound;
    this._soundToOwner[sound.id] = owner;

    // update the ui
    if (creatorId === this.id) {
        ide.spriteBar.tabBar.tabTo('sounds');
    }

    if (ide.currentSprite === owner && ide.spriteEditor instanceof JukeboxMorph) {
        // TODO: Should refresh after the audio is loaded...
        // This is an issue in Snap!, too
        ide.spriteEditor.updateList();
    }
};

SimpleCollaborator.prototype.onRenameSound = function(id, name) {
    var sound = this._sounds[id],
        ide = this.ide();

    sound.name = name;
    sound.version = Date.now();

    if (ide.spriteEditor instanceof JukeboxMorph) {
        // TODO: Should refresh after the audio is loaded...
        // This is an issue in Snap!, too
        ide.spriteEditor.updateList();
    }

    ide.hasChangedMedia = true;
};

SimpleCollaborator.prototype.onRemoveSound = function(id) {
    var owner = this._soundToOwner[id],
        ide = this.ide(),
        idx = owner.sounds.asArray().indexOf(this._sounds[id]);
        
    owner.sounds.remove(idx);

    if (ide.spriteEditor instanceof JukeboxMorph) {
        ide.spriteEditor.updateList();
    }

    delete this._sounds[id];
    delete this._soundToOwner[id];
};

SimpleCollaborator.prototype.onSetStageSize = function(width, height) {
    this.ide().setStageExtent(new Point(width, height));
};

//////////////////// Import ////////////////////
SimpleCollaborator.prototype.onImportSprites = function(xmlString) {
    // TODO: Need to id the imported sprites and blocks...
    return this.ide().openSpritesString(xmlString);
};

SimpleCollaborator.prototype.onImportBlocks = function(aString, lbl) {
    // TODO: Record the block definitions (id them)
    // We should get the block ids first...
    return this.ide().openBlocksString(aString, lbl, true);
};

SimpleCollaborator.prototype.onImportMedia = function(aString) {
    // TODO: Need to id these new items...
    // Could I do the id-ing in the store.js file?
    return this.ide().openMediaString(aString);
};

/* * * * * * * * * * * * On Remote Events * * * * * * * * * * * */
SimpleCollaborator.prototype.onMessage = function(msg) {
    var method = this._getMethodFor(msg.type),
        accepted = true;

    if (this.isLeader) {
        // Verify that the lastSeen value is the same as the current
        accepted = this.lastSeen === (msg.id - 1);
        if (accepted) {
            this.acceptEvent(msg);
        }
    } else {
        if (this[method]) {
            logger.debug('received event:', msg);
            this[method].apply(this, msg.args);
            this.lastSeen = msg.id;
            this.idCount = 0;
        }
    }
};

SnapCollaborator = new SimpleCollaborator();
