/*
 * Copyright (C) 2008 - 2010 School of Information Technology and Electrical
 * Engineering, University of Queensland (www.itee.uq.edu.au).
 * 
 * This file is part of LORE. LORE was developed as part of the Aus-e-Lit
 * project.
 * 
 * LORE is free software: you can redistribute it and/or modify it under the
 * terms of the GNU General Public License as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option) any later
 * version.
 * 
 * LORE is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License along with
 * LORE. If not, see <http://www.gnu.org/licenses/>.
 */
lore.ore.model = lore.ore.model || {};
/** 
 * Represents a list of compound object summaries 
 * @class lore.ore.model.CompoundObjectList
 * @extends Ext.ux.data.PagingJsonStore
 **/
lore.ore.model.CompoundObjectList = Ext.extend(Ext.ux.data.PagingJsonStore, {
    /** @constructor */
    constructor: function (config){
        this.config = config;
        Ext.apply(this.config, {
            "idProperty" : "uri",
            "sortField" : "title",
            data: [],
            lastOptions : {
                params : {
                    start : 0,
                    limit : 30
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
                    }]
       });
       lore.ore.model.CompoundObjectList.superclass.constructor.call(this,this.config);
       lore.debug.ore("CompoundObjectList " + this.storeId,this);
    }
});
