lore.ore.model = lore.ore.model || {};
/**
 * @class lore.ore.model.Resource
 * Represents a resource that is aggregated by a compound object
 */
lore.ore.model.Resource = function (args){
    lore.ore.model.AbstractOREResource.call(this,args);
    this.representsCO = false; // indicates if this represents a nested compound object
    this.representsAnno = false; // indicates if this represents an annotation
    this.container;
}
lore.ore.model.Resource.prototype = new lore.ore.model.AbstractOREResource;
lore.ore.model.Resource.constructor = lore.ore.model.Resource;


