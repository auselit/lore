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

/*
 * @include  "/oaiorebuilder/content/annotations/annotations.js"
 * @include  "/oaiorebuilder/content/debug.js"
 * @include  "/oaiorebuilder/content/util.js"
 */


/*
 * A contentEditable in firefox defaults to applying formatting as css.
 * 
 * This causes troubles when annotations are saved and reloaded, since
 * the css is stripped out for security reasons.
 * 
 * The Ext HtmlEditor control is supposed to change this 'styleWithCSS'
 * setting, but for some reason it wasn't sticking. This override applies
 * the setting before each command is executed on the contentEditable.
 * 
 * Trac ticket #249
 */
Ext.override(Ext.form.HtmlEditor, {
    execCmd : function(cmd, value){
        var doc = this.getDoc();
        doc.execCommand('styleWithCSS', false, false);
        doc.execCommand(cmd, false, value === undefined ? null : value);
        this.syncValue();
    }
});

/**
 * EditorPanel 
 * Extends a regular Ext Form Panel adding a host of components
 * and default behaviours for editing annotations
 * @class lore.anno.ui.EditorPanel
 * @extends Ext.form.FormPanel
 * @xtype annoeditorpanel
 */
lore.anno.ui.EditorPanel = Ext.extend(Ext.form.FormPanel, {

	/**
	 * Return UI Ext config for the Editor Panel
	 * @return {Object} UI config
	 */
	genForm: function () {
		return {
				
			 	title: "Editor",
			 	layout: 'border',
				items: [{
			 		region: "center",
		 			xtype: 'fieldset',
		 			layout: 'form',
		 			autoScroll: true,
		 			id: this.genID('annotationsform'),
		 			labelWidth: 85,
					defaultType: 'textfield',
					buttonAlign: 'right',
					style: 'border:none; margin-left:10px;margin-top:10px;',
					layoutConfig: {
						trackLabels: true,
						labelAlign: 'right'
					},
					defaults: {
						hideMode: 'display',
						anchor: '-30'
					},
						
					items: [{
						xtype: "combo",
						id: this.genID("typecombo"),
						fieldLabel: 'Type',
						name: 'type',
						hiddenName: 'type',
						store: new Ext.data.SimpleStore({
							fields: ['typename', 'qtype'],
							data: [['Comment', "http://www.w3.org/2000/10/annotationType#Comment"], ['Explanation', "http://www.w3.org/2000/10/annotationType#Explanation"],['Question','http://www.w3.org/2000/10/annotationType#Question' ], 
							['Variation', "http://austlit.edu.au/ontologies/2009/03/lit-annotation-ns#VariationAnnotation"],
							['Semantic',"http://austlit.edu.au/ontologies/2009/03/lit-annotation-ns#SemanticAnnotation" ]]
						}),
						valueField: 'qtype',
						displayField: 'typename',
						typeAhead: true,
						triggerAction: 'all',
						forceSelection: true,
						mode: 'local',
						selectOnFocus: true
					}, {
						fieldLabel: 'Title',
						name: 'title',
						id: this.genID("title")
						
					}, {
						fieldLabel: 'Creator',
						name: 'creator',
						id: this.genID("creator")
						
					}, {
						fieldLabel: 'References',
						name: 'references',
						id: this.genID("references")
					},
					{
						xtype: "combo",
						id: this.genID("importance"),
						fieldLabel: 'Importance',
						name: 'importance',
						hiddenName: 'importance',
						store: new Ext.data.SimpleStore({
							fields: ['impname', 'qimpname'],
							data: [['Very Important', "VeryImportant"], ['Important', "Important"],['Trivial','Trivial' ]]
						}),
						valueField: 'qimpname',
						displayField: 'impname',
						typeAhead: true,
						triggerAction: 'all',
						forceSelection: true,
						mode: 'local',
						selectOnFocus: true
					},
					{
						fieldLabel: 'Variation Agent',
						name: 'variationagent',
						id: this.genID("variationagent"),
						
						hideParent: true
					}, {
						fieldLabel: 'Variation Place',
						name: 'variationplace',
						id: this.genID("variationplace"),
						
						hideParent: true
					}, {
						fieldLabel: 'Variation Date',
						name: 'variationdate',
						id: this.genID("varitiondate"),
						hideParent: true
					}, {
						fieldLabel: 'ID',
						name: 'id',
						hidden: true,
						hideLabel: true,
						style: {
							padding: 0,
							margin: 0,
							display: 'none'
						}
					}, {
						fieldLabel: 'Annotates',
						name: 'res',
						id: this.genID("res"),
						readOnly: true,
						hideParent: true,
						style: {
							background: 'none',
							border: 'none',
							'font-size': '90%'
						}
						//labelStyle: 'font-size:90%;'
					
					}, {
						fieldLabel: 'Context',
						name: 'context',
						readOnly: true,
						hidden: true,
						hideLabel: true,
						style: {
							background: 'none',
							border: 'none',
							padding: 0,
							margin: 0
						}
					},  
					 {
						fieldLabel: 'Original resource',
						name: 'original',
						id: this.genID('originalfield'),
						readOnly: true,
						style: {
							background: 'none',
							border: 'none',
							'font-size': '90%'
						},
						labelStyle: 'font-size:90%'
					}, {
						fieldLabel: 'Original Context Xpointer',
						name: 'originalcontext',
						readOnly: true,
						style: {
							background: 'none',
							border: 'none',
							padding: 0,
							margin: 0
						},
						hidden: true,
						hideLabel: true
					}, {
						xtype: 'compositefield',
						fieldLabel: 'Selection',
						name: 'contextdisp',
						id: this.genID("contextdisp"),
						style: {
							background: 'none',
							'border-top': 'none',
                            'border-bottom': 'none',
                            'border-left': 'none',
                            'border-right': 'none',
							'font-size': '90%'
						},
						items: [
							{
								xtype: 'textfield',
								name: 'contextdisptxt',
								id: this.genID("contextdisptxt"),
								readOnly: true,
								flex: 1
							}, {
								xtype: 'button',
								text: 'Set',
								onClick: this.handleUpdateAnnotationContext
							}
						]
					}, {
						fieldLabel: 'Variant resource',
						name: 'variant',
						id: this.genID('variantfield'),
						readOnly: true,
						style: {
							background: 'none',
							border: 'none',
							'font-size': '90%'
						}
					}, {
						fieldLabel: 'Variant Context Xpointer',
						name: 'variantcontext',
						readOnly: true,
						style: {
							background: 'none',
							border: 'none',
							padding: 0,
							margin: 0
						},
						hidden: true,
						hideLabel: true
					}, {
						xtype: 'compositefield',
						fieldLabel: 'Selection',
						name: 'rcontextdisp',
						id: this.genID("rcontextdisp"),
						style: {
							background: 'none',
							'border': 'none',
							'font-size': '90%'
						},
						items: [
							{
								xtype: 'textfield',
								name: 'rcontextdisptxt',
								id: this.genID("rcontextdisptxt"),
								readOnly: true,
								flex: 1
							}, {
								xtype: 'button',
								text: 'Set',
								onClick: this.handleUpdateAnnotationVariantContext
							}
						]
					}, {
						fieldLabel : 'Semantic selection',
						name: 'metares',
						id: this.genID('metares'),
						readOnly: true,
						hideParent: true,
						style: {
							background: 'none',
							border: 'none',
							'font-size':'90%'
						}
						//labelStyle: 'font-size:90%;'
					}, {
						xtype: "button",
						text: 'Choose semantic selection',
						fieldLabel: '',
						id: this.genID('chgmetactxbtn'),
						tooltip: 'Select the item or relationship to annotate',
						handler: this.handleChangeMetaSelection,
						parent: this
					},
					/*{
						fieldLabel : 'Metadata',
						name: '',
						id: '',
					},*/
					{
						xtype: "editorgrid",
						
						id: this.genID('metausergrid'),
						name: 'metausergrid',
						store: this.metaModel,
						//deferRowRender: false,
						height: 100,
						viewConfig: {
							forceFit: true
						},
						//forceFit: true,
				
				 		colModel: new Ext.grid.ColumnModel( {
						// grid columns
						defaults: {
							sortable: true
						},
						columns: [
							{
								id: 'type', // id assigned so we can apply custom css (e.g. .x-grid-col-topic b { color:#333 })
								header: 'Type',
								dataIndex: 'type',
								width:50,
								editor: {
									xtype: 'combo',
									store: new Ext.data.ArrayStore( {
										id: '',
										fields: ['type', 'displayType'],
										data: [
										['http://austlit.edu.au/owl/austlit.owl#Agent', 'Agent'], 
										['http://austlit.edu.au/owl/austlit.owl#Work','Work'],
										['http://austlit.edu.au/owl/austlit.owl#Manifestation','Manifestation']]
									}),
									mode: 'local', 
									valueField: 'type',
									displayField: 'displayType',
									triggerAction: 'all'
								},
								renderer: function (value) {
									return value.indexOf("#")!=-1 ? value.substring(value.indexOf("#")+1):value; 
								}
							}, 
							{
								header: "Property",
								dataIndex: 'prop',
								editor:{
									xtype: 'combo',
									store: new Ext.data.ArrayStore( {
										id: '',
										fields: ['prop', 'property'],
										data: [['displayName','displayName'], ['influencedWork','influencedWork'],
										['hasReprint','hasReprint'],
										['alternateTitle', 'alternateTitle'],
										 ['biography','biography']]
									}),
									mode: 'local', 
									valueField: 'prop',
									displayField: 'property',
									triggerAction: 'all'
								}
							}, 
							{
								header: "value",
								dataIndex: 'value',
								editor: new Ext.form.TextField({ allowBlank:false})
							} 
						]
						})
					}, {
						xtype: "button",
						text: 'Add',
						fieldLabel: '',
						id: this.genID('addmetabtn'),
						tooltip: 'Add metadata about this page to the annotation'
					}, {
						xtype:"button",
						text: 'Remove',
						id: this.genID('remmetabtn'),
						tooltip: 'Remove user created metadata about this page from the annotation'
					}, {
						id: this.genID('tagselector'),
						xtype: 'superboxselect',
						allowBlank: true,
						msgTarget: 'under',
						allowAddNewData: true,
						fieldLabel: 'Tags',
						emptyText: 'Type or select tags',
						resizable: true,
						name: 'tags',
                        pageSize: 10,
						store: new Ext.ux.data.PagingArrayStore ({
							fields: ['id', 'name'],
							data: lore.anno.thesaurus,
                            lastOptions: {params: {start:0,limit:10}}
						}),
						mode: 'local',
						displayField: 'name',
						valueField: 'id',
						extraItemCls: 'x-tag',
						listeners: {
							newitem: function(bs, v){
								v = v.slice(0, 1).toUpperCase() + v.slice(1).toLowerCase();
								var newObj = {
									id: v,
									name: v
								};
								bs.addItem(newObj);
							}
						}
					}, {
						fieldLabel: 'Body',
						xtype: 'htmleditor',
						plugins: [new Ext.ux.form.HtmlEditor.Img()],
						name: 'body',
						id: this.genID('body'),
						enableFont: false,
						enableColors: false,
						enableSourceEdit: false,
						anchor: '-30 100%'
					}, {
						fieldLabel: 'Alt Body',
						xtype: 'htmleditor',
						plugins: [new Ext.ux.form.HtmlEditor.Img()],
						name: 'altbody',
						enableFont: false,
						enableColors: false,
						enableSourceEdit: false,
						anchor: '-30 100%'
					}],
					buttons: this.buttonsConfig ? this.buttonsConfig : []
				}]
				
			};
	},
	
	/**
	 * Construct a new instance of the Editor Panel
	 */
	initComponent: function(){
	  	try {
			Ext.apply ( this, this.genForm());
			lore.anno.ui.EditorPanel.superclass.initComponent.apply(this, arguments);
			this.form = this.getForm();
			this.metaUserGrid = this.getComponent("metausergrid");
			this.annomode = lore.constants.ANNOMODE_NORMAL; // whether mode is scholarly or normal
			this.model.on('update', this.handleRecordUpdate, this); // when annotation record is updated, update editor
			this.pageView.page.on('annochanged', this.handleAnnoChanged, this);
			this.getComponent("typecombo").on('valid', this.handleAnnotationTypeChange, this);
			this.getComponent("addmetabtn").on('click', this.handleAddMeta, this);
			this.getComponent("remmetabtn").on('click', this.handleRemMeta, this);
			
			// Add hack to stop this field being flagged as dirty because
			// originalValue is XML and the value field is converted to HTML
			 
			this.getComponent("body").on("push", function(field, html) {
				field.originalValue = field.getValue();
			});
		} catch(e){
			lore.debug.anno("EditorPanel:initComponent() - " + e, e);
		}
	},
	
	/**
	 * Set the preferences object to listen to event update for
	 * @param {Object} prefObj
	 */
	setPreferences: function(prefObj ) {
		this.prefs = prefObj;
		this.annomode = this.prefs.mode;
		this.prefs.on('prefs_changed', this.handlePrefsChanged, this);
	},
	
	/**
	 * Return the form object
	 * @return The form object
	 */
	form: function () {
		return this.form;
	},
	
	/**
	 * Determine whether any field is modified on form
	 * @return {Boolean} 
	 */
	isDirty: function () {
		return lore.anno.ui.isFormDirty(this.form);
	},
	
	/**
	 * Update the annotation xpath context
	 * @param {Object} btn Not currently used
	 * @param {Object} e Not currently used
	 */
	handleUpdateAnnotationContext : function(scope){
		lore.debug.anno("EditorPanel.js handleUpdateAnnotationContext()", [this, scope]);
		try {
			
			// either scope of field or scope supplied, the callee's scope
			// can vary
			var panel = this.findParentByType('annoeditorpanel') || scope;
			var curSelAnno = panel.pageView.page.curSelAnno;

			if (!panel.isVisible())
				panel.show(panel.pageView.page.curSelAnno);
			
			// get text selection, and update the appropriate fields
			var currentCtxt = panel.pageView.getCurrentSelection();
			var theField = panel.form.findField('context');
			theField.setValue(currentCtxt);
			theField = panel.form.findField('originalcontext');
			theField.setValue(currentCtxt);
			theField = panel.form.findField('res');
			theField.setValue(lore.anno.ui.currentURL);
			if ( curSelAnno)
				curSelAnno.data.resource = lore.anno.ui.currentURL;
			theField = panel.form.findField('original');
			theField.setValue(lore.anno.ui.currentURL);
			theField = panel.form.findField('contextdisptxt');
			theField.setValue('"' + lore.global.util.getSelectionText(currentCtxt, lore.global.util.getContentWindow(window).document) + '"');
		
			
			
			// TODO: update the pageview to highlight the new selection
			// Should be in pageview code, that gets called from here
			var editedRec = lore.anno.ui.updateAnnoFromForm(curSelAnno);
			panel.pageView.highlightCurrentAnnotation(editedRec);
		} 
		catch (ex) {
			lore.debug.anno("Exception updating anno context", ex);
		}
	},
		
		/**
		 * Update the variation annotation xpath context
		 * @param {Object} btn Not currently used
		 * @param {Object} e Not currently used
		 */
		handleUpdateAnnotationVariantContext : function(scope){
			try {
				// either scope of field or scope supplied, the callee's scope
				// can vary
				var panel = this.findParentByType('annoeditorpanel') || scope;  
				var curSelAnno = panel.pageView.page.curSelAnno;
				if (!panel.isVisible())
					panel.show(panel.pageView.page.curSelAnno);
				
				// get text selection, and update the appropriate fields
				var currentCtxt = panel.pageView.getCurrentSelection();
				var theField = panel.form.findField('variantcontext');
				theField.setValue(currentCtxt);
				theField = panel.form.findField('variant');
				theField.setValue(lore.anno.ui.currentURL);
				theField = panel.form.findField('rcontextdisptxt');
				theField.setValue('"' + lore.global.util.getSelectionText(currentCtxt, lore.global.util.getContentWindow(window).document) + '"');
			} 
			catch (ex) {
				lore.debug.anno("Exception updating anno variant context", ex);
			}
		},
		
		/**
		 * Update the semantic selection
		 */
		handleChangeMetaSelection : function () {
			try {
				var panel = this.parent;
				// load RDFa for page
			 	panel.rdfaManager.load(lore.global.util.getContentWindow(window));
				
				// callback, when a triple is chosen. Update field with supplied triple.
				var setFormField = function (isObject, triple) {
					var theField = panel.form.findField('metares');
					theField.setValue(lore.anno.ui.tripleURIToString(triple.object));
				}
				// show the triples on the page
			 	panel.pageView.toggleTripleMarkers(setFormField);
			} catch (e) {
				lore.debug.anno(e,e);
			}
		},
		
		/**
		 * Load record into the editor panel
		 * @param {Record} rec The record to load
		 */
		load: function(rec) {
			try {
			
				// display contents of context
				if (rec.data.context) {
					
					var ctxtField = this.form.findField('contextdisptxt');
					if (rec.data.original == lore.anno.ui.currentURL) {
						var selText = '';
						try {
							selText = lore.global.util.getSelectionText(
							rec.data.context, lore.global.util.getContentWindow(window).document)
						} 
						catch (e) {
						}
						
						this.form.setValues([{
							id: 'contextdisptxt',
							value: '"' + selText + '"'
						}]);
					} else if ( !lore.anno.ui.topView.variationContentWindowIsVisible() ){
						this.pageView.updateSplitter(rec, false, this.updateSplitterContextField, this); // when content is loaded in splitter
																										 // context field will be set
					}

					ctxtField.getEl().setStyle("background-color", this.pageView.getCreatorColour(rec.data.creator));
					lore.anno.ui.setVisibilityFormField(this.form,'contextdisp', false);
					
				}
				else {
					// otherwise display empty
					var ctxtField = this.form.findField('contextdisptxt');
					this.form.setValues([{
						id: 'contextdisptxt',
						value: ""
					}]);
					ctxtField.getEl().setStyle("background-color", "inherit");
				}
				
				
				// display contents of variant context 
				if (rec.data.variantcontext) {
					var vCtxtField = this.form.findField('rcontextdisptxt');
					if (rec.data.variant == lore.anno.ui.currentURL) {
						var selText = '';
						try {
							
							selText = lore.global.util.getSelectionText(
							rec.data.variantcontext, lore.global.util.getContentWindow(window).document)
						} 
						catch (e) {
						}
						this.form.setValues([{
							id: 'rcontextdisptxt',
							value: '"' + selText + '"'
						}]);
					} else if ( !lore.anno.ui.topView.variationContentWindowIsVisible() ){
						this.pageView.updateSplitter(rec, false, this.updateSplitterContextField, this); // when content is loaded in splitter
															// context field will be set
					}
					vCtxtField.getEl().setStyle("background-color", this.pageView.getCreatorColour(rec.data.creator));
					lore.anno.ui.setVisibilityFormField(this.form,'rcontextdisp', false);
				}
				else {
					// otherwise empty
					var ctxtField = this.form.findField('rcontextdisptxt');
					this.form.setValues([{
						id: 'rcontextdisptxt',
						value: ""
					}]);
					ctxtField.getEl().setStyle("background-color", "inherit");
				}
				
				
				this.form.setValues([{ id: 'metares', value: ''}]);
				// if semantic annotation and rdfa exists for page and a meta-context exists then resolve
				// the context to a value and display in the meta context field
				var rdfa = this.pageView.page.rdfa;
				if ( rdfa.triples && lore.global.util.splitTerm(anno.type).term == 'Semantic') {
				
					var theField =  this.form.findField('metares');
					
					try {
						if (rec.data.meta.context) {
							var d = lore.global.util.getContentWindow(window).document;
							var triple;
							
							if ( rdfa.length > 0) {
								//TODO: #194 - Storing of meta context will changed from string hashed triple
								lore.debug.anno("resolving context from hashed triple", rec.data.meta.context);
								triple = lore.global.util.stringHashToTriple(rec.data.meta.context[0], rdfa.rdf.databank.triples());	
							} else {
								var n = lore.global.util.getNodeForXPointer(rec.data.meta.context[1], d);
								triple = $(n.firstChild).rdfa().databank.triples()[0];
							}
							theField.setValue(lore.anno.ui.tripleURIToString(triple.property));
						}

						theField.getEl().setStyle("background-color", this.pageView.getCreatorColour(rec.data.creator));
						
				} catch (e) {
					lore.debug.anno(e,e);	
				}


				} else {
					this.form.setValues([{ id: 'metares', value: ''}]);
			 	}
			
				// hide/show fields depending on whether annotation is a scholarly annotation or not
				var isNormal = this.annomode == lore.constants.ANNOMODE_NORMAL;
				lore.anno.ui.setVisibilityFormField(this.form,'importance', 	isNormal);
				lore.anno.ui.setVisibilityFormField(this.form,'altbody', 		isNormal);
				lore.anno.ui.setVisibilityFormField(this.form,'references', 	isNormal);
			
				
				var val = rec.data.resource;
					
				if (rec.data.isReply) {
					// update fields for annotations that are replies
					var prec = lore.global.util.findRecordById(this.model, rec.data.about);
					if (prec) {
						val = "'" + prec.data.title + "'";
						if (!prec.data.isNew()) {
							val += " ( " + rec.data.about + " )";
						}
					} 
					else 
						val = '';
				}
				this.form.setValues([{ id: 'res', value: val }]);
				
				// hide context field if it is a reply
				if (rec.data.isReply) {
					this.form.findField('contextdisp').hide();
				}
				else {
					// TODO: doLayout() can be removed with Ext 3.2.1, just needed for combo fields now
					this.form.findField('contextdisp').show();
					this.doLayout();
				}
	
				this.rec = rec;
				this.form.loadRecord(rec);
			} 
			catch (e) {
				lore.debug.anno("Error display annotation: " + e, e);
			}
		},
		
		/**
		 * Callback that updates the context field
		 * @param {Object} cw
		 * @param {Object} rec
		 */
		updateSplitterContextField: function (cw, rec){
			// determine which context field to update
			// depending on whether it's for the original or
			// variant context for the variation annotation
			
			var fieldId = 'rcontextdisptxt';
			var ctx = rec.data.variantcontext;
			
			if (rec.data.variant == lore.anno.ui.currentURL) {
				fieldId = 'contextdisptxt';
				ctx = rec.data.context;
			}
				
			var selText = '';
				
			try {
				selText = lore.global.util.getSelectionText(ctx, cw.document);
			} 
			catch (e) {
				lore.debug.anno(e, e);
			}
			this.form.setValues([{
				id: fieldId,
				value: '"' + selText + '"'
			}]);
		},
		
		/**
		 * Show the annotation editor. 
		 * @param {Record} rec  The record containing the annotation to show in the editor
		 * @param {Boolean} loadOnly (Optional) Load the annotation data into form fields but don't show editor. Defaults to false.
		 */
		show : function(rec){
			this.load(rec);
			lore.anno.ui.EditorPanel.superclass.show.apply(this, arguments);
			
		},
		
		/**
		 * When the record is updated, update the editor
		 * @param {Object} store	 The data store
		 * @param {Object} rec		 The record 
		 * @param {Object} operation The operation performed
		 */
		handleRecordUpdate: function (store, rec, operation ) {
			if ( this.pageView.page.curSelAnno == rec )
				this.load(rec);
		},
		
		/**
		 * When the currently selected annotation changes update
		 * the editor
		 * @param {Object} oldRec Not used
		 * @param {Object} newRec The new record
		 */
		handleAnnoChanged: function(oldRec, newRec) {
			if (newRec)
				this.load(newRec);
		},	
		
		/**
		 * Update the form when the annotation type changes
		 * @param {Combo} combo The Combo field that has changed
		 */
		handleAnnotationTypeChange : function(combo){
			var theVal = combo.getValue();
			
			if ( theVal == 'Variation'){
				this.setAnnotationFormUI(true, false);
			} else if ( theVal == 'Semantic') {
				this.setAnnotationFormUI(false, true);
			}
			else if (theVal == 'Question' ||  theVal == 'Comment' || theVal == 'Explanation' ) {
					this.setAnnotationFormUI(false, false);
			}
		},
		
		/**
		 * When the preferences changes, update editor UI
		 * @param {Object} args
		 */
		handlePrefsChanged: function(args) {
			// update scholarly fields 
			if (this.isVisible()) 
					this.setAnnotationFormUI(null, null, args.mode);

			
			this.annomode = args.mode;
		},
		
		
		/**
		 * Show hide fields  
		 * @param {Boolean} variation Specify changes to UI for variation
		 * @param {Boolean} rdfa Specify changes to UI for rdfa
		 * @param {Boolean} annomode Specify changes to UI for annotation mode 
		 */
		setAnnotationFormUI : function(variation, rdfa, annomode){
		try {
			var nonVariationFields = ['res'];
			var variationFields = ['original', 'variant', 'rcontextdisp', 'variationagent', 'variationplace', 'variationdate'];
			var rdfaFields = ['metares', 'metausergrid', 'metauserlbl', 'metapagelbl'];
			
			var scholarlyFields = ['importance', 'references', 'altbody'];
			// annotation mode
			
			if (annomode != null) {
			
				if (annomode == lore.constants.ANNOMODE_NORMAL) {
					lore.anno.ui.hideFormFields(this.form, scholarlyFields);
				}
				else {
					lore.anno.ui.showFormFields(this.form, scholarlyFields);
					// TODO: only necessary until Ext 3.2.1
					this.doLayout();
				}
			}
			
			// variation
			if (variation != null) {
				if (variation) {
					lore.anno.ui.hideFormFields(this.form, nonVariationFields);
					lore.anno.ui.showFormFields(this.form, variationFields);
					var isReply = (this.pageView.curSelAnno && this.pageView.curSelAnno.data.isReply);
					if (!isReply) {
					//this.getComponent('updrctxtbtn').setVisible(true);
					}
				}
				else {
					//this.getComponent('updrctxtbtn').setVisible(false);
					lore.anno.ui.hideFormFields(this.form, variationFields);
					lore.anno.ui.showFormFields(this.form, nonVariationFields);
				}
				// TODO: only necessary until Ext 3.2.1
				this.doLayout();
			}
			
			// rdfa
			if (rdfa != null) {
				if (rdfa) {
					lore.anno.ui.showFormFields(this.form, rdfaFields);
				}
				else {
					lore.anno.ui.hideFormFields(this.form, rdfaFields);
				}
				
				this.getComponent('chgmetactxbtn').setVisible(rdfa);
				this.getComponent('metausergrid').setVisible(false);
				this.getComponent('addmetabtn').setVisible(false);
				this.getComponent('remmetabtn').setVisible(false);
				
			}
		} catch (e ) {
			lore.debug.anno(e,e);
		}
		},
		
		/**
		 * Add meta data
		 */
		handleAddMeta : function () {
			try {
				var defRec = new this.metaModel.recordType({
					type: 'Agent',
					source: 'User',
					prop: 'displayName',
					value: ''
				})
				
				this.metaModel.add(defRec);
			
			} catch (e) {
				lore.debug.anno(e,e );
			}
		},
		
		/**
		 *  Remove meta data
		 */
		handleRemData : function () {
			var rec = metaUserGrid.getSelectionModel().getSelected();
			if ( rec) {
				this.metaModel.remove(rec);
			}
		},
		
		 /**
		* Generated ID for a sub-component of this component
		* @param id Id of sub-component
		*/
		getComponent: function ( id ) {
			return Ext.getCmp( this.genID(id));
		},
		 /**
   * Retrieve sub-component of this component
   * @param {Object} id Id of sub-component
   */
		genID: function (id) {
			return this.id + "_" + id;
		},
		
		getRec: function() {
			return this.rec;
		},
		setRec: function(theRec) {
			this.rec = theRec;
		}
		
});

// register the component with Ext
Ext.reg("annoeditorpanel", lore.anno.ui.EditorPanel);