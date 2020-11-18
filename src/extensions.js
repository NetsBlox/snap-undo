/*globals SpriteMorph*/
class ExtensionRegistry {
    constructor(ide) {
        this.ide = ide;
        this.registry = [];
    }

    register(Extension) {
        const extension = new Extension(this.ide);
        try {
            this.validate(extension);
        } catch (err) {
            this.ide.showMessage(`Unable to load extension "${extension.name}": ${err.message}`);
            return;
        }

        this.registry.push(extension);
        // TODO: Request permissions? Wrap the IDE?
        // TODO: Add an about section? What if there is no menu?
        this.ide.controlBar.extensionsButton.show();

        extension.getCategories()
            .forEach(category => this.registerCategory(category));

        this.ide.createCategories();
        this.ide.createCorralBar();
        this.ide.fixLayout();
        SpriteMorph.prototype.initBlocks();
    }

    validate(extension) {
        extension.getBlocks().forEach(block => {
            if (SpriteMorph.prototype[block.name]) {
                throw new Error(`Cannot override existing "${block.name}" block`);
            }
        });
    }

    isLoaded(name) {
        return this.registry.find(ext => ext.name === name);
    }

    registerCategory(category) {
        const {name, color} = category;
        SpriteMorph.prototype.categories.splice(
            SpriteMorph.prototype.categories.length-3,
            0,
            name
        );
        SpriteMorph.prototype.blockColor[name] = color;
    }

    getBlockTemplates(categoryName) {
        const categories = this.registry.flatMap(ext => ext.getCategories());
        const category = categories.find(cat => cat.name === categoryName);
        if (category) {
            return category.blocks;
        }
        return [];
    }

    initBlocks() {
        const allBlocks = this.registry.flatMap(ext => ext.getBlocks());
        allBlocks.forEach(block => {
            SpriteMorph.prototype.blocks[block.name] = {
                type: block.type,
                category: block.category,
                spec: block.spec
            };
            Process.prototype[block.name] = block.impl;
        });
    }
}

var NetsBloxExtensions;
