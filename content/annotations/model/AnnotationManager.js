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

		this.addEvents(
            /**
			 * @event annochanged
			 * Fires when some annotations have been loaded
			 * @param {int} number of annotations loaded
			 */
			'annotationsloaded',
            'annotationrepliesloaded',
			'load',
			'remove',
			'update');
		// Copy configured listeners into *this* object so that the base class's
		// constructor will add them.
		this.listeners = config.listeners;

		// Call our superclass constructor to complete construction process.
		lore.anno.AnnotationManager.superclass.constructor.call(this, config);

		var fields = [
					{name: 'created'},
					{name: 'creator'},
					{name: 'title'},
					{name: 'body'},
					{name: 'bodyLoaded'},
					{name: 'modified'},
					{name: 'createdOrModified'},
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
					{name: 'semanticEntityType'},
					{name: 'privateAnno'}, 
                    {name: 'agentId'},
                    {name: 'compoundBody'}
        ];

		/** @property annods
         * @type Ext.data.JsonStore
         * The annotation store
		 */
		this.annods = lore.global.store.create(lore.constants.ANNOTATIONS_STORE,
		new Ext.data.JsonStore({	fields: fields,
									'data': {}
								}),  config.url);
		this.annodsunsaved =  new Ext.data.JsonStore({	fields: fields,
									'data': {}
								});

		/**
         * @property
         * @type Ext.data.JsonStore
         * The annotation search data store
		 */
		this.annosearchds =  new Ext.data.JsonStore({
									fields: fields
								});

		var mfields = [  {name: 'type'}, {name: 'prop'}, {name: 'value'}];
		/**
         * @property
         * @type Ext.data.JsonStore
         * The annotation metadata data store
		 */
		this.annousermetads =  new Ext.data.JsonStore( {
			fields: mfields,
			'data': {}
		});

		// model event handlers
		this.annods.on("load",  this.onDSLoad);
		this.annods.on("remove", this.onDSRemove);

		this.serializer = new lore.anno.RDFAnnotationSerializer();
        try{
            this.oacserializer = new lore.anno.OACAnnotationSerializer();
            this.wordserializer = new lore.anno.WordSerializer();
        } catch (e){
            lore.debug.anno("Error in AnnotationManager",e);
        }
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
                    var prec = lore.util.findRecordById(store, rec.data.about);
					if ( !prec) {
                        lore.debug.anno("Error. Couldn't find parent to update replies list");
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

            var prec = lore.util.findRecordById(store, rec.data.about);
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
		var anno = new lore.anno.Annotation({
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

		if (callback)	callback(anno);

		lore.debug.anno('AM.addAnnotation()', {currentContext:currentContext,anno:anno});

		this.annodsunsaved.loadData([anno], true);
        return lore.util.findRecordById(this.annodsunsaved, anno.id);
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
	persistAllAnnotations: function (currentURL) {

		var modified = [];
		this.annodsunsaved.each( function (rec) {
			if ( rec.dirty || rec.data.isNew() ) {
				modified.push(rec);
			}
		});

		var resultCounter = 0;
		var t = this;
		var callback = function () {
			resultCounter++;

			if (resultCounter == modified.length) {
				// once all annotations have been updated, refresh
				lore.global.store.removeCache(lore.constants.ANNOTATIONS_STORE, currentURL);
				t.updateAnnotationsSourceList(currentURL);
			}
		};


		for ( var i =0; i < modified.length; i++ ) {
			this.sendUpdateRequest(modified[i], callback);
		}
	},
	/**
	 * Send an annotation update to server
	 * @param {Object} anno The annotation
	 * @param {Object} resultCallback Callback when update finishes
     *
     * #private#
	 */
	sendUpdateRequest : function(annoRec, resultCallback){
		// don't send out update notification if it's a new annotation as we'll
		// be reloading datasource
		annoRec.commit(annoRec.data.isNew());
        if (!resultCallback) {
            resultCallback = function(){};
        }
        if (lore.anno.reposAdapter){
            lore.anno.reposAdapter.saveAnnotation(annoRec, resultCallback, this);
		this.annodsunsaved.remove(annoRec);
        }
	},


	/**
	 * Create or update the annotation in the remote repository
	 * @param {Object} anno The annotation to update/create
	 * @param {String} currentURL The URL of the page where the annotation is situated
	 * @param {Boolean} refresh Explicity states whether to re-read the list of annotations after update or use cached entries
	 */
	persistAnnotation: function(annoRec, currentURL, refresh){
		var t = this;
        delete this.justUpdated;
		var callback = function(request, action) {
            // parse response to get id of new/updated annotation
            t.justUpdated = t.getUpdatedAnnotationURI(request);
            if (action == 'create' || refresh) {
                    lore.global.store.removeCache(lore.constants.ANNOTATIONS_STORE, currentURL);
                    t.updateAnnotationsSourceList(currentURL);
            }
		};

		this.sendUpdateRequest(annoRec, callback);

	},
	/**
	 * Get the of the annotation just created or updated from the response
	 */
    getUpdatedAnnotationURI: function(res){
      var annos = this.createAnnotationsFromRDF(res.responseXML);
      if (annos.length > 0){
        return annos[0].id;
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

	deleteAnnotation: function(anno) {
		// remove the annotation from the server

		if ( anno.data.hasChildren()) {
            lore.anno.ui.loreError("Annotations with replies can not be deleted. Delete replies or edit annotation body.");
			return;
		}

		var existsInBackend = !anno.data.isNew();


		this.annodsunsaved.remove(anno);
        var successCallback = function(resp){
                    this.annods.remove(anno);
					lore.debug.anno("Deletion success: " + resp );
					lore.anno.ui.loreInfo('Annotation deleted');
        };
        var failureCallback = function(config){
            lore.debug.anno("Error: Annotation deletion failed: " + config.opts.url, config.resp);
            this.fireEvent('servererror', 'delete', config.resp);
                    lore.anno.ui.loreError('Unable to delete annotation');
            
            /*var msg = '<b>' + resp.statusText + '</b>'  
                    + '<br><br><a style="text-decoration:underline;color:blue" href="#" onclick="lore.util.launchWindow(\'data:text/html,' + encodeURIComponent(xhr.responseText) + '\',false,window)\">View Details</a>';  
            Ext.Msg.show({
                title : 'Unable to delete annotation',
                buttons : Ext.MessageBox.OK,
                msg : msg
            });
            */
        };
        if (existsInBackend && lore.anno.reposAdapter) {
            lore.anno.reposAdapter.deleteAnnotation(anno.data.id, successCallback, failureCallback, this);
		}
	},

	/**
	 * Creates an array of Annotations from a list of RDF nodes in ascending date
     * created order 
	 *
	 * @param {XMLDoc} xmldoc
	 *            XML Document containing annotations
	 * @param {Boolean} bodyEmbedded (Optional) Specify whether the annotations came from a file. Defaults to false.
	 * @return {Array} ordered array of Annotations
	 */
	createAnnotationsFromRDF : function(xmldoc, bodyEmbedded){
        processRDFProperties = function(anno, isReply){
	         var annoterm = anno.toString(); // with < > for query
             var annoconfig = {
                    id: anno.value.toString(), // without < >
                    isReply : isReply
             };
	         var aboutanno = rdfobj
	            .where(annoterm + " dc:creator ?creator")
	            .optional(annoterm + " dc:language ?lang")
	            .optional(annoterm + " dc:title ?title")
	            .optional(annoterm + " annotea:annotates ?resource") 
	            .optional(annoterm + " thread:inReplyTo ?about") // replies only
	            .optional(annoterm + " thread:root ?root") // replies only
	            .optional(annoterm + " annotea:created ?created")
	            .optional(annoterm + " annotea:modified ?modified")
	            .optional(annoterm + " annotea:context ?context")
	            .optional(annoterm + " vanno:original ?original")
	            .optional(annoterm + " vanno:variant ?variant")
	            .optional(annoterm + " vanno:original-context ?originalcontext")
	            .optional(annoterm + " vanno:variant-context ?variantcontext")
	            .optional(annoterm + " vanno:variation-agent ?variationagent")
	            .optional(annoterm + " vanno:variation-date ?variationdate")
	            .optional(annoterm + " vanno:variation-place ?variationplace")
	            .optional(annoterm + " annotea:body ?bodyURL")
                .optional(annoterm + " vanno:private ?privateAnno")
                .optional(annoterm + " vanno:meta-context ?metacontext")
                .optional(annoterm + " danno:owner ?agentId")
	            .get(0); // only process first match - ignores duplicate values for title, creator etc
	         // Look for types that aren't annotea:Annotation
             var annotype = rdfobj
                .where(annoterm + " a ?type")
                .filter(function(){
                    return this.type.value.toString().indexOf(lore.constants.NAMESPACES["annotea"]) != 0;
                }).get(0);
             if (annotype){
                annoconfig.type = annotype.type.value.toString();  
             }
	          // copy query result values into annoconfig
	         for (p in aboutanno){
	            if ("root" == p){ // for replies, we store the root as resource
	                annoconfig.resource = aboutanno.root.value.toString();   
	            } else if ("privateAnno" == p){
                    annoconfig.privateAnno = (aboutanno.privateAnno.value == "true"); 
                } else if ("metacontext" == p){
                    annoconfig.meta = { context: aboutanno.metacontext.value.toString().split('\n'), fields: []}; 
                } else if(isReply && "context" ==p){
                    annoconfig.context = ''; // LORE ignores context for replies
                } else if ("context" == p) {
                    annoconfig[p] = lore.util.normalizeXPointer(aboutanno[p].value.toString());
                } else {
	                annoconfig[p] = aboutanno[p].value.toString();
	            }
	         }
             // Process tags
             annoconfig.tags = "";
             rdfobj
                .where(annoterm + " vanno:tag ?tag").each(function(i){;
                   var tagval = this.tag.value.toString();
                   if (this.tag.type == "Literal"){
                      // freeform tag (not uri), make sure it is in tag list
                      Ext.getCmp('tagselector').fireEvent('newitem', Ext.getCmp('tagselector'), tagval);
                   }
                   if (i > 0){
                      annoconfig.tags += ",";
                   }
                   annoconfig.tags += tagval;
             });
	         return annoconfig;
	    };
        var tmp = [];
        var rdfdb = jQuery.rdf.databank();
        for (ns in lore.constants.NAMESPACES){
            rdfdb.prefix(ns,lore.constants.NAMESPACES[ns]);
        }
        rdfdb.load(xmldoc); 
        var rdfobj = jQuery.rdf({databank: rdfdb});
        // Create an annotation object for every annotation (and reply) matched in the RDF 
        var annoquery = rdfobj.where('?anno a annotea:Annotation');
        annoquery.each(function(){
              var annoconfig = processRDFProperties(this.anno, false);
              var tmpAnno = new lore.anno.Annotation(annoconfig);
              tmp.push(tmpAnno);
        });
        // Danno replies are not of type Annotation
        var replyquery = rdfobj.where('?anno a thread:Reply');
        replyquery.each(function(){
              var annoconfig = processRDFProperties(this.anno, true);
              var tmpAnno = new lore.anno.Annotation(annoconfig);
              tmp.push(tmpAnno);
        });
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

		var xhr = null;

		var handleResponse = function() {
			try {
				if (xhr.status != 200) {
					var hst = (uri.length < 65) ? uri : uri.substring(0, 64) + '...';
					throw new Error('Synchronous AJAX request status error.\n  URI: ' + hst +
					'\n  Status: ' + xhr.status);
				}

				var rtype = xhr.getResponseHeader('Content-Type');
				if (rtype == null) {
					var txt = xhr.responseText;
					var doc = null;
					if (txt && (txt.indexOf(':RDF') > 0)) {
						doc = xhr.responseXML;
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
                var processedText = "";
				if (rtype == 'application/xml' || rtype == 'application/xhtml+xml') {
					bodyContent = xhr.responseXML.getElementsByTagName('body');
					if (bodyContent[0]) {
						bodyText = serializer.serializeToString(bodyContent[0]);
					}
                    else if (xhr.responseText){
                    	processedText =  /<body.*?>((.|\n|\r)*)<\/body>/.exec(xhr.responseText);
                    	if (processedText && processedText.length > 0){
                            bodyText = processedText[1];
                    	}
					}
				} else if (rtype === 'application/rdf+xml') {
					return xhr.responseXML;
                } else if (xhr.responseText){
                	processedText = /<body.*?>((.|\n|\r)*)<\/body>/.exec(xhr.responseText); 
                	if (processedText && processedText.length > 0){
                        bodyText = processedText[1];
                	}
				}
				if (bodyText) {
                    return lore.util.sanitizeHTML(bodyText, window);
				}
				lore.debug.anno("No usable annotation body for content: " + rtype + " request: " + uri, xhr);
				return "";
			} catch (e ) {
                lore.debug.anno("Error in handleResponse", e);
			}
			return "";
		};

		try {
			xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function(){
				try {
					if (xhr.readyState == 4) {
						var body = handleResponse();
						callback(anno, body);
					}
				} catch (e ) {
                    lore.debug.anno("Error getting annotation body",e);
				}
			};
			xhr.open("GET",uri);
			xhr.setRequestHeader('User-Agent', 'XMLHttpRequest');
			xhr.setRequestHeader('Content-Type', 'application/text');
			xhr.send(null);
		}
		catch (ex) {
			lore.debug.anno("Error in AJAX request: " + uri, ex);
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

                var r = lore.util.findRecordById(tthis.annods, anno.id);


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
                lore.debug.anno("Error in getBodyContentAsync", e);
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
        var urlsAreSame = lore.util.urlsAreSame;
		if (!anno) {
			return false;
		}
		if (anno.isReply) {
			return false;
		}

        var currentURL = lore.anno.controller.currentURL;

		if (urlsAreSame(anno.resource, currentURL) ||
            urlsAreSame(anno.variant, currentURL) ||
            urlsAreSame(anno.original, currentURL)) {
			return false;
		}
		return true;
	},

	/**
	 * Updates the annotations store with updated values for the
	 * annotations for the specified URL from the annotation server
	 * @param {String} theURL The escaped URL
	 * @param {Function} filterFunction If set, instead of reloading all the annotations,
	 * 		merely adds the annotations matching the filter
	 */
	updateAnnotationsSourceList : function(theURL, filterFunction){
		if (!this.prefs.url) {
			lore.debug.anno("Annotation server URL not set!");
			return;
		}
		if (!filterFunction) {
			this.clearAnnotationStore();
		}
        if (lore.anno.reposAdapter){
            lore.anno.reposAdapter.getAnnotatesQuery(theURL, this, filterFunction);
				}
			},

	/**
	 * Search for annotations given the search parameters and update data searching data store
	 * @param {String} url Specific URL to filter on. Can be NULL if all URLs should be searched.
	 * @param {Object} filters An array of objects. The objects should have an 'attribute' and 'filter' attribute, where
	 * 'attribute' is the name of the search parameter and 'filter' is the value to search on.
	 * @param {Function} resultCallback Callback function used to output success or failure.
	 * The function must support the following parameters:
	 * result: Result as string ( 'success' or 'fail')
	 * resultMsg: Result message as string
	 */
	searchAnnotations : function (val, resultCallback) {

		var queryURL = this.createSearchQueryURL(val);


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

				} catch (e) {
					lore.debug.anno("Error searching annotations",e);
				}
			},
			failure: function(resp, opt){
				try {
					lore.debug.anno("Unable to retrieve annotations from " + opt.url, resp);
                    this.fireEvent('servererror', 'search', resp);
				    if (resultCallback) {
                        resultCallback('fail', resp);
                    }
				} catch (e) {
					lore.debug.anno("Error on failure searching annotations",e);
				}
			},
			scope:this
		});
	},

	createSearchQueryURL : function(vals) {
		var searchParams = {
			'creator': lore.constants.DANNO_RESTRICT_CREATOR,
			'datecreatedafter': lore.constants.DANNO_RESTRICT_AFTER_CREATED,
			'datecreatedbefore': lore.constants.DANNO_RESTRICT_BEFORE_CREATED,
			'datemodafter': lore.constants.DANNO_RESTRICT_AFTER_MODIFIED,
			'datemodbefore': lore.constants.DANNO_RESTRICT_BEFORE_MODIFIED
		};

		lore.debug.anno('createSearchQueryURL', {vals:vals});

		var filters = [];
		for (var e in vals) {
			var v = vals[e];
			// for each of the fields, determine whether they have a value
			// supplied and add them as a search filter if they do have a value
			if (v && e != 'url') {
				if (e.indexOf('date') == 0) {
					v = v.format("c");
				}

				filters.push({
							attribute : searchParams[e],
							filter : v
						});
			}
		}

		var url = vals['url'] != '' ? encodeURIComponent(vals['url']) : null;


		var queryURL = this.prefs.url + (url ? (lore.constants.ANNOTEA_ANNOTATES + url): lore.constants.DANNO_ANNOTEA_OBJECTS);
		for (var i = 0; i < filters.length; i++) {
			queryURL += '&'+filters[i].attribute+'=' + encodeURIComponent(filters[i].filter);
		}

		return queryURL;
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
        	var rec = lore.util.findRecordById(this.annods, firstAnno.resource);
        	if (rec && rec.data){
                firstAnno = rec.data;
        	}
		}

		// check that they haven't switched tabs since data was loaded from server, if not load into datastore
		if (this.locationChanged(firstAnno)) {
            lore.debug.anno("loadAnnotation says switched tabs", {annotation:firstAnno,currentURL:lore.anno.controller.currentURL});
		} else {
			this.annods.loadData(annotations, true);
		}
	},

	/**
	 * Handler function that's called when annotation information is successfully
	 * returned from the server. Loads the annotations into the data store and loads
	 * the replies for annotations from the server.
	 * @param {Object} resp Response XML from the server
	 * @param {Function} filterFunction filters the returned annotations, and only loads
	 * 					those matching the filter
	 */
	handleAnnotationsLoaded : function(resp, filterFunction){
		var resultNodes = {};
		var xmldoc = resp.responseXML;

		if (xmldoc) {
			resultNodes = xmldoc.getElementsByTagNameNS(lore.constants.NAMESPACES["rdf"], "Description");
		}
		
		//lore.debug.anno('handleAnnotationsLoaded()', {xml: xmldoc});

		if (resultNodes.length > 0) {
			var annotations = this.createAnnotationsFromRDF(xmldoc);
			
			if (filterFunction) {
				annotations = annotations.filter(filterFunction);
			}

			lore.debug.anno('handleAnnotationsLoaded() loaded ' + annotations.length + ' annotations', {annotations:annotations});
			// cater for tab change while annotations were downloaded from server
			// FIXME, this is broken, anno is not set here
			if (this.locationChanged(anno)) {
			 	lore.debug.anno("Apparently, tab changed while annotations were downloading", {annotations:annotations});
				return;
			}

			for (var i = 0; i < annotations.length; i++) {
				try {
                    if (!annotations[i].bodyLoaded){
					this.getBodyContentAsync(annotations[i], window);
				}
                }
				catch (e) {
                    lore.debug.anno('Error loading body content', e);
				}
			}

			this.loadAnnotation(annotations);


			// get annotation replies
			for (var i = 0; i < annotations.length; i++) {
				var anno = annotations[i];
				var annoID = anno.id;
				var annoType = anno.type;

                if (lore.anno.reposAdapter){
                    lore.debug.anno("getting replies for anno " + i);
                    lore.anno.reposAdapter.getRepliesQuery(annoID, this);
                }

			}
            if (this.justUpdated){
                lore.debug.anno("Annotation Manager updated an annotation " + this.justUpdated); 
            }
			this.fireEvent("annotationsloaded", annotations.length);
		}

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
            this.fireEvent("annotationrepliesloaded", this.justUpdated);
		} catch (e ) {
			lore.debug.anno("handleAnnotationRepliesLoaded",e);
		}
	},
    getFeedURL: function(){
        try{
	        var activetab = Ext.getCmp("navigationtabs").getActiveTab();
	        var queryURL = "";
	        if (activetab && activetab.id == "searchpanel"){ 
	            // if search tab is active, use search panel values to construct feed
	            var vals = activetab.advSearchForm.getForm().getFieldValues();
	            // TODO : update createSearchQueryURL with param to control whether to generate rss url
	            queryURL = this.createSearchQueryURL(vals).replace("/annotea","/rss");  
	        } else { // feed for browse results
               queryURL =  this.createSearchQueryURL({url: lore.anno.controller.currentURL}).replace("/annotea","/rss");
	        }
            lore.util.launchTab(queryURL,window);
        } catch (e){
            lore.debug.anno("Error creating feed url",e);
        }
    },
	

	/** Generate a Word document from the top-level, non-variation annotations on the page
	 * @param domNode HTML node to serialize
     * @return {Object} Properties: docxml (the document xml) and rels : array of links
	 */
    createAnnoWord: function(annos){
        return this.wordserializer.serialize(annos);
	},

	/**
	 * Serialize the annotations into an OAC RDF format
	 *
	 * @param {} annos the list of annotations to serialize
	 * @param {} store the data store they're contained within
	 * @param {Boolean} showDates whether to save the annotation dates
	 * @return {String} serialized version of the annotations in OAC RDF
	 */
    createAnnoOAC: function (annos, store, showDates, format) {
        return this.oacserializer.serialize(annos, store, showDates, format);
	},

	/**
	 * Serialize the current annotations on the page into the given format.
	 * @param {String} format The format to serialize the annotations in. 'wordml' or 'rdf'.
	 * @return {String} Returns the serialized annotations in the new format
	 */
	serialize: function (format) {
		if ( format == 'wordml') {
            return this.createAnnoWord(this.annods.getRange());//lore.util.getContentWindow(window).document.body, true);
		} else if ( format == 'rdf') {
			return this.serializer.serialize(this.annods.getRange(), this.annods, true);
		} else if (format === 'oac') {
            return this.createAnnoOAC(this.annods.getRange(), this.annods, true, "xml");
        } else if (format === 'oactrig') {
            return this.createAnnoOAC(this.annods.getRange(), this.annods, true, "trig");
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

                unsaved = lore.util.findRecordById(this.annodsunsaved, rec.data.id);
			}
			return unsaved;
		} else {
            lore.debug.anno("Error: The rec wasn't in either store!", rec);
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
		var storedRec = this.findStoredRecById(unsavedRec.data.id);
		if (storedRec) {
			this.annods.remove(storedRec);
			this.annods.addSorted(unsavedRec.copy());
		}
	},

	findRecById : function (id) {
		return this.findStoredRecById(id) || this.findUnsavedRecById(id);
	},

	findUnsavedRecById : function (id) {
        return lore.util.findRecordById(this.annodsunsaved, id);
	},

	findStoredRecById : function (id) {
        return lore.util.findRecordById(this.annods, id);
	},

	numUnsavedAnnotations: function() {
		return this.annodsunsaved.getCount();
	}
});
