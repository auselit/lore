/**
 * @class lore.ore.Controller Handles user actions (many triggered from toolbar, menus in overlay.js) and updates model and ui
 * */
lore.ore.Controller = function(config){
    /** The URL of the active tab in the main web browser */
    this.currentURL = config.currentURL || "";
    /** Indicates whether the controller is actively responding to user actions (it is not active when LORE is closed) */
    this.active = false;
    /** The name of the default creator used for new Resource Maps (from preferences) */
    this.defaultCreator = "Anonymous";
    /** @private The URL for which related Resource Maps were most recently loaded */
    this.loadedURL;
    /** Property name displayed for the Resource Map identifier */
    this.REM_ID_PROP = "Resource Map ID";
    this.isDirty = false;
    this.wasClean = true;
    this.MAXSIZE = 300;
    this.MAXCONNECTIONS = 45;
};
Ext.apply(lore.ore.Controller.prototype, {
    /** Respond to authenticated events from AuthManager */
    onAuthErrorOrCancel : function(){
      if (Ext.MessageBox.isVisible()){
          //lore.ore.ui.vp.error("Action cancelled");
          Ext.MessageBox.hide();  
      }
    },
    setDirty: function(){
      if (this.isDirty){
        this.wasClean = false;
      }
      // Force isDirty to be set
      this.isDirty  = true;
      Ext.getCmp('currentCOSavedMsg').setText('*');
    },
    rollbackDirty: function(){
      if (this.wasClean) { 
        // TODO: step backwards in shared undo stack instead 
        this.isDirty = false;
        Ext.getCmp('currentCOSavedMsg').setText('');
      }
    },
    /** Activate Controller and trigger related Resource Maps to be fetched when lore Resource Maps panel is shown */
    onShow: function(){
        this.active = true; 
        if (this.currentURL && this.currentURL != 'about:blank' && this.currentURL != '' &&
        (!this.loadedURL || this.currentURL != this.loadedURL)) {
            if (lore.ore.reposAdapter){
                lore.ore.reposAdapter.getCompoundObjects(this.currentURL);
            }
            this.loadedURL = this.currentURL;
        }
    },
    /** Deactivate controller */
    onHide: function(){
        this.active = false;
    },
    loadCompoundObjectPromptForURL: function(){
        Ext.Msg.show({
            title : 'Load from RDF/XML URL',
            buttons : Ext.MessageBox.OKCANCEL,
            msg : 'Please enter the URL of the Resource Map:',
            scope: this,
            fn : function(btn, theurl) {
                if (btn == 'ok') {
                    this.loadCompoundObjectFromURL(theurl);
                }
            },
            prompt : true
        });
    },
    /**
     * Loads a Resource Map from a RDf/XML file via URL 
     * @param {String} rdfURL The direct URL to the RDF (eg restful web service on repository that returns RDF)
     */
    loadCompoundObjectFromURL: function(rdfURL){
        try{
            
            // Check if the currently loaded Resource Map has been modified and if it has prompt the user to save changes
            var currentCO = lore.ore.cache.getLoadedCompoundObject();
            if (currentCO && currentCO.isDirty() && !this.readOnly){
                Ext.Msg.show({
                    title : 'Save Resource Map?',
                    buttons : Ext.MessageBox.YESNOCANCEL,
                    msg : 'Would you like to save the current Resource Map before proceeding?',
                    fn : function(btn) {
                        if (btn === 'yes') {
                            var currentCO = lore.ore.cache.getLoadedCompoundObject();
                            // TODO: #56 check that the save completed successfully 
                            lore.ore.reposAdapter.saveCompoundObject(currentCO,function(remid){
                                lore.ore.controller.afterSaveCompoundObject(remid);
                                 Ext.MessageBox.show({
                                        msg: 'Loading Resource Map',
                                        width:250,
                                        defaultTextHeight: 0,
                                        closable: false,
                                        cls: 'co-load-msg'
                                 });
                                 if (lore.ore.reposAdapter){
                                     lore.ore.reposAdapter.loadCompoundObject(rdfURL, lore.ore.controller.loadCompoundObject, lore.ore.controller.afterLoadCompoundObjectFail);
                                 } 
                            });
                            
                        } else if (btn === 'no') {
                            Ext.MessageBox.show({
                                msg: 'Loading Resource Map',
                                width:250,
                                defaultTextHeight: 0,
                                closable: false,
                                cls: 'co-load-msg'
                         });
                         if (lore.ore.reposAdapter){
                             lore.ore.reposAdapter.loadCompoundObject(rdfURL, lore.ore.controller.loadCompoundObject, lore.ore.controller.afterLoadCompoundObjectFail);
                         }
                        }
                    }
                });
            } else {
                Ext.MessageBox.show({
                        msg: 'Loading Resource Map',
                        width:250,
                        defaultTextHeight: 0,
                        closable: false,
                        cls: 'co-load-msg'
                 });
                 if (lore.ore.reposAdapter){
                     lore.ore.reposAdapter.loadCompoundObject(rdfURL, this.loadCompoundObject, this.afterLoadCompoundObjectFail);
                 }
            }
    
        } catch (e){
            lore.debug.ore("Error in loadCompoundObjectFromURL",e);
        }
        
    },
    bindViews: function(co){
        lore.ore.ui.graphicalEditor.bindModel(co);
        Ext.getCmp("remlistview").bindModel(co);
        lore.ore.ui.grid.bindModel(co);
    },
    /**
     * Load a Resource Map into LORE
     * @param {} rdf XML doc or XML HTTP response containing the Resource Map (RDF/XML)
     */
    loadCompoundObject : function(rdf) {
        try {
            var getDatatype = function(propname, propvalue) {
                var dtype = propvalue.datatype;
                if (dtype && dtype._string == "http://purl.org/dc/terms/W3CDTF") {
                    dtype = "date";
                } else if (dtype
                        && dtype == lore.constants.NAMESPACES["layout"]
                                + "escapedHTMLFragment") {
                    dtype = "html";
                } else {
                    dtype = "plainstring";
                    // Allow formatting for some fields
                    if (propname == "dcterms:abstract"
                            || propname == "dc:description") {
                        dtype = "string";
                    }
                }
                return dtype;
            };
            var showInHistory = false;

            // reset the graphical view
            lore.ore.ui.graphicalEditor.initGraph();
            var rdfDoc;
            if (typeof rdf != 'object') {
                rdfDoc = new DOMParser().parseFromString(rdf, "text/xml");
            } else {
                showInHistory = true;
                rdfDoc = rdf.responseXML;
            }
            // lore.debug.timeElapsed("creating databank");
            var databank = jQuery.rdf.databank();
            for (ns in lore.constants.NAMESPACES) {
                databank.prefix(ns, lore.constants.NAMESPACES[ns]);
            }
            databank.load(rdfDoc);
            var loadedRDF = jQuery.rdf({
                        databank : databank
            });
            // Display the properties for the Resource Map
            var remQuery = loadedRDF.where('?aggre rdf:type ore:Aggregation')
                    .where('?rem ore:describes ?aggre');
            var aggreurl, remurl;
            var res = remQuery.get(0);
            var isPrivate = false;
            
            if (res) {
                remurl = res.rem.value.toString();
                aggreurl = res.aggre.value.toString();
                this.loadedCO = new lore.ore.model.CompoundObject();
                this.loadedCO.load({
                            format : 'application/rdf+xml',
                            content : rdfDoc
                });
                if (this.loadedCO.properties.getProperty(lore.constants.NAMESPACES["lorestore"] + "isLocked")){
                    lore.ore.controller.setLockCompoundObject(true);
                } else {
                    lore.ore.controller.setLockCompoundObject(false);
                }
                isPrivate = this.loadedCO.properties.getProperty(lore.constants.NAMESPACES["lorestore"] + "isPrivate");
                lore.ore.cache.add(remurl, this.loadedCO);
                lore.ore.cache.setLoadedCompoundObjectUri(remurl);
                lore.ore.cache.setLoadedCompoundObjectIsNew(false);
                lore.ore.cache.setLoadedCompoundObjectUri(remurl);
                lore.ore.controller.bindViews(lore.ore.cache.getLoadedCompoundObject());
                
            } else {
                lore.ore.ui.vp.warning("No Resource Map found");
                lore.debug.ore("Error: no remurl found in RDF", loadedRDF);
                return;
            }

            // lore.debug.timeElapsed("create figure for each resource ");
            // create a node figure for each aggregated resource, restoring the layout
            var counter = 0;
            var numResources = 
            loadedRDF.where('<' + aggreurl + '> ore:aggregates ?url')
                    .optional('?url layout:x ?x')
                    .optional('?url layout:y ?y')
                    .optional('?url layout:width ?w')
                    .optional('?url layout:height ?h')
                    .optional('?url layout:originalHeight ?oh')
                    .optional('?url layout:highlightColor ?hc')
                    .optional('?url layout:orderIndex ?order')
                    .optional('?url layout:abstractPreview ?abstractPreview')
                    .optional('?url layout:isPlaceholder ?placeholder')
                    .optional('?url dc:format ?format')
                    .optional('?url rdf:type ?rdftype')
                    .optional('?url dc:title ?title')
                    .each(function() {
                        var resourceURL = this.url.value.toString();
                        var fig;
                        var opts = {
                            batch : true,
                            url : resourceURL
                        };
                        if (this.x && this.y) {
                            for (prop in this) {
                                if (prop != 'url' && prop != 'format'
                                        && prop != 'rdftype' && prop != 'title'
                                        && prop != 'hc') {
                                    opts[prop] = parseInt(this[prop].value);
                                } else {
                                    opts[prop] = this[prop].value.toString();
                                }
                            }
                            if (opts.x < 0) {
                                opts.x = 0;
                            }
                            if (opts.y < 0) {
                                opts.y = 0;
                            }
                        }
                        if (counter < lore.ore.controller.MAXSIZE){
                         fig = lore.ore.ui.graphicalEditor.addFigure(opts);
                        }
                        counter++;
                    });
            var ccounter = 0;
            // iterate over all predicates to create node connection figures
            loadedRDF.where('?subj ?pred ?obj')
            .filter(function() {
                // filter out the layout properties and predicates about the
                // resource map as well as literals
                if (this.pred.value.toString()
                        .match(lore.constants.NAMESPACES["layout"])
                        || this.pred.value.toString() === (lore.constants.NAMESPACES["dc"] + "format")
                        || this.subj.value.toString().match(remurl)) {
                    return false;
                } else {
                    return true;
                }
            }).each(function() {
                
                var connopts = {
                    subject: this.subj.value.toString(),
                    obj : this.obj.value.toString(),
                    pred: this.pred.value.toString()
                };
                
                if (ccounter <= lore.ore.controller.MAXCONNECTIONS){
                    var fig = lore.ore.ui.graphicalEditor.addConnection(connopts);
                    if (fig) {
                        ccounter ++;
                    }
                }
                
                
            });
            
            // Temporary workaround to set drawing area size on load
            // problem still exists if a node is added that extends the boundaries
            lore.ore.ui.graphicalEditor.coGraph.resizeMask();

            lore.ore.ui.vp.info("Loading Resource Map");
            if (counter > lore.ore.controller.MAXSIZE){
                lore.ore.ui.vp.error("Resource Map is too big for LORE graphical editor! " + (counter - lore.ore.controller.MAXSIZE) + " resources not shown");
            }
            if (ccounter >= lore.ore.controller.MAXCONNECTIONS){
                lore.ore.ui.vp.error("Resource Map has too many connections for graphical editor! Some connections not displayed");
            }
            Ext.Msg.hide();
            
            // preload nested Resource Maps to cache
            lore.ore.cache.cacheNested(loadedRDF, 0);
            
            // lore.ore.populateResourceDetailsCombo();
            // lore.debug.timeElapsed("show in history");
            if (showInHistory) {
                var title = lore.ore.ui.grid.getPropertyValue("dc:title")
                        || lore.ore.ui.grid.getPropertyValue("dcterms:title");
                if (!title) {
                    title = "Untitled";
                }
                lore.ore.historyManager.addToHistory(remurl, title, (isPrivate && isPrivate.value == true ? true: false));
            }
            if (lore.ore.ui.topView
                    && lore.ore.ui.graphicalEditor.lookup[lore.ore.controller.currentURL]) {
                lore.ore.ui.topView.hideAddIcon(true);
            } else if (lore.ore.ui.topView) {
                lore.ore.ui.topView.hideAddIcon(false);
            }
            // lore.debug.timeElapsed("done");
            var readOnly = !remurl.match(lore.ore.reposAdapter.idPrefix);
            Ext.getCmp('currentCOMsg').setText(
                    Ext.util.Format.ellipsis(title, 50)
                            + (readOnly ? ' (read-only)' : ''), false);
            Ext.getCmp("currentCOSavedMsg").setText("");
            lore.ore.controller.isDirty = false;
            lore.ore.controller.wasClean = true;
            lore.debug.ore("Loaded Resource Map", lore.ore.cache.getLoadedCompoundObject().serialize('rdf'));
        } catch (e) {
            lore.ore.ui.vp.error("Error loading Resource Map");
            lore.debug.ore("Error loading RDF from string", e);
            lore.debug.ore("the RDF string was", rdf);
            lore.debug.ore("the serialized databank is", databank.dump({
                                format : 'application/rdf+xml',
                                serialize : true
            }));
        }
    },
    /** Lookup a label for a tag */
    lookupTag: function(tagId){
        var store = lore.anno.thesaurus;
        // TODO : it should not be necessary to unescape ampersands: check that model is not storing them
        var idx = store.findUnfiltered('id', tagId.replace(/&amp;/g,'&'));
        if (idx >= 0){
           var tagRec = store.getAtUnfiltered(idx);
           var name = tagRec.get('name');
           if (name){
                return name;
           } 
        }
        return tagId;
    },
    /** Get a class for resource type */
    lookupIcon: function(type, userDefined){
       var iconCls = "pageicon";
       if (!type){
            return iconCls;
       }
       if (type.value){
        type = type.value.toString();
       }
       if (userDefined){
            if (type.match("Moving")){
                iconCls = "videoicon";
            } else if (type.match("Image")){
                iconCls = "imageicon";
            } else if (type.match("Sound")){
                iconCls = "audioicon";
            } else if (type.match("PhysicalObject")){
                iconCls = "objicon";
            } else if (type.match("Text")){
                iconCls = "texticon";
            } else if (type.match("Software")){
                iconCls = "softwareicon";
            } else if (type.match("Service")){
                iconCls = "serviceicon";
            } else if (type.match("InteractiveResource")){
                iconCls = "interactiveicon";
            } else if (type.match("Event")){
                iconCls = "eventicon";
            } else if (type.match("Collection")){
                iconCls = "collectionicon";
            } else if (type.match("Dataset")){
                iconCls = "dataseticon";
            }
       } else {
            if (type.match("html")) {
                // suppress for now: users finding html icon confusing/too similar to others
                // iconCls = "htmlicon";
            } else if (type.match("image")) {
                iconCls = "imageicon";
            } else if (type.match("audio")) {
                iconCls = "audioicon";
            } else if (type.match("video") || type.match("flash")) {
                iconCls = "videoicon";
            } else if (type.match("pdf")) {
                iconCls = "pdficon";
            } else if (type.match('xml')){
                iconCls = "xmlicon";
            } 
       }
       return iconCls;
    },
    copyCompoundObjectToNew: function(){
        try {
            var currentCO = lore.ore.cache.getLoadedCompoundObject();
            var newURI = lore.ore.reposAdapter.generateID();
            /*if (lore.ore.cache && currentCO && lore.util.isEmptyObject(currentCO.getInitialContent())){
                // this is a new unsaved Resource Map : should probably warn the user 
            }*/
            // TODO: check if pending changes /ask whether to save/yes->save/copy no->copy cancel->return
            if (currentCO && currentCO.isDirty()){
                
            }
            this.setLockCompoundObject(false);
            // reuse existing model object, updating uri to new
            currentCO.copyToNewWithUri(newURI, this.defaultCreator);
            lore.ore.cache.setLoadedCompoundObjectUri(newURI);
            lore.ore.cache.remove(currentCO.uri);
            lore.ore.cache.add(newURI,currentCO);
            lore.ore.cache.setLoadedCompoundObjectIsNew(true);
            
            // remove read-only message in case original came from another repository
            var title = currentCO.properties.getTitle() || "Untitled";
            Ext.getCmp('currentCOMsg').setText(Ext.util.Format.ellipsis(title, 50),false);
            Ext.getCmp('currentCOSavedMsg').setText('*');
            this.isDirty = true;
            this.wasClean = false;

            Ext.getCmp("propertytabs").activate("properties");
            lore.ore.ui.vp.info("Contents copied to new Resource Map");
        } catch (e){
            lore.debug.ore("Error in copyCompoundObjectToNew",e)
        }
    },
    /**
     * Prompt whether to save the current Resource Map, then calls newCO to
     * create new Resource Map
     */
    createCompoundObject: function(dontRaise, callback){
        try{
            // Check if the currently loaded Resource Map has been modified and if it has prompt the user to save changes
            var currentCO = lore.ore.cache.getLoadedCompoundObject();
            if (currentCO && currentCO.isDirty()){
                Ext.Msg.show({
                    title : 'Save Resource Map?',
                    buttons : Ext.MessageBox.YESNOCANCEL,
                    msg : 'Would you like to save the Resource Map before proceeding?<br><br>Any unsaved changes will be lost if you select "No".',
                    //msg: 'Any unsaved changes to the current Resource Map will be lost. Would you like to continue anyway?',
                    fn : function(btn) {
                        if (btn === 'yes') {
                            var currentCO = lore.ore.cache.getLoadedCompoundObject();
                            // TODO: #56 check that the save completed successfully before calling newCO
                            lore.ore.reposAdapter.saveCompoundObject(currentCO,function(remid){
                                lore.ore.controller.afterSaveCompoundObject(remid);
                                lore.ore.controller.newCO(dontRaise);
                                if (callback) {
                                    callback();
                                }
                            });
                            
                        } else if (btn === 'no') {
                            lore.ore.controller.newCO(dontRaise);
                            if (callback){
                                callback();
                            }
                        }
                    }
                });
            } else {
                this.newCO(dontRaise);
                if (callback){
                    callback();
                }
            }
    
        } catch (e){
            lore.debug.ore("Error in createCompoundObject",e);
        }
        
    },
    /**
     * Create new Resource Map
     * @param {} dontRaise
     */
    newCO : function(dontRaise){
        delete this.loadedCO;
        this.setLockCompoundObject(false);
        if (lore.ore.ui.topView){
            lore.ore.ui.topView.hideAddIcon(false);
        }
        var currentREM = lore.ore.reposAdapter.generateID();
        var currentCO = new lore.ore.model.CompoundObject({
            uri: currentREM
        });
        lore.ore.cache.add(currentREM, currentCO);
        lore.ore.cache.setLoadedCompoundObjectUri(currentREM);
        lore.ore.cache.setLoadedCompoundObjectIsNew(true);
        currentCO.initProperties(this.defaultCreator);
        lore.ore.ui.graphicalEditor.initGraph();
        this.isDirty = false;
        this.wasClean = true;
        this.bindViews(lore.ore.cache.getLoadedCompoundObject())
        Ext.getCmp('currentCOMsg').setText('New Resource Map');
        Ext.getCmp('currentCOSavedMsg').setText(''); 
        if (!dontRaise) {
            Ext.getCmp("propertytabs").activate("properties");
        }
        
    }, 
    /**
    * Delete the Resource Map that is loaded
    */
    deleteCompoundObjectFromRepository: function(aURI, aTitle){
        var remid = aURI;
        var title = aTitle;
        if (!remid){
            remid = lore.ore.ui.grid.getPropertyValue(lore.ore.controller.REM_ID_PROP);
            title = lore.ore.ui.grid.getPropertyValue("dc:title") 
                || lore.ore.ui.grid.getPropertyValue("dcterms:title");
        }
        if(!remid.match(lore.ore.reposAdapter.idPrefix)){
            Ext.Msg.show({
                title: "Delete disabled",
                msg: "Deletion is disabled for this Resource Map because it is from a different repository than your default repository. <br><br>To enable deletion for this Resource Map, please change the <i>Repository Acess URL</i> in the Resource Maps preferences.",
                buttons: Ext.MessageBox.OK
            });
            return;
        }
        Ext.Msg.show({
            title : 'Remove Resource Map',
            buttons : Ext.MessageBox.OKCANCEL,
            msg : lore.util.sanitizeHTML('Are you sure you want to delete this Resource Map?<br><br>' + title + ' &lt;' + remid + "&gt;<br><br>This action cannot be undone.",window,true),
            fn : function(btn, theurl) {
                if (btn == 'ok') {
                    Ext.MessageBox.show({
                        msg: 'Deleting Resource Map',
                        width:250,
                        defaultTextHeight: 0,
                        closable: false,
                        cls: 'co-load-msg'
                    });
                    // If it is not saved, just clear the UI
                    if (lore.ore.reposAdapter.unsavedSuffix && remid.match(lore.ore.reposAdapter.unsavedSuffix)){
                        lore.ore.cache.setLoadedCompoundObjectUri("");
                        lore.ore.ui.graphicalEditor.coGraph.clear();
                        lore.ore.controller.createCompoundObject(); 
                        lore.ore.ui.vp.info("Unsaved Resource Map deleted");
                        Ext.MessageBox.hide();
                    } else {
                        lore.ore.reposAdapter.deleteCompoundObject(remid,function(deletedrem){
                                try{
                                if (lore.ore.cache.getLoadedCompoundObjectUri() == deletedrem){
                                    lore.ore.cache.setLoadedCompoundObjectUri("");
                                    lore.ore.ui.graphicalEditor.coGraph.clear();
                                    lore.ore.controller.createCompoundObject(); 
                                }
                                lore.ore.coListManager.remove(deletedrem);
                                lore.ore.historyManager.deleteFromHistory(deletedrem);
                                lore.ore.ui.vp.info("Resource Map deleted");
                                Ext.MessageBox.hide();
                            } catch (ex){
                                lore.debug.ore("Error after deleting Resource Map",ex);
                            }
                        });
                    }
                }
            }
        });
    },
    lockCompoundObjectInRepository: function(){
        if (!lore.ore.reposAdapter instanceof lore.ore.repos.RestAdapter){
            Ext.Msg.show({
                title: "Not supported",
                msg: "Locking of Resource Maps is only supported for lorestore repositories.",
                buttons: Ext.MessageBox.OK
            });
            return;
        }
        
        if (lore.ore.controller.locked){
                lore.ore.ui.vp.warning("Resource Map is already locked!");
                return;
        }
        var remid = lore.ore.ui.grid.getPropertyValue(lore.ore.controller.REM_ID_PROP);
        if(!remid.match(lore.ore.reposAdapter.idPrefix)){
            Ext.Msg.show({
                title: "Save disabled",
                msg: "Saving (and locking) is disabled for this Resource Map because it is from a different repository than your default repository. <br><br>To enable saving for this Resource Map, please change the <i>Repository Acess URL</i> in the Resource Maps preferences.",
                buttons: Ext.MessageBox.OK
            });
            return;
        }
        
        var title = lore.ore.ui.grid.getPropertyValue("dc:title")
            || lore.ore.ui.grid.getPropertyValue("dcterms:title");
        // Prompt user to enter title if untitled
        if (!title || title.trim() == ""){  
            Ext.Msg.show({
                title: "Enter Title",
                msg: "Please enter a title for the Resource Map:",
                prompt: true,
                buttons: Ext.MessageBox.OK,
                closable: false,
                scope: this,
                fn: function(b, t){
                    try{
                    title = t || "Untitled";
                    // update the title in the model
                    var currentCO = lore.ore.cache.getLoadedCompoundObject();
                    var propData = {
                        id: lore.constants.NAMESPACES["dc"] + "title", 
                        ns: lore.constants.NAMESPACES["dc"], 
                        name: "title", 
                        value: title, 
                        prefix: "dc",
                        type: "plainstring"
                    };
                    currentCO.properties.setProperty(propData,0);
                    lore.ore.coListManager.updateCompoundObject(
                            lore.ore.cache.getLoadedCompoundObjectUri(),
                            {title: title}
                    );
                    if (title) this.lockCompoundObjectInRepository();
                    } catch (ex){
                        lore.debug.ore("Error setting title",ex);
                    }
                }
                
            });  
        } else {
            Ext.Msg.show({
                title : 'Lock Resource Map',
                buttons : Ext.MessageBox.OKCANCEL,
                msg : 'Are you sure you wish to lock this Resource Map:<br/><br/>'
                    + lore.util.sanitizeHTML(title,window,true) 
                    + "<br/><br><br>Locked Resource Maps cannot be modified. <br>This action cannot be undone.",
                fn : function(btn, theurl) {
                    if (btn == 'ok') {
                        var currentCO = lore.ore.cache.getLoadedCompoundObject();
                        // add isLocked property
                        currentCO.properties.setProperty({
                           id: lore.constants.NAMESPACES["lorestore"]+ "isLocked",
                           ns: lore.constants.NAMESPACES["lorestore"],
                           name: "isLocked",
                           value: true,
                           prefix: "lorestore",
                           type: "boolean"
                        });
                        lore.ore.reposAdapter.saveCompoundObject(currentCO,lore.ore.controller.afterSaveCompoundObject);
                    }
                }
            });
        }
        
    },
    /**
    * Save the Resource Map to the repository - prompt user to confirm
    */
    saveCompoundObjectToRepository: function(){
        // TODO: compare new Resource Map with contents of rdfquery db that stores initial state - don't save if unchanged
        // update rdfquery to reflect most recent save
        var remid = lore.ore.ui.grid.getPropertyValue(lore.ore.controller.REM_ID_PROP);
        if (lore.ore.controller.locked){
            Ext.Msg.show({
                title: "Save disabled",
                msg: "Saving is disabled for this Resource Map because it is locked",
                buttons: Ext.MessageBox.OK
            });
            return;
        }
        if(!remid.match(lore.ore.reposAdapter.idPrefix)){
            Ext.Msg.show({
                title: "Save disabled",
                msg: "Saving is disabled for this Resource Map because it is from a different repository than your default repository. <br><br>To enable saving for this Resource Map, please change the <i>Repository Acess URL</i> in the Resource Maps preferences.",
                buttons: Ext.MessageBox.OK
            });
            return;
        }
      
        var title = lore.ore.ui.grid.getPropertyValue("dc:title")
            || lore.ore.ui.grid.getPropertyValue("dcterms:title");
        // Prompt user to enter title if untitled
        if (!title || title.trim() == ""){  
            Ext.Msg.show({
                title: "Enter Title",
                msg: "Please enter a title for the Resource Map:",
                prompt: true,
                buttons: Ext.MessageBox.OK,
                closable: false,
                scope: this,
                fn: function(b, t){
                    try{
                    title = t || "Untitled";
                    // update the title in the model
                    var currentCO = lore.ore.cache.getLoadedCompoundObject();
                    var propData = {
                        id: lore.constants.NAMESPACES["dc"] + "title", 
                        ns: lore.constants.NAMESPACES["dc"], 
                        name: "title", 
                        value: title, 
                        prefix: "dc",
                        type: "plainstring"
                    };
                    currentCO.properties.setProperty(propData,0);
                    lore.ore.coListManager.updateCompoundObject(
                            lore.ore.cache.getLoadedCompoundObjectUri(),
                            {title: title}
                    );
                    if (title) this.saveCompoundObjectToRepository();
                    } catch (ex){
                        lore.debug.ore("Error setting title",ex);
                    }
                }
                
            });  
        } else {
            Ext.Msg.show({
                title : 'Save RDF',
                buttons : Ext.MessageBox.OKCANCEL,
                msg : lore.util.sanitizeHTML('Are you sure you wish to save Resource Map:<br/><br/>' + title + "<br/><br/>to repository as " + remid + "?",window,true),
                fn : function(btn, theurl) {
                    if (btn == 'ok') {
                        var currentCO = lore.ore.cache.getLoadedCompoundObject();
                        lore.ore.reposAdapter.saveCompoundObject(currentCO,lore.ore.controller.afterSaveCompoundObject);
                    }
                }
            });
        }
    },
    /** Recover from failure to load Resource Map 
     * @param {} resp
     * @param {} opt
     */
    afterLoadCompoundObjectFail : function(resp,opt){
        lore.debug.ore("Error: Unable to load Resource Map " + opt.url, resp);
        if (resp.status == 403){
            Ext.Msg.show({
                title : 'Permission denied',
                buttons : Ext.MessageBox.OK,
                msg : "You are not logged in or your account does have permssion to view this private Resource Map.<br>Please log in with the account that was used to create the Resource Map."
            });
        } else {
            lore.ore.ui.vp.error("Unable to load Resource Map: " + resp.statusText);
            lore.ore.controller.createCompoundObject(true);
            Ext.Msg.hide();
        }
    },
    /** Add saved Resource Map to the model lists
      * @param {String} remid The Resource Map that was saved */
    afterSaveCompoundObject : function(remid){
        lore.ore.controller.isDirty = false;
        lore.ore.controller.wasClean = true;
        // Set lock
        var currentCO = lore.ore.cache.getLoadedCompoundObject();
        if (currentCO.properties.getProperty(lore.constants.NAMESPACES["lorestore"] + "isLocked")){
            lore.ore.controller.setLockCompoundObject(true);
        } else {
            lore.ore.controller.setLockCompoundObject(false);
        }
        Ext.getCmp('currentCOSavedMsg').setText('');
        lore.ore.cache.setLoadedCompoundObjectIsNew(false);
        var title = lore.ore.ui.grid.getPropertyValue("dc:title") 
            || lore.ore.ui.grid.getPropertyValue("dcterms:title") 
            || "Untitled";
        var coopts = {
                'uri': remid,
                'title': title,
                'creator': lore.ore.ui.grid.getPropertyValue("dc:creator"),
                'modified': lore.ore.ui.grid.getPropertyValue("dcterms:modified")
        };
        // If the current URL is in the Resource Map, show in related Resource Maps
        if (lore.ore.ui.graphicalEditor.lookup[lore.ore.controller.currentURL]){
           lore.ore.coListManager.add([coopts]);
        }
        var priv = currentCO.properties.getProperty(lore.constants.NAMESPACES["lorestore"] + "isPrivate");
        lore.ore.historyManager.addToHistory(remid, title, (priv && priv.value == true ? true : false));  
    },
    persistAllLayout: function(){
        // make sure layout info is up to date in model
        var allfigures = lore.ore.ui.graphicalEditor.coGraph.getFiguresSorted();
        for (var i = 0; i < allfigures.length; i++) {
            var fig = allfigures[i];
            if (fig instanceof lore.ore.ui.graph.EntityFigure){
                fig.persistLayout();
            }
        }
    },
    /** Prompt for location to save serialized Resource Map and save as file
    * @param {String} format The format to which to serialize (rdf, wordml or trig)
    */
    exportCompoundObject: function(format){
        var fileExtensions = {
            "rdf": "xml",
            "wordml": "xml",
            "trig": "txt",
            "json": "txt"
        };
        var saveContents = function(savecb, data){
            var fObj = savecb(data);
            if ( fObj ) {
                lore.ore.ui.vp.info("Successfully saved Resource Map data to " + fObj.fname);
            } else {
                lore.ore.ui.vp.info("Unable to save Resource Map data");
            }
        };
        try {
            format = format || "rdf"; // default value
            var currentCO = lore.ore.cache.getLoadedCompoundObject();
            if (format == "wordml"){
                var wExp = new lore.exporter.WordExporter();
                var docxData = currentCO.toWord();
                lore.debug.ore("docx",docxData);
                wExp.createWordFile(docxData.docxml, docxData.rels);
            } else {
                lore.util.writeFileWithSaveAs("Export Resource Map as", 
                    fileExtensions[format],
                    // savecb callback will actually write the file
                    function(savecb){ 
                            // get contents via serialize
                            saveContents(savecb, currentCO.serialize(format));
                    },
                    window
                );
            }        
                                                
        } catch (e) {
            lore.debug.ore("Error saving Resource Maps data",e );
            lore.ore.ui.vp.error("Error saving Resource Map: " + e);
        }
    
    },
    /** keep selection in sync between graphical editor and resource list */
    updateSelection: function(obj, view){
        try{
        // when a resource is selected: update both graphical editor and resource list views
        // when a relationship is selected: update the graphical editor and clear selections in resource list
        if (view instanceof lore.ore.ui.ResourceListPanel){
            if (obj){
                lore.ore.ui.graphicalEditor.selectFigure(obj);
            } else {
                // clear graphical editor selection
                lore.debug.ore("no selection");
            }
        } else {
            var resourceListView = Ext.getCmp("remlistview");
            if (obj instanceof lore.ore.ui.graph.EntityFigure){
                resourceListView.selectResource(obj.url);
            } else {
                // could be a connection or nothing selected: clear resource list
                resourceListView.selectResource(null);
            }
        }
        } catch (e){
            lore.debug.ore("Error in updateSelection",e);
        }
    },
    addPlaceholder: function(){
        try{
            var placeholderOptions = {
                url: lore.ore.reposAdapter.generatePlaceholderID(), 
                placeholder: true, 
                props: {"dc:title_0": "Placeholder"}
            };
            lore.ore.ui.graphicalEditor.addFigure(placeholderOptions);
        } catch (ex){
            lore.debug.ore("Error in addPlaceholder",ex);
        }
    },
    addResourceWithPrompt: function(){
        Ext.Msg.show({
            title : 'Add resource URL',
            buttons : Ext.MessageBox.OKCANCEL,
            msg : 'Please enter the URL of the resource:',
            scope: this,
            fn : function(btn, theurl) {
                if (btn == 'ok') {
                    this.addResource(theurl);
                }
            },
            prompt : true
        });
    },
    /**
     * Add a resource to the Resource Map
     * @param {} uri
     * @param {} props
     */
    addResource: function(uri,props){ 
        // TODO: #34 MVC:  make it add to model and get view to listen on model
        Ext.getCmp("loreviews").activate("drawingarea");
        //var activeView = Ext.getCmp("loreviews").getActiveTab();
        /* TODO: allow list view to be active: bug at the moment with iframe previews
         * 
        // activate one of the editors
        if (!(activeView.id == "remlistview" || activeView.id == "drawingarea")){
            activeView = Ext.getCmp("remlistview");
            Ext.getCmp("loreviews").activate(activeView);
        }*/
        // TODO: split out these known hosts into separate configuration file
        if (uri.match("ezproxy") || uri.match("web.ebscohost.com") || uri.match("bishop.slq.qld.gov.au") | uri.match("babel.hathitrust.org")){
            Ext.Msg.show({
                title: 'Potentially inaccessible resource',
                buttons: Ext.MessageBox.OKCANCEL,
                msg: 'The URL you are adding to the Resource Map may not be persistent or accessible to others.<br/>If possible, please use a DOI or other persistent URL',
                scope: this,
                fn : function(btn) {
                    if (btn == 'ok'){
                        lore.ore.ui.graphicalEditor.addFigure({url:uri, props: props});
                        if (!props || (props && !props.batch)){
                            lore.ore.ui.graphicalEditor.showResource(uri);
                        }
                    }
                }
            });
        } else {
            lore.ore.ui.graphicalEditor.addFigure({url:uri, props: props});
            
            if (!props || (props && !props.batch)){
                lore.ore.ui.graphicalEditor.showResource(uri);
            }
        }
    },
    /** Remove a resource from the Resource Map
     * @param {} uri
     */
    removeResource: function(uri){
        lore.ore.cache.getLoadedCompoundObject().removeAggregatedResource(uri);
        // temporarily update graphical editor : it should be listening on the model
        lore.ore.ui.graphicalEditor.removeFigure(uri);
    },
    /** Open all resources in current CO in browser tabs */
    launchInTabs: function(){
        lore.ore.cache.getLoadedCompoundObject().aggregatedResourceStore.each(function(r){
            lore.util.launchTab(r.get('uri'), window);          
        });
    },
    /** Add a bunch of resources from open browser tabs
     * @param {} thebrowser Provided by overlay: represents the tabbed browser
     */
    addFromTabs: function(thebrowser) {
        try{
        var num = thebrowser.browsers.length;
        if (num == 0) {return;}
        var formitems = [{
            xtype: 'label',
            anchor: '100%',
            text: 'Add the following resources to the Resource Map:'
        }];
        for (var i = 0; i < num; i++) {
            var b = thebrowser.getBrowserAtIndex(i);
            var burl = b.currentURI.spec;
            var globalHistory = Components.classes["@mozilla.org/browser/global-history;2"].
                getService(Components.interfaces.nsIGlobalHistory2);
            var title  = globalHistory.getPageTitle(b.currentURI);
            if (title) {
                title = Ext.util.Format.ellipsis(title,100);
            }
            if (burl != "about:blank"){
                formitems.push({
                    xtype: "checkbox",
                    name: burl,
                    boxLabel: title || burl,
                    checked: true,
                    anchor: "100%"
                });
            }
        }
        var win = new Ext.Window({
            layout      : 'fit',
            width       : 600,
            height      : 300,
            autoScroll: true,
            items: formitems,
            title: 'Add resources from browser tabs',
            buttons: [{
                text     : 'OK',
                handler: function(){
                    win.hide();
                    Ext.MessageBox.show({
                        msg: 'Adding resources',
                        width:250,
                        defaultTextHeight: 0,
                        closable: false,
                        cls: 'co-load-msg'
                    });
                    lore.ore.ui.graphicalEditor.coGraph.commandStack.startCommandGroup();
                    win.items.each(
                         function(item, index, length){              
                             if (index > 0 && item.getValue()){
                                 // add them as collapsed nodes
                                 lore.ore.ui.graphicalEditor.addFigure({url:item.getName(),
                                     oh: 170,
                                     w: 220,
                                     h: 70});
                             }           
                    });
                    lore.ore.ui.graphicalEditor.coGraph.commandStack.endCommandGroup();
                    Ext.MessageBox.hide();
                    
                }
            },{
                text     : 'Cancel',
                handler  : function(){
                    win.hide();
                }
            }, {
                text : 'Select all',
                handler: function(){
                    win.items.each(function(item,index,length){
                        if (index > 0){
                            item.setValue(true);
                        }
                    });
                }
            }, {
                text : 'Deselect all',
                handler: function(){
                    win.items.each(function(item,index,length){
                        if (index > 0){
                            item.setValue(false);
                        }
                    });
                }
            }]
        });
        
        win.show();
        // work around scrolling content over iframe bug by redrawing
        win.body.on("scroll",function(e,t,o){this.repaint();},win.body);
        } catch (e){
            lore.debug.ore("Error adding from tabs",e);
        }
    },
    /** Handle search */
    search : function (searchuri, searchpred, searchval){
        if (!searchuri && !searchpred && !searchval){
            // blank search searches for all Resource Maps for now (not scalable!)
            searchval = lore.constants.RESOURCE_MAP;
        }
        try{
            var searchTerms = [];
            if (searchuri){
                searchTerms.push("<i>containing: </i>" + searchuri);
            }
            if (searchpred){
                searchTerms.push("<i>having: </i>" + searchpred);
            }
            if (searchval){
                searchTerms.push("<i>matching: </i>" + searchval);
            }
            //TODO: display search details in new dataview
            //.setDetails(searchTerms);

            // onBeforeLoad triggers display of loading message
            Ext.getCmp('cosview').onBeforeLoad();
            lore.ore.reposAdapter.getCompoundObjects(searchuri, searchpred,searchval,true);
        } catch (e){
            lore.debug.ore("Error in Controller: exception in search",e);
        }
    },
    /** Triggered when extension preferences change (eg user updates preferences).
     *  Always handled regardless of whether controller is active 
     *  @param {Object} prefs The updated prefrence values */
    handlePreferencesChanged: function(prefs){
      try{ 
          this.defaultCreator = prefs.creator;
          this.defaultEditor = prefs.editor;
          var om = lore.ore.ontologyManager;
          if (om){
            om.loadOntology(prefs.relonturl, prefs.ontologies);
          } 
          this.setRepos(prefs.rdfrepos, prefs.rdfrepostype, prefs.annoserver);
          this.high_contrast = prefs.high_contrast;
          lore.util.setHighContrast(window, prefs.high_contrast);
          var abtframe = Ext.get("about_co");
          if (abtframe && abtframe.dom && abtframe.dom.contentWindow){
            lore.util.setHighContrast(Ext.get("about_co").dom.contentWindow, prefs.high_contrast);
          } 
      } catch (e){
        lore.debug.ore("Error in Controller: handling changed preferences",e);
      }
    },
    /**
     * Set the Resource Map repository: typically triggered after user updates preferences
     *
     * @param {String} rdfrepos The repository access URL
     * @param {String} rdfrepostype The type of the repository (eg lorestore)
     * @param {String} annoserver The annotation server access URL
     */
    setRepos : function(/*String*/rdfrepos, /*String*/rdfrepostype, /*String*/annoserver){
        /** The access URL of the annotation server */
        this.annoServer = annoserver + "/annotea";
        // if type is lorestore, use danno, ignoring separate rdfrepos pref
        if (rdfrepostype == "lorestore"){
            rdfrepos = annoserver + "/ore/";
        }
        if (lore.ore.reposAdapter && lore.ore.reposAdapter.reposURL == rdfrepos) {
            // same access url, use existing adapter
            return;
        }    
        // check whether currently loaded Resource Map is from different repos
        var isEmpty = lore.ore.cache && lore.util.isEmptyObject(lore.ore.cache.getLoadedCompoundObject().getInitialContent());
        // at this point the repos adaptor still contains the old value
        var diffReposToEditor = lore.ore.reposAdapter && lore.ore.cache && lore.ore.cache.getLoadedCompoundObjectUri().match(lore.ore.reposAdapter.idPrefix);
        var title = "";
        var currentCOMsg = Ext.getCmp('currentCOMsg');
        if (lore.ore.ui.grid){
            title = lore.ore.ui.grid.getPropertyValue("dc:title") ||
                lore.ore.ui.grid.getPropertyValue("dcterms:title");
            if (!title){
                title = "Untitled";
            }
        }
        // check whether there is a Resource Map being edited and prompt to save if changed
        if (!isEmpty && diffReposToEditor){
            // set editor to read-only
            /*if (lore.ore.ui.graphicalEditor){
                lore.ore.ui.graphicalEditor.coGraph.setReadOnly(true);
            }*/
            var currentCO = lore.ore.cache.getLoadedCompoundObject();
            if (currentCOMsg) {
                currentCOMsg.setText(Ext.util.Format.ellipsis(title, 50) + ' (read-only)',false);
            }
            if (currentCO.isDirty() && !this.readOnly){
                Ext.Msg.show({
                    title : 'Save Resource Map?',
                    buttons : Ext.MessageBox.YESNO,
                    msg : 'The default Resource Map repository preferences have been changed. <br>You will be able to view the current Resource Map in read-only mode, however you will not be able to save changes unless the repository preferences are changed back to the repository that contains this Resource Map. <br><br>Would you like to save your changes before proceeding?',
                    fn : function(btn, theurl) {
                        if (btn == 'yes') {
                            // TODO: #56 check that the save completed successfully?
                            lore.ore.reposAdapter.saveCompoundObject(currentCO,lore.ore.controller.afterSaveCompoundObject);
                        }  
                    }
                });
            }
        } else {
            // its from the same repository, set editor to editable
            /*if (lore.ore.ui.graphicalEditor.coGraph){
                lore.ore.ui.graphicalEditor.coGraph.setReadOnly(false);
            }*/
            if (currentCOMsg) {currentCOMsg.setText(Ext.util.Format.ellipsis(title, 50),false);}
        }
        if (rdfrepostype == 'lorestore') {
            lore.ore.reposAdapter = new lore.ore.repos.RestAdapter(annoserver);
        } else {
            lore.ore.ui.vp.warning("LORE only supports lorestore for Resource Maps");
        }
        if (isEmpty) {
                // empty Resource Map, reset it to get a new id
                this.newCO(true);
        }
        // Reload history so that Resource Maps from other repositories are marked as read-only
        if (lore.ore.historyManager){
            lore.ore.historyManager.onEndUpdateBatch();
        }
        if (lore.ore.reposAdapter){
            // Trigger reposAdapter to get related Resource Maps
            lore.ore.reposAdapter.getCompoundObjects(this.currentURL);
        }
        
        // Reset the search results and explore view
        if (lore.ore.coListManager){
            lore.ore.coListManager.clear("search");
            //lore.ore.ui.searchtreeroot.setDetails([]);
        }
        if (lore.ore.explorePanel && lore.ore.cache){
            lore.ore.explorePanel.showInExploreView(lore.ore.cache.getLoadedCompoundObjectUri(),"Current Resource Map",true, true);
        }
    },
    /** Triggered when the user navigates to a different page in the browser, or switches between tabs.
     *  Only handled when controller is active
     *  @param {String} contextURL The new URL */
    handleLocationChange : function (contextURL) {
        this.currentURL = lore.util.preEncode(contextURL);
        if (!this.active){
            return;
        }
        if (lore.ore.reposAdapter){
            // Trigger reposAdapter to get related Resource Maps
            lore.ore.reposAdapter.getCompoundObjects(this.currentURL);
        }
        this.loadedURL = this.currentURL; 
    },
    /** Asks the model whether theURL is aggregated by the current Resource Map. 
     *  Used by overlay to determine whether to update the url-bar icon after user has browsed to new location
     *  @param {String} theURL 
     *  @return boolean */
    isInCompoundObject : function(theURL){
        // TODO: delegate to model
        var isInCO = typeof(lore.ore.ui.graphicalEditor.lookup[theURL]) !== 'undefined';
        return isInCO;
    },
    /** Triggered by user dragging and dropping a URL from the main browser and dropping anywhere on the Resource Maps UI */
    onDropURL: function(sn, aEvent){
        try{
        // If sourceNode is not null, then the drop was from inside the application
        // add to Resource Map if it is a link or image
        if (sn){
                if (sn instanceof HTMLAnchorElement){
                    var sntitle = sn.textContent;
                    var figopts = {
                        url: sn.href,
                        x: Math.max(0,aEvent.layerX),
                        y: Math.max(0,aEvent.layerY)
                    };
                    if (sntitle){
                        figopts.props = {"dc:title_0": sntitle};
                    }
                    lore.ore.ui.graphicalEditor.addFigure(figopts);
                } else if (sn instanceof HTMLImageElement){
                    lore.ore.ui.graphicalEditor.addFigure({url:sn.src});
                } 
                
                return;
          }
        } catch (e){
            lore.debug.ore("Error in Controller: onDropURL",e);
        }    
    },
    locked : false,
    readOnly : false,
    setLockCompoundObject: function(locked){
        var b = Ext.getCmp('lockButton');
        if (!locked){
            this.locked = false;
            this.readOnly = false;
            b.hide();
        } else {
            this.locked = true;
            this.readOnly = true;
            b.show();
        }
        // force CO properties to re-render (grey color indicates readOnly)
        lore.ore.ui.grid.getView().refresh();
    },
    checkReadOnly: function(){
        if (this.readOnly){
            lore.ore.ui.vp.info("Resource Map is read only");
        }
        return this.readOnly;
    }
});
