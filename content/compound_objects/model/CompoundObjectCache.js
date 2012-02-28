Ext.namespace("lore.ore.model");
/**
 * @class lore.ore.model.CompoundObjectCache manages a cache of Resource Maps that have been loaded in LORE
 */
lore.ore.model.CompoundObjectCache = function() {
    this.cache = {};
    this.timestamps = {};
    this.loadedCompoundObject = "";
    this.loadedIsNew = true;
    /** Maximum level of nesting that the cache fetches automatically */
    this.MAX_NESTING = 2;
};
Ext.apply(lore.ore.model.CompoundObjectCache.prototype, {
    /**
     * Add a Resource Map to the cache
     * @param {String} aUri The URI of the Resource Map
     * @param {lore.ore.model.CompoundObject} co The Resource Map model object
     */
    add: function(aUri,co) {
        this.cache[aUri] = co;
        this.timestamps[aUri] = new Date();
    },
    /**
     * Remove a Resource Map from the cache
     * @param {} aURI The URI identifying the Resource Map to be removed
     */
    remove: function(aURI) {
        delete this.cache[aURI];
        delete this.timestamps[aURI];
    },
    /** Empty the entire cache */
    clear: function() {
        delete this.cache;
        this.cache = {};
        delete this.timestamps;
        this.timestamps = {};
    },
    /** Indicate whether the currently loaded CO is newly created
     * @param {} boolean
     */
    setLoadedCompoundObjectIsNew: function(boolean) {
        this.loadedIsNew = boolean;  
    },
    /** Returns true if the loaded Resource Map has been flagged as newly created 
     * @return {boolean}
     */
    getLoadedCompoundObjectIsNew: function(){
        return this.loadedIsNew;
    },
    /** Set the currently loaded URI 
     * @param {} aURI
     */
    setLoadedCompoundObjectUri: function(aURI) {
        this.loadedCompoundObject = aURI;
    },
    /** Get the URI of the currently loaded Resource Map
     * @return {String} 
     */
    getLoadedCompoundObjectUri: function() {
      return this.loadedCompoundObject;  
    },
    /** Get the currently loaded Resource Map
     * @return {lore.ore.model.CompoundObject}
     */
    getLoadedCompoundObject: function() {
        return this.getCompoundObject(this.loadedCompoundObject);
    },
    /** Get the Resource Map that was cached, by URI
     * @param {} aURI
     * @return {}
     */
    getCompoundObject: function(aURI) {
            // TODO: check timestamp and expire if too old
            return this.cache[aURI];
    },
    /** Cache nested Resource Maps 
     * @param {} coContents
     * @param {} nestingLevel
     */
    cacheNested : function(coContents,nestingLevel) {
        var that = this;
        if (nestingLevel < this.MAX_NESTING){
            coContents.where('?a ore:aggregates ?url')
                .where('?url rdf:type <' + lore.constants.RESOURCE_MAP + '>')
                .each(function(){
                    try{
                      var theurl = this.url.value.toString();
                      var nestedCO = that.getCompoundObject(theurl);
                      if (!nestedCO){
                          var callback = function(resp, opt){
                            try{
                                var nestedCO = new lore.ore.model.CompoundObject({uri: opt.url});
                                nestedCO.load({format: 'application/rdf+xml', content: resp.responseXML});
                                that.add(opt.url, nestedCO);
                                that.cacheNested(nestedCO.getInitialContent(), nestingLevel + 1);
                            } catch (ex){
                                lore.debug.ore("Error loading into cache",ex)
                            }
                          };
                          var failcallback = function(resp, opt){
                            lore.debug.ore("Error: failed to load into cache",[resp,opt]);
                          };
                          lore.ore.reposAdapter.loadCompoundObject(theurl, callback, failcallback);   
                      }
                    } catch (e) {
                        lore.debug.ore("Error loading nested CO into cache",e);
                    }
                }
            );
        }
    }
});
