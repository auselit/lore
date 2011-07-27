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


lore.anno.ui.SolrSearchPanel = Ext.extend(Ext.Panel, {
    initComponent: function() {
        this.ds = new lore.anno.ui.SolrStore();
        var formConfig = {
            region: 'north',
            xtype: 'panel',
            layout: 'hbox',
            layoutConfig : {
                pack : 'start',
                align : 'stretch',
                flex: 1
            },
            height: 50,
            items: [{
                fieldLabel: 'Search',
                name: 'searchtext',
                ref: 'searchText',
                xtype: 'textfield',
                flex: 3
            }, {
                xtype: 'button',
                text: 'Search',
                ref: 'searchButton',
                flex: 1,
                margins : '0 0 0 0'
            }],
            keys: [{
                key: [10, 13],
                fn: function() {
                    this.searchButton.fireEvent('click');
                },
                scope: this
            }]
        };

        Ext.apply(this, Ext.apply(this.initialConfig, formConfig));
        lore.anno.ui.SolrSearchPanel.superclass.initComponent.call(this);
        
        this.searchButton.on("click", function() {
        	this.ds.setBaseParam('q', this.searchText.getValue());
        	this.ds.load({start: 0});
        }, this);
    }
});
Ext.reg('solrsearchpanel', lore.anno.ui.SolrSearchPanel);

lore.anno.ui.SolrStore = Ext.extend(Ext.data.Store,{
    proxy: new Ext.data.HttpProxy({
    	// This is the default value, it is overridden from preferences in lore.anno.ui.handlePrefsChange
        url: 'http://austlit.edu.au/solr/select',
        method: 'GET'
    }),
    remoteSort: true,
    reader: new Ext.data.JsonReader({
        root: 'response.docs',
        total: 'response.numFound',
        totalProperty: 'response.numFound',
        idProperty: 'id',
        fields: [
            {name: 'id', mapping: 'id'},
            {name: 'uri', mapping: 'id'},
            {name: 'title', mapping: function(d){
                    // title is multivalued - get first value only
                    if (d && d.title) {
                        return d.title[0]
                    }
                }
            },
            {name: 'resource', mapping: function(d){
                    // annotates is multivalued (e.g. variation annotations)
                    //lore.debug.anno("record mapping",d)
                    if (d && d.annotates) {
                        return d.annotates[0]
                    }
                }
            },
            {name: 'creator', mapping: 'creator'},
            {name: 'created', mapping: 'created', type: 'date'},
            {name: 'modified', mapping: 'last_modified', type: 'date'}
        ]
    }),
    baseParams: {
        version: '2.2',
        rows: '5',
        indent: 'on',
        sort: 'created desc',
        wt: 'json'
    },
    paramNames: {limit: 'rows'},
    // override default sort parameter sent for solr
    load : function(options) {
        try{
            options = Ext.apply({}, options);
            this.storeOptions(options);
            if(this.sortInfo && this.remoteSort){
                var pn = this.paramNames;
                options.params = Ext.apply({}, options.params);
                options.params[pn.sort] = (this.sortInfo.field == "modified"? "last_modified": this.sortInfo.field) + " " + this.sortInfo.direction;
                lore.debug.ore("sort options are " + options.params[pn.sort]);
            }
            return this.execute('read', null, options); // <-- null represents rs.  No rs for load actions.
        } catch(e) {
            lore.debug.anno("problem in load",e);
            this.handleException(e);
            return false;
        }
    }
});