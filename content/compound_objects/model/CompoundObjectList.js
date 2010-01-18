
lore.ore.model = lore.ore.model || {};

/** 
 * Represents a list of compound object summaries 
 **/
// TODO: extend Ext.data.ArrayStore?
lore.ore.model.CompoundObjectList = Ext.extend(Ext.util.Observable, {
    constructor: function (config){
       this.name = config.name;
       this.compoundObjects = [];
       this.addEvents('add', 'remove','clear');
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
     * @param {} uri The URI of the compound object to be removed
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
     * @param {lore.ore.model.CompoundObjectSummary []} coSummaries The compound objects to add
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
     * Add a single compound object to the list
     * @param {lore.ore.model.CompoundObjectSummary} coDetail The details of the compound object to be added
     */
   /* addCompoundObject: function(coSummary){
        if (!coSummary instanceof lore.ore.model.CompoundObjectSummary){
            throw "Argument to add must be a lore.ore.model.CompoundObjectSummary";
        }
        this.compoundObjects.push(coSummary);
        this.fireEvent('add',coSummary);
	},*/
    getCompoundObjectsList: function(){
        return this.compoundObjects;
    }
});


/**
 * Stores basic metadata about a compound object for the results listing
 * @param {Object} args The details to store
 */
lore.ore.model.CompoundObjectSummary = Ext.extend(Ext.util.Observable,{
   constructor: function(args){
    /** 
     * Valid properties are: uri, title, creator, created, match, accessed
     *  created and accessed are of type Date 
     **/
        this.props = {'uri': 'about:blank'};
	    if (args instanceof Node){
	        this.parseFromXML(args);
	    } else {
	        for (var p in args){
	            this.props[p] = args[p];
	        }
	    }
        // only fired from setProperties event - not on initial parse
        this.addEvents('propertiesChanged');
	    lore.ore.model.CompoundObjectSummary.superclass.constructor.call(args);
   },
   getUri: function(){
        return this.props.uri;
   },
   getTitle: function(){
        return this.props.title;
   },
   getCreator: function (){
        return this.props.creator;
   },
   getCreated: function (){
        return this.props.created;
   },
   getProperties: function(){
        return this.props;
   },
   setSearchVal: function(searchval){
        this.props.searchval = searchval;
   },
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
 */
lore.ore.model.CompoundObjectListManager = function(){
    this.lists = {
        "search":  new lore.ore.model.CompoundObjectList({'name':'search'}),
        "browse":  new lore.ore.model.CompoundObjectList({'name':'browse'}),
        "history": new lore.ore.model.CompoundObjectList({'name':'history'})
    }
};
lore.ore.model.CompoundObjectListManager.prototype.getList = function(listname){
    return this.lists[listname];
};
/**
 * Add compound objects to the list
 * @param {lore.ore.model.CompoundObjectSummary []} coSummaries Array of compound objects to be added
 * @param {String} listname The list to which to add the compound objects. This is optional, the browse list will be added to by default.
 */
lore.ore.model.CompoundObjectListManager.prototype.add = function(coSummaries, listname){
    if (!listname){
        listname = "browse";
    }
    this.lists[listname].add(coSummaries);
    //lore.debug.ore("added " + coSummaries.length + " summaries to " + listname);
    
};
lore.ore.model.CompoundObjectListManager.prototype.clear = function(listname){
    if (!listname){
        listname = "browse";   
    }
    this.lists[listname].clearList();
}
lore.ore.model.CompoundObjectListManager.prototype.remove = function(uri){
  for (colist in this.lists){
    this.lists[colist].remove(uri);
  }
};
