
/** 
 * Manages the lists of compound objects which are 
 * the results of browse/search queries and stored in history
 * @class lore.ore.model.CompoundObjectListManager
 */
lore.ore.model.CompoundObjectListManager = function(){
    this.lists = {
        "search":  new lore.ore.model.CompoundObjectList({'name':'search'}),
        "browse":  new lore.ore.model.CompoundObjectList({'name':'browse'}),
        "history": new lore.ore.model.CompoundObjectList({'name':'history'})
    }
};
lore.ore.model.CompoundObjectListManager.prototype = {
    /**
     * Get one of the managed lists by name
     * @param {string} listname The name of the list to get
     * @return {lore.ore.model.CompoundObjectList} The list
     */
    getList : function(listname){
        return this.lists[listname];
    },
    /**
     * Add compound objects to a list
     * @param {Array} coSummaries Array of {@link lore.ore.model.CompoundObjectSummary} objects to be added
     * @param {String} listname The list to which to add the compound objects. If not supplied, the compound object will be added to the 'browse' list by default.
     */
    add: function(coSummaries, listname){
        if (!listname){
            listname = "browse";
        }
        this.lists[listname].add(coSummaries);
    },
    /** Clear one of the managed lists
     * 
     * @param {String} listname The name of the list to clear
     */
    clear: function(listname){
        if (!listname){
            listname = "browse";   
        }
        this.lists[listname].clearList();
    },
    /**
     * Remove a compound object from all managed lists
     * @param {String} uri The URI of the compound object to removed
     */
    remove : function(uri){
      for (colist in this.lists){
        this.lists[colist].remove(uri);
      }
    }
}
