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