lore.ore.model = lore.ore.model || {};
/**
 * @class lore.ore.model.Resource
 * Represents a resource that is aggregated by a compound object
 */
lore.ore.model.Resource = function (args){
    lore.ore.model.AbstractOREResource.call(this,args);
    this.relationships = [];
}
lore.ore.model.Resource.prototype = new lore.ore.model.AbstractOREResource;
lore.ore.model.Resource.constructor = lore.ore.model.Resource;


