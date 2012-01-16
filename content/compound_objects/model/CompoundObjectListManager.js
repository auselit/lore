/*
 * Copyright (C) 2008 - 2010 School of Information Technology and Electrical
 * Engineering, University of Queensland (www.itee.uq.edu.au).
 * 
 * This file is part of LORE. LORE was developed as part of the Aus-e-Lit
 * project.
 * 
 * LORE is free software: you can redistribute it and/or modify it under the
 * terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later
 * version.
 * 
 * LORE is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License along with
 * LORE. If not, see <http://www.gnu.org/licenses/>.
 */
Ext.namespace("lore.ore.model");
/** 
 * Manages the lists of Resource Maps which are 
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
            'data': [],
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
                    }, {
                        "name" : "isPrivate"
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
                    }, {
                        "name" : "isPrivate"
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
                    }, {
                        "name" : "isPrivate"
                    }]
       })
	};
};
Ext.apply(lore.ore.model.CompoundObjectListManager.prototype, {
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
     * Add Resource Maps to a list
     * @param {Array} coSummaries Array of objects to be added
     * @param {String} listname The list to which to add the Resource Maps. If not supplied, the Resource Map will be added to the 'browse' list by default.
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
     * Remove a Resource Map from all managed lists
     * @param {String} uri The URI of the Resource Map to removed
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
    /**
     * Update some fields in the Resource Map
     * @param {} uri
     * @param {} fields
     */
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
});
