/* global SnapCloud, StringMorph, DialogBoxMorph, localize, newCanvas, Point, Morph,
 Color, nop, InputFieldMorph, ListMorph, IDE_Morph, TurtleIconMorph, SnapActions,
 TextMorph, MorphicPreferences, ScrollFrameMorph, ReporterBlockMorph,
 MessageOutputSlotMorph, MessageInputSlotMorph, SymbolMorph, PushButtonMorph, MenuMorph,
 SpeechBubbleMorph, ProjectDialogMorph, HandleMorph, ReplayControls, fontHeight,
 AlignmentMorph, copy, TableDialogMorph, Table, TableMorph, WebSocketManager,
 TableFrameMorph*/
/* * * * * * * * * RoomMorph * * * * * * * * */
RoomMorph.prototype = new Morph();
RoomMorph.prototype.constructor = RoomMorph;
RoomMorph.uber = Morph.prototype;

RoomMorph.SIZE = 300;
RoomMorph.DEFAULT_ROLE = 'myRole';
RoomMorph.DEFAULT_ROOM = 'untitled';
RoomMorph.isSocketUuid = function(name) {
    return name && name[0] === '_';
};

RoomMorph.isValidName = function(name) {
    return !/[@\.]+/.test(name);
};

RoomMorph.isEmptyName = function(name) {
    return /^\s*$/.test(name);
};

var white = new Color(224, 224, 224);

function RoomMorph(ide) {
    this.init(ide);
}

RoomMorph.prototype.init = function(ide) {
    var myself = this;
    // Get the users at the room
    this.isReadOnly = false;
    this.ide = ide;
    this.displayedMsgMorphs = [];
    this.invitations = {};  // open invitations
    this.trace = {};

    this.ownerId = null;
    this.collaborators = [];
    RoomMorph.uber.init.call(this, true);

    // Set up the room name
    this.name = localize(RoomMorph.DEFAULT_ROOM);
    this.roomName = new StringMorph(
        this.name,
        18,
        null,
        true,
        false,
        false,
        null,
        null,
        white
    );
    this.roomName.mouseClickLeft = function() {
        myself.editRoomName();
    };

    this.ownerLabel = new StringMorph(
        localize('Owner: myself'),
        false,
        false,
        true,
        true,
        false,
        null,
        null,
        white
    );

    this.collabList = new StringMorph(
        localize('No collaborators'),
        false,
        false,
        true,
        true,
        false,
        null,
        null,
        white
    );
    this.nextRoom = null;  // next room info
    // The projectName is used for the roleId
    if (!this.ide.projectName) {
        this.ide.projectName = RoomMorph.DEFAULT_ROLE;
    }

    RoomMorph.uber.init.call(this);
    this.updateRoles(this.getDefaultRoles());
    this.add(this.roomName);
    this.add(this.ownerLabel);
    this.add(this.collabList);

    this.isDraggable = false;

    // Set the initial values
    // Shared messages array for when messages are sent to unoccupied roles
    this.sharedMsgs = [];

    this.blockHighlights = [];
};

RoomMorph.prototype.setReadOnly = function(value) {
    if (value !== this.isReadOnly) {
        this.isReadOnly = value;
        this.drawNew();
    }
};

RoomMorph.prototype.setRoomName = function(name) {
    this.name = name;
    this.roomName.text = name;
    this.roomName.changed();
    this.roomName.drawNew();
    this.roomName.changed();

    this.ide.controlBar.updateLabel();
};

RoomMorph.prototype.getDefaultRoles = function() {
    var roleInfo = {},
        name = this.getCurrentRoleName(),
        myRoleInfo = {
            uuid: this.myUuid(),
            username: SnapCloud.username || 'me'
        };

    roleInfo[name] = [myRoleInfo];
    return roleInfo;
};

RoomMorph.prototype.getCurrentRoleName = function() {
    var myself = this,
        roleNames = this.getRoleNames(),
        myUuid = myself.ide.sockets.uuid;

    // Look up the role name from the current room info
    return roleNames.find(function(name) {
        return myself.getCurrentOccupants(name).find(function(occupant) {
            return occupant.uuid === myUuid;
        });
    }) || this.ide.projectName;
};

RoomMorph.prototype.getRoleCount = function() {
    return this.getRoles().length;
};

RoomMorph.prototype.hasMultipleRoles = function() {
    return this.getRoleCount() > 1;
};

RoomMorph.prototype.getCurrentOccupants = function(name) {
    name = name || this.getCurrentRoleName();
    var role = this.getRole(name);

    return role.users.slice();
};

RoomMorph.prototype.isLeader = function() {
    return this.getCurrentOccupants().length === 1;
};

RoomMorph.prototype.myUuid = function() {
    return this.ide.sockets.uuid;
};

RoomMorph.prototype.myUserId = function() {
    return SnapCloud.username || localize('guest');
};

RoomMorph.prototype._onNameChanged = function(newName) {
    if (this.name !== newName) {
        this.ide.sockets.sendMessage({
            type: 'rename-room',
            name: newName
        });
    }
};

RoomMorph.prototype.isOwner = function(user) {
    if (RoomMorph.isSocketUuid(this.ownerId) && !user) {
        return this.ide.sockets.uuid === this.ownerId;
    }

    if (!user && this.ownerId === null) return true;

    user = user || SnapCloud.username;
    return this.ownerId && this.ownerId === user;
};

RoomMorph.prototype.isCollaborator = function(user) {
    user = user || SnapCloud.username;
    return this.collaborators.indexOf(user) > -1;
};

RoomMorph.prototype.isGuest = function(user) {
    return !(this.isOwner(user) || this.isCollaborator(user));
};

RoomMorph.prototype.isEditable = function() {
    return !this.isReadOnly && (this.isOwner() || this.isCollaborator());
};

RoomMorph.sameOccupants = function(list1, list2) {
    var uuids,
        usernames,
        otherUuids,
        otherUsernames,
        getUuid = function(role) {return role.uuid;},
        getUsername = function(role) {return role.username;};

    uuids = list1.map(getUuid);
    otherUuids = list2.map(getUuid);
    if (!RoomMorph.equalLists(uuids, otherUuids)) return false;

    usernames = list1.map(getUsername);
    otherUsernames = list2.map(getUsername);
    if (!RoomMorph.equalLists(usernames, otherUsernames)) return false;
    return true;
};

RoomMorph.equalLists = function(first, second) {
    if (first.length !== second.length) return false;
    for (var i = first.length; i--;) {
        if (first[i] !== second[i]) return false;
    }
    return true;
};

RoomMorph.prototype.update = function(ownerId, name, roles, collaborators) {
    var wasEditable = this.isEditable(),
        changed;

    changed = name && this.name !== name;
    if (changed) {
        this.setRoomName(name);
    }

    // Check if it has changed in a meaningful way
    changed = changed ||
        wasEditable !== this.isEditable();

    if (roles) {
        changed = this.updateRoles(roles) || changed;
    }

    if (collaborators) {
        changed = changed || !RoomMorph.equalLists(collaborators, this.collaborators);
        this.setCollaborators(collaborators || this.collaborators);
    }

    // Update the roles, etc
    if (ownerId) {
        changed = changed || ownerId !== this.ownerId;
        this.ownerId = ownerId;
    }

    // Check if current role name changed...
    this.ide.silentSetProjectName(this.getCurrentRoleName());

    if (changed) {
        this.version = Date.now();
        this.drawNew();
        this.fixLayout();
        this.changed();
    }

    // Update collaborative editing
    SnapActions.isLeader = this.isLeader();
};

RoomMorph.prototype.getRoleNames = function() {
    return this.getRoles().map(function(role) {
        return role.name;
    });
};

RoomMorph.prototype.getRoles = function() {
    return this.children.filter(function(child) {
        return child instanceof RoleMorph;
    });
};

RoomMorph.prototype.getRole = function(name) {
    //name = name || this.getCurrentRoleName();
    return this.getRoles().find(function(role) {
        return role.name === name;
    });
};

RoomMorph.prototype.updateRoles = function(roleInfo) {
    var myself = this,
        roles = this.getRoles(),
        changed = false,
        names;

    roles.forEach(function(role) {
        if (!roleInfo[role.name]) {
            role.destroy();
            changed = true;
        } else {
            // Update the occupants
            if (!RoomMorph.sameOccupants(role.users, roleInfo[role.name])) {
                role.setOccupants(roleInfo[role.name]);
            }
            delete roleInfo[role.name];
        }
    });

    names = Object.keys(roleInfo);
    names.forEach(function(name) {
        var role = new RoleMorph(
            name,
            roleInfo[name]
        );
        myself.add(role);
        changed = true;
    });

    return changed;
};

RoomMorph.prototype.getInnerHeight = function() {
    // Get the height of the morph w/o the owner, collaborator labels
    return (this.ownerLabel.top() - 10) - this.top();
};

RoomMorph.prototype.getRadius = function() {
    var innerHeight = this.getInnerHeight();
    return Math.min(this.width(), innerHeight)/2;
};

RoomMorph.prototype.getRoleSize = function() {
    // Compute the max size based on the angle
    // Given the angle, compute the distance between the points
    var roleCount = this.getRoles().length,
        angle = (2*Math.PI)/roleCount,
        radius = this.getRadius(),
        maxRoleSize = 150,
        minRoleGapSize = 10,
        startPoint,
        endPoint,
        roleSliceSize,  // given the number of roles
        quadrantSize,
        roleSize;

    startPoint = new Point(radius/2, 0);
    endPoint = (new Point(Math.cos(angle), Math.sin(angle))).multiplyBy(radius/2);
    roleSliceSize = startPoint.distanceTo(endPoint) - minRoleGapSize;
    quadrantSize = startPoint.distanceTo(new Point(0, radius/2)),

    roleSize = quadrantSize;
    if (angle < Math.PI/2) {
        roleSize = roleSliceSize;
    }
    return Math.min(roleSize, maxRoleSize);
};

RoomMorph.prototype.fixLayout = function() {
    // Position the roles
    var myself = this,
        roles = this.getRoles(),
        angleSize = 2*Math.PI/roles.length,
        angle = -Math.PI / 2 + this.index*angleSize,
        len = RoleMorph.COLORS.length,
        radius,
        position,
        circleSize,
        center,
        color,
        x,y,
        role;

    this.collabList.setCenter(this.center());
    this.collabList.setBottom(this.bottom() - 25);
    this.ownerLabel.setCenter(this.center());
    this.ownerLabel.setBottom(this.collabList.top() - 10);

    // Adjust the center...
    center = new Point(
        this.center().x,
        this.top() + this.getInnerHeight()/2
    );
    this.roomName.setCenter(center);

    radius = this.getRadius();
    circleSize = this.getRoleSize();
    for (var i = 0; i < roles.length; i++) {
        // position the label
        role = roles[i];
        angle = -Math.PI / 2 + i*angleSize,
        x = 0.65 * radius * Math.cos(angle);
        y = 0.65 * radius * Math.sin(angle);
        position = center.add(new Point(x, y));
        color = RoleMorph.COLORS[i%len];

        role.setExtent(new Point(circleSize, circleSize));
        role.setCenter(position);
        role.setColor(color);
    }

    // Update the positions of the message morphs
    this.displayedMsgMorphs.forEach(function(morph) {
        myself.updateDisplayedMsg(morph);
    });
};

RoomMorph.prototype.drawNew = function() {
    this.image = newCanvas(this.extent());

    // Update the title. Hide it if in replay mode
    if (this.isReadOnly) {
        this.roomName.hide();
    } else {
        this.roomName.show();
    }

    this.getRoles().forEach(function(morph) {
        morph.drawNew();
    });

    this.displayedMsgMorphs.forEach(function(morph) {
        morph.drawNew();
    });
};

RoomMorph.prototype.setOwner = function(owner) {
    this.ownerId = owner;
    this.ownerLabel.text = RoomMorph.isSocketUuid(this.ownerId) ?
        localize('myself') : this.ownerId;
    this.ownerLabel.changed();
    this.ownerLabel.drawNew();
    this.ownerLabel.changed();
};

RoomMorph.prototype.setCollaborators = function(collaborators) {
    this.collaborators = collaborators;
    if (this.collaborators.length) {
        this.collabList.text = localize('Collaborators') + ':\n' +
            this.collaborators.join(',\n');
    } else {
        this.collabList.text = 'No collaborators';
    }
    this.collabList.changed();
    this.collabList.drawNew();
    this.collabList.changed();

};

RoomMorph.prototype.mouseClickLeft = function() {
    if (!this.isEditable() && !this.isReadOnly) {
        // If logged in, prompt about leaving the room
        if (SnapCloud.username) {
            this.ide.confirm(
                localize('would you like to leave "' + this.name + '"?'),
                localize('Leave Room'),
                this.ide.newProject.bind(this.ide)
            );
        } else {
            this.ide.showMessage(localize('Please login before editing the room'));
        }
    }
};

RoomMorph.prototype.editRoomName = function () {
    var myself = this;
    if (!this.isEditable()) {
        return;
    }
    this.ide.prompt('New Room Name', function (name) {
        if (RoomMorph.isEmptyName(name)) return;  // empty name = cancel

        if (!RoomMorph.isValidName(name)) {
            // Error! name has a . or @
            new DialogBoxMorph().inform(
                'Invalid Project Name',
                'Could not set the project name because\n' +
                'the provided name is invalid',
                myself.world()
            );
        } else {
            myself.ide.sockets.sendMessage({
                type: 'rename-room',
                name: name,
                inPlace: true
            });
        }
    }, null, 'editRoomName');
};

RoomMorph.prototype.validateRoleName = function (name, cb) {
    if (RoomMorph.isEmptyName(name)) return;  // empty role name = cancel

    if (this.getRole(name)) {
        // Error! Role exists
        new DialogBoxMorph().inform(
            'Existing Role Name',
            'Could not rename role because\n' +
            'the provided name already exists.',
            this.world()
        );
    } else if (!RoomMorph.isValidName(name)) {
        // Error! name has a . or @
        new DialogBoxMorph().inform(
            'Invalid Role Name',
            'Could not change the role name because\n' +
            'the provided name is invalid',
            this.world()
        );
    } else {
        cb();
    }
};

RoomMorph.prototype.createNewRole = function () {
    // Ask for a new role name
    var myself = this;

    this.ide.prompt('New Role Name', function (roleName) {
        myself.validateRoleName(roleName, function() {
            myself._createNewRole(roleName);
        });
    }, null, 'createNewRole');
};

RoomMorph.prototype._createNewRole = function (name) {
    // Create the new role
    this.ide.sockets.sendMessage({
        type: 'add-role',
        name: name
    });
};

RoomMorph.prototype.editRole = function(name) {
    // Show a dialog of options
    //   + rename role
    //   + delete role
    //   + invite user (if unoccupied)
    //   + transfer ownership (if occupied)
    //   + evict user (if occupied)
    //   + change role (if owned by self)
    var users = this.getCurrentOccupants(name),
        dialog = new EditRoleMorph(this, name, users),
        world = this.world();

    dialog.fixLayout();
    dialog.drawNew();

    dialog.popUp(world);
    dialog.setCenter(world.center());
};

RoomMorph.prototype.editRoleName = function(role) {
    // Ask for a new role name
    var myself = this;
    this.ide.prompt('New Role Name', function (roleName) {
        myself.validateRoleName(roleName, function() {
            if (role !== roleName){
                myself.ide.sockets.sendMessage({
                    type: 'rename-role',
                    role: role,
                    name: roleName
                });
            }
        });
    }, null, 'editRoleName');
};

RoomMorph.prototype.moveToRole = function(dstId) {
    var myself = this,
        myRole = this.ide.projectName;

    SnapCloud.moveToRole(
        function(args) {
            myself.ide.showMessage('moved to ' + dstId + '!');
            myself.ide.projectName = dstId;
            myself.ide.source = 'cloud';

            var proj = args[0];
            // Load the project or make the project empty
            if (proj) {
                if (proj.SourceCode) {
                    myself.ide.droppedText(proj.SourceCode);
                } else {  // newly created role
                    myself.ide.newRole(dstId);
                }
                if (proj.Public === 'true') {
                    location.hash = '#present:Username=' +
                        encodeURIComponent(SnapCloud.username) +
                        '&ProjectName=' +
                        encodeURIComponent(proj.ProjectName);
                }
            } else {  // Empty the project FIXME
                myself.ide.newRole(dstId);
            }
        },
        function (err, lbl) {
            myself.ide.cloudError().call(null, err, lbl);
        },
        [dstId, myRole, this.ownerId, this.name]
    );
};

RoomMorph.prototype.deleteRole = function(role) {
    var myself = this;
    SnapCloud.deleteRole(
        function() {
            myself.ide.showMessage('deleted ' + role + '!');
        },
        function (err, lbl) {
            myself.ide.cloudError().call(null, err, lbl);
        },
        [role, this.ownerId, this.name]
    );
};

RoomMorph.prototype.createRoleClone = function(role) {
    var myself = this;
    SnapCloud.cloneRole(
        function() {
            myself.ide.showMessage('created copy of ' + role);
        },
        function (err, lbl) {
            myself.ide.cloudError().call(null, err, lbl);
        },
        [role, myself.ide.sockets.uuid]
    );
};

RoomMorph.prototype.role = function() {
    return this.ide.projectName;
};

RoomMorph.prototype.setRoleName = function(role) {
    role = role || 'untitled';
    if (role !== this.getCurrentRoleName()) {
        this.ide.sockets.sendMessage({
            type: 'rename-role',
            role: this.ide.projectName,
            name: role
        });
    }
};

RoomMorph.prototype.evictUser = function (user, role) {
    var myself = this;
    SnapCloud.evictUser(
        function() {
            myself.ide.showMessage('evicted ' + user.username + '!');
        },
        function (err, lbl) {
            myself.ide.cloudError().call(null, err, lbl);
        },
        [user.uuid, role, this.ownerId, this.name]
    );
};

RoomMorph.prototype.inviteUser = function (role) {
    var myself = this,
        callback;

    callback = function(friends) {
        friends = friends.map(function(friend) {
            return friend.username;
        });
        friends.unshift('myself');
        myself._inviteGuestDialog(role, friends);
    };

    if (this.isOwner() || this.isCollaborator()) {
        SnapCloud.getFriendList(callback,
            function (err, lbl) {
                myself.ide.cloudError().call(null, err, lbl);
            }
        );
    } else {
        callback([]);
    }
};

// Accessed from right-clicking the TextMorph
RoomMorph.prototype.promptShare = function(name) {
    var roles = this.getRoleNames(),
        choices = {},
        world = this.world(),
        myself = this;

    roles.splice(roles.indexOf(this.ide.projectName), 1);  // exclude myself
    for (var i = 0; i < roles.length; i++) {
        choices[roles[i]] = roles[i];
    }

    // any roles available?
    if (Object.keys(roles).length) {
        // show user available roles
        var dialog = new DialogBoxMorph();
        dialog.prompt('Send to...', '', world, false, choices);
        dialog.accept = function() {
            var choice = dialog.getInput();
            if (roles.indexOf(choice) !== -1) {
                if (myself.getRole(choice)) {  // occupied
                    myself.ide.sockets.sendMessage({
                        type: 'share-msg-type',
                        roleId: choice,
                        from: myself.ide.projectName,
                        name: name,
                        fields: myself.ide.stage.messageTypes.getMsgType(name).fields
                    });
                    myself.ide.showMessage('Successfully sent!', 2);
                } else {  // not occupied, store in sharedMsgs array
                    myself.sharedMsgs.push({
                        roleId: choice,
                        msg: {name: name, fields: myself.ide.stage.messageTypes.getMsgType(name).fields},
                        from: myself.ide.projectName
                    });
                    myself.ide.showMessage('The role will receive this message type on next occupation.', 2);
                }
            } else {
                myself.ide.showMessage('There is no role by the name of \'' + choice + '\'!', 2);
            }
            this.destroy();
        };
    } else {  // notify user no available recipients
        myself.ide.showMessage('There are no other roles in the room!', 2);
    }
};

RoomMorph.prototype._inviteGuestDialog = function (role, friends) {
    new UserDialogMorph(this, function(user) {
        if (user) {
            this.inviteGuest(user, role);
        }
    }, friends).popUp();
};

RoomMorph.prototype.inviteGuest = function (friend, role) {
    // Use inviteGuest service
    var socketId = this.ide.sockets.uuid;
    if (friend === 'myself') {
        friend = SnapCloud.username;
    }
    SnapCloud.inviteGuest(socketId, friend, this.ownerId, this.name, role);
};

RoomMorph.prototype.promptInvite = function (params) {  // id, room, roomName, role
    // Create a confirm dialog about joining the group
    var myself = this,
        // unpack the params
        id = params.id,
        role = params.role,
        roomName = params.roomName,

        action = this._invitationResponse.bind(this, id, true, role),
        dialog = new DialogBoxMorph(null, action),
        msg;

    if (params.inviter === SnapCloud.username) {
        msg = 'Would you like to move to "' + roomName + '"?';
    } else {
        msg = params.inviter + ' has invited you to join\nhim/her at "' + roomName +
            '"\nAccept?';
    }

    dialog.cancel = function() {
        myself._invitationResponse(id, false, role);
        delete myself.invitations[id];
        this.destroy();
    };

    dialog.askYesNo(
        'Room Invitation',
        localize(msg),
        this.ide.world()
    );
    this.invitations[id] = dialog;
};

RoomMorph.prototype._invitationResponse = function (id, response, role) {
    var myself = this;
    SnapCloud.invitationResponse(
        id,
        response,
        function (args) {
            if (response) {
                var proj = args[0];
                // Load the project or make the project empty
                if (proj) {
                    myself.ide.source = 'cloud';
                    myself.ide.droppedText(proj.SourceCode);
                    if (proj.Public === 'true') {
                        location.hash = '#present:Username=' +
                            encodeURIComponent(SnapCloud.username) +
                            '&ProjectName=' +
                            encodeURIComponent(proj.ProjectName);
                    }
                } else {  // Empty the project
                    myself.ide.newRole(role);
                }
                myself.ide.showMessage('you have joined the room!', 2);
                myself.ide.silentSetProjectName(role);  // Set the role name FIXME
            }
            SnapCloud.disconnect();
        },
        function(err) {
            myself.ide.showMessage(err, 2);
        }
    );
};

RoomMorph.prototype.checkForSharedMsgs = function(role) {
    // Send queried messages if possible
    for (var i = 0 ; i < this.sharedMsgs.length; i++) {
        if (this.sharedMsgs[i].roleId === role) {
            this.ide.sockets.sendMessage({
                type: 'share-msg-type',
                name: this.sharedMsgs[i].msg.name,
                fields: this.sharedMsgs[i].msg.fields,
                from: this.sharedMsgs[i].from,
                roleId: role
            });
            this.sharedMsgs.splice(i, 1);
            i--;
        }
    }
};

RoomMorph.prototype.showMessage = function(msg, msgIndex) {
    var myself = this;

    // Get the source role
    var address = msg.srcId.split('@');
    var relSrcId = address.shift();
    var projectId = address.join('@');

    // This will have problems if the role name has been changed...

    // Get the target role(s)
    var relDstIds = msg.recipients
        .filter(function(id) {  // in the current project
            var address = id.split('@');
            var roleId = address.shift();
            var inCurrentProject = address.join('@') === projectId;
            var stillExists = !!myself.getRole(roleId);
            return inCurrentProject && stillExists;
        })
        .map(function(id) {
            return id.split('@').shift();
        });

    // If they are both in the room and they both exist, animate the message
    if (this.getRole(relSrcId)) {
        // get a message for each
        relDstIds.forEach(function(dstId) {
            myself.showSentMsg(msg, relSrcId, dstId, msgIndex);
        });
    }
};

RoomMorph.prototype.showSentMsg = function(msg, srcId, dstId, msgLabel) {
    var srcRole = this.getRole(srcId),
        dstRole = this.getRole(dstId),
        relEndpoint = dstRole.center().subtract(srcRole.center()),
        msgMorph = new SentMessageMorph(msg, srcId, dstId, relEndpoint, msgLabel);

    this.addBack(msgMorph);
    this.displayedMsgMorphs.push(msgMorph);
    this.updateDisplayedMsg(msgMorph);

    // If the message is sent to the current role, highlight the blocks
    // that handled the message

    this.clearBlockHighlights();
    if (dstId === this.getCurrentRoleName()) {
        var stage = this.ide.stage,
            blocks = stage.children.concat(stage)
                .map(function (morph) {
                    var blocks = [];
                    if (morph instanceof SpriteMorph || morph instanceof StageMorph) {
                        blocks = morph.allHatBlocksForSocket(msg.msgType);
                    }
                    return blocks;
                })
                .reduce(function(l1, l2) {
                    return l1.concat(l2);
                }, []);

        this.blockHighlights = blocks.map(function(block) {
            return block.addHighlight();
        });
    }

    // Only update the inspector if there are
    if (this.messageInspector) {
        if (!msgLabel) {
            this.messageInspector.setMessage(msgMorph.message);
        } else {  // close the message inspector
            this.messageInspector.destroy();
            this.messageInspector = null;
        }
    }
};

RoomMorph.prototype.updateDisplayedMsg = function(msg) {
    // Update the msg morph position and size
    var srcRole = this.getRole(msg.srcRoleName),
        dstRole = this.getRole(msg.dstRoleName),
        srcPoint = srcRole.center(),
        dstPoint = dstRole.center(),
        relEndpoint = dstPoint.subtract(srcPoint),
        roleRadius = this.getRoleSize()/2,
        size;

    // move the relEndpoint so that it doesn't overlap the roles
    var dist = dstPoint.distanceTo(srcPoint),
        targetDist = dist - 2*roleRadius;

    relEndpoint = relEndpoint.scaleBy(targetDist/dist);

    size = relEndpoint.abs().add(2*msg.padding);
    msg.setExtent(size);
    msg.setCenter(dstPoint.add(srcPoint).divideBy(2));
    msg.endpoint = relEndpoint;
    msg.setMessageColor(srcRole.color.darker());
    msg.drawNew();
};

RoomMorph.prototype.clearBlockHighlights = function() {
    this.blockHighlights.forEach(function(highlight) {
        var block = highlight.parent;
        if (block && block.getHighlight() === highlight) {
            block.removeHighlight();
        }
    });
    this.blockHighlights = [];
};

RoomMorph.prototype.hideSentMsgs = function() {
    this.displayedMsgMorphs.forEach(function(msgMorph) {
        msgMorph.destroy();
    });
    this.displayedMsgMorphs = [];
};

RoomMorph.prototype.isCapturingTrace = function() {
    return this.trace.startTime && !this.trace.endTime;
};

RoomMorph.prototype.isReplayingTrace = function() {
    return !!this.trace.replayer;
};

RoomMorph.prototype.startTraceReplay = function(replayer) {
    this.setReadOnly(true);

    replayer.setMessages(this.trace.messages);
    this.trace.replayer = replayer;
};

RoomMorph.prototype.stopTraceReplay = function() {
    this.hideSentMsgs();
    this.clearBlockHighlights();
    this.setReadOnly(false);
    this.trace.replayer = null;
    if (this.messageInspector) {
        this.messageInspector.destroy();
        this.messageInspector = null;
    }
};

RoomMorph.prototype.resetTrace = function() {
    this.trace = {};
};

RoomMorph.prototype.startTrace = function() {
    var ide = this.ide,
        url = ide.resourceURL('api', 'trace', 'start', ide.sockets.uuid),
        startTime = +ide.getURL(url);

    this.trace = {startTime: startTime};
};

RoomMorph.prototype.endTrace = function() {
    this.trace.endTime = Date.now();
    this.trace.messages = this.getMessagesForTrace();

    if (this.trace.messages.length === 0) {
        this.ide.showMessage('No messages captured', 2);
        this.resetTrace();
    }
};

RoomMorph.prototype.getMessagesForTrace = function() {
    var ide = this.ide;
    var url = ide.resourceURL('api', 'trace', 'end', ide.sockets.uuid);
    var messages = [];

    // Update this to request start/end times
    try {
        messages = JSON.parse(ide.getURL(url));
    } catch(e) {
        ide.showMessage('Failed to retrieve messages', 2);
        this.resetTrace();
        throw e;
    }

    return messages;
};

RoomMorph.prototype.inspectMessage = function(msg) {
    this.messageInspector = new MessageInspectorMorph(msg);
    this.messageInspector.popUp(this.world());
};

//////////// SentMessageMorph ////////////
// Should:
//  - draw an arrow from the source to the destination
//  - not be draggable
SentMessageMorph.prototype = new Morph();
SentMessageMorph.prototype.constructor = SentMessageMorph;
SentMessageMorph.uber = Morph.prototype;

function SentMessageMorph(msg, srcId, dstId, endpoint, label) {
    this.init(msg, srcId, dstId, endpoint, label);
}

SentMessageMorph.prototype.init = function(msg, srcId, dstId, endpoint, label) {
    this.srcRoleName = srcId;
    this.dstRoleName = dstId;
    this.padding = 10;

    this.endpoint = endpoint;
    this.message = new MessageMorph(msg.msgType, msg.content);
    SentMessageMorph.uber.init.call(this);

    this.label = null;
    if (label) {
        this.label = new StringMorph(
            label.toString(),
            18,
            null,
            null,
            true
        );
        this.label.color = white;
        this.label.drawNew();
        this.add(this.label);
    }
    this.color = white;
    this.add(this.message);
};

SentMessageMorph.prototype.drawNew = function() {
    this.image = newCanvas(this.extent());
    var context = this.image.getContext('2d'),
        isRight = this.endpoint.x > 0,
        isDownwards = this.endpoint.y > 0,
        startX = isRight ? 0 : -this.endpoint.x,
        startY = isDownwards ? 0 : -this.endpoint.y,
        start = new Point(startX, startY),
        end;

    // Get the startpoint (depends on the sign of the x,y values)
    start = start.add(this.padding);
    end = start.add(this.endpoint);

    // Draw a line from the current position to the endpoint
    context.strokeStyle = this.color.toString();
    context.fillStyle = this.color.toString();
    context.lineWidth = 2.5;

    context.beginPath();
    context.setLineDash([5, 5]);
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.stroke();

    context.beginPath();
    context.setLineDash([]);

    // Draw an arrow at the end
    var da = Math.PI/6,
        angle = Math.atan2(this.endpoint.y, this.endpoint.x) + Math.PI,
        size = 7.5,
        relLeftPoint = new Point(Math.cos(angle-da), Math.sin(angle-da)).multiplyBy(size),
        relRightPoint = new Point(Math.cos(angle+da), Math.sin(angle+da)).multiplyBy(size),
        leftPoint = end.add(relLeftPoint),
        rightPoint = end.add(relRightPoint);

    context.moveTo(end.x, end.y);
    context.lineTo(leftPoint.x, leftPoint.y);
    context.lineTo(rightPoint.x, rightPoint.y);
    context.lineTo(end.x, end.y);
    context.stroke();
    context.fill();

    this.fixLayout();
};

SentMessageMorph.prototype.fixLayout = function() {
    // position the message icon
    this.message.setCenter(this.center());
    if (this.label) {
        var padding = 5;

        // align just to the right of the message morph
        this.label.setCenter(this.message.center());
        this.label.setRight(this.message.left() - 5)
    }
};

SentMessageMorph.prototype.setMessageColor = function(color) {
    this.message.icon.setColor(color);
};

MessageMorph.prototype = new Morph();
MessageMorph.prototype.constructor = MessageMorph;
MessageMorph.uber = Morph.prototype;

function MessageMorph(type, contents) {
    this.init(type, contents);
}

MessageMorph.prototype.init = function (type, contents) {
    this.msgType = type;
    this.contents = contents;

    MessageMorph.uber.init.call(this);
    this.setColor(IDE_Morph.prototype.groupColor);
    this.icon = new SymbolMorph('mail', 25);
    this.icon.setHeight(15);
    this.icon.drawNew();

    this.label = new StringMorph(
        type,
        12,
        null,
        null,
        true
    );
    this.label.color = white;
    this.label.drawNew();

    this.add(this.label);
    this.add(this.icon);

    this.fixLayout();
};

MessageMorph.prototype.fixLayout = function () {
    this.icon.setCenter(this.center());
    this.icon.setTop(this.top());

    this.label.setCenter(this.center());
    this.label.setBottom(this.bottom());
};

MessageMorph.prototype.getTableContents = function () {
    var myself = this,
        fields = Object.keys(this.contents),
        table = new Table(2, fields.length);

    fields.forEach(function(field, index) {
        table.contents[index][0] = field;
        table.contents[index][1] = myself.deserializeData([myself.contents[field]])[0];
    });
    table.colNames.push('field');
    table.colNames.push('value');

    return table;
};

MessageMorph.prototype.deserializeData =
    WebSocketManager.prototype.deserializeData;

MessageMorph.prototype.mouseClickLeft = function () {
    var room = this.parentThatIsA(RoomMorph);

    room.inspectMessage(this);
};

MessageInspectorMorph.prototype = Object.create(TableDialogMorph.prototype);
MessageInspectorMorph.prototype.constructor = MessageInspectorMorph;
MessageInspectorMorph.uber = TableDialogMorph.prototype;

function MessageInspectorMorph(message) {
    this.init(message);
}

MessageInspectorMorph.prototype.init = function (message) {
    MessageInspectorMorph.uber.init.call(this, message.getTableContents());
    this.key = 'inspectNetworkMessage';

    this.labelString = localize('Contents of') + ' "' + message.msgType + '"';
    this.createLabel();
};

MessageInspectorMorph.prototype.setInitialDimensions = function () {
    var world = this.world(),
        mex = world.extent().subtract(new Point(this.padding, this.padding)),
        th = fontHeight(this.titleFontSize) + this.titlePadding * 3, // hm...
        minWidth = Math.max(100, this.label.width() + 2*margin),
        bh = this.buttons.height(),
        margin = 10;

    this.setExtent(
        this.tableView.globalExtent().add(
            new Point(this.padding * 2, this.padding * 2 + th + bh)
        ).min(mex).max(new Point(minWidth, 100))
    );
    this.setCenter(this.world().center());
};

MessageInspectorMorph.prototype.setMessage = function (message) {
    this.tableView = new TableMorph(message.getTableContents());

    this.labelString = localize('Contents of') + ' "' + message.msgType + '"';
    this.createLabel();

    this.addBody(new TableFrameMorph(this.tableView, true));
    this.drawNew();
};

//////////// Network Replay Controls ////////////
NetworkReplayControls.prototype = Object.create(ReplayControls.prototype);
NetworkReplayControls.prototype.constructor = NetworkReplayControls;
NetworkReplayControls.uber = ReplayControls.prototype;

function NetworkReplayControls() {
    this.init();
}

NetworkReplayControls.prototype.init = function() {
    NetworkReplayControls.uber.init.call(this);
    this.displayedMsgCount = 1;
};

NetworkReplayControls.prototype.displayCaption = function(/*event*/) {
    // for now, we will not display any captions
};

NetworkReplayControls.prototype.setMessages = function(messages) {
    return this.setActions(messages);
};

NetworkReplayControls.prototype.applyEvent = function(event, next) {
    this.updateDisplayedMessages();
    next();
};

NetworkReplayControls.prototype.updateDisplayedMessages = function() {
    var ide = this.parentThatIsA(IDE_Morph),
        room = ide.room,
        event = this.actions[this.actionIndex];

    // Clear the last message(s)
    room.hideSentMsgs();

    if (!event) return;

    // Make sure that the slider position is at the current event
    var value = this.getSliderPosition(event);

    this.slider.button.setLeft(this.getSliderLeftFromValue(value));
    this.slider.updateValue();

    if (this.displayedMsgCount > 1) {
        var displayedMsgCount = Math.min(this.displayedMsgCount, this.actionIndex+1),
            startIndex = this.actionIndex - displayedMsgCount + 1;

        // Show each message
        for (var i = 0; i < displayedMsgCount; i++) {
            event = this.actions[startIndex+i];
            room.showMessage(event, i+1);
        }
    } else {
        room.showMessage(event);
    }
};

NetworkReplayControls.prototype.settingsMenu = function() {
    var myself = this,
        menu = NetworkReplayControls.uber.settingsMenu.call(this),
        submenu = new MenuMorph(myself),
        counts = [1, 2, 3, 4, 5];

    counts.forEach(function(count) {
        var suffix = count === 1 ? 'message' : 'messages';
        submenu.addItem(count + ' ' + localize(suffix), function() {
            myself.displayedMsgCount = count;
            myself.updateDisplayedMessages();
        }, null, null, myself.displayedMsgCount === count);
    });
    menu.addMenu('Displayed Message Count...', submenu);

    menu.drawNew();
    return menu;
};

NetworkReplayControls.prototype.getColorForTick = function(event) {
    var ide = this.parentThatIsA(IDE_Morph),
        room = ide.room,
        srcId = event.srcId.split('@').shift(),
        role = room.getRole(srcId);


    if (role) {
        return role.color;
    }
};

NetworkReplayControls.prototype.getInverseEvent = function(event) {
    var inverseEvent = copy(event);
    inverseEvent.isInverse = true;
    return inverseEvent;
};

RoleMorph.prototype = new Morph();
RoleMorph.prototype.constructor = RoleMorph;
RoleMorph.uber = Morph.prototype;
RoleMorph.COLORS = [
    new Color(74, 108, 212),
    new Color(217, 77, 17).lighter(),
    new Color(207, 74, 217),
    new Color(0, 161, 120),
    new Color(143, 86, 227),
    new Color(230, 168, 34),
    new Color(4, 148, 220),
    new Color(98, 194, 19),
    new Color(243, 118, 29),
    new Color(150, 150, 150)
].map(function(color) {
    return color.darker();
});

// The role morph needs to know where to draw itself
function RoleMorph(name, user) {
    this.init(name, user);
}

RoleMorph.prototype.init = function(name, users) {
    RoleMorph.uber.init.call(this, true);
    this.name = name;
    this.users = [];

    this.label = new StringMorph(
        this.name,
        15,
        null,
        true,
        false,
        false,
        null,
        null,
        white
    );
    this.label.mouseClickLeft = function() {
        var room = this.parentThatIsA(RoomMorph);
        if (room.isEditable()) {
            room.editRoleName(this.text);
        }
    };

    this.label.mouseEnter = function() {
        var room = this.parentThatIsA(RoomMorph);
        if (room.isEditable()) {
            this.setFontSize(17);
        }
    };
    this.label.mouseLeave = function() {
        this.setFontSize(15);
    };

    this.caption = new StringMorph(
        '',
        14,
        null,
        false,
        true,
        false,
        null,
        null,
        white
    );
    this.add(this.label);
    this.add(this.caption);
    this.acceptsDrops = true;
    this.setOccupants(users);
    this.drawNew();
};

RoleMorph.prototype.wantsDropOf = function(aMorph) {
    return aMorph instanceof ReporterBlockMorph && aMorph.forMsg;
};

RoleMorph.prototype.setOccupants = function(users) {
    this.users = users;
    // Update the contents of the caption
    var userText = '<empty>';
    if (this.users.length) {
        userText = this.users.map(function(user){
            return user.username || localize('guest');
        }).join(', ');
    }

    this.caption.text = userText;
    this.caption.changed();
    this.caption.drawNew();
    this.caption.changed();
};

RoleMorph.prototype.setName = function(name) {
    this.name = name;
    this.label.text = name;
    this.label.changed();
    this.label.drawNew();
    this.label.changed();
};

RoleMorph.prototype.drawNew = function() {
    var room = this.parentThatIsA(RoomMorph),
        center,
        height,
        radius,
        cxt;

    if (room && room.isReadOnly) {
        this.caption.hide();
    } else {
        this.caption.show();
    }

    this.fixLayout();
    height = Math.max(this.height() - this.caption.height(), 0);
    radius = Math.min(this.width(), height)/2;
    center = new Point(this.width()/2-radius, height/2-radius).add(radius),

    // Create the image
    this.image = newCanvas(this.extent());
    cxt = this.image.getContext('2d');

    cxt.beginPath();
    cxt.fillStyle = this.color.toString();
    cxt.arc(center.x, center.y, radius, 0, 2 * Math.PI, false);
    cxt.closePath();
    cxt.fill();
    cxt.strokeStyle = this.color.darker(50).toString();
    cxt.stroke();

    this.changed();
};

RoleMorph.prototype.fixLayout = function() {
    var center = this.center();
    this.label.setCenter(new Point(center.x, center.y - this.caption.height()/2));
    this.caption.setCenter(center);
    this.caption.setBottom(this.bottom());
};

RoleMorph.prototype.mouseClickLeft = function() {
    var room = this.parentThatIsA(RoomMorph);
    if (room.isEditable()) {
        room.editRole(this.name);
    } else {
        this.escalateEvent('mouseClickLeft');
    }
};

RoleMorph.prototype.reactToDropOf = function(drop) {
    // Message palette drag-and-drop
    if (drop instanceof ReporterBlockMorph && drop.forMsg) {
        shareMsgType(this, drop.blockSpec, this.parent.ide.stage.messageTypes.getMsgType(drop.blockSpec).fields);
    }

    // Block drag-and-drop (hat/command message blocks)
    if (drop.selector === 'receiveSocketMessage' || drop.selector === 'doSocketMessage') {
        // find message morph
        var msgMorph;
        for (var i = 0; i < drop.children.length; i++) {
            if (drop.children[i] instanceof MessageOutputSlotMorph || drop.children[i] instanceof MessageInputSlotMorph) {
                msgMorph = drop.children[i];
                break;
            }
        }

        if (msgMorph.children[0].text !== '') {  // make sure there is a message type to send...
            shareMsgType(this, msgMorph.children[0].text, msgMorph.msgFields);
        }
    }

    // Share the intended message type
    function shareMsgType(myself, name, fields) {
        if (myself.users.length && myself.parent.ide.projectName === myself.name) {  // occupied & myself
            myself.parent.ide.showMessage('Can\'t send a message type to yourself!', 2);
            return;
        }
        if (myself.users && myself.parent.ide.projectName !== myself.name) {  // occupied & not myself
            myself.parent.ide.sockets.sendMessage({
                type: 'share-msg-type',
                roleId: myself.name,
                from: myself.parent.ide.projectName,
                name: name,
                fields: fields
            });
            myself.parent.ide.showMessage('Successfully sent!', 2);
        } else {  // not occupied, store in sharedMsgs array
            myself.parent.sharedMsgs.push({
                roleId: myself.name,
                msg: {name: name, fields: fields},
                from: myself.parent.ide.projectName
            });
            myself.parent.ide.showMessage('The role will receive this message type on next occupation.', 2);
        }
    }
    drop.destroy();
};

EditRoleMorph.prototype = new DialogBoxMorph();
EditRoleMorph.prototype.constructor = EditRoleMorph;
EditRoleMorph.uber = DialogBoxMorph.prototype;
function EditRoleMorph(room, name, users) {
    this.init(room, name, users);
}

EditRoleMorph.prototype.init = function(room, name, users) {
    EditRoleMorph.uber.init.call(this);
    this.room = room;
    this.name = name;
    this.users = users;

    var txt = new TextMorph(
        'What would you like to do?',
        null,
        null,
        true,
        false,
        'center',
        null,
        null,
        MorphicPreferences.isFlat ? null : new Point(1, 1),
        white
    );

    this.labelString = localize('Edit') + ' ' + name;
    this.createLabel();
    this.addBody(txt);

    // Role Actions
    this.addButton('createRoleClone', 'Duplicate');

    if (users.length) {  // occupied
        // owner can evict collaborators, collaborators can evict guests

        if (name !== this.room.role()) {
            this.addButton('moveToRole', 'Move to');
        }
        this.addButton('inviteUser', 'Invite User');

        if (name !== this.room.role() &&  // can't evict own role
            (this.room.isOwner() || this.room.isGuest(users))) {
            this.addButton('evictUser', 'Evict User');
        }
    } else {  // vacant
        this.addButton('moveToRole', 'Move to');
        this.addButton('inviteUser', 'Invite User');
        this.addButton('deleteRole', 'Delete role');
    }
    this.addButton('cancel', 'Cancel');
};

EditRoleMorph.prototype.inviteUser = function() {
    this.room.inviteUser(this.name);
    this.destroy();
};

EditRoleMorph.prototype.fixLayout = function() {
    var center = this.center();

    EditRoleMorph.uber.fixLayout.call(this);

    if (this.label) {
        this.label.setLeft(center.x - this.label.width()/2);
    }

    if (this.body) {
        this.body.setLeft(center.x - this.body.width()/2);
    }
};

EditRoleMorph.prototype.editRoleName = function() {
    this.room.editRoleName(this.name);
    this.destroy();
};

EditRoleMorph.prototype.createRoleClone = function() {
    this.room.createRoleClone(this.name);
    this.destroy();
};

EditRoleMorph.prototype.deleteRole = function() {
    this.room.deleteRole(this.name);
    this.destroy();
};

EditRoleMorph.prototype.moveToRole = function() {
    this.room.moveToRole(this.name);
    this.destroy();
};

EditRoleMorph.prototype.evictUser = function() {
    // TODO: which user?
    // FIXME: ask which user
    // This could be moved to clicking on the username
    this.room.evictUser(this.users[0], this.name);
    this.destroy();
};

// RoomEditorMorph ////////////////////////////////////////////////////////////

// I am an editor for the RoomMorph and network debugger

RoomEditorMorph.prototype = new ScrollFrameMorph();
RoomEditorMorph.prototype.constructor = RoomEditorMorph;
RoomEditorMorph.uber = ScrollFrameMorph.prototype;

function RoomEditorMorph(room, sliderColor) {
    this.init(room, sliderColor);
}

RoomEditorMorph.prototype.init = function(room, sliderColor) {
    RoomEditorMorph.uber.init.call(this, null, null, sliderColor);

    this.palette = this.createMsgPalette();
    this.add(this.palette);

    this.room = room;
    this.add(room);

    // Check for queried shared messages
    this.room.checkForSharedMsgs(this.room.getCurrentRoleName());

    // Replay Controls
    if (this.room.isReplayingTrace()) {
        this.replayControls = this.room.trace.replayer;
    } else {
        this.replayControls = new NetworkReplayControls(this);
        this.replayControls.hide();
    }

    this.add(this.replayControls);
    this.replayControls.drawNew();

    var button = new PushButtonMorph(
        this.room,
        'createNewRole',
        new SymbolMorph('plus', 12)
    );
    button.padding = 0;
    button.corner = 12;
    button.color = IDE_Morph.prototype.groupColor;
    button.highlightColor = IDE_Morph.prototype.frameColor.darker(50);
    button.pressColor = button.highlightColor;
    button.labelMinExtent = new Point(36, 18);
    button.labelShadowOffset = new Point(-1, -1);
    button.labelShadowColor = button.highlightColor;
    button.labelColor = TurtleIconMorph.prototype.labelColor;
    button.contrast = this.buttonContrast;
    button.drawNew();

    button.hint = 'Add a role to the room';

    button.fixLayout();

    this.add(button);
    this.addRoleBtn = button;

    this.room.drawNew();
    this.updateControlButtons();

    this.acceptsDrops = false;
    this.contents.acceptsDrops = false;
};

RoomEditorMorph.prototype.step = function() {
    if (this.version !== this.room.version) {
        this.updateControlButtons();
        this.version = this.room.version;
    }

    var stage = this.room.ide.stage;
    if (this.palette.version !== stage.messageTypes.version) {
        this.updateMsgPalette();
    }
};

RoomEditorMorph.prototype.show = function() {
    RoomEditorMorph.uber.show.call(this);
    if (!this.isReplayMode()) {
        this.replayControls.hide();
    }
};

RoomEditorMorph.prototype.updateControlButtons = function() {
    var sf = this.parentThatIsA(ScrollFrameMorph);

    if (!sf) {return; }

    if (sf.toolBar) {
        sf.removeChild(sf.toolBar);
        this.changed();
    }
    sf.toolBar = this.addToggleReplay();
    sf.add(sf.toolBar);

    //sf.toolBar.isVisible = !this.replayControls.enabled;
    sf.toolBar.drawNew();
    sf.toolBar.changed();

    sf.adjustToolBar();
    this.updateRoomControls();
};

RoomEditorMorph.prototype.addToggleReplay = function() {
    var myself = this,
        toolBar = new AlignmentMorph(),
        shade = (new Color(140, 140, 140)),
        recordSymbol = new SymbolMorph('circleSolid', 14),
        stopRecordSymbol = new SymbolMorph('square', 14),
        enterSymbol = new SymbolMorph('pointRight', 14),
        exitSymbol = new SymbolMorph('square', 14);

    if (this.hasNetworkRecording()) {
        var replayButton = new PushButtonMorph(
            this,
            function() {
                // FIXME: change this when we have an exit button on the replay slider
                if (this.isReplayMode()) {
                    myself.exitReplayMode();
                } else {
                    myself.enterReplayMode();
                }
                myself.updateControlButtons();
            },
            this.isReplayMode() ? exitSymbol : enterSymbol,
            null,

            this.isReplayMode() ? localize('Exit network trace replayer') :
                localize('View last network trace')
        );
        replayButton.alpha = 0.2;
        replayButton.labelShadowColor = shade;
        replayButton.drawNew();
        replayButton.fixLayout();

        toolBar.replayButton = replayButton;
        toolBar.add(replayButton);
    }

    var recordButton = new PushButtonMorph(
        this,
        function() {
            myself.toggleRecordMode();
            myself.updateControlButtons();
        },
        this.isRecording() ? stopRecordSymbol : recordSymbol,
        null,
        this.isRecording() ? localize('Stop capturing network trace') :
            localize('Start capturing network trace')
    );
    recordButton.labelColor = new Color(125, 0, 0);
    recordButton.alpha = 0.2;
    recordButton.labelShadowColor = shade;
    recordButton.drawNew();
    recordButton.fixLayout();

    toolBar.recordButton = recordButton;
    toolBar.add(recordButton);

    return toolBar;
};

RoomEditorMorph.prototype.fixLayout = function() {
    var controlsHeight = 80,
        roomSize = this.extent();

    roomSize.y = roomSize.y - (controlsHeight + 35);
    this.room.setExtent(roomSize);
    this.room.setCenter(this.center().subtract(controlsHeight/2));
    this.room.fixLayout();

    this.updateMsgPalette();
    this.palette.setWidth(this.width()/2);
    this.palette.setHeight(this.center().y);

    this.addRoleBtn.setCenter(this.room.center());
    this.addRoleBtn.setTop(this.room.roomName.bottom() + 5);

    this.replayControls.setWidth(this.width()-40);
    this.replayControls.setHeight(controlsHeight);
    this.replayControls.setCenter(new Point(this.center().x, 0));
    this.replayControls.setBottom(this.bottom());
    this.replayControls.fixLayout();
};

RoomEditorMorph.prototype.setExtent = function(point) {
    RoomEditorMorph.uber.setExtent.call(this, point);

    this.fixLayout();
};

RoomEditorMorph.prototype.isRecording = function() {
    return this.room.isCapturingTrace();
};

RoomEditorMorph.prototype.hasNetworkRecording = function() {
    var trace = this.room.trace;
    return !!(trace.startTime && trace.endTime);
};

RoomEditorMorph.prototype.toggleRecordMode = function() {
    if (this.isRecording()) {
        this.exitRecordMode();
    } else {
        this.enterRecordMode();
    }
};

RoomEditorMorph.prototype.enterRecordMode = function() {
    if (SnapActions.isCollaborating()) {
        this.room.ide.showMessage(localize('Cannot trace network actions while collaborating'));
        return;
    }

    this.room.startTrace();
};

RoomEditorMorph.prototype.exitRecordMode = function() {
    this.room.endTrace();
};

RoomEditorMorph.prototype.isReplayMode = function() {
    return this.replayControls.enabled;
};

RoomEditorMorph.prototype.exitReplayMode = function() {
    this.replayControls.disable();
    this.room.stopTraceReplay();
};

RoomEditorMorph.prototype.enterReplayMode = function() {
    if (SnapActions.isCollaborating()) {
        this.room.ide.showMessage(localize('Cannot replay network actions while collaborating'));
        return;
    }

    this.replayControls.enable();
    this.room.startTraceReplay(this.replayControls);
    this.updateRoomControls();
};

RoomEditorMorph.prototype.updateRoomControls = function() {
    // Draw the room
    this.room.drawNew();

    // Draw the "new role" button
    if (this.room.isEditable() && !this.isReplayMode()) {
        this.addRoleBtn.show();
    } else {
        this.addRoleBtn.hide();
    }
};

RoomEditorMorph.prototype.createMsgPalette = function() {
    var palette = new ScrollFrameMorph();
    palette.setColor(new Color(0, 0, 0, 0));
    palette.padding = 12;
    palette.acceptsDrops = false;
    palette.contents.acceptsDrops = false;

    return palette;
};

RoomEditorMorph.prototype.updateMsgPalette = function() {
    var stage = this.room.ide.stage,
        palette = this.palette,
        msgs = stage.deletableMessageNames(),
        msg;


    palette.contents.children.forEach(function(child) {
        palette.contents.removeChild(child);
    });

    for (var i = 0; i < msgs.length; i++) {
        // Build block morph
        msg = new ReporterBlockMorph();
        msg.category = 'network';
        msg.blockSpec = msgs[i];
        msg.setSpec(msgs[i]);
        msg.forMsg = true;
        msg.isTemplate = true;
        msg.setColor(new Color(217,77,17));
        msg.setPosition(new Point(palette.bounds.origin.x + 10, palette.bounds.origin.y + 24 * i + 6));
        // Don't allow multiple instances of the block to exist at once
        msg.justDropped = function() {
            this.destroy();
        };
        // Display fields of the message type when clicked
        msg.mouseClickLeft = function() {
            var fields = stage.messageTypes.msgTypes[this.blockSpec].fields.length === 0 ?
                'This message type has no fields.' :
                stage.messageTypes.msgTypes[this.blockSpec].fields;
            new SpeechBubbleMorph(fields, null, null, 2).popUp(this.world(), new Point(0, 0).add(this.bounds.corner));
        };

        // Custom menu
        var menu = new MenuMorph(this, null);
        menu.addItem('Send to...', function() {this.room.promptShare(msg.blockSpec);});
        msg.children[0].customContextMenu = menu;
        msg.customContextMenu = menu;

        palette.addContents(msg);
    }

};

// UserDialogMorph ////////////////////////////////////////////////////

// UserDialogMorph inherits from DialogBoxMorph:

UserDialogMorph.prototype = new DialogBoxMorph();
UserDialogMorph.prototype.constructor = UserDialogMorph;
UserDialogMorph.uber = DialogBoxMorph.prototype;

// UserDialogMorph instance creation:

function UserDialogMorph(target, action, users) {
    this.init(target, action, users);
}

UserDialogMorph.prototype.init = function(target, action, users) {
    this.key = 'inviteGuest';
    this.userList = users;
    UserDialogMorph.uber.init.call(
        this,
        target, // target
        action, // function
        null // environment
    );
    this.buildContents();
};

UserDialogMorph.prototype.buildContents = function() {
    this.addBody(new Morph());
    this.body.color = this.color;

    this.buildFilterField();

    this.listField = new ListMorph(this.userList);
    this.fixListFieldItemColors();
    this.listField.fixLayout = nop;
    this.listField.edge = InputFieldMorph.prototype.edge;
    this.listField.fontSize = InputFieldMorph.prototype.fontSize;
    this.listField.typeInPadding = InputFieldMorph.prototype.typeInPadding;
    this.listField.contrast = InputFieldMorph.prototype.contrast;
    this.listField.drawNew = InputFieldMorph.prototype.drawNew;
    this.listField.drawRectBorder = InputFieldMorph.prototype.drawRectBorder;

    this.body.add(this.listField);

    // add buttons
    this.labelString = 'Invite a Friend to the Room';
    this.createLabel();
    this.addButton('ok', 'OK');
    this.addButton('cancel', 'Cancel');

    this.setHeight(300);
    this.fixLayout();
};

UserDialogMorph.prototype.fixLayout = function () {
    var th = fontHeight(this.titleFontSize) + this.titlePadding * 2,
        inputField = this.filterField,
        oldFlag = Morph.prototype.trackChanges;

    Morph.prototype.trackChanges = false;

    if (this.buttons && (this.buttons.children.length > 0)) {
        this.buttons.fixLayout();
    }

    if (this.body) {
        this.body.setPosition(this.position().add(new Point(
            this.padding,
            th + this.padding
        )));
        this.body.setExtent(new Point(
            this.width() - this.padding * 2,
            this.height() - this.padding * 3 - th - this.buttons.height()
        ));

        inputField.setWidth(
            this.body.width() -  this.padding * 6
        );
        inputField.setLeft(this.body.left() + this.padding * 3);
        inputField.drawNew();

        this.listField.setLeft(this.body.left() + this.padding);
        this.listField.setWidth(
            this.body.width()
                - this.padding
        );
        this.listField.contents.children[0].adjustWidths();

        this.listField.setTop(inputField.bottom() + this.padding);
        this.listField.setHeight(
            this.body.height() - inputField.height() - this.padding
        );

        if (this.magnifiyingGlass) {
            this.magnifiyingGlass.setTop(inputField.top());
            this.magnifiyingGlass.setLeft(this.listField.left());
        }
    }

    if (this.label) {
        this.label.setCenter(this.center());
        this.label.setTop(this.top() + (th - this.label.height()) / 2);
    }

    if (this.buttons && (this.buttons.children.length > 0)) {
        this.buttons.setCenter(this.center());
        this.buttons.setBottom(this.bottom() - this.padding);
    }

    Morph.prototype.trackChanges = oldFlag;
    this.changed();
};

UserDialogMorph.prototype.fixListFieldItemColors =
    ProjectDialogMorph.prototype.fixListFieldItemColors;

UserDialogMorph.prototype.buildFilterField =
    ProjectDialogMorph.prototype.buildFilterField;

UserDialogMorph.prototype.getInput = function() {
    return this.listField.selected;
};

UserDialogMorph.prototype.buildFilterField = function () {
    var myself = this;

    this.filterField = new InputFieldMorph('');
    this.magnifiyingGlass =
        new SymbolMorph(
            'magnifiyingGlass',
            this.filterField.height(),
            this.titleBarColor.darker(50));

    this.body.add(this.magnifiyingGlass);
    this.body.add(this.filterField);

    this.filterField.reactToKeystroke = function () {
        var text = this.getValue();

        myself.listField.elements =
            // Netsblox addition: start
            myself.userList.filter(function (username) {
                return username.toLowerCase().indexOf(text.toLowerCase()) > -1;
            });
        // Netsblox addition: end

        if (myself.listField.elements.length === 0) {
            myself.listField.elements.push('(no matches)');
        }

        myself.listField.buildListContents();
        myself.fixListFieldItemColors();
        myself.listField.adjustScrollBars();
        myself.listField.scrollY(myself.listField.top());
        myself.fixLayout();
    };
};

UserDialogMorph.prototype.popUp = function(wrrld) {
    var world = wrrld || this.target.world();
    this.setCenter(world.center());
    if (world) {
        ProjectDialogMorph.uber.popUp.call(this, world);
        this.handle = new HandleMorph(
            this,
            200,
            100,
            this.corner,
            this.corner
        );
        this.filterField.edit();
    }
};

// CollaboratorDialogMorph ////////////////////////////////////////////////////

// CollaboratorDialogMorph inherits from DialogBoxMorph:

CollaboratorDialogMorph.prototype = new UserDialogMorph();
CollaboratorDialogMorph.prototype.constructor = CollaboratorDialogMorph;
CollaboratorDialogMorph.uber = UserDialogMorph.prototype;

// CollaboratorDialogMorph instance creation:

function CollaboratorDialogMorph(target, action, users) {
    this.init(target, action, users);
}

CollaboratorDialogMorph.prototype.buildContents = function() {
    var myself = this;

    this.addBody(new Morph());
    this.body.color = this.color;

    this.buildFilterField();

    this.listField = new ListMorph(
        this.userList,
        this.userList.length > 0 ?
            function (element) {
                return element.username || element;
            } : null,
        [ // format: display shared project names bold
            [
                'bold',
                function (user) {return user.collaborating; }
            ]
        ]//,
        //function () {myself.ok(); }
    );

    this.listField.action = function (item) {
        if (item === undefined) {return; }
        if (item.collaborating) {
            myself.collaborateButton.hide();
            myself.uncollaborateButton.show();
        } else {
            myself.uncollaborateButton.hide();
            myself.collaborateButton.show();
        }
        myself.buttons.fixLayout();
        myself.fixLayout();
        myself.edit();
    };

    this.filterField.reactToKeystroke = function () {
        var text = this.getValue();

        myself.listField.elements =
            myself.userList.filter(function (user) {
                return user.username.toLowerCase().indexOf(text.toLowerCase()) > -1;
            });

        if (myself.listField.elements.length === 0) {
            myself.listField.elements.push('(no matches)');
        }

        myself.listField.buildListContents();
        myself.fixListFieldItemColors();
        myself.listField.adjustScrollBars();
        myself.listField.scrollY(myself.listField.top());
        myself.fixLayout();
    };

    this.fixListFieldItemColors();
    this.listField.fixLayout = nop;
    this.listField.edge = InputFieldMorph.prototype.edge;
    this.listField.fontSize = InputFieldMorph.prototype.fontSize;
    this.listField.typeInPadding = InputFieldMorph.prototype.typeInPadding;
    this.listField.contrast = InputFieldMorph.prototype.contrast;
    this.listField.drawNew = InputFieldMorph.prototype.drawNew;
    this.listField.drawRectBorder = InputFieldMorph.prototype.drawRectBorder;

    this.body.add(this.listField);

    // add buttons
    this.labelString = 'Invite a Friend to Collaborate';
    this.createLabel();
    this.uncollaborateButton = this.addButton(function() {
        SnapCloud.evictCollaborator(myself.listField.selected.username);
        myself.destroy();
    }, 'Remove');
    this.collaborateButton = this.addButton('ok', 'Invite');
    this.uncollaborateButton.hide();
    this.collaborateButton.hide();
    this.addButton('cancel', 'Cancel');

    this.setHeight(300);
    this.fixLayout();
};
