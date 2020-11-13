/*globals SpriteMorph*/
class ExtensionRegistry {
    constructor(ide) {
        this.ide = ide;
        this.registry = [];
    }

    register(Extension) {
        const extension = new Extension(this.ide);
        this.registry.push(extension);
        // TODO: Request permissions? Wrap the IDE?
        // TODO: Add an about section? What if there is no menu?
        this.ide.controlBar.extensionsButton.show();

        extension.getCategories().forEach(category => {
            const [name, color] = category;
            SpriteMorph.prototype.categories.push(name);
            SpriteMorph.prototype.blockColor[name] = color;
        });

        extension.getBlocks()
            .forEach(block => this.ide.registerBlock(block));

        this.ide.createCategories();
        this.ide.createCorralBar();
        this.ide.fixLayout();
    }

    isLoaded(name) {
        return this.registry.find(ext => ext.name === name);
    }
}

var NetsBloxExtensions;
