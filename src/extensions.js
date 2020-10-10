class ExtensionRegistry {
    constructor(ide) {
        this.ide = ide;
        this.registry = [];
    }

    register(extension) {
        this.registry.push(new extension(this.ide));
        // TODO: Request permissions? Wrap the IDE?
        // TODO: Add an entry to the menu
        this.ide.controlBar.extensionsButton.show();
    }

    isLoaded(name) {
        return this.registry.find(ext => ext.name === name);
    }
}

var NetsBloxExtensions;
