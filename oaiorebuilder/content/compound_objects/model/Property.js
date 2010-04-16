lore.ore.model = lore.ore.model || {};
/**
 * @class lore.ore.model.Property
 * Model Class representing a (datatype) property of a resource 
 * @param {} aConfig
 */
lore.ore.model.Property = function (aConfig){
    this.id = aConfig.id;
    this.ns = aConfig.ns;
    this.name = aConfig.name;
    this.value = aConfig.value;
    this.prefix = aConfig.prefix; 
    this.valueType = aConfig.valueType;
    // TODO: Look up prefix and type from loaded ontologies if not passed in
    // if prefix is not defined for this ns, create a new one
};

