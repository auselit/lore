
/** 
 * Manages the lists of compound objects which are 
 * the results of browse/search queries and stored in history
 * @class lore.ore.model.CompoundObjectListManager
 */
lore.ore.model.CompoundObjectListManager = function(){
    this.lists = {
        "search" : new Ext.ux.data.PagingJsonStore({
            idProperty : "uri",
            sortInfo: {
              field: "modified",
              direction: "desc"
            },
            storeId: "search",
            data: [],
            lastOptions : {
                params : {
                    start : 0,
                    limit : 5
                }
            },
            fields : [{
                        "name" : "uri"
                    }, {
                        "name" : "title"
                    }, {
                        "name" : "creator"
                    }, {
                        "name" : "modified",
                        "type" : "date"
                    }, {
                        "name" : "accessed",
                        "type" : "date"
                    }, {
                        "name" : "match"
                    }]
       }),
       "browse" : new Ext.ux.data.PagingJsonStore({
        idProperty : "uri",
            sortInfo: {
              field: "modified",
              direction: "desc"
            },
            storeId: "browse",
            data: [],
            lastOptions : {
                params : {
                    start : 0,
                    limit : 5
                }
            },
            fields : [{
                        "name" : "uri"
                    }, {
                        "name" : "title"
                    }, {
                        "name" : "creator"
                    }, {
                        "name" : "modified",
                        "type" : "date"
                    }, {
                        "name" : "accessed",
                        "type" : "date"
                    }, {
                        "name" : "match"
                    }]
       }),
        "history" : new Ext.ux.data.PagingJsonStore({
            idProperty : "uri",
            sortInfo: {
              field: "accessed",
              direction: "desc"
            },
            storeId: "history",
            data: [],
            lastOptions : {
                params : {
                    start : 0,
                    limit : 5
                }
            },
            fields : [{
                        "name" : "uri"
                    }, {
                        "name" : "title"
                    }, {
                        "name" : "creator"
                    }, {
                        "name" : "modified",
                        "type" : "date"
                    }, {
                        "name" : "accessed",
                        "type" : "date"
                    }, {
                        "name" : "match"
                    }]
       })
	}
};
lore.ore.model.CompoundObjectListManager.prototype = {
    /**
	 * Get one of the managed lists by name
	 * 
	 * @param {string}
	 *            listname The name of the list to get
	 * @return {lore.ore.model.CompoundObjectList} The list
	 */
    getList : function(listname){
        return this.lists[listname];
    },
    /**
     * Add compound objects to a list
     * @param {Array} coSummaries Array of objects to be added
     * @param {String} listname The list to which to add the compound objects. If not supplied, the compound object will be added to the 'browse' list by default.
     */
    add: function(coSummaries, listname){
        if (!listname){
            listname = "browse";
        }
        var store = this.lists[listname];
        // reset to first page of results
        store.lastOptions={params:{start: 0,limit:5}};
        if (coSummaries){
            try{
                store.loadData(coSummaries,true);  
            } catch (e){
                lore.debug.ore("Problem adding to store",e);
            }
        }
    },
    /** Clear one of the managed lists
     * 
     * @param {String} listname The name of the list to clear
     */
    clear: function(listname){
        if (!listname){
            listname = "browse";   
        }
        var list = this.lists[listname];
        if (list.clearList){
            list.clearList();
        } else {
            list.removeAll();
        }
    },
    /**
     * Remove a compound object from all managed lists
     * @param {String} uri The URI of the compound object to removed
     */
    remove : function(uri){
        try{
          for (colist in this.lists){
            var list = this.lists[colist];
            var rec = list.getById(uri);
            if (rec){
                list.remove(rec);
            }
          }
        } catch (e){
            lore.debug.ore("Problem removing from store " + uri,e);
        }
    },
    updateCompoundObject : function(uri,fields){
        for (colist in this.lists){
            var list = this.lists[colist];
            var rec = list.getById(uri);
            if (rec){
                for (p in fields){
                    rec.data[p] = fields[p];
                } 
                rec.commit(); 
            }
        }
    }
}
