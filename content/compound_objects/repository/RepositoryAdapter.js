/**
 * Abstract superclass providing functions for storing, loading compound objects from a repository
 * @class lore.ore.RepositoryAdapter
 * @param {} reposURL
 */
lore.ore.RepositoryAdapter = function (reposURL){
    this.reposURL = reposURL;
}
lore.ore.RepositoryAdapter.prototype = {
    setReposURL : function(reposURL){
        this.reposURL = reposURL;
    },
    getReposURL : function (){
        return this.reposURL;
    },
    /**
     * Gets compound objects that match the parameters and add them to the model
     * @param {String} matchuri The URI to match 
     * @param {String} matchpred The predicate to match
     * @param {String} matchval The value to search for
     * @param {Boolean} isSearchQuery Whether this is a search query (otherwise it is a browse query)
     */
    getCompoundObjects : function(matchuri, matchpred, matchval, isSearchQuery){
        throw "Method not implemented";
    },
    /**
     * Get a compound object from the repository and load it into the editor
     * @param {String} remid The identifier of the compound object to get
     */
    loadCompoundObject : function(remid){
        throw "Method not implemented";
    },
    /**
     * Creates (or replaces) a compound object in the sesame repository
     * @param {String} remid The id of the compound object
     * @param {String} therdf The content of the compound obect as RDF/XML
     */
    saveCompoundObject : function (remid,therdf){
        throw "Method not implemented";
    },
    /**
     * Delete the compound object from the sesame repository
     * calls afterDeleteCompoundObject to remove it from the UI
     * @param {String} remid The URI of the compound object to remove 
     **/
    deleteCompoundObject : function(remid){
        throw "Method not implemented";
    }
}