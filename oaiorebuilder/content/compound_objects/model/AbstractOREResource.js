lore.ore.model = lore.ore.model || {};

/**
 * Abstract model class for a resource with associated properties
 * @class lore.ore.model.AbstractOREResource
 * @param {} aUri The URI used to identify the resource
 */
lore.ore.model.AbstractOREResource = Ext.extend(Ext.util.Observable, {
    constructor: function(config){
	    this.properties = {}; 
	    if (args.uri){
	        this.uri = args.uri;
	    }
	    // TODO: init properties from json in args
	    if (args.properties){
	        
	    }
	    this.addEvents(
	           /** @event addProperty
	            * Fires when a property is added for this resource
	            * @param {Array} Property Array of {@link lore.ore.model.Property} objects that were added
	            */
	            'addProperty', 
	            /** @event remove
	             * Fires when a Property is removed from this resource
	             * @param {Array} propKey 
	             */
	            'removeProperty'
	    );
        lore.ore.model.AbstractOREResource.superclass.constructor.call(config);
    },

	/**
	 * Retreive a property using the key
	 * @param {String} aPropKey  A combination of namespace prefix, property name and property index that identifies the property eg dc:creator_0
	 * @return {lore.ore.model.Property} The property
	 */
	getProperty : function(/*String*/aPropKey) {
	    return this.properties[aPropKey];
	},
	/**
	 * Add a property to the resource
	 * @param {lore.ore.model.Property} aProperty The property to be added
	 * @return {} The properties
	 */
	addProperty : function(/*lore.ore.model.Property*/ aProperty){
	    var propKey = aProperty.nsPrefix + ":" + aProperty.name;
	    var index = 0;
	    // add index to end to allow multiple values for properties
	    while (this.properties[(propKey + "_" + index)]){
	        index++; 
	    }
	    this.properties[(propKey + "_" + index)] = aProperty;
	    this.fireEvent('addProperty',aProperty); 
	    return this.properties;
	},
	/**
	 * Remove a property from the resource
	 * @param {} aPropKey
	 * @return {} The properties
	 */    
	removeProperty : function(/*String*/aPropKey){
	  delete this.properties[aPropKey];
	  this.fireEvent('removeProperty',aProperty);
	  return this.properties;
	}
});
