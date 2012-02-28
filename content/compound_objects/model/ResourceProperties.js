Ext.namespace("lore.ore.model");
/**
 * @class lore.ore.model.ResourceProperties Manage multi-valued properties for Resources
 */
lore.ore.model.ResourceProperties = Ext.extend(Ext.util.Observable, {
	constructor: function(){
		this.data = {};
		this.addEvents('propertyChanged');
        this.addEvents('propertyRemoved');
	},
    /** setProperty Set a property or add if it does not exist
     * @param {Object} config The data for the property
     * @cfg id The URI of the property
       @cfg ns The namespace part of the property URI
       @cfg name The name of the property (usually the term part of the property)
       @cfg value The value of the property
       @cfg prefix The namespace prefix eg dc
       @cfg type The datatype of the value
       @param {int} index Optional index of existing property to update
     */
    setProperty: function(config, index){
        try{ 
            var propValArray = this.data[config.id];
            var retIndex = 0;
            if (!propValArray){
                propValArray = [config];
                this.data[config.id] = propValArray;
            } else {
                if (typeof index !== "undefined" && index < propValArray.length){
                    // update existing property at index
                    propValArray[index] = config;
                    retIndex = index;
                } else {
                    // add new property
                    propValArray.push(config);
                    retIndex = propValArray.length - 1;
                }
            }
            this.fireEvent('propertyChanged', config, retIndex);
        } catch (ex){
            lore.debug.ore("setProperty",ex);
        }
    },
    /** Remove a property with a given index (if no index is supplied, 0 is assumed)
     * 
     * @param {String} property URI of property to remove
     * @param {int} index Index to remove, defaults to 0
     * @return {}
     */
    removeProperty : function(property, index){
      index = index || 0;
      if (index < 0){ // invalid index: do nothing
        return this.data;
      }
      var propValues = this.data[property];
      if (propValues){
          var theProp = propValues[index];
          if (propValues && propValues.length > index){
            propValues.splice(index,1);
            // remove from data if there are no other values for this property
            if (propValues.length == 0) {
                delete this.data[property];
            }
            this.fireEvent('propertyRemoved', theProp, index);
          }
      }
      return this.data;
      
    },
    /** Get property with given index 
     * @param {String} property URI of the property
     * @param {int} index Index of the property (defaults to 0
     * @return {Object}
     */
    getProperty : function(property, index) {
        index = index || 0;
        var propValues = this.data[property];
        if (index < 0){ // return all values of this property for negative index
            return propValues;
        }
        if (propValues && propValues.length > index){
            return propValues[index];
        } else {
            return false;
        }
    },
    /** Get index of property with particular value
     * 
     */
    findProperty : function(property,value){
    	var propValues = this.data[property];  	
    	if (propValues && propValues.length > 0){
    		for (var i = 0; i < propValues.length; i++){
    			if (propValues[i].value == value){
    				return i;
    			}
    		}
    	}
    	return -1;
    },
     /**
     * Convenience function to get the title of this resource 
     * @return {String} The primary title, or undefined if there is no primary title
     */
    getTitle : function(){
        var t = this.data[lore.constants.NAMESPACES["dc"] + "title"] || this.data[lore.constants.NAMESPACES["dcterms"] + "title"];
        if (t && t.length > 0) {
            return t[0].value;
        }
    },
    /** 
     * returns the properties as a sorted array (sorted alphabetically by name)
     * @param {Object} skipProps optional properties to not include in list (properties are uris of properties to skip with value = true)
     */
    getSortedArray: function (skipProps){
    	skipProps = skipProps || {};
    	var keys = [];
	 	for (var p in this.data) {
	 		if (!(p in skipProps)){
	 			keys.push(this.data[p]);
	 		}
	 	}
	 	keys.sort(function(a,b){
	 		var aname = a[0].name.toLowerCase();
	 		var bname = b[0].name.toLowerCase();
	 		if (aname < bname) return -1;
	 		if (aname > bname) return 1;
	 		return 0;
	 	});
	 	return keys;
    }
});