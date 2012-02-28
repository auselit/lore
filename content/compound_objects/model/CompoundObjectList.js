Ext.namespace("lore.ore.model");
/** 
 * @class lore.ore.model.CompoundObjectList Represents a list of Resource Map summaries 
 * @extends Ext.ux.data.PagingJsonStore
 **/
lore.ore.model.CompoundObjectList = Ext.extend(Ext.ux.data.PagingJsonStore, {
    /** @constructor */
    constructor: function (config){
        this.config = config;
        Ext.apply(this.config, {
            "idProperty" : "uri",
            "sortField" : "title",
            'data': [],
            lastOptions : {
                params : {
                    start : 0,
                    limit : 5
                }
            },
            "fields" : [{
                        "name" : "uri"
                    }, {
                        "name" : "title"
                    }, {
                        "name" : "creator"
                    }, {
                        "name" : "modified",
                        "type" : "date"
                    }, {
                        "name" : "accessed",
                        "type" : "date"
                    }, {
                        "name" : "match"
                    }, {
                        "name" : "isPrivate"
                    }]
       });
       lore.ore.model.CompoundObjectList.superclass.constructor.call(this,this.config);
    }
});
