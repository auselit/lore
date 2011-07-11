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
        this.ds = new Ext.data.Store({
            proxy: new Ext.data.HttpProxy({
                url: 'http://doc.localhost/solr/select',
                method: 'GET'
            }),
            reader: new Ext.data.JsonReader({
                root: 'response.docs',
                total: 'response.numFound',
                totalProperty: 'response.numFound',
                idProperty: 'id',
                fields: [
                    {name: 'id', mapping: 'id'},
                    {name: 'title', mapping: 'title'},
                    {name: 'resource', mapping: 'annotates'},
                    {name: 'creator', mapping: 'creator'},
                    {name: 'created', mapping: 'created', type: 'date'},
                    {name: 'modified', mapping: 'modified', type: 'date'}
                ]
            }),
            baseParams: {
                version: '2.2',
                rows: '5',
                indent: 'on',
//                sort: 'created asc',
                wt: 'json'
            },
            paramNames: {limit: 'rows'}
        });
        var pagingToolbar = {
        		xtype : 'paging',
        		store : this.ds,
        		pageSize : 5,
        		displayInfo : true,
        };
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
//                region: 'center',
                flex: 3
            }, {
                xtype: 'button',
                text: 'Search',
                ref: 'searchButton',
//                region: 'east',
                flex: 1,
                margins : '0 10 0 0'
            }],
            keys: [{
                key: [10, 13],
                fn: function() {
                    this.searchButton.fireEvent('click');
                },
                scope: this
            }],
            bbar: pagingToolbar
        };
        
//        var dataview = {
//            xtype: 'annodataview',
//            ref: 'dataView',
//            itemId: 'dataview',
//            store: this.ds,
//            autoScroll: true,
//            region: 'center'
//        };
//        var config = {
//        	layout: 'border',
//        	height: 50,
//            items: [
////                panelConfig, dataview, pagingToolbar
//				formConfig, pagingToolbar
//            ]
//        };


        Ext.apply(this, Ext.apply(this.initialConfig, formConfig));
        lore.anno.ui.SolrSearchPanel.superclass.initComponent.call(this);

        this.searchButton.on("click", function() {
        	this.ds.setBaseParam('q', this.searchText.getValue());
        	this.ds.load({start: 0});
        }, this);
        
    }
});
Ext.reg('solrsearchpanel', lore.anno.ui.SolrSearchPanel);
