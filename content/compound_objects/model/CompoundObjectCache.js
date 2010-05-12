lore.ore.model.CompoundObjectCache = function() {
    this.cache = {};
    this.timestamps = {};
    this.loadedCompoundObject = "";
}
lore.ore.model.CompoundObjectCache.prototype = {
    add: function(aUri,co) {
        this.cache[aUri] = co;
        this.timestamps[aUri] = new Date();
    },
    remove: function(aURI) {
        delete this.cache[aURI];
        delete this.timestamps[aURI];
    },
    clear: function() {
        delete this.cache;
        this.cache = {};
        delete this.timestamps;
        this.timestamps = {};
    },
    setLoadedCompoundObjectUri: function(aURI) {
        this.loadedCompoundObject = aURI;
    },
    getLoadedCompoundObjectUri: function() {
      return this.loadedCompoundObject;  
    },
    getLoadedCompoundObject: function() {
        return this.getCompoundObject(this.loadedCompoundObject);
    },
    getCompoundObject: function(aURI) {
            // TODO: check timestamp and expire if too old
            return this.cache[aURI];
    }
}
