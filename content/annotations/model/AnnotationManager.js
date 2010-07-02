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
 * @include  "/oaiorebuilder/content/annotations/init.js"
 * @include  "/oaiorebuilder/content/debug.js"
 * @include  "/oaiorebuilder/content/util.js"
 * @include  "/oaiorebuilder/content/uiglobal.js"
 * @include  "/oaiorebuilder/content/constants.js"
 */

/** 
 * AnnotationManager
 * Contains operations that are performed on annotations and the data stores
 * for the annotations.
 * @singleton
 * @class lore.anno.AnnotationManager
 */

lore.anno.AnnotationManager = Ext.extend(Ext.util.Observable, {
	/**
	 * Intialize the 'model', the store which holds the working copies
	 * of annotations for a given page.  
	 * @param {String} theURL  (Currently not utilized)The URL for which to create the store
	 */
	constructor: function (config) {
		var fields = [
					{name: 'created'}, 
					{name: 'creator'}, 
					{name: 'title'}, 
					{name: 'body'},
					{name: 'bodyLoaded'},  
					{name: 'modified'}, 
					{name: 'type'}, 
					{name: 'lang'},
                    {name: 'resource'},
                    {name: 'id'},
                    {name: 'context'},
                    {name: 'isReply'},
                    {name: 'bodyURL'},
                    {name: 'about'},
                    {name: 'original'},
                    {name: 'variant'},
                    {name: 'originalcontext'},
                    {name: 'variantcontext'},
                    {name: 'variationagent'},
                    {name: 'variationplace'},
                    {name: 'variationdate'},
                    {name: 'tags'},
					{name: 'meta'},
					{name: 'scholarly'},
					{name: 'isNew'},
					{name: 'hasChildren'},
					{name: 'semanticEntity'},
					{name: 'semanticEntityType'}
                        ];
						
		/** @property annods
         * @type Ext.data.JsonStore
         * The annotation store
		 */								
		this.annods = lore.global.store.create(lore.constants.ANNOTATIONS_STORE,
		new Ext.data.JsonStore({	fields: fields,
									data: {}
								}),  config.url);
		this.annodsunsaved =  new Ext.data.JsonStore({	fields: fields,
									data: {}
								});
								
		/**
         * @property 
         * @type Ext.data.JsonStore
         * The annotation search data store
		 */
		this.annosearchds =  new Ext.data.JsonStore({
									fields: fields,
									data: {}
								});
		
		var mfields = [  {name: 'type'}, {name: 'prop'}, {name: 'value'}];
		/**
         * @property 
         * @type Ext.data.JsonStore
         * The annotation metadata data store
		 */
		this.annousermetads =  new Ext.data.JsonStore( {
			fields: mfields,
			data: {} 
		})	
		
		// model event handlers						
		 this.annods.on("load",  this.onDSLoad);
		 this.annods.on("remove", this.onDSRemove);
		
		this.serializer = new lore.anno.RDFAnnotationSerializer();
		this.prefs = config.prefs;
	}, 
		
	 
	/**
     * Update annotations that are parents of replies by creating a map of children replies and count of local and overall replies {@link #annods} loads
     * @param {} store
     * @param {} records
     * @param {} options
	 */
	onDSLoad : function(store, records, options) {
		for( var i =0; i < records.length;i++) {
			
				// recursively update the parent/s of a reply, incrementing
				// their reply counts 
				var incParentReplies = function(rec, countonly){
					if ( !rec.data.isReply  ) 
						return;
					var prec = lore.global.util.findRecordById(store, rec.data.about);
					
					if ( !prec) {
						lore.debug.anno("Couldn't find parent to update replies list. Bad");
						return;
					}
					
					if (!countonly) {
						prec.data.replies.map[rec.data.id] = rec;
						prec.data.replies.localcount++;
					}
					prec.data.replies.count++;
					store.fireEvent("update", store, prec, Ext.data.Record.EDIT);
					incParentReplies(prec, true);
				};
			
			if ( !records[i].data.replies )
				records[i].data.replies = { count:0, localcount:0, map:{}};
			incParentReplies(records[i]);
		}
	},
	/**
     * Update parent of a reply when a reply has been removed{@link #annods}
     * @param {} store
     * @param {} record
     * @param {} index
	 */
	onDSRemove : function(store, record, index){
		var decParentReplies = function (rec, countonly) {
			if ( !rec.data.isReply)
				return;
			
			var prec = lore.global.util.findRecordById(store, rec.data.about);
			if ( !prec)
				return;
			
			if (!countonly) {
				prec.data.replies.map[rec.data.id] = null;
				prec.data.replies.localcount--;
			}
			prec.data.replies.count--;
			
			store.fireEvent("update", store, prec, Ext.data.Record.EDIT);
			decParentReplies(prec, true);
			
		};
		decParentReplies(record);
	},
	
	
	
		
	/**
	 * Add an annotation to the local store. This does not add the annotation
	 * to the remote repository
	 * @param {String} currentContext Page context of the annotation. XPath string currently supported.
	 * @param {String} currentURL The URL for the page this annotation is on
	 * @param {Function} callback Function called once the annotation is created but hasn't yet been added to datastore
	 * @param {Object} parent (Optional) The parent of this annotation
	 */
	addAnnotation : function(currentContext, currentURL, callback, parent){
		var anno = new lore.anno.Annotation();
		
		anno.load({
			resource: (parent ? parent.data.resource: currentURL),
			about: (parent ? parent.data.id: null),
			original: currentURL,
			context: currentContext,
			originalcontext: currentContext,
			creator: this.prefs.creator,
			created:  new Date().format('c'),
			modified: new Date().format('c'),
			body: "",
			title: (parent ? "Re: " + parent.data.title:""),
			type: lore.constants.NAMESPACES["annotype"] + "Comment",
			lang: "en",
			isReply: (parent ? true: null),
			bodyLoaded: true
		});
		
		if ( callback)	callback(anno);
		
		lore.debug.anno('AM.addAnnotation()', {currentContext:currentContext,anno:anno});
			
		this.annodsunsaved.loadData([anno], true); 
		return lore.global.util.findRecordById(this.annodsunsaved, anno.id);
	},
	
	/**
	 * Create or update the annotations in the remote repository.
	 * These actions are performed for all annotations that are flagged as 'dirty'. 
	 * @param {String} currentURL The URL of the page where the annotations are situated
	 * @param {Function} resultCallback A callback function that is used by the function to output success or failure
	 * The callback should support the following parameters
	 * rec: The record that was updated
	 * action: Action performed on the record ('create' or 'update')
	 * result: Result as a string ('success' or 'fail') 
	 * resultMsg: Result message 
	 */
	updateAllAnnotations : function (currentURL, resultCallback) {
		
		var modified = [];
		this.annodsunsaved.each( function (rec) 
		{ 
			if ( rec.dirty || rec.data.isNew() ) {
				modified.push(rec);
			}
		}, this);
		
		var resultCounter = 0;
		var t = this;
		var result = function (request, action, anno) {
			try {
				resultCounter++;
				
				var result = 'success';
				if( action == 'create' && request.status != 201 )
					result = 'fail';
				if ( action == 'update' && request.status != 200 )
					result == 'fail';
				resultCallback(action, result, request.statusText, anno);
					
				if (resultCounter == modified.length) {
					// once all annotations have been updated, refresh  
					lore.global.store.removeCache(lore.constants.ANNOTATIONS_STORE, currentURL);
					t.updateAnnotationsSourceList(currentURL);
				}
			} catch (e ) {
				lore.debug.anno(e,e);
			}
		}
			
		
		for ( var i =0; i < modified.length; i++ ) {
			this.sendUpdateRequest(modified[i], result);
		}
	},
	/**
	 * Send an annotation update to server
	 * @param {Object} anno The annotation
	 * @param {Object} resultCallback Callback when update finishes
	 */
	sendUpdateRequest : function(annoRec, resultCallback){
		// don't send out update notification if it's a new annotation as we'll
		// be reloading datasource
		annoRec.commit(annoRec.data.isNew());
		
		var annoRDF = this.serializer.serialize([annoRec.data], this.annods);
		
		var xhr = new XMLHttpRequest();
		if (annoRec.data.isNew()) {
			lore.debug.anno("creating new annotation")
			// create new annotation
			xhr.open("POST", this.prefs.url);
			xhr.setRequestHeader('Content-Type', "application/rdf+xml");
			xhr.setRequestHeader('Content-Length', annoRDF.length);
			xhr.onreadystatechange = function(){
				try {
				
				if (xhr.readyState == 4) {
					if (resultCallback) {
						resultCallback(xhr, 'create', annoRec);
					}
				}
				
			} catch(e ) {
				lore.debug.anno("error: " + e);
			}
			};
			xhr.send(annoRDF);
			lore.debug.anno("RDF of new annotation", annoRDF);
		} else {
			lore.debug.anno("updating existing annotation")
			// Update the annotation on the server via HTTP PUT
			xhr.open("PUT", annoRec.data.id);
			xhr.setRequestHeader('Content-Type', "application/xml");
			xhr.onreadystatechange = function(){
				if (xhr.readyState == 4) {
					if (resultCallback) {
						resultCallback(xhr, 'update', annoRec); 
					}
				}
			};
			xhr.send(annoRDF);
			lore.debug.anno("RDF of updated annotation", annoRDF);
			
		}
		this.annodsunsaved.remove(annoRec);
	},
		
	
	/**
	 * Create or update the annotation in the remote repository 
	 * @param {Object} anno The annotation to update/create
	 * @param {String} currentURL The URL of the page where the annotation is situated
	 * @param {Boolean} refresh Explicity states whether to re-read the list of annotations after update or use cached entries
	 * @param {Function} resultCallback A callback function that is used by the function to output success or failure
	 * The callback should support the following parameters
	 * action: Action performed on the record ('create' or 'update')
	 * result: Result as a string ('success' or 'fail') 
	 * resultMsg: Result message 
	 */
	updateAnnotation : function(annoRec, currentURL, refresh, resultCallback){
		var t = this;
		var callback = function(request, action ) {
			if (action == 'create') {
				var result = request.status == 201 ? 'success' : 'fail';
				resultCallback('create', result, request.responseText ? request.responseText : request.statusText);
				lore.global.store.removeCache(lore.constants.ANNOTATIONS_STORE, currentURL);
				t.updateAnnotationsSourceList(currentURL);
			}
			else {
				var result = request.status == 200 ? 'success' : 'fail';
				resultCallback('update', result, request.statusText);
				if (refresh) {
					lore.global.store.removeCache(lore.constants.ANNOTATIONS_STORE, currentURL);
					t.updateAnnotationsSourceList(currentURL);
				}
			}
		}
						
		this.sendUpdateRequest(annoRec, callback);

	},
	
	/**
	 * Delete an annotation on the local store and on the remote repository if it exists there
	 * @param {Object} anno The annotation to delete
	 * @param {Object} resultCallback A callback function that is used by the function to output success or failure
	 * The callback should support the following parameters
	 * result: Result as a string ('success' or 'fail') 
	 * resultMsg: Result message 
	 */
	
	deleteAnnotation : function(anno, resultCallback) {
		// remove the annotation from the server
		
		if ( anno.data.hasChildren()) {
			if ( resultCallback)
				resultCallback("fail", "Annotation not deleted. Delete replies first.");
			return;
		}
		
		var existsInBackend = !anno.data.isNew();
		
		this.annods.remove(anno);
		this.annodsunsaved.remove(anno);
		
		if (existsInBackend) {

			Ext.Ajax.request({
				url: anno.data.id,
				success: function(resp){
					lore.debug.anno("Deletion success: " + resp );
					
					//TODO: #199 - Remove from the cache
					//lore.global.store.remove(this.annods,...;
					if ( resultCallback) {
						resultCallback('success', resp);
					}
					
				},
				failure: function(resp, opts){
					lore.debug.anno("Annotation deletion failed: " + opts.url, resp);
					if ( resultCallback) {
						resultCallback('fail', resp);
					}
				},
				method: "DELETE",
				scope:this
			});
		}
	},
	
	
	/**
	 * Creates an array of Annotations from a list of RDF nodes in ascending date
	 * created order - unchanged from dannotate.js
	 *
	 * @param {XMLDoc} xmldoc
	 *            XML Document containing annotations
	 * @param {Boolean} bodyEmbedded (Optional) Specify whether the annotations came from a file. Defaults to false.
	 * @return {Array} ordered array of Annotations
	 */
	createAnnotationsFromRDF : function(xmldoc, bodyEmbedded){
		var nodeList = xmldoc.getElementsByTagNameNS(lore.constants.NAMESPACES["rdf"], 'Description');
		
		var tmp = [];
		for (var j = 0; j < nodeList.length; j++) {
			try {
				var tmpAnno = new lore.anno.Annotation(nodeList[j], xmldoc, bodyEmbedded);
				if (tmpAnno && tmpAnno.id) 
					tmp.push(tmpAnno); 
			} 
			catch (ex) {
				lore.debug.anno("Exception processing annotations", ex);
			}
		}
		return tmp.length == 1 ? tmp : tmp.sort(function(a, b){
			return (a.created > b.created ? 1 : -1);
		});
	},
	
	
	/**
	 * Get annotation body value. modified from dannotate.js getAjaxRespSync
	 *
	 * @param {String} uri Fully formed request against Danno annotation server
	 * @param {window} The window object
	 * @return {Object} Server response as text or XML document.
	 */
	 getBodyContent : function(anno, window, callback) {
		var uri = anno.bodyURL;
		if ( !uri)
			return;
		
		var req = null;
		
		var handleResponse = function() {
			try {
				if (req.status != 200) {
					var hst = (uri.length < 65) ? uri : uri.substring(0, 64) + '...';
					throw new Error('Synchronous AJAX request status error.\n  URI: ' + hst +
					'\n  Status: ' + req.status);
				}
				
				var rtype = req.getResponseHeader('Content-Type');
				if (rtype == null) {
					var txt = req.responseText;
					var doc = null;
					if (txt && (txt.indexOf(':RDF') > 0)) {
						doc = req.responseXML;
						if ((doc == null) && (typeof DOMParser != 'undefined')) {
							var parser = new DOMParser();
							doc = parser.parseFromString(txt, 'application/xml');
						}
					}
					
					if (doc != null) {
						return doc;
					}
					else 
						if (txt != null) {
							return txt;
						}
				}
				if (rtype.indexOf(';') > 0) {
					// strip any charset encoding etc
					rtype = rtype.substring(0, rtype.indexOf(';'));
				}
				var serializer = new XMLSerializer();
				var bodyContent = "";
				var result = "";
				var bodyText = "";
				if (rtype == 'application/xml' || rtype == 'application/xhtml+xml') {
					bodyContent = req.responseXML.getElementsByTagName('body');
					if (bodyContent[0]) {
						bodyText = serializer.serializeToString(bodyContent[0]);
					}
					else {
						bodyText = /<body.*?>((.|\n|\r)*)<\/body>/.exec(req.responseText)[1];
					}
				} else if (rtype === 'application/rdf+xml') {
					return req.responseXML;
				} else {
					bodyText = /<body.*?>((.|\n|\r)*)<\/body>/.exec(req.responseText)[1];
				}
				
				if (bodyText) {
					return lore.global.util.sanitizeHTML(bodyText, window);
				}
				lore.debug.anno("No usable annotation body for content: " + rtype + " request: " + uri, req);
				return "";
			} catch (e ) {
				lore.debug.anno("handleResponse: " + e, e);
			}
			return "";
		}
		
		try {
			req = new XMLHttpRequest();
			
			req.onreadystatechange = function(){
				try {
					if (req.readyState == 4) {
						var body = handleResponse();
						callback(anno, body);
					}
				} catch (e ) {
					lore.debug.anno(e,e);
				}
			};
			req.open("GET",uri);
			req.setRequestHeader('User-Agent', 'XMLHttpRequest');
			req.setRequestHeader('Content-Type', 'application/text');
			req.send(null);
		} 
		catch (ex) {
			lore.debug.anno("Error in AJAX request: " + uri, {ex: ex});
			return null;
		}
	},
	
	/**
	 * Get annotation body value asynchronously. 
	 *
	 * @param {String} uri Fully formed request against Danno annotation server
	 * @param {window} The window object
	 * @return {Object} Server response as text or XML document.
	 */
	getBodyContentAsync : function(anno, window){
		var tthis = this;
		this.getBodyContent(anno, window, function callback(anno, body) {
			try {
				// check for location change while loading occurred 
				if (tthis.locationChanged(anno))
					return;
					
				var r = lore.global.util.findRecordById(tthis.annods, anno.id);
				
				
				if (r) {
					if (r.get('type') && r.get('type').indexOf('#MetadataAnnotation') > -1) {
						tthis.parseMetaBody(r, body);
					} else {
						r.set('body', body || '');
					}
					r.set('bodyLoaded', true);
				} else {
					lore.debug.anno("getBodyContentAsync: record not found", anno);
				}
			} 
			catch (e) {
				lore.debug.anno(e, e)
			}
			
			lore.debug.timeElapsed("End getBodyContentAsync() callback");
		});
	},
	
	parseMetaBody: function(anno, rdfBody) {
		var node = rdfBody.getElementsByTagNameNS(lore.constants.NAMESPACES["rdf"], 'Description');
		
		var meta = [];
		anno.beginEdit();
		if (node && node.length > 0) {
			var semanticEntity = node[0].getAttributeNS(lore.constants.NAMESPACES["rdf"], 'about');
			anno.set('semanticEntity', semanticEntity);
			
			var children = node[0].children;
			
			for (var i = 0; i < children.length; i++) {
				var metaObj = {};
					
//				metaObj.name = children[i].namespaceURI + children[i].localName;
				metaObj.name = children[i].localName;
				metaObj.value = children[i].textContent;
				
				if (metaObj.name === 'type') {
					anno.set('semanticEntityType', children[i].attributes[0].value);
				} else {					
					meta.push(metaObj);
				}
			}
		}
		anno.set('meta', meta);
		anno.endEdit();
	},
	
	
	locationChanged: function(anno) {
		if (!anno) {
			return false;
		}
		if (anno.isReply) {
			return false;
		}
		
		function stripFragment(url) {
			return url.replace(/\#.*$/,'');
		}
		var currentURL = stripFragment(lore.anno.ui.currentURL);
		
		if (anno.resource == currentURL || 
			anno.variant == currentURL ||
			anno.original == currentURL) {
			return false;
		}
		return true;
	},
	
	/**
	 * Updates the annotations store with updated values for the
	 * annotations for the specified URL from the annotation server
	 * @param {String} theURL The escaped URL
	 * @param {Function} callbackFunction Callback function used to output success or failure.
	 * The function must support the following parameters:
	 * result: Result as string ( 'success' or 'fail')
	 * resultMsg: Result message as string 
	 */
	updateAnnotationsSourceList : function(theURL, callbackFunc){
		if (!this.prefs.url) {
			lore.debug.anno("Annotation server URL not set!");
			return;
		}
		
		var queryURL = this.prefs.url + lore.constants.ANNOTEA_ANNOTATES + lore.global.util.fixedEncodeURIComponent(theURL);
		lore.debug.anno("Updating annotations with request URL: " + queryURL);
		
		var t = this;
		Ext.Ajax.request({
			url: queryURL,
			method: "GET",
			disableCaching: false,
			success: function(resp, opt) {
				try {
					lore.debug.anno("Success retrieving annotations from " + opt.url, resp);
					if (callbackFunc) 
						callbackFunc('success', resp);
					t.handleAnnotationsLoaded(resp);
				} catch (e ) {
					lore.debug.anno(e,e);
				}
			},
			failure: function(resp, opt){
				try {
					lore.debug.anno("Unable to retrieve annotations from " + opt.url, resp);
					if (callbackFunc)
						callbackFunc('fail', resp);
				} catch (e ) {
					lore.debug.anno(e,e);
				}
			},
			scope:this
		});
	},
	
	/**
	 * Search for annoations given the search parameters and update data searching data store
	 * @param {String} url Specific URL to filter on. Can be NULL if all URLs should be searched.
	 * @param {Object} filters An array of objects. The objects should have an 'attribute' and 'filter' attribute, where
	 * 'attribute' is the name of the search parameter and 'filter' is the value to search on. 
	 * @param {Function} resultCallback Callback function used to output success or failure.
	 * The function must support the following parameters:
	 * result: Result as string ( 'success' or 'fail')
	 * resultMsg: Result message as string 
	 */

	searchAnnotations : function (url, filters, resultCallback) {
		
		var queryURL = this.prefs.url + (url ? (lore.constants.ANNOTEA_ANNOTATES + url): lore.constants.DANNO_ALL_OBJECTS);
		for (var i = 0; i < filters.length; i++) {
			queryURL += '&'+filters[i].attribute+'=' + encodeURIComponent(filters[i].filter);
		}
		  
		lore.debug.anno("Peforming search with the following request URL: " + queryURL);
			
		Ext.Ajax.request({
			url: queryURL,
			method: "GET",
			disableCaching: false,
			success: function(resp, opt) {
				try {
					var annos = this.createAnnotationsFromRDF(resp.responseXML);
					this.annosearchds.loadData(annos);
						
					if (resultCallback) {
						resultCallback('success', resp);
					}
					
				} catch (e ) {
					lore.debug.anno(e,e);
				}
			},
			failure: function(resp, opt){
				try {
					lore.debug.anno("Unable to retrieve annotations from " + opt.url, resp);
					
				if ( resultCallback) resultCallback('fail', resp);
				} catch (e ) {
					lore.debug.anno(e,e);
				}
			},
			scope:this
		});
	},
	
	/**
	 * Clear the annotation store
	 */
	clearAnnotationStore : function() {
		this.annods.removeAll();
	},
	
	/**
	 * Load annotation data into the current data store  
	 * @param {Array} annotations
	 */
	loadAnnotation: function (annotations) {
		if (annotations.length && annotations.length == 0)
			return;
		if (!annotations.length)
			annotations = [annotations];
			
		var firstAnno = annotations[0];
		
		// find a leaf node
		while(firstAnno && firstAnno.isReply ) {
			firstAnno = lore.global.util.findRecordById(this.annods, firstAnno.resource).data;
		}

		// check that they haven't switched tabs since data was loaded from server, if not load into datastore		
		if (this.locationChanged(firstAnno)) {
			lore.debug.anno("loadAnnotation says switched tabs", {annotation:firstAnno,currentURL:lore.anno.ui.currentURL});
		} else {
			this.annods.loadData(annotations, true);
		}
	},

	
	/**
	 * Handler function that's called when annotation information is successfully
	 * returned from the server. Loads the annotations into the data store and loads
	 * the replies for annotations from the server.
	 * @param {Object} resp Response XML from the server
	 */
	handleAnnotationsLoaded : function(resp){
		var resultNodes = {};
		var xmldoc = resp.responseXML;
		
		if (xmldoc) {
			resultNodes = xmldoc.getElementsByTagNameNS(lore.constants.NAMESPACES["rdf"], "Description");
		
		}
		lore.debug.anno('handleAnnotationsLoaded()', {xml: xmldoc});
		
		this.clearAnnotationStore();
				
		if (resultNodes.length > 0) {
			var annotations = this.createAnnotationsFromRDF(xmldoc);

			
			lore.debug.anno('handleAnnotationsLoaded() loaded annotations', {annotations:annotations});
			// cater for tab change while annotations were downloaded from server
			if (this.locationChanged(anno)) {
			 	lore.debug.anno("Apparently, tab changed while annotations were downloading", {annotations:annotations});
				return;
			}
			
			for (var i = 0; i < annotations.length; i++) {
				try {
					this.getBodyContentAsync(annotations[i], window);
				} 
				catch (e) {
					lore.debug.anno('error loading body content: ' + e, e);
				}
			}
			
			this.loadAnnotation(annotations);
							
			
			// get annotation replies
			for (var i = 0; i < annotations.length; i++) {
				var anno = annotations[i];
				var annoID = anno.id;
				var annoType = anno.type;
				

				Ext.Ajax.request({
					disableCaching: false, // without this the request was failing
					method: "GET",
					url: this.prefs.url + lore.constants.ANNOTEA_REPLY_TREE + annoID,
					success: this.handleAnnotationRepliesLoaded,
					failure: function(resp, opt){
						lore.debug.anno("Unable to obtain replies for " + opt.url, resp);
					},
					scope:this
				});
			}
		}
		
		lore.debug.timeElapsed("End handleAnnotationsLoaded()");
	},
	
	/**
	 * Handler function that is called when for each annotation that has replies.
	 * The replies are loaded into the data store
	 * @param {Object} resp Response XML from the server.
	 */
	handleAnnotationRepliesLoaded : function(resp){
		try {
			var xmldoc = resp.responseXML;
			var replyList = xmldoc.getElementsByTagNameNS(lore.constants.NAMESPACES["rdf"], 'Description');
			var isLeaf = (replyList.length == 0);

			if (!isLeaf) {
				var replies = this.createAnnotationsFromRDF(xmldoc);
				
				for ( var i=0; i< replies.length; i++) {
					this.getBodyContentAsync(replies[i], window);
				}
				this.loadAnnotation(replies);
			}
		} catch (e ) {
			lore.debug.anno(e,e);
		}
	},
	
	/**
	 * For all top level annotations on a page ( those that are not replies), that are not variation annotations
	 * generated RDF and transform it using the stylesheet supplied
	 * @param {String} stylesheetURL The url of the stylesheet to use for transforming the RDF into another format
	 * @param {Object} params Parameters to supply
	 * @param {Boolean} serialize Specify whether the output will be serialized to a string. Defaults to a document fragment.
	 * @return {Object} If serialize was supplied as true, then resulting XML will be returned as a string otherwise as a document fragment  
	 */
	transformRDF: function(stylesheetURL, params, serialize){
		var annos = this.annods.queryBy( function (rec,id) { return !rec.data.isReply  && 
																		 !rec.data.type.match(lore.constants.NAMESPACES["vanno"]);}).getRange();
				
		return lore.global.util.transformRDF(stylesheetURL, this.serializer.serialize(annos, this.annods, true), 
											params, window, serialize) 
	},
	
	/** Generate a Word document from the top-level, non-variation annotations on the page
	 * @param domNode HTML node to serialize
	 * @return {String} The annotated page returned as String containing WordML XML.
	 */
	createAnnoWord: function(domNode){
		/* TODO: #117 - Further implementation required
		 
		var serializer= new XMLSerializer();
		var annos = this.annods.queryBy( function (rec,id) { return !rec.data.isReply  && 
																		 !rec.data.type.match(lore.constants.NAMESPACES["vanno"]);}).getRange();
		var theRDF = this.serializer.serialize(annos, this.annods, true);

		 //santize HTML
		var html = serializer.serializeToString(domNode);
		html = lore.global.util.sanitizeHTML(html, window);
		html = theRDF + "\n" + html;
		
		// For testing...
		//lore.global.util.writeFile(html, "c:\\", "test.txt", window);
		//return this.transformRDF("chrome://lore/content/annotations/stylesheets/wordml.xsl", {}, true);
				
		return lore.global.util.transformRDF("chrome://lore/content/annotations/stylesheets/wordml.xsl", html, {}, window, true) */
	},
	
	/**
	 * Serialize the annotations into an OAC RDF format
	 * 
	 * @param {} annos the list of annotations to serialize
	 * @param {} store the data store they're contained within
	 * @param {Boolean} showDates whether to save the annotation dates
	 * @return {String} serialized version of the annotations in OAC RDF
	 */
	createAnnoOAC: function (annos, store, showDates) {
		var oacSerializer = new lore.anno.OACAnnotationSerializer();
		
		return oacSerializer.serialize(annos, store, showDates);		
	},
	
	/**
	 * Serialize the current annotations on the page into the given format. 
	 * @param {String} format The format to serialize the annotations in. 'wordml' or 'rdf'.
	 * @return {String} Returns the serialized annotations in the new format
	 */
	serialize: function (format) {
		lore.debug.anno("serialize format: " + format);
		if ( format == 'wordml') {
			return this.createAnnoWord( lore.global.util.getContentWindow(window).document.body, true);
		} else if ( format == 'rdf') {
			return this.serializer.serialize(this.annods.getRange(), this.annods, true);
		} else if (format === 'oac') {
			return this.createAnnoOAC(this.annods.getRange(), this.annods, true);
		} else {
			return null;
		}
	},
	
	/**
	 * Start editing a record.
	 * 
	 * Always edit in the 'unsaved' store, either get the appropriate record from there
	 * or copy into it and use the copy.
	 */
	editRec: function(rec) {
		if (rec.store === this.annodsunsaved) {
			return rec;
		}
		
		// if in unedited store, move to editing store, then return
		if (rec.store === this.annods) {
			var unsaved = this.findUnsavedRecById(rec.data.id);
			if (!unsaved) {
				var clone = shallowClone(rec);
				this.annodsunsaved.loadData([clone], true);
				
				unsaved = lore.global.util.findRecordById(this.annodsunsaved, rec.data.id);
			}
			return unsaved;
		} else {
			lore.debug.anno("ERROR: The rec wasn't in either store!", rec);
		}
		
		function shallowClone(obj) {
			var clone = {};
			for (var e in obj.data) {
				clone[e] = obj.data[e];
			}
			return clone;
		}
	},
	
	updateStoredRec: function(unsavedRec) {
		var storedRec = this.findStoredRecById(unsavedRec.data.id)
		if (storedRec) {
			this.annods.remove(storedRec);
			this.annods.addSorted(unsavedRec.copy());
		}
	},
	
	findRecById : function (id) {
		return this.findStoredRecById(id) || this.findUnsavedRecById(id);
	},
	
	findUnsavedRecById : function (id) {
		return lore.global.util.findRecordById(this.annodsunsaved, id);
	},
	
	findStoredRecById : function (id) {
		return lore.global.util.findRecordById(this.annods, id);
	}
});
	

