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
// Runs before the existing execCmd function
Ext.intercept(Ext.form.HtmlEditor.prototype, 'execCmd', function() {
    var doc = this.getDoc();
    doc.execCommand('styleWithCSS', false, false);
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
                    labelWidth: 70,
                    defaultType: 'textfield',
                    buttonAlign: 'right',
                    style: 'border:none; margin-left:10px;margin-top:10px;',
                    layoutConfig: {
                        trackLabels: true,
                        labelAlign: 'right'
                    },
                    defaults: {
                        hideMode: 'display',
                        anchor: '-30',
                        listeners: {
                            change: {
                                fn: function updateForm() {
                                    lore.anno.controller.updateAnnoFromForm();
                                },
                                scope: this
                            }
                        }
                    },

                    items: [{
                        xtype: "combo",
                        id: this.genID("typecombo"),
                        fieldLabel: 'Type',
                        name: 'type',
                        hiddenName: 'type',
                        store: new Ext.data.SimpleStore({
                            fields: ['typename', 'qtype'],
                            // FIXME: don't hardcode annotea annotation types
                            'data': [['Comment', "http://www.w3.org/2000/10/annotationType#Comment"], 
                            ['Explanation', "http://www.w3.org/2000/10/annotationType#Explanation"],
                            ['Question','http://www.w3.org/2000/10/annotationType#Question' ],
                            ['Variation', "http://austlit.edu.au/ontologies/2009/03/lit-annotation-ns#VariationAnnotation"],
                            ['Austlit Metadata',"http://austlit.edu.au/ontologies/2009/03/lit-annotation-ns#MetadataAnnotation" ],
                            ['OAC Annotation','http://www.openannotation.org/ns/Annotation'],
                            ['OAC Reply','http://www.openannotation.org/ns/Reply']
                            ]
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
                        allowBlank: false,
                        id: this.genID("title")
                    }, {
                        fieldLabel: 'Creator',
                        name: 'creator',
                        allowBlank: false,
                        hidden: true,
                        id: this.genID("creator")
                    }, {
                        fieldLabel: 'References',
                        name: 'references',
                        id: this.genID("references")
                    }, {
                        xtype: "combo",
                        id: this.genID("importance"),
                        fieldLabel: 'Importance',
                        name: 'importance',
                        hiddenName: 'importance',
                        store: new Ext.data.SimpleStore({
                            fields: ['impname', 'qimpname'],
                            'data': [['Very Important', "VeryImportant"], ['Important', "Important"],['Trivial','Trivial' ]]
                        }),
                        valueField: 'qimpname',
                        displayField: 'impname',
                        typeAhead: true,
                        triggerAction: 'all',
                        forceSelection: true,
                        mode: 'local',
                        selectOnFocus: true
                    }, {
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
                        id: this.genID("variationdate"),
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
                        store: lore.anno.thesaurus,
                        removeValuesFromStore: false,
                        mode: 'local',
                        displayField: 'name',
                        valueField: 'id',
                        extraItemCls: 'x-tag',
                        styleField: 'style'
                    }, {
                        //xtype:'fieldset',
                       // title: 'Body',
                        //anchor: '-30 50%',
                        //defaults: {
                       //     anchor: '100%' 
                       // },
                        //items: [{
                        xtype: 'htmleditor',
                        plugins: [new Ext.ux.form.HtmlEditor.Img(),
                                  new Ext.ux.form.HtmlEditor.ForegroundFontButton()],
                        name: 'body',
                        fieldLabel: 'Body',
                        id: this.genID('body'),
                        enableFont: false,
                        enableColors: false,
                        enableAlignments: false,
                        enableSourceEdit: false,
                        anchor: '-30 55%'
                       // anchor: '100% 100%'
                       // }]
                    }, {
                        id: this.genID('metausergrid'),
                        name: 'metausergrid',
                        xtype: "annopropertyeditor",
                        anchor: '-30',
                        hidden: true
                    }, {
                        fieldLabel: 'Target',
                        name: 'res',
                        id: this.genID("res"),
                        disabled: true,
                        disabledClass: '',
                        hideParent: true,
                        style: {
                            background: 'none',
                            border: 'none',
                            'font-size': '90%'
                        }
                    }, {
                        fieldLabel: 'Selector',
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
                    }, {
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
                                disabled: true,
                                disabledClass: '',
                                readOnly: true,
                                flex: 1
                            }, {
                                xtype: 'button',
                                text: 'Set',
                                handler: this.handleUpdateAnnotationContext,
                                scope: this
                            }
                        ]
                    }, {
                        fieldLabel: 'Variant resource',
                        name: 'variant',
                        id: this.genID("variantfield"),
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
                        style: {
                            background: 'none',
                            'border': 'none',
                            'font-size': '90%'
                        },
                        items: [
                            {
                                xtype: 'textfield',
                                name: 'rcontextdisptxt',
                                readOnly: true,
                                flex: 1
                            }, {
                                xtype: 'button',
                                text: 'Set',
                                handler: this.handleUpdateAnnotationVariantContext,
                                scope: this
                            }
                        ]
                    }, {
                        xtype: 'compositefield',
                        fieldLabel : 'Semantic selection',
                        name: 'semanticselection',
                        id: this.genID('semanticselection'),
                        items: [
                            {
                                xtype: 'textfield',
                                name: 'semanticEntity',
                                id: this.genID('semanticEntity'),
                                readOnly: true,
                                flex: 1
                            }, {
                                xtype: 'button',
                                text: 'Choose',
                                tooltip: 'Select the item or relationship to annotate',
                                handler: this.handleChangeMetaSelection,
                                scope: this
                            }
                        ]
                    }, {
                        fieldLabel: 'Private',
                        xtype: 'checkbox',
                        name: 'privateAnno'
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
            this.getComponent("typecombo").on('valid', this.handleAnnotationTypeChange, this);

            this.metaUserGrid.getStore().on('update', this.updateRecMetaFields, this);
            this.metaUserGrid.getStore().on('add', this.updateRecMetaFields, this);
            this.metaUserGrid.getStore().on('remove', this.updateRecMetaFields, this);
            // Add hack to stop this field being flagged as dirty because
            // originalValue is XML and the value field is converted to HTML

            this.getComponent("body").on("push", function(field, html) {
                field.originalValue = field.getValue();
            });
            this.getComponent("variantfield").on("focus", this.showInVariantWindow, this);
            this.getComponent("originalfield").on("focus", this.showInVariantWindow, this);
        } catch(e){
            lore.debug.anno("Error in EditorPanel:initComponent() - " + e, e);
        }
    },
    showInVariantWindow: function(){
      var rec = this.getRec();
      // show the variation window if user clicks on variant resource field
      lore.util.launchTab(rec.data.original); 
      lore.anno.controller.showSplitter(rec);  
    },
    /**
     * Set the preferences object to listen to event update for
     * @param {Object} prefObj
     */
    setPreferences: function(prefObj ) {
        this.prefs = prefObj;
        this.annomode = this.prefs.mode;
        this.metadataOntologyURL = this.prefs.metadataOntologyURL;
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
     * This is provided by Ext also, but this function contains
     * debug info
     * @return {Boolean}
     */
    isDirty: function () {
         var form = this.form;
         var dirtyList = [];
         var isDirty = false;
         form.items.each( function (item, index, length) {
             if ( item.isDirty()) {
                isDirty = true;
                dirtyList.push(item.getName());
             }
         });
         //lore.debug.anno("The dirty items are: " + dirtyList.join());
         return isDirty;
        
    },
    /**
     * Update the annotation xpath context
     * @param {Object} btn Not currently used
     * @param {Object} e Not currently used
     */
    handleUpdateAnnotationContext : function(){
        try {
            lore.anno.controller.updateAnnoFromForm();
            var editedRec = this.getRec();

            //lore.debug.anno('handleUpdateAnnotationContext', {tthis:this,editedRec:editedRec});

            // get text selection, and update the appropriate fields
            var currentCtxt = this.pageView.getCurrentSelection();

            editedRec.beginEdit();
            editedRec.set('context', currentCtxt);
            editedRec.set('resource', lore.anno.controller.currentURL);
            editedRec.endEdit();

            this.pageView.highlightCurrentAnnotation(editedRec);
        }
        catch (ex) {
            lore.debug.anno("Error updating anno context", ex);
        }
    },

    /**
     * Update the variation annotation xpath context
     * @param {Object} btn Not currently used
     * @param {Object} e Not currently used
     */
    handleUpdateAnnotationVariantContext : function(){
        try {
            lore.anno.controller.updateAnnoFromForm();
            var editedRec = this.getRec();
            // get text selection, and update the appropriate fields
            var currentCtxt = this.pageView.getCurrentSelection();

            editedRec.beginEdit();
            editedRec.set('variant', lore.anno.controller.currentURL);
            editedRec.set('variantcontext', currentCtxt);
            editedRec.endEdit();
        } catch (ex) {
            lore.debug.anno("Error updating anno variant context", ex);
        }
    },

    /**
     * Update the semantic selection
     */
    handleChangeMetaSelection : function () {
        try {
            lore.debug.anno("handleChangeMetaSelection()", {tthis:this});

            // load RDFa for page
            this.rdfaManager.load(lore.util.getContentWindow(window));

            var panel = this;

            // callback, when a triple is chosen. Update field with supplied triple.
            var setFormField = function (isObject, triple) {
                lore.anno.controller.updateAnnoFromForm();
                var editedRec = panel.getRec();

                lore.debug.anno('handleChangeMetaSelection callback', {editedRec:editedRec});
                editedRec.beginEdit();

                // TODO: check that the triple.property is rdf:type
                editedRec.set("semanticEntity", triple.subject.value.toString());
                editedRec.set("semanticEntityType", triple.object.value.toString());
                var metaselection = lore.util.getMetaSelection(triple);
                editedRec.set("context", metaselection.xp);

                editedRec.endEdit();

            };
            // show the triples on the page
            this.pageView.toggleTripleMarkers(setFormField);
        } catch (e) {
            lore.debug.anno("Error in handleChangeMetaSelection",e);
        }
    },

  updateSelectionField: function(contextFieldName, recUrl, recContext) {
      var urlsAreSame = lore.util.urlsAreSame;
      var ctxtFieldTxt = contextFieldName + 'txt';
      var ctxtField = this.form.findField(ctxtFieldTxt);

      if (urlsAreSame(recUrl, lore.anno.controller.currentURL)) {
          var selText = '';
          try {
              selText = lore.util.getSelectText(recContext, lore.util.getContentWindow(window).document);
          } catch (e) {}
      } else if (!lore.anno.ui.topView.variationContentWindowIsVisible() ){
          // when content is loaded in splitter, context field will be set
          this.pageView.updateSplitter(rec, false, this.updateSplitterContextField, this);
      }

      var backgroundColour = "inherit";
      backgroundColour = this.pageView.getCreatorColour(rec.data.creator);

      this.form.setValues([{
          id: contextFieldName,
          value: '"' + selText + '"'
      }]);
      ctxtField.getEl().setStyle("background-color", "inherit");
  },

    /**
     * Load record into the editor panel
     * @param {Record} rec The record to load
     */
    load: function(rec) {
        var urlsAreSame = lore.util.urlsAreSame;
        try {
            // display contents of context
            if (rec.data.context) {
// TODO: Actually use this next function
//              this.updateSelectionField('contextdisp', rec.data.original);
                var ctxtField = this.form.findField('contextdisptxt');
                if (urlsAreSame(rec.data.original, lore.anno.controller.currentURL)) {
                    var selText = '';
                    try {
                        selText = lore.util.getSelectionText(
                            rec.data.context, lore.util.getContentWindow(window).document);
                    } catch (e) {
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
                this.setVisibilityFormField(this.form,'contextdisp', false);

            } else {
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
                var ctxtField = this.form.findField('rcontextdisptxt');
                if (urlsAreSame(rec.data.variant, lore.anno.controller.currentURL)) {
                    var selText = '';
                    try {
                        selText = lore.util.getSelectionText(
                        rec.data.variantcontext, lore.util.getContentWindow(window).document);
                    } catch (e) {
                    }
                    this.form.setValues([{
                        id: 'rcontextdisptxt',
                        value: '"' + selText + '"'
                    }]);
                } else if ( !lore.anno.ui.topView.variationContentWindowIsVisible() ){
                    this.pageView.updateSplitter(rec, false, this.updateSplitterContextField, this); // when content is loaded in splitter
                                                        // context field will be set
                }
                ctxtField.getEl().setStyle("background-color", this.pageView.getCreatorColour(rec.data.creator));
                this.setVisibilityFormField(this.form,'rcontextdisp', false);
            } else {
                // otherwise empty
                var ctxtField = this.form.findField('rcontextdisptxt');
                this.form.setValues([{
                    id: 'rcontextdisptxt',
                    value: ""
                }]);
                ctxtField.getEl().setStyle("background-color", "inherit");
            }

            var meta = rec.get('meta');
            if (meta) {
                this.metaUserGrid.getStore().loadData(meta);
            }

            var semEntityField = this.form.findField('semanticEntity');
            if (rec.get('semanticEntityType')) {

                this.metaUserGrid.setVisible(true);
                this.metaUserGrid.setObjectType(this.metadataOntologyURL, rec.get("semanticEntityType"));

                semEntityField.getEl().setStyle("background-color", this.pageView.getCreatorColour(rec.data.creator));
            } else {
                semEntityField.getEl().setStyle("background-color", "inherit");
            }
            var val = rec.data.resource;

            if (rec.data.isReply) {
                // update fields for annotations that are replies
                var prec = lore.util.findRecordById(this.model, rec.data.about);
                if (prec) {
                    val = "'" + prec.data.title + "'";
                    if (!prec.data.isNew()) {
                        val += " ( " + rec.data.about + " )";
                    }
                } else {
                    val = '';
                                }
            }
            this.form.setValues([{ id: 'res', value: val }]);

            // hide context field if it is a reply
            if (rec.data.isReply) {
                this.form.findField('contextdisp').hide();
            } else {
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
     * @param {Object} cw Content Window
     * @param {Object} rec
     */
    updateSplitterContextField: function (cw, rec){
        // determine which context field to update
        // depending on whether it's for the original or
        // variant context for the variation annotation
    var urlsAreSame = lore.util.urlsAreSame;

        var fieldId = 'rcontextdisptxt';
        var ctx = rec.data.variantcontext;

        if (urlsAreSame(rec.data.variant, lore.anno.controller.currentURL)) {
            fieldId = 'contextdisptxt';
            ctx = rec.data.context;
        }

        var selText = '';

        try {
            selText = lore.util.getSelectionText(ctx, cw.document);
        }
        catch (e) {
            lore.debug.anno("Error getting selection text", e);
        }
        this.form.setValues([{
            id: fieldId,
            value: '"' + selText + '"'
        }]);
    },

    /**
     * Show the annotation editor.
     * @param {Record} rec  The record containing the annotation to show in the editor
     * @param {Boolean} showOnly (Optional) Disallow saving.
     */
    show: function(rec, showOnly){
        var saveBtn = Ext.getCmp('updannobtn');
        if (showOnly) {
            saveBtn.disable();
        } else {
            saveBtn.enable();
        }
        this.load(rec);
        lore.anno.ui.EditorPanel.superclass.show.apply(this);
    },

    /**
     * When the record is updated, update the editor
     * @param {Object} store     The data store
     * @param {Object} rec       The record
     * @param {Object} operation The operation performed
     */
    handleRecordUpdate: function (store, rec, operation ) {
        if ( this.rec == rec ) {
            this.load(rec);
        } else {
            lore.debug.anno("Editor received an updated event for a non-current annotation",
                {store:store,rec:rec,operation:operation});
        }
    },

    /**
     * Update the form when the annotation type changes
     * @param {Combo} combo The Combo field that has changed
     */
    handleAnnotationTypeChange: function(combo){
        var theVal = combo.getValue();

        if (theVal === 'Variation'){
            this.setAnnotationFormUI(true, false);
        } else if ( theVal === 'Austlit Metadata') {
            this.setAnnotationFormUI(false, true);
        } else if (theVal === 'Question' ||  theVal === 'Comment' || theVal === 'Explanation' ) {
            this.setAnnotationFormUI(false, false);
        }

        if (theVal !== 'Austlit Metadata') {
            this.pageView.turnOffPageTripleMarkers();
        }
    },

    /**
     * When the preferences changes, update editor UI
     * @param {Object} args
     */
    handlePrefsChanged: function(args) {
        // update scholarly fields
        if (this.isVisible())
                this.showScholarlyFields(args.mode === lore.constants.ANNOMODE_SCHOLARLY);

        this.metadataOntologyURL = args.metadataOntologyURL;

        this.annomode = args.mode;
    },

    /**
     * Hide list of form fields
     * @param {Form} form The form
     * @param {Array} fieldNameArr List of fields to hide
     */
    hideFormFields : function(form, fieldNameArr){
        for (var i = 0; i < fieldNameArr.length; i++) {
            this.setVisibilityFormField(form, fieldNameArr[i], true);
        }
    },
    /**
     * Show list of form fields
     * @param {Form} form The form
     * @param {Array} fieldNameArr List of fields to show
     */
    showFormFields : function(form, fieldNameArr){
        for (var i = 0; i < fieldNameArr.length; i++) {
            this.setVisibilityFormField(form,fieldNameArr[i], false);
        }
    },
    /**
     * Show/hide a field on a form
     * @param {Form} form The form
     * @param {String} fieldName The field name to set the visibility of
     * @param {Boolean} hide (Optional)Specify whether to hide the field or not. Defaults to false
     */
    setVisibilityFormField : function(form, fieldName, hide){
        
        var thefield = form.findField(fieldName);
        if (thefield) {
            var cont = thefield.container.up('div.x-form-item');
            
            if (hide) {
                thefield.hide();
                cont.setDisplayed(false);
            } else {
                thefield.show();
                cont.setDisplayed(true);
            }
        }
    },
    /**
     * Show or hide the Scholarly Annotation fields
     * @param {Boolean} show true to show the fields, false to hide them
     */
    showScholarlyFields: function(/*boolean*/show) {
        var scholarlyFields = ['importance', 'references'];

        if (show) {
            this.showFormFields(this.form, scholarlyFields);
            this.doLayout();
        } else {
            this.hideFormFields(this.form, scholarlyFields);
        }
    },



    /**
     * Show hide fields
     * @param {Boolean} variation Specify changes to UI for variation
     * @param {Boolean} rdfa Specify changes to UI for rdfa
     */
    setAnnotationFormUI : function(variation, rdfa) {
    try {
        var nonVariationFields = ['res'];
        var variationFields = ['original', 'variant', 'rcontextdisp', 'variationagent', 'variationplace', 'variationdate'];
        var rdfaFields = ['semanticselection'];
        var nonRdfaFields = ['body'];

        // hide/show fields depending on whether annotation is a scholarly annotation or not
        this.showScholarlyFields(this.annomode !== lore.constants.ANNOMODE_NORMAL);

        // variation
        if (variation) {
            this.hideFormFields(this.form, nonVariationFields);
            this.showFormFields(this.form, variationFields);
        } else {
            this.hideFormFields(this.form, variationFields);
            this.showFormFields(this.form, nonVariationFields);
        }

        // rdfa
        if (rdfa) {
            this.hideFormFields(this.form, nonRdfaFields);
            this.showFormFields(this.form, rdfaFields);
            this.metaUserGrid.setVisible(true);
        } else {
            this.hideFormFields(this.form, rdfaFields);
            this.showFormFields(this.form, nonRdfaFields);
            this.metaUserGrid.setVisible(false);
        }
        this.doLayout();
    } catch (e) {
        lore.debug.anno("Error in setAnnotationFormUI",e);
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
     * Copy the data in the MetaData Grid into the Record
     * @param {} metaStore The Store object from the Metadata Grid
     */
    updateRecMetaFields: function(metaStore) {
        var metaProps = [];
        metaStore.each(function (rec) {
            metaProps.push(rec.data);
        });
        this.rec.store.suspendEvents();
        this.rec.set('meta', metaProps);
        this.rec.store.resumeEvents();
    },

    resetPanel: function() {
        this.form.reset();
        this.metaUserGrid.reset();
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

    clearPanel: function() {
        this.rec = null;
    }

});

// register the component with Ext
Ext.reg("annoeditorpanel", lore.anno.ui.EditorPanel);
//Ext.reg("annoeditorpanel", 'lore.anno.ui.EditorPanel');
