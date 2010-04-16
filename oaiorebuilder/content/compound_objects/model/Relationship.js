lore.ore.model = lore.ore.model || {};
/**
 * @class lore.ore.model.Relationship
 * Represents a typed relationship between two resources that are aggregated by a compound object
 */
lore.ore.model.Relationship = function (args){
    if (args){
        this.from = args.from;
        this.to = args.to;
        this.name = args.name;
        this.ns = args.ns;
        this.prefix = args.prefix;
    }
    // TODO: look up prefix or create
};

