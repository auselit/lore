/*
 * Copyright (C) 2008 - 2009 School of Information Technology and Electrical
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
lore.ore.model = lore.ore.model || {};
/** 
 * Represents a list of compound object summaries 
 * @class lore.ore.model.CompoundObjectList
 **/
// TODO: extend Ext.data.ArrayStore?
lore.ore.model.CompoundObjectList = Ext.extend(Ext.util.Observable, {
    /** @constructor */
    constructor: function (config){
        /** 
         * The name of this list
         * @property
         * @type string
         */
       this.name = config.name;
       this.compoundObjects = [];
       this.addEvents(
	       /** @event add
	        * Fires when compound objects are added to this list
	        * @param {Array} coSummaries Array of {@link lore.ore.model.CompoundObjectSummary} objects that were added
	        */
            'add', 
            /** @event remove
             * Fires when a compound object is removed from this list
             * @param {String} uri The URI of the removed compound object
             */
            'remove',
            /** @event clear
             * Fires when this list is cleared (all compound objects removed)
             */
            'clear');
       lore.ore.model.CompoundObjectList.superclass.constructor.call(config);
    },
    /**
     * Clear all compound objects from the list
     */
    clearList: function() {
        this.compoundObjects = [];
        this.fireEvent('clear');
    },
    /** 
     * Remove a single compound object from the list
     * @param {string} uri The URI of the compound object to be removed
     */
    remove: function(uri){
        for (var i = 0; i < this.compoundObjects.length; i++){
            var co = this.compoundObjects[i];
            if (co.getUri() == uri){
                this.compoundObjects = this.compoundObjects.splice(i,1);
                break;
            }
        }
        this.fireEvent('remove',uri);
    },
    /** Add a batch of compound objects to the list
     * @param {Array} coSummaries An Array of {@link lore.ore.graph.CompoundObjectSummary} objects
     */
    add: function(coSummaries){
        if (this.compoundObjects.length == 0){
            this.compoundObjects = coSummaries;
        }
        else {
           this.compoundObjects = this.compoundObjects.concat(coSummaries);
        }
        this.fireEvent('add',coSummaries); 
    },
    /**
     * Get the contents of the list
     * @return {Array} An Array of {@link lore.ore.model.CompoundObjectSummary} objects 
     */
    getCompoundObjectsList: function(){
        return this.compoundObjects;
    }
});


/**
 * Stores basic metadata about a compound object for the results listing
 * Represents a compound object summary from a search, browse or history query
 * @class lore.ore.model.CompoundObjectSummary
 * @param {Object} args The details to store
 */
lore.ore.model.CompoundObjectSummary = Ext.extend(Ext.util.Observable,{
   constructor: function(args){
    /** @cfg {string} uri The identifier of the compound object */
    /** @cfg {string} title The (Dublin Core) title of the compound object */
    /** @cfg {string} creator The (Dublin Core) creator of the compound object */
    /** @cfg {Date} created The date on which the compound object was created (from dc:created) */
    /** @cfg {string} match The value of the subject, predicate or object from the triple that matched the search */
    /** @cfg {Date} acessed The date this compound object was last accessed (from the browser history) */
        this.props = {'uri': 'about:blank'};
	    if (args instanceof Node){
	        this.parseFromXML(args);
	    } else {
	        for (var p in args){
	            this.props[p] = args[p];
	        }
	    }
        // only fired from setProperties event - not on initial parse
        /** @event propertiesChanged
         * Fired when any of the properties change
         * @param {Object} oldProps 
         * @param {Object} newProps
         */
        this.addEvents('propertiesChanged');
	    lore.ore.model.CompoundObjectSummary.superclass.constructor.call(args);
   },
   /** Get the URI of the compound object
    * @return {String} uri
    */
   getUri: function(){
        return this.props.uri;
   },
   /** Get the title of the compound object
    * 
    * @return {String} title
    */
   getTitle: function(){
        return this.props.title;
   },
   getCreator: function (){
        return this.props.creator;
   },
   getCreated: function (){
        return this.props.created;
   },
   /** Get all properties of the compound object
    * @return {Object} Object with properties set to compound object properties
    */
   getProperties: function(){
        return this.props;
   },
   /** Add a search value property to this Compound Object summary 
    * @param {String} searchval The search value to add
    */
   setSearchVal: function(searchval){
        this.props.searchval = searchval;
   },
   /** Replace the properties
    * @param {Object} args The new property values
    */
   setProperties: function(args){
        var oldVals = this.props;
        this.props = {"uri":oldVals.uri};
        for (var p in args){
            this.props[p] = args[p];
        }
        this.fireEvent("propertiesChanged",oldVals,this.props);
   },
   /**
    * Parses compound object details from a SPARQL XML result
    * @param {XMLNode} result
    */
   parseFromXML: function(/*Node*/result){
	    var bindings, node, attr, nodeVal;
	    this.props.title = "Untitled";
	    this.props.creator = "Anonymous";
	    try {  
	       bindings = result.getElementsByTagName('binding');
	       for (var j = 0; j < bindings.length; j++){  
	        attr = bindings[j].getAttributeNode('name');
	        if (attr.nodeValue =='g'){ //graph uri
	            node = bindings[j].getElementsByTagName('uri'); 
	            this.props.uri = lore.global.util.safeGetFirstChildValue(node);
	        } else if (attr.nodeValue == 'v'){
	            node = bindings[j].getElementsByTagName('literal');
	            nodeVal = lore.global.util.safeGetFirstChildValue(node);
	            if (!nodeVal){
	                node = bindings[j].getElementsByTagName('uri');
	            }
	            this.props.match = lore.global.util.safeGetFirstChildValue(node);
	        } else {
	            node = bindings[j].getElementsByTagName('literal');
	            nodeVal = lore.global.util.safeGetFirstChildValue(node);
	            if (attr.nodeValue == 't' && nodeVal){ //title
	                this.props.title = nodeVal;
	            } else if (attr.nodeValue == 'a' && nodeVal){// dc:creator
	                this.props.creator = nodeVal;
	            } else if (attr.nodeValue == 'c' && nodeVal){ // dcterms:created
	                this.props.created = nodeVal;
	            } 
	        }
	       }
	    } catch (ex) {
	        lore.debug.ore("Unable to process compound object result list", ex);
	    }
	}
   
});


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
