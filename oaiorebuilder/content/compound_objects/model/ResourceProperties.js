lore.ore.model.ResourceProperties = function (){
    this.data = {};
};
lore.ore.model.ResourceProperties.prototype = {
    /** setProperty Set a property or add if it does not exist
     * @param {Object} config The data for the property
     * @cfg id The URI of the property
       @cfg ns The namespace part of the property URI
       @cfg name The name of the property (usually the term part of the property)
       @cfg value The value of the property
       @cfg prefix The namespace prefix eg dc
       @cfg valueType The datatype of the value
       @param {int} index Optional index of existing property to update
     */
    setProperty: function(config, index){
        var propValArray = this.data[config.id];
        if (!propValArray){
            propValArray = [config];
            this.data[config.id] = propValArray;
        } else {
            if (index && index < propValArray.length){
                // update existing property at index
                propValArray[index] = config;
            } else {
                // add new property
                propValArray.push(config);
            }
        }
    },
    /** Remove a property with a given index (if no index is supplied, 0 is assumed) */
    removeProperty : function(property, index){
      index = index || 0;
      var propValues = this.data[property];
      if (propValues && propValues.length > index){
        propValues.splice(index,1);
        // remove from data if there are no other values for this property
        if (propValues.length == 0) {
            delete propValues;
        }
      }
      return this.data;
    },
    getProperty : function(property, index) {
        index = index || 0;
        var propValues = this.data[property];
        if (propValues && propValues.length > index){
            return propValues[index];
        } else {
            return false;
        }
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
    }
}