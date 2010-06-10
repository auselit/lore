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
Ext.namespace('lore.anno.ui');

/**
 * Object that encapsulates a search screen for annotations
 * @class lore.anno.ui.PropertyEditor
 * @extends Ext.grid.EditorGridPanel
 */
lore.anno.ui.PropertyEditor = Ext.extend(Ext.grid.EditorGridPanel, {

	/**
	 * Load configuration options and generate search GUI
	 * @constructor
	 */
	initComponent: function() {
		var t = this;
		
		var gridpanelconfig = {
			clicksToEdit : 1,
			columnLines : true,
			store : new Ext.data.JsonStore({
						idProperty : 'id',
						fields : [{
									name : 'id',
									type : 'string'
								}, {
									name : 'name',
									type : 'string'
								}, {
									name : 'value',
									type : 'string'
								}]
					}),
			colModel : new Ext.grid.ColumnModel({
						columns : [{
									id : 'name',
									header : 'Property Name',
									sortable : true,
//									renderer : this.shortName,
									dataIndex : 'name',
									menuDisabled : true
								}, {
									id : 'value',
									header : 'Value',
									dataIndex : 'value',
									menuDisabled : true,
									editor : new Ext.form.TextField()
								}]
					}),
			sm : new Ext.grid.RowSelectionModel({
						singleSelect : true
					}),
			title : 'Metadata',
	
			tools : [{
						id : 'plus',
						qtip : 'Add a property',
						handler : this.addProperty
					}, {
						id : 'minus',
						qtip : 'Remove the selected property',
						handler : this.removeProperty
					}, {
						id : 'help',
						qtip : 'Display information about the selected property',
						handler : this.helpProperty
					}],
			id : "remgrid",
			autoHeight : true,
			anchor: '-30',
			viewConfig : {
				forceFit : true,
				scrollOffset : 0
			}
		};
		
		try {
			Ext.apply(this, gridpanelconfig);

			lore.anno.ui.PropertyEditor.superclass.initComponent.apply(this, arguments);

		} catch (e) {
			lore.debug.anno("PropertyEditor:initComponent() - " + e, e);
		}
	},
	
	
	
	/** Handler for plus tool button on property grids */
	addProperty: function (ev, toolEl, panel) {
	    var makeAddMenu  = function(panel){
		    panel.propMenu = new Ext.menu.Menu({
		        id: panel.id + "-add-metadata"
		    });

	        var props = panel.propertiesList;
		    for (var i = 0; i < props.length; i++) {
	            var propname = props[i];
	            var pstore = panel.getStore();
	            panel.propMenu.add({
	                id: panel.id + "-add-" + propname,
	                text: propname,
	                handler: function () {
	                    try{
	                        var counter = 0;
	                        var prop = pstore.getById(this.text + "_" + counter);
	                        
	                        while (prop) {
	                            counter = counter + 1;
	                            prop = pstore.getById(this.text + "_" + counter);
	                        }
	                        var theid = this.text + "_" + counter;
	                        pstore.loadData([{id: theid, name: this.text, value: ""}],true);
	                        
	                    } catch (ex){
	                        lore.debug.anno("exception adding prop " + this.text,ex);
	                    }
	                }
	            });
		    }
		};
	    if (!panel.propMenu || panel.propertiesListChanged) {
	        makeAddMenu(panel);
	        this.propertiesListChanged = false;
	    }
	    panel.propMenu.showAt(ev.xy);
	},
	/** Handler for minus tool button on property grids */
	removeProperty: function (ev, toolEl, panel) { 
	    try {
		    var sel = panel.getSelectionModel().getSelected();
		    
		    if (panel.collapsed) {
		        lore.anno.ui.loreInfo("Please expand the properties panel and select the property to remove");
		    } else if (sel) {
				panel.getStore().remove(sel);
			} else {
		        lore.anno.ui.loreInfo("Please click on the property to remove prior to selecting the remove button");
			}
		} catch (ex) {
			lore.debug.anno("error removing property ",ex);
		}
	},
	/** Handler for help tool button on property grids */
	helpProperty: function (ev,toolEl, panel) {
	    var sel = panel.getSelectionModel().getSelected();
	    if (panel.collapsed){
	        lore.anno.ui.loreInfo("Please expand the properties panel and select a property");
	    } else if (sel){
	        var splitprop =  sel.data.name.split(":");
	        var infoMsg = "<p style='font-weight:bold;font-size:130%'>" + sel.data.name + "</p><p style='font-size:110%;margin:5px;'>" 
	        + sel.data.value + "</p>";
	        if (splitprop.length > 1){
	            var ns = lore.constants.NAMESPACES[splitprop[0]];
	            infoMsg += "<p>This property is defined in " 
	                    + "<a style='text-decoration:underline' href='#' onclick='lore.global.util.launchTab(\"" 
	                    + ns + "\");'>" + ns + "</a></p>";
	        }
	        
	        Ext.Msg.show({
	                title : 'About ' + sel.data.name,
	                buttons : Ext.MessageBox.OK,
	                msg : infoMsg
	            });
	    } else {
	        lore.anno.ui.loreInfo("Please click on a property prior to selecting the help button");
	    }
	},
	
	/**
	 * Set the type of object we are editing the metadata for, restricting the
	 * list of properties that can be added.
	 * @param {} onturl 
	 */
	setObjectType: function (onturl, object) {
		var tthis = this;
		this.loadOntology(onturl, function callback(ontology) {
			lore.debug.anno('loadOntology callback', {ontology:ontology,object:object});
			tthis.propertiesList = [];
			tthis.ontology = ontology;
			
			ontology.where('?prop rdfs:domain <' + object + '>')
				.each(function () {
					var name = this.prop.value.toString();
					tthis.propertiesList.push(name.replace(lore.constants.NAMESPACES['austlit'], ''));
			});
			tthis.propertiesListChanged = true;
		});
		lore.debug.anno('setObjectType', {props: tthis.propertiesList});
	},
	
	/**
	 * Return the short name of an RDF object
	 * @param {} longName full reference to an rdf object
	 * @return {} 
	 */
	shortName: function (longName) {
		// TODO: actually do this for all the namespaces we know about!
		return longName.replace(lore.constants.NAMESPACES['austlit'], '');
	},
	
	/**
	 * Load an ontology into the property editor panel
	 * @param {} onturl URL to load the ontology from
	 * @param {} callback callback function, passed the ontology as a jQuery.rdf data store
	 */
	loadOntology: function (onturl, callback) {
		if (onturl) {
			lore.debug.anno("getting ontology : " + onturl);
			var xhr = new XMLHttpRequest();
			xhr.overrideMimeType('text/xml');
			xhr.open("GET", onturl, true);
			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4) {
					try {
						var db = jQuery.rdf.databank();
						for (ns in lore.constants.NAMESPACES){
						    db.prefix(ns,lore.constants.NAMESPACES[ns]);
						}
						db.load(xhr.responseXML);
						lore.debug.anno("loading relationships from " + onturl);      
						if (typeof(callback) == 'function')
							callback(jQuery.rdf({databank: db}));
						
					} catch (e){
						lore.debug.anno("problem loading rels",e);
					}
				} 
	        };
	        xhr.send(null);
		}
	}
});




Ext.reg("annopropertyeditor", lore.anno.ui.PropertyEditor);