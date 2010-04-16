lore.ore.model = lore.ore.model || {};

/** @class lore.ore.model.CompoundObject
 * Model class representing a compound object */
lore.ore.model.CompoundObject = Ext.extend(lore.ore.model.AbstractOREResource, {
    constructor: function(config){
	    lore.ore.model.AbstractOREResource.call(this, args);
	    /** An array of objects representing the aggregated resources - it is stored as an array to allow ordering of resources in presentation formats */
	    this.aggregatedResources = []; 
        this.addEvents(
                'addAggregatedResource', 
                'removeAggregatedResource'
        );
	},
	getAggregatedResource : function(/*String*/ aUri){
	  // iterate over resources and return the one with the same uri 
	},
	
	/** Add a resource to the compound object
	 * @param {lore.ore.model.Resource} aResource The resource to add
	 * @return {Array} The aggregated resources
	 */
	addAggregatedResource : function(/*lore.ore.model.Resource*/ aResource){
	  this.aggregatedResources.push(aResource); 
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
	
	/**
	 * TODO:  dump/serialize to a variety of formats eg JSON, RDF/XML, rdfquery triples
	 * @param {} aConfig Options for serialization
	 * @return {Object} 
	 */
	dump : function (args){
	    
	    return "";
	}
});