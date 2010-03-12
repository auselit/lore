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
 * Annotations
 * @singleton
 * @class lore.anno
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
					{name: 'hasChildren'}
                        ];
						
		/** @property annods
         * @type Ext.data.JsonStore
         * The annotation store
		 */								
		this.annods = lore.anno.annods = lore.global.store.create(lore.constants.ANNOTATIONS_STORE,
		new Ext.data.JsonStore({	fields: fields,
									data: {}
								}),  config.url);
		this.annodsunsaved =  lore.anno.annodsunsaved = new Ext.data.JsonStore({	fields: fields,
									data: {}
								});
								
		/**
         * @property 
         * @type Ext.data.JsonStore
         * The annotation search data store
		 */
		this.annosearchds = lore.anno.annosearchds = new Ext.data.JsonStore({
									fields: fields,
									data: {}
								});
		
		var mfields = [  {name: 'type'}, {name: 'prop'}, {name: 'value'}];
		/**
         * @property 
         * @type Ext.data.JsonStore
         * The annotation metadata data store
		 */
		this.annousermetads = lore.anno.annousermetads = new Ext.data.JsonStore( {
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
	 * @param {Object} currentURL The URL for the page this annotation is on
	 * @param {Object} parent (Optional) The parent of this annotation
	 */
	addAnnotation : function(currentContext, currentURL, parent){
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
			title: (parent ? "Re: " + parent.data.title:"New Annotation"),
			type: lore.constants.NAMESPACES["annotype"] + "Comment",
			lang: "en",
			isReply: (parent ? true: null),
			meta: {
				context: null,
				fields: []
			},
			bodyLoaded: true
		});
		
		this.annodsunsaved.loadData([anno], true); 
		//TODO: bodyLoaded? it's use
		//var r = lore.global.util.findRecordById(this.annods, anno.id);
		//if ( r)
		//	r.data.bodyLoaded = true;
		
		return anno;
	},
	
	/**
	 * Create or update the annotations in the remote repository.
	 * These actions are performed for all annotations that are flagged as 'dirty'. 
	 * @param {String} currentURL The URL of the page where the annotations are situated
	 * @param {String} filterURL Only update annotations if their resource URL matches the URL given
	 * @param {Function} resultCallback A callback function that is used by the function to output success or failure
	 * The callback should support the following parameters
	 * rec: The record that was updated
	 * action: Action performed on the record ('create' or 'update')
	 * result: Result as a string ('success' or 'fail') 
	 * resultMsg: Result message 
	 */
	updateAnnotations : function (currentURL, filterURL, resultCallback) {
		
		this.annodsunsaved.each( function (rec) 
		{
			//TODO: fix for replies
			//if ( filterURL && rec.data.context!= filterURL )
			//	return;
			
			if ( rec.dirty ) {
				this.updateAnnotation(rec, currentURL, false, function (action,result,resultMsg) {
					resultCallback(rec, action, result, resultMsg);
				});
				///TODO: check whether to change to use this
				/*
				 * function (action, result, resultMsg) {
					var successes = []
				var failures = [];
					if (result == "success") {
					successes.push({
						rec: anno,
						action: action,
						result: result,
						resultMsg: resultMsg
					});
				}
				else {
					failures.push({
						rec: anno,
						action: action,
						result: result,
						resultMsg: resultMsg
					});
				}
				 */
			}
			
			
		});

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
	updateAnnotation : function(anno, currentURL, refresh, resultCallback){
	
		// don't send out update notification if it's a new annotation as we'll
		// be reloading datasource
		anno.commit(anno.data.isNew());
		
		
		var annoRDF = this.serializer.serialize([anno.data], this.annods);
		
		var xhr = new XMLHttpRequest();
		if (anno.data.isNew()) {
			lore.debug.anno("creating new annotation")
			// create new annotation
			xhr.open("POST", this.prefs.url, true);
			xhr.setRequestHeader('Content-Type', "application/rdf+xml");
			xhr.setRequestHeader('Content-Length', annoRDF.length);
			var t = this;
			xhr.onreadystatechange = function(){
				try {
				
				if (xhr.readyState == 4) {
					if (resultCallback) {
						var result = xhr.status == 201 ? 'success' : 'fail';
						resultCallback('create', result, xhr.responseText ? xhr.responseText : xhr.statusText);
						lore.global.store.remove(lore.constants.ANNOTATIONS_STORE, currentURL);
						t.updateAnnotationsSourceList(currentURL);
						
					}
				}
				
			} catch(e ) {
				lore.debug.anno("error: " + e);
			}
			};
			xhr.send(annoRDF);
			lore.debug.anno("RDF of new annotation", annoRDF);
			
			//this.annods.remove(anno);
			this.annodsunsaved.remove(anno);
		}
		else {
			lore.debug.anno("updating existing annotation")
			// Update the annotation on the server via HTTP PUT
			xhr.open("PUT", anno.data.id, true);
			xhr.setRequestHeader('Content-Type', "application/xml");
			var t = this;
			xhr.onreadystatechange = function(){
				if (xhr.readyState == 4) {
					if (resultCallback) {
						var result = xhr.status == 200 ? 'success' : 'fail';
						resultCallback('update', result, xhr.statusText);
						if (refresh) {
							lore.global.store.remove(lore.constants.ANNOTATIONS_STORE, currentURL);
							t.updateAnnotationsSourceList(currentURL);
						}
					}
				}
			};
			xhr.send(annoRDF);
			lore.debug.anno("RDF of updated annotation", annoRDF);
			this.annodsunsaved.remove(anno);
		}

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
						
						//TODO: remove from the cache
						//lore.global.store.remove(this.annods, );
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
	 * @param {NodeList} nodeList
	 *            Raw RDF list in arbitrary order
	 * @param {Boolean} bodyOp (Optional) Specify whether the annotations came from a file. Defaults to false.
	 * @return {Array} ordered array of Annotations
	 */
	orderByDate : function(nodeList, bodyEmbedded){
		var tmp = [];
		for (var j = 0; j < nodeList.length; j++) {
			try {
				tmp[j] = new lore.anno.Annotation(nodeList[j], bodyEmbedded);
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
	 getBodyContent : function(anno, window, callback){
		
		var uri = anno.bodyURL;
		var async = callback != null;
		var req = null;
		
		var handleResponse = function(){
			
			if (req.status != 200) {
				var hst = (uri.length < 65) ? uri : uri.substring(0, 64) + '...';
				throw new Error('Synchronous AJAX request status error.\n  URI: ' + hst +
				'\n  Status: ' +
				req.status);
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
			}
			else {
				bodyText = /<body.*?>((.|\n|\r)*)<\/body>/.exec(req.responseText)[1];
			}
			
			if (bodyText) {
				return lore.global.util.sanitizeHTML(bodyText, window);
			}
			lore.debug.anno("No usable annotation body for content: " + rtype + " request: " + uri, req);
			return "";
		}
		
		try {
			req = new XMLHttpRequest();
			//req.open('GET', uri, false);
			
			if (async) {
				req.onreadystatechange = function(){
					try {
			
						if (req.readyState == 4) {
							var b = handleResponse();
							callback(anno, b);
						}
					} catch (e ) {
						lore.debug.anno(e,e);
					}
				};
			}
			
			req.open("GET",uri, async);
			req.setRequestHeader('User-Agent', 'XMLHttpRequest');
			req.setRequestHeader('Content-Type', 'application/text');
			req.send(null);
			
			if (!async){
				return handleResponse();
			}
		} 
		catch (ex) {
			lore.debug.anno("Error in AJAX request: " + uri, {
				async: async,
				ex: ex
			});
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
	
		var callback = function(anno, txt){
			try {
				var url = encodeURIComponent(lore.global.util.getContentWindow(window).location);
				
				// check for location change while loading occurred 
				if ( !anno.isReply && 
				 ((!anno.variant && encodeURIComponent(anno.resource) != url) 
			 ||  (anno.variant && encodeURIComponent(anno.original) != url &&
			 	encodeURIComponent(anno.variant) != url)))
					return;
					
				var r = lore.global.util.findRecordById(this.annods, anno.id);
				if (r) {
					r.data.body = txt || '';
					r.data.bodyLoaded = true;
					r.commit();
				} else {
					lore.debug.anno("getBodyContentAsync: record not found", anno);
				}
			} 
			catch (e) {
				lore.debug.anno(e, e)
			}
		}
		
		this.getBodyContent(anno, window, callback);
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
	
		// check cache
		var annotations = lore.global.store.get(lore.constants.ANNOTATIONS_STORE, theURL);
		
		if (annotations) {
			lore.debug.anno("Using cached annotation data...");
			this.clearAnnotationStore();
			this.annods.loadData(annotations, true);
			return; 
		}
		
		lore.debug.anno('ths prefs object is ' + this.prefs, this.prefs);				
		// Get annotations for theURL
		if (this.prefs.url) {
			var queryURL = this.prefs.url + lore.constants.ANNOTEA_ANNOTATES + encodeURIComponent(theURL).replace(/%5D/g,'%255d');
			lore.debug.anno("Updating annotations with request URL: " + queryURL);
			
			var t = this;
			Ext.Ajax.request({
				url: queryURL,
				method: "GET",
				disableCaching: false,
				success: function(resp, opt) {
					try {
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
					if ( callbackFunc) callbackFunc('fail', resp);
					} catch (e ) {
						lore.debug.anno(e,e);
					}
				},
				scope:this
			});
		}
		else {
			lore.debug.anno("Annotation server URL not set!");
		}
	},
	
	/**
	 * 
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
			queryURL += '&'+filters[i].attribute+'=' + encodeURIComponent(filters[i].filter).replace(/%5D/g,'%255d');
		}
		  
		lore.debug.anno("Peforming search with the following request URL: " + queryURL);
			
		Ext.Ajax.request({
			url: queryURL,
			method: "GET",
			disableCaching: false,
			success: function(resp, opt) {
				try {
					var annos = resp.responseXML.getElementsByTagNameNS(lore.constants.NAMESPACES["rdf"], 'Description');
					
					annos = this.orderByDate(annos);
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
	 * Load annotation data into the current data store and cache the data
	 * @param {Object} annotations
	 */
	loadAnnotation : function ( annotations) {
		if ( !annotations.length)
			annotations = [annotations];
			
		var a = annotations[0];
		
		// find a leaf node
		while(a && a.isReply ) {
			a = lore.global.util.findRecordById(this.annods, a.resource).data;
		}
		
		if ( a.resource == lore.anno.ui.currentURL || ( (a.variant && a.variant == lore.anno.ui.currentURL) ||
			(a.original && a.original == lore.anno.ui.currentURL) )) {
			this.annods.loadData(annotations, true);
			
			var ds = lore.global.store.get(lore.constants.ANNOTATIONS_STORE, lore.anno.ui.currentURL);
			if ( !ds )
				ds = [];
		
			ds = ds.concat(annotations);
			lore.global.store.set(lore.constants.ANNOTATIONS_STORE, ds, lore.anno.ui.currentURL, this.prefs.cachetimeout);
					
		} else {
			//TODO:  they've switched pages, continue to load data for caching purposes
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
		lore.debug.anno('handleAnnotationsLoaded()', {
			xml: xmldoc,
			nodes: resultNodes
		});
		
		this.clearAnnotationStore();
				
		if (resultNodes.length > 0) {
			var annotations = this.orderByDate(resultNodes );
			var url = encodeURIComponent(lore.global.util.getContentWindow(window).location);

			// cater for tab change while annotations were downloaded from server
			if ( (!annotations[0].variant && encodeURIComponent(annotations[0].resource) != url) 
			 ||  (annotations[0].variant && encodeURIComponent(annotations[0].original) != url &&
			 	encodeURIComponent(annotations[0].variant) != url))
					return;
				
			for (var i = 0; i < annotations.length; i++) {
				try {
					annotations[i].body = this.getBodyContent(annotations[i], window);
					annotations[i].bodyLoaded = true;
				} 
				catch (e) {
					lore.debug.anno('error loading body content: ' + e, e);
				}
			}
			
			// TODO: should this be in loadAnnotation? and shouldn't be checking
			// against the URL ?
			// remove annotatino from datatstore that have been updated
			var recs = this.annods.getRange();
			
			for ( var i =0; i < recs.length; i++) {
				for (var j = 0; j < annotations.length; j++) {
					if (recs[i].data.id == annotations[j].id) {
						//lore.debug.anno("j: " + j + ", " + recs[i].data.id, recs[i]);
						annotations[i] = recs[i].data;
						this.annods.remove(recs[i]);
					}
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
		};
	},
	
	/**
	 * Handler function that is called when for each annotation that has replies.
	 * The replies are loaded into the data store
	 * @param {Object} resp Response XML from the server.
	 */
	handleAnnotationRepliesLoaded : function(resp){
		try {
			var replyList = resp.responseXML.getElementsByTagNameNS(lore.constants.NAMESPACES["rdf"], 'Description');
			var isLeaf = (replyList.length == 0);
			//TODO: bodyOp, use constants
			if (!isLeaf) {
				replies = this.orderByDate(replyList);
				
				//if ( replies[0].resource != lore.global.util.getContentWindow(window).location)
				//	return;
				for ( var i=0; i< replies.length; i++) {
					replies[i].body = this.getBodyContent(replies[i], window);
					replies[i].bodyLoaded = true;
				}
				
				//TODO: same as the other TODO in handleAnnotationsLoaded RE: loadAnnotation and this
				// segment of code
				// don't add records that are already in the datastore
				var recs = this.annods.getRange();
				for ( var i =0; i < recs.length; i++) {
					for (var j = 0; j < replies.length; j++) {
						if (recs[i].data.id == replies[j].id) {
							lore.debug.anno("j: " + j + ", " + recs[i].data.id, recs[i]);
							replies[i] = recs[i].data;
							
						}
					}
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
	transformRDF : function(stylesheetURL, params, serialize){
		var annos = this.annods.queryBy( function (rec,id) { return !rec.data.isReply  && 
																		 !rec.data.type.match(lore.constants.NAMESPACES["vanno"]);}).getRange();
				
		return lore.global.util.transformRDF(stylesheetURL, this.serializer.serialize(annos, this.annods, true), 
											params, window, serialize) 
	},
	
	/** Generate a Word document from the top-level, non-variation annotations on the page
	 * @param domNode HTML node to serialize
	 * @return {String} The annotated page returned as String containing WordML XML.
	 */
	createAnnoWord : function(domNode){
		/* TODO: needs finishing
		 
		 var serializer= new XMLSerializer();
		
		// attach a span in the location of the highlight for each annotation
		// santize
		// go through and search replace, adding the rdf
		// stylesheet transform
		
		//TODO: do as the comments say above, this code is for testing out the stylesheet transform
		// logic, as it supplied a stream with RDF & HTML.
		var annos = this.annods.queryBy( function (rec,id) { return !rec.data.isReply  && 
																		 !rec.data.type.match(lore.constants.NAMESPACES["vanno"]);}).getRange();
		var theRDF = this.serializer.serialize(annos, this.annods, true);

		 //santize HTML
		var html = serializer.serializeToString(domNode);
		html = lore.global.util.sanitizeHTML(html, window);
		html = theRDF + "\n" + html;
		
		//lore.global.util.writeFile(html, "c:\\", "test.txt", window);
		//return this.transformRDF("chrome://lore/content/annotations/stylesheets/wordml.xsl", {}, true);
				
		return lore.global.util.transformRDF("chrome://lore/content/annotations/stylesheets/wordml.xsl", html, {}, window, true) */
	},
	
	/**
	 * Serialize the current annotations on the page into the given format. 
	 * @param {String} format The format to serialize the annotations in. 'wordml' or 'rdf'.
	 * @return {String} Returns the serialized annotations in the new format
	 */
	serialize : function ( format) {
		lore.debug.anno("serialize format: " + format);
		if ( format == 'wordml') {
			return this.createAnnoWord( lore.global.util.getContentWindow(window).document.body, true);
		} else if ( format == 'rdf') {
			return this.serializer.serialize(this.annods.getRange(), this.annods, true);
		} else {
			return null;
		}
	},
	
	// Intentionally left unimplemented
	importRDF : function( theRDF, theurl, callback){
		// The Danno annotation server provides importing facilities
		// via a web form. Originally importing was done via client, and this is code
		// is in SVN. 
	}
});
	

