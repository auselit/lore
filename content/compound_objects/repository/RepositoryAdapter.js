/**
 * Abstract superclass providing functions for storing, loading Resource Maps from a repository
 * @class lore.ore.repos.RepositoryAdapter
 * @param {} reposURL
 */
lore.ore.repos.RepositoryAdapter = function (baseURL){
    this.reposBase = baseURL;
    // preload explore stylesheet
    var xhr = new XMLHttpRequest();                
    xhr.overrideMimeType('text/xml');
    var oThis = this;
    xhr.open("GET", '../../content/compound_objects/stylesheets/sparqlexplore.xsl');
    xhr.onreadystatechange= function(){
        if (xhr.readyState == 4) {
            oThis.exploreStylesheet = xhr.responseXML;
        }
    };
    xhr.send(null);
};
Ext.apply(lore.ore.repos.RepositoryAdapter.prototype, {
    /**
     * Set the access URL of the repository
     * @param {} reposURL
     */
    setReposURL : function(reposURL){
        this.reposURL = reposURL;
    },
    /**
     * Returns the access URL of the repository
     * @return {}
     */
    getReposURL : function (){
        return this.reposURL;
    },
    /**
     * Gets Resource Maps that match the parameters and add them to the model
     * @param {String} matchuri The URI to match 
     * @param {String} matchpred The predicate to match
     * @param {String} matchval The value to search for
     * @param {Boolean} isSearchQuery Whether this is a search query (otherwise it is a browse query)
     */
    getCompoundObjects : function(matchuri, matchpred, matchval, isSearchQuery){
        throw "Method not implemented";
    },
    /**
     * Get a Resource Map from the repository and load it into the editor
     * @param {String} remid The identifier of the Resource Map to get
     */
    loadCompoundObject : function(remid, callback, failcallback){
        throw "Method not implemented";
    },
    /**
     * Creates (or replaces) a Resource Map in the repository
     * @param {CompoundObject} theco The Resource Map model
     */
    saveCompoundObject : function (theco){
        throw "Method not implemented";
    },
    /**
     * Delete the Resource Map from the repository
     * calls afterDeleteCompoundObject to remove it from the UI
     * @param {String} remid The URI of the Resource Map to remove 
     **/
    deleteCompoundObject : function(remid){
        throw "Method not implemented";
    },
    /**
     * Generate a URI for a Resource Map to be stored in this repository
     * @return {}
     */
    generateID: function(){
        // dummy value : lorestore manages actual id creation
        return this.idPrefix + lore.draw2d.UUID.create();
    },
    generatePlaceholderID: function(){
      return this.reposBase + "/ids/" + lore.draw2d.UUID.create(); 
    },
    /** Create JSON with related resources for explore view */
    getExploreData : function(uri,title,isCompoundObject, callback) {
        throw "Method not implemented";
    }
});