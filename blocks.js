/*

    blocks.js

    a programming construction kit
    based on morphic.js
    inspired by Scratch

    written by Jens Mönig
    jens@moenig.org

    Copyright (C) 2016 by Jens Mönig

    This file is part of Snap!.

    Snap! is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of
    the License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.


    prerequisites:
    --------------
    needs morphic.js


    hierarchy
    ---------
    the following tree lists all constructors hierarchically,
    indentation indicating inheritance. Refer to this list to get a
    contextual overview:

        Morph*
            ArrowMorph
            BlockHighlightMorph
            ScriptsMorph
            SymbolMorph
            SyntaxElementMorph
                ArgMorph
                    ArgLabelMorph
                    BooleanSlotMorph
                    ColorSlotMorph
                    CommandSlotMorph
                        CSlotMorph
                        RingCommandSlotMorph
                    FunctionSlotMorph
                        ReporterSlotMorph
                            RingReporterSlotMorph
                    InputSlotMorph
                        TextSlotMorph
                    MultiArgMorph
                    TemplateSlotMorph
                BlockMorph
                    CommandBlockMorph
                        HatBlockMorph
                    ReporterBlockMorph
                        RingMorph
        BoxMorph*
            CommentMorph
            ScriptFocusMorph

    * from morphic.js


    toc
    ---
    the following list shows the order in which all constructors are
    defined. Use this list to locate code in this document:

        SyntaxElementMorph
        BlockMorph
        CommandBlockMorph
        HatBlockMorph
        ReporterBlockMorph
        RingMorph
        ScriptsMorph
        ArgMorph
        CommandSlotMorph
        RingCommandSlotMorph
        CSlotMorph
        InputSlotMorph
        BooleanSlotMorph
        ArrowMorph
        TextSlotMorph
        SymbolMorph
        ColorSlotMorph
        TemplateSlotMorph
        BlockHighlightMorph
        MultiArgMorph
        ArgLabelMorph
        FunctionSlotMorph
        ReporterSlotMorph
        RingReporterSlotMorph
        CommentMorph


    structure of syntax elements
    ----------------------------
    the structure of syntax elements is identical with their morphic
    tree. There are, however, accessor methods to get (only) the
    parts which are relevant for evaluation wherever appropriate.

    In Scratch/BYOB every sprite and the stage has its own "blocks bin",
    an instance of ScriptsMorph (we're going to name it differently in
    Snap, probably just "scripts").

    At the top most level blocks are assembled into stacks in ScriptsMorph
    instances. A ScriptsMorph contains nothing but blocks, therefore
    every child of a ScriptsMorph is expected to be a block.

    Each block contains:

        selector    - indicating the name of the function it triggers,

    Its arguments are first evaluated and then passed along    as the
    selector is called. Arguments can be either instances of ArgMorph
    or ReporterBlockMorph. The getter method for a block's arguments is

        inputs()    - gets an array of arg morphs and/or reporter blocks

    in addition to inputs, command blocks also know their

        nextBlock()    - gets the block attached to the receiver's bottom

    and the block they're attached to - if any: Their parent.

    please also refer to the high-level comment at the beginning of each
    constructor for further details.
*/

/*global Array, BoxMorph,
Color, ColorPaletteMorph, FrameMorph, Function, HandleMorph, Math, MenuMorph,
Morph, MorphicPreferences, Object, Point, ScrollFrameMorph, ShadowMorph,
String, StringMorph, TextMorph, WorldMorph, contains, degrees, detect,
document, getDocumentPositionOf, isNaN, isString, newCanvas, nop, parseFloat,
radians, useBlurredShadows, SpeechBubbleMorph, modules, StageMorph,
fontHeight, TableFrameMorph, SpriteMorph, Context, ListWatcherMorph,
CellMorph, DialogBoxMorph, BlockInputFragmentMorph, PrototypeHatBlockMorph,
Costume, IDE_Morph, BlockDialogMorph, BlockEditorMorph, localize, isNil,
isSnapObject, copy, PushButtonMorph, SpriteIconMorph*/

// Global stuff ////////////////////////////////////////////////////////

modules.blocks = '2016-July-15';

var SyntaxElementMorph;
var BlockMorph;
var CommandBlockMorph;
var ReporterBlockMorph;
var ScriptsMorph;
var ArgMorph;
var CommandSlotMorph;
var CSlotMorph;
var InputSlotMorph;
var BooleanSlotMorph;
var ArrowMorph;
var ColorSlotMorph;
var HatBlockMorph;
var BlockHighlightMorph;
var MultiArgMorph;
var TemplateSlotMorph;
var FunctionSlotMorph;
var ReporterSlotMorph;
var RingMorph;
var RingCommandSlotMorph;
var RingReporterSlotMorph;
var SymbolMorph;
var CommentMorph;
var ArgLabelMorph;
var TextSlotMorph;
var ScriptFocusMorph;

WorldMorph.prototype.customMorphs = function () {
    // add examples to the world's demo menu

    return [];

/*
    return [
        new SymbolMorph(
            'pipette',
            50,
            new Color(250, 250, 250),
            new Point(-1, -1),
            new Color(20, 20, 20)
        )
    ];
*/
/*
    var sm = new ScriptsMorph();
    sm.setExtent(new Point(800, 600));

    return [
        new SymbolMorph(),
        new HatBlockMorph(),
        new CommandBlockMorph(),
        sm,
        new CommandSlotMorph(),
        new CSlotMorph(),
        new InputSlotMorph(),
        new InputSlotMorph(null, true),
        new BooleanSlotMorph(),
        new ColorSlotMorph(),
        new TemplateSlotMorph('foo'),
        new ReporterBlockMorph(),
        new ReporterBlockMorph(true),
        new ArrowMorph(),
        new MultiArgMorph(),
        new FunctionSlotMorph(),
        new ReporterSlotMorph(),
        new ReporterSlotMorph(true),
//        new DialogBoxMorph('Dialog Box'),
//        new InputFieldMorph('Input Field')
        new RingMorph(),
        new RingCommandSlotMorph(),
        new RingReporterSlotMorph(),
        new RingReporterSlotMorph(true)
    ];
*/
};


// SyntaxElementMorph //////////////////////////////////////////////////

// I am the ancestor of all blocks and input slots

// SyntaxElementMorph inherits from Morph:

SyntaxElementMorph.prototype = new Morph();
SyntaxElementMorph.prototype.constructor = SyntaxElementMorph;
SyntaxElementMorph.uber = Morph.prototype;

// SyntaxElementMorph preferences settings:

/*
    the following settings govern the appearance of all syntax elements
    (blocks and slots) where applicable:

    outline:

        corner        - radius of command block rounding
        rounding    - radius of reporter block rounding
        edge        - width of 3D-ish shading box
        hatHeight    - additional top space for hat blocks
        hatWidth    - minimum width for hat blocks
        rfBorder    - pixel width of reification border (grey outline)
        minWidth    - minimum width for any syntax element's contents

    jigsaw shape:

        inset        - distance from indentation to left edge
        dent        - width of indentation bottom

    paddings:

        bottomPadding    - adds to the width of the bottom most c-slot
        cSlotPadding    - adds to the width of the open "C" in c-slots
        typeInPadding    - adds pixels between text and edge in input slots
        labelPadding    - adds left/right pixels to block labels

    label:

        labelFontName    - <string> specific font family name
        labelFontStyle    - <string> generic font family name, cascaded
        fontSize        - duh
        embossing        - <Point> offset for embossing effect
        labelWidth        - column width, used for word wrapping
        labelWordWrap    - <bool> if true labels can break after each word
        dynamicInputLabels - <bool> if true inputs can have dynamic labels

    snapping:

        feedbackColor        - <Color> for displaying drop feedbacks
        feedbackMinHeight    - height of white line for command block snaps
        minSnapDistance        - threshold when commands start snapping
        reporterDropFeedbackPadding    - increases reporter drop feedback

    color gradients:

        contrast        - <percent int> 3D-ish shading gradient contrast
        labelContrast    - <percent int> 3D-ish label shading contrast
        activeHighlight    - <Color> for stack highlighting when active
        errorHighlight    - <Color> for error highlighting
        activeBlur        - <pixels int> shadow for blurred activeHighlight
        activeBorder    - <pixels int> unblurred activeHighlight
        rfColor            - <Color> for reified outlines and slot backgrounds
*/

SyntaxElementMorph.prototype.setScale = function (num) {
    var scale = Math.min(Math.max(num, 1), 25);
    this.scale = scale;
    this.corner = 3 * scale;
    this.rounding = 9 * scale;
    this.edge = 1.000001 * scale;
    this.inset = 6 * scale;
    this.hatHeight = 12 * scale;
    this.hatWidth = 70 * scale;
    this.rfBorder = 3 * scale;
    this.minWidth = 0;
    this.dent = 8 * scale;
    this.bottomPadding = 3 * scale;
    this.cSlotPadding = 4 * scale;
    this.typeInPadding = scale;
    this.labelPadding = 4 * scale;
    this.labelFontName = 'Verdana';
    this.labelFontStyle = 'sans-serif';
    this.fontSize = 10 * scale;
    this.embossing = new Point(
        -1 * Math.max(scale / 2, 1),
        -1 * Math.max(scale / 2, 1)
    );
    this.labelWidth = 450 * scale;
    this.labelWordWrap = true;
    this.dynamicInputLabels = true;
    this.feedbackColor = new Color(255, 255, 255);
    this.feedbackMinHeight = 5;
    this.minSnapDistance = 20;
    this.reporterDropFeedbackPadding = 10 * scale;
    this.contrast = 65;
    this.labelContrast = 25;
    this.activeHighlight = new Color(153, 255, 213);
    this.errorHighlight = new Color(173, 15, 0);
    this.activeBlur = 20;
    this.activeBorder = 4;
    this.rfColor = new Color(120, 120, 120);
};

SyntaxElementMorph.prototype.setScale(1);
SyntaxElementMorph.prototype.isCachingInputs = false;

// SyntaxElementMorph instance creation:

function SyntaxElementMorph() {
    this.init();
}

SyntaxElementMorph.prototype.init = function (silently) {
    this.cachedClr = null;
    this.cachedClrBright = null;
    this.cachedClrDark = null;
    this.isStatic = false; // if true, I cannot be exchanged

    SyntaxElementMorph.uber.init.call(this, silently);

    this.defaults = [];
    this.cachedInputs = null;
};

// SyntaxElementMorph accessing:

SyntaxElementMorph.prototype.parts = function () {
    // answer my non-crontrol submorphs
    var nb = null;
    if (this.nextBlock) { // if I am a CommandBlock or a HatBlock
        nb = this.nextBlock();
    }
    return this.children.filter(function (child) {
        return (child !== nb)
            && !(child instanceof ShadowMorph)
            && !(child instanceof BlockHighlightMorph);
    });
};

SyntaxElementMorph.prototype.inputs = function () {
    // answer my arguments and nested reporters
    if (isNil(this.cachedInputs) || !this.isCachingInputs) {
        this.cachedInputs = this.parts().filter(function (part) {
            return part instanceof SyntaxElementMorph;
        });
    }
    // this.debugCachedInputs();
    return this.cachedInputs;
};

SyntaxElementMorph.prototype.debugCachedInputs = function () {
    // private - only used for manually debugging inputs caching
    var realInputs, i;
    if (!isNil(this.cachedInputs)) {
        realInputs = this.parts().filter(function (part) {
            return part instanceof SyntaxElementMorph;
        });
    }
    if (this.cachedInputs.length !== realInputs.length) {
        throw new Error('cached inputs size do not match: ' +
            this.constructor.name);
    }
    for (i = 0; i < realInputs.length; i += 1) {
        if (this.cachedInputs[i] !== realInputs[i]) {
            throw new Error('cached input does not match: ' +
                this.constructor.name +
                ' #' +
                i +
                ' ' +
                this.cachedInputs[i].constructor.name +
                ' != ' +
                realInputs[i].constructor.name);
        }
    }
};

SyntaxElementMorph.prototype.allInputs = function () {
    // answer arguments and nested reporters of all children
    var myself = this;
    return this.allChildren().slice(0).reverse().filter(
        function (child) {
            return (child instanceof ArgMorph) ||
                (child instanceof ReporterBlockMorph &&
                child !== myself);
        }
    );
};

SyntaxElementMorph.prototype.allEmptySlots = function () {
    // answer empty input slots of all children excluding myself,
    // but omit those in nested rings (lambdas) and JS-Function primitives.
    // Used by the evaluator when binding implicit formal parameters
    // to empty input slots
    var empty = [];
    if (!(this instanceof RingMorph) &&
            (this.selector !== 'reportJSFunction')) {
        this.children.forEach(function (morph) {
            if (morph.isEmptySlot && morph.isEmptySlot()) {
                empty.push(morph);
            } else if (morph.allEmptySlots) {
                empty = empty.concat(morph.allEmptySlots());
            }
        });
    }
    return empty;
};

SyntaxElementMorph.prototype.tagExitBlocks = function (stopTag, isCommand) {
    // tag 'report' and 'stop this block' blocks of all children including
    // myself, with either a stopTag (for "stop" blocks) or an indicator of
    // being inside a command block definition, but omit those in nested
    // rings (lambdas. Used by the evaluator when entering a procedure
    if (this.selector === 'doReport') {
        this.partOfCustomCommand = isCommand;
    } else if (this.selector === 'doStopThis') {
        this.exitTag = stopTag;
    } else {
        if (!(this instanceof RingMorph)) {
            this.children.forEach(function (morph) {
                if (morph.tagExitBlocks) {
                    morph.tagExitBlocks(stopTag, isCommand);
                }
            });
        }
    }
};

SyntaxElementMorph.prototype.replaceInput = function (oldArg, newArg) {
    var scripts = this.parentThatIsA(ScriptsMorph),
        replacement = newArg,
        idx = this.children.indexOf(oldArg),
        i = 0;

    // try to find the ArgLabel embedding the newArg,
    // used for the undrop() feature
    if (idx === -1 && newArg instanceof MultiArgMorph) {
        this.children.forEach(function (morph) {
            if (morph instanceof ArgLabelMorph &&
                    morph.argMorph() === oldArg) {
                idx = i;
            }
            i += 1;
        });
    }

    if ((idx === -1) || (scripts === null)) {
        return null;
    }

    if (oldArg.cachedSlotSpec) {oldArg.cachedSlotSpec = null; }
    if (newArg.cachedSlotSpec) {newArg.cachedSlotSpec = null; }

    this.startLayout();
    if (newArg.parent) {
        newArg.parent.removeChild(newArg);
    }
    if (oldArg instanceof MultiArgMorph) {
        oldArg.inputs().forEach(function (inp) { // preserve nested reporters
            oldArg.replaceInput(inp, new InputSlotMorph());
        });
        if (this.dynamicInputLabels) {
            replacement = new ArgLabelMorph(newArg);
        }
    }
    replacement.parent = this;
    this.children[idx] = replacement;
    if (oldArg instanceof ReporterBlockMorph) {
        if (!(oldArg instanceof RingMorph)
                || (oldArg instanceof RingMorph && oldArg.contents())) {
            scripts.add(oldArg);
            oldArg.moveBy(replacement.extent());
            oldArg.fixBlockColor();
        }
    }
    if (replacement instanceof MultiArgMorph
            || replacement instanceof ArgLabelMorph
            || replacement.constructor === CommandSlotMorph) {
        replacement.fixLayout();
        if (this.fixLabelColor) { // special case for variadic continuations
            this.fixLabelColor();
        }
    } else {
        replacement.drawNew();
        this.fixLayout();
    }
    this.cachedInputs = null;
    this.endLayout();
};

SyntaxElementMorph.prototype.silentReplaceInput = function (oldArg, newArg) {
    // used by the Serializer or when programatically
    // changing blocks
    var i = this.children.indexOf(oldArg),
        replacement;

    if (i === -1) {
        return;
    }

    if (oldArg.cachedSlotSpec) {oldArg.cachedSlotSpec = null; }
    if (newArg.cachedSlotSpec) {newArg.cachedSlotSpec = null; }

    if (newArg.parent) {
        newArg.parent.removeChild(newArg);
    }
    if (oldArg instanceof MultiArgMorph && this.dynamicInputLabels) {
        replacement = new ArgLabelMorph(newArg);
    } else {
        replacement = newArg;
    }
    replacement.parent = this;
    this.children[i] = replacement;

    if (replacement instanceof MultiArgMorph
            || replacement instanceof ArgLabelMorph
            || replacement.constructor === CommandSlotMorph) {
        replacement.fixLayout();
        if (this.fixLabelColor) { // special case for variadic continuations
            this.fixLabelColor();
        }
    } else {
        replacement.drawNew();
        this.fixLayout();
    }
    this.cachedInputs = null;
};

SyntaxElementMorph.prototype.revertToDefaultInput = function (arg, noValues) {
    var idx = this.parts().indexOf(arg),
        inp = this.inputs().indexOf(arg),
        deflt = new InputSlotMorph();

    if (idx !== -1) {
        if (this instanceof BlockMorph) {
            deflt = this.labelPart(this.parseSpec(this.blockSpec)[idx]);
            if (deflt instanceof InputSlotMorph && this.definition) {
                deflt.setChoices.apply(
                    deflt,
                    this.definition.inputOptionsOfIdx(inp)
                );
                deflt.setContents(
                    this.definition.defaultValueOfInputIdx(inp)
                );
            }
        } else if (this instanceof MultiArgMorph) {
            deflt = this.labelPart(this.slotSpec);
        } else if (this instanceof ReporterSlotMorph) {
            deflt = this.emptySlot();
        }
    }
    // set default value
    if (!noValues) {
        if (inp !== -1) {
            if (deflt instanceof MultiArgMorph) {
                deflt.setContents(this.defaults);
                deflt.defaults = this.defaults;
            } else if (!isNil(this.defaults[inp])) {
                deflt.setContents(this.defaults[inp]);
            }
        }
    }
    this.silentReplaceInput(arg, deflt);
    if (deflt instanceof MultiArgMorph) {
        deflt.refresh();
    } else if (deflt instanceof RingMorph) {
        deflt.fixBlockColor();
    }
    this.cachedInputs = null;
};

SyntaxElementMorph.prototype.isLocked = function () {
    // answer true if I can be exchanged by a dropped reporter
    return this.isStatic;
};

// SyntaxElementMorph enumerating:

SyntaxElementMorph.prototype.topBlock = function () {
    if (this.parent && this.parent.topBlock) {
        return this.parent.topBlock();
    }
    return this;
};

// SyntaxElementMorph reachable variables

SyntaxElementMorph.prototype.getVarNamesDict = function () {
    var block = this.parentThatIsA(BlockMorph),
        rcvr,
        tempVars = [],
        dict;

    if (!block) {
        return {};
    }
    rcvr = block.receiver();
    block.allParents().forEach(function (morph) {
        if (morph instanceof PrototypeHatBlockMorph) {
            tempVars.push.apply(
                tempVars,
                morph.variableNames()
            );
            tempVars.push.apply(
                tempVars,
                morph.inputs()[0].inputFragmentNames()
            );
        } else if (morph instanceof BlockMorph) {
            morph.inputs().forEach(function (inp) {
                if (inp instanceof TemplateSlotMorph) {
                    tempVars.push(inp.contents());
                } else if (inp instanceof MultiArgMorph) {
                    inp.children.forEach(function (m) {
                        if (m instanceof TemplateSlotMorph) {
                            tempVars.push(m.contents());
                        }
                    });
                }
            });
        }
    });
    if (rcvr) {
        dict = rcvr.variables.allNamesDict();
        tempVars.forEach(function (name) {
            dict[name] = name;
        });
        return dict;
    }
    return {};
};

// SyntaxElementMorph drag & drop:

SyntaxElementMorph.prototype.reactToGrabOf = function (grabbedMorph) {
    var topBlock = this.topBlock(),
        affected;
    if (grabbedMorph instanceof CommandBlockMorph) {
        affected = this.parentThatIsA(CommandSlotMorph);
        if (affected) {
            this.startLayout();
            affected.fixLayout();
            this.endLayout();
        }
    }
    if (topBlock) {
        topBlock.allComments().forEach(function (comment) {
            comment.align(topBlock);
        });
        if (topBlock.getHighlight()) {
            topBlock.addHighlight(topBlock.removeHighlight());
        }
    }
};

// SyntaxElementMorph 3D - border color rendering:

SyntaxElementMorph.prototype.bright = function () {
    return this.color.lighter(this.contrast).toString();
};

SyntaxElementMorph.prototype.dark = function () {
    return this.color.darker(this.contrast).toString();
};

// SyntaxElementMorph color changing:

SyntaxElementMorph.prototype.setColor = function (aColor, silently) {
    if (aColor) {
        if (!this.color.eq(aColor)) {
            this.color = aColor;
            if (!silently) {this.drawNew(); }
            this.children.forEach(function (child) {
                if (!silently || child instanceof TemplateSlotMorph) {
                    child.drawNew();
                    child.changed();
                }
            });
            this.changed();
        }
    }
};

SyntaxElementMorph.prototype.setLabelColor = function (
    textColor,
    shadowColor,
    shadowOffset
) {
    this.children.forEach(function (morph) {
        if (morph instanceof StringMorph && !morph.isProtectedLabel) {
            morph.shadowOffset = shadowOffset || morph.shadowOffset;
            morph.shadowColor = shadowColor || morph.shadowColor;
            morph.setColor(textColor);
        } else if (morph instanceof MultiArgMorph
                || morph instanceof ArgLabelMorph
                || (morph instanceof SymbolMorph && !morph.isProtectedLabel)
                || (morph instanceof InputSlotMorph
                    && morph.isReadOnly)) {
            morph.setLabelColor(textColor, shadowColor, shadowOffset);
        }
    });
};


// SyntaxElementMorph zebra coloring

SyntaxElementMorph.prototype.fixBlockColor = function (
    nearestBlock,
    isForced
) {
    this.children.forEach(function (morph) {
        if (morph instanceof SyntaxElementMorph) {
            morph.fixBlockColor(nearestBlock, isForced);
        }
    });
};

// SyntaxElementMorph label parts:

SyntaxElementMorph.prototype.labelPart = function (spec) {
    var part, tokens;
    if (spec[0] === '%' &&
            spec.length > 1 &&
            (this.selector !== 'reportGetVar' ||
                (spec === '%turtleOutline' && this.isObjInputFragment()))) {

        // check for variable multi-arg-slot:
        if ((spec.length > 5) && (spec.slice(0, 5) === '%mult')) {
            part = new MultiArgMorph(spec.slice(5));
            part.addInput();
            return part;
        }

        // single-arg and specialized multi-arg slots:
        switch (spec) {
        case '%imgsource':
            part = new InputSlotMorph(
                null, // text
                false, // non-numeric
                {
                    'pen trails': ['pen trails'],
                    'stage image': ['stage image']
                },
                true
            );
            part.setContents(['pen trails']);
            break;
        case '%inputs':
            part = new MultiArgMorph('%s', 'with inputs');
            part.isStatic = false;
            part.canBeEmpty = false;
            break;
        case '%scriptVars':
            part = new MultiArgMorph('%t', null, 1, spec);
            part.canBeEmpty = false;
            break;
        case '%blockVars':
            part = new MultiArgMorph('%t', 'block variables', 0, spec);
            part.canBeEmpty = false;
            break;
        case '%parms':
            part = new MultiArgMorph('%t', 'Input Names:', 0, spec);
            part.canBeEmpty = false;
            break;
        case '%ringparms':
            part = new MultiArgMorph(
                '%t',
                'input names:',
                0,
                spec
            );
            break;
        case '%cmdRing':
            part = new RingMorph();
            part.color = SpriteMorph.prototype.blockColor.other;
            part.selector = 'reifyScript';
            part.setSpec('%rc %ringparms');
            part.isDraggable = true;
            break;
        case '%repRing':
            part = new RingMorph();
            part.color = SpriteMorph.prototype.blockColor.other;
            part.selector = 'reifyReporter';
            part.setSpec('%rr %ringparms');
            part.isDraggable = true;
            part.isStatic = true;
            break;
        case '%predRing':
            part = new RingMorph(true);
            part.color = SpriteMorph.prototype.blockColor.other;
            part.selector = 'reifyPredicate';
            part.setSpec('%rp %ringparms');
            part.isDraggable = true;
            part.isStatic = true;
            break;
        case '%words':
            part = new MultiArgMorph('%s', null, 0);
            part.addInput(); // allow for default value setting
            part.addInput(); // allow for default value setting
            part.isStatic = false;
            break;
        case '%exp':
            part = new MultiArgMorph('%s', null, 0);
            part.addInput();
            part.isStatic = true;
            part.canBeEmpty = false;
            break;
        case '%br':
            part = new Morph();
            part.setExtent(new Point(0, 0));
            part.isBlockLabelBreak = true;
            part.getSpec = function () {
                return '%br';
            };
            break;
        case '%inputName':
            part = new ReporterBlockMorph();
            part.category = 'variables';
            part.color = SpriteMorph.prototype.blockColor.variables;
            part.setSpec(localize('Input name'));
            break;
        case '%s':
            part = new InputSlotMorph();
            break;
        case '%anyUE':
            part = new InputSlotMorph();
            part.isUnevaluated = true;
            break;
        case '%txt':
            part = new InputSlotMorph(); // supports whitespace dots
            // part = new TextSlotMorph(); // multi-line, no whitespace dots
            part.minWidth = part.height() * 1.7; // "landscape"
            part.fixLayout();
            break;
        case '%mlt':
            part = new TextSlotMorph();
            part.fixLayout();
            break;
        case '%code':
            part = new TextSlotMorph();
            part.contents().fontName = 'monospace';
            part.contents().fontStyle = 'monospace';
            part.fixLayout();
            break;
        case '%obj':
            part = new ArgMorph('object');
            break;
        case '%n':
            part = new InputSlotMorph(null, true);
            break;
        case '%dir':
            part = new InputSlotMorph(
                null,
                true,
                {
                    '(90) right' : 90,
                    '(-90) left' : -90,
                    '(0) up' : '0',
                    '(180) down' : 180
                }
            );
            part.setContents(90);
            break;
        case '%inst':
            part = new InputSlotMorph(
                null,
                true,
                {
                    '(1) Acoustic Grand' : 1,
                    '(2) Bright Acoustic' : 2,
                    '(3) Electric Grand' : 3,
                    '(4) Honky Tonk' : 4,
                    '(5) Electric Piano 1' : 5,
                    '(6) Electric Piano 2' : 6,
                    '(7) Harpsichord' : 7
                }
            );
            part.setContents(1);
            break;
        case '%month':
            part = new InputSlotMorph(
                null, // text
                false, // numeric?
                {
                    'January' : ['January'],
                    'February' : ['February'],
                    'March' : ['March'],
                    'April' : ['April'],
                    'May' : ['May'],
                    'June' : ['June'],
                    'July' : ['July'],
                    'August' : ['August'],
                    'September' : ['September'],
                    'October' : ['October'],
                    'November' : ['November'],
                    'December' : ['December']
                },
                true // read-only
            );
            break;
        case '%interaction':
            part = new InputSlotMorph(
                null, // text
                false, // numeric?
                {
                    'clicked' : ['clicked'],
                    'pressed' : ['pressed'],
                    'dropped' : ['dropped'],
                    'mouse-entered' : ['mouse-entered'],
                    'mouse-departed' : ['mouse-departed']
                },
                true // read-only
            );
            part.isStatic = true;
            break;
        case '%dates':
            part = new InputSlotMorph(
                null, // text
                false, // non-numeric
                {
                    'year' : ['year'],
                    'month' : ['month'],
                    'date' : ['date'],
                    'day of week' : ['day of week'],
                    'hour' : ['hour'],
                    'minute' : ['minute'],
                    'second' : ['second'],
                    'time in milliseconds' : ['time in milliseconds']
                },
                true // read-only
            );
            part.setContents(['date']);
            break;
        case '%delim':
            part = new InputSlotMorph(
                null, // text
                false, // numeric?
                {
                    'letter' : ['letter'],
                    'whitespace' : ['whitespace'],
                    'line' : ['line'],
                    'tab' : ['tab'],
                    'cr' : ['cr']
                },
                false // read-only
            );
            break;
        case '%ida':
            part = new InputSlotMorph(
                null,
                true,
                {
                    '1' : 1,
                    last : ['last'],
                    '~' : null,
                    all : ['all']
                }
            );
            part.setContents(1);
            break;
        case '%idx':
            part = new InputSlotMorph(
                null,
                true,
                {
                    '1' : 1,
                    last : ['last'],
                    any : ['any']
                }
            );
            part.setContents(1);
            break;
        case '%spr':
            part = new InputSlotMorph(
                null,
                false,
                'objectsMenu',
                true
            );
            break;
        case '%col': // collision detection
            part = new InputSlotMorph(
                null,
                false,
                'collidablesMenu',
                true
            );
            break;
        case '%dst': // distance measuring
            part = new InputSlotMorph(
                null,
                false,
                'distancesMenu',
                true
            );
            break;
        case '%cln': // clones
            part = new InputSlotMorph(
                null,
                false,
                'clonablesMenu',
                true
            );
            break;
        case '%get': // sprites, parts, speciment, clones
            part = new InputSlotMorph(
                null,
                false,
                'gettablesMenu',
                true
            );
            part.isStatic = true;
            break;
        case '%cst':
            part = new InputSlotMorph(
                null,
                false,
                'costumesMenu',
                true
            );
            break;
        case '%eff':
            part = new InputSlotMorph(
                null,
                false,
                {   color: ['color'],
                    fisheye: ['fisheye'],
                    whirl: ['whirl'],
                    pixelate: ['pixelate'],
                    mosaic: ['mosaic'],
                    duplicate: ['duplicate'],
                    negative : ['negative'],
                    comic: ['comic'],
                    confetti: ['confetti'],
                    saturation: ['saturation'],
                    brightness : ['brightness'],
                    ghost: ['ghost']
                },
                true
            );
            part.setContents(['ghost']);
            break;
        case '%snd':
            part = new InputSlotMorph(
                null,
                false,
                'soundsMenu',
                true
            );
            break;
        case '%key':
            part = new InputSlotMorph(
                null,
                false,
                {
                    'any key' : ['any key'],
                    'up arrow': ['up arrow'],
                    'down arrow': ['down arrow'],
                    'right arrow': ['right arrow'],
                    'left arrow': ['left arrow'],
                    space : ['space'],
                    a : ['a'],
                    b : ['b'],
                    c : ['c'],
                    d : ['d'],
                    e : ['e'],
                    f : ['f'],
                    g : ['g'],
                    h : ['h'],
                    i : ['i'],
                    j : ['j'],
                    k : ['k'],
                    l : ['l'],
                    m : ['m'],
                    n : ['n'],
                    o : ['o'],
                    p : ['p'],
                    q : ['q'],
                    r : ['r'],
                    s : ['s'],
                    t : ['t'],
                    u : ['u'],
                    v : ['v'],
                    w : ['w'],
                    x : ['x'],
                    y : ['y'],
                    z : ['z'],
                    '0' : ['0'],
                    '1' : ['1'],
                    '2' : ['2'],
                    '3' : ['3'],
                    '4' : ['4'],
                    '5' : ['5'],
                    '6' : ['6'],
                    '7' : ['7'],
                    '8' : ['8'],
                    '9' : ['9']
                },
                true
            );
            part.setContents(['space']);
            break;
        case '%keyHat':
            part = this.labelPart('%key');
            part.isStatic = true;
            break;
        case '%msg':
            part = new InputSlotMorph(
                null,
                false,
                'messagesMenu',
                true
            );
            break;
        case '%msgHat':
            part = new InputSlotMorph(
                null,
                false,
                'messagesReceivedMenu',
                true
            );
            part.isStatic = true;
            break;
        case '%att':
            part = new InputSlotMorph(
                null,
                false,
                'attributesMenu',
                true
            );
            break;
        case '%fun':
            part = new InputSlotMorph(
                null,
                false,
                {
                    abs : ['abs'],
                    ceiling : ['ceiling'],
                    floor : ['floor'],
                    sqrt : ['sqrt'],
                    sin : ['sin'],
                    cos : ['cos'],
                    tan : ['tan'],
                    asin : ['asin'],
                    acos : ['acos'],
                    atan : ['atan'],
                    ln : ['ln'],
                    log : ['log'],
                    'e^' : ['e^'],
                    '10^' : ['10^']
                },
                true
            );
            part.setContents(['sqrt']);
            break;
        case '%txtfun':
            part = new InputSlotMorph(
                null,
                false,
                {
                    'encode URI' : ['encode URI'],
                    'decode URI' : ['decode URI'],
                    'encode URI component' : ['encode URI component'],
                    'decode URI component' : ['decode URI component'],
                    'XML escape' : ['XML escape'],
                    'XML unescape' : ['XML unescape'],
                    'hex sha512 hash' : ['hex sha512 hash']
                },
                true
            );
            part.setContents(['encode URI']);
            break;
        case '%stopChoices':
            part = new InputSlotMorph(
                null,
                false,
                {
                    'all' : ['all'],
                    'this script' : ['this script'],
                    'this block' : ['this block']
                },
                true
            );
            part.setContents(['all']);
            part.isStatic = true;
            break;
        case '%stopOthersChoices':
            part = new InputSlotMorph(
                null,
                false,
                {
                    'all but this script' : ['all but this script'],
                    'other scripts in sprite' : ['other scripts in sprite']
                },
                true
            );
            part.setContents(['all but this script']);
            part.isStatic = true;
            break;
        case '%typ':
            part = new InputSlotMorph(
                null,
                false,
                'typesMenu',
                true
            );
            part.setContents(['number']);
            break;
        case '%var':
            part = new InputSlotMorph(
                null,
                false,
                'getVarNamesDict',
                true
            );
            part.isStatic = true;
            break;
        case '%shd':
            part = new InputSlotMorph(
                null,
                false,
                'shadowedVariablesMenu',
                true
            );
            part.isStatic = true;
            break;
        case '%lst':
            part = new InputSlotMorph(
                null,
                false,
                {
                    list1 : 'list1',
                    list2 : 'list2',
                    list3 : 'list3'
                },
                true
            );
            break;
        case '%codeKind':
            part = new InputSlotMorph(
                null,
                false,
                {
                    code : ['code'],
                    header : ['header']
                },
                true
            );
            part.setContents(['code']);
            break;
        case '%l':
            part = new ArgMorph('list');
            break;
        case '%b':
            part = new BooleanSlotMorph();
            break;
        case '%boolUE':
            part = new BooleanSlotMorph();
            part.isUnevaluated = true;
            break;
        case '%bool':
            part = new BooleanSlotMorph(true);
            part.isStatic = true;
            break;
        case '%cmd':
            part = new CommandSlotMorph();
            break;
        case '%rc':
            part = new RingCommandSlotMorph();
            part.isStatic = true;
            break;
        case '%rr':
            part = new RingReporterSlotMorph();
            part.isStatic = true;
            break;
        case '%rp':
            part = new RingReporterSlotMorph(true);
            part.isStatic = true;
            break;
        case '%c':
            part = new CSlotMorph();
            part.isStatic = true;
            break;
        case '%cs':
            part = new CSlotMorph(); // non-static
            break;
        case '%cl':
            part = new CSlotMorph();
            part.isStatic = true; // rejects reporter drops
            part.isLambda = true; // auto-reifies nested script
            break;
        case '%clr':
            part = new ColorSlotMorph();
            part.isStatic = true;
            break;
        case '%t':
            part = new TemplateSlotMorph('a');
            break;
        case '%upvar':
            part = new TemplateSlotMorph('\u2191'); // up-arrow
            break;
        case '%f':
            part = new FunctionSlotMorph();
            break;
        case '%r':
            part = new ReporterSlotMorph();
            break;
        case '%p':
            part = new ReporterSlotMorph(true);
            break;

    // code mapping (experimental)

        case '%codeListPart':
            part = new InputSlotMorph(
                null, // text
                false, // numeric?
                {
                    'list' : ['list'],
                    'item' : ['item'],
                    'delimiter' : ['delimiter']
                },
                true // read-only
            );
            break;
        case '%codeListKind':
            part = new InputSlotMorph(
                null, // text
                false, // numeric?
                {
                    'collection' : ['collection'],
                    'variables' : ['variables'],
                    'parameters' : ['parameters']
                },
                true // read-only
            );
            break;

    // symbols:

        case '%turtle':
            part = new SymbolMorph('turtle');
            part.size = this.fontSize * 1.2;
            part.color = new Color(255, 255, 255);
            part.shadowColor = this.color.darker(this.labelContrast);
            part.shadowOffset = MorphicPreferences.isFlat ?
                    new Point() : this.embossing;
            part.drawNew();
            break;
        case '%turtleOutline':
            part = new SymbolMorph('turtleOutline');
            part.size = this.fontSize;
            part.color = new Color(255, 255, 255);
            part.isProtectedLabel = true; // doesn't participate in zebraing
            part.shadowColor = this.color.darker(this.labelContrast);
            part.shadowOffset = MorphicPreferences.isFlat ?
                    new Point() : this.embossing;
            part.drawNew();
            break;
        case '%clockwise':
            part = new SymbolMorph('turnRight');
            part.size = this.fontSize * 1.5;
            part.color = new Color(255, 255, 255);
            part.isProtectedLabel = false; // zebra colors
            part.shadowColor = this.color.darker(this.labelContrast);
            part.shadowOffset = MorphicPreferences.isFlat ?
                    new Point() : this.embossing;
            part.drawNew();
            break;
        case '%counterclockwise':
            part = new SymbolMorph('turnLeft');
            part.size = this.fontSize * 1.5;
            part.color = new Color(255, 255, 255);
            part.isProtectedLabel = false; // zebra colors
            part.shadowColor = this.color.darker(this.labelContrast);
            part.shadowOffset = MorphicPreferences.isFlat ?
                    new Point() : this.embossing;
            part.drawNew();
            break;
        case '%greenflag':
            part = new SymbolMorph('flag');
            part.size = this.fontSize * 1.5;
            part.color = new Color(0, 200, 0);
            part.isProtectedLabel = true; // doesn't participate in zebraing
            part.shadowColor = this.color.darker(this.labelContrast);
            part.shadowOffset = MorphicPreferences.isFlat ?
                    new Point() : this.embossing;
            part.drawNew();
            break;
        case '%stop':
            part = new SymbolMorph('octagon');
            part.size = this.fontSize * 1.5;
            part.color = new Color(200, 0, 0);
            part.isProtectedLabel = true; // doesn't participate in zebraing
            part.shadowColor = this.color.darker(this.labelContrast);
            part.shadowOffset = MorphicPreferences.isFlat ?
                    new Point() : this.embossing;
            part.drawNew();
            break;
        case '%pause':
            part = new SymbolMorph('pause');
            part.size = this.fontSize;
            part.color = new Color(255, 220, 0);
            part.isProtectedLabel = true; // doesn't participate in zebraing
            part.shadowColor = this.color.darker(this.labelContrast);
            part.shadowOffset = MorphicPreferences.isFlat ?
                    new Point() : this.embossing;
            part.drawNew();
            break;
        default:
            nop();
        }
    } else if (spec[0] === '$' &&
            spec.length > 1 &&
            this.selector !== 'reportGetVar') {
/*
        // allow costumes as label symbols
        // has issues when loading costumes (asynchronously)
        // commented out for now

        var rcvr = this.definition.receiver || this.receiver(),
            id = spec.slice(1),
            cst;
        if (!rcvr) {return this.labelPart('%stop'); }
        cst = detect(
            rcvr.costumes.asArray(),
            function (each) {return each.name === id; }
        );
        part = new SymbolMorph(cst);
        part.size = this.fontSize * 1.5;
        part.color = new Color(255, 255, 255);
        part.isProtectedLabel = true; // doesn't participate in zebraing
        part.drawNew();
*/

        // allow GUI symbols as label icons
        // usage: $symbolName[-size-r-g-b], size and color values are optional
        tokens = spec.slice(1).split('-');
        if (!contains(SymbolMorph.prototype.names, tokens[0])) {
            part = new StringMorph(spec);
            part.fontName = this.labelFontName;
            part.fontStyle = this.labelFontStyle;
            part.fontSize = this.fontSize;
            part.color = new Color(255, 255, 255);
            part.isBold = true;
            part.shadowColor = this.color.darker(this.labelContrast);
            part.shadowOffset = MorphicPreferences.isFlat ?
                    new Point() : this.embossing;
            part.drawNew();
            return part;
        }
        part = new SymbolMorph(tokens[0]);
        part.size = this.fontSize * (+tokens[1] || 1.2);
        part.color = new Color(
            +tokens[2] === 0 ? 0 : +tokens[2] || 255,
            +tokens[3] === 0 ? 0 : +tokens[3] || 255,
            +tokens[4] === 0 ? 0 : +tokens[4] || 255
        );
        part.isProtectedLabel = tokens.length > 2; // zebra colors
        part.shadowColor = this.color.darker(this.labelContrast);
        part.shadowOffset = MorphicPreferences.isFlat ?
                new Point() : this.embossing;
        part.drawNew();
    } else {
        part = new StringMorph(
            spec, // text
            this.fontSize, // fontSize
            this.labelFontStyle, // fontStyle
            true, // bold
            false, // italic
            false, // isNumeric
            MorphicPreferences.isFlat ?
                    new Point() : this.embossing, // shadowOffset
            this.color.darker(this.labelContrast), // shadowColor
            new Color(255, 255, 255), // color
            this.labelFontName // fontName
        );
    }
    return part;
};

SyntaxElementMorph.prototype.isObjInputFragment = function () {
    // private - for displaying a symbol in a variable block template
    return (this.selector === 'reportGetVar') &&
        (this.getSlotSpec() === '%t') &&
        (this.parent.fragment.type === '%obj');
};

// SyntaxElementMorph layout:

SyntaxElementMorph.prototype.fixLayout = function (silently) {
    var nb,
        parts = this.parts(),
        myself = this,
        x = 0,
        y,
        lineHeight = 0,
        maxX = 0,
        blockWidth = this.minWidth,
        blockHeight,
        affected,
        l = [],
        lines = [],
        space = this.isPrototype ?
                1 : Math.floor(fontHeight(this.fontSize) / 3),
        bottomCorrection,
        initialExtent = this.extent();

    if ((this instanceof MultiArgMorph) && (this.slotSpec !== '%c')) {
        blockWidth += this.arrows().width();
    } else if (this instanceof ReporterBlockMorph) {
        blockWidth += (this.rounding * 2) + (this.edge * 2);
    } else {
        blockWidth += (this.corner * 4)
            + (this.edge * 2)
            + (this.inset * 3)
            + this.dent;
    }

    if (this.nextBlock) {
        nb = this.nextBlock();
    }

    // determine lines
    parts.forEach(function (part) {
        if ((part instanceof CSlotMorph)
                || (part.slotSpec === '%c')) {
            if (l.length > 0) {
                lines.push(l);
                lines.push([part]);
                l = [];
                x = 0;
            } else {
                lines.push([part]);
            }
        } else if (part instanceof BlockHighlightMorph) {
            nop(); // should be redundant now
            // myself.fullChanged();
            // myself.removeChild(part);
        } else {
            if (part.isVisible) {
                x += part.fullBounds().width() + space;
            }
            if ((x > myself.labelWidth) || part.isBlockLabelBreak) {
                if (l.length > 0) {
                    lines.push(l);
                    l = [];
                    x = part.fullBounds().width() + space;
                }
            }
            l.push(part);
            if (part.isBlockLabelBreak) {
                x = 0;
            }
        }
    });
    if (l.length > 0) {
        lines.push(l);
    }

    // distribute parts on lines
    if (this instanceof CommandBlockMorph) {
        y = this.top() + this.corner + this.edge;
        if (this instanceof HatBlockMorph) {
            y += this.hatHeight;
        }
    } else if (this instanceof ReporterBlockMorph) {
        y = this.top() + (this.edge * 2);
    } else if (this instanceof MultiArgMorph
            || this instanceof ArgLabelMorph) {
        y = this.top();
    }
    lines.forEach(function (line) {
        x = myself.left() + myself.edge + myself.labelPadding;
        if (myself instanceof RingMorph) {
            x = myself.left() + space; //myself.labelPadding;
        } else if (myself.isPredicate) {
            x = myself.left() + myself.rounding;
        } else if (myself instanceof MultiArgMorph
                || myself instanceof ArgLabelMorph) {
            x = myself.left();
        }
        y += lineHeight;
        lineHeight = 0;
        line.forEach(function (part) {
            if (part instanceof CSlotMorph) {
                x -= myself.labelPadding;
                if (myself.isPredicate) {
                    x = myself.left() + myself.rounding;
                }
                part.setColor(myself.color);
                part.setPosition(new Point(x, y));
                lineHeight = part.height();
            } else {
                part.setPosition(new Point(x, y));
                if (!part.isBlockLabelBreak) {
                    if (part.slotSpec === '%c') {
                        x += part.width();
                    } else if (part.isVisible) {
                        x += part.fullBounds().width() + space;
                    }
                }
                maxX = Math.max(maxX, x);
                lineHeight = Math.max(
                    lineHeight,
                    part instanceof StringMorph ?
                            part.rawHeight() : part.height()
                );
            }
        });

    // center parts vertically on each line:
        line.forEach(function (part) {
            part.moveBy(new Point(
                0,
                Math.floor((lineHeight - part.height()) / 2)
            ));
        });
    });

    // determine my height:
    y += lineHeight;
    if (this.children.some(function (any) {
            return any instanceof CSlotMorph;
        })) {
        bottomCorrection = this.bottomPadding;
        if (this instanceof ReporterBlockMorph && !this.isPredicate) {
            bottomCorrection = Math.max(
                this.bottomPadding,
                this.rounding - this.bottomPadding
            );
        }
        y += bottomCorrection;
    }
    if (this instanceof CommandBlockMorph) {
        blockHeight = y - this.top() + (this.corner * 2);
    } else if (this instanceof ReporterBlockMorph) {
        blockHeight = y - this.top() + (this.edge * 2);
    } else if (this instanceof MultiArgMorph
            || this instanceof ArgLabelMorph) {
        blockHeight = y - this.top();
    }

    // determine my width:
    if (this.isPredicate) {
        blockWidth = Math.max(
            blockWidth,
            maxX - this.left() + this.rounding
        );
    } else if (this instanceof MultiArgMorph
            || this instanceof ArgLabelMorph) {
        blockWidth = Math.max(
            blockWidth,
            maxX - this.left() - space
        );
    } else {
        blockWidth = Math.max(
            blockWidth,
            maxX - this.left() + this.labelPadding - this.edge
        );
        // adjust right padding if rightmost input has arrows
        if (parts[parts.length - 1] instanceof MultiArgMorph
                && (lines.length === 1)) {
            blockWidth -= space;
        }
        // adjust width to hat width
        if (this instanceof HatBlockMorph) {
            blockWidth = Math.max(blockWidth, this.hatWidth * 1.5);
        }
    }

    // set my extent (silently, because we'll redraw later anyway):
    this.silentSetExtent(new Point(blockWidth, blockHeight));

    // adjust CSlots
    parts.forEach(function (part) {
        if (part instanceof CSlotMorph) {
            if (myself.isPredicate) {
                part.setWidth(blockWidth - myself.rounding * 2);
            } else {
                part.setWidth(blockWidth - myself.edge);
            }
        }
    });

    // redraw in order to erase CSlot backgrounds
    if (!silently) {this.drawNew(); }

    // position next block:
    if (nb) {
        nb.setPosition(
            new Point(
                this.left(),
                this.bottom() - (this.corner)
            )
        );
    }

    // find out if one of my parents needs to be fixed
    if (this instanceof CommandBlockMorph) {
        if (this.height() !== initialExtent.y) {
            affected = this.parentThatIsA(CommandSlotMorph);
            if (affected) {
                affected.fixLayout();
            }
        }
        if (this.width() !== initialExtent.x) {
            affected = this.parentThatIsAnyOf(
                [ReporterBlockMorph, CommandSlotMorph, RingCommandSlotMorph]
            );
            if (affected) {
                affected.fixLayout();
            }
        }
        if (affected) {
            return;
        }
    } else if (this instanceof ReporterBlockMorph) {
        if (this.parent) {
            if (this.parent.fixLayout) {
                return this.parent.fixLayout();
            }
        }
    }

    this.fixHighlight();
};

SyntaxElementMorph.prototype.fixHighlight = function () {
    var top = this.topBlock();
    if (top.getHighlight && top.getHighlight()) {
        top.addHighlight(top.removeHighlight());
    }
};

// SyntaxElementMorph evaluating:

SyntaxElementMorph.prototype.evaluate = function () {
    // responsibility of my children, default is to answer null
    return null;
};

SyntaxElementMorph.prototype.isEmptySlot = function () {
    // responsibility of my children, default is to answer false
    return false;
};

// SyntaxElementMorph speech bubble feedback:

SyntaxElementMorph.prototype.showBubble = function (value, exportPic) {
    var bubble,
        txt,
        img,
        morphToShow,
        isClickable = false,
        ide = this.parentThatIsA(IDE_Morph),
        rcvr = this.receiver(),
        anchor = this,
        pos = this.rightCenter().add(new Point(2, 0)),
        sf = this.parentThatIsA(ScrollFrameMorph),
        wrrld = this.world();

    if ((value === undefined) || !wrrld) {
        return null;
    }
    if (value instanceof ListWatcherMorph) {
        morphToShow = value;
        morphToShow.update(true);
        morphToShow.step = value.update;
        morphToShow.isDraggable = false;
        morphToShow.expand(this.parentThatIsA(ScrollFrameMorph).extent());
        isClickable = true;
    } else if (value instanceof TableFrameMorph) {
        morphToShow = value;
        morphToShow.isDraggable = false;
        morphToShow.expand(this.parentThatIsA(ScrollFrameMorph).extent());
        isClickable = true;
    } else if (value instanceof Morph) {
        if (isSnapObject(value)) {
            img = value.thumbnail(new Point(40, 40));
            morphToShow = new Morph();
            morphToShow.silentSetWidth(img.width);
            morphToShow.silentSetHeight(img.height);
            morphToShow.image = img;
            morphToShow.version = value.version;
            morphToShow.step = function () {
                if (this.version !== value.version) {
                    img = value.thumbnail(new Point(40, 40));
                    this.image = img;
                    this.version = value.version;
                    this.changed();
                }
            };
        } else {
            img = value.fullImage();
            morphToShow = new Morph();
            morphToShow.silentSetWidth(img.width);
            morphToShow.silentSetHeight(img.height);
            morphToShow.image = img;
        }
    } else if (value instanceof Costume) {
        img = value.thumbnail(new Point(40, 40));
        morphToShow = new Morph();
        morphToShow.silentSetWidth(img.width);
        morphToShow.silentSetHeight(img.height);
        morphToShow.image = img;
    } else if (value instanceof Context) {
        img = value.image();
        morphToShow = new Morph();
        morphToShow.silentSetWidth(img.width);
        morphToShow.silentSetHeight(img.height);
        morphToShow.image = img;
    } else if (typeof value === 'boolean') {
        morphToShow = SpriteMorph.prototype.booleanMorph.call(
            null,
            value
        );
    } else if (isString(value)) {
        txt  = value.length > 500 ? value.slice(0, 500) + '...' : value;
        morphToShow = new TextMorph(
            txt,
            this.fontSize
        );
    } else if (value === null) {
        morphToShow = new TextMorph(
            '',
            this.fontSize
        );
    } else if (value === 0) {
        morphToShow = new TextMorph(
            '0',
            this.fontSize
        );
    } else if (value.toString) {
        morphToShow = new TextMorph(
            value.toString(),
            this.fontSize
        );
    }
    if (ide && (ide.currentSprite !== rcvr)) {
        if (rcvr instanceof StageMorph) {
            anchor = ide.corral.stageIcon;
        } else {
            anchor = detect(
                ide.corral.frame.contents.children,
                function (icon) {return icon.object === rcvr; }
            );
        }
        pos = anchor.center();
    }
    bubble = new SpeechBubbleMorph(
        morphToShow,
        null,
        Math.max(this.rounding - 2, 6),
        0
    );
    bubble.popUp(
        wrrld,
        pos,
        isClickable
    );
    if (exportPic) {
        this.exportPictureWithResult(bubble);
    }
    if (anchor instanceof SpriteIconMorph) {
        bubble.keepWithin(ide.corral);
    } else if (sf) {
        bubble.keepWithin(sf);
    }
};

SyntaxElementMorph.prototype.exportPictureWithResult = function (aBubble) {
    var ide = this.parentThatIsA(IDE_Morph),
        scr = this.fullImage(),
        bub = aBubble.fullImageClassic(),
        taller = Math.max(0, bub.height - scr.height),
        pic = newCanvas(new Point(
            scr.width + bub.width + 2,
            scr.height + taller
        )),
        ctx = pic.getContext('2d');
    ctx.drawImage(scr, 0, pic.height - scr.height);
    ctx.drawImage(bub, scr.width + 2, 0);
    // request to open pic in new window.
    ide.saveCanvasAs(
        pic,
        ide.projetName || localize('Untitled') + ' ' + localize('script pic'),
        true
    );
};

// SyntaxElementMorph code mapping

/*
    code mapping lets you use blocks to generate arbitrary text-based
    source code that can be exported and compiled / embedded elsewhere,
    it's not part of Snap's evaluator and not needed for Snap itself
*/

SyntaxElementMorph.prototype.mappedCode = function (definitions) {
    var result = this.evaluate();
    if (result instanceof BlockMorph) {
        return result.mappedCode(definitions);
    }
    return result;
};

// SyntaxElementMorph layout update optimization

SyntaxElementMorph.prototype.startLayout = function () {
    this.topBlock().fullChanged();
    Morph.prototype.trackChanges = false;
};

SyntaxElementMorph.prototype.endLayout = function () {
    Morph.prototype.trackChanges = true;
    this.topBlock().fullChanged();
};

// BlockMorph //////////////////////////////////////////////////////////

/*
    I am an abstraction of all blocks (commands, reporters, hats).

    Aside from the visual settings inherited from Morph and
    SyntaxElementMorph my most important attributes and public
    accessors are:

    selector    - (string) name of method to be triggered
    receiver()    - answer the object (sprite) to which I apply
    inputs()    - answer an array with my arg slots and nested reporters
    defaults    - an optional Array containing default input values
    topBlock()    - answer the top block of the stack I'm attached to
    blockSpec    - a formalized description of my label parts
    setSpec()    - force me to change my label structure
    evaluate()    - answer the result of my evaluation
    isUnevaluated() - answer whether I am part of a special form

    Zebra coloring provides a mechanism to alternate brightness of nested,
    same colored blocks (of the same category). The deviation of alternating
    brightness is set in the preferences setting:

    zebraContrast - <number> percentage of brightness deviation

    attribute. If the attribute is set to zero, zebra coloring is turned
    off. If it is a positive number, nested blocks will be colored in
    a brighter shade of the same hue and the label color (for texts)
    alternates between white and black. If the attribute is set to a negative
    number, nested blocks are colored in a darker shade of the same hue
    with no alternating label colors.

    Note: Some of these methods are inherited from SyntaxElementMorph
    for technical reasons, because they are shared among Block and
    MultiArgMorph (e.g. topBlock()).

    blockSpec is a formatted string consisting of plain words and
    reserved words starting with the percent character (%), which
    represent the following pre-defined input slots and/or label
    features:

    arity: single

    %br     - user-forced line break
    %s      - white rectangular type-in slot ("string-type")
    %txt    - white rectangular type-in slot ("text-type")
    %mlt    - white rectangular type-in slot ("multi-line-text-type")
    %code   - white rectangular type-in slot, monospaced font
    %n      - white roundish type-in slot ("numerical")
    %dir    - white roundish type-in slot with drop-down for directions
    %inst   - white roundish type-in slot with drop-down for instruments
    %ida    - white roundish type-in slot with drop-down for list indices
    %idx    - white roundish type-in slot for indices incl. "any"
    %obj    - specially drawn slot for object reporters
    %spr    - chameleon colored rectangular drop-down for object-names
    %col    - chameleon colored rectangular drop-down for collidables
    %dst    - chameleon colored rectangular drop-down for distances
    %cst    - chameleon colored rectangular drop-down for costume-names
    %eff    - chameleon colored rectangular drop-down for graphic effects
    %snd    - chameleon colored rectangular drop-down for sound names
    %key    - chameleon colored rectangular drop-down for keyboard keys
    %msg    - chameleon colored rectangular drop-down for messages
    %att    - chameleon colored rectangular drop-down for attributes
    %fun    - chameleon colored rectangular drop-down for math functions
    %typ    - chameleon colored rectangular drop-down for data types
    %var    - chameleon colored rectangular drop-down for variable names
    %shd    - Chameleon colored rectuangular drop-down for shadowed var names
    %lst    - chameleon colored rectangular drop-down for list names
    %b      - chameleon colored hexagonal slot (for predicates)
    %bool   - chameleon colored hexagonal slot (for predicates), static
    %l      - list icon
    %c      - C-shaped command slot, special form for primitives
    %cs     - C-shaped, auto-reifying, accepts reporter drops
    %cl     - C-shaped, auto-reifying, rejects reporters
    %clr    - interactive color slot
    %t      - inline variable reporter template
    %anyUE  - white rectangular type-in slot, unevaluated if replaced
    %boolUE - chameleon colored hexagonal slot, unevaluated if replaced
    %f      - round function slot, unevaluated if replaced,
    %r      - round reporter slot
    %p      - hexagonal predicate slot

    rings:

    %cmdRing    - command slotted ring with %ringparms
    %repRing    - round slotted ringn with %ringparms
    %predRing   - diamond slotted ring with %ringparms

    arity: multiple

    %mult%x    - where %x stands for any of the above single inputs
    %inputs - for an additional text label 'with inputs'
    %words - for an expandable list of default 2 (used in JOIN)
    %exp - for a static expandable list of minimum 0 (used in LIST)
    %scriptVars - for an expandable list of variable reporter templates
    %parms - for an expandable list of formal parameters
    %ringparms - the same for use inside Rings

    special form: upvar

    %upvar - same as %t (inline variable reporter template)

    special form: input name

    %inputName - variable blob (used in input type dialog)

    examples:

        'if %b %c else %c'        - creates Scratch's If/Else block
        'set pen color to %clr'    - creates Scratch's Pen color block
        'list %mult%s'            - creates BYOB's list reporter block
        'call %n %inputs'        - creates BYOB's Call block
        'the script %parms %c'    - creates BYOB's THE SCRIPT block
*/

// BlockMorph inherits from SyntaxElementMorph:

BlockMorph.prototype = new SyntaxElementMorph();
BlockMorph.prototype.constructor = BlockMorph;
BlockMorph.uber = SyntaxElementMorph.prototype;

// BlockMorph preferences settings:

BlockMorph.prototype.isCachingInputs = true;
BlockMorph.prototype.zebraContrast = 40; // alternating color brightness

// BlockMorph sound feedback:

BlockMorph.prototype.snapSound = null;

BlockMorph.prototype.toggleSnapSound = function () {
    if (this.snapSound !== null) {
        this.snapSound = null;
    } else {
        BlockMorph.prototype.snapSound = document.createElement('audio');
        BlockMorph.prototype.snapSound.src = 'click.wav';
    }
    CommentMorph.prototype.snapSound = BlockMorph.prototype.snapSound;
};

// BlockMorph instance creation:

function BlockMorph() {
    this.init();
}

BlockMorph.prototype.init = function (silently) {
    this.id = null;
    this.selector = null; // name of method to be triggered
    this.blockSpec = ''; // formal description of label and arguments
    this.comment = null; // optional "sticky" comment morph

    // not to be persisted:
    this.instantiationSpec = null; // spec to set upon fullCopy() of template
    this.category = null; // for zebra coloring (non persistent)

    BlockMorph.uber.init.call(this, silently);
    this.color = new Color(0, 17, 173);
    this.cashedInputs = null;
};

BlockMorph.prototype.receiver = function () {
    // answer the object to which I apply (whose method I represent)
    var up = this.parent;
    while (!!up) {
        if (up.owner) {
            return up.owner;
        }
        up = up.parent;
    }
    return null;
};

BlockMorph.prototype.toString = function () {
    return 'a ' +
        (this.constructor.name ||
            this.constructor.toString().split(' ')[1].split('(')[0]) +
        ' ("' +
        this.blockSpec.slice(0, 30) + '...")';
};

// BlockMorph spec:

BlockMorph.prototype.parseSpec = function (spec) {
    var result = [],
        words,
        word = '';

    words = isString(spec) ? spec.split(' ') : [];
    if (words.length === 0) {
        words = [spec];
    }
    if (this.labelWordWrap) {
        return words;
    }

    function addWord(w) {
        if ((w[0] === '%') && (w.length > 1)) {
            if (word !== '') {
                result.push(word);
                word = '';
            }
            result.push(w);
        } else {
            if (word !== '') {
                word += ' ' + w;
            } else {
                word = w;
            }
        }
    }

    words.forEach(function (each) {
        addWord(each);
    });
    if (word !== '') {
        result.push(word);
    }
    return result;
};

BlockMorph.prototype.setSpec = function (spec, silently) {
    var myself = this,
        part,
        inputIdx = -1;

    if (!spec) {return; }
    this.parts().forEach(function (part) {
        part.destroy();
    });
    if (this.isPrototype) {
        this.add(this.placeHolder());
    }
    this.parseSpec(spec).forEach(function (word) {
        if (word[0] === '%') {
            inputIdx += 1;
        }
        part = myself.labelPart(word);
        myself.add(part);
        if (!(part instanceof CommandSlotMorph ||
                part instanceof StringMorph)) {
            part.drawNew();
        }
        if (part instanceof RingMorph) {
            part.fixBlockColor();
        }
        if (part instanceof MultiArgMorph ||
                part.constructor === CommandSlotMorph ||
                part.constructor === RingCommandSlotMorph) {
            part.fixLayout();
        }
        if (myself.isPrototype) {
            myself.add(myself.placeHolder());
        }
        if (part instanceof InputSlotMorph && myself.definition) {
            part.setChoices.apply(
                part,
                myself.definition.inputOptionsOfIdx(inputIdx)
            );
        }
    });
    this.blockSpec = spec;
    this.fixLayout(silently);
    this.cachedInputs = null;
};

BlockMorph.prototype.userSetSpec = function (spec) {
    var tb = this.topBlock();
    tb.fullChanged();
    this.setSpec(spec);
    tb.fullChanged();
};

BlockMorph.prototype.buildSpec = function () {
    // create my blockSpec from my parts - for demo purposes only
    var myself = this;
    this.blockSpec = '';
    this.parts().forEach(function (part) {
        if (part instanceof StringMorph) {
            myself.blockSpec += part.text;
        } else if (part instanceof ArgMorph) {
            myself.blockSpec += part.getSpec();
        } else if (part.isBlockLabelBreak) {
            myself.blockSpec += part.getSpec();
        } else {
            myself.blockSpec += '[undefined]';
        }
        myself.blockSpec += ' ';
    });
    this.blockSpec = this.blockSpec.trim();
};

BlockMorph.prototype.rebuild = function (contrast) {
    // rebuild my label fragments, for use in ToggleElementMorphs
    this.setSpec(this.blockSpec);
    if (contrast) {
        this.inputs().forEach(function (input) {
            if (input instanceof ReporterBlockMorph) {
                input.setColor(input.color.lighter(contrast));
                input.setSpec(input.blockSpec);
            }
        });
    }
};

// BlockMorph menu:

BlockMorph.prototype.userMenu = function () {
    var menu = new MenuMorph(this),
        world = this.world(),
        myself = this,
        shiftClicked = world.currentKey === 16,
        proc = this.activeProcess(),
        vNames = proc && proc.context && proc.context.outerContext ?
                proc.context.outerContext.variables.names() : [],
        alternatives,
        top,
        blck;

    function addOption(label, toggle, test, onHint, offHint) {
        var on = '\u2611 ',
            off = '\u2610 ';
        menu.addItem(
            (test ? on : off) + localize(label),
            toggle,
            test ? onHint : offHint
        );
    }

    menu.addItem(
        "help...",
        'showHelp'
    );
    if (shiftClicked) {
        top = this.topBlock();
        if (top instanceof ReporterBlockMorph) {
            menu.addItem(
                "script pic with result...",
                function () {
                    top.ExportResultPic();
                },
                'open a new window\n' +
                    'with a picture of both\nthis script and its result',
                new Color(100, 0, 0)
            );
        }
    }
    if (this.isTemplate) {
        if (!(this.parent instanceof SyntaxElementMorph)) {
            if (this.selector === 'reportGetVar') {
                addOption(
                    'transient',
                    'toggleTransientVariable',
                    myself.isTransientVariable(),
                    'uncheck to save contents\nin the project',
                    'check to prevent contents\nfrom being saved'
                );
            } else if (this.selector !== 'evaluateCustomBlock') {
                menu.addItem(
                    "hide",
                    'hidePrimitive'
                );
            }
            if (StageMorph.prototype.enableCodeMapping) {
                menu.addLine();
                menu.addItem(
                    'header mapping...',
                    'mapToHeader'
                );
                menu.addItem(
                    'code mapping...',
                    'mapToCode'
                );
            }
        }
        return menu;
    }
    menu.addLine();
    if (this.selector === 'reportGetVar') {
        blck = this.fullCopy();
        blck.addShadow();
        menu.addItem(
            'rename...',
            function () {
                new DialogBoxMorph(
                    myself,
                    function(spec) {
                        var id = SnapCollaborator.getId(this);
                        SnapCollaborator.setBlockSpec(id, spec);
                    },
                    myself
                ).prompt(
                    "Variable name",
                    myself.blockSpec,
                    world,
                    blck.fullImage(), // pic
                    InputSlotMorph.prototype.getVarNamesDict.call(myself)
                );
            }
        );
    } else if (SpriteMorph.prototype.blockAlternatives[this.selector]) {
        menu.addItem(
            'relabel...',
            function () {
                myself.relabel(
                    SpriteMorph.prototype.blockAlternatives[myself.selector]
                );
            }
        );
    } else if (this.definition && this.alternatives) { // custom block
        alternatives = this.alternatives();
        if (alternatives.length > 0) {
            menu.addItem(
                'relabel...',
                function () {myself.relabel(alternatives); }
            );
        }
    }

    menu.addItem(
        "duplicate",
        function () {
            var dup = myself.fullCopy(),
                ide = myself.parentThatIsA(IDE_Morph);
            dup.id = null;
            dup.pickUp(world);
            if (ide) {
                world.hand.grabOrigin = {
                    origin: ide.palette,
                    position: ide.palette.center()
                };
            }
        },
        'make a copy\nand pick it up'
    );
    if (this instanceof CommandBlockMorph && this.nextBlock()) {
        menu.addItem(
            (proc ? this.fullCopy() : this).thumbnail(0.5, 60),
            function () {
                var cpy = myself.fullCopy(),
                    nb = cpy.nextBlock(),
                    ide = myself.parentThatIsA(IDE_Morph);
                if (nb) {nb.destroy(); }
                cpy.id = null;
                cpy.pickUp(world);
                if (ide) {
                    world.hand.grabOrigin = {
                        origin: ide.palette,
                        position: ide.palette.center()
                    };
                }
            },
            'only duplicate this block'
        );
    }
    menu.addItem(
        "delete", function() {
        if (this.id) {
            SnapCollaborator.removeBlock(this.id, true);
        } else {
            this.userDestroy();
        }
    });
    menu.addItem(
        "script pic...",
        function () {
            var ide = myself.parentThatIsA(IDE_Morph) ||
                myself.parentThatIsA(BlockEditorMorph).target.parentThatIsA(
                    IDE_Morph
            );
            ide.saveCanvasAs(
                myself.topBlock().scriptPic(),
                ide.projetName || localize('Untitled') + ' ' +
                    localize('script pic'),
                true // request new window
            );
        },
        'open a new window\nwith a picture of this script'
    );
    if (proc) {
        if (vNames.length) {
            menu.addLine();
            vNames.forEach(function (vn) {
                menu.addItem(
                    vn + '...',
                    function () {
                        proc.doShowVar(vn);
                    }
                );
            });
        }
        return menu;
    }
    if (this.parent.parentThatIsA(RingMorph)) {
        menu.addLine();
        menu.addItem("unringify", function() {
            SnapCollaborator.unringify(this.id);
        });
        menu.addItem("ringify", function() {
            SnapCollaborator.ringify(this.id);
        });
        return menu;
    }
    if (this.parent instanceof ReporterSlotMorph
            || (this.parent instanceof CommandSlotMorph)
            || (this instanceof HatBlockMorph)
            || (this instanceof CommandBlockMorph
                && (this.topBlock() instanceof HatBlockMorph))) {
        return menu;
    }
    menu.addLine();
    menu.addItem("ringify", function() {
        SnapCollaborator.ringify(this.id);
    });
    if (StageMorph.prototype.enableCodeMapping) {
        menu.addLine();
        menu.addItem(
            'header mapping...',
            'mapToHeader'
        );
        menu.addItem(
            'code mapping...',
            'mapToCode'
        );
    }
    return menu;
};

BlockMorph.prototype.developersMenu = function () {
    var menu = BlockMorph.uber.developersMenu.call(this);
    menu.addLine();
    menu.addItem("delete block", 'deleteBlock');  // TODO: Send this through collaborator
    menu.addItem("spec...", function () {

        new DialogBoxMorph(
            this,
            function(spec) {
                var id = SnapCollaborator.getId(this);
                SnapCollaborator.setBlockSpec(id, spec);
            },
            this
        ).prompt(
            menu.title + '\nspec',
            this.blockSpec,
            this.world()
        );
    });
    return menu;
};

BlockMorph.prototype.hidePrimitive = function () {
    var ide = this.parentThatIsA(IDE_Morph),
        dict,
        cat;
    if (!ide) {return; }
    StageMorph.prototype.hiddenPrimitives[this.selector] = true;
    dict = {
        doWarp: 'control',
        reifyScript: 'operators',
        reifyReporter: 'operators',
        reifyPredicate: 'operators',
        doDeclareVariables: 'variables'
    };
    cat = dict[this.selector] || this.category;
    if (cat === 'lists') {cat = 'variables'; }
    ide.flushBlocksCache(cat);
    ide.refreshPalette();
};

BlockMorph.prototype.isTransientVariable = function () {
    // private - only for variable getter template inside the palette
    var varFrame = this.receiver().variables.silentFind(this.blockSpec);
    return varFrame ? varFrame.vars[this.blockSpec].isTransient : false;
};

BlockMorph.prototype.toggleTransientVariable = function () {
    // private - only for variable getter template inside the palette
    var varFrame = this.receiver().variables.silentFind(this.blockSpec);
    if (!varFrame) {return; }
    varFrame.vars[this.blockSpec].isTransient =
        !(varFrame.vars[this.blockSpec].isTransient);
};

BlockMorph.prototype.deleteBlock = function () {
    // delete just this one block, keep inputs and next block around
    var scripts = this.parentThatIsA(ScriptsMorph),
        nb = this.nextBlock ? this.nextBlock() : null,
        tobefixed,
        isindef;
    if (scripts) {
        if (nb) {
            scripts.add(nb);
        }
        this.inputs().forEach(function (inp) {
            if (inp instanceof BlockMorph) {
                scripts.add(inp);
            }
        });
    }
    if (this instanceof ReporterBlockMorph) {
        if (this.parent instanceof BlockMorph) {
            this.parent.revertToDefaultInput(this);
        }
    } else { // CommandBlockMorph
        if (this.parent) {
            if (this.parent.fixLayout) {
                tobefixed = this.parentThatIsA(ArgMorph);
            }
        } else { // must be in a custom block definition
            isindef = true;
        }
    }
    this.destroy();
    if (isindef) {
        /*
            since the definition's body still points to this block
            even after it has been destroyed, mark it to be deleted
            later.
        */
        this.isCorpse = true;
    }
    if (tobefixed) {
        tobefixed.fixLayout();
    }
};

BlockMorph.prototype.ringify = function () {
    // wrap a Ring around me
    var ring = new RingMorph(),
        top = this.topBlock(),
        center = top.fullBounds().center();

    if (this.parent === null) {return null; }
    top.fullChanged();
    if (this.parent instanceof SyntaxElementMorph) {
        if (this instanceof ReporterBlockMorph) {
            this.parent.silentReplaceInput(this, ring);
            ring.embed(this);
        } else if (top) { // command
            top.parent.add(ring);
            ring.embed(top);
            ring.setCenter(center);
        }
    } else {
        this.parent.add(ring);
        ring.embed(this);
        ring.setCenter(center);
    }
    this.fixBlockColor(null, true);
    top.fullChanged();
    return ring;
};

BlockMorph.prototype.unringify = function () {
    // remove a Ring around me, if any
    var ring = this.parent.parentThatIsA(RingMorph),
        top = this.topBlock(),
        scripts = this.parentThatIsA(ScriptsMorph),
        block,
        center;

    if (ring === null) {return null; }
    block = ring.contents();
    center = ring.center();

    top.fullChanged();
    if (ring.parent instanceof SyntaxElementMorph) {
        if (block instanceof ReporterBlockMorph) {
            ring.parent.silentReplaceInput(ring, block);
        } else if (scripts) {
            scripts.add(block);
            block.setFullCenter(center);
            block.moveBy(20);
            ring.parent.revertToDefaultInput(ring);
        }
    } else {
        ring.parent.add(block);
        block.setFullCenter(center);
        ring.destroy();
    }
    this.fixBlockColor(null, true);
    top.fullChanged();
    return ring;
};

BlockMorph.prototype.relabel = function (alternativeSelectors) {
    var menu = new MenuMorph(this),
        oldInputs = this.inputs(),
        myself = this;
    alternativeSelectors.forEach(function (sel) {
        var block = SpriteMorph.prototype.blockForSelector(sel);
        block.restoreInputs(oldInputs);
        block.fixBlockColor(null, true);
        block.addShadow(new Point(3, 3));
        menu.addItem(
            block,
            function () {
                SnapCollaborator.setSelector(myself.id, sel);
            }
        );
    });
    menu.popup(this.world(), this.bottomLeft().subtract(new Point(
        8,
        this instanceof CommandBlockMorph ? this.corner : 0
    )));
};

BlockMorph.prototype.setSelector = function (aSelector) {
    // private - used only for relabel()
    var oldInputs = this.inputs(),
        info;
    info = SpriteMorph.prototype.blocks[aSelector];
    this.setCategory(info.category);
    this.selector = aSelector;
    this.setSpec(localize(info.spec));
    this.restoreInputs(oldInputs);
    this.fixLabelColor();
};

BlockMorph.prototype.restoreInputs = function (oldInputs) {
    // private - used only for relabel()
    // try to restore my previous inputs when my spec has been changed
    var i = 0,
        old,
        nb,
        myself = this;

    this.inputs().forEach(function (inp) {
        old = oldInputs[i];
        if (old instanceof ReporterBlockMorph) {
            myself.silentReplaceInput(inp, old.fullCopy());
        } else if (old && inp instanceof InputSlotMorph) {
            // original - turns empty numberslots to 0:
            // inp.setContents(old.evaluate());
            // "fix" may be wrong b/c constants
            if (old.contents) {
                inp.setContents(old.contents().text);
            }
        } else if (old instanceof CSlotMorph && inp instanceof CSlotMorph) {
            nb = old.nestedBlock();
            if (nb) {
                inp.nestedBlock(nb.fullCopy());
            }
        }
        i += 1;
    });
    this.cachedInputs = null;
};

BlockMorph.prototype.showHelp = function () {
    var myself = this,
        ide = this.parentThatIsA(IDE_Morph),
        blockEditor,
        pic = new Image(),
        help,
        comment,
        block,
        isCustomBlock = this.selector === 'evaluateCustomBlock',
        spec = isCustomBlock ?
                this.definition.helpSpec() : this.selector,
        ctx;

    if (!ide) {
        blockEditor = this.parentThatIsA(BlockEditorMorph);
        if (blockEditor) {
            ide = blockEditor.target.parentThatIsA(IDE_Morph);
        }
    }

    pic.onload = function () {
        help = newCanvas(new Point(pic.width, pic.height), true); // nonRetina
        ctx = help.getContext('2d');
        ctx.drawImage(pic, 0, 0);
        new DialogBoxMorph().inform(
            'Help',
            null,
            myself.world(),
            help
        );
    };

    if (isCustomBlock && this.definition.comment) {
        block = this.fullCopy();
        block.addShadow();
        comment = this.definition.comment.fullCopy();
        comment.contents.parse();
        help = '';
        comment.contents.lines.forEach(function (line) {
            help = help + '\n' + line;
        });
        new DialogBoxMorph().inform(
            'Help',
            help.substr(1),
            myself.world(),
            block.fullImage()
        );
    } else {
        pic.src = ide.resourceURL('help', spec + '.png');
    }
};

// BlockMorph code mapping

/*
    code mapping lets you use blocks to generate arbitrary text-based
    source code that can be exported and compiled / embedded elsewhere,
    it's not part of Snap's evaluator and not needed for Snap itself
*/

BlockMorph.prototype.mapToHeader = function () {
    // open a dialog box letting the user map header code via the GUI
    var key = this.selector.substr(0, 5) === 'reify' ?
            'reify' : this.selector,
        block = this.codeDefinitionHeader(),
        myself = this,
        help,
        pic;
    block.addShadow(new Point(3, 3));
    pic = block.fullImageClassic();
    if (this.definition) {
        help = 'Enter code that corresponds to the block\'s definition. ' +
            'Use the formal parameter\nnames as shown and <body> to ' +
            'reference the definition body\'s generated text code.';
    } else {
        help = 'Enter code that corresponds to the block\'s definition. ' +
            'Choose your own\nformal parameter names (ignoring the ones ' +
            'shown).';
    }
    new DialogBoxMorph(
        this,
        function (code) {
            if (key === 'evaluateCustomBlock') {
                myself.definition.codeHeader = code;
            } else {
                StageMorph.prototype.codeHeaders[key] = code;
            }
        },
        this
    ).promptCode(
        'Header mapping',
        key === 'evaluateCustomBlock' ? this.definition.codeHeader || ''
                 : StageMorph.prototype.codeHeaders[key] || '',
        this.world(),
        pic,
        help
    );
};

BlockMorph.prototype.mapToCode = function () {
    // open a dialog box letting the user map code via the GUI
    var key = this.selector.substr(0, 5) === 'reify' ?
            'reify' : this.selector,
        block = this.codeMappingHeader(),
        myself = this,
        pic;
    block.addShadow(new Point(3, 3));
    pic = block.fullImageClassic();
    new DialogBoxMorph(
        this,
        function (code) {
            if (key === 'evaluateCustomBlock') {
                myself.definition.codeMapping = code;
            } else {
                StageMorph.prototype.codeMappings[key] = code;
            }
        },
        this
    ).promptCode(
        'Code mapping',
        key === 'evaluateCustomBlock' ? this.definition.codeMapping || ''
                 : StageMorph.prototype.codeMappings[key] || '',
        this.world(),
        pic,
        'Enter code that corresponds to the block\'s operation ' +
            '(usually a single\nfunction invocation). Use <#n> to ' +
            'reference actual arguments as shown.'
    );
};

BlockMorph.prototype.mapHeader = function (aString, key) {
    // primitive for programatically mapping header code
    var sel = key || this.selector.substr(0, 5) === 'reify' ?
            'reify' : this.selector;
    if (aString) {
        if (this.definition) { // custom block
            this.definition.codeHeader = aString;
        } else {
            StageMorph.prototype.codeHeaders[sel] = aString;
        }
    }
};

BlockMorph.prototype.mapCode = function (aString, key) {
    // primitive for programatically mapping code
    var sel = key || this.selector.substr(0, 5) === 'reify' ?
            'reify' : this.selector;
    if (aString) {
        if (this.definition) { // custom block
            this.definition.codeMapping = aString;
        } else {
            StageMorph.prototype.codeMappings[sel] = aString;
        }
    }
};

BlockMorph.prototype.mappedCode = function (definitions) {
    var key = this.selector.substr(0, 5) === 'reify' ?
            'reify' : this.selector,
        code,
        codeLines,
        count = 1,
        header,
        headers,
        headerLines,
        body,
        bodyLines,
        defKey = this.definition ? this.definition.spec : key,
        defs = definitions || {},
        parts = [];
    code = key === 'reportGetVar' ? this.blockSpec
            : this.definition ? this.definition.codeMapping || ''
                    : StageMorph.prototype.codeMappings[key] || '';

    // map header
    if (key !== 'reportGetVar' && !defs.hasOwnProperty(defKey)) {
        defs[defKey] = null; // create the property for recursive definitions
        if (this.definition) {
            header = this.definition.codeHeader || '';
            if (header.indexOf('<body') !== -1) { // replace with def mapping
                body = '';
                if (this.definition.body) {
                    body = this.definition.body.expression.mappedCode(defs);
                }
                bodyLines = body.split('\n');
                headerLines = header.split('\n');
                headerLines.forEach(function (headerLine, idx) {
                    var prefix = '',
                        indent;
                    if (headerLine.trimLeft().indexOf('<body') === 0) {
                        indent = headerLine.indexOf('<body');
                        prefix = headerLine.slice(0, indent);
                    }
                    headerLines[idx] = headerLine.replace(
                        new RegExp('<body>'),
                        bodyLines.join('\n' + prefix)
                    );
                    headerLines[idx] = headerLines[idx].replace(
                        new RegExp('<body>', 'g'),
                        bodyLines.join('\n')
                    );
                });
                header = headerLines.join('\n');
            }
            defs[defKey] = header;
        } else {
            defs[defKey] = StageMorph.prototype.codeHeaders[defKey];
        }
    }

    codeLines = code.split('\n');
    this.inputs().forEach(function (input) {
        parts.push(input.mappedCode(defs).toString());
    });
    parts.forEach(function (part) {
        var partLines = part.split('\n'),
            placeHolder = '<#' + count + '>',
            rx = new RegExp(placeHolder, 'g');
        codeLines.forEach(function (codeLine, idx) {
            var prefix = '',
                indent;
            if (codeLine.trimLeft().indexOf(placeHolder) === 0) {
                indent = codeLine.indexOf(placeHolder);
                prefix = codeLine.slice(0, indent);
            }
            codeLines[idx] = codeLine.replace(
                new RegExp(placeHolder),
                partLines.join('\n' + prefix)
            );
            codeLines[idx] = codeLines[idx].replace(rx, partLines.join('\n'));
        });
        count += 1;
    });
    code = codeLines.join('\n');
    if (this.nextBlock && this.nextBlock()) { // Command
        code += ('\n' + this.nextBlock().mappedCode(defs));
    }
    if (!definitions) { // top-level, add headers
        headers = [];
        Object.keys(defs).forEach(function (each) {
            if (defs[each]) {
                headers.push(defs[each]);
            }
        });
        if (headers.length) {
            return headers.join('\n\n')
                + '\n\n'
                + code;
        }
    }
    return code;
};

BlockMorph.prototype.codeDefinitionHeader = function () {
    var block = this.definition ? new PrototypeHatBlockMorph(this.definition)
            : SpriteMorph.prototype.blockForSelector(this.selector),
        hat = new HatBlockMorph(),
        count = 1;

    if (this.definition) {return block; }
    block.inputs().forEach(function (input) {
        var part = new TemplateSlotMorph('#' + count);
        block.silentReplaceInput(input, part);
        count += 1;
    });
    block.isPrototype = true;
    hat.setCategory("control");
    hat.setSpec('%s');
    hat.silentReplaceInput(hat.inputs()[0], block);
    if (this.category === 'control') {
        hat.alternateBlockColor();
    }
    return hat;
};

BlockMorph.prototype.codeMappingHeader = function () {
    var block = this.definition ? this.definition.blockInstance()
            : SpriteMorph.prototype.blockForSelector(this.selector),
        hat = new HatBlockMorph(),
        count = 1;

    block.inputs().forEach(function (input) {
        var part = new TemplateSlotMorph('<#' + count + '>');
        block.silentReplaceInput(input, part);
        count += 1;
    });
    block.isPrototype = true;
    hat.setCategory("control");
    hat.setSpec('%s');
    hat.silentReplaceInput(hat.inputs()[0], block);
    if (this.category === 'control') {
        hat.alternateBlockColor();
    }
    return hat;
};

// BlockMorph drawing

BlockMorph.prototype.eraseHoles = function (context) {
    var myself = this,
        isRing = this instanceof RingMorph,
        shift = this.edge * 0.5,
        gradient,
        rightX,
        holes = this.parts().filter(function (part) {
            return part.isHole;
        });

    if (this.isPredicate && (holes.length > 0)) {
        rightX = this.width() - this.rounding;
        context.clearRect(
            rightX,
            0,
            this.width(),
            this.height()
        );

        // draw a 3D-ish vertical right edge
        gradient = context.createLinearGradient(
            rightX - this.edge,
            0,
            this.width(),
            0
        );
        gradient.addColorStop(0, this.color.toString());
        gradient.addColorStop(1, this.dark());
        context.lineWidth = this.edge;
        context.lineJoin = 'round';
        context.lineCap = 'round';
        context.strokeStyle = gradient;
        context.beginPath();
        context.moveTo(rightX - shift, this.edge + shift);
        context.lineTo(rightX - shift, this.height() - this.edge - shift);
        context.stroke();
    }
    holes.forEach(function (hole) {
        var w = hole.width(),
            h = Math.floor(hole.height()) - 2; // Opera needs this
        context.clearRect(
            hole.bounds.origin.x - myself.bounds.origin.x + 1,
            hole.bounds.origin.y - myself.bounds.origin.y + 1,
            isRing ? w - 2 : w + 1,
            h
        );
    });

};

// BlockMorph highlighting

BlockMorph.prototype.addHighlight = function (oldHighlight) {
    var isHidden = !this.isVisible,
        highlight;

    if (isHidden) {this.show(); }
    highlight = this.highlight(
        oldHighlight ? oldHighlight.color : this.activeHighlight,
        this.activeBlur,
        this.activeBorder
    );
    this.addBack(highlight);
    this.fullChanged();
    if (isHidden) {this.hide(); }
    return highlight;
};

BlockMorph.prototype.addErrorHighlight = function () {
    var isHidden = !this.isVisible,
        highlight;

    if (isHidden) {this.show(); }
    this.removeHighlight();
    highlight = this.highlight(
        this.errorHighlight,
        this.activeBlur,
        this.activeBorder
    );
    this.addBack(highlight);
    this.fullChanged();
    if (isHidden) {this.hide(); }
    return highlight;
};

BlockMorph.prototype.removeHighlight = function () {
    var highlight = this.getHighlight();
    if (highlight !== null) {
        this.fullChanged();
        this.removeChild(highlight);
    }
    return highlight;
};

BlockMorph.prototype.toggleHighlight = function () {
    if (this.getHighlight()) {
        this.removeHighlight();
    } else {
        this.addHighlight();
    }
};

BlockMorph.prototype.highlight = function (color, blur, border) {
    var highlight = new BlockHighlightMorph(),
        fb = this.fullBounds(),
        edge = useBlurredShadows && !MorphicPreferences.isFlat ?
                blur : border;
    highlight.setExtent(fb.extent().add(edge * 2));
    highlight.color = color;
    highlight.image = useBlurredShadows && !MorphicPreferences.isFlat ?
            this.highlightImageBlurred(color, blur)
                : this.highlightImage(color, border);
    highlight.setPosition(fb.origin.subtract(new Point(edge, edge)));
    return highlight;
};

BlockMorph.prototype.highlightImage = function (color, border) {
    var fb, img, hi, ctx, out;
    fb = this.fullBounds().extent();
    img = this.fullImage();

    hi = newCanvas(fb.add(border * 2));
    ctx = hi.getContext('2d');

    ctx.drawImage(img, 0, 0);
    ctx.drawImage(img, border, 0);
    ctx.drawImage(img, border * 2, 0);
    ctx.drawImage(img, border * 2, border);
    ctx.drawImage(img, border * 2, border * 2);
    ctx.drawImage(img, border, border * 2);
    ctx.drawImage(img, 0, border * 2);
    ctx.drawImage(img, 0, border);

    ctx.globalCompositeOperation = 'destination-out';
    ctx.drawImage(img, border, border);

    out = newCanvas(fb.add(border * 2));
    ctx = out.getContext('2d');
    ctx.drawImage(hi, 0, 0);
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = color.toString();
    ctx.fillRect(0, 0, out.width, out.height);

    return out;
};

BlockMorph.prototype.highlightImageBlurred = function (color, blur) {
    var fb, img, hi, ctx;
    fb = this.fullBounds().extent();
    img = this.fullImage();

    hi = newCanvas(fb.add(blur * 2));
    ctx = hi.getContext('2d');
    ctx.shadowBlur = blur;
    ctx.shadowColor = color.toString();
    ctx.drawImage(img, blur, blur);

    ctx.shadowBlur = 0;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.drawImage(img, blur, blur);
    return hi;
};

BlockMorph.prototype.getHighlight = function () {
    var highlights;
    highlights = this.children.slice(0).reverse().filter(
        function (child) {
            return child instanceof BlockHighlightMorph;
        }
    );
    if (highlights.length !== 0) {
        return highlights[0];
    }
    return null;
};

BlockMorph.prototype.outline = function (color, border) {
    var highlight = new BlockHighlightMorph(),
        fb = this.fullBounds(),
        edge = border;
    highlight.setExtent(fb.extent().add(edge * 2));
    highlight.color = color;
    highlight.image = this.highlightImage(color, border);
    highlight.setPosition(fb.origin.subtract(new Point(edge, edge)));
    return highlight;
};

// BlockMorph zebra coloring

BlockMorph.prototype.fixBlockColor = function (nearestBlock, isForced) {
    var nearest = nearestBlock,
        clr,
        cslot;

    if (!this.zebraContrast && !isForced) {
        return;
    }
    if (!this.zebraContrast && isForced) {
        return this.forceNormalColoring();
    }

    if (!nearest) {
        if (this.parent) {
            if (this.isPrototype) {
                nearest = null; // this.parent; // the PrototypeHatBlockMorph
            } else if (this instanceof ReporterBlockMorph) {
                nearest = this.parent.parentThatIsA(BlockMorph);
            } else { // command
                cslot = this.parentThatIsA(CommandSlotMorph);
                if (cslot) {
                    nearest = cslot.parentThatIsA(BlockMorph);
                }
            }
        }
    }
    if (!nearest) { // top block
        clr = SpriteMorph.prototype.blockColor[this.category];
        if (!this.color.eq(clr)) {
            this.alternateBlockColor();
        }
    } else if (nearest.category === this.category) {
        if (nearest.color.eq(this.color)) {
            this.alternateBlockColor();
        }
    } else if (this.category && !this.color.eq(
            SpriteMorph.prototype.blockColor[this.category]
        )) {
        this.alternateBlockColor();
    }
    if (isForced) {
        this.fixChildrensBlockColor(true);
    }
};

BlockMorph.prototype.forceNormalColoring = function () {
    var clr = SpriteMorph.prototype.blockColor[this.category];
    this.setColor(clr, true); // silently
    this.setLabelColor(
        new Color(255, 255, 255),
        clr.darker(this.labelContrast),
        new Point(-1, -1)
    );
    this.fixChildrensBlockColor(true);
};

BlockMorph.prototype.alternateBlockColor = function () {
    var clr = SpriteMorph.prototype.blockColor[this.category];

    if (this.color.eq(clr)) {
        this.setColor(
            this.zebraContrast < 0 ? clr.darker(Math.abs(this.zebraContrast))
                : clr.lighter(this.zebraContrast),
            this.hasLabels() // silently
        );
    } else {
        this.setColor(clr, this.hasLabels()); // silently
    }
    this.fixLabelColor();
    this.fixChildrensBlockColor(true); // has issues if not forced
};

BlockMorph.prototype.ghost = function () {
    this.setColor(
        SpriteMorph.prototype.blockColor[this.category].lighter(35)
    );
};

BlockMorph.prototype.fixLabelColor = function () {
    if (this.zebraContrast > 0 && this.category) {
        var clr = SpriteMorph.prototype.blockColor[this.category];
        if (this.color.eq(clr)) {
            this.setLabelColor(
                new Color(255, 255, 255),
                clr.darker(this.labelContrast),
                MorphicPreferences.isFlat ? null : new Point(-1, -1)
            );
        } else {
            this.setLabelColor(
                new Color(0, 0, 0),
                clr.lighter(this.zebraContrast)
                    .lighter(this.labelContrast * 2),
                MorphicPreferences.isFlat ? null : new Point(1, 1)
            );
        }
    }
};

BlockMorph.prototype.fixChildrensBlockColor = function (isForced) {
    var myself = this;
    this.children.forEach(function (morph) {
        if (morph instanceof CommandBlockMorph) {
            morph.fixBlockColor(null, isForced);
        } else if (morph instanceof SyntaxElementMorph) {
            morph.fixBlockColor(myself, isForced);
            if (morph instanceof BooleanSlotMorph) {
                morph.drawNew();
            }
        }
    });
};

BlockMorph.prototype.setCategory = function (aString) {
    this.category = aString;
    this.startLayout();
    this.fixBlockColor();
    this.endLayout();
};

BlockMorph.prototype.hasLabels = function () {
    return this.children.some(function (any) {
        return any instanceof StringMorph;
    });
};

// BlockMorph copying

BlockMorph.prototype.fullCopy = function (forClone) {
    if (forClone) {
        if (this.hasBlockVars()) {
            forClone = false;
        } else {
            return copy(this);
        }
    }
    var ans = BlockMorph.uber.fullCopy.call(this);
    ans.id = this.id;
    ans.removeHighlight();
    ans.isDraggable = true;
    if (this.instantiationSpec) {
        ans.setSpec(this.instantiationSpec);
    }
    ans.allChildren().filter(function (block) {
        if (block instanceof SyntaxElementMorph) {
            block.cachedInputs = null;
            if (block.definition) {
                block.initializeVariables();
            }
        }
        return !isNil(block.comment);
    }).forEach(function (block) {
        var cmnt = block.comment.fullCopy();
        block.comment = cmnt;
        cmnt.block = block;
    });
    ans.cachedInputs = null;
    return ans;
};

BlockMorph.prototype.reactToTemplateCopy = function () {
    this.forceNormalColoring();
};

BlockMorph.prototype.hasBlockVars = function () {
    return this.anyChild(function (any) {
        return any.definition && any.definition.variableNames.length;
    });
};

// BlockMorph events

BlockMorph.prototype.mouseClickLeft = function () {
    var top = this.topBlock(),
        receiver = top.receiver(),
        shiftClicked = this.world().currentKey === 16,
        stage;
    if (shiftClicked && !this.isTemplate) {
        return this.focus();
    }
    if (top instanceof PrototypeHatBlockMorph) {
        return top.mouseClickLeft();
    }
    if (receiver) {
        stage = receiver.parentThatIsA(StageMorph);
        if (stage) {
            stage.threads.toggleProcess(top);
        }
    }
};

BlockMorph.prototype.focus = function () {
    var scripts = this.parentThatIsA(ScriptsMorph),
        world = this.world(),
        focus;
    if (!scripts || !ScriptsMorph.prototype.enableKeyboard) {return; }
    if (scripts.focus) {scripts.focus.stopEditing(); }
    world.stopEditing();
    focus = new ScriptFocusMorph(scripts, this);
    scripts.focus = focus;
    focus.getFocus(world);
    if (this instanceof HatBlockMorph) {
        focus.nextCommand();
    }
};

BlockMorph.prototype.activeProcess = function () {
    var top = this.topBlock(),
        receiver = top.receiver(),
        stage;
    if (top instanceof PrototypeHatBlockMorph) {
        return null;
    }
    if (receiver) {
        stage = receiver.parentThatIsA(StageMorph);
        if (stage) {
            return stage.threads.findProcess(top);
        }
    }
    return null;
};

// BlockMorph thumbnail and script pic

BlockMorph.prototype.thumbnail = function (scale, clipWidth) {
    var nb = this.nextBlock(),
        fadeout = 12,
        ext,
        trgt,
        ctx,
        gradient;

    if (nb) {nb.isVisible = false; }
    ext = this.fullBounds().extent();
    trgt = newCanvas(new Point(
        clipWidth ? Math.min(ext.x * scale, clipWidth) : ext.x * scale,
        ext.y * scale
    ));
    ctx = trgt.getContext('2d');
    ctx.scale(scale, scale);
    ctx.drawImage(this.fullImage(), 0, 0);
    // draw fade-out
    if (clipWidth && ext.x * scale > clipWidth) {
        gradient = ctx.createLinearGradient(
            trgt.width / scale - fadeout,
            0,
            trgt.width / scale,
            0
        );
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(1, 'black');
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = gradient;
        ctx.fillRect(
            trgt.width / scale - fadeout,
            0,
            trgt.width / scale,
            trgt.height / scale
        );
    }
    if (nb) {nb.isVisible = true; }
    return trgt;
};

BlockMorph.prototype.scriptPic = function () {
    // answer a canvas image that also includes comments
    var scr = this.fullImage(),
        fb = this.stackFullBounds(),
        pic = newCanvas(fb.extent()),
        ctx = pic.getContext('2d');
    this.allComments().forEach(function (comment) {
        ctx.drawImage(
            comment.fullImageClassic(),
            comment.fullBounds().left() - fb.left(),
            comment.top() - fb.top()
        );
    });
    ctx.drawImage(scr, 0, 0);
    return pic;
};

// BlockMorph dragging and dropping

BlockMorph.prototype.rootForGrab = function () {
    return this;
};

/*
    for demo purposes, allows you to drop arg morphs onto
    blocks and forces a layout update. This section has
    no relevance in end user mode.
*/

BlockMorph.prototype.wantsDropOf = function (aMorph) {
    // override the inherited method
    return (aMorph instanceof ArgMorph
        || aMorph instanceof StringMorph
        || aMorph instanceof TextMorph
    ) && !this.isTemplate;
};

BlockMorph.prototype.reactToDropOf = function (droppedMorph) {
    droppedMorph.isDraggable = false;
    if (droppedMorph instanceof InputSlotMorph) {
        droppedMorph.drawNew();
    } else if (droppedMorph instanceof MultiArgMorph) {
        droppedMorph.fixLayout();
    }
    this.fixLayout();
    this.buildSpec();
};

BlockMorph.prototype.situation = function () {
    // answer a dictionary specifying where I am right now, so
    // I can slide back to it if I'm dropped somewhere else
    var scripts = this.parentThatIsA(ScriptsMorph);
    if (scripts) {
        return {
            origin: scripts,
            position: this.position().subtract(scripts.position())
        };
    }
    return BlockMorph.uber.situation.call(this);
};

// BlockMorph sticky comments

BlockMorph.prototype.prepareToBeGrabbed = function (hand) {
    var myself = this;
    this.allComments().forEach(function (comment) {
        comment.startFollowing(myself, hand.world);
    });
};

BlockMorph.prototype.justDropped = function () {
    this.alpha = 1;
    this.allComments().forEach(function (comment) {
        comment.stopFollowing();
    });
};

BlockMorph.prototype.allComments = function () {
    return this.allChildren().filter(function (block) {
        return !isNil(block.comment);
    }).map(function (block) {
        return block.comment;
    });
};

BlockMorph.prototype.destroy = function () {
    this.allComments().forEach(function (comment) {
        comment.destroy();
    });

    if (!this.parent || !this.parent.topBlock
            && this.activeProcess()) {
        this.activeProcess().stop();
    }

    BlockMorph.uber.destroy.call(this);
};

BlockMorph.prototype.stackHeight = function () {
    var fb = this.fullBounds(),
        commentsBottom = Math.max(this.allComments().map(
            function (comment) {return comment.bottom(); }
        )) || this.bottom();
    return Math.max(fb.bottom(), commentsBottom) - fb.top();
};

BlockMorph.prototype.stackFullBounds = function () {
    var fb = this.fullBounds();
    this.allComments().forEach(function (comment) {
        fb.mergeWith(comment.bounds);
    });
    return fb;
};

BlockMorph.prototype.stackWidth = function () {
    var fb = this.fullBounds(),
        commentsRight = Math.max(this.allComments().map(
            function (comment) {return comment.right(); }
        )) || this.right();
    return Math.max(fb.right(), commentsRight) - fb.left();
};

BlockMorph.prototype.snapTarget = function () {
    return null;
};

BlockMorph.prototype.snap = function () {
    var top = this.topBlock(),
        receiver,
        stage,
        ide;
    top.allComments().forEach(function (comment) {
        comment.align(top);
    });
    // fix highlights, if any
    if (this.getHighlight() && (this !== top)) {
        this.removeHighlight();
    }
    if (top.getHighlight()) {
        top.addHighlight(top.removeHighlight());
    }
    // register generic hat blocks
    if (this.selector === 'receiveCondition') {
        receiver = top.receiver();
        if (receiver) {
            stage = receiver.parentThatIsA(StageMorph);
            if (stage) {
                stage.enableCustomHatBlocks = true;
                stage.threads.pauseCustomHatBlocks = false;
                ide = stage.parentThatIsA(IDE_Morph);
                if (ide) {
                    ide.controlBar.stopButton.refresh();
                }
            }
        }
    }
};

// CommandBlockMorph ///////////////////////////////////////////////////

/*
    I am a stackable jigsaw-shaped block.

    I inherit from BlockMorph adding the following most important
    public accessors:

        nextBlock()       - set / get the block attached to my bottom
        bottomBlock()     - answer the bottom block of my stack
        blockSequence()   - answer an array of blocks starting with myself

    and the following "lexical awareness" indicators:

        partOfCustomCommand - temporary bool set by the evaluator
        exitTag           - temporary string or number set by the evaluator
*/

// CommandBlockMorph inherits from BlockMorph:

CommandBlockMorph.prototype = new BlockMorph();
CommandBlockMorph.prototype.constructor = CommandBlockMorph;
CommandBlockMorph.uber = BlockMorph.prototype;

// CommandBlockMorph instance creation:

function CommandBlockMorph() {
    this.init();
}

CommandBlockMorph.prototype.init = function (silently) {
    CommandBlockMorph.uber.init.call(this, silently);
    this.setExtent(new Point(200, 100), silently);
    this.partOfCustomCommand = false;
    this.exitTag = null;
    // this.cachedNextBlock = null; // don't serialize
};

// CommandBlockMorph enumerating:

CommandBlockMorph.prototype.blockSequence = function () {
    var nb = this.nextBlock(),
        result = [this];
    if (nb) {
        result = result.concat(nb.blockSequence());
    }
    return result;
};

CommandBlockMorph.prototype.bottomBlock = function () {
    // topBlock() also exists - inherited from SyntaxElementMorph
    if (this.nextBlock()) {
        return this.nextBlock().bottomBlock();
    }
    return this;
};

CommandBlockMorph.prototype.nextBlock = function (block) {
    // set / get the block attached to my bottom
    if (block) {
        var nb = this.nextBlock(),
            affected = this.parentThatIsA(CommandSlotMorph);
        this.add(block);
        // this.cachedNextBlock = block;
        if (nb) {
            block.bottomBlock().nextBlock(nb);
        }
        block.setPosition(
            new Point(
                this.left(),
                this.bottom() - (this.corner)
            )
        );
        if (affected) {
            affected.fixLayout();
        }
    } else {
        /* cachedNextBlock - has issues, disabled for now
        if (!this.cachedNextBlock) {
            this.cachedNextBlock = detect(
                this.children,
                function (child) {
                    return child instanceof CommandBlockMorph
                        && !child.isPrototype;
                }
            );
        }
        return this.cachedNextBlock;
        */
        return detect(
            this.children,
            function (child) {
                return child instanceof CommandBlockMorph
                    && !child.isPrototype;
            }
        );
    }
};

// CommandBlockMorph attach targets:

CommandBlockMorph.prototype.topAttachPoint = function () {
    return new Point(
        this.dentCenter(),
        this.top()
    );
};

CommandBlockMorph.prototype.bottomAttachPoint = function () {
    return new Point(
        this.dentCenter(),
        this.bottom()
    );
};

CommandBlockMorph.prototype.dentLeft = function () {
    return this.left()
        + this.corner
        + this.inset;
};

CommandBlockMorph.prototype.dentCenter = function () {
    return this.dentLeft()
        + this.corner
        + (this.dent * 0.5);
};

CommandBlockMorph.prototype.attachTargets = function () {
    var answer = [];
    if (!(this instanceof HatBlockMorph)) {
        if (!(this.parent instanceof SyntaxElementMorph)) {
            answer.push({
                point: this.topAttachPoint(),
                element: this,
                loc: 'top',
                type: 'block'
            });
        }
    }
    if (!this.isStop()) {
        answer.push({
            point: this.bottomAttachPoint(),
            element: this,
            loc: 'bottom',
            type: 'block'
        });
    }
    return answer;
};

CommandBlockMorph.prototype.allAttachTargets = function (newParent) {
    var myself = this,
        target = newParent || this.parent,
        answer = [],
        topBlocks;

    if (this instanceof HatBlockMorph && newParent.rejectsHats) {
        return answer;
    }
    topBlocks = target.children.filter(function (child) {
        return (child !== myself) &&
            child instanceof SyntaxElementMorph &&
            !child.isTemplate;
    });
    topBlocks.forEach(function (block) {
        block.forAllChildren(function (child) {
            if (child.attachTargets) {
                child.attachTargets().forEach(function (at) {
                    answer.push(at);
                });
            }
        });
    });
    return answer;
};

CommandBlockMorph.prototype.closestAttachTarget = function (newParent) {
    var target = newParent || this.parent,
        bottomBlock = this.bottomBlock(),
        answer = null,
        thresh = Math.max(
            this.corner * 2 + this.dent,
            this.minSnapDistance
        ),
        dist,
        ref = [],
        minDist = 1000;

    if (!(this instanceof HatBlockMorph)) {
        ref.push(
            {
                point: this.topAttachPoint(),
                loc: 'top'
            }
        );
    }
    if (!bottomBlock.isStop()) {
        ref.push(
            {
                point: bottomBlock.bottomAttachPoint(),
                loc: 'bottom'
            }
        );
    }

    this.allAttachTargets(target).forEach(function (eachTarget) {
        ref.forEach(function (eachRef) {
            if (eachRef.loc !== eachTarget.loc) {
                dist = eachRef.point.distanceTo(eachTarget.point);
                if ((dist < thresh) && (dist < minDist)) {
                    minDist = dist;
                    answer = eachTarget;
                }
            }
        });
    });
    return answer;
};

CommandBlockMorph.prototype.snapTarget = function () {
    return this.closestAttachTarget();
};

CommandBlockMorph.prototype.snap = function (target) {
    var scripts = this.parentThatIsA(ScriptsMorph),
        next,
        offsetY,
        affected;

    scripts.clearDropHistory();
    scripts.lastDroppedBlock = this;

    if (target === null) {
        this.startLayout();
        this.fixBlockColor();
        this.endLayout();
        CommandBlockMorph.uber.snap.call(this); // align stuck comments
        return;
    }

    scripts.lastDropTarget = target;

    this.startLayout();
    if (target.loc === 'bottom') {
        if (target.type === 'slot') {
            this.removeHighlight();
            scripts.lastNextBlock = target.element.nestedBlock();
            target.element.nestedBlock(this);
        } else {
            scripts.lastNextBlock = target.element.nextBlock();
            target.element.nextBlock(this);
        }
        if (this.isStop()) {
            next = this.nextBlock();
            if (next) {
                scripts.add(next);
                next.moveBy(this.extent().floorDivideBy(2));
                affected = this.parentThatIsA(CommandSlotMorph);
                if (affected) {
                    affected.fixLayout();
                }
            }
        }
    } else if (target.loc === 'top') {
        target.element.removeHighlight();
        offsetY = this.bottomBlock().bottom() - this.bottom();
        this.setBottom(target.element.top() + this.corner - offsetY);
        this.setLeft(target.element.left());
        this.bottomBlock().nextBlock(target.element);
    }
    this.fixBlockColor();
    this.endLayout();
    CommandBlockMorph.uber.snap.call(this); // align stuck comments
    if (this.snapSound) {
        this.snapSound.play();
    }
};

CommandBlockMorph.prototype.isStop = function () {
    return ([
        'doStopThis',
        'doStop',
        'doStopBlock',
        'doStopAll',
        'doForever',
        'doReport',
        'removeClone'
    ].indexOf(this.selector) > -1);
};

// CommandBlockMorph deleting

CommandBlockMorph.prototype.userDestroy = function () {
    if (this.nextBlock()) {
        this.userDestroyJustThis();
        return;
    }
    var cslot = this.parentThatIsA(CSlotMorph);
    this.destroy();
    if (cslot) {
        cslot.fixLayout();
    }
};

CommandBlockMorph.prototype.userDestroyJustThis = function () {
    // delete just this one block, reattach next block to the previous one,
    var scripts = this.parentThatIsA(ScriptsMorph),
        cs = this.parentThatIsA(CommandSlotMorph),
        pb,
        nb = this.nextBlock(),
        above,
        cslot = this.parentThatIsA(CSlotMorph);

    this.topBlock().fullChanged();
    if (this.parent) {
        pb = this.parent.parentThatIsA(CommandBlockMorph);
    }
    if (pb && (pb.nextBlock() === this)) {
        above = pb;
    } else if (cs && (cs.nestedBlock() === this)) {
        above = cs;
    }
    this.destroy();
    if (nb) {
        if (above instanceof CommandSlotMorph) {
            above.nestedBlock(nb);
        } else if (above instanceof CommandBlockMorph) {
            above.nextBlock(nb);
        } else {
            scripts.add(nb);
        }
    } else if (cslot) {
        cslot.fixLayout();
    }
};

// CommandBlockMorph drawing:

CommandBlockMorph.prototype.drawNew = function () {
    var context;
    this.cachedClr = this.color.toString();
    this.cachedClrBright = this.bright();
    this.cachedClrDark = this.dark();
    this.image = newCanvas(this.extent());
    context = this.image.getContext('2d');
    context.fillStyle = this.cachedClr;

    // draw the 'flat' shape:
    this.drawTop(context);
    this.drawBody(context);
    this.drawBottom(context);

    // add 3D-Effect:
    if (!MorphicPreferences.isFlat) {
        this.drawTopDentEdge(context, 0, 0);
        this.drawBottomDentEdge(context, 0, this.height() - this.corner);
        this.drawLeftEdge(context);
        this.drawRightEdge(context);
        this.drawTopLeftEdge(context);
        this.drawBottomRightEdge(context);
    } else {
        nop();
        /*
        this.drawFlatBottomDentEdge(
            context, 0, this.height() - this.corner
        );
        */
    }

    // erase CommandSlots
    this.eraseHoles(context);
};

CommandBlockMorph.prototype.drawBody = function (context) {
    context.fillRect(
        0,
        Math.floor(this.corner),
        this.width(),
        this.height() - Math.floor(this.corner * 3) + 1
    );
};

CommandBlockMorph.prototype.drawTop = function (context) {
    context.beginPath();

    // top left:
    context.arc(
        this.corner,
        this.corner,
        this.corner,
        radians(-180),
        radians(-90),
        false
    );

    // dent:
    this.drawDent(context, 0, 0);

    // top right:
    context.arc(
        this.width() - this.corner,
        this.corner,
        this.corner,
        radians(-90),
        radians(-0),
        false
    );

    context.closePath();
    context.fill();
};

CommandBlockMorph.prototype.drawBottom = function (context) {
    var y = this.height() - (this.corner * 2);

    context.beginPath();

    // bottom left:
    context.arc(
        this.corner,
        y,
        this.corner,
        radians(180),
        radians(90),
        true
    );

    if (!this.isStop()) {
        this.drawDent(context, 0, this.height() - this.corner);
    }

    // bottom right:
    context.arc(
        this.width() - this.corner,
        y,
        this.corner,
        radians(90),
        radians(0),
        true
    );

    context.closePath();
    context.fill();
};

CommandBlockMorph.prototype.drawDent = function (context, x, y) {
    var indent = x + this.corner * 2 + this.inset;

    context.lineTo(x + this.corner + this.inset, y);
    context.lineTo(indent, y + this.corner);
    context.lineTo(indent + this.dent, y + this.corner);
    context.lineTo(x + this.corner * 3 + this.inset + this.dent, y);
    context.lineTo(this.width() - this.corner, y);
};

CommandBlockMorph.prototype.drawTopDentEdge = function (context, x, y) {
    var shift = this.edge * 0.5,
        indent = x + this.corner * 2 + this.inset,
        upperGradient,
        lowerGradient,
        leftGradient,
        lgx;

    context.lineWidth = this.edge;
    context.lineJoin = 'round';
    context.lineCap = 'round';

    upperGradient = context.createLinearGradient(
        0,
        y,
        0,
        y + this.edge
    );
    upperGradient.addColorStop(0, this.cachedClrBright);
    upperGradient.addColorStop(1, this.cachedClr);

    context.strokeStyle = upperGradient;
    context.beginPath();
    context.moveTo(this.corner, y + shift);
    context.lineTo(x + this.corner + this.inset, y + shift);
    context.stroke();

    context.strokeStyle = upperGradient;
    context.beginPath();
    context.moveTo(
        x + this.corner * 3 + this.inset + this.dent + shift,
        y + shift
    );
    context.lineTo(this.width() - this.corner, y + shift);
    context.stroke();

    lgx = x + this.corner + this.inset;
    leftGradient = context.createLinearGradient(
        lgx - this.edge,
        y + this.edge,
        lgx,
        y
    );
    leftGradient.addColorStop(0, this.cachedClr);
    leftGradient.addColorStop(1, this.cachedClrBright);

    context.strokeStyle = leftGradient;
    context.beginPath();
    context.moveTo(x + this.corner + this.inset, y + shift);
    context.lineTo(indent, y + this.corner + shift);
    context.stroke();

    lowerGradient = context.createLinearGradient(
        0,
        y + this.corner,
        0,
        y + this.corner + this.edge
    );
    lowerGradient.addColorStop(0, this.cachedClrBright);
    lowerGradient.addColorStop(1, this.cachedClr);

    context.strokeStyle = lowerGradient;
    context.beginPath();
    context.moveTo(indent, y + this.corner + shift);
    context.lineTo(indent + this.dent, y + this.corner + shift);
    context.stroke();
};

CommandBlockMorph.prototype.drawBottomDentEdge = function (context, x, y) {
    var shift = this.edge * 0.5,
        indent = x + this.corner * 2 + this.inset,
        upperGradient,
        lowerGradient,
        rightGradient;

    context.lineWidth = this.edge;
    context.lineJoin = 'round';
    context.lineCap = 'round';

    upperGradient = context.createLinearGradient(
        0,
        y - this.edge,
        0,
        y
    );
    upperGradient.addColorStop(0, this.cachedClr);
    upperGradient.addColorStop(1, this.cachedClrDark);

    context.strokeStyle = upperGradient;
    context.beginPath();
    context.moveTo(this.corner, y - shift);
    if (this.isStop()) {
        context.lineTo(this.width() - this.corner, y - shift);
    } else {
        context.lineTo(x + this.corner + this.inset - shift, y - shift);
    }
    context.stroke();

    if (this.isStop()) {    // draw straight bottom edge
        return null;
    }

    lowerGradient = context.createLinearGradient(
        0,
        y + this.corner - this.edge,
        0,
        y + this.corner
    );
    lowerGradient.addColorStop(0, this.cachedClr);
    lowerGradient.addColorStop(1, this.cachedClrDark);

    context.strokeStyle = lowerGradient;
    context.beginPath();
    context.moveTo(indent + shift, y + this.corner - shift);
    context.lineTo(indent + this.dent, y + this.corner - shift);
    context.stroke();

    rightGradient = context.createLinearGradient(
        x + indent + this.dent - this.edge,
        y + this.corner - this.edge,
        x + indent + this.dent,
        y + this.corner
    );
    rightGradient.addColorStop(0, this.cachedClr);
    rightGradient.addColorStop(1, this.cachedClrDark);

    context.strokeStyle = rightGradient;
    context.beginPath();
    context.moveTo(x + indent + this.dent, y + this.corner - shift);
    context.lineTo(
        x + this.corner * 3 + this.inset + this.dent,
        y - shift
    );
    context.stroke();

    context.strokeStyle = upperGradient;
    context.beginPath();
    context.moveTo(
        x + this.corner * 3 + this.inset + this.dent,
        y - shift
    );
    context.lineTo(this.width() - this.corner, y - shift);
    context.stroke();
};

CommandBlockMorph.prototype.drawFlatBottomDentEdge = function (context) {
    if (!this.isStop()) {
        context.fillStyle = this.color.darker(this.contrast / 2).toString();
        context.beginPath();
        this.drawDent(context, 0, this.height() - this.corner);
        context.closePath();
        context.fill();
    }
};

CommandBlockMorph.prototype.drawLeftEdge = function (context) {
    var shift = this.edge * 0.5,
        gradient = context.createLinearGradient(0, 0, this.edge, 0);

    gradient.addColorStop(0, this.cachedClrBright);
    gradient.addColorStop(1, this.cachedClr);

    context.lineWidth = this.edge;
    context.lineJoin = 'round';
    context.lineCap = 'round';

    context.strokeStyle = gradient;
    context.beginPath();
    context.moveTo(shift, this.corner);
    context.lineTo(shift, this.height() - this.corner * 2 - shift);
    context.stroke();
};

CommandBlockMorph.prototype.drawRightEdge = function (context) {
    var shift = this.edge * 0.5,
        x = this.width(),
        gradient;

    gradient = context.createLinearGradient(x - this.edge, 0, x, 0);
    gradient.addColorStop(0, this.cachedClr);
    gradient.addColorStop(1, this.cachedClrDark);

    context.lineWidth = this.edge;
    context.lineJoin = 'round';
    context.lineCap = 'round';

    context.strokeStyle = gradient;
    context.beginPath();
    context.moveTo(x - shift, this.corner + shift);
    context.lineTo(x - shift, this.height() - this.corner * 2);
    context.stroke();
};

CommandBlockMorph.prototype.drawTopLeftEdge = function (context) {
    var shift = this.edge * 0.5,
        gradient;

    gradient = context.createRadialGradient(
        this.corner,
        this.corner,
        this.corner,
        this.corner,
        this.corner,
        this.corner - this.edge
    );
    gradient.addColorStop(0, this.cachedClrBright);
    gradient.addColorStop(1, this.cachedClr);

    context.lineWidth = this.edge;
    context.lineJoin = 'round';
    context.lineCap = 'round';

    context.strokeStyle = gradient;

    context.beginPath();
    context.arc(
        this.corner,
        this.corner,
        this.corner - shift,
        radians(-180),
        radians(-90),
        false
    );
    context.stroke();
};

CommandBlockMorph.prototype.drawBottomRightEdge = function (context) {
    var shift = this.edge * 0.5,
        x = this.width() - this.corner,
        y = this.height() - this.corner * 2,
        gradient;

    gradient = context.createRadialGradient(
        x,
        y,
        this.corner,
        x,
        y,
        this.corner - this.edge
    );
    gradient.addColorStop(0, this.cachedClrDark);
    gradient.addColorStop(1, this.cachedClr);

    context.lineWidth = this.edge;
    context.lineJoin = 'round';
    context.lineCap = 'round';

    context.strokeStyle = gradient;

    context.beginPath();
    context.arc(
        x,
        y,
        this.corner - shift,
        radians(90),
        radians(0),
        true
    );
    context.stroke();
};

// HatBlockMorph ///////////////////////////////////////////////////////

/*
    I am a script's top most block. I can attach command blocks at my
    bottom, but not on top.

*/

// HatBlockMorph inherits from CommandBlockMorph:

HatBlockMorph.prototype = new CommandBlockMorph();
HatBlockMorph.prototype.constructor = HatBlockMorph;
HatBlockMorph.uber = CommandBlockMorph.prototype;

// HatBlockMorph instance creation:

function HatBlockMorph() {
    this.init();
}

HatBlockMorph.prototype.init = function () {
    HatBlockMorph.uber.init.call(this, true); // silently
    this.setExtent(new Point(300, 150));
};

// HatBlockMorph enumerating:

HatBlockMorph.prototype.blockSequence = function () {
    // override my inherited method so that I am not part of my sequence
    var result = HatBlockMorph.uber.blockSequence.call(this);
    result.shift();
    return result;
};

// HatBlockMorph drawing:

HatBlockMorph.prototype.drawTop = function (context) {
    var s = this.hatWidth,
        h = this.hatHeight,
        r = ((4 * h * h) + (s * s)) / (8 * h),
        a = degrees(4 * Math.atan(2 * h / s)),
        sa = a / 2,
        sp = Math.min(s * 1.7, this.width() - this.corner);

    context.beginPath();

    context.moveTo(0, h + this.corner);

    // top arc:
    context.arc(
        s / 2,
        r,
        r,
        radians(-sa - 90),
        radians(-90),
        false
    );
    context.bezierCurveTo(
        s,
        0,
        s,
        h,
        sp,
        h
    );

    // top right:
    context.arc(
        this.width() - this.corner,
        h + this.corner,
        this.corner,
        radians(-90),
        radians(-0),
        false
    );

    context.closePath();
    context.fill();
};

HatBlockMorph.prototype.drawBody = function (context) {
    context.fillRect(
        0,
        this.hatHeight + Math.floor(this.corner) - 1,
        this.width(),
        this.height() - Math.floor(this.corner * 3) - this.hatHeight + 2
    );
};

HatBlockMorph.prototype.drawLeftEdge = function (context) {
    var shift = this.edge * 0.5,
        gradient = context.createLinearGradient(0, 0, this.edge, 0);

    gradient.addColorStop(0, this.cachedClrBright);
    gradient.addColorStop(1, this.cachedClr);

    context.lineWidth = this.edge;
    context.lineJoin = 'round';
    context.lineCap = 'round';

    context.strokeStyle = gradient;
    context.beginPath();
    context.moveTo(shift, this.hatHeight + shift);
    context.lineTo(shift, this.height() - this.corner * 2 - shift);
    context.stroke();
};

HatBlockMorph.prototype.drawRightEdge = function (context) {
    var shift = this.edge * 0.5,
        x = this.width(),
        gradient;

    gradient = context.createLinearGradient(x - this.edge, 0, x, 0);
    gradient.addColorStop(0, this.cachedClr);
    gradient.addColorStop(1, this.cachedClrDark);

    context.lineWidth = this.edge;
    context.lineJoin = 'round';
    context.lineCap = 'round';

    context.strokeStyle = gradient;
    context.beginPath();
    context.moveTo(x - shift, this.corner + this.hatHeight + shift);
    context.lineTo(x - shift, this.height() - this.corner * 2);
    context.stroke();
};

HatBlockMorph.prototype.drawTopDentEdge = function () {
    return null;
};

HatBlockMorph.prototype.drawTopLeftEdge = function (context) {
    var shift = this.edge * 0.5,
        s = this.hatWidth,
        h = this.hatHeight,
        r = ((4 * h * h) + (s * s)) / (8 * h),
        a = degrees(4 * Math.atan(2 * h / s)),
        sa = a / 2,
        sp = Math.min(s * 1.7, this.width() - this.corner),
        gradient;

    gradient = context.createRadialGradient(
        s / 2,
        r,
        r - this.edge,
        s / 2,
        r,
        r
    );
    gradient.addColorStop(1, this.cachedClrBright);
    gradient.addColorStop(0, this.cachedClr);

    context.lineWidth = this.edge;
    context.lineJoin = 'round';
    context.lineCap = 'round';

    context.strokeStyle = gradient;
    context.beginPath();
    context.arc(
        Math.round(s / 2),
        r,
        r - shift,
        radians(-sa - 90),
        radians(-90),
        false
    );
    context.moveTo(s / 2, shift);
    context.bezierCurveTo(
        s,
        shift,
        s,
        h + shift,
        sp,
        h + shift
    );
    context.lineTo(this.width() - this.corner, h + shift);
    context.stroke();
};

// ReporterBlockMorph //////////////////////////////////////////////////

/*
    I am a block with a return value, either round-ish or diamond shaped
    I inherit all my important accessors from BlockMorph
*/

// ReporterBlockMorph inherits from BlockMorph:

ReporterBlockMorph.prototype = new BlockMorph();
ReporterBlockMorph.prototype.constructor = ReporterBlockMorph;
ReporterBlockMorph.uber = BlockMorph.prototype;

// ReporterBlockMorph instance creation:

function ReporterBlockMorph(isPredicate) {
    this.init(isPredicate);
}

ReporterBlockMorph.prototype.init = function (isPredicate, silently) {
    ReporterBlockMorph.uber.init.call(this, silently);
    this.isPredicate = isPredicate || false;
    this.setExtent(new Point(200, 80), silently);
    this.cachedSlotSpec = null; // don't serialize
};

// ReporterBlockMorph drag & drop:

ReporterBlockMorph.prototype.snapTarget = function (hand) {
    return this.parent.closestInput(this, hand);
};

ReporterBlockMorph.prototype.snap = function (target) {
    // passing the hand is optional (for when blocks are dragged & dropped)
    var scripts = this.parent,
        nb;

    this.cachedSlotSpec = null;
    if (!(scripts instanceof ScriptsMorph)) {
        return null;
    }

    scripts.clearDropHistory();
    scripts.lastDroppedBlock = this;

    if (target !== null) {
        scripts.lastReplacedInput = target;
        scripts.lastDropTarget = target.parent;
        if (target instanceof MultiArgMorph) {
            scripts.lastPreservedBlocks = target.inputs();
            scripts.lastReplacedInput = target.fullCopy();
        } else if (target instanceof CommandSlotMorph) {
            scripts.lastReplacedInput = target;
            nb = target.nestedBlock();
            if (nb) {
                nb = nb.fullCopy();
                scripts.add(nb);
                nb.moveBy(nb.extent());
                nb.fixBlockColor();
                scripts.lastPreservedBlocks = [nb];
            }
        }
        target.parent.replaceInput(target, this);
        if (this.snapSound) {
            this.snapSound.play();
        }
    }
    this.startLayout();
    this.fixBlockColor();
    this.endLayout();
    ReporterBlockMorph.uber.snap.call(this);
};

ReporterBlockMorph.prototype.prepareToBeGrabbed = function (handMorph) {
    var oldPos = this.position();

    nop(handMorph);
    if ((this.parent instanceof BlockMorph)
            || (this.parent instanceof MultiArgMorph)
            || (this.parent instanceof ReporterSlotMorph)) {
        this.parent.revertToDefaultInput(this);
        this.setPosition(oldPos);
    }
    ReporterBlockMorph.uber.prepareToBeGrabbed.call(this, handMorph);
    this.alpha = 0.85;
    this.cachedSlotSpec = null;
};

// ReporterBlockMorph enumerating

ReporterBlockMorph.prototype.blockSequence = function () {
    // reporters don't have a sequence, answer myself
    return this;
};

// ReporterBlockMorph evaluating

ReporterBlockMorph.prototype.isUnevaluated = function () {
    // answer whether my parent block's slot is designated to be of an
    // 'unevaluated' kind, denoting a spedial form
    var spec = this.getSlotSpec();
    return spec === '%anyUE' ||
        spec === '%boolUE' ||
        spec === '%f';
};

ReporterBlockMorph.prototype.isLocked = function () {
    // answer true if I can be exchanged by a dropped reporter
    return this.isStatic || (this.getSlotSpec() === '%t');
};

ReporterBlockMorph.prototype.getSlotSpec = function () {
    // answer the spec of the slot I'm in, if any
    // cached for performance
    if (!this.cachedSlotSpec) {
        this.cachedSlotSpec = this.determineSlotSpec();
    /*
    } else {
        // debug slot spec caching
        var real = this.determineSlotSpec();
        if (real !== this.cachedSlotSpec) {
            throw new Error(
                'cached slot spec ' +
                this.cachedSlotSpec +
                ' does not match: ' +
                real
            );
        }
    */
    }
    return this.cachedSlotSpec;
};

ReporterBlockMorph.prototype.determineSlotSpec = function () {
    // private - answer the spec of the slot I'm in, if any
    var parts, idx;
    if (this.parent instanceof BlockMorph) {
        parts = this.parent.parts().filter(
            function (part) {
                return !(part instanceof BlockHighlightMorph);
            }
        );
        idx = parts.indexOf(this);
        if (idx !== -1) {
            if (this.parent.blockSpec) {
                return this.parseSpec(this.parent.blockSpec)[idx];
            }
        }
    }
    if (this.parent instanceof MultiArgMorph) {
        return this.parent.slotSpec;
    }
    if (this.parent instanceof TemplateSlotMorph) {
        return this.parent.getSpec();
    }
    return null;
};

// ReporterBlockMorph events

ReporterBlockMorph.prototype.mouseClickLeft = function (pos) {
    var label;
    if (this.parent instanceof BlockInputFragmentMorph) {
        return this.parent.mouseClickLeft();
    }
    if (this.parent instanceof TemplateSlotMorph) {
        if (this.parent.parent && this.parent.parent.parent &&
                this.parent.parent.parent instanceof RingMorph) {
            label = "Input name";
        } else if (this.parent.parent.elementSpec === '%blockVars') {
            label = "Block variable name";
        } else {
            label = "Script variable name";
        }
        new DialogBoxMorph(
            this,
            function(spec) {
                var id = SnapCollaborator.getId(this);
                SnapCollaborator.setBlockSpec(id, spec);
            },
            this
        ).prompt(
            label,
            this.blockSpec,
            this.world()
        );
    } else {
        ReporterBlockMorph.uber.mouseClickLeft.call(this, pos);
    }
};

// ReporterBlock exporting picture with result bubble

ReporterBlockMorph.prototype.ExportResultPic = function () {
    var top = this.topBlock(),
        receiver = top.receiver(),
        stage;
    if (top !== this) {return; }
    if (receiver) {
        stage = receiver.parentThatIsA(StageMorph);
        if (stage) {
            stage.threads.stopProcess(top);
            stage.threads.startProcess(top, false, true);
        }
    }
};


// ReporterBlockMorph deleting

ReporterBlockMorph.prototype.userDestroy = function () {
    // make sure to restore default slot of parent block
    this.topBlock().fullChanged();
    this.prepareToBeGrabbed(this.world().hand);
    this.destroy();
};

// ReporterBlockMorph drawing:

ReporterBlockMorph.prototype.drawNew = function () {
    var context;
    this.cachedClr = this.color.toString();
    this.cachedClrBright = this.bright();
    this.cachedClrDark = this.dark();
    this.image = newCanvas(this.extent());
    context = this.image.getContext('2d');
    context.fillStyle = this.cachedClr;

    if (this.isPredicate) {
        this.drawDiamond(context);
    } else {
        this.drawRounded(context);
    }

    // erase CommandSlots
    this.eraseHoles(context);
};

ReporterBlockMorph.prototype.drawRounded = function (context) {
    var h = this.height(),
        r = Math.min(this.rounding, h / 2),
        w = this.width(),
        shift = this.edge / 2,
        gradient;

    // draw the 'flat' shape:
    context.fillStyle = this.cachedClr;
    context.beginPath();

    // top left:
    context.arc(
        r,
        r,
        r,
        radians(-180),
        radians(-90),
        false
    );

    // top right:
    context.arc(
        w - r,
        r,
        r,
        radians(-90),
        radians(-0),
        false
    );

    // bottom right:
    context.arc(
        w - r,
        h - r,
        r,
        radians(0),
        radians(90),
        false
    );

    // bottom left:
    context.arc(
        r,
        h - r,
        r,
        radians(90),
        radians(180),
        false
    );

    context.closePath();
    context.fill();

    if (MorphicPreferences.isFlat) {return; }

    // add 3D-Effect:
    context.lineWidth = this.edge;
    context.lineJoin = 'round';
    context.lineCap = 'round';

    // half-tone edges
    // bottem left corner
    gradient = context.createRadialGradient(
        r,
        h - r,
        r - this.edge,
        r,
        h - r,
        r + this.edge
    );
    gradient.addColorStop(0, this.cachedClr);
    gradient.addColorStop(1, this.cachedClrBright);
    context.strokeStyle = gradient;
    context.beginPath();
    context.arc(
        r,
        h - r,
        r - shift,
        radians(90),
        radians(180),
        false
    );
    context.stroke();

    // top right corner
    gradient = context.createRadialGradient(
        w - r,
        r,
        r - this.edge,
        w - r,
        r,
        r + this.edge
    );
    gradient.addColorStop(0, this.cachedClr);
    gradient.addColorStop(1, this.cachedClrDark);
    context.strokeStyle = gradient;
    context.beginPath();
    context.arc(
        w - r,
        r,
        r - shift,
        radians(-90),
        radians(0),
        false
    );
    context.stroke();

    // normal gradient edges

    // top edge: straight line
    gradient = context.createLinearGradient(
        0,
        0,
        0,
        this.edge
    );
    gradient.addColorStop(0, this.cachedClrBright);
    gradient.addColorStop(1, this.cachedClr);
    context.strokeStyle = gradient;
    context.beginPath();
    context.moveTo(r - shift, shift);
    context.lineTo(w - r + shift, shift);
    context.stroke();

    // top edge: left corner
    gradient = context.createRadialGradient(
        r,
        r,
        r - this.edge,
        r,
        r,
        r
    );
    gradient.addColorStop(0, this.cachedClr);
    gradient.addColorStop(1, this.cachedClrBright);
    context.strokeStyle = gradient;
    context.beginPath();
    context.arc(
        r,
        r,
        r - shift,
        radians(180),
        radians(270),
        false
    );
    context.stroke();

    // bottom edge: right corner
    gradient = context.createRadialGradient(
        w - r,
        h - r,
        r - this.edge,
        w - r,
        h - r,
        r
    );
    gradient.addColorStop(0, this.cachedClr);
    gradient.addColorStop(1, this.cachedClrDark);
    context.strokeStyle = gradient;
    context.beginPath();
    context.arc(
        w - r,
        h - r,
        r - shift,
        radians(0),
        radians(90),
        false
    );
    context.stroke();

    // bottom edge: straight line
    gradient = context.createLinearGradient(
        0,
        h - this.edge,
        0,
        h
    );
    gradient.addColorStop(0, this.cachedClr);
    gradient.addColorStop(1, this.cachedClrDark);
    context.strokeStyle = gradient;
    context.beginPath();
    context.moveTo(r - shift, h - shift);
    context.lineTo(w - r + shift, h - shift);
    context.stroke();

    // left edge: straight vertical line
    gradient = context.createLinearGradient(0, 0, this.edge, 0);
    gradient.addColorStop(0, this.cachedClrBright);
    gradient.addColorStop(1, this.cachedClr);
    context.strokeStyle = gradient;
    context.beginPath();
    context.moveTo(shift, r);
    context.lineTo(shift, h - r);
    context.stroke();

    // right edge: straight vertical line
    gradient = context.createLinearGradient(w - this.edge, 0, w, 0);
    gradient.addColorStop(0, this.cachedClr);
    gradient.addColorStop(1, this.cachedClrDark);
    context.strokeStyle = gradient;
    context.beginPath();
    context.moveTo(w - shift, r + shift);
    context.lineTo(w - shift, h - r);
    context.stroke();

};

ReporterBlockMorph.prototype.drawDiamond = function (context) {
    var w = this.width(),
        h = this.height(),
        h2 = Math.floor(h / 2),
        r = this.rounding,
        shift = this.edge / 2,
        gradient;

    // draw the 'flat' shape:
    context.fillStyle = this.cachedClr;
    context.beginPath();

    context.moveTo(0, h2);
    context.lineTo(r, 0);
    context.lineTo(w - r, 0);
    context.lineTo(w, h2);
    context.lineTo(w - r, h);
    context.lineTo(r, h);

    context.closePath();
    context.fill();

    if (MorphicPreferences.isFlat) {return; }

    // add 3D-Effect:
    context.lineWidth = this.edge;
    context.lineJoin = 'round';
    context.lineCap = 'round';

    // half-tone edges
    // bottom left corner
    gradient = context.createLinearGradient(
        -r,
        0,
        r,
        0
    );
    gradient.addColorStop(1, this.cachedClr);
    gradient.addColorStop(0, this.cachedClrBright);
    context.strokeStyle = gradient;
    context.beginPath();
    context.moveTo(shift, h2);
    context.lineTo(r, h - shift);
    context.closePath();
    context.stroke();

    // top right corner
    gradient = context.createLinearGradient(
        w - r,
        0,
        w + r,
        0
    );
    gradient.addColorStop(0, this.cachedClr);
    gradient.addColorStop(1, this.cachedClrDark);
    context.strokeStyle = gradient;
    context.beginPath();
    context.moveTo(w - shift, h2);
    context.lineTo(w - r, shift);
    context.closePath();
    context.stroke();

    // normal gradient edges
    // top edge: left corner
    gradient = context.createLinearGradient(
        0,
        0,
        r,
        0
    );
    gradient.addColorStop(0, this.cachedClrBright);
    gradient.addColorStop(1, this.cachedClr);
    context.strokeStyle = gradient;
    context.beginPath();
    context.moveTo(shift, h2);
    context.lineTo(r, shift);
    context.closePath();
    context.stroke();

    // top edge: straight line
    gradient = context.createLinearGradient(
        0,
        0,
        0,
        this.edge
    );
    gradient.addColorStop(0, this.cachedClrBright);
    gradient.addColorStop(1, this.cachedClr);
    context.strokeStyle = gradient;
    context.beginPath();
    context.moveTo(r, shift);
    context.lineTo(w - r, shift);
    context.closePath();
    context.stroke();

    // bottom edge: right corner
    gradient = context.createLinearGradient(
        w - r,
        0,
        w,
        0
    );
    gradient.addColorStop(0, this.cachedClr);
    gradient.addColorStop(1, this.cachedClrDark);
    context.strokeStyle = gradient;
    context.beginPath();
    context.moveTo(w - r, h - shift);
    context.lineTo(w - shift, h2);
    context.closePath();
    context.stroke();

    // bottom edge: straight line
    gradient = context.createLinearGradient(
        0,
        h - this.edge,
        0,
        h
    );
    gradient.addColorStop(0, this.cachedClr);
    gradient.addColorStop(1, this.cachedClrDark);
    context.strokeStyle = gradient;
    context.beginPath();
    context.moveTo(r + shift, h - shift);
    context.lineTo(w - r - shift, h - shift);
    context.closePath();
    context.stroke();
};

// RingMorph /////////////////////////////////////////////////////////////

/*
    I am a reporter block which reifies its contents, my outer shape is
    always roundish (never diamond)
*/

// RingMorph inherits from ReporterBlockMorph:

RingMorph.prototype = new ReporterBlockMorph();
RingMorph.prototype.constructor = RingMorph;
RingMorph.uber = ReporterBlockMorph.prototype;

// RingMorph preferences settings:

RingMorph.prototype.isCachingInputs = false;
// RingMorph.prototype.edge = 2;
// RingMorph.prototype.rounding = 9;
// RingMorph.prototype.alpha = 0.8;
// RingMorph.prototype.contrast = 85;

// RingMorph instance creation:

function RingMorph() {
    this.init();
}

RingMorph.prototype.init = function () {
    RingMorph.uber.init.call(this);
    this.category = 'other';
    this.alpha = RingMorph.prototype.alpha;
    this.contrast = RingMorph.prototype.contrast;
    this.setExtent(new Point(200, 80));
};

// RingMorph dragging and dropping

RingMorph.prototype.rootForGrab = function () {
    if (this.isDraggable) {
        return this;
    }
    return BlockMorph.uber.rootForGrab.call(this);
};

// RingMorph ops - Note: these assume certain layouts defined elsewhere -

RingMorph.prototype.embed = function (aBlock, inputNames) {
    var slot;

    // set my color
    this.color = SpriteMorph.prototype.blockColor.other;
    this.isDraggable = true;

    // set my type, selector, and nested block:
    if (aBlock instanceof CommandBlockMorph) {
        this.isStatic = false;
        this.setSpec('%rc %ringparms');
        this.selector = 'reifyScript';
        slot = this.parts()[0];
        slot.nestedBlock(aBlock);
    } else if (aBlock.isPredicate) {
        this.isStatic = true;
        this.setSpec('%rp %ringparms');
        this.selector = 'reifyPredicate';
        slot = this.parts()[0];
        slot.silentReplaceInput(slot.contents(), aBlock);
    } else if (aBlock instanceof BooleanSlotMorph) {
        this.isStatic = false;
        this.setSpec('%rp %ringparms');
        this.selector = 'reifyPredicate';
        slot = this.parts()[0];
        slot.silentReplaceInput(slot.contents(), aBlock);
    } else { // reporter or input slot)
        this.isStatic = false;
        this.setSpec('%rr %ringparms');
        this.selector = 'reifyReporter';
        slot = this.parts()[0];
        slot.silentReplaceInput(slot.contents(), aBlock);
    }

    // set my inputs, if any
    slot = this.parts()[1];
    if (inputNames) {
        inputNames.forEach(function (name) {
            slot.addInput(name);
        });
    }

    // ensure zebra coloring
    this.fixBlockColor(null, true);
};

RingMorph.prototype.vanishForSimilar = function () {
    // let me disappear if I am nesting a variable getter or Ring
    // but only if I'm not already inside another ring
    var slot = this.parts()[0],
        block = slot.nestedBlock();

    if (!block) {return null; }
    if (!(this.parent instanceof SyntaxElementMorph)) {return null; }
    if (this.parent instanceof RingReporterSlotMorph
            || (this.parent instanceof RingCommandSlotMorph)) {
        return null;
    }
    if (block.selector === 'reportGetVar' || (block instanceof RingMorph)) {
        this.parent.silentReplaceInput(this, block);
    }
};

RingMorph.prototype.contents = function () {
    return this.parts()[0].nestedBlock();
};

RingMorph.prototype.inputNames = function () {
    return this.parts()[1].evaluate();
};

RingMorph.prototype.dataType = function () {
    switch (this.selector) {
    case 'reifyScript':
        return 'command';
    case 'reifyPredicate':
        return 'predicate';
    default:
        return 'reporter';
    }
};

// RingMorph zebra coloring

RingMorph.prototype.fixBlockColor = function (nearest, isForced) {
    var slot = this.parts()[0];
    RingMorph.uber.fixBlockColor.call(this, nearest, isForced);
    slot.fixLayout();
};

// ScriptsMorph ////////////////////////////////////////////////////////

/*
    I give feedback about possible drop targets and am in charge
    of actually snapping blocks together.

    My children are the top blocks of scripts.

    I store a back-pointer to my owner, i.e. the object (sprite)
    to whom my scripts apply.
*/

// ScriptsMorph inherits from FrameMorph:

ScriptsMorph.prototype = new FrameMorph();
ScriptsMorph.prototype.constructor = ScriptsMorph;
ScriptsMorph.uber = FrameMorph.prototype;

// ScriptsMorph preference settings

ScriptsMorph.prototype.cleanUpMargin = 20;
ScriptsMorph.prototype.cleanUpSpacing = 15;
ScriptsMorph.prototype.isPreferringEmptySlots = true;
ScriptsMorph.prototype.enableKeyboard = true;

// ScriptsMorph instance creation:

function ScriptsMorph(owner) {
    this.init(owner);
}

ScriptsMorph.prototype.init = function (owner) {
    this.owner = owner || null;
    this.feedbackColor = SyntaxElementMorph.prototype.feedbackColor;
    this.feedbackMorph = new BoxMorph();
    this.rejectsHats = false;

    // "undrop" attributes:
    this.lastDroppedBlock = null;
    this.lastReplacedInput = null;
    this.lastDropTarget = null;
    this.lastPreservedBlocks = null;
    this.lastNextBlock = null;

    // keyboard editing support:
    this.focus = null;

    ScriptsMorph.uber.init.call(this);
    this.setColor(new Color(70, 70, 70));
    this.noticesTransparentClick = true;
};

// ScriptsMorph deep copying:

ScriptsMorph.prototype.fullCopy = function (forClone) {
    var cpy = new ScriptsMorph(),
        pos = this.position(),
        child;
    if (this.focus) {
        this.focus.stopEditing();
    }
    this.children.forEach(function (morph) {
        if (!morph.block) { // omit anchored comments
            child = morph.fullCopy(forClone);
            cpy.add(child);
            if (!forClone) {
                child.setPosition(morph.position().subtract(pos));
                if (child instanceof BlockMorph) {
                    child.allComments().forEach(function (comment) {
                        comment.align(child);
                    });
                }
            }
        }
    });
    if (!forClone) {
        cpy.adjustBounds();
    }
    return cpy;
};

// ScriptsMorph stepping:

ScriptsMorph.prototype.step = function () {
    var world = this.world(),
        hand = world.hand,
        block;

    if (this.feedbackMorph.parent) {
        this.feedbackMorph.destroy();
        this.feedbackMorph.parent = null;
    }
    if (this.focus && (!world.keyboardReceiver ||
            world.keyboardReceiver instanceof StageMorph)) {
        this.focus.getFocus(world);
    }
    if (hand.children.length === 0) {
        return null;
    }
    if (!this.bounds.containsPoint(hand.bounds.origin)) {
        return null;
    }
    block = hand.children[0];
    if (!(block instanceof BlockMorph) && !(block instanceof CommentMorph)) {
        return null;
    }
    if (!contains(hand.morphAtPointer().allParents(), this)) {
        return null;
    }
    if (block instanceof CommentMorph) {
        this.showCommentDropFeedback(block, hand);
    } else if (block instanceof ReporterBlockMorph) {
        this.showReporterDropFeedback(block, hand);
    } else {
        this.showCommandDropFeedback(block);
    }
};

ScriptsMorph.prototype.showReporterDropFeedback = function (block, hand) {
    var target = this.closestInput(block, hand);

    if (target === null) {
        return null;
    }
    this.feedbackMorph.bounds = target.fullBounds()
        .expandBy(Math.max(
            block.edge * 2,
            block.reporterDropFeedbackPadding
        ));
    this.feedbackMorph.edge = SyntaxElementMorph.prototype.rounding;
    this.feedbackMorph.border = Math.max(
        SyntaxElementMorph.prototype.edge,
        3
    );
    this.add(this.feedbackMorph);
    if (target instanceof MultiArgMorph) {
        this.feedbackMorph.color =
            SpriteMorph.prototype.blockColor.lists.copy();
        this.feedbackMorph.borderColor =
            SpriteMorph.prototype.blockColor.lists;
    } else {
        this.feedbackMorph.color = this.feedbackColor.copy();
        this.feedbackMorph.borderColor = this.feedbackColor;
    }
    this.feedbackMorph.color.a = 0.5;
    this.feedbackMorph.drawNew();
    this.feedbackMorph.changed();
};

ScriptsMorph.prototype.showCommandDropFeedback = function (block) {
    var y, target;

    target = block.closestAttachTarget(this);
    if (!target) {
        return null;
    }
    this.add(this.feedbackMorph);
    this.feedbackMorph.border = 0;
    this.feedbackMorph.edge = 0;
    this.feedbackMorph.alpha = 1;
    this.feedbackMorph.setExtent(new Point(
        target.element.width(),
        Math.max(
            SyntaxElementMorph.prototype.corner,
            SyntaxElementMorph.prototype.feedbackMinHeight
        )
    ));
    this.feedbackMorph.color = this.feedbackColor;
    this.feedbackMorph.drawNew();
    this.feedbackMorph.changed();
    y = target.point.y;
    if (target.loc === 'bottom') {
        if (target.type === 'block') {
            if (target.element.nextBlock()) {
                y -= SyntaxElementMorph.prototype.corner;
            }
        } else if (target.type === 'slot') {
            if (target.element.nestedBlock()) {
                y -= SyntaxElementMorph.prototype.corner;
            }
        }
    }
    this.feedbackMorph.setPosition(new Point(
        target.element.left(),
        y
    ));
};

ScriptsMorph.prototype.showCommentDropFeedback = function (comment, hand) {
    var target = this.closestBlock(comment, hand);
    if (!target) {
        return null;
    }

    this.feedbackMorph.bounds = target.bounds
        .expandBy(Math.max(
            BlockMorph.prototype.edge * 2,
            BlockMorph.prototype.reporterDropFeedbackPadding
        ));
    this.feedbackMorph.edge = SyntaxElementMorph.prototype.rounding;
    this.feedbackMorph.border = Math.max(
        SyntaxElementMorph.prototype.edge,
        3
    );
    this.add(this.feedbackMorph);
    this.feedbackMorph.color = comment.color.copy();
    this.feedbackMorph.color.a = 0.25;
    this.feedbackMorph.borderColor = comment.titleBar.color;
    this.feedbackMorph.drawNew();
    this.feedbackMorph.changed();
};

ScriptsMorph.prototype.closestInput = function (reporter, hand) {
    // passing the hand is optional (when dragging reporters)
    var fb = reporter.fullBoundsNoShadow(),
        stacks = this.children.filter(function (child) {
            return (child instanceof BlockMorph) &&
                (child.fullBounds().intersects(fb));
        }),
        blackList = reporter.allInputs(),
        handPos,
        target,
        all;

    all = [];
    stacks.forEach(function (stack) {
        all = all.concat(stack.allInputs());
    });
    if (all.length === 0) {return null; }

    function touchingVariadicArrowsIfAny(inp, point) {
        if (inp instanceof MultiArgMorph) {
            if (point) {
                return inp.arrows().bounds.containsPoint(point);
            }
            return inp.arrows().bounds.intersects(fb);
        }
        return true;
    }

    if (this.isPreferringEmptySlots) {
        if (hand) {
            handPos = hand.position();
            target = detect(
                all,
                function (input) {
                    return (input instanceof InputSlotMorph
                            || (input instanceof ArgMorph
                                && !(input instanceof CommandSlotMorph)
                                && !(input instanceof MultiArgMorph))
                            || (input instanceof RingMorph
                                && !input.contents())
                            || input.isEmptySlot())
                        && !input.isLocked()
                        && input.bounds.containsPoint(handPos)
                        && !contains(blackList, input);
                }
            );
            if (target) {
                return target;
            }
        }
        target = detect(
            all,
            function (input) {
                return (input instanceof InputSlotMorph
                        || input instanceof ArgMorph
                        || (input instanceof RingMorph
                            && !input.contents())
                        || input.isEmptySlot())
                    && !input.isLocked()
                    && input.bounds.intersects(fb)
                    && !contains(blackList, input)
                    && touchingVariadicArrowsIfAny(input);
            }
        );
        if (target) {
            return target;
        }
    }

    if (hand) {
        handPos = hand.position();
        target = detect(
            all,
            function (input) {
                return (input !== reporter)
                    && !input.isLocked()
                    && input.bounds.containsPoint(handPos)
                    && !(input.parent instanceof PrototypeHatBlockMorph)
                    && !contains(blackList, input);
            }
        );
        if (target) {
            return target;
        }
    }
    return detect(
        all,
        function (input) {
            return (input !== reporter)
                && !input.isLocked()
                && input.fullBounds().intersects(fb)
                && !(input.parent instanceof PrototypeHatBlockMorph)
                && !contains(blackList, input);
        }
    );
};

ScriptsMorph.prototype.closestBlock = function (comment, hand) {
    // passing the hand is optional (when dragging comments)
    var fb = comment.bounds,
        stacks = this.children.filter(function (child) {
            return (child instanceof BlockMorph) &&
                (child.fullBounds().intersects(fb));
        }),
        handPos,
        target,
        all;

    all = [];
    stacks.forEach(function (stack) {
        all = all.concat(stack.allChildren().slice(0).reverse().filter(
            function (child) {return child instanceof BlockMorph &&
                !child.isTemplate; }
        ));
    });
    if (all.length === 0) {return null; }

    if (hand) {
        handPos = hand.position();
        target = detect(
            all,
            function (block) {
                return !block.comment
                    && !block.isPrototype
                    && block.bounds.containsPoint(handPos);
            }
        );
        if (target) {
            return target;
        }
    }
    return detect(
        all,
        function (block) {
            return !block.comment
                && !block.isPrototype
                && block.bounds.intersects(fb);
        }
    );
};

// ScriptsMorph user menu

ScriptsMorph.prototype.userMenu = function () {
    var menu = new MenuMorph(this),
        ide = this.parentThatIsA(IDE_Morph),
        blockEditor,
        myself = this,
        obj = this.owner,
        stage = obj.parentThatIsA(StageMorph);

    if (!ide) {
        blockEditor = this.parentThatIsA(BlockEditorMorph);
        if (blockEditor) {
            ide = blockEditor.target.parentThatIsA(IDE_Morph);
        }
    }
    menu.addItem('clean up', 'cleanUp', 'arrange scripts\nvertically');
    menu.addItem('add comment', 'addComment');
    if (this.lastDroppedBlock) {
        menu.addItem(
            'undrop',
            'undrop',
            'undo the last\nblock drop\nin this pane'
        );
    }
    menu.addItem(
        'scripts pic...',
        'exportScriptsPicture',
        'open a new window\nwith a picture of all scripts'
    );
    if (ide) {
        menu.addLine();
        menu.addItem(
            'make a block...',
            function () {
                new BlockDialogMorph(
                    null,
                    function (definition) {
                        if (definition.spec !== '') {
                            if (definition.isGlobal) {
                                stage.globalBlocks.push(definition);
                            } else {
                                obj.customBlocks.push(definition);
                            }
                            ide.flushPaletteCache();
                            ide.refreshPalette();
                            new BlockEditorMorph(definition, obj).popUp();
                        }
                    },
                    myself
                ).prompt(
                    'Make a block',
                    null,
                    myself.world()
                );
            }
        );
    }
    return menu;
};

// ScriptsMorph user menu features:

ScriptsMorph.prototype.cleanUp = function () {
    var origin = this.topLeft(),
        y = this.cleanUpMargin,
        myself = this;
    this.children.sort(function (a, b) {
        // make sure the prototype hat block always stays on top
        return a instanceof PrototypeHatBlockMorph ? 0 : a.top() - b.top();
    }).forEach(function (child) {
        if (child instanceof CommentMorph && child.block) {
            return; // skip anchored comments
        }
        child.setPosition(origin.add(new Point(myself.cleanUpMargin, y)));
        if (child instanceof BlockMorph) {
            child.allComments().forEach(function (comment) {
                comment.align(child, true); // ignore layer
            });
        }
        y += child.stackHeight() + myself.cleanUpSpacing;
    });
    if (this.parent) {
        this.setPosition(this.parent.topLeft());
    }
    this.adjustBounds();
};

ScriptsMorph.prototype.exportScriptsPicture = function () {
    var pic = this.scriptsPicture(),
        ide = this.world().children[0];
    if (pic) {
        ide.saveCanvasAs(
            pic,
            ide.projetName || localize('Untitled') + ' ' +
                localize('script pic'),
            true // request new window
        );
    }
};

ScriptsMorph.prototype.scriptsPicture = function () {
    // private - answer a canvas containing the pictures of all scripts
    var boundingBox, pic, ctx;
    if (this.children.length === 0) {return; }
    boundingBox = this.children[0].fullBounds();
    this.children.forEach(function (child) {
        if (child.isVisible) {
            boundingBox = boundingBox.merge(child.fullBounds());
        }
    });
    pic = newCanvas(boundingBox.extent());
    ctx = pic.getContext('2d');
    this.children.forEach(function (child) {
        var pos = child.fullBounds().origin;
        if (child.isVisible) {
            ctx.drawImage(
                child.fullImageClassic(),
                pos.x - boundingBox.origin.x,
                pos.y - boundingBox.origin.y
            );
        }
    });
    return pic;
};

ScriptsMorph.prototype.addComment = function () {
    new CommentMorph().pickUp(this.world());
};

ScriptsMorph.prototype.undrop = function () {
    if (!this.lastDroppedBlock) {return; }
    if (this.lastDroppedBlock instanceof CommandBlockMorph) {
        if (this.lastNextBlock) {
            this.add(this.lastNextBlock);
        }
        if (this.lastDropTarget) {
            if (this.lastDropTarget.loc === 'bottom') {
                if (this.lastDropTarget.type === 'slot') {
                    if (this.lastNextBlock) {
                        this.lastDropTarget.element.nestedBlock(
                            this.lastNextBlock
                        );
                    }
                } else { // 'block'
                    if (this.lastNextBlock) {
                        this.lastDropTarget.element.nextBlock(
                            this.lastNextBlock
                        );
                    }
                }
            } else if (this.lastDropTarget.loc === 'top') {
                this.add(this.lastDropTarget.element);
            }
        }
    } else { // ReporterBlockMorph
        if (this.lastDropTarget) {
            this.lastDropTarget.replaceInput(
                this.lastDroppedBlock,
                this.lastReplacedInput
            );
            this.lastDropTarget.fixBlockColor(null, true);
            if (this.lastPreservedBlocks) {
                this.lastPreservedBlocks.forEach(function (morph) {
                    morph.destroy();
                });
            }
        }
    }
    this.lastDroppedBlock.pickUp(this.world());
    this.clearDropHistory();
};


ScriptsMorph.prototype.clearDropHistory = function () {
    this.lastDroppedBlock = null;
    this.lastReplacedInput = null;
    this.lastDropTarget = null;
    this.lastPreservedBlocks = null;
    this.lastNextBlock = null;
};

// ScriptsMorph sorting blocks and comments

ScriptsMorph.prototype.sortedElements = function () {
    // return all scripts and unattached comments
    var scripts = this.children.filter(function (each) {
        return each instanceof CommentMorph ? !each.block : true;
    });
    scripts.sort(function (a, b) {
        // make sure the prototype hat block always stays on top
        return a instanceof PrototypeHatBlockMorph ? 0 : a.top() - b.top();
    });
    return scripts;
};

// ScriptsMorph blocks layout fix

ScriptsMorph.prototype.fixMultiArgs = function () {
    var oldFlag = Morph.prototype.trackChanges;

    Morph.prototype.trackChanges = false;
    this.forAllChildren(function (morph) {
        if (morph instanceof MultiArgMorph) {
            morph.fixLayout();
        }
    });
    Morph.prototype.trackChanges = oldFlag;
};

// ScriptsMorph drag & drop:

ScriptsMorph.prototype.wantsDropOf = function (aMorph) {
    // override the inherited method
    if (aMorph instanceof HatBlockMorph) {
        return !this.rejectsHats;
    }
    return aMorph instanceof SyntaxElementMorph ||
        aMorph instanceof CommentMorph;
};

ScriptsMorph.prototype.reactToDropOf = function (droppedMorph, hand) {
    var target,
        connId;

    if (droppedMorph instanceof BlockMorph ||
            droppedMorph instanceof CommentMorph) {

        target = droppedMorph.snapTarget(hand);
        if (target) {  // moveBlock
            this.moveBlock(droppedMorph, target);
        } else if (!droppedMorph.id) {  // addBlock
            this.addBlock(droppedMorph);
        } else {  // change position
            this.setBlockPosition(droppedMorph, hand);
        }
    }
    this.adjustBounds();
};

ScriptsMorph.prototype.addBlock = function (block) {
    var position = block.position(),
        type = SnapCollaborator.serializeBlock(block),
        blockEditor = this.parentThatIsA(BlockEditorMorph),
        scripts = block.parentThatIsA(ScriptsMorph),
        ownerId = this.owner.id;

    if (blockEditor) {
        ownerId = blockEditor.definition.id;
    }
    position = position.subtract(scripts.topLeft())

    SnapCollaborator.addBlock(type, ownerId, position.x, position.y);

    block.destroy();
};

ScriptsMorph.prototype.moveBlock = function (block, target) {
    var blockId = SnapCollaborator.serializeBlock(block),
        isNewBlock = !block.id,
        id;

    if (block instanceof CommandBlockMorph) {
        if (!target.element.id) {
            if (target.element instanceof PrototypeHatBlockMorph) {
                target.element = target.element.definition.id;
            } else {
                target.element = SnapCollaborator.getId(target.element);
            }
        } else {
            target.element = target.element.id;
        }
        SnapCollaborator.moveBlock(blockId, target);
    } else if (block instanceof ReporterBlockMorph) {
        // target is a block to replace...
        target = SnapCollaborator.getId(target);
        SnapCollaborator.moveBlock(blockId, target);
    } else {  // CommentMorph
        console.log('comment...');
        SnapCollaborator.moveBlock(blockId, target.id);
    }

    if (isNewBlock) {
        block.destroy();
    }
};

ScriptsMorph.prototype.setBlockPosition = function (block, hand) {
    var position = block.position(),
        editor = block.parentThatIsA(BlockEditorMorph),
        originPosition = hand.grabOrigin.position.add(hand.grabOrigin.origin.position()),
        scripts = block.parentThatIsA(ScriptsMorph);

    position = position.subtract(scripts.topLeft())
    block.setPosition(originPosition);
    SnapCollaborator.setBlockPosition(block.id, position.x, position.y);
};

// ScriptsMorph events

ScriptsMorph.prototype.mouseClickLeft = function (pos) {
    var shiftClicked = this.world().currentKey === 16;
    if (shiftClicked) {
        return this.edit(pos);
    }
    if (this.focus) {this.focus.stopEditing(); }
};

// ScriptsMorph keyboard support

ScriptsMorph.prototype.edit = function (pos) {
    var world = this.world();
    if (this.focus) {this.focus.stopEditing(); }
    world.stopEditing();
    if (!ScriptsMorph.prototype.enableKeyboard) {return; }
    this.focus = new ScriptFocusMorph(this, this, pos);
    this.focus.getFocus(world);
};

// ArgMorph //////////////////////////////////////////////////////////

/*
    I am a syntax element and the ancestor of all block inputs.
    I am present in block labels.
    Usually I am just a receptacle for inherited methods and attributes,
    however, if my 'type' attribute is set to one of the following
    values, I act as an iconic slot myself:

        'list'    - a list symbol
*/

// ArgMorph inherits from SyntaxElementMorph:

ArgMorph.prototype = new SyntaxElementMorph();
ArgMorph.prototype.constructor = ArgMorph;
ArgMorph.uber = SyntaxElementMorph.prototype;

// ArgMorph instance creation:

function ArgMorph(type) {
    this.init(type);
}

ArgMorph.prototype.init = function (type, silently) {
    this.type = type || null;
    this.isHole = false;
    ArgMorph.uber.init.call(this, silently);
    this.color = new Color(0, 17, 173);
    this.setExtent(new Point(50, 50), silently);
};

// ArgMorph preferences settings:

ArgMorph.prototype.executeOnSliderEdit = false;

// ArgMorph events:

ArgMorph.prototype.reactToSliderEdit = function () {
/*
    directly execute the stack of blocks I'm part of if my
    "executeOnSliderEdit" setting is turned on, obeying the stage's
    thread safety setting. This feature allows for "Bret Victor" style
    interactive coding.
*/
    var block, top, receiver, stage;
    if (!this.executeOnSliderEdit) {return; }
    block = this.parentThatIsA(BlockMorph);
    if (block) {
        top = block.topBlock();
        receiver = top.receiver();
        if (top instanceof PrototypeHatBlockMorph) {
            return;
        }
        if (receiver) {
            stage = receiver.parentThatIsA(StageMorph);
            if (stage && stage.isThreadSafe) {
                stage.threads.startProcess(top, stage.isThreadSafe);
            } else {
                top.mouseClickLeft();
            }
        }
    }
};


// ArgMorph drag & drop: for demo puposes only

ArgMorph.prototype.justDropped = function () {
    if (!(this instanceof CommandSlotMorph)) {
        this.drawNew();
        this.changed();
    }
};

// ArgMorph spec extrapolation (for demo purposes)

ArgMorph.prototype.getSpec = function () {
    return '%s'; // default
};

// ArgMorph drawing

ArgMorph.prototype.drawNew = function () {
    if (this.type === 'list') {
        this.image = this.listIcon();
        this.silentSetExtent(new Point(
            this.image.width,
            this.image.height
        ));
    } else if (this.type === 'object') {
        this.image = this.objectIcon();
        this.silentSetExtent(new Point(
            this.image.width,
            this.image.height
        ));
    } else {
        ArgMorph.uber.drawNew.call(this);
    }
};

ArgMorph.prototype.listIcon = function () {
    var frame = new Morph(),
        first = new CellMorph(),
        second = new CellMorph(),
        source,
        icon,
        context,
        ratio;

    frame.color = new Color(255, 255, 255);
    second.setPosition(first.bottomLeft().add(new Point(
        0,
        this.fontSize / 3
    )));
    first.add(second);
    first.setPosition(frame.position().add(this.fontSize));
    frame.add(first);
    frame.bounds.corner = second.bounds.corner.add(this.fontSize);
    frame.drawNew();
    source = frame.fullImage();
    ratio = (this.fontSize + this.edge) / source.height;
    icon = newCanvas(new Point(
        Math.ceil(source.width * ratio) + 1,
        Math.ceil(source.height * ratio) + 1
    ));
    context = icon.getContext('2d');
    context.fillStyle = 'black';
    context.fillRect(0, 0, icon.width, icon.height);
    context.scale(ratio, ratio);
    context.drawImage(source, 1 / ratio, 1 / ratio);
    return icon;
};

ArgMorph.prototype.objectIcon = function () {
    return this.labelPart('%turtle').image;
};

// ArgMorph evaluation

ArgMorph.prototype.isEmptySlot = function () {
    return this.type !== null;
};

// CommandSlotMorph ////////////////////////////////////////////////////

/*
    I am a CommandBlock-shaped input slot. I can nest command blocks
    and also accept    reporters (containing reified scripts).

    my most important accessor is

    nestedBlock()    - answer the command block I encompass, if any

    My command spec is %cmd

    evaluate() returns my nested block or null
*/

// CommandSlotMorph inherits from ArgMorph:

CommandSlotMorph.prototype = new ArgMorph();
CommandSlotMorph.prototype.constructor = CommandSlotMorph;
CommandSlotMorph.uber = ArgMorph.prototype;

// CommandSlotMorph instance creation:

function CommandSlotMorph() {
    this.init();
}

CommandSlotMorph.prototype.init = function (silently) {
    CommandSlotMorph.uber.init.call(this, null, true); // silently
    this.color = new Color(0, 17, 173);
    this.setExtent(
        new Point(230, this.corner * 4 + this.cSlotPadding),
        silently
    );
};

CommandSlotMorph.prototype.getSpec = function () {
    return '%cmd';
};

// CommandSlotMorph enumerating:

CommandSlotMorph.prototype.topBlock = function () {
    if (this.parent.topBlock) {
        return this.parent.topBlock();
    }
    return this.nestedBlock();
};

// CommandSlotMorph nesting:

CommandSlotMorph.prototype.nestedBlock = function (block) {
    if (block) {
        var nb = this.nestedBlock();
        this.add(block);
        if (nb) {
            block.bottomBlock().nextBlock(nb);
        }
        this.fixLayout();
    } else {
        return detect(
            this.children,
            function (child) {
                return child instanceof CommandBlockMorph;
            }
        );
    }
};

// CommandSlotMorph attach targets:

CommandSlotMorph.prototype.slotAttachPoint = function () {
    return new Point(
        this.dentCenter(),
        this.top() + this.corner * 2
    );
};

CommandSlotMorph.prototype.dentLeft = function () {
    return this.left()
        + this.corner
        + this.inset * 2;
};

CommandSlotMorph.prototype.dentCenter = function () {
    return this.dentLeft()
        + this.corner
        + (this.dent * 0.5);
};

CommandSlotMorph.prototype.attachTargets = function () {
    var answer = [];
    answer.push({
        point: this.slotAttachPoint(),
        element: this,
        loc: 'bottom',
        type: 'slot'
    });
    return answer;
};

// CommandSlotMorph layout:

CommandSlotMorph.prototype.fixLayout = function () {
    var nb = this.nestedBlock();
    if (this.parent) {
        if (!this.color.eq(this.parent.color)) {
            this.setColor(this.parent.color);
        }
    }
    if (nb) {
        nb.setPosition(
            new Point(
                this.left() + this.edge + this.rfBorder,
                this.top() + this.edge + this.rfBorder
            )
        );
        this.setWidth(nb.fullBounds().width()
            + (this.edge + this.rfBorder) * 2
            );
        this.setHeight(nb.fullBounds().height()
            + this.edge + (this.rfBorder * 2) - (this.corner - this.edge)
            );
    } else {
        this.setHeight(this.corner * 4);
        this.setWidth(
            this.corner * 4
                + this.inset
                + this.dent
        );
    }
    if (this.parent.fixLayout) {
        this.parent.fixLayout();
    }
};

// CommandSlotMorph evaluating:

CommandSlotMorph.prototype.evaluate = function () {
    return this.nestedBlock();
};

CommandSlotMorph.prototype.isEmptySlot = function () {
    return !this.isStatic && (this.nestedBlock() === null);
};

// CommandSlotMorph context menu ops

CommandSlotMorph.prototype.attach = function () {
    // for context menu demo and testing purposes
    // override inherited version to adjust new owner's layout
    var choices = this.overlappedMorphs(),
        menu = new MenuMorph(this, 'choose new parent:'),
        myself = this;

    choices.forEach(function (each) {
        menu.addItem(each.toString().slice(0, 50), function () {
            each.add(myself);
            myself.isDraggable = false;
            if (each.fixLayout) {
                each.fixLayout();
            }
        });
    });
    if (choices.length > 0) {
        menu.popUpAtHand(this.world());
    }
};

// CommandSlotMorph drawing:

CommandSlotMorph.prototype.drawNew = function () {
    var context;
    this.cachedClr = this.color.toString();
    this.cachedClrBright = this.bright();
    this.cachedClrDark = this.dark();
    this.image = newCanvas(this.extent());
    context = this.image.getContext('2d');
    context.fillStyle = this.cachedClr;
    context.fillRect(0, 0, this.width(), this.height());

    // draw the 'flat' shape:
    context.fillStyle = this.rfColor.toString();
    this.drawFlat(context);

    if (MorphicPreferences.isFlat) {return; }

    // add 3D-Effect:
    this.drawEdges(context);
};

CommandSlotMorph.prototype.drawFlat = function (context) {
    var isFilled = this.nestedBlock() !== null,
        ins = (isFilled ? this.inset : this.inset / 2),
        dent = (isFilled ? this.dent : this.dent / 2),
        indent = this.corner * 2 + ins,
        edge = this.edge,
        rf = (isFilled ? this.rfBorder : 0),
        y = this.height() - this.corner - edge;

    context.beginPath();

    // top left:
    context.arc(
        this.corner + edge,
        this.corner + edge,
        this.corner,
        radians(-180),
        radians(-90),
        false
    );

    // dent:
    context.lineTo(this.corner + ins + edge + rf * 2, edge);
    context.lineTo(indent + edge + rf * 2, this.corner + edge);
    context.lineTo(
        indent + edge  + rf * 2 + (dent - rf * 2),
        this.corner + edge
    );
    context.lineTo(
        indent + edge  + rf * 2 + (dent - rf * 2) + this.corner,
        edge
    );
    context.lineTo(this.width() - this.corner - edge, edge);

    // top right:
    context.arc(
        this.width() - this.corner - edge,
        this.corner + edge,
        this.corner,
        radians(-90),
        radians(-0),
        false
    );

    // bottom right:
    context.arc(
        this.width() - this.corner - edge,
        y,
        this.corner,
        radians(0),
        radians(90),
        false
    );

    // bottom left:
    context.arc(
        this.corner + edge,
        y,
        this.corner,
        radians(90),
        radians(180),
        false
    );

    context.closePath();
    context.fill();

};

CommandSlotMorph.prototype.drawEdges = function (context) {
    var isFilled = this.nestedBlock() !== null,
        ins = (isFilled ? this.inset : this.inset / 2),
        dent = (isFilled ? this.dent : this.dent / 2),
        indent = this.corner * 2 + ins,
        edge = this.edge,
        rf = (isFilled ? this.rfBorder : 0),
        shift = this.edge * 0.5,
        gradient,
        upperGradient,
        lowerGradient,
        rightGradient;

    context.lineWidth = this.edge;
    context.lineJoin = 'round';
    context.lineCap = 'round';


    // bright:
    // bottom horizontal line
    gradient = context.createLinearGradient(
        0,
        this.height(),
        0,
        this.height() - this.edge
    );
    gradient.addColorStop(0, this.cachedClr);
    gradient.addColorStop(1, this.cachedClrBright);

    context.strokeStyle = gradient;
    context.beginPath();
    context.moveTo(this.corner + edge, this.height() - shift);
    context.lineTo(
        this.width() - this.corner - edge,
        this.height() - shift
    );
    context.stroke();

    // bottom right corner
    gradient = context.createRadialGradient(
        this.width() - (this.corner + edge),
        this.height() - (this.corner + edge),
        this.corner,
        this.width() - (this.corner + edge),
        this.height() - (this.corner + edge),
        this.corner + edge
    );
    gradient.addColorStop(0, this.cachedClrBright);
    gradient.addColorStop(1, this.cachedClr);

    context.strokeStyle = gradient;
    context.beginPath();
    context.arc(
        this.width() - (this.corner + edge),
        this.height() - (this.corner + edge),
        this.corner + shift,
        radians(0),
        radians(90),
        false
    );
    context.stroke();

    // right vertical line
    gradient = context.createLinearGradient(
        this.width(),
        0,
        this.width() - this.edge,
        0
    );
    gradient.addColorStop(0, this.cachedClr);
    gradient.addColorStop(1, this.cachedClrBright);

    context.strokeStyle = gradient;
    context.beginPath();
    context.moveTo(
        this.width() - shift,
        this.height() - this.corner - this.edge
    );
    context.lineTo(this.width() - shift, edge + this.corner);
    context.stroke();

    context.shadowOffsetY = shift;
    context.shadowBlur = this.edge;
    context.shadowColor = this.rfColor.darker(80).toString();

    // left vertical side
    gradient = context.createLinearGradient(
        0,
        0,
        edge,
        0
    );
    gradient.addColorStop(0, this.cachedClr);
    gradient.addColorStop(1, this.cachedClrDark);

    context.strokeStyle = gradient;
    context.beginPath();
    context.moveTo(shift, edge + this.corner);
    context.lineTo(shift, this.height() - edge - this.corner);
    context.stroke();

    // upper left corner
    gradient = context.createRadialGradient(
        this.corner + edge,
        this.corner + edge,
        this.corner,
        this.corner + edge,
        this.corner + edge,
        this.corner + edge
    );
    gradient.addColorStop(0, this.cachedClrDark);
    gradient.addColorStop(1, this.cachedClr);

    context.strokeStyle = gradient;
    context.beginPath();
    context.arc(
        this.corner + edge,
        this.corner + edge,
        this.corner + shift,
        radians(-180),
        radians(-90),
        false
    );
    context.stroke();

    // upper edge (left side)
    upperGradient = context.createLinearGradient(
        0,
        0,
        0,
        this.edge
    );
    upperGradient.addColorStop(0, this.cachedClr);
    upperGradient.addColorStop(1, this.cachedClrDark);

    context.strokeStyle = upperGradient;
    context.beginPath();
    context.moveTo(this.corner + edge, shift);
    context.lineTo(
        this.corner + ins + edge + rf * 2 - shift,
        shift
    );
    context.stroke();

    // dent bottom
    lowerGradient = context.createLinearGradient(
        0,
        this.corner,
        0,
        this.corner + edge
    );
    lowerGradient.addColorStop(0, this.cachedClr);
    lowerGradient.addColorStop(1, this.cachedClrDark);

    context.strokeStyle = lowerGradient;
    context.beginPath();
    context.moveTo(indent + edge + rf * 2 + shift, this.corner + shift);
    context.lineTo(
        indent + edge  + rf * 2 + (dent - rf * 2),
        this.corner + shift
    );
    context.stroke();

    // dent right edge
    rightGradient = context.createLinearGradient(
        indent + edge  + rf * 2 + (dent - rf * 2) - shift,
        this.corner,
        indent + edge  + rf * 2 + (dent - rf * 2) + shift * 0.7,
        this.corner + shift + shift * 0.7
    );
    rightGradient.addColorStop(0, this.cachedClr);
    rightGradient.addColorStop(1, this.cachedClrDark);

    context.strokeStyle = rightGradient;
    context.beginPath();
    context.moveTo(
        indent + edge  + rf * 2 + (dent - rf * 2),
        this.corner + shift
    );
    context.lineTo(
        indent + edge  + rf * 2 + (dent - rf * 2) + this.corner,
        shift
    );
    context.stroke();

    // upper edge (right side)
    context.strokeStyle = upperGradient;
    context.beginPath();
    context.moveTo(
        indent + edge  + rf * 2 + (dent - rf * 2) + this.corner,
        shift
    );
    context.lineTo(this.width() - this.corner - edge, shift);
    context.stroke();
};

// RingCommandSlotMorph ///////////////////////////////////////////////////

/*
    I am a CommandBlock-shaped input slot for use in RingMorphs.
    I can only nest command blocks, not reporters.

    My command spec is %rc

    evaluate() returns my nested block or null
    (inherited from CommandSlotMorph)
*/

// RingCommandSlotMorph inherits from CommandSlotMorph:

RingCommandSlotMorph.prototype = new CommandSlotMorph();
RingCommandSlotMorph.prototype.constructor = RingCommandSlotMorph;
RingCommandSlotMorph.uber = CommandSlotMorph.prototype;

// RingCommandSlotMorph preferences settings

RingCommandSlotMorph.prototype.rfBorder = 0;
RingCommandSlotMorph.prototype.edge = RingMorph.prototype.edge;

// RingCommandSlotMorph instance creation:

function RingCommandSlotMorph() {
    this.init();
}

RingCommandSlotMorph.prototype.init = function (silently) {
    RingCommandSlotMorph.uber.init.call(this, silently);
    this.isHole = true;
    this.noticesTransparentClick = true;
    this.color = new Color(0, 17, 173);
    this.alpha = RingMorph.prototype.alpha;
    this.contrast = RingMorph.prototype.contrast;
};

RingCommandSlotMorph.prototype.getSpec = function () {
    return '%rc';
};

// RingCommandSlotMorph drawing:

RingCommandSlotMorph.prototype.drawNew = function () {
    var context;
    this.cachedClr = this.color.toString();
    this.cachedClrBright = this.bright();
    this.cachedClrDark = this.dark();
    this.image = newCanvas(this.extent());
    context = this.image.getContext('2d');
    context.fillStyle = this.cachedClr;

    // draw the 'flat' shape:
    this.drawFlat(context);

    if (MorphicPreferences.isFlat) {return; }

    // add 3D-Effect:
    this.drawEdges(context);
};

RingCommandSlotMorph.prototype.drawFlat = function (context) {
    var isFilled = this.nestedBlock() !== null,
        ins = (isFilled ? this.inset : this.inset / 2),
        dent = (isFilled ? this.dent : this.dent / 2),
        indent = this.corner * 2 + ins,
        edge = this.edge,
        w = this.width(),
        h = this.height(),
        rf = (isFilled ? this.rfBorder : 0),
        y = h - this.corner - edge;

    // top half:

    context.beginPath();
    context.moveTo(0, h / 2);
    context.lineTo(edge, h / 2);

    // top left:
    context.arc(
        this.corner + edge,
        this.corner + edge,
        this.corner,
        radians(-180),
        radians(-90),
        false
    );

    // dent:
    context.lineTo(this.corner + ins + edge + rf * 2, edge);
    context.lineTo(indent + edge + rf * 2, this.corner + edge);
    context.lineTo(
        indent + edge  + rf * 2 + (dent - rf * 2),
        this.corner + edge
    );
    context.lineTo(
        indent + edge  + rf * 2 + (dent - rf * 2) + this.corner,
        edge
    );
    context.lineTo(this.width() - this.corner - edge, edge);

    // top right:
    context.arc(
        w - this.corner - edge,
        this.corner + edge,
        this.corner,
        radians(-90),
        radians(-0),
        false
    );

    context.lineTo(w - this.edge, h / 2);
    context.lineTo(w, h / 2);
    context.lineTo(w, 0);
    context.lineTo(0, 0);
    context.closePath();
    context.fill();

    // bottom half:
    context.beginPath();
    context.moveTo(w, h / 2);
    context.lineTo(w - edge, h / 2);

    // bottom right:
    context.arc(
        this.width() - this.corner - edge,
        y,
        this.corner,
        radians(0),
        radians(90),
        false
    );

    // bottom left:
    context.arc(
        this.corner + edge,
        y,
        this.corner,
        radians(90),
        radians(180),
        false
    );

    context.lineTo(edge, h / 2);
    context.lineTo(0, h / 2);
    context.lineTo(0, h);
    context.lineTo(w, h);
    context.closePath();
    context.fill();

};

// CSlotMorph ////////////////////////////////////////////////////

/*
    I am a C-shaped input slot. I can nest command blocks and also accept
    reporters (containing reified scripts).

    my most important accessor is

    nestedBlock()    - the command block I encompass, if any (inherited)

    My command spec is %c

    evaluate() returns my nested block or null
*/

// CSlotMorph inherits from CommandSlotMorph:

CSlotMorph.prototype = new CommandSlotMorph();
CSlotMorph.prototype.constructor = CSlotMorph;
CSlotMorph.uber = CommandSlotMorph.prototype;

// CSlotMorph instance creation:

function CSlotMorph() {
    this.init();
}

CSlotMorph.prototype.init = function (silently) {
    CommandSlotMorph.uber.init.call(this, null, true); // silently
    this.isHole = true;
    this.isLambda = false; // see Process.prototype.evaluateInput
    this.color = new Color(0, 17, 173);
    this.setExtent(
        new Point(230, this.corner * 4 + this.cSlotPadding),
        silently
    );
};

CSlotMorph.prototype.getSpec = function () {
    return '%c';
};

CSlotMorph.prototype.mappedCode = function (definitions) {
    var code = StageMorph.prototype.codeMappings.reify || '<#1>',
        codeLines = code.split('\n'),
        nested = this.nestedBlock(),
        part = nested ? nested.mappedCode(definitions) : '',
        partLines = (part.toString()).split('\n'),
        rx = new RegExp('<#1>', 'g');

    codeLines.forEach(function (codeLine, idx) {
        var prefix = '',
            indent;
        if (codeLine.trimLeft().indexOf('<#1>') === 0) {
            indent = codeLine.indexOf('<#1>');
            prefix = codeLine.slice(0, indent);
        }
        codeLines[idx] = codeLine.replace(
            new RegExp('<#1>'),
            partLines.join('\n' + prefix)
        );
        codeLines[idx] = codeLines[idx].replace(rx, partLines.join('\n'));
    });

    return codeLines.join('\n');
};


// CSlotMorph layout:

CSlotMorph.prototype.fixLayout = function () {
    var nb = this.nestedBlock();
    if (nb) {
        nb.setPosition(
            new Point(
                this.left() + this.inset,
                this.top() + this.corner
            )
        );
        this.setHeight(nb.fullBounds().height() + this.corner);
        this.setWidth(nb.fullBounds().width() + (this.cSlotPadding * 2));
    } else {
        this.setHeight(this.corner * 4  + this.cSlotPadding); // default
        this.setWidth(
            this.corner * 4
                + (this.inset * 2)
                + this.dent
                + (this.cSlotPadding * 2)
        ); // default
    }
    if (this.parent.fixLayout) {
        this.parent.fixLayout();
    }
};

// CSlotMorph drawing:

CSlotMorph.prototype.drawNew = function () {
    var context;
    this.cachedClr = this.color.toString();
    this.cachedClrBright = this.bright();
    this.cachedClrDark = this.dark();
    this.image = newCanvas(this.extent());
    context = this.image.getContext('2d');
    context.fillStyle = this.cachedClr;

    // draw the 'flat' shape:
    this.drawFlat(context);

    if (MorphicPreferences.isFlat) {return; }

    // add 3D-Effect:
    this.drawTopRightEdge(context);
    this.drawTopEdge(context, this.inset, this.corner);
    this.drawTopLeftEdge(context);
    this.drawBottomEdge(context);
    this.drawRightEdge(context);
};

CSlotMorph.prototype.drawFlat = function (context) {
    context.beginPath();

    // top line:
    context.moveTo(0, 0);
    context.lineTo(this.width(), 0);

    // top right:
    context.arc(
        this.width() - this.corner,
        0,
        this.corner,
        radians(90),
        radians(0),
        true
    );

    // jigsaw shape:
    context.lineTo(this.width() - this.corner, this.corner);
    context.lineTo(
        (this.inset * 2) + (this.corner * 3) + this.dent,
        this.corner
    );
    context.lineTo(
        (this.inset * 2) + (this.corner * 2) + this.dent,
        this.corner * 2
    );
    context.lineTo(
        (this.inset * 2) + (this.corner * 2),
        this.corner * 2
    );
    context.lineTo(
        (this.inset * 2) + this.corner,
        this.corner
    );
    context.lineTo(
        this.inset + this.corner,
        this.corner
    );
    context.arc(
        this.inset + this.corner,
        this.corner * 2,
        this.corner,
        radians(270),
        radians(180),
        true
    );

    // bottom:
    context.lineTo(
        this.inset,
        this.height() - (this.corner * 2)
    );
    context.arc(
        this.inset + this.corner,
        this.height() - (this.corner * 2),
        this.corner,
        radians(180),
        radians(90),
        true
    );
    context.lineTo(
        this.width() - this.corner,
        this.height() - this.corner
    );
    context.arc(
        this.width() - this.corner,
        this.height(),
        this.corner,
        radians(-90),
        radians(-0),
        false
    );
    context.lineTo(0, this.height());

    // fill:
    context.closePath();
    context.fill();
};

CSlotMorph.prototype.drawTopRightEdge = function (context) {
    var shift = this.edge * 0.5,
        x = this.width() - this.corner,
        y = 0,
        gradient;

    gradient = context.createRadialGradient(
        x,
        y,
        this.corner,
        x,
        y,
        this.corner - this.edge
    );
    gradient.addColorStop(0, this.cachedClrDark);
    gradient.addColorStop(1, this.cachedClr);

    context.lineWidth = this.edge;
    context.lineJoin = 'round';
    context.lineCap = 'round';

    context.strokeStyle = gradient;

    context.beginPath();
    context.arc(
        x,
        y,
        this.corner - shift,
        radians(90),
        radians(0),
        true
    );
    context.stroke();
};

CSlotMorph.prototype.drawTopEdge = function (context, x, y) {
    var shift = this.edge * 0.5,
        indent = x + this.corner * 2 + this.inset,
        upperGradient,
        lowerGradient,
        rightGradient;

    context.lineWidth = this.edge;
    context.lineJoin = 'round';
    context.lineCap = 'round';

    upperGradient = context.createLinearGradient(
        0,
        y - this.edge,
        0,
        y
    );
    upperGradient.addColorStop(0, this.cachedClr);
    upperGradient.addColorStop(1, this.cachedClrDark);

    context.strokeStyle = upperGradient;
    context.beginPath();
    context.moveTo(x + this.corner, y - shift);
    context.lineTo(x + this.corner + this.inset - shift, y - shift);
    context.stroke();

    lowerGradient = context.createLinearGradient(
        0,
        y + this.corner - this.edge,
        0,
        y + this.corner
    );
    lowerGradient.addColorStop(0, this.cachedClr);
    lowerGradient.addColorStop(1, this.cachedClrDark);

    context.strokeStyle = lowerGradient;
    context.beginPath();
    context.moveTo(indent + shift, y + this.corner - shift);
    context.lineTo(indent + this.dent, y + this.corner - shift);
    context.stroke();

    rightGradient = context.createLinearGradient(
        (x + this.inset + (this.corner * 2) + this.dent) - shift,
        (y + this.corner - shift) - shift,
        (x + this.inset + (this.corner * 2) + this.dent) + (shift * 0.7),
        (y + this.corner - shift) + (shift * 0.7)
    );
    rightGradient.addColorStop(0, this.cachedClr);
    rightGradient.addColorStop(1, this.cachedClrDark);


    context.strokeStyle = rightGradient;
    context.beginPath();
    context.moveTo(
        x + this.inset + (this.corner * 2) + this.dent,
        y + this.corner - shift
    );
    context.lineTo(
        x + this.corner * 3 + this.inset + this.dent,
        y - shift
    );
    context.stroke();

    context.strokeStyle = upperGradient;
    context.beginPath();
    context.moveTo(
        x + this.corner * 3 + this.inset + this.dent,
        y - shift
    );
    context.lineTo(this.width() - this.corner, y - shift);
    context.stroke();
};

CSlotMorph.prototype.drawTopLeftEdge = function (context) {
    var shift = this.edge * 0.5,
        gradient;

    gradient = context.createRadialGradient(
        this.corner + this.inset,
        this.corner * 2,
        this.corner,
        this.corner + this.inset,
        this.corner * 2,
        this.corner + this.edge
    );
    gradient.addColorStop(0, this.cachedClrDark);
    gradient.addColorStop(1, this.cachedClr);

    context.lineWidth = this.edge;
    context.lineJoin = 'round';
    context.lineCap = 'round';

    context.strokeStyle = gradient;

    context.beginPath();
    context.arc(
        this.corner + this.inset,
        this.corner * 2,
        this.corner + shift,
        radians(-180),
        radians(-90),
        false
    );
    context.stroke();
};

CSlotMorph.prototype.drawRightEdge = function (context) {
    var shift = this.edge * 0.5,
        x = this.inset,
        gradient;

    gradient = context.createLinearGradient(x - this.edge, 0, x, 0);
    gradient.addColorStop(0, this.cachedClr);
    gradient.addColorStop(1, this.cachedClrDark);

    context.lineWidth = this.edge;
    context.lineJoin = 'round';
    context.lineCap = 'round';

    context.strokeStyle = gradient;
    context.beginPath();
    context.moveTo(x - shift, this.corner * 2);
    context.lineTo(x - shift, this.height() - this.corner * 2);
    context.stroke();
};

CSlotMorph.prototype.drawBottomEdge = function (context) {
    var shift = this.edge * 0.5,
        gradient,
        upperGradient;

    context.lineWidth = this.edge;
    context.lineJoin = 'round';
    context.lineCap = 'round';

    upperGradient = context.createRadialGradient(
        this.corner + this.inset,
        this.height() - (this.corner * 2),
        this.corner, /*- this.edge*/ // uncomment for half-tone
        this.corner + this.inset,
        this.height() - (this.corner * 2),
        this.corner + this.edge
    );
    upperGradient.addColorStop(0, this.cachedClrBright);
    upperGradient.addColorStop(1, this.cachedClr);
    context.strokeStyle = upperGradient;
    context.beginPath();
    context.arc(
        this.corner + this.inset,
        this.height() - (this.corner * 2),
        this.corner + shift,
        radians(180),
        radians(90),
        true
    );
    context.stroke();

    gradient = context.createLinearGradient(
        0,
        this.height() - this.corner,
        0,
        this.height() - this.corner + this.edge
    );
    gradient.addColorStop(0, this.cachedClrBright);
    gradient.addColorStop(1, this.cachedClr);

    context.strokeStyle = gradient;
    context.beginPath();
    context.moveTo(
        this.inset + this.corner,
        this.height() - this.corner + shift
    );
    context.lineTo(
        this.width() - this.corner,
        this.height() - this.corner + shift
    );

    context.stroke();
};

// InputSlotMorph //////////////////////////////////////////////////////

/*
    I am an editable text input slot. I can be either rectangular or
    rounded, and can have an optional drop-down menu. If I'm set to
    read-only I must have a drop-down menu and will assume a darker
    shade of my parent's color.

    my most important public attributes and accessors are:

    setContents(str/float)    - display the argument (string or float)
    contents().text            - get the displayed string
    choices                    - a key/value list for my optional drop-down
    isReadOnly                - governs whether I am editable or not
    isNumeric                - governs my outer shape (round or rect)

    my block specs are:

    %s        - string input, rectangular
    %n        - numerical input, semi-circular vertical edges
    %anyUE    - any unevaluated

    evaluate() returns my displayed string, cast to float if I'm numerical

    there are also a number of specialized drop-down menu presets, refer
    to BlockMorph for details.
*/

// InputSlotMorph inherits from ArgMorph:

InputSlotMorph.prototype = new ArgMorph();
InputSlotMorph.prototype.constructor = InputSlotMorph;
InputSlotMorph.uber = ArgMorph.prototype;

// InputSlotMorph instance creation:

function InputSlotMorph(text, isNumeric, choiceDict, isReadOnly) {
    this.init(text, isNumeric, choiceDict, isReadOnly);
}

InputSlotMorph.prototype.init = function (
    text,
    isNumeric,
    choiceDict,
    isReadOnly
) {
    var myself = this,
        contents = new StringMorph(''),
        arrow = new ArrowMorph(
            'down',
            0,
            Math.max(Math.floor(this.fontSize / 6), 1)
        );

    contents.fontSize = this.fontSize;
    contents.isShowingBlanks = true;
    contents.drawNew();

    this.isUnevaluated = false;
    this.choices = choiceDict || null; // object, function or selector
    this.oldContentsExtent = contents.extent();
    this.isNumeric = isNumeric || false;
    this.isReadOnly = isReadOnly || false;
    this.minWidth = 0; // can be chaged for text-type inputs ("landscape")
    this.constant = null;

    InputSlotMorph.uber.init.call(this, null, true);
    this.color = new Color(255, 255, 255);
    this.add(contents);
    this.add(arrow);
    contents.isEditable = true;
    contents.isDraggable = false;
    contents.enableSelecting();
    this.setContents(text);
};

// InputSlotMorph accessing:

InputSlotMorph.prototype.getSpec = function () {
    if (this.isNumeric) {
        return '%n';
    }
    return '%s'; // default
};

InputSlotMorph.prototype.contents = function () {
    return detect(
        this.children,
        function (child) {
            return (child instanceof StringMorph);
        }
    );
};

InputSlotMorph.prototype.arrow = function () {
    return detect(
        this.children,
        function (child) {
            return (child instanceof ArrowMorph);
        }
    );
};

InputSlotMorph.prototype.setContents = function (aStringOrFloat) {
    var cnts = this.contents(),
        dta = aStringOrFloat,
        isConstant = dta instanceof Array;
    if (isConstant) {
        dta = localize(dta[0]);
        cnts.isItalic = !this.isReadOnly;
    } else { // assume dta is a localizable choice if it's a key in my choices
        cnts.isItalic = false;
        if (this.choices !== null && this.choices[dta] instanceof Array) {
            return this.setContents(this.choices[dta]);
        }
    }
    cnts.text = dta;
    if (isNil(dta)) {
        cnts.text = '';
    } else if (dta.toString) {
        cnts.text = dta.toString();
    }
    cnts.drawNew();

    // adjust to zebra coloring:
    if (this.isReadOnly && (this.parent instanceof BlockMorph)) {
        this.parent.fixLabelColor();
    }

    // remember the constant, if any
    this.constant = isConstant ? aStringOrFloat : null;
    this.lastValue = aStringOrFloat;
};

// InputSlotMorph drop-down menu:

InputSlotMorph.prototype.setDropDownValue = function (value) {
    this.setContents(value);
    this.updateFieldValue();
};

InputSlotMorph.prototype.dropDownMenu = function (enableKeyboard) {
    var choices = this.choices,
        key,
        menu = new MenuMorph(
            this.setDropDownValue,
            null,
            this,
            this.fontSize
        );

    if (choices instanceof Function) {
        choices = choices.call(this);
    } else if (isString(choices)) {
        choices = this[choices]();
    }
    if (!choices) {
        return null;
    }
    menu.addItem(' ', null);
    for (key in choices) {
        if (Object.prototype.hasOwnProperty.call(choices, key)) {
            if (key[0] === '~') {
                menu.addLine();
            // } else if (key.indexOf('§_def') === 0) {
            //     menu.addItem(choices[key].blockInstance(), choices[key]);
            } else {
                menu.addItem(key, choices[key]);
            }
        }
    }
    if (menu.items.length > 0) {
        if (enableKeyboard) {
            menu.popup(this.world(), this.bottomLeft());
            menu.getFocus();
        } else {
            menu.popUpAtHand(this.world());
        }
    } else {
        return null;
    }
};

InputSlotMorph.prototype.messagesMenu = function () {
    var dict = {},
        rcvr = this.parentThatIsA(BlockMorph).receiver(),
        stage = rcvr.parentThatIsA(StageMorph),
        myself = this,
        allNames = [];

    stage.children.concat(stage).forEach(function (morph) {
        if (isSnapObject(morph)) {
            allNames = allNames.concat(morph.allMessageNames());
        }
    });
    allNames.forEach(function (name) {
        dict[name] = name;
    });
    if (allNames.length > 0) {
        dict['~'] = null;
    }
    dict['new...'] = function () {

        new DialogBoxMorph(
            myself,
            myself.setContents,
            myself
        ).prompt(
            'Message name',
            null,
            myself.world()
        );
    };

    return dict;
};

InputSlotMorph.prototype.messagesReceivedMenu = function () {
    var dict = {'any message': ['any message']},
        rcvr = this.parentThatIsA(BlockMorph).receiver(),
        stage = rcvr.parentThatIsA(StageMorph),
        myself = this,
        allNames = [];

    stage.children.concat(stage).forEach(function (morph) {
        if (isSnapObject(morph)) {
            allNames = allNames.concat(morph.allMessageNames());
        }
    });
    allNames.forEach(function (name) {
        dict[name] = name;
    });
    dict['~'] = null;
    dict['new...'] = function () {

        new DialogBoxMorph(
            myself,
            myself.setContents,
            myself
        ).prompt(
            'Message name',
            null,
            myself.world()
        );
    };

    return dict;
};

InputSlotMorph.prototype.collidablesMenu = function () {
    var dict = {
            'mouse-pointer' : ['mouse-pointer'],
            edge : ['edge'],
            'pen trails' : ['pen trails']
        },
        rcvr = this.parentThatIsA(BlockMorph).receiver(),
        stage = rcvr.parentThatIsA(StageMorph),
        allNames = [];

    stage.children.forEach(function (morph) {
        if (morph instanceof SpriteMorph && !morph.isClone) {
            if (morph.name !== rcvr.name) {
                allNames = allNames.concat(morph.name);
            }
        }
    });
    if (allNames.length > 0) {
        dict['~'] = null;
        allNames.forEach(function (name) {
            dict[name] = name;
        });
    }
    return dict;
};

InputSlotMorph.prototype.distancesMenu = function () {
    var dict = {
            'mouse-pointer' : ['mouse-pointer']
        },
        rcvr = this.parentThatIsA(BlockMorph).receiver(),
        stage = rcvr.parentThatIsA(StageMorph),
        allNames = [];

    stage.children.forEach(function (morph) {
        if (morph instanceof SpriteMorph) {
            if (morph.name !== rcvr.name) {
                allNames = allNames.concat(morph.name);
            }
        }
    });
    if (allNames.length > 0) {
        dict['~'] = null;
        allNames.forEach(function (name) {
            dict[name] = name;
        });
    }
    return dict;
};

InputSlotMorph.prototype.clonablesMenu = function () {
    var dict = {},
        rcvr = this.parentThatIsA(BlockMorph).receiver(),
        stage = rcvr.parentThatIsA(StageMorph),
        allNames = [];

    if (rcvr instanceof SpriteMorph) {
        dict.myself = ['myself'];
    }
    stage.children.forEach(function (morph) {
        if (morph instanceof SpriteMorph && !morph.isClone) {
            allNames = allNames.concat(morph.name);
        }
    });
    if (allNames.length > 0) {
        dict['~'] = null;
        allNames.forEach(function (name) {
            dict[name] = name;
        });
    }
    return dict;
};

InputSlotMorph.prototype.objectsMenu = function () {
    var rcvr = this.parentThatIsA(BlockMorph).receiver(),
        stage = rcvr.parentThatIsA(StageMorph),
        dict = {},
        allNames = [];

    dict[stage.name] = stage.name;
    stage.children.forEach(function (morph) {
        if (morph instanceof SpriteMorph) {
            allNames.push(morph.name);
        }
    });
    if (allNames.length > 0) {
        dict['~'] = null;
        allNames.forEach(function (name) {
            dict[name] = name;
        });
    }
    return dict;
};

InputSlotMorph.prototype.typesMenu = function () {
    var dict = {
        number : ['number'],
        text : ['text'],
        Boolean : ['Boolean'],
        list : ['list']
    };
    if (SpriteMorph.prototype.enableFirstClass) {
        dict.sprite = ['sprite'];
    }
    dict.command = ['command'];
    dict.reporter = ['reporter'];
    dict.predicate = ['predicate'];
    return dict;
};

InputSlotMorph.prototype.gettablesMenu = function () {
    var dict = {
        neighbors : ['neighbors'],
        self : ['self'],
        'other sprites' : ['other sprites'],
        clones : ['clones'],
        'other clones' : ['other clones']
    };
    if (SpriteMorph.prototype.enableNesting) {
        dict.parts = ['parts'];
        dict.anchor = ['anchor'];
    }
    dict.stage = ['stage'];
    if (StageMorph.prototype.enableInheritance) {
        dict.children = ['children'];
        dict.parent = ['parent'];
    }
    dict.name = ['name'];
    dict['dangling?'] = ['dangling?'];
    dict['rotation x'] = ['rotation x'];
    dict['rotation y'] = ['rotation y'];
    dict['center x'] = ['center x'];
    dict['center y'] = ['center y'];
    return dict;
};

InputSlotMorph.prototype.attributesMenu = function () {
    var block = this.parentThatIsA(BlockMorph),
        objName = block.inputs()[1].evaluate(),
        rcvr = block.receiver(),
        stage = rcvr.parentThatIsA(StageMorph),
        obj,
        dict = {},
        varNames = [];

    if (objName === stage.name) {
        obj = stage;
    } else {
        obj = detect(
            stage.children,
            function (morph) {
                return morph.name === objName;
            }
        );
    }
    if (!obj) {
        return dict;
    }
    if (obj instanceof SpriteMorph) {
        dict = {
            'x position' : ['x position'],
            'y position' : ['y position'],
            'direction' : ['direction'],
            'costume #' : ['costume #'],
            'costume name' : ['costume name'],
            'size' : ['size']
        };
    } else { // the stage
        dict = {
            'costume #' : ['costume #'],
            'costume name' : ['costume name']
        };
    }
    varNames = obj.variables.names();
    if (varNames.length > 0) {
        dict['~'] = null;
        varNames.forEach(function (name) {
            dict[name] = name;
        });
    }
    /*
    obj.customBlocks.forEach(function (def, i) {
        dict['§_def' + i] = def
    });
    */
    return dict;
};

InputSlotMorph.prototype.costumesMenu = function () {
    var rcvr = this.parentThatIsA(BlockMorph).receiver(),
        dict,
        allNames = [];
    if (rcvr instanceof SpriteMorph) {
        dict = {Turtle : ['Turtle']};
    } else { // stage
        dict = {Empty : ['Empty']};
    }
    rcvr.costumes.asArray().forEach(function (costume) {
        allNames = allNames.concat(costume.name);
    });
    if (allNames.length > 0) {
        dict['~'] = null;
        allNames.forEach(function (name) {
            dict[name] = name;
        });
    }
    return dict;
};

InputSlotMorph.prototype.soundsMenu = function () {
    var rcvr = this.parentThatIsA(BlockMorph).receiver(),
        allNames = [],
        dict = {};

    rcvr.sounds.asArray().forEach(function (sound) {
        allNames = allNames.concat(sound.name);
    });
    if (allNames.length > 0) {
        allNames.forEach(function (name) {
            dict[name] = name;
        });
    }
    return dict;
};

InputSlotMorph.prototype.setChoices = function (dict, readonly) {
    // externally specify choices and read-only status,
    // used for custom blocks
    var cnts = this.contents();
    this.choices = dict;
    this.isReadOnly = readonly || false;
    if (this.parent instanceof BlockMorph) {
        this.parent.fixLabelColor();
        if (!readonly) {
            cnts.shadowOffset = new Point();
            cnts.shadowColor = null;
            cnts.setColor(new Color(0, 0, 0));
        }
    }
    this.fixLayout();
};

InputSlotMorph.prototype.shadowedVariablesMenu = function () {
    var block = this.parentThatIsA(BlockMorph),
        rcvr,
        dict = {};

    if (!block) {return dict; }
    rcvr = block.receiver();
    if (rcvr) {
        rcvr.inheritedVariableNames(true).forEach(function (name) {
            dict[name] = name;
        });
    }
    return dict;
};

// InputSlotMorph layout:

InputSlotMorph.prototype.fixLayout = function () {
    var width, height, arrowWidth,
        contents = this.contents(),
        arrow = this.arrow();

    contents.isNumeric = this.isNumeric;
    contents.isEditable = (!this.isReadOnly);
    if (this.isReadOnly) {
        contents.disableSelecting();
        contents.color = new Color(254, 254, 254);
    } else {
        contents.enableSelecting();
        contents.color = new Color(0, 0, 0);
    }

    if (this.choices) {
        arrow.setSize(this.fontSize);
        arrow.show();
    } else {
        arrow.hide();
    }
    arrowWidth = arrow.isVisible ? arrow.width() : 0;

    height = contents.height() + this.edge * 2; // + this.typeInPadding * 2
    if (this.isNumeric) {
        width = contents.width()
            + Math.floor(arrowWidth * 0.5)
            + height
            + this.typeInPadding * 2;
    } else {
        width = Math.max(
            contents.width()
                + arrowWidth
                + this.edge * 2
                + this.typeInPadding * 2,
            contents.rawHeight ? // single vs. multi-line contents
                        contents.rawHeight() + arrowWidth
                                : fontHeight(contents.fontSize) / 1.3
                                    + arrowWidth,
            this.minWidth // for text-type slots
        );
    }
    this.setExtent(new Point(width, height));
    if (this.isNumeric) {
        contents.setPosition(new Point(
            Math.floor(height / 2),
            this.edge
        ).add(new Point(this.typeInPadding, 0)).add(this.position()));
    } else {
        contents.setPosition(new Point(
            this.edge,
            this.edge
        ).add(new Point(this.typeInPadding, 0)).add(this.position()));
    }

    if (arrow.isVisible) {
        arrow.setPosition(new Point(
            this.right() - arrowWidth - this.edge,
            contents.top()
        ));
    }

    if (this.parent) {
        if (this.parent.fixLayout) {
            if (this.world()) {
                this.startLayout();
                this.parent.fixLayout();
                this.endLayout();
            } else {
                this.parent.fixLayout();
            }
        }
    }
};

// InputSlotMorph events:

InputSlotMorph.prototype.mouseDownLeft = function (pos) {
    if (this.isReadOnly || this.arrow().bounds.containsPoint(pos)) {
        this.escalateEvent('mouseDownLeft', pos);
    } else {
        this.contents().edit();
        this.contents().selectAll();
    }
};

InputSlotMorph.prototype.mouseClickLeft = function (pos) {
    if (this.arrow().bounds.containsPoint(pos)) {
        this.dropDownMenu();
    } else if (this.isReadOnly) {
        this.dropDownMenu();
    } else {
        this.contents().edit();
        this.contents().selectAll();
    }
};

InputSlotMorph.prototype.reactToKeystroke = function () {
    var cnts;
    if (this.constant) {
        cnts = this.contents();
        this.constant = null;
        cnts.isItalic = false;
        cnts.drawNew();
    }
};

InputSlotMorph.prototype.updateFieldValue = function () {
    var newValue = this.contents().text,
        parentId = SnapCollaborator.getId(this.parent),
        field;

    if (parentId) {
        field = this.parent.children.indexOf(this);
        SnapCollaborator.setField(parentId, field, newValue);
        this.setContents(this.lastValue);  // set to original value in case it fails
    } else if (this.id) {  // not template block - missing parent!
        console.error('Cannot set field text: no parent found!');
    }

};

InputSlotMorph.prototype.reactToEdit = function () {
    this.updateFieldValue();
    this.contents().clearSelection();
};

// InputSlotMorph menu:

InputSlotMorph.prototype.userMenu = function () {
    var menu = new MenuMorph(this);
    if (!StageMorph.prototype.enableCodeMapping || this.isNumeric) {
        return this.parent.userMenu();
    }
    menu.addItem(
        'code string mapping...',
        'mapToCode'
    );
    return menu;
};

// InputSlotMorph code mapping

/*
    code mapping lets you use blocks to generate arbitrary text-based
    source code that can be exported and compiled / embedded elsewhere,
    it's not part of Snap's evaluator and not needed for Snap itself
*/

InputSlotMorph.prototype.mapToCode = function () {
    // private - open a dialog box letting the user map code via the GUI
    new DialogBoxMorph(
        this,
        function (code) {
            StageMorph.prototype.codeMappings.string = code;
        },
        this
    ).promptCode(
        'Code mapping - String <#1>',
        StageMorph.prototype.codeMappings.string || '',
        this.world()
    );
};

InputSlotMorph.prototype.mappedCode = function () {
    var code = StageMorph.prototype.codeMappings.string || '<#1>',
        block = this.parentThatIsA(BlockMorph),
        val = this.evaluate();

    if (this.isNumeric) {return val; }
    if (!isNaN(parseFloat(val))) {return val; }
    if (!isString(val)) {return val; }
    if (block && contains(
            ['doSetVar', 'doChangeVar', 'doShowVar', 'doHideVar'],
            block.selector
        )) {
        return val;
    }
    return code.replace(/<#1>/g, val);
};

// InputSlotMorph evaluating:

InputSlotMorph.prototype.evaluate = function () {
/*
    answer my content's text string. If I am numerical convert that
    string to a number. If the conversion fails answer the string
    (e.g. for special choices like 'any', 'all' or 'last') otherwise
    the numerical value.
*/
    var num,
        contents = this.contents();
    if (this.constant) {
        return this.constant;
    }
    if (this.isNumeric) {
        num = parseFloat(contents.text || '0');
        if (!isNaN(num)) {
            return num;
        }
    }
    return contents.text;
};

InputSlotMorph.prototype.isEmptySlot = function () {
    return this.contents().text === '';
};

// InputSlotMorph drawing:

InputSlotMorph.prototype.drawNew = function () {
    var context, borderColor, r;

    // initialize my surface property
    this.image = newCanvas(this.extent());
    context = this.image.getContext('2d');
    if (this.parent) {
        borderColor = this.parent.color;
    } else {
        borderColor = new Color(120, 120, 120);
    }
    context.fillStyle = this.color.toString();
    if (this.isReadOnly) {
        context.fillStyle = borderColor.darker().toString();
    }

    // cache my border colors
    this.cachedClr = borderColor.toString();
    this.cachedClrBright = borderColor.lighter(this.contrast)
        .toString();
    this.cachedClrDark = borderColor.darker(this.contrast).toString();

    if (!this.isNumeric) {
        context.fillRect(
            this.edge,
            this.edge,
            this.width() - this.edge * 2,
            this.height() - this.edge * 2
        );
        if (!MorphicPreferences.isFlat) {
            this.drawRectBorder(context);
        }
    } else {
        r = (this.height() - (this.edge * 2)) / 2;
        context.beginPath();
        context.arc(
            r + this.edge,
            r + this.edge,
            r,
            radians(90),
            radians(-90),
            false
        );
        context.arc(
            this.width() - r - this.edge,
            r + this.edge,
            r,
            radians(-90),
            radians(90),
            false
        );
        context.closePath();
        context.fill();
        if (!MorphicPreferences.isFlat) {
            this.drawRoundBorder(context);
        }
    }
};

InputSlotMorph.prototype.drawRectBorder = function (context) {
    var shift = this.edge * 0.5,
        gradient;

    context.lineWidth = this.edge;
    context.lineJoin = 'round';
    context.lineCap = 'round';

    context.shadowOffsetY = shift;
    context.shadowBlur = this.edge;
    context.shadowColor = this.color.darker(80).toString();

    gradient = context.createLinearGradient(
        0,
        0,
        0,
        this.edge
    );
    gradient.addColorStop(0, this.cachedClr);
    gradient.addColorStop(1, this.cachedClrDark);
    context.strokeStyle = gradient;
    context.beginPath();
    context.moveTo(this.edge, shift);
    context.lineTo(this.width() - this.edge - shift, shift);
    context.stroke();

    context.shadowOffsetY = 0;

    gradient = context.createLinearGradient(
        0,
        0,
        this.edge,
        0
    );
    gradient.addColorStop(0, this.cachedClr);
    gradient.addColorStop(1, this.cachedClrDark);
    context.strokeStyle = gradient;
    context.beginPath();
    context.moveTo(shift, this.edge);
    context.lineTo(shift, this.height() - this.edge - shift);
    context.stroke();

    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
    context.shadowBlur = 0;

    gradient = context.createLinearGradient(
        0,
        this.height() - this.edge,
        0,
        this.height()
    );
    gradient.addColorStop(0, this.cachedClrBright);
    gradient.addColorStop(1, this.cachedClr);
    context.strokeStyle = gradient;
    context.beginPath();
    context.moveTo(this.edge, this.height() - shift);
    context.lineTo(this.width() - this.edge, this.height() - shift);
    context.stroke();

    gradient = context.createLinearGradient(
        this.width() - this.edge,
        0,
        this.width(),
        0
    );
    gradient.addColorStop(0, this.cachedClrBright);
    gradient.addColorStop(1, this.cachedClr);
    context.strokeStyle = gradient;
    context.beginPath();
    context.moveTo(this.width() - shift, this.edge);
    context.lineTo(this.width() - shift, this.height() - this.edge);
    context.stroke();

};

InputSlotMorph.prototype.drawRoundBorder = function (context) {
    var shift = this.edge * 0.5,
        r = (this.height() - (this.edge * 2)) / 2,
        start,
        end,
        gradient;

    context.lineWidth = this.edge;
    context.lineJoin = 'round';
    context.lineCap = 'round';

    // straight top edge:
    start = r + this.edge;
    end = this.width() - r - this.edge;
    if (end > start) {

        context.shadowOffsetX = shift;
        context.shadowOffsetY = shift;
        context.shadowBlur = this.edge;
        context.shadowColor = this.color.darker(80).toString();

        gradient = context.createLinearGradient(
            0,
            0,
            0,
            this.edge
        );
        gradient.addColorStop(0, this.cachedClr);
        gradient.addColorStop(1, this.cachedClrDark);
        context.strokeStyle = gradient;
        context.beginPath();

        context.moveTo(start, shift);
        context.lineTo(end, shift);
        context.stroke();

        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        context.shadowBlur = 0;
    }

    // straight bottom edge:
    gradient = context.createLinearGradient(
        0,
        this.height() - this.edge,
        0,
        this.height()
    );
    gradient.addColorStop(0, this.cachedClrBright);
    gradient.addColorStop(1, this.cachedClr);
    context.strokeStyle = gradient;
    context.beginPath();
    context.moveTo(r + this.edge, this.height() - shift);
    context.lineTo(this.width() - r - this.edge, this.height() - shift);
    context.stroke();

    r = this.height() / 2;

    context.shadowOffsetX = shift;
    context.shadowOffsetY = shift;
    context.shadowBlur = this.edge;
    context.shadowColor = this.color.darker(80).toString();

    // top edge: left corner
    gradient = context.createRadialGradient(
        r,
        r,
        r - this.edge,
        r,
        r,
        r
    );
    gradient.addColorStop(1, this.cachedClr);
    gradient.addColorStop(0, this.cachedClrDark);
    context.strokeStyle = gradient;
    context.beginPath();
    context.arc(
        r,
        r,
        r - shift,
        radians(180),
        radians(270),
        false
    );

    context.stroke();

    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
    context.shadowBlur = 0;

    // bottom edge: right corner
    gradient = context.createRadialGradient(
        this.width() - r,
        r,
        r - this.edge,
        this.width() - r,
        r,
        r
    );
    gradient.addColorStop(1, this.cachedClr);
    gradient.addColorStop(0, this.cachedClrBright);
    context.strokeStyle = gradient;
    context.beginPath();
    context.arc(
        this.width() - r,
        r,
        r - shift,
        radians(0),
        radians(90),
        false
    );
    context.stroke();
};

// TemplateSlotMorph ///////////////////////////////////////////////////

/*
    I am a reporter block template sitting on a pedestal.
    My block spec is

    %t        - template

    evaluate returns the embedded reporter template's label string
*/

// TemplateSlotMorph inherits from ArgMorph:

TemplateSlotMorph.prototype = new ArgMorph();
TemplateSlotMorph.prototype.constructor = TemplateSlotMorph;
TemplateSlotMorph.uber = ArgMorph.prototype;

// TemplateSlotMorph instance creation:

function TemplateSlotMorph(name) {
    this.init(name);
}

TemplateSlotMorph.prototype.init = function (name) {
    var template = new ReporterBlockMorph();
    this.labelString = name || '';
    template.isDraggable = false;
    template.isTemplate = true;
    if (modules.objects !== undefined) {
        template.color = SpriteMorph.prototype.blockColor.variables;
        template.category = 'variables';
    } else {
        template.color = new Color(243, 118, 29);
        template.category = null;
    }
    template.setSpec(this.labelString);
    template.selector = 'reportGetVar';
    TemplateSlotMorph.uber.init.call(this);
    this.add(template);
    this.fixLayout();
    this.isDraggable = false;
    this.isStatic = true; // I cannot be exchanged
};

// TemplateSlotMorph accessing:

TemplateSlotMorph.prototype.getSpec = function () {
    return '%t';
};

TemplateSlotMorph.prototype.template = function () {
    return this.children[0];
};

TemplateSlotMorph.prototype.contents = function () {
    return this.template().blockSpec;
};

TemplateSlotMorph.prototype.setContents = function (aString) {
    var tmp = this.template();
    tmp.setSpec(aString);
    tmp.fixBlockColor(); // fix zebra coloring
    tmp.fixLabelColor();
};

// TemplateSlotMorph evaluating:

TemplateSlotMorph.prototype.evaluate = function () {
    return this.contents();
};

// TemplateSlotMorph layout:

TemplateSlotMorph.prototype.fixLayout = function () {
    var template = this.template();
    this.setExtent(template.extent().add(this.edge * 2 + 2));
    template.setPosition(this.position().add(this.edge + 1));
    if (this.parent) {
        if (this.parent.fixLayout) {
            this.parent.fixLayout();
        }
    }
};

// TemplateSlotMorph drawing:

TemplateSlotMorph.prototype.drawNew = function () {
    var context;
    if (this.parent instanceof Morph) {
        this.color = this.parent.color.copy();
    }
    this.cachedClr = this.color.toString();
    this.cachedClrBright = this.bright();
    this.cachedClrDark = this.dark();
    this.image = newCanvas(this.extent());
    context = this.image.getContext('2d');
    context.fillStyle = this.cachedClr;
    this.drawRounded(context);
};

TemplateSlotMorph.prototype.drawRounded = ReporterBlockMorph
    .prototype.drawRounded;

// BooleanSlotMorph ////////////////////////////////////////////////////

/*
    I am a diamond-shaped argument slot.
    My block spec is

    %b        - Boolean
    %boolUE    - Boolean unevaluated

    I can be directly edited. When the user clicks on me I toggle
    between <true>, <false> and <null> values.

    evaluate returns my value.

    my most important public attributes and accessors are:

    value - user editable contents (Boolean or null)
    setContents(Boolean/null)  - display the argument (Boolean or null)

*/

// BooleanSlotMorph inherits from ArgMorph:

BooleanSlotMorph.prototype = new ArgMorph();
BooleanSlotMorph.prototype.constructor = BooleanSlotMorph;
BooleanSlotMorph.uber = ArgMorph.prototype;

// BooleanSlotMorph instance creation:

function BooleanSlotMorph(initialValue) {
    this.init(initialValue);
}

BooleanSlotMorph.prototype.init = function (initialValue) {
    this.value = (typeof initialValue === 'boolean') ? initialValue : null;
    this.isUnevaluated = false;
    BooleanSlotMorph.uber.init.call(this);
};

BooleanSlotMorph.prototype.getSpec = function () {
    return this.isUnevaluated ? '%boolUE' : '%b';
};

// BooleanSlotMorph accessing:

BooleanSlotMorph.prototype.evaluate = function () {
    return this.value;
};

BooleanSlotMorph.prototype.isEmptySlot = function () {
    return this.value === null;
};

BooleanSlotMorph.prototype.setContents = function (boolOrNull, silently) {
    this.value = (typeof boolOrNull === 'boolean') ? boolOrNull : null;
    if (silently) {return; }
    this.drawNew();
    this.changed();
};

BooleanSlotMorph.prototype.toggleValue = function () {
    var ide = this.parentThatIsA(IDE_Morph);
    if (this.isStatic) {
        this.setContents(!this.value, true);
    } else {
        switch (this.value) {
        case true:
            this.value = false;
            break;
        case false:
            this.value = null;
            break;
        default:
            this.value = true;
        }
    }
    if (ide && !ide.isAnimating) {
        this.drawNew();
        this.changed();
        return;
    }
    this.drawNew(3);
    this.changed();
    this.nextSteps ([
        function () {
            this.drawNew(2);
            this.changed();
        },
        function () {
            this.drawNew(1);
            this.changed();
        },
        function () {
            this.drawNew();
            this.changed();
        },
    ]);
};

// BooleanSlotMorph events:

BooleanSlotMorph.prototype.mouseClickLeft = function () {
    var id = SnapCollaborator.getId(this);
    if (id) {
        SnapCollaborator.toggleBoolean(id, this.value);
    } else {  // in the palette
        this.toggleValue();
    }
};

BooleanSlotMorph.prototype.mouseEnter = function () {
    if (this.isStatic) {return; }
    if (this.value === false) {
        var oldValue = this.value;
        this.value = null;
        this.drawNew(3);
        this.changed();
        this.value = oldValue;
        return;
    }
    this.drawNew(1);
    this.changed();
};

BooleanSlotMorph.prototype.mouseLeave = function () {
    if (this.isStatic) {return; }
    this.drawNew();
    this.changed();
};

// BooleanSlotMorph drawing:

BooleanSlotMorph.prototype.drawNew = function (progress) {
    // "progress" is an optional number sliding the knob
    // on a range between 0 and 4
    var context,
        textLabel = this.isStatic ? this.textLabel() : null,
        h;

    if (textLabel) {
        h = textLabel.height + (this.edge * 3);
        this.silentSetExtent(new Point(
            textLabel.width + (h * 1.5) + (this.edge * 2),
            h
        ));
    } else {
        this.silentSetExtent(new Point(
            (this.fontSize + this.edge * 2) * 2,
            this.fontSize + this.edge * 2
        ));
    }
    this.color = this.parent ? this.parent.color : new Color(200, 200, 200);
    this.cachedClr = this.color.toString();
    this.cachedClrBright = this.bright();
    this.cachedClrDark = this.dark();
    this.image = newCanvas(this.extent());
    context = this.image.getContext('2d');
    this.drawDiamond(context, progress);
    this.drawLabel(context, textLabel);
    this.drawKnob(context, progress);
};

BooleanSlotMorph.prototype.drawDiamond = function (context, progress) {
    var w = this.width(),
        h = this.height(),
        r = h / 2,
        w2 = w / 2,
        shift = this.edge / 2,
        gradient;

    // draw the 'flat' shape:
    switch (this.value) {
    case true:
        context.fillStyle = 'rgb(0, 200, 0)';
        break;
    case false:
        context.fillStyle = 'rgb(200, 0, 0)';
        break;
    default:
        context.fillStyle = this.color.darker(25).toString();
    }

    if (progress && !this.isEmptySlot()) {
        // left half:
        context.fillStyle = 'rgb(0, 200, 0)';
        context.beginPath();
        context.moveTo(0, r);
        context.lineTo(r, 0);
        context.lineTo(w2, 0);
        context.lineTo(w2, h);
        context.lineTo(r, h);
        context.closePath();
        context.fill();

        // right half:
        context.fillStyle = 'rgb(200, 0, 0)';
        context.beginPath();
        context.moveTo(w2, 0);
        context.lineTo(w - r, 0);
        context.lineTo(w, r);
        context.lineTo(w - r, h);
        context.lineTo(w2, h);
        context.closePath();
        context.fill();
    } else {
        context.beginPath();
        context.moveTo(0, r);
        context.lineTo(r, 0);
        context.lineTo(w - r, 0);
        context.lineTo(w, r);
        context.lineTo(w - r, h);
        context.lineTo(r, h);
        context.closePath();
        context.fill();
    }

    if (MorphicPreferences.isFlat) {return; }

    // add 3D-Effect:
    context.lineWidth = this.edge;
    context.lineJoin = 'round';
    context.lineCap = 'round';

    context.shadowOffsetX = shift;
    context.shadowBlur = shift;
    context.shadowColor = 'black';

    // top edge: left corner
    gradient = context.createLinearGradient(
        0,
        r,
        this.edge * 0.6,
        r + (this.edge * 0.6)
    );
    gradient.addColorStop(1, this.cachedClrDark);
    gradient.addColorStop(0, this.cachedClr);
    context.strokeStyle = gradient;
    context.beginPath();
    context.moveTo(shift, r);
    context.lineTo(r, shift);
    context.closePath();
    context.stroke();

    // top edge: straight line
    context.shadowOffsetX = 0;
    context.shadowOffsetY = shift;
    context.shadowBlur = this.edge;

    gradient = context.createLinearGradient(
        0,
        0,
        0,
        this.edge
    );
    gradient.addColorStop(1, this.cachedClrDark);
    gradient.addColorStop(0, this.cachedClr);
    context.strokeStyle = gradient;
    context.beginPath();
    context.moveTo(r, shift);
    context.lineTo(w - r, shift);
    context.closePath();
    context.stroke();

    context.shadowOffsetY = 0;
    context.shadowBlur = 0;

    // bottom edge: right corner
    gradient = context.createLinearGradient(
        w - r - (this.edge * 0.6),
        h - (this.edge * 0.6),
        w - r,
        h
    );
    gradient.addColorStop(1, this.cachedClr);
    gradient.addColorStop(0, this.cachedClrBright);
    context.strokeStyle = gradient;
    context.beginPath();
    context.moveTo(w - r, h - shift);
    context.lineTo(w - shift, r);
    context.closePath();
    context.stroke();

    // bottom edge: straight line
    gradient = context.createLinearGradient(
        0,
        h - this.edge,
        0,
        h
    );
    gradient.addColorStop(1, this.cachedClr);
    gradient.addColorStop(0, this.cachedClrBright);
    context.strokeStyle = gradient;
    context.beginPath();
    context.moveTo(r, h - shift);
    context.lineTo(w - r - shift, h - shift);
    context.closePath();
    context.stroke();
};

BooleanSlotMorph.prototype.drawLabel = function (context, textLabel) {
    var w = this.width(),
        r = this.height() / 2 - this.edge,
        r2 = r / 2,
        shift = this.edge / 2,
        x,
        y = this.height() / 2;

    if (this.isEmptySlot()) {
        return;
    }
    if (textLabel) {
        y = (this.height() - textLabel.height) / 2;
        if (this.value) {
            x = this.height() / 2;
        } else {
            x = this.width() - (this.height() / 2) - textLabel.width;
        }
    if (!MorphicPreferences.isFlat) {
        context.shadowOffsetX = -shift;
        context.shadowOffsetY = -shift;
        context.shadowBlur = shift;
        context.shadowColor = this.value ? 'rgb(0, 100, 0)' : 'rgb(100, 0, 0)';
    }
        context.drawImage(textLabel, x, y);
        return;
    }
    // "tick:"
    x = r + (this.edge * 2) + shift;
    if (!MorphicPreferences.isFlat) {
        context.shadowOffsetX = -shift;
        context.shadowOffsetY = -shift;
        context.shadowBlur = shift;
        context.shadowColor = 'rgb(0, 100, 0)';
    }
    context.strokeStyle = 'white';
    context.lineWidth = this.edge + shift;
    context.lineCap = 'round';
    context.lineJoin = 'miter';
    context.beginPath();
    context.moveTo(x - r2, y);
    context.lineTo(x, y + r2);
    context.lineTo(x + r2, r2 + this.edge);
    context.stroke();

    // "cross:"
    x = w - y - (this.edge * 2);
    if (!MorphicPreferences.isFlat) {
        context.shadowOffsetX = -shift;
        context.shadowOffsetY = -shift;
        context.shadowBlur = shift;
        context.shadowColor = 'rgb(100, 0, 0)';
    }
    context.strokeStyle = 'white';
    context.lineWidth = this.edge;
    context.lineCap = 'butt';
    context.beginPath();
    context.moveTo(x - r2, y - r2);
    context.lineTo(x + r2, y + r2);
    context.moveTo(x - r2, y + r2);
    context.lineTo(x + r2, y - r2);
    context.stroke();
};

BooleanSlotMorph.prototype.drawKnob = function (context, progress) {
    var w = this.width(),
        r = this.height() / 2,
        shift = this.edge / 2,
        slideStep = (this.width() - this.height()) / 4 * (progress || 0),
        gradient,
        x,
        y = r,
        outline = PushButtonMorph.prototype.outline / 2,
        outlineColor = PushButtonMorph.prototype.outlineColor,
        color = PushButtonMorph.prototype.color,
        contrast = PushButtonMorph.prototype.contrast,
        topColor = color.lighter(contrast),
        bottomColor = color.darker(contrast);

    // draw the 'flat' shape:
    switch (this.value) {
    case false:
        x = r + slideStep;
        if (!MorphicPreferences.isFlat) {
            context.shadowOffsetX = shift;
            context.shadowOffsetY = 0;
            context.shadowBlur = shift;
            context.shadowColor = 'black';
        }
        break;
    case true:
        x = w - r - slideStep;
        if (!MorphicPreferences.isFlat) {
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 0;
            context.shadowBlur = 0;
        }
        break;
    default:
        if (!progress) {return; }
        x = r;
        if (!MorphicPreferences.isFlat) {
            context.shadowOffsetX = shift;
            context.shadowOffsetY = 0;
            context.shadowBlur = shift;
            context.shadowColor = 'black';
        }
        context.globalAlpha = 0.2 * ((progress || 0) + 1);
    }

    context.fillStyle = color.toString();
    context.beginPath();
    context.arc(x, y, r, radians(0), radians(360));
    context.closePath();
    context.fill();

    if (MorphicPreferences.isFlat) {return; }

    // add 3D-Effect
    // outline:
    context.shadowOffsetX = 0;
    context.shadowBlur = 0;
    context.shadowColor = 'black';
    context.lineWidth = outline;
    context.strokeStyle = outlineColor.toString();
    context.beginPath();
    context.arc(x, y, r - (outline / 2), radians(0), radians(360));
    context.stroke();

    // top-left:
    gradient = context.createRadialGradient(
        x,
        y,
        r - outline - this.edge,
        x,
        y,
        r - outline
    );
    gradient.addColorStop(1, topColor.toString());
    gradient.addColorStop(0, color.toString());

    context.strokeStyle = gradient;
    context.lineCap = 'round';
    context.lineWidth = this.edge;
    context.beginPath();
    context.arc(
        x,
        y,
        r - outline - this.edge / 2,
        radians(180),
        radians(270),
        false
    );
    context.stroke();

    // bottom-right:
    gradient = context.createRadialGradient(
        x,
        y,
        r - outline - this.edge,
        x,
        y,
        r - outline
    );
    gradient.addColorStop(1, bottomColor.toString());
    gradient.addColorStop(0, color.toString());

    context.strokeStyle = gradient;
    context.lineCap = 'round';
    context.lineWidth = this.edge;
    context.beginPath();
    context.arc(
        x,
        y,
        r - outline - this.edge / 2,
        radians(0),
        radians(90),
        false
    );
    context.stroke();
};

BooleanSlotMorph.prototype.textLabel = function () {
    if (this.isEmptySlot()) {return null; }
    var t, f, img, lbl, x, y;
    t = new StringMorph(
        localize('true'),
        this.fontSize,
        null,
        true, // bold
        null,
        null,
        null,
        null,
        new Color(255, 255, 255)
    ).image;
    f = new StringMorph(
        localize('false'),
        this.fontSize,
        null,
        true, // bold
        null,
        null,
        null,
        null,
        new Color(255, 255, 255)
    ).image;
    img = newCanvas(new Point(
        Math.max(t.width, f.width),
        Math.max(t.height, f.height)
    ));
    lbl = this.value ? t : f;
    x = (img.width - lbl.width) / 2;
    y = (img.height - lbl.height) / 2;
    img.getContext('2d').drawImage(lbl, x, y);
    return img;
};

// ArrowMorph //////////////////////////////////////////////////////////

/*
    I am a triangular arrow shape, for use in drop-down menus etc.
    My orientation is governed by my 'direction' property, which can be
    'down', 'up', 'left' or 'right'.
*/

// ArrowMorph inherits from Morph:

ArrowMorph.prototype = new Morph();
ArrowMorph.prototype.constructor = ArrowMorph;
ArrowMorph.uber = Morph.prototype;

// ArrowMorph instance creation:

function ArrowMorph(direction, size, padding, color) {
    this.init(direction, size, padding, color);
}

ArrowMorph.prototype.init = function (direction, size, padding, color) {
    this.direction = direction || 'down';
    this.size = size || ((size === 0) ? 0 : 50);
    this.padding = padding || 0;

    ArrowMorph.uber.init.call(this, true); // silently
    this.color = color || new Color(0, 0, 0);
    this.setExtent(new Point(this.size, this.size));
};

ArrowMorph.prototype.setSize = function (size) {
    var min = Math.max(size, 1);
    this.size = size;
    this.setExtent(new Point(min, min));
};

// ArrowMorph displaying:

ArrowMorph.prototype.drawNew = function () {
    // initialize my surface property
    this.image = newCanvas(this.extent());
    var context = this.image.getContext('2d'),
        pad = this.padding,
        h = this.height(),
        h2 = Math.floor(h / 2),
        w = this.width(),
        w2 = Math.floor(w / 2);

    context.fillStyle = this.color.toString();
    context.beginPath();
    if (this.direction === 'down') {
        context.moveTo(pad, h2);
        context.lineTo(w - pad, h2);
        context.lineTo(w2, h - pad);
    } else if (this.direction === 'up') {
        context.moveTo(pad, h2);
        context.lineTo(w - pad, h2);
        context.lineTo(w2, pad);
    } else if (this.direction === 'left') {
        context.moveTo(pad, h2);
        context.lineTo(w2, pad);
        context.lineTo(w2, h - pad);
    } else { // 'right'
        context.moveTo(w2, pad);
        context.lineTo(w - pad, h2);
        context.lineTo(w2, h - pad);
    }
    context.closePath();
    context.fill();
};

// TextSlotMorph //////////////////////////////////////////////////////

/*
    I am a multi-line input slot, primarily used in Snap's code-mapping
    blocks.
*/

// TextSlotMorph inherits from InputSlotMorph:

TextSlotMorph.prototype = new InputSlotMorph();
TextSlotMorph.prototype.constructor = TextSlotMorph;
TextSlotMorph.uber = InputSlotMorph.prototype;

// TextSlotMorph instance creation:

function TextSlotMorph(text, isNumeric, choiceDict, isReadOnly) {
    this.init(text, isNumeric, choiceDict, isReadOnly);
}

TextSlotMorph.prototype.init = function (
    text,
    isNumeric,
    choiceDict,
    isReadOnly
) {
    var contents = new TextMorph(''),
        arrow = new ArrowMorph(
            'down',
            0,
            Math.max(Math.floor(this.fontSize / 6), 1)
        );

    contents.fontSize = this.fontSize;
    contents.drawNew();

    this.isUnevaluated = false;
    this.choices = choiceDict || null; // object, function or selector
    this.oldContentsExtent = contents.extent();
    this.isNumeric = isNumeric || false;
    this.isReadOnly = isReadOnly || false;
    this.minWidth = 0; // can be chaged for text-type inputs ("landscape")
    this.constant = null;

    InputSlotMorph.uber.init.call(this, null, null, null, null, true); // sil.
    this.color = new Color(255, 255, 255);
    this.add(contents);
    this.add(arrow);
    contents.isEditable = true;
    contents.isDraggable = false;
    contents.enableSelecting();
    this.setContents(text);

};

// TextSlotMorph accessing:

TextSlotMorph.prototype.getSpec = function () {
    if (this.isNumeric) {
        return '%mln';
    }
    return '%mlt'; // default
};

TextSlotMorph.prototype.contents = function () {
    return detect(
        this.children,
        function (child) {
            return (child instanceof TextMorph);
        }
    );
};

// TextSlotMorph events:

TextSlotMorph.prototype.layoutChanged = function () {
    this.fixLayout();
};

// SymbolMorph //////////////////////////////////////////////////////////

/*
    I display graphical symbols, such as special letters. I have been
    called into existence out of frustration about not being able to
    consistently use Unicode characters to the same ends.

    Symbols can also display costumes, if one is specified in lieu
    of a name property, although this feature is currently not being
    used because of asynchronous image loading issues.
 */

// SymbolMorph inherits from Morph:

SymbolMorph.prototype = new Morph();
SymbolMorph.prototype.constructor = SymbolMorph;
SymbolMorph.uber = Morph.prototype;

// SymbolMorph available symbols:

SymbolMorph.prototype.names = [
    'square',
    'pointRight',
    'gears',
    'file',
    'fullScreen',
    'normalScreen',
    'smallStage',
    'normalStage',
    'turtle',
    'stage',
    'turtleOutline',
    'pause',
    'flag',
    'octagon',
    'cloud',
    'cloudOutline',
    'cloudGradient',
    'turnRight',
    'turnLeft',
    'storage',
    'poster',
    'flash',
    'brush',
    'rectangle',
    'rectangleSolid',
    'circle',
    'circleSolid',
    'line',
    'crosshairs',
    'paintbucket',
    'eraser',
    'pipette',
    'speechBubble',
    'speechBubbleOutline',
    'arrowUp',
    'arrowUpOutline',
    'arrowLeft',
    'arrowLeftOutline',
    'arrowDown',
    'arrowDownOutline',
    'arrowRight',
    'arrowRightOutline',
    'robot'
];

// SymbolMorph instance creation:

function SymbolMorph(name, size, color, shadowOffset, shadowColor) {
    this.init(name, size, color, shadowOffset, shadowColor);
}

SymbolMorph.prototype.init = function (
    name, // or costume
    size,
    color,
    shadowOffset,
    shadowColor
) {
    this.isProtectedLabel = false; // participate in zebraing
    this.isReadOnly = true;
    this.name = name || 'square'; // can also be a costume
    this.size = size || ((size === 0) ? 0 : 50);
    this.shadowOffset = shadowOffset || new Point(0, 0);
    this.shadowColor = shadowColor || null;

    SymbolMorph.uber.init.call(this, true); // silently
    this.color = color || new Color(0, 0, 0);
    this.drawNew();
};

// SymbolMorph zebra coloring:

SymbolMorph.prototype.setLabelColor = function (
    textColor,
    shadowColor,
    shadowOffset
) {
    this.shadowOffset = shadowOffset;
    this.shadowColor = shadowColor;
    this.setColor(textColor);
};

// SymbolMorph displaying:

SymbolMorph.prototype.drawNew = function () {
    var ctx, x, y, sx, sy;
    this.image = newCanvas(new Point(
        this.symbolWidth() + Math.abs(this.shadowOffset.x),
        this.size + Math.abs(this.shadowOffset.y)
    ));
    this.silentSetWidth(this.image.width);
    this.silentSetHeight(this.image.height);
    ctx = this.image.getContext('2d');
    sx = this.shadowOffset.x < 0 ? 0 : this.shadowOffset.x;
    sy = this.shadowOffset.y < 0 ? 0 : this.shadowOffset.y;
    x = this.shadowOffset.x < 0 ? Math.abs(this.shadowOffset.x) : 0;
    y = this.shadowOffset.y < 0 ? Math.abs(this.shadowOffset.y) : 0;
    if (this.shadowColor) {
        ctx.drawImage(
            this.symbolCanvasColored(this.shadowColor),
            sx,
            sy
        );
    }
    ctx.drawImage(
        this.symbolCanvasColored(this.color),
        x,
        y
    );
};

SymbolMorph.prototype.symbolCanvasColored = function (aColor) {
    // private
    if (this.name instanceof Costume) {
        return this.name.thumbnail(new Point(this.symbolWidth(), this.size));
    }

    var canvas = newCanvas(new Point(this.symbolWidth(), this.size));

    switch (this.name) {
    case 'square':
        return this.drawSymbolStop(canvas, aColor);
    case 'pointRight':
        return this.drawSymbolPointRight(canvas, aColor);
    case 'gears':
        return this.drawSymbolGears(canvas, aColor);
    case 'file':
        return this.drawSymbolFile(canvas, aColor);
    case 'fullScreen':
        return this.drawSymbolFullScreen(canvas, aColor);
    case 'normalScreen':
        return this.drawSymbolNormalScreen(canvas, aColor);
    case 'smallStage':
        return this.drawSymbolSmallStage(canvas, aColor);
    case 'normalStage':
        return this.drawSymbolNormalStage(canvas, aColor);
    case 'turtle':
        return this.drawSymbolTurtle(canvas, aColor);
    case 'stage':
        return this.drawSymbolStop(canvas, aColor);
    case 'turtleOutline':
        return this.drawSymbolTurtleOutline(canvas, aColor);
    case 'pause':
        return this.drawSymbolPause(canvas, aColor);
    case 'flag':
        return this.drawSymbolFlag(canvas, aColor);
    case 'octagon':
        return this.drawSymbolOctagon(canvas, aColor);
    case 'cloud':
        return this.drawSymbolCloud(canvas, aColor);
    case 'cloudOutline':
        return this.drawSymbolCloudOutline(canvas, aColor);
    case 'cloudGradient':
        return this.drawSymbolCloudGradient(canvas, aColor);
    case 'turnRight':
        return this.drawSymbolTurnRight(canvas, aColor);
    case 'turnLeft':
        return this.drawSymbolTurnLeft(canvas, aColor);
    case 'storage':
        return this.drawSymbolStorage(canvas, aColor);
    case 'poster':
        return this.drawSymbolPoster(canvas, aColor);
    case 'flash':
        return this.drawSymbolFlash(canvas, aColor);
    case 'brush':
        return this.drawSymbolBrush(canvas, aColor);
    case 'rectangle':
        return this.drawSymbolRectangle(canvas, aColor);
    case 'rectangleSolid':
        return this.drawSymbolRectangleSolid(canvas, aColor);
    case 'circle':
        return this.drawSymbolCircle(canvas, aColor);
    case 'circleSolid':
        return this.drawSymbolCircleSolid(canvas, aColor);
    case 'line':
        return this.drawSymbolLine(canvas, aColor);
    case 'crosshairs':
        return this.drawSymbolCrosshairs(canvas, aColor);
    case 'paintbucket':
        return this.drawSymbolPaintbucket(canvas, aColor);
    case 'eraser':
        return this.drawSymbolEraser(canvas, aColor);
    case 'pipette':
        return this.drawSymbolPipette(canvas, aColor);
    case 'speechBubble':
        return this.drawSymbolSpeechBubble(canvas, aColor);
    case 'speechBubbleOutline':
        return this.drawSymbolSpeechBubbleOutline(canvas, aColor);
    case 'arrowUp':
        return this.drawSymbolArrowUp(canvas, aColor);
    case 'arrowUpOutline':
        return this.drawSymbolArrowUpOutline(canvas, aColor);
    case 'arrowLeft':
        return this.drawSymbolArrowLeft(canvas, aColor);
    case 'arrowLeftOutline':
        return this.drawSymbolArrowLeftOutline(canvas, aColor);
    case 'arrowDown':
        return this.drawSymbolArrowDown(canvas, aColor);
    case 'arrowDownOutline':
        return this.drawSymbolArrowDownOutline(canvas, aColor);
    case 'arrowRight':
        return this.drawSymbolArrowRight(canvas, aColor);
    case 'arrowRightOutline':
        return this.drawSymbolArrowRightOutline(canvas, aColor);
    case 'robot':
        return this.drawSymbolRobot(canvas, aColor);
    default:
        return canvas;
    }
};

SymbolMorph.prototype.symbolWidth = function () {
    // private
    var size = this.size;

    if (this.name instanceof Costume) {
        return (size / this.name.height()) * this.name.width();
    }
    switch (this.name) {
    case 'pointRight':
        return Math.sqrt(size * size - Math.pow(size / 2, 2));
    case 'flash':
    case 'file':
        return size * 0.8;
    case 'smallStage':
    case 'normalStage':
        return size * 1.2;
    case 'turtle':
    case 'turtleOutline':
    case 'stage':
        return size * 1.3;
    case 'cloud':
    case 'cloudGradient':
    case 'cloudOutline':
        return size * 1.6;
    case 'turnRight':
    case 'turnLeft':
        return size / 3 * 2;
    default:
        return size;
    }
};

SymbolMorph.prototype.drawSymbolStop = function (canvas, color) {
    // answer a canvas showing a vertically centered square
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = color.toString();
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return canvas;
};

SymbolMorph.prototype.drawSymbolPointRight = function (canvas, color) {
    // answer a canvas showing a right-pointing, equilateral triangle
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = color.toString();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(canvas.width, Math.round(canvas.height / 2));
    ctx.lineTo(0, canvas.height);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();
    return canvas;
};

SymbolMorph.prototype.drawSymbolGears = function (canvas, color) {
    // answer a canvas showing gears
    var ctx = canvas.getContext('2d'),
        w = canvas.width,
        r = w / 2,
        e = w / 6;

    ctx.strokeStyle = color.toString();
    ctx.lineWidth = canvas.width / 7;

    ctx.beginPath();
    ctx.arc(r, r, w, radians(0), radians(360), true);
    ctx.arc(r, r, e * 1.5, radians(0), radians(360), false);
    ctx.closePath();
    ctx.clip();

    ctx.moveTo(0, r);
    ctx.lineTo(w, r);
    ctx.stroke();

    ctx.moveTo(r, 0);
    ctx.lineTo(r, w);
    ctx.stroke();

    ctx.moveTo(e, e);
    ctx.lineTo(w - e, w - e);
    ctx.stroke();

    ctx.moveTo(w - e, e);
    ctx.lineTo(e, w - e);
    ctx.stroke();

    return canvas;
};

SymbolMorph.prototype.drawSymbolFile = function (canvas, color) {
    // answer a canvas showing a page symbol
    var ctx = canvas.getContext('2d'),
        w = Math.min(canvas.width, canvas.height) / 2;

    ctx.fillStyle = color.toString();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(w, 0);
    ctx.lineTo(w, w);
    ctx.lineTo(canvas.width, w);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = color.darker(25).toString();
    ctx.beginPath();
    ctx.moveTo(w, 0);
    ctx.lineTo(canvas.width, w);
    ctx.lineTo(w, w);
    ctx.lineTo(w, 0);
    ctx.closePath();
    ctx.fill();

    return canvas;
};

SymbolMorph.prototype.drawSymbolFullScreen = function (canvas, color) {
    // answer a canvas showing two arrows pointing diagonally outwards
    var ctx = canvas.getContext('2d'),
        h = canvas.height,
        c = canvas.width / 2,
        off = canvas.width / 20,
        w = canvas.width / 2;

    ctx.strokeStyle = color.toString();
    ctx.lineWidth = canvas.width / 5;
    ctx.moveTo(c - off, c + off);
    ctx.lineTo(0, h);
    ctx.stroke();

    ctx.strokeStyle = color.toString();
    ctx.lineWidth = canvas.width / 5;
    ctx.moveTo(c + off, c - off);
    ctx.lineTo(h, 0);
    ctx.stroke();

    ctx.fillStyle = color.toString();
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, h - w);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = color.toString();
    ctx.beginPath();
    ctx.moveTo(h, 0);
    ctx.lineTo(h - w, 0);
    ctx.lineTo(h, w);
    ctx.closePath();
    ctx.fill();

    return canvas;
};

SymbolMorph.prototype.drawSymbolNormalScreen = function (canvas, color) {
    // answer a canvas showing two arrows pointing diagonally inwards
    var ctx = canvas.getContext('2d'),
        h = canvas.height,
        c = canvas.width / 2,
        off = canvas.width / 20,
        w = canvas.width;

    ctx.strokeStyle = color.toString();
    ctx.lineWidth = canvas.width / 5;
    ctx.moveTo(c - off * 3, c + off * 3);
    ctx.lineTo(0, h);
    ctx.stroke();

    ctx.strokeStyle = color.toString();
    ctx.lineWidth = canvas.width / 5;
    ctx.moveTo(c + off * 3, c - off * 3);
    ctx.lineTo(h, 0);
    ctx.stroke();

    ctx.fillStyle = color.toString();
    ctx.beginPath();
    ctx.moveTo(c + off, c - off);
    ctx.lineTo(w, c - off);
    ctx.lineTo(c + off, 0);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = color.toString();
    ctx.beginPath();
    ctx.moveTo(c - off, c + off);
    ctx.lineTo(0, c + off);
    ctx.lineTo(c - off, w);
    ctx.closePath();
    ctx.fill();

    return canvas;
};

SymbolMorph.prototype.drawSymbolSmallStage = function (canvas, color) {
    // answer a canvas showing a stage toggling symbol
    var ctx = canvas.getContext('2d'),
        w = canvas.width,
        h = canvas.height,
        w2 = w / 2,
        h2 = h / 2;

    ctx.fillStyle = color.darker(40).toString();
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = color.toString();
    ctx.fillRect(w2, 0, w2, h2);

    return canvas;
};

SymbolMorph.prototype.drawSymbolNormalStage = function (canvas, color) {
    // answer a canvas showing a stage toggling symbol
    var ctx = canvas.getContext('2d'),
        w = canvas.width,
        h = canvas.height,
        w2 = w / 2,
        h2 = h / 2;

    ctx.fillStyle = color.toString();
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = color.darker(25).toString();
    ctx.fillRect(w2, 0, w2, h2);

    return canvas;
};

SymbolMorph.prototype.drawSymbolTurtle = function (canvas, color) {
    // answer a canvas showing a turtle
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = color.toString();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.lineTo(0, canvas.height);
    ctx.lineTo(canvas.height / 2, canvas.height / 2);
    ctx.closePath();
    ctx.fill();
    return canvas;
};

SymbolMorph.prototype.drawSymbolTurtleOutline = function (canvas, color) {
    // answer a canvas showing a turtle
    var ctx = canvas.getContext('2d');

    ctx.strokeStyle = color.toString();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.lineTo(0, canvas.height);
    ctx.lineTo(canvas.height / 2, canvas.height / 2);
    ctx.closePath();
    ctx.stroke();

    return canvas;
};

SymbolMorph.prototype.drawSymbolPause = function (canvas, color) {
    // answer a canvas showing two parallel rectangles
    var ctx = canvas.getContext('2d'),
        w = canvas.width / 5;

    ctx.fillStyle = color.toString();
    ctx.fillRect(0, 0, w * 2, canvas.height);
    ctx.fillRect(w * 3, 0, w * 2, canvas.height);
    return canvas;
};

SymbolMorph.prototype.drawSymbolFlag = function (canvas, color) {
    // answer a canvas showing a flag
    var ctx = canvas.getContext('2d'),
        w = canvas.width,
        l = Math.max(w / 12, 1),
        h = canvas.height;

    ctx.lineWidth = l;
    ctx.strokeStyle = color.toString();
    ctx.beginPath();
    ctx.moveTo(l / 2, 0);
    ctx.lineTo(l / 2, canvas.height);
    ctx.stroke();

    ctx.lineWidth = h / 2;
    ctx.beginPath();
    ctx.moveTo(0, h / 4);
    ctx.bezierCurveTo(
        w * 0.8,
        h / 4,
        w * 0.1,
        h * 0.5,
        w,
        h * 0.5
    );
    ctx.stroke();

    return canvas;
};

SymbolMorph.prototype.drawSymbolOctagon = function (canvas, color) {
    // answer a canvas showing an octagon
    var ctx = canvas.getContext('2d'),
        side = canvas.width,
        vert = (side - (side * 0.383)) / 2;

    ctx.fillStyle = color.toString();
    ctx.beginPath();
    ctx.moveTo(vert, 0);
    ctx.lineTo(side - vert, 0);
    ctx.lineTo(side, vert);
    ctx.lineTo(side, side - vert);
    ctx.lineTo(side - vert, side);
    ctx.lineTo(vert, side);
    ctx.lineTo(0, side - vert);
    ctx.lineTo(0, vert);
    ctx.closePath();
    ctx.fill();

    return canvas;
};

SymbolMorph.prototype.drawSymbolCloud = function (canvas, color) {
    // answer a canvas showing an cloud
    var ctx = canvas.getContext('2d'),
        w = canvas.width,
        h = canvas.height,
        r1 = h * 2 / 5,
        r2 = h / 4,
        r3 = h * 3 / 10,
        r4 = h / 5;

    ctx.fillStyle = color.toString();
    ctx.beginPath();
    ctx.arc(r2, h - r2, r2, radians(90), radians(259), false);
    ctx.arc(w / 20 * 5, h / 9 * 4, r4, radians(165), radians(300), false);
    ctx.arc(w / 20 * 11, r1, r1, radians(200), radians(357), false);
    ctx.arc(w - r3, h - r3, r3, radians(269), radians(90), false);
    ctx.closePath();
    ctx.fill();

    return canvas;
};

SymbolMorph.prototype.drawSymbolCloudGradient = function (canvas, color) {
    // answer a canvas showing an cloud
    var ctx = canvas.getContext('2d'),
        gradient,
        w = canvas.width,
        h = canvas.height,
        r1 = h * 2 / 5,
        r2 = h / 4,
        r3 = h * 3 / 10,
        r4 = h / 5;

    gradient = ctx.createRadialGradient(
        0,
        0,
        0,
        0,
        0,
        w
    );
    gradient.addColorStop(0, color.lighter(25).toString());
    gradient.addColorStop(1, color.darker(25).toString());
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(r2, h - r2, r2, radians(90), radians(259), false);
    ctx.arc(w / 20 * 5, h / 9 * 4, r4, radians(165), radians(300), false);
    ctx.arc(w / 20 * 11, r1, r1, radians(200), radians(357), false);
    ctx.arc(w - r3, h - r3, r3, radians(269), radians(90), false);
    ctx.closePath();
    ctx.fill();

    return canvas;
};

SymbolMorph.prototype.drawSymbolCloudOutline = function (canvas, color) {
    // answer a canvas showing an cloud
    var ctx = canvas.getContext('2d'),
        w = canvas.width,
        h = canvas.height,
        r1 = h * 2 / 5,
        r2 = h / 4,
        r3 = h * 3 / 10,
        r4 = h / 5;

    ctx.strokeStyle = color.toString();
    ctx.beginPath();
    ctx.arc(r2 + 1, h - r2 - 1, r2, radians(90), radians(259), false);
    ctx.arc(w / 20 * 5, h / 9 * 4, r4, radians(165), radians(300), false);
    ctx.arc(w / 20 * 11, r1 + 1, r1, radians(200), radians(357), false);
    ctx.arc(w - r3 - 1, h - r3 - 1, r3, radians(269), radians(90), false);
    ctx.closePath();
    ctx.stroke();

    return canvas;
};

SymbolMorph.prototype.drawSymbolTurnRight = function (canvas, color) {
    // answer a canvas showing a right-turning arrow
    var ctx = canvas.getContext('2d'),
        w = canvas.width,
        l = Math.max(w / 10, 1),
        r = w / 2;

    ctx.lineWidth = l;
    ctx.strokeStyle = color.toString();
    ctx.beginPath();
    ctx.arc(r, r * 2, r - l / 2, radians(0), radians(-90), false);
    ctx.stroke();

    ctx.fillStyle = color.toString();
    ctx.beginPath();
    ctx.moveTo(w, r);
    ctx.lineTo(r, 0);
    ctx.lineTo(r, r * 2);
    ctx.closePath();
    ctx.fill();

    return canvas;
};

SymbolMorph.prototype.drawSymbolTurnLeft = function (canvas, color) {
    // answer a canvas showing a left-turning arrow
    var ctx = canvas.getContext('2d'),
        w = canvas.width,
        l = Math.max(w / 10, 1),
        r = w / 2;

    ctx.lineWidth = l;
    ctx.strokeStyle = color.toString();
    ctx.beginPath();
    ctx.arc(r, r * 2, r - l / 2, radians(180), radians(-90), true);
    ctx.stroke();

    ctx.fillStyle = color.toString();
    ctx.beginPath();
    ctx.moveTo(0, r);
    ctx.lineTo(r, 0);
    ctx.lineTo(r, r * 2);
    ctx.closePath();
    ctx.fill();

    return canvas;
};

SymbolMorph.prototype.drawSymbolStorage = function (canvas, color) {
    // answer a canvas showing a stack of three disks
    var ctx = canvas.getContext('2d'),
        w = canvas.width,
        h = canvas.height,
        r = canvas.height,
        unit = canvas.height / 11;

    function drawDisk(bottom, fillTop) {
        ctx.fillStyle = color.toString();
        ctx.beginPath();
        ctx.arc(w / 2, bottom - h, r, radians(60), radians(120), false);
        ctx.lineTo(0, bottom - unit * 2);
        ctx.arc(
            w / 2,
            bottom - h - unit * 2,
            r,
            radians(120),
            radians(60),
            true
        );
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = color.darker(25).toString();
        ctx.beginPath();

        if (fillTop) {
            ctx.arc(
                w / 2,
                bottom - h - unit * 2,
                r,
                radians(120),
                radians(60),
                true
            );
        }

        ctx.arc(
            w / 2,
            bottom + unit * 6 + 1,
            r,
            radians(60),
            radians(120),
            true
        );
        ctx.closePath();

        if (fillTop) {
            ctx.fill();
        } else {
            ctx.stroke();
        }
    }

    ctx.strokeStyle = color.toString();
    drawDisk(h);
    drawDisk(h - unit * 3);
    drawDisk(h - unit * 6, false);
    return canvas;
};

SymbolMorph.prototype.drawSymbolPoster = function (canvas, color) {
    // answer a canvas showing a poster stand
    var ctx = canvas.getContext('2d'),
        w = canvas.width,
        h = canvas.height,
        bottom = h * 0.75,
        edge = canvas.height / 5;

    ctx.fillStyle = color.toString();
    ctx.strokeStyle = color.toString();

    ctx.lineWidth = w / 15;
    ctx.moveTo(w / 2, h / 3);
    ctx.lineTo(w / 6, h);
    ctx.stroke();

    ctx.moveTo(w / 2, h / 3);
    ctx.lineTo(w / 2, h);
    ctx.stroke();

    ctx.moveTo(w / 2, h / 3);
    ctx.lineTo(w * 5 / 6, h);
    ctx.stroke();

    ctx.fillRect(0, 0, w, bottom);
    ctx.clearRect(0, bottom, w, w / 20);

    ctx.clearRect(w - edge, bottom - edge, edge + 1, edge + 1);

    ctx.fillStyle = color.darker(25).toString();
    ctx.beginPath();
    ctx.moveTo(w, bottom - edge);
    ctx.lineTo(w - edge, bottom - edge);
    ctx.lineTo(w - edge, bottom);
    ctx.closePath();
    ctx.fill();

    return canvas;
};

SymbolMorph.prototype.drawSymbolFlash = function (canvas, color) {
    // answer a canvas showing a flash
    var ctx = canvas.getContext('2d'),
        w = canvas.width,
        w3 = w / 3,
        h = canvas.height,
        h3 = h / 3,
        off = h3 / 3;

    ctx.fillStyle = color.toString();
    ctx.beginPath();
    ctx.moveTo(w3, 0);
    ctx.lineTo(0, h3);
    ctx.lineTo(w3, h3);
    ctx.lineTo(0, h3 * 2);
    ctx.lineTo(w3, h3 * 2);
    ctx.lineTo(0, h);
    ctx.lineTo(w, h3 * 2 - off);
    ctx.lineTo(w3 * 2, h3 * 2 - off);
    ctx.lineTo(w, h3 - off);
    ctx.lineTo(w3 * 2, h3 - off);
    ctx.lineTo(w, 0);
    ctx.closePath();
    ctx.fill();
    return canvas;
};

SymbolMorph.prototype.drawSymbolBrush = function (canvas, color) {
    // answer a canvas showing a paintbrush
    var ctx = canvas.getContext('2d'),
        w = canvas.width,
        h = canvas.height,
        l = Math.max(w / 30, 0.5);

    ctx.fillStyle = color.toString();
    ctx.lineWidth = l * 2;
    ctx.beginPath();
    ctx.moveTo(w / 8 * 3, h / 2);
    ctx.quadraticCurveTo(0, h / 2, l, h - l);
    ctx.quadraticCurveTo(w / 2, h, w / 2, h / 8 * 5);
    ctx.closePath();
    ctx.fill();

    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = color.toString();

    ctx.moveTo(w / 8 * 3, h / 2);
    ctx.lineTo(w * 0.75, l);
    ctx.quadraticCurveTo(w, 0, w - l, h * 0.25);
    ctx.stroke();

    ctx.moveTo(w / 2, h / 8 * 5);
    ctx.lineTo(w - l, h * 0.25);
    ctx.stroke();

    return canvas;
};

SymbolMorph.prototype.drawSymbolRectangle = function (canvas, color) {
    // answer a canvas showing a rectangle
    var ctx = canvas.getContext('2d'),
        w = canvas.width,
        h = canvas.width,
        l = Math.max(w / 20, 0.5);

    ctx.strokeStyle = color.toString();
    ctx.lineWidth = l * 2;
    ctx.beginPath();
    ctx.moveTo(l, l);
    ctx.lineTo(w - l, l);
    ctx.lineTo(w - l, h - l);
    ctx.lineTo(l, h - l);
    ctx.closePath();
    ctx.stroke();
    return canvas;
};

SymbolMorph.prototype.drawSymbolRectangleSolid = function (canvas, color) {
    // answer a canvas showing a solid rectangle
    var ctx = canvas.getContext('2d'),
        w = canvas.width,
        h = canvas.width;

    ctx.fillStyle = color.toString();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(w, 0);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();
    return canvas;
};

SymbolMorph.prototype.drawSymbolCircle = function (canvas, color) {
    // answer a canvas showing a circle
    var ctx = canvas.getContext('2d'),
        w = canvas.width,
        l = Math.max(w / 20, 0.5);

    ctx.strokeStyle = color.toString();
    ctx.lineWidth = l * 2;
    ctx.arc(w / 2, w / 2, w / 2 - l, radians(0), radians(360), false);
    ctx.stroke();
    return canvas;
};

SymbolMorph.prototype.drawSymbolCircleSolid = function (canvas, color) {
    // answer a canvas showing a solid circle
    var ctx = canvas.getContext('2d'),
        w = canvas.width;

    ctx.fillStyle = color.toString();
    ctx.arc(w / 2, w / 2, w / 2, radians(0), radians(360), false);
    ctx.fill();
    return canvas;
};

SymbolMorph.prototype.drawSymbolLine = function (canvas, color) {
    // answer a canvas showing a diagonal line
    var ctx = canvas.getContext('2d'),
        w = canvas.width,
        h = canvas.height,
        l = Math.max(w / 20, 0.5);

    ctx.strokeStyle = color.toString();
    ctx.lineWidth = l * 2;
    ctx.lineCap = 'round';
    ctx.moveTo(l, l);
    ctx.lineTo(w - l, h - l);
    ctx.stroke();
    return canvas;
};

SymbolMorph.prototype.drawSymbolCrosshairs = function (canvas, color) {
    // answer a canvas showing a crosshairs
    var ctx = canvas.getContext('2d'),
        w = canvas.width,
        h = canvas.height,
        l = 0.5;

    ctx.strokeStyle = color.toString();
    ctx.lineWidth = l * 2;
    ctx.moveTo(l, h / 2);
    ctx.lineTo(w - l, h / 2);
    ctx.stroke();
    ctx.moveTo(w / 2, l);
    ctx.lineTo(w / 2, h - l);
    ctx.stroke();
    ctx.moveTo(w / 2, h / 2);
    ctx.arc(w / 2, w / 2, w / 3 - l, radians(0), radians(360), false);
    ctx.stroke();
    return canvas;
};

SymbolMorph.prototype.drawSymbolPaintbucket = function (canvas, color) {
    // answer a canvas showing a paint bucket
    var ctx = canvas.getContext('2d'),
        w = canvas.width,
        h = canvas.height,
        n = canvas.width / 5,
        l = Math.max(w / 30, 0.5);

    ctx.strokeStyle = color.toString();
    ctx.lineWidth = l * 2;
    ctx.beginPath();
    ctx.moveTo(n * 2, n);
    ctx.lineTo(n * 4, n * 3);
    ctx.lineTo(n * 3, n * 4);
    ctx.quadraticCurveTo(n * 2, h, n, n * 4);
    ctx.quadraticCurveTo(0, n * 3, n, n * 2);
    ctx.closePath();
    ctx.stroke();

    ctx.lineWidth = l;
    ctx.moveTo(n * 2, n * 2.5);
    ctx.arc(n * 2, n * 2.5, l, radians(0), radians(360), false);
    ctx.stroke();

    ctx.moveTo(n * 2, n * 2.5);
    ctx.lineTo(n * 2, n / 2 + l);
    ctx.stroke();

    ctx.arc(n * 1.5, n / 2 + l, n / 2, radians(0), radians(180), true);
    ctx.stroke();

    ctx.moveTo(n, n / 2 + l);
    ctx.lineTo(n, n * 2);
    ctx.stroke();

    ctx.fillStyle = color.toString();
    ctx.beginPath();
    ctx.moveTo(n * 3.5, n * 3.5);
    ctx.quadraticCurveTo(w, n * 3.5, w - l, h);
    ctx.lineTo(w, h);
    ctx.quadraticCurveTo(w, n * 2, n * 2.5, n * 1.5);
    ctx.lineTo(n * 4, n * 3);
    ctx.closePath();
    ctx.fill();

    return canvas;
};

SymbolMorph.prototype.drawSymbolEraser = function (canvas, color) {
    // answer a canvas showing an eraser
    var ctx = canvas.getContext('2d'),
        w = canvas.width,
        h = canvas.height,
        n = canvas.width / 4,
        l = Math.max(w / 20, 0.5);

    ctx.strokeStyle = color.toString();
    ctx.lineWidth = l * 2;
    ctx.beginPath();
    ctx.moveTo(n * 3, l);
    ctx.lineTo(l, n * 3);
    ctx.quadraticCurveTo(n, h, n * 2, n * 3);
    ctx.lineTo(w - l, n);
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = color.toString();
    ctx.beginPath();
    ctx.moveTo(n * 3, 0);
    ctx.lineTo(n * 1.5, n * 1.5);
    ctx.lineTo(n * 2.5, n * 2.5);
    ctx.lineTo(w, n);
    ctx.closePath();
    ctx.fill();

    return canvas;
};

SymbolMorph.prototype.drawSymbolPipette = function (canvas, color) {
    // answer a canvas showing an eyedropper
    var ctx = canvas.getContext('2d'),
        w = canvas.width,
        h = canvas.height,
        n = canvas.width / 4,
        n2 = n / 2,
        l = Math.max(w / 20, 0.5);

    ctx.strokeStyle = color.toString();
    ctx.lineWidth = l * 2;
    ctx.beginPath();
    ctx.moveTo(l, h - l);
    ctx.quadraticCurveTo(n2, h - n2, n2, h - n);
    ctx.lineTo(n * 2, n * 1.5);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(l, h - l);
    ctx.quadraticCurveTo(n2, h - n2, n, h - n2);
    ctx.lineTo(n * 2.5, n * 2);
    ctx.stroke();

    ctx.fillStyle = color.toString();
    ctx.arc(n * 3, n, n - l, radians(0), radians(360), false);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(n * 2, n);
    ctx.lineTo(n * 3, n * 2);
    ctx.stroke();

    return canvas;
};

SymbolMorph.prototype.drawSymbolSpeechBubble = function (canvas, color) {
    // answer a canvas showing a speech bubble
    var ctx = canvas.getContext('2d'),
        w = canvas.width,
        h = canvas.height,
        n = canvas.width / 3,
        l = Math.max(w / 20, 0.5);

    ctx.fillStyle = color.toString();
    ctx.lineWidth = l * 2;
    ctx.beginPath();
    ctx.moveTo(n, n * 2);
    ctx.quadraticCurveTo(l, n * 2, l, n);
    ctx.quadraticCurveTo(l, l, n, l);
    ctx.lineTo(n * 2, l);
    ctx.quadraticCurveTo(w - l, l, w - l, n);
    ctx.quadraticCurveTo(w - l, n * 2, n * 2, n * 2);
    ctx.lineTo(n / 2, h - l);
    ctx.closePath();
    ctx.fill();
    return canvas;
};

SymbolMorph.prototype.drawSymbolSpeechBubbleOutline = function (
    canvas,
    color
) {
    // answer a canvas showing a speech bubble
    var ctx = canvas.getContext('2d'),
        w = canvas.width,
        h = canvas.height,
        n = canvas.width / 3,
        l = Math.max(w / 20, 0.5);

    ctx.strokeStyle = color.toString();
    ctx.lineWidth = l * 2;
    ctx.beginPath();
    ctx.moveTo(n, n * 2);
    ctx.quadraticCurveTo(l, n * 2, l, n);
    ctx.quadraticCurveTo(l, l, n, l);
    ctx.lineTo(n * 2, l);
    ctx.quadraticCurveTo(w - l, l, w - l, n);
    ctx.quadraticCurveTo(w - l, n * 2, n * 2, n * 2);
    ctx.lineTo(n / 2, h - l);
    ctx.closePath();
    ctx.stroke();
    return canvas;
};

SymbolMorph.prototype.drawSymbolArrowUp = function (canvas, color) {
    // answer a canvas showing an up arrow
    var ctx = canvas.getContext('2d'),
        w = canvas.width,
        h = canvas.height,
        n = canvas.width / 2,
        l = Math.max(w / 20, 0.5);

    ctx.fillStyle = color.toString();
    ctx.lineWidth = l * 2;
    ctx.beginPath();
    ctx.moveTo(l, n);
    ctx.lineTo(n, l);
    ctx.lineTo(w - l, n);
    ctx.lineTo(w * 0.65, n);
    ctx.lineTo(w * 0.65, h - l);
    ctx.lineTo(w * 0.35, h - l);
    ctx.lineTo(w * 0.35, n);
    ctx.closePath();
    ctx.fill();
    return canvas;
};

SymbolMorph.prototype.drawSymbolArrowUpOutline = function (canvas, color) {
    // answer a canvas showing an up arrow
    var ctx = canvas.getContext('2d'),
        w = canvas.width,
        h = canvas.height,
        n = canvas.width / 2,
        l = Math.max(w / 20, 0.5);

    ctx.strokeStyle = color.toString();
    ctx.lineWidth = l * 2;
    ctx.beginPath();
    ctx.moveTo(l, n);
    ctx.lineTo(n, l);
    ctx.lineTo(w - l, n);
    ctx.lineTo(w * 0.65, n);
    ctx.lineTo(w * 0.65, h - l);
    ctx.lineTo(w * 0.35, h - l);
    ctx.lineTo(w * 0.35, n);
    ctx.closePath();
    ctx.stroke();
    return canvas;
};

SymbolMorph.prototype.drawSymbolArrowDown = function (canvas, color) {
    // answer a canvas showing a down arrow
    var ctx = canvas.getContext('2d'),
        w = canvas.width;
    ctx.save();
    ctx.translate(w, w);
    ctx.rotate(radians(180));
    this.drawSymbolArrowUp(canvas, color);
    ctx.restore();
    return canvas;
};

SymbolMorph.prototype.drawSymbolArrowDownOutline = function (canvas, color) {
    // answer a canvas showing a down arrow
    var ctx = canvas.getContext('2d'),
        w = canvas.width;
    ctx.save();
    ctx.translate(w, w);
    ctx.rotate(radians(180));
    this.drawSymbolArrowUpOutline(canvas, color);
    ctx.restore();
    return canvas;
};

SymbolMorph.prototype.drawSymbolArrowLeft = function (canvas, color) {
    // answer a canvas showing a left arrow
    var ctx = canvas.getContext('2d'),
        w = canvas.width;
    ctx.save();
    ctx.translate(0, w);
    ctx.rotate(radians(-90));
    this.drawSymbolArrowUp(canvas, color);
    ctx.restore();
    return canvas;
};

SymbolMorph.prototype.drawSymbolArrowLeftOutline = function (canvas, color) {
    // answer a canvas showing a left arrow
    var ctx = canvas.getContext('2d'),
        w = canvas.width;
    ctx.save();
    ctx.translate(0, w);
    ctx.rotate(radians(-90));
    this.drawSymbolArrowUpOutline(canvas, color);
    ctx.restore();
    return canvas;
};

SymbolMorph.prototype.drawSymbolArrowRight = function (canvas, color) {
    // answer a canvas showing a right arrow
    var ctx = canvas.getContext('2d'),
        w = canvas.width;
    ctx.save();
    ctx.translate(w, 0);
    ctx.rotate(radians(90));
    this.drawSymbolArrowUp(canvas, color);
    ctx.restore();
    return canvas;
};

SymbolMorph.prototype.drawSymbolArrowRightOutline = function (canvas, color) {
    // answer a canvas showing a right arrow
    var ctx = canvas.getContext('2d'),
        w = canvas.width;
    ctx.save();
    ctx.translate(w, 0);
    ctx.rotate(radians(90));
    this.drawSymbolArrowUpOutline(canvas, color);
    ctx.restore();
    return canvas;
};

SymbolMorph.prototype.drawSymbolRobot = function (canvas, color) {
    // answer a canvas showing a humanoid robot
    var ctx = canvas.getContext('2d'),
        w = canvas.width,
        h = canvas.height,
        n = canvas.width / 6,
        n2 = n / 2,
        l = Math.max(w / 20, 0.5);

    ctx.fillStyle = color.toString();
    //ctx.lineWidth = l * 2;

    ctx.beginPath();
    ctx.moveTo(n + l, n);
    ctx.lineTo(n * 2, n);
    ctx.lineTo(n * 2.5, n * 1.5);
    ctx.lineTo(n * 3.5, n * 1.5);
    ctx.lineTo(n * 4, n);
    ctx.lineTo(n * 5 - l, n);
    ctx.lineTo(n * 4, n * 3);
    ctx.lineTo(n * 4, n * 4 - l);
    ctx.lineTo(n * 2, n * 4 - l);
    ctx.lineTo(n * 2, n * 3);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(n * 2.75, n + l);
    ctx.lineTo(n * 2.4, n);
    ctx.lineTo(n * 2.2, 0);
    ctx.lineTo(n * 3.8, 0);
    ctx.lineTo(n * 3.6, n);
    ctx.lineTo(n * 3.25, n + l);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(n * 2.5, n * 4);
    ctx.lineTo(n, n * 4);
    ctx.lineTo(n2 + l, h);
    ctx.lineTo(n * 2, h);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(n * 3.5, n * 4);
    ctx.lineTo(n * 5, n * 4);
    ctx.lineTo(w - (n2 + l), h);
    ctx.lineTo(n * 4, h);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(n, n);
    ctx.lineTo(l, n * 1.5);
    ctx.lineTo(l, n * 3.25);
    ctx.lineTo(n * 1.5, n * 3.5);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(n * 5, n);
    ctx.lineTo(w - l, n * 1.5);
    ctx.lineTo(w - l, n * 3.25);
    ctx.lineTo(n * 4.5, n * 3.5);
    ctx.closePath();
    ctx.fill();

    return canvas;
};

// ColorSlotMorph //////////////////////////////////////////////////////

/*
    I am an editable input slot for a color. Users can edit my color by
    clicking on me, in which case a display a color gradient palette
    and let the user select another color. Note that the user isn't
    restricted to selecting a color from the palette, any color from
    anywhere within the World can be chosen.

    my block spec is %clr

    evaluate() returns my color
*/

// ColorSlotMorph  inherits from ArgMorph:

ColorSlotMorph.prototype = new ArgMorph();
ColorSlotMorph.prototype.constructor = ColorSlotMorph;
ColorSlotMorph.uber = ArgMorph.prototype;

// ColorSlotMorph  instance creation:

function ColorSlotMorph(clr) {
    this.init(clr);
}

ColorSlotMorph.prototype.init = function (clr) {
    ColorSlotMorph.uber.init.call(this, null, true); // silently
    this.setColor(clr || new Color(145, 26, 68));
};

ColorSlotMorph.prototype.getSpec = function () {
    return '%clr';
};

// ColorSlotMorph  color sensing:

ColorSlotMorph.prototype.getUserColor = function () {
    var myself = this,
        world = this.world(),
        hand = world.hand,
        posInDocument = getDocumentPositionOf(world.worldCanvas),
        mouseMoveBak = hand.processMouseMove,
        mouseDownBak = hand.processMouseDown,
        mouseUpBak = hand.processMouseUp,
        pal = new ColorPaletteMorph(null, new Point(
            this.fontSize * 16,
            this.fontSize * 10
        ));
    world.add(pal);
    pal.setPosition(this.bottomLeft().add(new Point(0, this.edge)));

    hand.processMouseMove = function (event) {
        hand.setPosition(new Point(
            event.pageX - posInDocument.x,
            event.pageY - posInDocument.y
        ));
        myself.setColor(world.getGlobalPixelColor(hand.position()));
    };

    hand.processMouseDown = nop;

    hand.processMouseUp = function () {
        pal.destroy();
        hand.processMouseMove = mouseMoveBak;
        hand.processMouseDown = mouseDownBak;
        hand.processMouseUp = mouseUpBak;
    };
};

// ColorSlotMorph events:

ColorSlotMorph.prototype.mouseClickLeft = function () {
    this.getUserColor();
};

// ColorSlotMorph evaluating:

ColorSlotMorph.prototype.evaluate = function () {
    return this.color;
};

// ColorSlotMorph drawing:

ColorSlotMorph.prototype.drawNew = function () {
    var context, borderColor, side;

    side = this.fontSize + this.edge * 2 + this.typeInPadding * 2;
    this.silentSetExtent(new Point(side, side));

    // initialize my surface property
    this.image = newCanvas(this.extent());
    context = this.image.getContext('2d');
    if (this.parent) {
        borderColor = this.parent.color;
    } else {
        borderColor = new Color(120, 120, 120);
    }
    context.fillStyle = this.color.toString();

    // cache my border colors
    this.cachedClr = borderColor.toString();
    this.cachedClrBright = borderColor.lighter(this.contrast)
        .toString();
    this.cachedClrDark = borderColor.darker(this.contrast).toString();

    context.fillRect(
        this.edge,
        this.edge,
        this.width() - this.edge * 2,
        this.height() - this.edge * 2
    );
    if (!MorphicPreferences.isFlat) {
        this.drawRectBorder(context);
    }
};

ColorSlotMorph.prototype.drawRectBorder =
    InputSlotMorph.prototype.drawRectBorder;

// BlockHighlightMorph /////////////////////////////////////////////////

// BlockHighlightMorph inherits from Morph:

BlockHighlightMorph.prototype = new Morph();
BlockHighlightMorph.prototype.constructor = BlockHighlightMorph;
BlockHighlightMorph.uber = Morph.prototype;

// BlockHighlightMorph instance creation:

function BlockHighlightMorph() {
    this.init();
}

// MultiArgMorph ///////////////////////////////////////////////////////

/*
    I am an arity controlled list of input slots

    my block specs are

        %mult%x - where x is any single input slot
        %inputs - for an additional text label 'with inputs'

    evaluation is handles by the interpreter
*/

// MultiArgMorph  inherits from ArgMorph:

MultiArgMorph.prototype = new ArgMorph();
MultiArgMorph.prototype.constructor = MultiArgMorph;
MultiArgMorph.uber = ArgMorph.prototype;

// MultiArgMorph instance creation:

function MultiArgMorph(
    slotSpec,
    labelTxt,
    min,
    eSpec,
    arrowColor,
    labelColor,
    shadowColor,
    shadowOffset,
    isTransparent
) {
    this.init(
        slotSpec,
        labelTxt,
        min,
        eSpec,
        arrowColor,
        labelColor,
        shadowColor,
        shadowOffset,
        isTransparent
    );
}

MultiArgMorph.prototype.init = function (
    slotSpec,
    labelTxt,
    min,
    eSpec,
    arrowColor,
    labelColor,
    shadowColor,
    shadowOffset,
    isTransparent
) {
    var label,
        arrows = new FrameMorph(),
        leftArrow,
        rightArrow,
        i;

    this.slotSpec = slotSpec || '%s';
    this.labelText = localize(labelTxt || '');
    this.minInputs = min || 0;
    this.elementSpec = eSpec || null;
    this.labelColor = labelColor || null;
    this.shadowColor = shadowColor || null;
    this.shadowOffset = shadowOffset || null;

    this.canBeEmpty = true;
    MultiArgMorph.uber.init.call(this, null, true); // silently

    // MultiArgMorphs are transparent by default b/c of zebra coloring
    this.alpha = isTransparent === false ? 1 : 0;
    arrows.alpha = isTransparent === false ? 1 : 0;
    arrows.noticesTransparentClick = true;
    this.noticesTransparentclick = true;

    // label text:
    label = this.labelPart(this.labelText);
    this.add(label);
    label.hide();

    // left arrow:
    leftArrow = new ArrowMorph(
        'left',
        this.fontSize,
        Math.max(Math.floor(this.fontSize / 6), 1),
        arrowColor
    );

    // right arrow:
    rightArrow = new ArrowMorph(
        'right',
        this.fontSize,
        Math.max(Math.floor(this.fontSize / 6), 1),
        arrowColor
    );

    // control panel:
    arrows.add(leftArrow);
    arrows.add(rightArrow);
    arrows.drawNew();
    arrows.acceptsDrops = false;

    this.add(arrows);

    // create the minimum number of inputs
    for (i = 0; i < this.minInputs; i += 1) {
        this.addInput();
    }
};

MultiArgMorph.prototype.label = function () {
    return this.children[0];
};

MultiArgMorph.prototype.arrows = function () {
    return this.children[this.children.length - 1];
};

MultiArgMorph.prototype.getSpec = function () {
    return '%mult' + this.slotSpec;
};

// MultiArgMorph defaults:

MultiArgMorph.prototype.setContents = function (anArray) {
    var inputs = this.inputs(), i;
    for (i = 0; i < anArray.length; i += 1) {
        if (anArray[i] !== null && (inputs[i])) {
            inputs[i].setContents(anArray[i]);
        }
    }
};

// MultiArgMorph hiding and showing:

/*
    override the inherited behavior to recursively hide/show all
    children, so that my instances get restored correctly when
    switching back out of app mode.
*/

MultiArgMorph.prototype.hide = function () {
    this.isVisible = false;
    this.changed();
};

MultiArgMorph.prototype.show = function () {
    this.isVisible = true;
    this.changed();
};

// MultiArgMorph coloring:

MultiArgMorph.prototype.setLabelColor = function (
    textColor,
    shadowColor,
    shadowOffset
) {
    this.textColor = textColor;
    this.shadowColor = shadowColor;
    this.shadowOffset = shadowOffset;
    MultiArgMorph.uber.setLabelColor.call(
        this,
        textColor,
        shadowColor,
        shadowOffset
    );
};

// MultiArgMorph layout:

MultiArgMorph.prototype.fixLayout = function () {
    if (this.slotSpec === '%t') {
        this.isStatic = true; // in this case I cannot be exchanged
    }
    if (this.parent) {
        var label = this.label(), shadowColor, shadowOffset;
        this.color = this.parent.color;
        shadowColor = this.shadowColor ||
            this.parent.color.darker(this.labelContrast);
        shadowOffset = this.shadowOffset || label.shadowOffset;
        this.arrows().color = this.color;

        if (this.labelText !== '') {
            if (!label.shadowColor.eq(shadowColor)) {
                label.shadowColor = shadowColor;
                label.shadowOffset = shadowOffset;
                label.drawNew();
            }
        }

    }
    this.fixArrowsLayout();
    MultiArgMorph.uber.fixLayout.call(this);
    if (this.parent) {
        this.parent.fixLayout();
    }
};

MultiArgMorph.prototype.fixArrowsLayout = function () {
    var label = this.label(),
        arrows = this.arrows(),
        leftArrow = arrows.children[0],
        rightArrow = arrows.children[1],
        dim = new Point(rightArrow.width() / 2, rightArrow.height());
    if (this.inputs().length < (this.minInputs + 1)) {
        label.hide();
        leftArrow.hide();
        rightArrow.setPosition(
            arrows.position().subtract(new Point(dim.x, 0))
        );
        arrows.setExtent(dim);
    } else {
        if (this.labelText !== '') {
            label.show();
        }
        leftArrow.show();
        rightArrow.setPosition(leftArrow.topCenter());
        arrows.bounds.corner = rightArrow.bottomRight().copy();
    }
    arrows.drawNew();
};

MultiArgMorph.prototype.refresh = function () {
    this.inputs().forEach(function (input) {
        input.drawNew();
    });
};

MultiArgMorph.prototype.drawNew = function () {
    MultiArgMorph.uber.drawNew.call(this);
    this.refresh();
};

// MultiArgMorph arity control:

MultiArgMorph.prototype.addInput = function (contents) {
    var i, name,
        newPart = this.labelPart(this.slotSpec),
        idx = this.children.length - 1;
    // newPart.alpha = this.alpha ? 1 : (1 - this.alpha) / 2;
    if (contents) {
        newPart.setContents(contents);
    } else if (this.elementSpec === '%scriptVars' ||
            this.elementSpec === '%blockVars') {
        name = '';
        i = idx;
        while (i > 0) {
            name = String.fromCharCode(97 + (i - 1) % 26) + name;
            i = Math.floor((i - 1) / 26);
        }
        newPart.setContents(name);
    } else if (contains(['%parms', '%ringparms'], this.elementSpec)) {
        newPart.setContents('#' + idx);
    }
    newPart.parent = this;
    this.children.splice(idx, 0, newPart);
    newPart.drawNew();
    this.fixLayout();
};

MultiArgMorph.prototype.removeInput = function () {
    var oldPart, scripts;
    if (this.children.length > 1) {
        oldPart = this.children[this.children.length - 2];
        this.removeChild(oldPart);
        if (oldPart instanceof BlockMorph) {
            scripts = this.parentThatIsA(ScriptsMorph);
            if (scripts) {
                scripts.add(oldPart);
            }
        }
    }
    this.fixLayout();
};

// MultiArgMorph events:

MultiArgMorph.prototype.mouseClickLeft = function (pos) {
    // prevent expansion in the palette
    // (because it can be hard or impossible to collapse again)
    if (!this.parentThatIsA(ScriptsMorph)) {
        this.escalateEvent('mouseClickLeft', pos);
        return;
    }
    // if the <shift> key is pressed, repeat action 5 times
    var arrows = this.arrows(),
        leftArrow = arrows.children[0],
        rightArrow = arrows.children[1],
        repetition = this.world().currentKey === 16 ? 3 : 1,
        id = SnapCollaborator.getId(this),
        i;

    this.startLayout();
    if (rightArrow.bounds.containsPoint(pos)) {
        for (i = 0; i < repetition; i += 1) {
            if (rightArrow.isVisible) {
                SnapCollaborator.addListInput(id);
            }
        }
    } else if (leftArrow.bounds.containsPoint(pos)) {
        for (i = 0; i < repetition; i += 1) {
            if (leftArrow.isVisible) {
                SnapCollaborator.removeListInput(id);
            }
        }
    } else {
        this.escalateEvent('mouseClickLeft', pos);
    }
    this.endLayout();
};

// MultiArgMorph menu:

MultiArgMorph.prototype.userMenu = function () {
    var menu = new MenuMorph(this),
        block = this.parentThatIsA(BlockMorph),
        key = '',
        myself = this;
    if (!StageMorph.prototype.enableCodeMapping) {
        return this.parent.userMenu();
    }
    if (block) {
        if (block instanceof RingMorph) {
            key = 'parms_';
        } else if (block.selector === 'doDeclareVariables') {
            key = 'tempvars_';
        }
    }
    menu.addItem(
        'code list mapping...',
        function () {myself.mapCodeList(key); }
    );
    menu.addItem(
        'code item mapping...',
        function () {myself.mapCodeItem(key); }
    );
    menu.addItem(
        'code delimiter mapping...',
        function () {myself.mapCodeDelimiter(key); }
    );
    return menu;
};

// MultiArgMorph code mapping

/*
    code mapping lets you use blocks to generate arbitrary text-based
    source code that can be exported and compiled / embedded elsewhere,
    it's not part of Snap's evaluator and not needed for Snap itself
*/

MultiArgMorph.prototype.mapCodeDelimiter = function (key) {
    this.mapToCode(key + 'delim', 'list item delimiter');
};

MultiArgMorph.prototype.mapCodeList = function (key) {
    this.mapToCode(key + 'list', 'list contents <#1>');
};

MultiArgMorph.prototype.mapCodeItem = function (key) {
    this.mapToCode(key + 'item', 'list item <#1>');
};

MultiArgMorph.prototype.mapToCode = function (key, label) {
    // private - open a dialog box letting the user map code via the GUI
    new DialogBoxMorph(
        this,
        function (code) {
            StageMorph.prototype.codeMappings[key] = code;
        },
        this
    ).promptCode(
        'Code mapping - ' + label,
        StageMorph.prototype.codeMappings[key] || '',
        this.world()
    );
};

MultiArgMorph.prototype.mappedCode = function (definitions) {
    var block = this.parentThatIsA(BlockMorph),
        key = '',
        code,
        items = '',
        itemCode,
        delim,
        count = 0,
        parts = [];

    if (block) {
        if (block instanceof RingMorph) {
            key = 'parms_';
        } else if (block.selector === 'doDeclareVariables') {
            key = 'tempvars_';
        }
    }

    code = StageMorph.prototype.codeMappings[key + 'list'] || '<#1>';
    itemCode = StageMorph.prototype.codeMappings[key + 'item'] || '<#1>';
    delim = StageMorph.prototype.codeMappings[key + 'delim'] || ' ';

    this.inputs().forEach(function (input) {
        parts.push(itemCode.replace(/<#1>/g, input.mappedCode(definitions)));
    });
    parts.forEach(function (part) {
        if (count) {
            items += delim;
        }
        items += part;
        count += 1;
    });
    code = code.replace(/<#1>/g, items);
    return code;
};

// MultiArgMorph arity evaluating:

MultiArgMorph.prototype.evaluate = function () {
/*
    this is usually overridden by the interpreter. This method is only
    called (and needed) for the variables menu.
*/
    var result = [];
    this.inputs().forEach(function (slot) {
        result.push(slot.evaluate());
    });
    return result;
};

MultiArgMorph.prototype.isEmptySlot = function () {
    return this.canBeEmpty ? this.inputs().length === 0 : false;
};

// ArgLabelMorph ///////////////////////////////////////////////////////

/*
    I am a label string that is wrapped around an ArgMorph, usually
    a MultiArgMorph, so to indicate that it has been replaced entirely
    for an embedded reporter block

    I don't have a block spec, I get embedded automatically by the parent
    block's argument replacement mechanism

    My evaluation method is the identity function, i.e. I simply pass my
    input's value along.
*/

// ArgLabelMorph  inherits from ArgMorph:

ArgLabelMorph.prototype = new ArgMorph();
ArgLabelMorph.prototype.constructor = ArgLabelMorph;
ArgLabelMorph.uber = ArgMorph.prototype;

// MultiArgMorph instance creation:

function ArgLabelMorph(argMorph, labelTxt) {
    this.init(argMorph, labelTxt);
}

ArgLabelMorph.prototype.init = function (argMorph, labelTxt) {
    var label;

    this.labelText = localize(labelTxt || 'input list:');
    ArgLabelMorph.uber.init.call(this, null, true); // silently

    this.isStatic = true; // I cannot be exchanged

    // ArgLabelMorphs are transparent
    this.alpha = 0;
    this.noticesTransparentclick = true;

    // label text:
    label = this.labelPart(this.labelText);
    this.add(label);

    // argMorph
    this.add(argMorph);
};

ArgLabelMorph.prototype.label = function () {
    return this.children[0];
};

ArgLabelMorph.prototype.argMorph = function () {
    return this.children[1];
};

// ArgLabelMorph layout:

ArgLabelMorph.prototype.fixLayout = function () {
    var label = this.label(),
        shadowColor,
        shadowOffset;

    if (this.parent) {
        this.color = this.parent.color;
        shadowOffset = label.shadowOffset || new Point();

        // determine the shadow color for zebra coloring:
        if (shadowOffset.x < 0) {
            shadowColor = this.parent.color.darker(this.labelContrast);
        } else {
            shadowColor = this.parent.color.lighter(this.labelContrast);
        }

        if (this.labelText !== '') {
            if (!label.shadowColor.eq(shadowColor)) {
                label.shadowColor = shadowColor;
                label.shadowOffset = shadowOffset;
                label.drawNew();
            }
        }
    }
    ArgLabelMorph.uber.fixLayout.call(this);
    if (this.parent) {
        this.parent.fixLayout();
    }
};

ArgLabelMorph.prototype.refresh = function () {
    this.inputs().forEach(function (input) {
        input.drawNew();
    });
};

ArgLabelMorph.prototype.drawNew = function () {
    ArgLabelMorph.uber.drawNew.call(this);
    this.refresh();
};

// ArgLabelMorph label color:

ArgLabelMorph.prototype.setLabelColor = function (
    textColor,
    shadowColor,
    shadowOffset
) {
    if (this.labelText !== '') {
        var label = this.label();
        label.color = textColor;
        label.shadowColor = shadowColor;
        label.shadowOffset = shadowOffset;
        label.drawNew();
    }
};

// ArgLabelMorph events:

ArgLabelMorph.prototype.reactToGrabOf = function () {
    if (this.parent instanceof SyntaxElementMorph) {
        this.parent.revertToDefaultInput(this);
    }
};

// ArgLabelMorph evaluating:

ArgLabelMorph.prototype.evaluate = function () {
/*
    this is usually overridden by the interpreter. This method is only
    called (and needed) for the variables menu.
*/
    return this.argMorph().evaluate();
};

ArgLabelMorph.prototype.isEmptySlot = function () {
    return false;
};

// FunctionSlotMorph ///////////////////////////////////////////////////

/*
    I am an unevaluated, non-editable, rf-colored, rounded or diamond
    input slot.    My current (only) use is in the THE BLOCK block.

    My command spec is %f
*/

// FunctionSlotMorph inherits from ArgMorph:

FunctionSlotMorph.prototype = new ArgMorph();
FunctionSlotMorph.prototype.constructor = FunctionSlotMorph;
FunctionSlotMorph.uber = ArgMorph.prototype;

// FunctionSlotMorph instance creation:

function FunctionSlotMorph(isPredicate) {
    this.init(isPredicate);
}

FunctionSlotMorph.prototype.init = function (isPredicate, silently) {
    FunctionSlotMorph.uber.init.call(this, null, true); // silently
    this.isPredicate = isPredicate || false;
    this.color = this.rfColor;
    this.setExtent(
        new Point(
            (this.fontSize + this.edge * 2) * 2,
            this.fontSize + this.edge * 2
        ),
        silently
    );
};

FunctionSlotMorph.prototype.getSpec = function () {
    return '%f';
};

// FunctionSlotMorph drawing:

FunctionSlotMorph.prototype.drawNew = function () {
    var context, borderColor;

    // initialize my surface property
    this.image = newCanvas(this.extent());
    context = this.image.getContext('2d');
    if (this.parent) {
        borderColor = this.parent.color;
    } else {
        borderColor = new Color(120, 120, 120);
    }

    // cache my border colors
    this.cachedClr = borderColor.toString();
    this.cachedClrBright = borderColor.lighter(this.contrast)
        .toString();
    this.cachedClrDark = borderColor.darker(this.contrast).toString();

    if (this.isPredicate) {
        this.drawDiamond(context);
    } else {
        this.drawRounded(context);
    }
};

FunctionSlotMorph.prototype.drawRounded = function (context) {
    var h = this.height(),
        r = Math.min(this.rounding, h / 2),
        w = this.width(),
        shift = this.edge / 2,
        gradient;

    // draw the 'flat' shape:
    context.fillStyle = this.color.toString();
    context.beginPath();

    // top left:
    context.arc(
        r,
        r,
        r,
        radians(-180),
        radians(-90),
        false
    );

    // top right:
    context.arc(
        w - r,
        r,
        r,
        radians(-90),
        radians(-0),
        false
    );

    // bottom right:
    context.arc(
        w - r,
        h - r,
        r,
        radians(0),
        radians(90),
        false
    );

    // bottom left:
    context.arc(
        r,
        h - r,
        r,
        radians(90),
        radians(180),
        false
    );

    context.closePath();
    context.fill();

    if (MorphicPreferences.isFlat) {return; }

    // add 3D-Effect:
    context.lineWidth = this.edge;
    context.lineJoin = 'round';
    context.lineCap = 'round';

    // bottom left corner
    context.strokeStyle = this.cachedClr; //gradient;
    context.beginPath();
    context.arc(
        r,
        h - r,
        r - shift,
        radians(90),
        radians(180),
        false
    );
    context.stroke();

    // top right corner
    context.strokeStyle = this.cachedClr; //gradient;
    context.beginPath();
    context.arc(
        w - r,
        r,
        r - shift,
        radians(-90),
        radians(0),
        false
    );
    context.stroke();

    // normal gradient edges

    context.shadowOffsetX = shift;
    context.shadowOffsetY = shift;
    context.shadowBlur = this.edge;
    context.shadowColor = this.color.darker(80).toString();

    // top edge: straight line
    gradient = context.createLinearGradient(
        0,
        0,
        0,
        this.edge
    );
    gradient.addColorStop(1, this.cachedClrDark);
    gradient.addColorStop(0, this.cachedClr);
    context.strokeStyle = gradient;
    context.beginPath();
    context.moveTo(r - shift, shift);
    context.lineTo(w - r + shift, shift);
    context.stroke();

    // top edge: left corner
    gradient = context.createRadialGradient(
        r,
        r,
        r - this.edge,
        r,
        r,
        r
    );
    gradient.addColorStop(1, this.cachedClr);
    gradient.addColorStop(0, this.cachedClrDark);
    context.strokeStyle = gradient;
    context.beginPath();
    context.arc(
        r,
        r,
        r - shift,
        radians(180),
        radians(270),
        false
    );
    context.stroke();

    // left edge: straight vertical line
    gradient = context.createLinearGradient(0, 0, this.edge, 0);
    gradient.addColorStop(1, this.cachedClrDark);
    gradient.addColorStop(0, this.cachedClr);
    context.strokeStyle = gradient;
    context.beginPath();
    context.moveTo(shift, r);
    context.lineTo(shift, h - r);
    context.stroke();

    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
    context.shadowBlur = 0;

    // bottom edge: right corner
    gradient = context.createRadialGradient(
        w - r,
        h - r,
        r - this.edge,
        w - r,
        h - r,
        r
    );
    gradient.addColorStop(1, this.cachedClr);
    gradient.addColorStop(0, this.cachedClrBright);
    context.strokeStyle = gradient;
    context.beginPath();
    context.arc(
        w - r,
        h - r,
        r - shift,
        radians(0),
        radians(90),
        false
    );
    context.stroke();

    // bottom edge: straight line
    gradient = context.createLinearGradient(
        0,
        h - this.edge,
        0,
        h
    );
    gradient.addColorStop(1, this.cachedClr);
    gradient.addColorStop(0, this.cachedClrBright);
    context.strokeStyle = gradient;
    context.beginPath();
    context.moveTo(r - shift, h - shift);
    context.lineTo(w - r + shift, h - shift);
    context.stroke();

    // right edge: straight vertical line
    gradient = context.createLinearGradient(w - this.edge, 0, w, 0);
    gradient.addColorStop(1, this.cachedClr);
    gradient.addColorStop(0, this.cachedClrBright);
    context.strokeStyle = gradient;
    context.beginPath();
    context.moveTo(w - shift, r + shift);
    context.lineTo(w - shift, h - r);
    context.stroke();

};

FunctionSlotMorph.prototype.drawDiamond = function (context) {
    var w = this.width(),
        h = this.height(),
        h2 = Math.floor(h / 2),
        r = Math.min(this.rounding, h2),
        shift = this.edge / 2,
        gradient;

    // draw the 'flat' shape:
    context.fillStyle = this.color.toString();
    context.beginPath();

    context.moveTo(0, h2);
    context.lineTo(r, 0);
    context.lineTo(w - r, 0);
    context.lineTo(w, h2);
    context.lineTo(w - r, h);
    context.lineTo(r, h);

    context.closePath();
    context.fill();

    if (MorphicPreferences.isFlat) {return; }

    // add 3D-Effect:
    context.lineWidth = this.edge;
    context.lineJoin = 'round';
    context.lineCap = 'round';

    // half-tone edges
    // bottom left corner
    context.strokeStyle = this.cachedClr;
    context.beginPath();
    context.moveTo(shift, h2);
    context.lineTo(r, h - shift);
    context.stroke();

    // top right corner
    context.strokeStyle = this.cachedClr;
    context.beginPath();
    context.moveTo(w - shift, h2);
    context.lineTo(w - r, shift);
    context.stroke();

    // normal gradient edges
    // top edge: left corner

    context.shadowOffsetX = shift;
    context.shadowOffsetY = shift;
    context.shadowBlur = this.edge;
    context.shadowColor = this.color.darker(80).toString();

    gradient = context.createLinearGradient(
        0,
        0,
        r,
        0
    );
    gradient.addColorStop(1, this.cachedClrDark);
    gradient.addColorStop(0, this.cachedClr);
    context.strokeStyle = gradient;
    context.beginPath();
    context.moveTo(shift, h2);
    context.lineTo(r, shift);
    context.stroke();

    // top edge: straight line
    gradient = context.createLinearGradient(
        0,
        0,
        0,
        this.edge
    );
    gradient.addColorStop(1, this.cachedClrDark);
    gradient.addColorStop(0, this.cachedClr);
    context.strokeStyle = gradient;
    context.beginPath();
    context.moveTo(r, shift);
    context.lineTo(w - r, shift);
    context.stroke();

    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
    context.shadowBlur = 0;

    // bottom edge: right corner
    gradient = context.createLinearGradient(
        w - r,
        0,
        w,
        0
    );
    gradient.addColorStop(1, this.cachedClr);
    gradient.addColorStop(0, this.cachedClrBright);
    context.strokeStyle = gradient;
    context.beginPath();
    context.moveTo(w - r, h - shift);
    context.lineTo(w - shift, h2);
    context.stroke();

    // bottom edge: straight line
    gradient = context.createLinearGradient(
        0,
        h - this.edge,
        0,
        h
    );
    gradient.addColorStop(1, this.cachedClr);
    gradient.addColorStop(0, this.cachedClrBright);
    context.strokeStyle = gradient;
    context.beginPath();
    context.moveTo(r + shift, h - shift);
    context.lineTo(w - r - shift, h - shift);
    context.stroke();
};

// ReporterSlotMorph ///////////////////////////////////////////////////

/*
    I am a ReporterBlock-shaped input slot. I can nest as well as
    accept reporter blocks (containing reified scripts).

    my most important accessor is

    nestedBlock()    - answer the reporter block I encompass, if any

    My command spec is %r for reporters (round) and %p for
    predicates (diamond)

    evaluate() returns my nested block or null
*/

// ReporterSlotMorph inherits from FunctionSlotMorph:

ReporterSlotMorph.prototype = new FunctionSlotMorph();
ReporterSlotMorph.prototype.constructor = ReporterSlotMorph;
ReporterSlotMorph.uber = FunctionSlotMorph.prototype;

// ReporterSlotMorph instance creation:

function ReporterSlotMorph(isPredicate) {
    this.init(isPredicate);
}

ReporterSlotMorph.prototype.init = function (isPredicate) {
    ReporterSlotMorph.uber.init.call(this, isPredicate, true);
    this.add(this.emptySlot());
    this.fixLayout();
};

ReporterSlotMorph.prototype.emptySlot = function () {
    var empty = new ArgMorph(),
        shrink = this.rfBorder * 2 + this.edge * 2;
    empty.color = this.rfColor;
    empty.alpha = 0;
    empty.setExtent(new Point(
        (this.fontSize + this.edge * 2) * 2 - shrink,
        this.fontSize + this.edge * 2 - shrink
    ));
    return empty;
};

// ReporterSlotMorph accessing:

ReporterSlotMorph.prototype.getSpec = function () {
    return '%r';
};

ReporterSlotMorph.prototype.contents = function () {
    return this.children[0];
};

ReporterSlotMorph.prototype.nestedBlock = function () {
    var contents = this.contents();
    return contents instanceof ReporterBlockMorph ? contents : null;
};

// ReporterSlotMorph evaluating:

ReporterSlotMorph.prototype.evaluate = function () {
    return this.nestedBlock();
};

ReporterSlotMorph.prototype.isEmptySlot = function () {
    return this.nestedBlock() === null;
};

// ReporterSlotMorph layout:

ReporterSlotMorph.prototype.fixLayout = function () {
    var contents = this.contents();
    this.setExtent(contents.extent().add(
        this.edge * 2 + this.rfBorder * 2
    ));
    contents.setCenter(this.center());
    if (this.parent) {
        if (this.parent.fixLayout) {
            this.parent.fixLayout();
        }
    }
};

// RingReporterSlotMorph ///////////////////////////////////////////////////

/*
    I am a ReporterBlock-shaped input slot for use in RingMorphs.
    I can only nest reporter blocks (both round and diamond).

    My command spec is %rr for reporters (round) and %rp for
    predicates (diamond)

    evaluate() returns my nested block or null
    (inherited from ReporterSlotMorph
*/

// ReporterSlotMorph inherits from FunctionSlotMorph:

RingReporterSlotMorph.prototype = new ReporterSlotMorph();
RingReporterSlotMorph.prototype.constructor = RingReporterSlotMorph;
RingReporterSlotMorph.uber = ReporterSlotMorph.prototype;

// ReporterSlotMorph preferences settings:

RingReporterSlotMorph.prototype.rfBorder
    = RingCommandSlotMorph.prototype.rfBorder;

RingReporterSlotMorph.prototype.edge
    = RingCommandSlotMorph.prototype.edge;

// RingReporterSlotMorph instance creation:

function RingReporterSlotMorph(isPredicate) {
    this.init(isPredicate);
}

RingReporterSlotMorph.prototype.init = function (isPredicate) {
    RingReporterSlotMorph.uber.init.call(this, isPredicate, true);
    this.alpha = RingMorph.prototype.alpha;
    this.contrast = RingMorph.prototype.contrast;
    this.isHole = true;
};

// RingReporterSlotMorph accessing:

RingReporterSlotMorph.prototype.getSpec = function () {
    return '%rr';
};

RingReporterSlotMorph.prototype.replaceInput = function (source, target) {
    RingReporterSlotMorph.uber.replaceInput.call(this, source, target);
    if (this.parent instanceof RingMorph) {
        this.parent.vanishForSimilar();
    }
};

// RingReporterSlotMorph drawing:

RingReporterSlotMorph.prototype.drawRounded = function (context) {
    var h = this.height(),
        r = Math.min(this.rounding, h / 2),
        w = this.width(),
        shift = this.edge / 2,
        gradient;

    // draw the 'flat' shape:
    context.fillStyle = this.cachedClr; //this.color.toString();

    // top half:
    context.beginPath();
    context.moveTo(0, h / 2);

    // top left:
    context.arc(
        r,
        r,
        r,
        radians(-180),
        radians(-90),
        false
    );

    // top right:
    context.arc(
        w - r,
        r,
        r,
        radians(-90),
        radians(-0),
        false
    );

    context.lineTo(w, h / 2);
    context.lineTo(w, 0);
    context.lineTo(0, 0);
    context.closePath();
    context.fill();

    // bottom half:
    context.beginPath();
    context.moveTo(w, h / 2);

    // bottom right:
    context.arc(
        w - r,
        h - r,
        r,
        radians(0),
        radians(90),
        false
    );

    // bottom left:
    context.arc(
        r,
        h - r,
        r,
        radians(90),
        radians(180),
        false
    );

    context.lineTo(0, h / 2);
    context.lineTo(0, h);
    context.lineTo(w, h);
    context.closePath();
    context.fill();

    if (MorphicPreferences.isFlat) {return; }

    // add 3D-Effect:
    context.lineWidth = this.edge;
    context.lineJoin = 'round';
    context.lineCap = 'round';

    // bottom left corner
    context.strokeStyle = this.cachedClr; //gradient;
    context.beginPath();
    context.arc(
        r,
        h - r,
        r - shift,
        radians(90),
        radians(180),
        false
    );
    context.stroke();

    // top right corner
    context.strokeStyle = this.cachedClr; //gradient;
    context.beginPath();
    context.arc(
        w - r,
        r,
        r - shift,
        radians(-90),
        radians(0),
        false
    );
    context.stroke();

    // normal gradient edges

    context.shadowOffsetX = shift;
    context.shadowOffsetY = shift;
    context.shadowBlur = this.edge;
    context.shadowColor = this.color.darker(80).toString();

    // top edge: straight line
    gradient = context.createLinearGradient(
        0,
        0,
        0,
        this.edge
    );
    gradient.addColorStop(1, this.cachedClrDark);
    gradient.addColorStop(0, this.cachedClr);
    context.strokeStyle = gradient;
    context.beginPath();
    context.moveTo(r - shift, shift);
    context.lineTo(w - r + shift, shift);
    context.stroke();

    // top edge: left corner
    gradient = context.createRadialGradient(
        r,
        r,
        r - this.edge,
        r,
        r,
        r
    );
    gradient.addColorStop(1, this.cachedClr);
    gradient.addColorStop(0, this.cachedClrDark);
    context.strokeStyle = gradient;
    context.beginPath();
    context.arc(
        r,
        r,
        r - shift,
        radians(180),
        radians(270),
        false
    );
    context.stroke();

    // left edge: straight vertical line
    gradient = context.createLinearGradient(0, 0, this.edge, 0);
    gradient.addColorStop(1, this.cachedClrDark);
    gradient.addColorStop(0, this.cachedClr);
    context.strokeStyle = gradient;
    context.beginPath();
    context.moveTo(shift, r);
    context.lineTo(shift, h - r);
    context.stroke();

    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
    context.shadowBlur = 0;

    // bottom edge: right corner
    gradient = context.createRadialGradient(
        w - r,
        h - r,
        r - this.edge,
        w - r,
        h - r,
        r
    );
    gradient.addColorStop(1, this.cachedClr);
    gradient.addColorStop(0, this.cachedClrBright);
    context.strokeStyle = gradient;
    context.beginPath();
    context.arc(
        w - r,
        h - r,
        r - shift,
        radians(0),
        radians(90),
        false
    );
    context.stroke();

    // bottom edge: straight line
    gradient = context.createLinearGradient(
        0,
        h - this.edge,
        0,
        h
    );
    gradient.addColorStop(1, this.cachedClr);
    gradient.addColorStop(0, this.cachedClrBright);
    context.strokeStyle = gradient;
    context.beginPath();
    context.moveTo(r - shift, h - shift);
    context.lineTo(w - r + shift, h - shift);
    context.stroke();

    // right edge: straight vertical line
    gradient = context.createLinearGradient(w - this.edge, 0, w, 0);
    gradient.addColorStop(1, this.cachedClr);
    gradient.addColorStop(0, this.cachedClrBright);
    context.strokeStyle = gradient;
    context.beginPath();
    context.moveTo(w - shift, r + shift);
    context.lineTo(w - shift, h - r);
    context.stroke();
};

RingReporterSlotMorph.prototype.drawDiamond = function (context) {
    var w = this.width(),
        h = this.height(),
        h2 = Math.floor(h / 2),
        r = Math.min(this.rounding, h2),
        shift = this.edge / 2,
        gradient;

    // draw the 'flat' shape:
    context.fillStyle = this.cachedClr;
    context.beginPath();

    context.moveTo(0, 0);
    context.lineTo(0, h2);
    context.lineTo(r, 0);
    context.lineTo(w - r, 0);
    context.lineTo(w, h2);
    context.lineTo(w, 0);

    context.closePath();
    context.fill();

    context.moveTo(w, h2);
    context.lineTo(w - r, h);
    context.lineTo(r, h);
    context.lineTo(0, h2);
    context.lineTo(0, h);
    context.lineTo(w, h);

    context.closePath();
    context.fill();

    if (MorphicPreferences.isFlat) {return; }

    // add 3D-Effect:
    context.lineWidth = this.edge;
    context.lineJoin = 'round';
    context.lineCap = 'round';

    // half-tone edges
    // bottom left corner
    context.strokeStyle = this.cachedClr;
    context.beginPath();
    context.moveTo(shift, h2);
    context.lineTo(r, h - shift);
    context.stroke();

    // top right corner
    context.strokeStyle = this.cachedClr;
    context.beginPath();
    context.moveTo(w - shift, h2);
    context.lineTo(w - r, shift);
    context.stroke();

    // normal gradient edges
    // top edge: left corner

    context.shadowOffsetX = shift;
    context.shadowOffsetY = shift;
    context.shadowBlur = this.edge;
    context.shadowColor = this.color.darker(80).toString();

    gradient = context.createLinearGradient(
        0,
        0,
        r,
        0
    );
    gradient.addColorStop(1, this.cachedClrDark);
    gradient.addColorStop(0, this.cachedClr);
    context.strokeStyle = gradient;
    context.beginPath();
    context.moveTo(shift, h2);
    context.lineTo(r, shift);
    context.stroke();

    // top edge: straight line
    gradient = context.createLinearGradient(
        0,
        0,
        0,
        this.edge
    );
    gradient.addColorStop(1, this.cachedClrDark);
    gradient.addColorStop(0, this.cachedClr);
    context.strokeStyle = gradient;
    context.beginPath();
    context.moveTo(r, shift);
    context.lineTo(w - r, shift);
    context.stroke();

    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
    context.shadowBlur = 0;

    // bottom edge: right corner
    gradient = context.createLinearGradient(
        w - r,
        0,
        w,
        0
    );
    gradient.addColorStop(1, this.cachedClr);
    gradient.addColorStop(0, this.cachedClrBright);
    context.strokeStyle = gradient;
    context.beginPath();
    context.moveTo(w - r, h - shift);
    context.lineTo(w - shift, h2);
    context.stroke();

    // bottom edge: straight line
    gradient = context.createLinearGradient(
        0,
        h - this.edge,
        0,
        h
    );
    gradient.addColorStop(1, this.cachedClr);
    gradient.addColorStop(0, this.cachedClrBright);
    context.strokeStyle = gradient;
    context.beginPath();
    context.moveTo(r + shift, h - shift);
    context.lineTo(w - r - shift, h - shift);
    context.stroke();
};

// CommentMorph //////////////////////////////////////////////////////////

/*
    I am an editable, multi-line non-scrolling text window. I can be collapsed
    to a single abbreviated line or expanded to full. My width can be adjusted
    by the user, by height is determined by the size of my text body. I can be
    either placed in a scripting area or "stuck" to a block.
*/

// CommentMorph inherits from BoxMorph:

CommentMorph.prototype = new BoxMorph();
CommentMorph.prototype.constructor = CommentMorph;
CommentMorph.uber = BoxMorph.prototype;

// CommentMorph preferences settings (pseudo-inherited from SyntaxElement):

CommentMorph.prototype.refreshScale = function () {
    CommentMorph.prototype.fontSize = SyntaxElementMorph.prototype.fontSize;
    CommentMorph.prototype.padding = 5 * SyntaxElementMorph.prototype.scale;
    CommentMorph.prototype.rounding = 8 * SyntaxElementMorph.prototype.scale;
};

CommentMorph.prototype.refreshScale();

// CommentMorph instance creation:

function CommentMorph(contents) {
    this.init(contents);
}

CommentMorph.prototype.init = function (contents) {
    var myself = this,
        scale = SyntaxElementMorph.prototype.scale;
    this.block = null; // optional anchor block
    this.stickyOffset = null; // not to be persisted
    this.isCollapsed = false;
    this.titleBar = new BoxMorph(
        this.rounding,
        1.000001 * scale, // shadow bug in Chrome,
        new Color(255, 255, 180)
    );
    this.titleBar.color = new Color(255, 255, 180);
    this.titleBar.setHeight(fontHeight(this.fontSize) + this.padding);
    this.title = null;
    this.arrow = new ArrowMorph(
        'down',
        this.fontSize
    );
    this.arrow.noticesTransparentClick = true;
    this.arrow.mouseClickLeft = function () {myself.toggleExpand(); };
    this.contents = new TextMorph(
        contents || localize('add comment here...'),
        this.fontSize
    );
    this.contents.isEditable = true;
    this.contents.enableSelecting();
    this.contents.maxWidth = 90 * scale;
    this.contents.drawNew();
    this.handle = new HandleMorph(
        this.contents,
        80,
        this.fontSize * 2,
        -2,
        -2
    );
    this.handle.setExtent(new Point(11 * scale, 11 * scale));
    this.anchor = null;

    CommentMorph.uber.init.call(
        this,
        this.rounding,
        1.000001 * scale, // shadow bug in Chrome,
        new Color(255, 255, 180)
    );
    this.color = new Color(255, 255, 220);
    this.isDraggable = true;
    this.add(this.titleBar);
    this.add(this.arrow);
    this.add(this.contents);
    this.add(this.handle);

    this.fixLayout();
};

// CommentMorph ops:

CommentMorph.prototype.reactToEdit = function (value) {
    var text = value.text;
    SnapCollaborator.setCommentText(this.id, text);
};

CommentMorph.prototype.fullCopy = function () {
    var cpy = new CommentMorph(this.contents.text);
    cpy.isCollapsed = this.isCollapsed;
    cpy.setTextWidth(this.textWidth());
    return cpy;
};

CommentMorph.prototype.setTextWidth = function (pixels) {
    this.contents.maxWidth = pixels;
    this.contents.drawNew();
    this.fixLayout();
};

CommentMorph.prototype.textWidth = function () {
    return this.contents.maxWidth;
};

CommentMorph.prototype.text = function () {
    return this.contents.text;
};

CommentMorph.prototype.toggleExpand = function () {
    this.isCollapsed = !this.isCollapsed;
    this.fixLayout();
    this.align();
};

// CommentMorph layout:

CommentMorph.prototype.layoutChanged = function () {
    // react to a change of the contents area
    this.fixLayout();
    this.align();
};

CommentMorph.prototype.fixLayout = function () {
    var label,
        tw = this.contents.width() + 2 * this.padding,
        myself = this,
        oldFlag = Morph.prototype.trackChanges;

    Morph.prototype.trackChanges = false;

    if (this.title) {
        this.title.destroy();
        this.title = null;
    }
    if (this.isCollapsed) {
        this.contents.hide();
        this.title = new FrameMorph();
        this.title.alpha = 0;
        this.title.acceptsDrops = false;
        label = new StringMorph(
            this.contents.text,
            this.fontSize,
            null, // style (sans-serif)
            true // bold
        );
        label.rootForGrab = function () {
            return myself;
        };
        this.title.add(label);
        this.title.setHeight(label.height());
        this.title.setWidth(
            tw - this.arrow.width() - this.padding * 2 - this.rounding
        );
        this.add(this.title);
    } else {
        this.contents.show();
    }
    this.titleBar.setWidth(tw);
    this.contents.setLeft(this.titleBar.left() + this.padding);
    this.contents.setTop(this.titleBar.bottom() + this.padding);
    this.arrow.direction = this.isCollapsed ? 'right' : 'down';
    this.arrow.drawNew();
    this.arrow.setCenter(this.titleBar.center());
    this.arrow.setLeft(this.titleBar.left() + this.padding);
    if (this.title) {
        this.title.setPosition(
            this.arrow.topRight().add(new Point(this.padding, 0))
        );
    }
    Morph.prototype.trackChanges = oldFlag;
    this.changed();
    this.silentSetHeight(
        this.titleBar.height()
            + (this.isCollapsed ? 0 :
                    this.padding
                        + this.contents.height()
                        + this.padding)
    );
    this.silentSetWidth(this.titleBar.width());
    this.drawNew();
    this.handle.drawNew();
    this.changed();
};

// CommentMorph menu:

CommentMorph.prototype.userMenu = function () {
    var menu = new MenuMorph(this),
        myself = this;

    menu.addItem(
        "duplicate",
        function () {
            var copy = myself.fullCopy();
            copy.id = null;
            copy.pickUp(myself.world());
        },
        'make a copy\nand pick it up'
    );
    menu.addItem("delete", function() {
        if (this.id) {
            SnapCollaborator.removeBlock(this.id);
        } else {
            this.destroy();
        }
    });
    menu.addItem(
        "comment pic...",
        function () {
            var ide = myself.parentThatIsA(IDE_Morph);
            ide.saveCanvasAs(
                myself.fullImageClassic(),
                ide.projetName || localize('Untitled') + ' ' +
                    localize('comment pic'),
                true // request new window
            );
        },
        'open a new window\nwith a picture of this comment'
    );
    return menu;
};

// CommentMorph hiding and showing:

/*
    override the inherited behavior to recursively hide/show all
    children, so that my instances get restored correctly when
    switching back out of app mode.
*/

CommentMorph.prototype.hide = function () {
    this.isVisible = false;
    this.changed();
};

CommentMorph.prototype.show = function () {
    this.isVisible = true;
    this.changed();
};

// CommentMorph dragging & dropping

CommentMorph.prototype.prepareToBeGrabbed = function () {
    // disassociate from the block I'm posted to
    if (this.block) {
        this.block.comment = null;
        this.block = null;
    }
    if (this.anchor) {
        this.anchor.destroy();
        this.anchor = null;
        // fix shadow, because it was added earlier
        this.removeShadow();
        this.addShadow();
    }
};

CommentMorph.prototype.snapTarget = function (hand) {
    return this.parent.closestBlock(this, hand);
};

CommentMorph.prototype.snap = function (target) {
    // passing the hand is optional (for when blocks are dragged & dropped)
    var scripts = this.parent;

    if (!(scripts instanceof ScriptsMorph)) {
        return null;
    }

    scripts.clearDropHistory();
    scripts.lastDroppedBlock = this;

    if (target !== null) {
        target.comment = this;
        this.block = target;
        if (this.snapSound) {
            this.snapSound.play();
        }
    }
    this.align();
};

// CommentMorph sticking to blocks

CommentMorph.prototype.align = function (topBlock, ignoreLayer) {
    if (this.block) {
        var top = topBlock || this.block.topBlock(),
            affectedBlocks,
            tp,
            bottom,
            rightMost,
            scripts = top.parentThatIsA(ScriptsMorph);
        this.setTop(this.block.top() + this.block.corner);
        tp = this.top();
        bottom = this.bottom();
        affectedBlocks = top.allChildren().filter(function (child) {
            return child instanceof BlockMorph &&
                child.bottom() > tp &&
                child.top() < bottom;
        });
        rightMost = Math.max.apply(
            null,
            affectedBlocks.map(function (block) {return block.right(); })
        );

        this.setLeft(rightMost + 5);
        if (!ignoreLayer && scripts) {
            scripts.addBack(this); // push to back and show
        }

        if (!this.anchor) {
            this.anchor = new Morph();
            this.anchor.color = this.titleBar.color;
        }
        this.anchor.silentSetPosition(new Point(
            this.block.right(),
            this.top() + this.edge
        ));
        this.anchor.bounds.corner = new Point(
            this.left(),
            this.top() + this.edge + 1
        );
        this.anchor.drawNew();
        this.addBack(this.anchor);
        this.anchor.changed();
    }
};

CommentMorph.prototype.startFollowing = function (topBlock, world) {
    this.align(topBlock);
    world.add(this);
    this.addShadow();
    this.stickyOffset = this.position().subtract(this.block.position());
    this.step = function () {
        this.setPosition(this.block.position().add(this.stickyOffset));
    };
};

CommentMorph.prototype.stopFollowing = function () {
    this.removeShadow();
    delete this.step;
};

CommentMorph.prototype.destroy = function () {
    if (this.block) {
        this.block.comment = null;
    }
    CommentMorph.uber.destroy.call(this);
};

CommentMorph.prototype.stackHeight = function () {
    return this.height();
};

// ScriptFocusMorph //////////////////////////////////////////////////////////

/*
    I offer keyboard navigation for syntax elements, blocks and scripts:

    activate:
      - shift + click on a scripting pane's background
      - shift + click on any block
      - shift + enter in the IDE's edit mode

    stop editing:
      - left-click on scripting pane's background
      - esc

    navigate among scripts:
      - tab: next script
      - backtab (shift + tab): last script

    start editing a new script:
      - shift + enter

    navigate among commands within a script:
      - down arrow: next command
      - up arrow: last command

    navigate among all elements within a script:
      - right arrow: next element (block or input)
      - left arrow: last element

    move the currently edited script (stack of blocks):
      - shift + arrow keys (left, right, up, down)

    editing scripts:

      - backspace:
        * delete currently focused reporter
        * delete command above current insertion mark (blinking)
        * collapse currently focused variadic input by one element

      - enter:
        * edit currently focused input slot
        * expand currently focused variadic input by one element

      - space:
        * activate currently focused input slot's pull-down menu, if any
        * show a menu of reachable variables for the focused input or reporter

      - any other key:
        start searching for insertable matching blocks

      - in menus triggered by this feature:
        * navigate with up / down arrow keys
        * trigger selection with enter
        * cancel menu with esc

      - in the search bar triggered b this feature:
        * keep typing / deleting to narrow and update matches
        * navigate among shown matches with up / down arrow keys
        * insert selected match at the focus' position with enter
        * cancel searching and inserting with esc

    running the currently edited script:
        * shift+ctrl+enter simulates clicking the edited script with the mouse
*/

// ScriptFocusMorph inherits from BoxMorph:

ScriptFocusMorph.prototype = new BoxMorph();
ScriptFocusMorph.prototype.constructor = ScriptFocusMorph;
ScriptFocusMorph.uber = BoxMorph.prototype;

// ScriptFocusMorph instance creation:

function ScriptFocusMorph(editor, initialElement, position) {
    this.init(editor, initialElement, position);
}

ScriptFocusMorph.prototype.init = function (
    editor,
    initialElement,
    position
) {
    this.editor = editor; // a ScriptsMorph
    this.element = initialElement;
    this.atEnd = false;
    ScriptFocusMorph.uber.init.call(this);
    if (this.element instanceof ScriptsMorph) {
        this.setPosition(position);
    }
};

// ScriptFocusMorph keyboard focus:

ScriptFocusMorph.prototype.getFocus = function (world) {
    if (!world) {world = this.world(); }
    if (world && world.keyboardReceiver !== this) {
        world.stopEditing();
    }
    world.keyboardReceiver = this;
    this.fixLayout();
};

// ScriptFocusMorph layout:

ScriptFocusMorph.prototype.fixLayout = function () {
    this.changed();
    if (this.element instanceof CommandBlockMorph ||
            this.element instanceof CommandSlotMorph ||
            this.element instanceof ScriptsMorph) {
        this.manifestStatement();
    } else {
        this.manifestExpression();
    }
    this.editor.add(this); // come to front
    this.scrollIntoView();
    this.changed();
};

ScriptFocusMorph.prototype.manifestStatement = function () {
    var newScript = this.element instanceof ScriptsMorph,
        y = this.element.top();
    this.border = 0;
    this.edge = 0;
    this.alpha = 1;
    this.color = this.editor.feedbackColor;
    this.setExtent(new Point(
        newScript ?
                SyntaxElementMorph.prototype.hatWidth : this.element.width(),
        Math.max(
            SyntaxElementMorph.prototype.corner,
            SyntaxElementMorph.prototype.feedbackMinHeight
        )
    ));
    if (this.element instanceof CommandSlotMorph) {
        y += SyntaxElementMorph.prototype.corner;
    } else if (this.atEnd) {
        y = this.element.bottom();
    }
    if (!newScript) {
        this.setPosition(new Point(
            this.element.left(),
            y
        ));
    }
    this.fps = 2;
    this.show();
    this.step = function () {
        this.toggleVisibility();
    };
};

ScriptFocusMorph.prototype.manifestExpression = function () {
    this.edge = SyntaxElementMorph.prototype.rounding;
    this.border = Math.max(
        SyntaxElementMorph.prototype.edge,
        3
    );
    this.color = this.editor.feedbackColor.copy();
    this.color.a = 0.5;
    this.borderColor = this.editor.feedbackColor;

    this.bounds = this.element.fullBounds()
        .expandBy(Math.max(
            SyntaxElementMorph.prototype.edge * 2,
            SyntaxElementMorph.prototype.reporterDropFeedbackPadding
        ));
    this.drawNew();
    delete this.fps;
    delete this.step;
    this.show();
};

// ScriptFocusMorph editing

ScriptFocusMorph.prototype.trigger = function () {
    var current = this.element,
        id = SnapCollaborator.getId(current);

    if (current instanceof MultiArgMorph) {
        if (current.arrows().children[1].isVisible) {
            SnapCollaborator.addListInput(id);
        }
        return;
    }
    if (current.parent instanceof TemplateSlotMorph) {
        // FIXME: Use the collaborator
        current.mouseClickLeft();
        return;
    }
    if (current instanceof BooleanSlotMorph) {
        SnapCollaborator.toggleBoolean(id, current.value);
        return;
    }
    if (current instanceof InputSlotMorph) {
        if (!current.isReadOnly) {
            delete this.fps;
            delete this.step;
            this.hide();
            this.world().onNextStep = function () {
                current.contents().edit();
                current.contents().selectAll();
            };
        } else if (current.choices) {
            current.dropDownMenu(true);
            delete this.fps;
            delete this.step;
            this.hide();
        }
    }
};

ScriptFocusMorph.prototype.menu = function () {
    var current = this.element;
    if (current instanceof InputSlotMorph && current.choices) {
        current.dropDownMenu(true);
        delete this.fps;
        delete this.step;
        this.hide();
    } else {
        this.insertVariableGetter();
    }
};

ScriptFocusMorph.prototype.deleteLastElement = function () {
    var current = this.element,
        id = SnapCollaborator.getId(current);

    if (current.parent instanceof ScriptsMorph) {
        if (this.atEnd || current instanceof ReporterBlockMorph) {
            // TODO: Use the collaborator!
            current.destroy();
            this.element = this.editor;
            this.atEnd = false;
        }
    } else if (current instanceof MultiArgMorph) {
        if (current.arrows().children[0].isVisible) {
            SnapCollaborator.removeListInput(id);
        }
    } else if (current instanceof BooleanSlotMorph) {
        if (!current.isStatic) {
            SnapCollaborator.toggleBoolean(id, false);
        }
    } else if (current instanceof ReporterBlockMorph) {
        if (!current.isTemplate) {
            this.lastElement();
            current.prepareToBeGrabbed();
            // FIXME
            current.destroy();
        }
    } else if (current instanceof CommandBlockMorph) {
        if (this.atEnd) {
            this.element = current.parent;
            // FIXME
            current.userDestroy();
        } else {
            if (current.parent instanceof CommandBlockMorph) {
                // FIXME
                current.parent.userDestroy();
            }
        }
    }
    this.editor.adjustBounds();
    this.fixLayout();
};

ScriptFocusMorph.prototype.insertBlock = function (block) {
    var pb, stage, ide;
    block.isTemplate = false;
    block.isDraggable = true;

    // TODO
    //var scripts = this.parentThatIsA(ScriptsMorph),
        //type = SnapCollaborator.serializeBlock(block);

    //SnapCollaborator.addBlock(type, this.element.owner.id, this.left(), this.top());

    // TODO: This is tricky bc this expects the 'addBlock' to be synchronous...
    if (this.element instanceof ScriptsMorph) {
        this.editor.add(block);
        this.element = block;
        if (block instanceof CommandBlockMorph) {
            block.setLeft(this.left());
            if (block.isStop()) {
                block.setTop(this.top());
            } else {
                block.setBottom(this.top());
                this.atEnd = true;
            }
        } else {
            block.setCenter(this.center());
            block.setLeft(this.left());
        }
    } else if (this.element instanceof CommandBlockMorph) {
        if (this.atEnd) {
            this.element.nextBlock(block);
            this.element = block;
            this.fixLayout();
        } else {
            // to be done: special case if block.isStop()
            pb = this.element.parent;
            if (pb instanceof ScriptsMorph) { // top block
                block.setLeft(this.element.left());
                block.setBottom(this.element.top() + this.element.corner);
                this.editor.add(block);
                block.nextBlock(this.element);
                this.fixLayout();
            } else if (pb instanceof CommandSlotMorph) {
                pb.nestedBlock(block);
            } else if (pb instanceof CommandBlockMorph) {
                pb.nextBlock(block);
            }
        }
    } else if (this.element instanceof CommandSlotMorph) {
        // to be done: special case if block.isStop()
        this.element.nestedBlock(block);
        this.element = block;
        this.atEnd = true;
    } else {
        pb = this.element.parent;
        if (pb instanceof ScriptsMorph) {
            this.editor.add(block);
            block.setPosition(this.element.position());
            this.element.destroy();
        } else {
            pb.replaceInput(this.element, block);
        }
        this.element = block;
    }
    block.fixBlockColor();
    this.editor.adjustBounds();
    // block.scrollIntoView();
    this.fixLayout();

    //// register generic hat blocks
    //if (block.selector === 'receiveCondition') {
        //if (this.editor.owner) {
            //stage = this.editor.owner.parentThatIsA(StageMorph);
            //if (stage) {
                //stage.enableCustomHatBlocks = true;
                //stage.threads.pauseCustomHatBlocks = false;
                //ide = stage.parentThatIsA(IDE_Morph);
                //if (ide) {
                    //ide.controlBar.stopButton.refresh();
                //}
            //}
        //}
    //}
};

ScriptFocusMorph.prototype.insertVariableGetter = function () {
    var types = this.blockTypes(),
        vars,
        myself = this,
        menu = new MenuMorph();
    if (!types || !contains(types, 'reporter')) {
        return;
    }
    vars = InputSlotMorph.prototype.getVarNamesDict.call(this.element);
    Object.keys(vars).forEach(function (vName) {
        var block = SpriteMorph.prototype.variableBlock(vName);
        block.addShadow(new Point(3, 3));
        menu.addItem(
            block,
            function () {
                block.removeShadow();
                myself.insertBlock(block);
            }
        );
    });
    if (menu.items.length > 0) {
        menu.popup(this.world(), this.element.bottomLeft());
        menu.getFocus();
    }
};

ScriptFocusMorph.prototype.stopEditing = function () {
    this.editor.focus = null;
    this.world().keyboardReceiver = null;
    this.destroy();
};

// ScriptFocusMorph navigation

ScriptFocusMorph.prototype.lastElement = function () {
    var items = this.items(),
        idx;
    if (!items.length) {
        this.shiftScript(new Point(-50, 0));
        return;
    }
    if (this.atEnd) {
        this.element = items[items.length - 1];
        this.atEnd = false;
    } else {
        idx = items.indexOf(this.element) - 1;
        if (idx < 0) {idx = items.length - 1; }
        this.element = items[idx];
    }
    if (this.element instanceof CommandSlotMorph &&
            this.element.nestedBlock()) {
        this.lastElement();
    } else if (this.element instanceof HatBlockMorph) {
        if (items.length > 1) {
            this.lastElement();
        } else {
            this.atEnd = true;
        }
    }
    this.fixLayout();
};

ScriptFocusMorph.prototype.nextElement = function () {
    var items = this.items(), idx, nb;
    if (!items.length) {
        this.shiftScript(new Point(50, 0));
        return;
    }
    idx = items.indexOf(this.element) + 1;
    if (idx >= items.length) {
        idx = 0;
    }
    this.atEnd = false;
    this.element = items[idx];
    if (this.element instanceof CommandSlotMorph) {
        nb = this.element.nestedBlock();
        if (nb) {this.element = nb; }
    } else if (this.element instanceof HatBlockMorph) {
        if (items.length === 1) {
            this.atEnd = true;
        } else {
            this.nextElement();
        }
    }
    this.fixLayout();
};

ScriptFocusMorph.prototype.lastCommand = function () {
    var cm = this.element.parentThatIsA(CommandBlockMorph),
        pb;
    if (!cm) {
        if (this.element instanceof ScriptsMorph) {
            this.shiftScript(new Point(0, -50));
        }
        return;
    }
    if (this.element instanceof CommandBlockMorph) {
        if (this.atEnd) {
            this.atEnd = false;
        } else {
            pb = cm.parent.parentThatIsA(CommandBlockMorph);
            if (pb) {
                this.element = pb;
            } else {
                pb = cm.topBlock().bottomBlock();
                if (pb) {
                    this.element = pb;
                    this.atEnd = true;
                }
            }
        }
    } else {
        this.element = cm;
        this.atEnd = false;
    }
    if (this.element instanceof HatBlockMorph && !this.atEnd) {
        this.lastCommand();
    }
    this.fixLayout();
};

ScriptFocusMorph.prototype.nextCommand = function () {
    var cm = this.element,
        tb,
        nb,
        cs;
    if (cm instanceof ScriptsMorph) {
        this.shiftScript(new Point(0, 50));
        return;
    }
    while (!(cm instanceof CommandBlockMorph)) {
        cm = cm.parent;
        if (cm instanceof ScriptsMorph) {
            return;
        }
    }
    if (this.atEnd) {
        cs = cm.parentThatIsA(CommandSlotMorph);
        if (cs) {
            this.element = cs.parentThatIsA(CommandBlockMorph);
            this.atEnd = false;
            this.nextCommand();
        } else {
            tb = cm.topBlock().parentThatIsA(CommandBlockMorph);
            if (tb) {
                this.element = tb;
                this.atEnd = false;
                if (this.element instanceof HatBlockMorph) {
                    this.nextCommand();
                }
            }
        }
    } else {
        nb = cm.nextBlock();
        if (nb) {
            this.element = nb;
        } else {
            this.element = cm;
            this.atEnd = true;
        }
    }
    this.fixLayout();
};

ScriptFocusMorph.prototype.nextScript = function () {
    var scripts = this.sortedScripts(),
        idx;
    if (scripts.length < 1) {return; }
    if (this.element instanceof ScriptsMorph) {
        this.element = scripts[0];
    }
    idx = scripts.indexOf(this.element.topBlock()) + 1;
    if (idx >= scripts.length) {idx = 0; }
    this.element = scripts[idx];
    this.element.scrollIntoView();
    this.atEnd = false;
    if (this.element instanceof HatBlockMorph) {
        return this.nextElement();
    }
    this.fixLayout();
};

ScriptFocusMorph.prototype.lastScript = function () {
    var scripts = this.sortedScripts(),
        idx;
    if (scripts.length < 1) {return; }
    if (this.element instanceof ScriptsMorph) {
        this.element = scripts[0];
    }
    idx = scripts.indexOf(this.element.topBlock()) - 1;
    if (idx < 0) {idx = scripts.length - 1; }
    this.element = scripts[idx];
    this.element.scrollIntoView();
    this.atEnd = false;
    if (this.element instanceof HatBlockMorph) {
        return this.nextElement();
    }
    this.fixLayout();
};

ScriptFocusMorph.prototype.shiftScript = function (deltaPoint) {
    var tb;
    if (this.element instanceof ScriptsMorph) {
        this.moveBy(deltaPoint);
    } else {
        tb = this.element.topBlock();
        if (tb && !(tb instanceof PrototypeHatBlockMorph)) {
            tb.moveBy(deltaPoint);
        }
    }
    this.editor.adjustBounds();
    this.fixLayout();
};

ScriptFocusMorph.prototype.newScript = function () {
    var pos = this.position();
    if (!(this.element instanceof ScriptsMorph)) {
        pos = this.element.topBlock().fullBounds().bottomLeft().add(
            new Point(0, 50)
        );
    }
    this.setPosition(pos);
    this.element = this.editor;
    this.editor.adjustBounds();
    this.fixLayout();
};

ScriptFocusMorph.prototype.runScript = function () {
    if (this.element instanceof ScriptsMorph) {return; }
    this.element.topBlock().mouseClickLeft();
};

ScriptFocusMorph.prototype.items = function () {
    if (this.element instanceof ScriptsMorph) {return []; }
    var script = this.element.topBlock();
    return script.allChildren().filter(function (each) {
        return each instanceof SyntaxElementMorph &&
            !(each instanceof TemplateSlotMorph) &&
            (!each.isStatic ||
                each.choices ||
                each instanceof BooleanSlotMorph ||
                each instanceof RingMorph ||
                each instanceof MultiArgMorph ||
                each instanceof CommandSlotMorph);
    });
};

ScriptFocusMorph.prototype.sortedScripts = function () {
    var scripts = this.editor.children.filter(function (each) {
        return each instanceof BlockMorph;
    });
    scripts.sort(function (a, b) {
        // make sure the prototype hat block always stays on top
        return a instanceof PrototypeHatBlockMorph ? 0 : a.top() - b.top();
    });
    return scripts;
};

// ScriptFocusMorph block types

ScriptFocusMorph.prototype.blockTypes = function () {
    // answer an array of possible block types that fit into
    // the current situation, NULL if no block can be inserted

    if (this.element.isTemplate) {return null; }
    if (this.element instanceof ScriptsMorph) {
        return ['hat', 'command', 'reporter', 'predicate', 'ring'];
    }
    if (this.element instanceof HatBlockMorph ||
            this.element instanceof CommandSlotMorph) {
        return ['command'];
    }
    if (this.element instanceof CommandBlockMorph) {
        if (this.atEnd && this.element.isStop()) {
            return null;
        }
        if (this.element.parent instanceof ScriptsMorph) {
            return ['hat', 'command'];
        }
        return ['command'];
    }
    if (this.element instanceof ReporterBlockMorph) {
        if (this.element.getSlotSpec() === '%n') {
            return ['reporter'];
        }
        return ['reporter', 'predicate', 'ring'];
    }
    if (this.element.getSpec() === '%n') {
        return ['reporter'];
    }
    if (this.element.isStatic) {
        return null;
    }
    return ['reporter', 'predicate', 'ring'];
};


// ScriptFocusMorph keyboard events

ScriptFocusMorph.prototype.processKeyDown = function (event) {
    this.processKeyEvent(
        event,
        this.reactToKeyEvent
    );
};

ScriptFocusMorph.prototype.processKeyUp = function (event) {
    nop(event);
};

ScriptFocusMorph.prototype.processKeyPress = function (event) {
    nop(event);
};


ScriptFocusMorph.prototype.processKeyEvent = function (event, action) {
    var keyName, ctrl, shift;

    //console.log(event.keyCode);
    this.world().hand.destroyTemporaries(); // remove result bubbles, if any
    switch (event.keyCode) {
    case 8:
        keyName = 'backspace';
        break;
    case 9:
        keyName = 'tab';
        break;
    case 13:
        keyName = 'enter';
        break;
    case 16:
    case 17:
    case 18:
        return;
    case 27:
        keyName = 'esc';
        break;
    case 32:
        keyName = 'space';
        break;
    case 37:
        keyName = 'left arrow';
        break;
    case 39:
        keyName = 'right arrow';
        break;
    case 38:
        keyName = 'up arrow';
        break;
    case 40:
        keyName = 'down arrow';
        break;
    default:
        keyName = String.fromCharCode(event.keyCode || event.charCode);
    }
    ctrl = (event.ctrlKey || event.metaKey) ? 'ctrl ' : '';
    shift = event.shiftKey ? 'shift ' : '';
    keyName = ctrl + shift + keyName;
    action.call(this, keyName);
};

ScriptFocusMorph.prototype.reactToKeyEvent = function (key) {
    var evt = key.toLowerCase(),
        shift = 50,
        types,
        vNames;

    // console.log(evt);
    switch (evt) {
    case 'esc':
        return this.stopEditing();
    case 'enter':
        return this.trigger();
    case 'shift enter':
        return this.newScript();
    case 'ctrl shift enter':
        return this.runScript();
    case 'space':
        return this.menu();
    case 'left arrow':
        return this.lastElement();
    case 'shift left arrow':
        return this.shiftScript(new Point(-shift, 0));
    case 'right arrow':
        return this.nextElement();
    case 'shift right arrow':
        return this.shiftScript(new Point(shift, 0));
    case 'up arrow':
        return this.lastCommand();
    case 'shift up arrow':
        return this.shiftScript(new Point(0, -shift));
    case 'down arrow':
        return this.nextCommand();
    case 'shift down arrow':
        return this.shiftScript(new Point(0, shift));
    case 'tab':
        return this.nextScript();
    case 'shift tab':
        return this.lastScript();
    case 'backspace':
        return this.deleteLastElement();
    default:
        types = this.blockTypes();
        if (!(this.element instanceof ScriptsMorph) &&
                types && contains(types, 'reporter')) {
            vNames = Object.keys(this.element.getVarNamesDict());
        }
        if (types) {
            delete this.fps;
            delete this.step;
            this.show();
            this.editor.owner.searchBlocks(
                key,
                types,
                vNames,
                this
            );
        }
    }
};
