class ExtensionRegistry {
    constructor(ide) {
        this.ide = ide;
        this.registry = [];
    }

    register(extension) {
        this.registry.push(new extension(this.ide));
        // TODO: Request permissions? Wrap the IDE?
        // TODO: Add an about section? What if there is no menu?
        this.ide.controlBar.extensionsButton.show();

        // TODO: register new blocks?
    }

    isLoaded(name) {
        return this.registry.find(ext => ext.name === name);
    }
}

var NetsBloxExtensions;
