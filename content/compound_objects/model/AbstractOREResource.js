lore.ore.model = lore.ore.model || {};

/**
 * Abstract model class for a resource with associated properties
 * @class lore.ore.model.AbstractOREResource
 * @param {} aUri The URI used to identify the resource
 */
lore.ore.model.AbstractOREResource = Ext.extend(Ext.util.Observable, {
    constructor: function(config){
        lore.ore.model.AbstractOREResource.superclass.constructor.call(this, config);
        // TODO: change properties so that they are arrays indexed  by prefix:term
	    this.properties = {}; 
	    if (config && config.uri){
	        this.uri = config.uri;
	    }
	    // TODO: init properties from json in args
	    if (config && config.properties){
	        
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
	            'removeProperty',
                'propertyChanged'
	    );
        
    },

    /**
     * Convenience function to get the title of this resource 
     * @return {String} The primary title, or undefined if there is no primary title
     */
    getTitle : function(){
        var t = this.properties["dc:title_0"] || this.properties["dcterms:title_0"];
        if (t) {
            return t.value;
        }
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
	 * Set the value of a property to the resource. 
     * The property will be added if it does not exist
	 * @param {lore.ore.model.Property} aProperty The property to be added
     * @param {String} aPropKey optional key of the property to be updated
	 * @return {} The properties
	 */
	setProperty : function(/*lore.ore.model.Property*/ aProperty, aPropKey){
        if (aPropKey && this.properties[aPropKey]){
            var oldProperty = this.properties[aPropKey];
            this.properties[aPropKey] = aProperty;
            this.fireEvent('propertyChanged',oldProperty, aProperty);
        } else {
		    var propKey = aProperty.prefix + ":" + aProperty.name;
		    var index = 0;
		    // add index to end to allow multiple values for properties
		    while (this.properties[(propKey + "_" + index)]){
		        index++; 
		    }
		    this.properties[(propKey + "_" + index)] = aProperty;
		    this.fireEvent('addProperty',aProperty); 
        }
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
