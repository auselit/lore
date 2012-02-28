lore.anno.Controller = function(){
    this.lorevisible = false;
    this.currentURL;
}
Ext.apply(lore.anno.Controller.prototype, {
    /**
     * Show the annotations view. Notify of location change
     * if it happened and show page elements
     */
    show : function () {
        this.lorevisible = true;

        if (this.currentURL && this.currentURL != 'about:blank' && this.currentURL != '') {
            this.handleLocationChange(this.currentURL);
        }
        lore.anno.ui.pageui.setContentsVisible(true);
    },
    /**
     * Hide the annotations view
     */
    hide : function () {
        this.lorevisible = false;
        lore.anno.ui.pageui.setContentsVisible(false);
    },
    /** Helper function to create a view displayed in a closeable tab */
    openView : function(/*String*/panelid,/*String*/ paneltitle,/*function*/ activationhandler){
        var tab = Ext.getCmp(panelid);
        if (!tab) {
            tab = lore.anno.ui.views.add({
                'title': paneltitle,
                'id': panelid,
                'autoScroll': true,
                'closable': true
            });
            tab.on("activate", activationhandler);
        }
        tab.show();
    },
    /**
     * Disable or enable the annotations view
     * @param {Object} opts Object containing disable/enable options. Valid fields includes opts.disable_annotations
     */ 
    disableUIFeatures : function(opts){
        lore.debug.ui("LORE Annotations: disable ui features?", opts);
        this.disabled = opts;
        
        // don't set visibility on start up 
        if (!this.disableUIFeatures.initialCall) {
            this.disableUIFeatures.initialCall = 1;
        }
        else {
            lore.anno.ui.topView.setAnnotationsVisibility(!opts.disable);
        }
    },
    /**
     * Hide the variation splitter window
     */
    hideVariationSplitter : function () {
        lore.anno.ui.pageui.removeHighlightForCurrentAnnotation(lore.anno.ui.topView.getVariationContentWindow());
    },
    /**
     * Detemerine whether any annotations are modified
     */
    hasModifiedAnnotations : function () {
        this.updateAnnoFromForm();
        return lore.anno.annoMan.numUnsavedAnnotations() > 0;
    },
    /**
     * Get the currently selected image
     */
    getCurSelImage : function () {
        return lore.anno.ui.pageui.getCurSelImage();
    },
    /**
     * Get the currently edited annotation
     */
    getCurrentEditedAnno : function () {
        return lore.anno.ui.formpanel.getRec();
    },
    /**
     * Find a node with the given id
     * @param {Object} id
     * @param {Object} tree
     */
    findNode : function (id, tree) {
        if (tree) {
            return lore.util.findChildRecursively(tree, 'id', id);
        }
        var n = lore.util.findChildRecursively(lore.anno.ui.treeunsaved, 'id', id + "-unsaved");
        if (!n) n = lore.util.findChildRecursively(lore.anno.ui.treeroot, 'id', id);
        return n;
    },
    /**
     * Make node visible and selected in tree panel and show the editor panel
     * @param {Object} rec
     * @param {boolean} showOnly Disallow saving
     */
    selectAndShowNode : function (rec, showOnly) {
        var node = this.findNode(rec.data.id);
    
        // RESET THE FORM
        lore.anno.ui.formpanel.resetPanel();
    
        lore.anno.ui.page.setCurrentAnno(rec);
        if (node) {
            lore.anno.ui.formpanel.show(rec, showOnly);
            node.ensureVisible();
            node.select();
        }
        // Necessary due to a bug in Ext related to drawing text fields
        // Should be fixed in Ext 3.2.1
        Ext.getCmp("treeview").doLayout();
    },
    /**
     * Show the variation splitter for the current/supplied annotation
     * @param {Record} rec (Optional)The annotation to show in the splitter window. Defaults to currently
     * selected annotation
     */
    showSplitter : function (rec) {
        if (!rec) {
            rec = lore.anno.ui.page.getCurrentAnno();
        } else if (typeof(rec) == 'string') {
            rec = lore.anno.annoMan.findStoredRecById(rec);
        }
        var editor = lore.anno.ui.formpanel;
        lore.anno.ui.pageui.updateSplitter(rec, true, editor.updateSplitterContextField, lore.anno.ui.formpanel);
    },
    /**
     * Update the annotation context in the editor panel
     */
    handleUpdateAnnotationContext : function () {
        lore.anno.ui.formpanel.handleUpdateAnnotationContext();
        this.show();
        Ext.getCmp("treeview").doLayout();
    },
    /**
     * Update the variation annotation context in the editor panel
     */
    handleUpdateVariationAnnotationContext : function () {
        lore.anno.ui.formpanel.handleUpdateVariationAnnotationContext(lore.anno.ui.formpanel);
        this.show();
        Ext.getCmp("treeview").doLayout();
    },
    setPrefs : function (args) {
        lore.anno.prefs.setPrefs(args);
    },
    //////////////////////////////////////////////////////////////////////
    /* Form Editor Methods */
    //////////////////////////////////////////////////////////////////////
    /**
     * Hide the annotation editor
     */
    hideAnnotationEditor : function () {
        if (lore.anno.ui.formpanel.isVisible()) {
            lore.anno.ui.formpanel.hide();
            Ext.getCmp("treeview").doLayout();
        }
        lore.anno.ui.formpanel.clearPanel();
    },
    /**
     * Update the annotation object to use the values from the
     * form and generate an unsaved tree node if the record has been
     * modified.
     */
    updateAnnoFromForm : function () {
        var form = lore.anno.ui.formpanel.form;
    
    
        var unsavedRec = lore.anno.ui.formpanel.getRec();
    
        if (!unsavedRec) {
            return;
        }
    
        if (form.isDirty()) {
            if (unsavedRec.store === lore.anno.annoMan.annods) {
                lore.debug.anno("ERROR: Should never be trying to update Stored Recs!");
            }
        }
    
        form.updateRecord(unsavedRec); // update from form
    },
    /*
     * Event Handlers
     */
    
    /**
     * Update the enablement of the annotations when the preferences
     * change
     * @param {Object} args
     */
    handlePrefsChange : function (args) {
        if (!this.disableUIFeatures){
            lore.debug.anno("no disable ui features",this);
        }
        this.disableUIFeatures({
            disable: args.disable
        });
        lore.util.setHighContrast(window, args.high_contrast);
        var abtframe = Ext.get("about_anno");
        if (abtframe){
            lore.util.setHighContrast(abtframe.dom.contentWindow, args.high_contrast);
        }
        if (args.annorepostype == 'danno'){
            lore.anno.reposAdapter = new lore.anno.repos.DannoAdapter(args.url);
        } else if (args.annorepostype == 'lorestore'){
            lore.anno.reposAdapter = new lore.anno.repos.RestAdapter(args.url);
        }
        try{
            Ext.getCmp('solrsearch').ds.proxy.setUrl(args.solr + "/select",true);
        } catch (e){
            lore.debug.anno("Error updating solar pref",e);
        }
    },
    /**
     * Attach context menu to a node and, attach events to menu items when tree node is added
     * @param {TreePanel} tree Parent Tree
     * @param {TreeNode} parent Parent Node
     * @param {TreeNode} childNode The tree node to attach the events to
     * @param {Integer} index Index of Node in Tree
     */
    
    handleAttachAnnoCtxMenuEvents : function (tree, parent, childNode, index) {
        childNode.on('append', this.handleAttachAnnoCtxMenuEvents, this);
    
        childNode.on('contextmenu', function (node, e) {
            node.select();
            
    
            if (!node.contextmenu) {
                node.contextmenu = new Ext.menu.Menu({
                    id: node.id + "-context-menu"
                });
    
                var rec = lore.anno.annoMan.findStoredRecById(lore.anno.ui.nodeIdToRecId(node));
                var isNew = (rec === null || rec.data.isNew());
                if (!isNew) {
                    // only saved annotations should be able to be replied to
                    node.contextmenu.add({
                        text: "Reply to annotation",
                        icon: "../../skin/icons/anno/comments_add.png",
                        handler: function (evt) {
                            // FIXME: scoping
                            lore.anno.controller.handleReplyToAnnotation(node);
                        },
                        scope: this,
                        id: 'reply_' + node.id
                    });
                }
    
                node.contextmenu.add({
                    text: "Edit annotation",
                    icon: "../../skin/icons/anno/comment_edit.png",
                    handler: function (evt) {
                        // FIXME: scoping
                        lore.anno.controller.handleEdit(node);
                    },
                    id: 'edit_' + node.id
                });
    
                node.contextmenu.add({
                    text: "Delete annotation",
                    icon: "../../skin/icons/anno/comment_delete.png",
                    handler: function (evt) {
                        // FIXME: scoping
                        lore.anno.controller.handleDeleteAnnotation(node);
                    },
                    id: 'del_' + node.id
                });
    
                if (!isNew) {
                    // only saved annotations should be able to be added as a Resource Map
                    node.contextmenu.add({
                        text: "Add as node in Resource Map editor",
                        icon: "../../skin/icons/add.png",
                        handler: function (evt) {
                            try {
                                var rec = lore.anno.annoMan.findStoredRecById(lore.anno.ui.nodeIdToRecId(node));
                                lore.global.ui.compoundObjectView.get(window.instanceId).addResource(lore.anno.ui.nodeIdToRecId(node), {
                                    "rdf:type_0": rec.data.type
                                });
                            } catch (e) {
                                lore.debug.anno("Error adding node to compound editor", e);
                            }
                        }
                    });
                    node.contextmenu.add({
                        text: "View annotation in browser",
                        icon: "../../skin/icons/page_go.png",
                        handler: function (evt) {
                            lore.util.launchTab(node.id + "?danno_useStylesheet");
                        }
                    });
                    if (node.nodeType == lore.constants.NAMESPACES["vanno"] + "VariationAnnotation") {
                        node.contextmenu.add({
                            text: "Show Variation Window",
                            icon: "../../skin/icons/anno/application_tile_horizontal.png",
                            handler: function (evt) {
                                // FIXME: scope
                                lore.anno.controller.showSplitter(lore.anno.ui.nodeIdToRecId(node));
                            }
                        });
                    }
                }
            }
    
            node.contextmenu.on('hide', function unselectNode() {
                node.getOwnerTree().getSelectionModel().clearSelections();
            });
            node.contextmenu.showAt(e.xy);
        }, this);
    },
    /**
     * Attach links in the 'Views' column for a tree node
     * @param {TreePanel} tree Parent Tree
     * @param {TreeNode} parent Parent Node
     * @param {TreeNode} n The tree node to attach the events to
     * @param {Integer} index Index of node in tree
     */
    handleAttachNodeLinks : function (tree, thus, n, index) {
        try {
            var anno = lore.anno.annoMan.findStoredRecById(n.id).data;
    
            var nodeLinks = [{
                title: 'View annotation body in a new window',
                iconCls: 'anno-icon-launchWindow',
                jscript: "lore.util.launchWindow('" + anno.bodyURL + "',false, window);"
            }];
    
            if (lore.util.splitTerm(anno.type).term == 'VariationAnnotation') {
                nodeLinks.push({
                    title: 'Show Variation Window',
                    iconCls: 'anno-icon-splitter',
                    jscript: "lore.anno.ui.showSplitter('" + anno.id + "');"
                });
            }
            n.links = nodeLinks;
        } catch (e) {
            lore.debug.anno('Error in append', e);
        }
    },
    /**
     * When an annotation is selected in the tree this function is called. The annotation
     * is loaded into the form. It is highlighted on the current content window's document and if
     * it's a variation annotation the splitter is shown
     * @param {Node} node The tree node that was selected
     * @param {Object} event Not Used
     */
    handleTreeNodeSelection : function (node, event) {
        // retrieve record for node
        var unsavedNode = node.isAncestor(lore.anno.ui.treeunsaved);
        var recId = lore.anno.ui.nodeIdToRecId(node);
        var rec = unsavedNode ? lore.anno.annoMan.findUnsavedRecById(recId) : lore.anno.annoMan.findStoredRecById(recId);
    
        if (rec == lore.anno.ui.page.getCurrentAnno()) return;
    
        this.updateAnnoFromForm();
    
        if (rec == null) { // if they select root element, if it's shown
            lore.anno.ui.page.setCurrentAnno();
            return;
        }
    
        // set current anno and fire anno change event
        lore.anno.ui.page.setCurrentAnno(rec);
    
        Ext.getCmp("treeview").doLayout();
    },
    handleTabChange : function(browser) {
        var currentURL = browser.currentURI.spec;
    
        lore.anno.ui.page.load(currentURL);
    },
    /**
     * Notification function called when a change in location is detected in the currently
     * selected tab
     * @param {String} contextURL The url the currently selected browser tab is now pointing to
     */
    handleLocationChange : function (contextURL) {
        var oldurl = this.currentURL + '';
        this.currentURL = contextURL;
        // only run when annotations are visible and initialised
        if (!this.initialized || !this.lorevisible) return;
    
        lore.debug.anno("handleLocationChange: The uri is " + this.currentURL);
        
        try {
            // store current page data, save current annotation data
            lore.anno.ui.page.store(oldurl);
            this.updateAnnoFromForm();
    
            // tag any unsaved annotations
            this.tagUnsavedAnnotations();
    
            // load new URL's page info
            lore.anno.ui.page.load(contextURL);
    
            // enable highlighting for the page
            lore.anno.ui.pageui.enableImageHighlighting();
    
            lore.anno.annoMan.clearAnnotationStore();
    
            // Do we have a valid URL to annotate
            if (contextURL.indexOf('http') == 0) {
                //  load annotations for the page
                lore.anno.ui.loreInfo("Loading annotations for " + contextURL);
                lore.anno.annoMan.updateAnnotationsSourceList(contextURL);
            }
        } catch (e) {
            lore.debug.anno("Error in handleLocationChange", e);
        }
    },
    /**
     * Reloads all the annotations for the current page
     */
    refreshAnnotations : function() {
        lore.debug.anno("refresh annotations");
        this.handleLocationChange(this.currentURL);
    },
    /**
     * Checks the server for any private annotations on the current page, and 
     * if there are any, loads them.
     */
    loadAnyPrivateAnnosForPage : function() {
        if (this.lorevisible){
            lore.anno.annoMan.updateAnnotationsSourceList(this.currentURL, function (anno) {
                return anno.privateAnno;
            });
        }
    },
    /**
     * Update the label on any unsaved annotations, to indicate they are for
     * a different page.
     */
    tagUnsavedAnnotations : function () {
        lore.anno.annoMan.annodsunsaved.each(function (rec) {
            try {
                var node = this.findNode(rec.data.id + "-unsaved", lore.anno.ui.treeunsaved);
                if (!node) {
                    lore.debug.anno("modified/new annotation not found in unsaved "
                            + "tree. This is incorrect. " + rec.data.id, rec.data);
                    return;
                }
    
                var label = ' ';
                if (!lore.util.urlsAreSame(rec.data.resource, this.currentURL)) {
                    label = "Unsaved annotation from " + rec.data.resource;
                }
                node.setText(rec.data.title, label, null, lore.anno.ui.genTreeNodeText(rec.data));
            } catch (e) {
                lore.debug.anno("Error in tagUnsavedAnnotations", e);
            }
        });
    },
    handleAnnotationsLoaded : function (numLoaded) {
        if (numLoaded > 0) {
            lore.anno.ui.tabpanel.activate('treeview');
        }
        this.selectUpdatedAnnotation();
    },
    selectUpdatedAnnotation : function(){
        // try to find annotation that was most recently created/updated/searched for and select it
        try{
            var justUpdated = lore.anno.annoMan.justUpdated;
            if (justUpdated){
                var node = this.findNode(justUpdated, lore.anno.ui.treeroot);
                if (node) {
                    delete lore.anno.annoMan.justUpdated;
                    var rec = lore.anno.annoMan.findStoredRecById(justUpdated);
                    node.ensureVisible();
                    node.select();
                    lore.anno.ui.page.setCurrentAnno(rec);
                }
            }
        } catch (ex){
            lore.debug.anno("Error selecting updated annotation",ex);
        }
    },
    handleAnnotationRepliesLoaded : function(){
       this.selectUpdatedAnnotation();
    },
    /**
     * When the page is refreshed, clear page data, re-enable highlighting
     * and clear the currently selected annotation
     */
    handleContentPageRefresh : function () {
        lore.debug.anno("Page refreshed");
    
        try {
            lore.anno.ui.page.setCurrentAnno();
            lore.anno.ui.page.clear();
            lore.anno.ui.pageui.enableImageHighlighting();
            Ext.getCmp("annosourcestree").getSelectionModel().clearSelections();
        } catch (e) {
            lore.debug.anno("Error in refreshPage()", e);
        }
    },
    /*
     * topView Toolbar Handlers
     */
    
    /*
     * Handlers
     */
    
    
    
    /**
     * Retrieve the currently selected text and, create a new annotation in
     * the local store
     * @param {Record} rec (Optional) The parent annotation record. Defaults to null. A supplied record implies this annotation is a Reply annotation.
     */
    handleAddAnnotation : function (rec) {
        try {
            var currentContext = "";
            lore.debug.anno('handleAddAnnotation()', { rec: rec });
    
            if (!rec) { // only get selected text for annotations that aren't replies
                try {
                    // get text currently selected in the content window
                    currentContext = lore.anno.ui.pageui.getCurrentSelection();
                } catch (e) {
                    lore.debug.anno("Error: exception creating xpath for new annotation", e);
                }
            }
    
            // update the currently selected annotation before the focus is taken off it
            // for the newly created annotation
            this.updateAnnoFromForm();
    
            // once the node for this new annotation is added, select it.
            var addSelectNodeHandler = function (anno) {
                try {
                    lore.anno.ui.treeunsaved.on('append', function selectNode(tree, parent, node) {
    
                        if (lore.anno.ui.nodeIdToRecId(node) == anno.id) {
                            window.setTimeout(function () {
                                node.ensureVisible();
                                node.select();
                            }, 100);
                        }
                        lore.anno.ui.treeunsaved.un('append', selectNode);
                    });
                } catch (e) {
                    lore.debug.anno("Error in addSelectNodeHandler", e);
                }
            };
    
            lore.anno.am.runWithAuthorisation(function() {
                // FIXME: scoping
                var newRec = lore.anno.annoMan.addAnnotation(currentContext, 
                lore.anno.controller.currentURL, addSelectNodeHandler, rec);
                lore.anno.controller.selectAndShowNode(newRec);
            });
        } catch (e) {
            lore.debug.anno("Error in handleAddAnnotation", e);
        }
    },






    /**
     * Delete the currently selected annotation, requesting confirmation from user
     */
    handleDeleteAnnotation : function (node) {
        var rec, unsaved;
        // find rec, and work out if a saved or unsaved anno
        if (node && node.isAncestor) { // request comes from clicking on tree
            if (node.isAncestor(lore.anno.ui.treeunsaved)) {
                rec = lore.anno.annoMan.findUnsavedRecById(lore.anno.ui.nodeIdToRecId(node));
            } else {
                rec = lore.anno.annoMan.findStoredRecById(lore.anno.ui.nodeIdToRecId(node));
            }
        } else { // request comes from toolbar or editor delete button
            if (!lore.anno.ui.page.getCurrentAnno()) {
                lore.anno.ui.loreWarning("Nothing selected to delete.");
                lore.debug.anno("Nothing selected to delete.");
                return;
            }
            rec = lore.anno.ui.page.getCurrentAnno();
        }
    
        // don't need to prompt, just delete, since it's an unsaved annotation
        if (rec.store == lore.anno.annoMan.annodsunsaved) {
            lore.anno.annoMan.annodsunsaved.remove(rec);
            lore.anno.ui.page.setCurrentAnno();
            this.hideAnnotationEditor();
            return;
        }
    
        // show confirmation pop-up
        var msg = 'Are you sure you want to delete the "' + rec.data.title + '" annotation forever?';
        if (rec.data.hasChildren()) {
            //msg = "Are you sure you want to delete this annotation and its REPLIES forever?";
            lore.anno.ui.loreError("Delete the replies for this annotation first.");
            return;
        }
    
        lore.anno.am.runWithAuthorisation(function (principal) {
            if (!rec.data.agentId || principal.primaryUri === rec.data.agentId) {
                Ext.MessageBox.show({
                    title: 'Delete annotation',
                    msg: msg,
                    buttons: Ext.MessageBox.YESNO,
                    fn: function (btn) {
                        if (btn == 'yes')
                        // FIXME: scoping
                            lore.anno.controller.handleDeleteAnnotation2(rec);
                    },
                    icon: Ext.Msg.QUESTION
                });
            } else {
                lore.debug.anno("Cannot delete annotation",[principal, rec.data.agentId]);
                lore.anno.ui.loreWarning('Annotation belongs to another user, cannot delete.');
            }
        });
    },
    
    /**
     * Delete currently selected annotation
     */
    handleDeleteAnnotation2 : function (rec) {
        try {
            lore.debug.anno("deleting " + rec);
    
            lore.anno.annoMan.deleteAnnotation(rec, function (result, resultMsg) {
                if (result == 'success') {
                    lore.debug.anno('Annotation deleted', resultMsg);
                    lore.anno.ui.loreInfo('Annotation deleted');
                }
                else {
    
                    lore.anno.ui.loreError('Unable to delete annotation');
                }
            });
    
    
            if (rec === lore.anno.ui.page.getCurrentAnno()) {
                lore.anno.ui.page.setCurrentAnno();
                this.hideAnnotationEditor();
            }
        }
        catch (ex) {
            lore.debug.anno("Error: Exception when deleting annotation", ex);
            lore.anno.ui.loreWarning("Unable to delete annotation");
        }
    },
    
    
    /**
     * Save all annotation changes
     * @param {Object} uri Not currently used
     */
   handleSaveAllAnnotationChanges : function (uri) {
        try {
    
            // update existing annotation if needed before saving occurs
            var unsavedRec = lore.anno.ui.formpanel.getRec();
            lore.anno.annoMan.updateStoredRec(unsavedRec);
    
            if (lore.anno.ui.page.getCurrentAnno().data.isNew()) lore.anno.ui.page.setCurrentAnno(); // if new, this will be saved and removed from unsaved tree, so set current anno to blank
            lore.anno.annoMan.updateAllAnnotations(this.currentURL);
    
        }
        catch (e) {
            lore.debug.anno("Error in handleSaveAllAnnotationChanges", e);
        }
    },
    
    handleCommittedAnnotation : function (action, anno) {
        lore.anno.ui.loreInfo('Annotation ' + action + 'd.');
        this.hideAnnotationEditor();
        lore.debug.anno(action + 'd ' + anno.data.title, anno);
    },
    
    handleServerError : function (action, response) {
        lore.anno.ui.loreError('Unable to ' + action + ' annotation');
        lore.debug.anno('Unable to ' + action + ' annotation', {
            response: response,
            headers: response.getAllResponseHeaders()
        });
    
        if (response.status == 401) { // Unauthorized
            var challenge = response.getResponseHeader('WWW-Authenticate');
            lore.debug.anno('Required auth: ' + challenge, challenge);
    
            var res = challenge.match(/Redirect\s+(.+)/);
    
            if (!res) {
                lore.debug.anno("Cannot handle authentication request: " + challenge);
                return;
            }
            var winOpts = 'height=250,width=470,top=200,left=250,resizable,scrollbars=yes,dependent=yes';
    
            var loginUrl = res[1] + '?spring-security-redirect=' + lore.anno.prefs.loginUrl;
            lore.debug.anno('Opening login window: ' + loginUrl);
    
    //        var loginwindow = window.openDialog(loginUrl, 'lore_login_window', winOpts);
            var loginwindow = window.openDialog("../../content/loginWindow.xul", 'lore_login_window', winOpts,
                                                {initURL:loginUrl});
    
            lore.debug.anno('created loginwindow', {loginwindow:loginwindow,wind:window});
        }
    },
    
    /**
     * Save the currently selected annotation
     */
    handleSaveAnnotationChanges : function () {
        try {
            this.updateAnnoFromForm();
    
            var anno = lore.anno.ui.formpanel.getRec();
    
            if (!anno) {
                lore.anno.ui.loreError('No annotation selected to save! - SHOULD BE IMPOSSIBLE');
                return;
            }
    
            if (!anno.data.isNew() && !lore.anno.ui.formpanel.isDirty() && !anno.dirty) {
                lore.anno.ui.loreWarning('Annotation content was not modified, save will not occur.');
                return;
            }
    
            lore.debug.anno('handleSaveAnnotationChanges', {
                tthis: this,
                lore: lore,
                anno: anno
            });
            if (!lore.anno.ui.formpanel.form.isValid()) {
                lore.anno.ui.loreError('Annotation title required.');
                return;
            }
    
            // update anno with properties from form
            lore.anno.annoMan.updateStoredRec(anno);
    
    
            // if the record isn't found on the current page tree and it's a variation annotation
            // then need update to tree as it should appear once the save is complete
            var refresh = anno.data.type == (lore.constants.NAMESPACES["vanno"] + "VariationAnnotation") && (lore.anno.ui.findNode(anno.data.id, lore.anno.ui.treeroot) == null);
    
    
            lore.anno.annoMan.persistAnnotation(anno, this.currentURL, refresh);
            lore.anno.ui.page.setCurrentAnno();
        }
        catch (e) {
            lore.debug.anno("Error updating saving annotation", e);
        }
    },
    
    
    
    /**
     * Add the annotations for the selected search result rows to the Resource Map editor
     * @param {Object} recs Records to add
     */
    handleAddResultsToCO : function (recs) {
        try {
            for (var i = 0; i < recs.length; i++) {
                var rec = recs[i];
                // temporary fix for solr search not returning type
                var rdftype = rec.get("type");
                if (!rdftype && !rec.get("resource")){
                    rdftype = "http://www.w3.org/2001/03/thread#Reply";
                } else if (!rdftype) {
                    rdftype = "http://www.w3.org/2000/10/annotation-ns#Annotation";
                }
                lore.global.ui.compoundObjectView.get(window.instanceId).addResource(rec.get("id"), {
                    "rdf:type_0": rdftype,
                    "dc:title_0": rec.get("title")
                });
            }
        } catch (e) {
            lore.debug.anno("Error adding annotation/s to compound editor", e);
        }
    },
    
    handleViewAnnotationInBrowser : function (recs) {
        try {
            for (var i = 0; i < recs.length; i++) {
                var rec = recs[i];
                lore.util.launchTab(rec.data.id + "?danno_useStylesheet");
            }
        } catch (e) {
            lore.debug.anno("Error viewing annotation/s in browser", e);
        }
    },
    
    /**
     * Toggle on and off the annotation highlighting for all annotations
     */
    handleToggleAllAnnotations : function () {
        lore.anno.ui.pageui.toggleAllAnnotations();
    },
    
    
    /**
     * Reply to the currently selected annotation. Add the reply to the local store.
     */
    handleReplyToAnnotation : function (node) {
        try {
            var rec = lore.anno.ui.page.getCurrentAnno();
    
            if (!rec && node) {
                rec = lore.anno.annoMan.findStoredRecById(lore.anno.ui.nodeIdToRecId(node));
            }
    
            if (!rec) {
                lore.anno.ui.loreWarning("Nothing selected to reply to");
                lore.debug.anno("Couldn't find record to reply to", node);
                return;
            }
    
            if (rec.data.isNew()) {
                lore.anno.ui.loreError("Save the annotation first before replying to it.");
                return;
            }
    
            lore.anno.am.runWithAuthorisation(function () {
                lore.anno.ui.tabpanel.activate('treeview');
                // FIXME: scoping
                lore.anno.controller.handleAddAnnotation(rec);
            });
        } catch (e) {
            lore.debug.anno("Error in handleReplyToAnnotation", e);
        }
    },
    
    
    /**
     * When the a node in the tree view is double clicked, load the annotation in the form editor and show the editor. 
     * 
     * @param {Object} node  The tree node
     */
    handleEdit : function (node) {
        try {
            var rec;
    
            this.updateAnnoFromForm();
    
            if (node.isAncestor(lore.anno.ui.treeunsaved)) {
                rec = lore.anno.annoMan.findUnsavedRecById(lore.anno.ui.nodeIdToRecId(node));
            } else {
                rec = lore.anno.annoMan.findStoredRecById(lore.anno.ui.nodeIdToRecId(node));
            }
    
    
            lore.anno.am.runWithAuthorisation(function (principal) {
                if (principal.primaryUri === rec.data.agentId || !rec.data.agentId) {
                    rec = lore.anno.annoMan.editRec(rec);
                    // FIXME: scoping
                    lore.anno.controller.selectAndShowNode(rec);
                } else {
                    lore.anno.ui.loreWarning('Annotation belongs to another user, saving disabled.');
                    this.selectAndShowNode(rec, true);
                }
            });
        } catch (e) {
            lore.debug.anno("Error in handleEdit", e);
        }
    },
    
    /**
     * Serialize the annotations on the page into the supplied format to a file.  Opens a save as
     * dialog to allow the user to select the file path.
     * @param {String} format The format to serialize the annotations into. 'rdf' or 'wordml'.
     */
    handleSerialize : function (format) {
        var fileExtensions = {
            "rdf": "xml",
            "wordml": "docx",
            "oac": "xml",
            "oactrig": "txt"
        };
        if (!format) {
            format = "rdf";
        }
        try {
            this.updateAnnoFromForm();
            if (format == "wordml"){
                var wExp = new lore.exporter.WordExporter();
                var docxData = lore.anno.annoMan.serialize(format);
                wExp.createWordFile(docxData.docxml, docxData.rels);
            } else {
                lore.util.writeFileWithSaveAs("Export Annotations (for current page) as", 
                    fileExtensions[format], 
                    function (savecb) {
                        var fobj = savecb(lore.anno.annoMan.serialize(format));
                        if (fobj) {
                            lore.anno.ui.loreInfo("Annotations exported to " + fobj.fname);
                        } else {
                            lore.anno.ui.loreInfo("Unable to save annotations to file");
                        }
                    }, 
                    window
                );
            }
        } catch (e) {
            lore.debug.anno("Error exporting annotations", e);
            lore.anno.ui.loreError("Error exporting annotations: " + e);
        }
    },
    
    /**
     * When the 'Hide Editor' button is clicked, update the annotation from the form, then hide the editor.
     */
    handleHideAnnotationEditor : function () {
        this.updateAnnoFromForm();
        this.hideAnnotationEditor();
    },
    
    handleCancelEditing : function () {
        var rec = lore.anno.ui.formpanel.getRec();
        lore.anno.annoMan.annodsunsaved.remove(rec);
        lore.anno.ui.page.setCurrentAnno();
        lore.anno.ui.pageui.turnOffPageTripleMarkers();
        this.hideAnnotationEditor();
        return;
    }
    
});
