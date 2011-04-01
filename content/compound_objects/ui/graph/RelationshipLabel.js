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
/** 
 * @class lore.ore.ui.graph.RelationshipLabel An editable label that represents a relationship between resources
 */
lore.ore.ui.graph.RelationshipLabel = function() {
    draw2d.Label.call(this);
    //lore.debug.ore("created relationship label",this);
    this.html.className="ctxtConnLabel";
    this.createEditElement();
    //TODO: enable filtering by direct editing of label
    //Ext.get(this.getHTMLElement()).on('dblclick',this.startEditing,this);
    Ext.get(this.getHTMLElement()).on('dblclick',this.showMenu,this);
    this.editing = false;
};
Ext.extend(lore.ore.ui.graph.RelationshipLabel, draw2d.Label, {
    type : "lore.ore.ui.graph.RelationshipLabel",
    /** sets up an editable field to change the relationship type */
    createEditElement : function(){
    	/*this.editField = new Ext.form.ComboBox({
    		typeAhead: true,
    		triggerAction: 'all',
    		mode: 'local',
    		pageSize: 10,
    		width: 80,
    		store: lore.ore.ontologyManager.terms,
    		valueField: 'uri',
    		displayField: 'label',
    		allowBlank: false,
    		renderTo: this.getHTMLElement(),
    		hidden: true,
    		style: {
    			//backgroundColor: "red"
    		}
    	});*/
    	try{
    	this.editField = new Ext.form.TriggerField({
            editable: true,
            width: 100,
            renderTo: this.getHTMLElement(),
            hidden: true,
            triggerClass: 'x-form-ellipsis-trigger',
            triggerConfig: {
               tag : "img", 
               src : Ext.BLANK_IMAGE_URL,
               cls: "x-form-trigger x-form-ellipsis-trigger",
               qtip: 'Set relationship'
            },
            onTriggerClick: function(ev) {
               try {
            	lore.debug.ore("on trigger click",ev);
            	lore.ore.ui.graph.ContextmenuConnection.contextmenu.showAt(ev.xy);
             
                
               } catch (e){
                   lore.debug.ore("problem in trigger click",e);
               }
            } 
    	});
    	this.editField.on("specialkey",function(f,e){	
    		var key = e.getKey();
    		if (e.getKey() == e.ENTER || e.getKey() == e.ESC){
    			// cancel edit if escape is pressed
    			this.stopEditing(key == e.ESC);
    		}
	    		
    	},this);
    	this.editField.on("blur",function(f,n,o){
    			this.stopEditing();
    	},this);
    	} catch (ex){
    		lore.debug.ore("createEditElement",ex);
    	}
    },
    /** 
     * Stop direct editing of relationship
     */
    stopEditing : function(cancel){
    	if (!cancel && this.editField.isValid()){
    		// update rel
    	}
    	this.editField.hide();
    	Ext.get(this.textNode).show();
    	this.parent.workflow.editingText = false;
    	this.editing = false;
    },
    /**
     * Start direct editing of relationship
     */
    startEditing : function(){
    	try{
    		lore.debug.ore("startEditing",this.editField);
    	if (this.editing){
    		return;
    	}
    	this.editing = true;
		// hide display label
    	Ext.get(this.textNode).hide();
    	// display editing field with current value
    	this.editField.setRawValue(this.getText());
    	this.editField.show();
    	
    	// prevent keystrokes entered into text field being interpreted by editor to move/delete nodes
    	var wf = this.parent.workflow;
    	wf.editingText = true;
    	
		//lore.debug.ore("position",this.editField.getPosition())
		//var pos = this.editField.getPosition();
		//wf.scrollTo(pos[0], pos[1]); // TODO: adjust to allow space for drop down options

    	this.editField.focus();
    	//this.editField.expand();
    	} catch (ex){
    		lore.debug.ore("startEditing",ex);
    	}
    },
    showMenu : function(ev){
        var pos = ev.xy;  
        this.parent.onContextMenu(pos[0],pos[1],true)
    }
});