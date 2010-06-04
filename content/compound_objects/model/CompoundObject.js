lore.ore.model = lore.ore.model || {};

/** @class lore.ore.model.CompoundObject
 * Model class representing a compound object */
lore.ore.model.CompoundObject = Ext.extend(lore.ore.model.AbstractOREResource, {
    constructor: function(config){
	    lore.ore.model.CompoundObject.superclass.constructor.call(this, config);
	    /** An array of objects representing the aggregated resources - it is stored as an array to allow ordering of resources in presentation formats */
	    this.aggregatedResources = []; 
        this.addEvents(
                'addAggregatedResource', 
                'removeAggregatedResource',
                'loaded'
        );
        this.loadedContent = {};
        this.aggregationURI = "#aggregation";
	},
    getInitialContent : function(){
        return this.loadedContent;  
    },
	getAggregatedResource : function(/*String*/ aUri){
	  // iterate over resources and return the one with the same uri 
        for (var i = 0; i < this.aggregatedResources.length; i++){
            var r = this.aggregatedResources[i];
            if (r.uri == aUri){
                return r;
            }
        }
	},
	
	/** Add a resource to the compound object
	 * @param {lore.ore.model.Resource} aResource The resource to add
	 * @return {Array} The aggregated resources
	 */
	addAggregatedResource : function(/*lore.ore.model.Resource*/ aResource){
	  this.aggregatedResources.push(aResource); 
      aResource.container = this;
      this.fireEvent('addAggregatedResource',aResource);
	  return this.aggregatedResources;
	},
	
	/** Remove a resource from the compound object
	 * @param {lore.ore.model.Resource} aResource The resource to remove
	 * @return {Array} The aggregated resources
	 */
	removeAggregatedResource : function (/*lore.ore.model.Resource */ aResource){
	  this.aggregatedResources.splice(this.aggregatedResources.indexOf(aResource),1); 
      this.fireEvent('removeAggregatedResource',aResource);
	  return this.aggregatedResources;
	},
	
	toString : function(){
	    return "Compound Object " + this.uri + " contains " + this.aggregatedResources.length + " resources";    
	},
    /** Load from a variety of formats eg JSON, RDF/XML etc
     * 
     * @param {} args
     * format eg applicaiton/rdf+xml
     * content eg XML object
     */
    load : function (args) {
        var oThis = this;
        this.suspendEvents();
        // Load from RDF/XML
        if (args.format == 'application/rdf+xml'){
            var databank = jQuery.rdf.databank();
	        for (ns in lore.constants.NAMESPACES){
	            databank.prefix(ns,lore.constants.NAMESPACES[ns]);
	        }
	        databank.load(args.content);
            this.loadedContent = jQuery.rdf({databank: databank});
        } else if (args.format == 'rdfquery'){
            this.loadedContent = args.content;
        }
        if (this.loadedContent){
            var remQuery = this.loadedContent.where('?aggre rdf:type ore:Aggregation')
                .where('?rem ore:describes ?aggre');

            var res = remQuery.get(0);
	        if (res){
	           this.uri = res.rem.value.toString();
	           this.aggregationURI = res.aggre.value.toString();
	        }  else {
	            lore.ore.ui.loreWarning("No compound object found");
	            lore.debug.ore("no remurl found in RDF",[args.content, this.loadedContent]);
                // TODO: throw some kind of error
	        }
            
            // Load properties for this Compound Object
            this.loadedContent.about('<' + this.uri + '>')
            .each(function(){
                var propurl = this.property.value.toString();
                var propsplit = lore.global.util.splitTerm(propurl);  
                var theProp = new lore.ore.model.Property({
                   ns: propsplit.ns,
                   name: propsplit.term,
                   value: this.value.value,
                   prefix: lore.ore.nsprefix(propsplit.ns)
                   //valueType: this.value.datatype.toString()
                });
                oThis.setProperty(theProp);
            });
            
            
        // create a Resource object for each aggregated resource
        this.loadedContent.where('<' + this.aggregationURI  + '> ore:aggregates ?url')
            .optional('?url rdf:type ?rdftype')
            .each(function() {
	             var resourceURL = this.url.value.toString();
	             var theResource = new lore.ore.model.Resource({uri:resourceURL});
	             if (this.rdftype && this.rdftype.value.toString() == lore.constants.RESOURCE_MAP){
	                // TODO: check if it has been cached or load?
                    theResource.representsCO = true;
	             }  else if(this.rdftype && (this.rdftype.value.toString().match('http://www.w3.org/2000/10/annotation') || this.rdftype.value.toString().match('http://www.w3.org/2001/12/replyType'))){
                    theResource.representsAnno = true;
                 }
	             // TODO: Load aggregated resource predicates
	             oThis.loadedContent.about('<' + resourceURL + '>')
                    .each(function() {
                        var propurl = this.property.value.toString();
                        var propsplit = lore.global.util.splitTerm(propurl);  
                        var theProp = new lore.ore.model.Property({
		                   ns: propsplit.ns,
		                   name: propsplit.term,
		                   value: this.value.value,
		                   prefix: lore.ore.nsprefix(propsplit.ns)
		                });
                        theResource.setProperty(theProp);
                    }
                 );   
	             oThis.addAggregatedResource(theResource);
            }
        );    
        }
        this.resumeEvents();
        this.fireEvent('loaded', this);
    },
	/**
	 * TODO:  dump/serialize to a variety of formats eg JSON, RDF/XML, rdfquery triples
	 * @param {Object} args Options for serialization
	 * @return {Object} Serialization
	 */
	dump : function (args){
	    return "";
	},
    /** 
     * Compare with another compound object model object to determine whether they have the same properties, 
     * aggregated resources, resource properties and relationships
     * 
     * @param {lore.ore.model.CompoundObject} co
     * @return True if they have identical contents
     */
    sameAs : function (co) {
        var isEqual = function(o1,o2){
            
        };
        if (!(co instanceof lore.ore.model.CompoundObject)){
            return false;
        }
            
        if (isEqual(this, co) !== true){
            return false;
        }
        if (isEqual(co, this) !== true){
            return false;
        }
            
        return true;
    }
});