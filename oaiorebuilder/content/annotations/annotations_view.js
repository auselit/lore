/*
 * Copyright (C) 2008 - 2009 School of Information Technology and Electrical
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

	try {
		lore.anno.ui.colourLookup = new Array("#00FF00", "#FFFF00", "#00FFFF", "#FF00FF", "#FF8000", /*"#80FF00",*/ "#00FF80", "#0080FF", "#8000FF", "#FF0080", "#FFC000", "#C0FF00", "#00FFC0", "#00C0FF", "#C000FF", "#FF00C0", "#FF4000", /*"#40FF00", "#00FF40",*/ "#0040FF", /*"#4000FF",*/ "#FF0040", "#0000FF" /*, "#FF0000",*/);
		
		lore.anno.ui.multiSelAnno = new Array();
		lore.anno.ui.colourForOwner = {};
		lore.anno.ui.colourCount = 0;
		lore.anno.ui.curSelAnno;
		lore.anno.ui.curAnnoMarkers = new Array();
		
		
	/**
	 * General functions
	 */
	lore.anno.ui.loreMsg = function(message, iconCls){
		if (!lore.anno.ui.loreMsgStack) {
			lore.anno.ui.loreMsgStack = [];
		}
		iconCls = iconCls || '';
		message = '<div class="status-bubble-icon ' + iconCls + '"></div><div class="status-bubble-msg">' + message + "</div>";
		
		lore.anno.ui.loreMsgStack.push(message);
		Ext.Msg.show({
			msg: '',
			modal: false,
			closable: true,
			width: window.innerWidth
		});
		Ext.Msg.updateText(lore.anno.ui.loreMsgStack.join('<br/>'));
		var w = Ext.Msg.getDialog();
		w.setPosition(0, window.innerHeight - w.getBox().height);
		
		window.setTimeout(function(){
			try {
				if (lore.anno.ui.loreMsgStack.length == 1) {
					lore.anno.ui.loreMsgStack.pop();
					Ext.Msg.hide();
				}
				else {
					lore.anno.ui.loreMsgStack.splice(0, 1);
					Ext.Msg.updateText(lore.anno.ui.loreMsgStack.join('<br/>'));
					var w = Ext.Msg.getDialog();
					w.setPosition(0, window.innerHeight - w.getBox().height);
				}
			} 
			catch (e) {
				lore.debug.ui(e, e);
			}
		}, 3000);
		
	}
	
	
	lore.anno.ui.loreInfo = function(message ) {
		lore.anno.ui.loreMsg(message, 'info-icon');
		lore.global.ui.loreInfo(message);
	}
	
	lore.anno.ui.loreError = function(message) {
		lore.anno.ui.loreMsg(message, 'error-icon');
		lore.global.ui.loreError(message);	
		
	}
	lore.anno.ui.loreWarning = function(message) {
		lore.anno.ui.loreMsg(message, 'warning-icon');
		lore.anno.ui.global.loreWarning(message);
	}
	
	
			
	lore.anno.ui.setdccreator = function(creator){
			lore.defaultCreator = creator;
	}
	/**
	 * Set the global variables for the repository access URLs
	 *
	 * @param {}
	 *            rdfrepos The repository access URL
	 * @param {}
	 *            rdfrepostype The type of the repository (eg sesame, fedora)
	 * @param {}
	 *            annoserver The annotation server access URL
	 */
	lore.anno.ui.setRepos = function(annoserver){
		lore.anno.annoURL = annoserver; // annotation server
	}
	
		//loreOpen
	lore.anno.ui.show = function(){
				lore.anno.ui.lorevisible = true;
			
			if (lore.anno.ui.currentURL && lore.anno.ui.currentURL != 'about:blank' &&
			lore.anno.ui.currentURL != '' &&
			(!lore.anno.ui.loadedURL || lore.anno.ui.currentURL != lore.anno.ui.loadedURL)) {
				lore.anno.ui.loreInfo("Loading annotations for " + lore.anno.ui.currentURL);
				lore.anno.updateAnnotationsSourceList(lore.anno.ui.currentURL, function (result, resultMsg) {
					if (result == 'fail') {
						lore.anno.ui.loreError("Failure loading annotations for page.");
					}
				});
				lore.anno.ui.loadedURL = lore.anno.ui.currentURL; //TODO: this could be shared code
			}
		}
		
		//loreClose
		lore.anno.ui.hide = function(){
			lore.anno.ui.lorevisible = false;
		}
	
		lore.anno.ui.updateUIElements = function(rec){
			// update the highlighted fields colour in the event the creator is changed
			// the colour is identified by the creator's name
			//lore.anno.ui.updateHighlightFields(lore.anno.ui.curAnnoMarkers, lore.anno.ui.getCreatorColour(rec.data.creator));
			lore.anno.ui.hideMarker();
			lore.anno.ui.highlightCurrentAnnotation(rec);
			
			if (lore.anno.ui.multiSelAnno.length > 0) {
				// hide then reshow 
				lore.anno.ui.showAllAnnotations();
				lore.anno.ui.showAllAnnotations();
			}
			
		}
		
		lore.anno.ui.setCurrentAnno = function (rec) {
			lore.anno.ui.hideMarker();
			lore.anno.ui.curSelAnno = rec;	
		}
		
		
		lore.anno.ui.genAnnotationCaption = function(anno, formatStr){
			var buf = '';
			
			
			for ( var i=0; i < formatStr.length; i++) {
				switch ( formatStr[i]) {
					case 't': 
						buf += lore.global.util.splitTerm(anno.type).term;
						break;
					case 'c':
						buf += anno.creator
						break;
					case 'd':
						buf += lore.global.util.shortDate(anno.created, Date);
						break;
					case 'D':
						buf += lore.global.util.longDate(anno.created, Date);
						break;
					case 'r':
						var replies = "";
						if ( anno.replies) {
							var numreplies = lore.anno.calcNumReplies(anno);
							if (numreplies > 0) {
								replies = " (" + numreplies + (numreplies == 1 ? " reply" : " replies") + ")";
							}
						}
						buf += replies;
						break;
					case '\\':
						if ( i < formatStr.length -1 ) {
							i++;
							buf += formatStr[i];
						}
						break;
					default:
						buf += formatStr[i];
				}
			}
		 
			return buf;
		}
		
		lore.anno.ui.getAnnoTitle = function(anno){
			var title = anno.title;
			if (!title || title == '') {
				title = "Untitled";
			}
			return title;
		}
		
		lore.anno.ui.genTipForAnnotation = function(annodata, domContainer){
			try {
				//TODO: Replace with an existing pop-up library? 
				var uid = annodata.id;
				var obj = document.createElement("span");
				obj.setAttribute("id", uid);
				var desc = "<span style='font-size:smaller;color:#51666b;'>" + lore.global.util.splitTerm(annodata.type).term +
				" by " +
				annodata.creator +
				"</span><br />";
				desc += lore.anno.ui.genDescription(annodata, true);
				var d = lore.global.util.longDate(annodata.created, Date);
				desc += "<br /><span style=\"font-size:smaller;color:#aaa>" + d + "</span><br />";
				obj.innerHTML = desc;
				
				
				var doc = lore.global.util.getContentWindow(window).document;
				var tipContainer = doc.getElementById("tipcontainer");
				
				// create the tip container and import the script onto the page
				// if first time a tip is created			
				if (tipContainer == null) {
					tipContainer = doc.createElement("div");
					tipContainer.id = "tipcontainer";
					tipContainer.style.display = "none";
					
					doc.body.appendChild(tipContainer);
					
					lore.global.util.injectScript("content/lib/wz_tooltip.js", lore.global.util.getContentWindow(window));
					
				}
				
				// add tip to the container
				if (doc.getElementById(uid) == null) {
					tipContainer.appendChild(obj);
				}
				else {
					tipContainer.replaceChild(obj, doc.getElementById(uid));
				}
				
				// set events via DOM so that events are handled in the context of the content window
				// and not the extension
				domContainer.setAttribute("onmouseover", "TagToTip('" + uid +
				"',CLOSEBTN, true, STICKY, true, SHADOW, true, BGCOLOR, '#ffffff', " +
				"BORDERCOLOR, '#51666b', TITLEBGCOLOR, '#cc0000', TITLE,'" +
				annodata.title.replace(/'/g, '&apos;') +
				"');");
				domContainer.setAttribute("onmouseout", "UnTip();");
			} 
			catch (ex) {
				lore.debug.anno("Tip creation failure: " + ex, ex);
			}
		}
		
		/*lore.anno.ui.genPreview = function(annodata){
			var body = lore.anno.ui.replaceImgTag(lore.global.util.externalizeLinks(annodata.body));
			body = Components.classes["@mozilla.org/feed-unescapehtml;1"].getService(Components.interfaces.nsIScriptableUnescapeHTML).unescape(body);
			
			if (body.length > 67) {
				body = body.substring(0, 67) + "..."
			}
			return body;
		}
		
		lore.anno.ui.replaceImgTag = function(body){
			// TODO: this is a hacky function, not meant to be kept in this format
			var ind = 0;
			while (ind != -1 || ind >= body.length) {
				var ind = body.indexOf("<", ind);
				if (ind != -1) {
					var tmpind = body.indexOf("img", ind);
					if (tmpind == -1) {
						ind = body.indexOf("IMG", ind);
					}
					else {
						ind = tmpind;
					}
					if (ind != -1) {
						body = body.substring(0, ind - 1) + " [image attached] " + body.substring(body.indexOf(">", ind) + 1);
						ind = ind + " [image attached] ".length;
					}
				}
			}
			return body;
		}*/
		
		
		
		
		/** Timeline Functions **/
		
		lore.anno.ui.getTimelineDescription = function(anno){
			return "<span style='font-size:small;color:#51666b;'>" 
			// lore.global.util.splitTerm(anno.type).term +
			//" by " +
			//anno.creator +
			+ lore.anno.ui.genAnnotationCaption(anno, 't by c') + 
			"</span><br/> " +
			lore.anno.ui.genDescription(anno) +
			"<br />" +
			lore.anno.genTagList(anno);
			
			
		}
		
		lore.anno.ui.addAnnoToTimeline = function(anno, title){
				// TODO: need to determine what clumps of annotations are close to each other
				// and what the threshold should be then, should create a Hotzone so that these
				// annotations are displayed more evenly
				
			if (lore.anno.ui.annoEventSource) {
			
				var annoicon = "comment.png";
				
				if (anno.isReply) {
					annoicon = "comments.png";
				}
				
				var dateEvent = new Date();
				
				dateEvent = Date.parseDate(anno.created, "c");
				
				var evt = new Timeline.DefaultEventSource.Event({
					instant: true,
					
					icon: "chrome://lore/skin/icons/" + annoicon,
					
					start: dateEvent,
					
					text: title,
					
					id: anno.id,
					
					eventID: anno.id,
					
					description: lore.anno.ui.getTimelineDescription(anno)
				});
				
				
				lore.anno.ui.annoEventSource.add(evt);
				lore.anno.ui.annotimeline.getBand(0).setCenterVisibleDate(evt.getStart());
			}
			
		}
		
		lore.anno.ui.updateAnnoInTimeline = function(anno){
			var evt = lore.anno.ui.annoEventSource.getEvent(anno.id);
			if (evt) {
				evt.text = anno.title;
				evt.caption = lore.anno.ui.genAnnotationCaption(anno, 't by c');
				evt.description = lore.anno.ui.getTimelineDescription(anno);
				lore.anno.ui.scheduleTimelineLayout();
			}
		}
		
		lore.anno.ui.scheduleTimelineLayout = function(){
			// Timeline needs to be visible to do layout otherwise it goes blank
			// check if timeline is active tab, if not, do layout on next activation
			
			
			var tltab = Ext.getCmp("annotimeline");
			var activetab = Ext.getCmp("annotationstab").getActiveTab();
			if (activetab == tltab) {
				lore.anno.ui.annotimeline.layout();
			}
			else {
				if (!lore.anno.ui.scheduleTimelineLayout.once || lore.anno.ui.scheduleTimelineLayout.once == 0) {
					lore.anno.ui.scheduleTimelineLayout.once = 1;
					tltab.on("activate", function(){
						lore.anno.ui.scheduleTimelineLayout.once = 0;
						lore.anno.ui.annotimeline.layout();
					}, this, {
						single: true
					});
				}
				
			}
		}
		
		
		lore.anno.ui.showAnnoInTimeline = function(annoid){
			try {
				Ext.getCmp("annotimeline").on("activate",
				function() {
					var band = lore.anno.ui.annotimeline.getBand(0);
					band.closeBubble();
					band.showBubbleForEvent(annoid);
				}, this, {
					single: true
				});
				
				lore.anno.ui.views.activate("annotimeline");
				
				
			} catch (e ) {
				lore.debug.anno("Error showing annotation in timeline: " +e ,e );
			}
		}
				
		/** Form Editor Functions */
		
		/*
		 Can use for debugging purposes when isDirty() is overzealous on the form
		 
		 lore.anno.ui.isDirty = function() {
		 var dirtyList = [];
		 lore.anno.ui.form.items.each( function (item, index, length) {
		 if ( item.isDirty()) {
		 
		 dirtyList.push(item.getName());
		 }
		 });
		 
		 alert("The dirty items are: " + dirtyList.join());
		 
		 }*/
		
		lore.anno.ui.rejectChanges = function(){
			lore.anno.ui.curSelAnno.reject();
		}
		
		lore.anno.ui.hideAnnotation = function() {
			if ( lore.anno.ui.formpanel.isVisible() ) {
				lore.anno.ui.formpanel.hide();
				Ext.getCmp("treeview").doLayout();
			}
		}
		lore.anno.ui.showAnnotation = function(rec, loadOnly){
			try {
				// display contents of context
				if (rec.data.context) {
					
					var ctxtField = lore.anno.ui.form.findField('contextdisp');
					if (rec.data.original == lore.anno.ui.currentURL) {
						var selText = '';
						try {
							selText = lore.global.util.getSelectionText(
							rec.data.context, lore.global.util.getContentWindow(window))
						} 
						catch (e) {
						}
						
						lore.anno.ui.form.setValues([{
							id: 'contextdisp',
							value: '"' + selText + '"'
						}]);
					} else if ( !lore.anno.ui.topView.variationContentWindowIsVisible() ){
						lore.anno.ui.updateSplitter(lore.anno.ui.curSelAnno, false); // when content is loaded in splitter
															// context field will be set
					}

					ctxtField.getEl().setStyle("background-color", lore.anno.ui.getCreatorColour(rec.data.creator));
					lore.anno.ui.setVisibilityFormField('contextdisp', false);
					
				}
				else {
					var ctxtField = lore.anno.ui.form.findField('contextdisp');
					lore.anno.ui.form.setValues([{
						id: 'contextdisp',
						value: ""
					}]);
					ctxtField.getEl().setStyle("background-color", "inherit");
				}
				if (rec.data.variantcontext) {
					var vCtxtField = lore.anno.ui.form.findField('rcontextdisp');
					if (rec.data.variant == lore.anno.ui.currentURL) {
						var selText = '';
						try {
							// need to do this while the xpointer library still has emotional problems
							selText = lore.global.util.getSelectionText(
							rec.data.variantcontext, lore.global.util.getContentWindow(window))
						} 
						catch (e) {
						}
						lore.anno.ui.form.setValues([{
							id: 'rcontextdisp',
							value: '"' + selText + '"'
						}]);
					} else if ( !lore.anno.ui.topView.variationContentWindowIsVisible() ){
						lore.anno.ui.updateSplitter(lore.anno.ui.curSelAnno,false); // when content is loaded in splitter
															// context field will be set
					}
					vCtxtField.getEl().setStyle("background-color", lore.anno.ui.getCreatorColour(rec.data.creator));
					lore.anno.ui.setVisibilityFormField('rcontextdisp', false);
				}
				else {
					var ctxtField = lore.anno.ui.form.findField('rcontextdisp');
					lore.anno.ui.form.setValues([{
						id: 'rcontextdisp',
						value: ""
					}]);
					ctxtField.getEl().setStyle("background-color", "inherit");
				}
				
				/*if (rec.data.context && rec.data.variantcontext) {
					if ( rec.data.original == rec.data.context)
						url = rec.data.variant;
					else
						url = rec.data.original;
					lore.anno.ui.topView.updateVariationSplitter(ctx, title, true, function(){
						lore.anno.ui.hideMarker();
						lore.anno.ui.highlightCurrentAnnotation(rec);
					});
				}*/
				
				if (!loadOnly) {
					lore.anno.ui.formpanel.show();
					Ext.getCmp("treeview").doLayout();
				}
					lore.anno.ui.form.loadRecord(rec);
					
				
				
				var val = rec.data.resource;
				if (rec.data.isReply) {
					var prec = lore.global.util.findRecordById(lore.anno.annods, rec.data.resource);
					val = "'" + prec.data.title + "'";
					if (!lore.anno.isNewAnnotation(prec)) {
						val += " ( " + rec.data.resource + " )";
					}
				}
				lore.anno.ui.form.setValues([{ id: 'res', value: val }]);
						
				if ( !loadOnly){	
					if (rec.data.isReply) {
						Ext.getCmp("updctxtbtn").hide();
						Ext.getCmp("updrctxtbtn").hide();
							
					}
					else {
						Ext.getCmp("updctxtbtn").show();
					}
				}
				
			} 
			catch (e) {
				lore.debug.anno("Error display annotation: " + e, e);
			}
		}
		
		lore.anno.ui.setVisibilityFormField = function(fieldName, hide){
			var thefield = lore.anno.ui.form.findField(fieldName);
			if (thefield) {
				var cont = thefield.container.up('div.x-form-item');
				cont.setDisplayed(false);
				if (hide && cont.isVisible()) {
					cont.slideOut();
					thefield.hide();
				}
				else 
					if (!hide && !cont.isVisible()) {
						thefield.hide();
						cont.slideIn();
						thefield.show();
						cont.setDisplayed(true);
					}
				
			}
		}
		lore.anno.ui.hideFormFields = function(fieldNameArr){
			for (var i = 0; i < fieldNameArr.length; i++) {
				lore.anno.ui.setVisibilityFormField(fieldNameArr[i], true);
			}
		}
		lore.anno.ui.showFormFields = function(fieldNameArr){
			for (var i = 0; i < fieldNameArr.length; i++) {
				lore.anno.ui.setVisibilityFormField(fieldNameArr[i], false);
			}
		}
		lore.anno.ui.setAnnotationFormUI = function(variation){
		
			var nonVariationFields = ['res'];
			var variationFields = ['original', 'variant', 'rcontextdisp', 'variationagent', 'variationplace', 'variationdate'];
			if (variation) {
				lore.anno.ui.hideFormFields(nonVariationFields);
				lore.anno.ui.showFormFields(variationFields);
				var isReply = (lore.anno.ui.curSelAnno && lore.anno.ui.curSelAnno.data.isReply);
				if (!isReply) {
					Ext.getCmp('updrctxtbtn').setVisible(true);
				}
			}
			else {
				Ext.getCmp('updrctxtbtn').setVisible(false);
				lore.anno.ui.hideFormFields(variationFields);
				lore.anno.ui.showFormFields(nonVariationFields);
			}
		}
		
		lore.anno.ui.updateAnnoFromRecord = function(rec){
		/*	if (!rec.data.isReply) {
				var resField = lore.anno.ui.form.findField('res');
				if (resField.getValue() != rec.data.resource) {
					rec.data.resource = resField.getValue();
				}
			}*/
			
			lore.anno.ui.form.updateRecord(rec);
			
		}
				
		/** Tree UI Functions */

		
		lore.anno.ui.genTreeNodeText = function(anno){
		
			return lore.anno.ui.genDescription(lore.anno.getAnnoData(anno.id).data, true);
			
		}
		
				
		lore.anno.ui.createAndInsertTreeNode = function(anno, defparent){
			var parent = defparent ? defparent : lore.anno.ui.treeroot;
			
			var tmpNode;
			var nodeLinks = [{title: 'View annotation body in a new window',
							iconCls: 'anno-icon-launchWindow',
							 jscript: "lore.global.util.launchWindow('" + anno.bodyURL + "',false, window);"},
							
							 { title: 'View annotation in the timeline',
							 	iconCls: 'anno-icon-timeline',
							 jscript: "lore.anno.ui.showAnnoInTimeline('" + anno.id + "');"}
							  ];
							  
			if (lore.anno.isNewAnnotation(anno)) {
				tmpNode = new lore.anno.ui.LOREColumnTreeNode ( {
					id: anno.id,
					nodeType: anno.type,
					title: lore.anno.ui.getAnnoTitle(anno),
					text: '',
					iconCls: 'anno-icon',
					uiProvider: lore.anno.ui.LOREColumnTreeNodeUI,
					links: nodeLinks,
					qtip:  lore.anno.ui.genAnnotationCaption(anno, 't by c, d')
				});
				
				parent.appendChild(tmpNode);
				
			}
			else {
				if (lore.global.util.splitTerm(anno.type).term == 'VariationAnnotation' ) {
					nodeLinks.push({ title: 'Show Variation Window',
									 iconCls:'anno-icon-splitter', 
									 jscript: "lore.anno.ui.showSplitter('" + anno.id + "');"});
				}
				
				var args = {
					id: anno.id,
					nodeType: anno.type,
					text: lore.anno.ui.genTreeNodeText(anno),
					title: anno.title,
					bheader: lore.anno.ui.genAnnotationCaption(anno, 'by c, d r'),
					iconCls: 'anno-icon',
					uiProvider: lore.anno.ui.LOREColumnTreeNodeUI,
					links: nodeLinks,
					qtip: lore.anno.ui.genAnnotationCaption(anno, 't by c, d')
				};
				
				tmpNode = new lore.anno.ui.LOREColumnTreeNode (args );
				
				if (anno.about) { // reply
					parent = lore.global.util.findChildRecursively(lore.anno.ui.treeroot, 'id', anno.about);
					
				}
				
				parent.appendChild(tmpNode);
  			    lore.anno.ui.addAnnoToTimeline(anno, lore.anno.ui.getAnnoTitle(anno));
				
			}
			lore.anno.ui.attachAnnoCtxMenuEvents(tmpNode);
			
			return tmpNode;
			
		}
		
		lore.anno.ui.attachAnnoCtxMenuEvents = function(annoNode){
			 annoNode.on('contextmenu', function(node, ev){
			 	node.select();
			 });
			 
			 
			 annoNode.on('contextmenu', function(node, e){
			 	if (!node.contextmenu) {
				 node.contextmenu = new Ext.menu.Menu({
				 id: node.id + "-context-menu"
			 	});
			 
			 var isNew = lore.anno.isNewAnnotation(lore.global.util.findRecordById(lore.anno.annods, node.id));
			 
				if (!isNew) {
					node.contextmenu.add({
						text: "Show in Timeline",
						handler: function(evt){
							lore.anno.ui.showAnnoInTimeline(node.id);
						}
					});
					node.contextmenu.add({
						text: "Reply to annotation",
						handler: function(evt){
							lore.anno.ui.handleReplyToAnnotation(node.id);
						}
					});
				}
				
								 
				 node.contextmenu.add({
				 text: "Edit annotation",
				 handler: function(evt){
				 	lore.anno.ui.handleEditAnnotation(node.id);
				 }
				 });
	 
	 			if (!isNew) {
					node.contextmenu.add({
						text: "Add as node in compound object editor",
						handler: function(evt){
							try {
								lore.global.ui.compoundObjectView.get(window.instanceId).addFigure(node.id);
							} catch (e ){
								lore.debug.anno("Error adding node to compound editor:" + e, e);
							}
						}
					});
					
					if (node.nodeType == lore.constants.NAMESPACES["vanno"] + "VariationAnnotation") {
						node.contextmenu.add({
							text: "Show Variation Window",
							handler: function(evt){
								lore.anno.ui.showSplitter(node.id);
							}
						});
					}
				}
			 }
	 		node.contextmenu.showAt(e.xy);
	 	});
	 }
	
		
	lore.anno.ui.genDescription = function(annodata, noimglink){
			var res = "";
			if (!noimglink) {
                res += "<a title='Show annotation body in separate window' xmlns=\"" +
                lore.constants.NAMESPACES["xhtml"] +
                "\" href=\"javascript:lore.global.util.launchWindow('" +
                annodata.bodyURL +
                "',false);\" ><img src='chrome://lore/skin/icons/page_go.png' alt='View annotation body in new window'></a>&nbsp;";
            }
			var body = lore.global.util.externalizeLinks(annodata.body || '');
			res += body;
			
			
			return res;
		}
		
		/**
	 * Highlighting functions
	 *
	 */
		lore.anno.ui.hideMarker = function(){
			try {
				if (lore.anno.ui.curAnnoMarkers) {
					for (var i = 0; i < lore.anno.ui.curAnnoMarkers.length; i++) {
						lore.anno.ui.hideMarkerFromXP(lore.anno.ui.curAnnoMarkers[i]);
					}
				}
			} 
			catch (ex) {
				lore.debug.anno("hide marker failure: " + ex, ex);
			}
		}
		
		lore.anno.ui.hideMarkerFromXP = function(domObj){
			// this is silly but the parent node disappears
			// in certain circumstances, so can't use this for the moment
			// lore.global.util.removeNodePreserveChildren(domObj, window);
			if (domObj) {
				domObj.style.textDecoration = "inherit";
				domObj.style.backgroundColor = "transparent";
				domObj.removeAttribute("onmouseover");
				domObj.removeAttribute("onmouseout");
			}
			
			
		}
		
		lore.anno.ui.getCreatorColour = function(creator){
		
			creator = creator.replace(/\s+$/, ""); //rtrim
			var colour = lore.anno.ui.colourForOwner[creator];
			if (!colour) {
				if (lore.anno.ui.colourCount < lore.anno.ui.colourLookup.length) {
					colour = lore.anno.ui.colourLookup[lore.anno.ui.colourCount++];
				}
				else {
					// back up
					colour = lore.global.util.generateColour(196, 196, 196, 240, 240, 240);
				}
				lore.anno.ui.colourForOwner[creator] = colour;
			}
			return colour;
		}
		
		lore.anno.ui.highlightAnnotation = function(currentCtxt, colour, extraStyle, contentWindow){
			if (currentCtxt) {
				var idx, marker = null;
				// lore.debug.anno("highlighting annotation context: " + currentCtxt, currentCtxt);
				if (!contentWindow) {
					contentWindow = lore.global.util.getContentWindow(window);
				}
				var domObj = lore.global.util.highlightXPointer(currentCtxt, contentWindow.document, true, colour);
				if (domObj && extraStyle) {
				
					domObj = extraStyle(domObj);
				}
				return domObj;
				
			}
			else {
				return null;
			}
		}
		
		
		lore.anno.ui.updateHighlightFields = function(fields, colour){
			if (fields) {
				if (fields.length) {
					for (var i = 0; i < fields.length; i++) {
						fields[i].style.backgroundColor = colour;
					}
				}
				else {
					fields.style.backgroundColor = colour;
				}
			}
		}
		
		lore.anno.ui.setCurAnnoStyle = function(domObj){
			domObj.style.textDecoration = "underline";
			return domObj;
		}
		

	/**
	 * Handlers
	 */
		/** 
	 * Create a new annotation which
	 * @param {} annoid
	 */
		lore.anno.ui.handleAddAnnotation = function(rec){
			try {
				var currentContext = "";
				
				if (!rec) {
				try {
					currentContext = lore.global.util.getXPathForSelection(window);
				} 
				catch (e) {
					lore.debug.anno("exception creating xpath for new annotation", e);
				}
				}
				
				
				
				if (rec) {
					lore.anno.addAnnotation(currentContext,  lore.anno.ui.currentURL, rec);
				
				}
				else {
					lore.anno.addAnnotation(currentContext, lore.anno.ui.currentURL);
				}
			} 
			catch (e) {
				lore.debug.anno(e, e);
			}
			
		}
		
		/**
	 * Highlight all annotations on the current page
	 */
		lore.anno.ui.showAllAnnotations = function(){
		
			if (lore.anno.ui.multiSelAnno.length == 0) {
				// toggle to highlight all
				
				// set text to inherit for select all fields   
				var selAllStyle = function(domObj){
					if (domObj) {
						domObj.style.textDecoration = "inherit";
					}
					return domObj;
				}
				
				lore.anno.annods.each(function highlightAnnotations(rec){
					if (rec.data.context) {
						try {
							var domContainer = lore.anno.ui.highlightAnnotation(lore.global.util.normalizeXPointer(rec.data.context), lore.anno.ui.getCreatorColour(rec.data.creator), selAllStyle);
							// 'attach' annotation description bubble
							if (domContainer != null) {
								lore.anno.ui.multiSelAnno.push(domContainer);
								// create the tip div in the content window						
								lore.anno.ui.genTipForAnnotation(rec.data, domContainer);
							}
							else {
								lore.debug.anno("domContainer null for context: " + rec.data.context, rec);
							}
						} 
						catch (ex) {
							lore.debug.anno("Error during highlight all: " + ex, rec);
						}
					}
					
					if (rec.data.variantcontext) {
						try {
							var domContainer = lore.anno.ui.highlightAnnotation(lore.global.util.normalizeXPointer(rec.data.variantcontext), lore.anno.ui.getCreatorColour(rec.data.creator), selAllStyle);
							if (domContainer) {
								lore.anno.ui.multiSelAnno.push(domContainer);
								// create the tip div in the content window						
								lore.anno.ui.genTipForAnnotation(rec.data, domContainer);
							}
						} 
						catch (ex) {
							lore.debug.anno("Error during highlight all for variant: " + ex, rec);
						}
					}
				});
			}
			else {
				// unhighlight
				lore.debug.anno("Unhighlighting all annotations", lore.anno.ui.multiSelAnno);
				for (var i = 0; i < lore.anno.ui.multiSelAnno.length; i++) {
					try {
						lore.anno.ui.hideMarkerFromXP(lore.anno.ui.multiSelAnno[i]);
					} 
					catch (ex) {
						lore.debug.anno("Error unhighlighting: " + ex, lore.anno.ui.multiSelAnno[i]);
					}
					
				}
				// clear selection info
				lore.anno.ui.multiSelAnno = new Array();
			}
		}
		
		lore.anno.ui.handleCancelAnnotationEdit = function(){
			// reset all annotation form items to empty
			lore.anno.ui.form.items.each(function(item, index, len){
				item.reset();
			});
			
			if (lore.anno.ui.curSelAnno && lore.anno.isNewAnnotation(lore.anno.ui.curSelAnno)) {
				lore.anno.annods.remove(lore.anno.ui.curSelAnno);
			}
		}
		
		lore.anno.ui.handleSaveAllAnnotationChanges = function(){
			try {
				
				if (lore.anno.ui.curSelAnno &&
					(lore.anno.ui.form.isDirty() && 
					lore.anno.ui.form.findField('id').getValue() == lore.anno.ui.curSelAnno.data.id)) {
						lore.anno.ui.updateAnnoFromRecord(lore.anno.ui.curSelAnno);
						//lore.anno.ui.form.updateRecord(lore.anno.ui.curSelAnno);
					
				}
							
				lore.anno.updateAnnotations(lore.anno.ui.currentURL, function(anno, action, result, resultMsg){
					/*if (failures.length == 0) {
				 lore.anno.ui.loreInfo('Saved all annotation changes');
				 }
				 else {
				 lore.anno.ui.loreInfo("Could not update " + failures.length + " annotations.");
				 }
				 lore.debug.anno("Successfully updated " + successes.length + " annotations", successes);
				 lore.debug.anno("Failed to update " + failures.length + " annotations", failures);*/
					try {
						if (result == "success") {
							lore.anno.ui.loreInfo('Annotation ' + action + 'd.');
							lore.debug.anno(action + 'd ' + anno.data.title, anno);
						}
						else {
							lore.anno.ui.loreError('Unable to ' + action + ' annotation');
							lore.debug.anno('Unable to ' + action + ' annotation', resultMsg);
						}
					} 
					catch (e) {
						lore.debug.anno(e, e);
					}
				});
				
			} 
			catch (e) {
				lore.debug.anno(e, e);
			}
		}
		
		lore.anno.ui.handleSaveAnnotationChanges = function(){
		
			try {
			
				var anno = lore.anno.ui.curSelAnno;
				
				if (!anno) {
					lore.anno.ui.loreError('No annotation selected to save!');
					return;
				}
				
				// update existing annotation
				if (!lore.anno.ui.form.isDirty() && !anno.dirty) {
					lore.anno.ui.loreWarning('Annotation content was not modified, save will not occur.');
					return;
				}
				
				// update anno with properties from form
				lore.anno.ui.updateAnnoFromRecord(anno);
				lore.anno.ui.form.reset(); // clear dirty flag
				lore.anno.updateAnnotation(anno, lore.anno.ui.currentURL, function(action, result, resultMsg){
				
					if (result == "success") {
						lore.anno.ui.loreInfo('Annotation ' + action + 'd.');
						lore.debug.anno(action + 'd ' + anno.data.title, anno);
					}
					else {
						lore.anno.ui.loreError('Unable to ' + action + ' annotation');
						lore.debug.anno('Unable to ' + action + ' annotation', resultMsg);
					}
				});
				
				
				// maybe need to replace this with firing event that when annotation 
				// is saved or 'cleaned' that UI elements are updated i.e highlight fields
				// are updated ( i.e the colour may change as it's based of creator name),
				// the annotation summary window needs to be updated etc.
				lore.anno.ui.updateUIElements(anno);
			} 
			catch (e) {
				lore.debug.anno("Error updating saving annotation: " + e, e);
			}
		}
		
		
		lore.anno.ui.handleDeleteAnnotation = function (){
	       if (lore.anno.ui.curSelAnno) {
		   	Ext.MessageBox.show({
		   		title: 'Delete annotation',
		   		msg: 'Are you sure you want to delete this annotation forever?',
		   		buttons: Ext.MessageBox.YESNO,
		   		fn: function(btn){
		   			if (btn == 'yes') 
		   				lore.anno.ui.handleDeleteAnnotation2();
		   		},
		   		icon: Ext.Msg.QUESTION
		   	});
		   }
	    }
		
		lore.anno.ui.handleDeleteAnnotation2 = function(){
			try {
				lore.debug.anno("deleting " + lore.anno.ui.curSelAnno);
				
				lore.anno.deleteAnnotation(lore.anno.ui.curSelAnno, function(result, resultMsg){
					if (result == 'success') {
						lore.debug.anno('Annotation deleted', resultMsg);
						lore.anno.ui.loreInfo('Annotation deleted');
					}
					else {
					
						lore.anno.ui.loreError('Unable to delete annotation');
					}
				});
				
				lore.anno.ui.hideAnnotation();
				lore.anno.ui.setCurrentAnno(null);
			} 
			catch (ex) {
				lore.debug.anno("Exception when deleting annotation", ex);
				lore.anno.ui.loreWarning("Unable to delete annotation");
			}
		}
		
		lore.anno.ui.handleUpdateAnnotationContext = function(btn, e){
			try {
				var currentCtxt = lore.global.util.getXPathForSelection(window);
				var theField = lore.anno.ui.form.findField('context');
				theField.setValue(currentCtxt);
				theField = lore.anno.ui.form.findField('originalcontext');
				theField.setValue(currentCtxt);
				theField = lore.anno.ui.form.findField('res');
				theField.setValue(lore.anno.ui.currentURL);
				if ( lore.anno.ui.curSelAnno)
					lore.anno.ui.curSelAnno.data.resource = lore.anno.ui.currentURL;
				theField = lore.anno.ui.form.findField('original');
				theField.setValue(lore.anno.ui.currentURL);
				theField = lore.anno.ui.form.findField('contextdisp');
				theField.setValue('"' + lore.global.util.getSelectionText(currentCtxt, lore.global.util.getContentWindow(window)) + '"');
			} 
			catch (ex) {
				lore.debug.anno("Exception updating anno context", ex);
			}
		}
		lore.anno.ui.handleUpdateAnnotationVariantContext = function(btn, e){
			try {
				var currentCtxt = lore.global.util.getXPathForSelection(window);
				var theField = lore.anno.ui.form.findField('variantcontext');
				theField.setValue(currentCtxt);
				theField = lore.anno.ui.form.findField('variant');
				theField.setValue(lore.anno.ui.currentURL);
				theField = lore.anno.ui.form.findField('rcontextdisp');
				theField.setValue('"' + lore.global.util.getSelectionText(currentCtxt, lore.global.util.getContentWindow(window)) + '"');
			} 
			catch (ex) {
				lore.debug.anno("Exception updating anno variant context", ex);
			}
		}
		
		lore.anno.ui.handleAnnotationTypeChange = function(combo){
		
			var theVal = combo.getValue();
			if (theVal == 'Variation') {
				lore.anno.ui.setAnnotationFormUI(true);
			}
			else 
				if (theVal == 'Comment' || theVal == 'Explanation') {
					lore.anno.ui.setAnnotationFormUI(false);
				}
			
		}
		
		lore.anno.ui.launchFieldWindow = function(field){
			lore.global.util.launchWindow(field.value, true, window);
		}
		
		
		
		lore.anno.ui.showSplitter = function (rec) {
			if (!rec) {
				rec = lore.anno.ui.curSelAnno;
			} else if ( typeof(rec) == 'string') {
				rec = lore.global.util.findRecordById(lore.anno.annods, rec);
			}
			lore.anno.ui.updateSplitter(rec, true);
		}
		lore.anno.ui.updateSplitter =  function (rec, show) {
						
			try {
			
				if (rec.data.variantcontext) {
					// show splitter
					var ctx = null;
					var title = '';
					if (rec.data.original == lore.anno.ui.currentURL) {
						ctx = rec.data.variant;
						title = "Variation Resource";
					}
					else {
						ctx = rec.data.original;
						title = "Original Resource";
					}
					
					lore.anno.ui.topView.updateVariationSplitter(ctx, title, show, function(){
						lore.anno.ui.hideMarker();
						lore.anno.ui.highlightCurrentAnnotation(rec);

						var n = 'rcontextdisp';
						var ctx = rec.data.variantcontext;
						if (rec.data.variant == lore.anno.ui.currentURL) {
							n = 'contextdisp';
							ctx = rec.data.context;
						}
						
						var selText = '';
						try {
							selText = lore.global.util.getSelectionText(ctx, lore.anno.ui.topView.getVariationContentWindow());
						} 
						catch (e) {
							lore.debug.anno(e,e);
						}
						lore.debug.anno("Setting value for " + n + " to: " + selText);
						lore.anno.ui.form.setValues([{
							id: n,
							value: '"' + selText + '"'
						}]);
					});
				}
			} catch (e ) {
				lore.debug.anno(e, e);
			}
		}
	

		lore.anno.ui.updateUI = function(store, records, options){
			lore.debug.anno("updateUI()");
			// TODO: Timeline and Editor code should have their own listener functions
			// instead of being clumped with treeui handler code
			try {
				// add
				if (records.length == 1 && lore.anno.isNewAnnotation(records[0])) {
				
					var rec = records[0];
					var node;
					
					
					if (rec.data.isReply && rec.data.isReply == true) {
						var pnode = lore.global.util.findChildRecursively(lore.anno.ui.treeroot, 'id', lore.anno.ui.curSelAnno.data.id);
						node = lore.anno.ui.createAndInsertTreeNode(rec.data, pnode);
					}
					else {
						node = lore.anno.ui.createAndInsertTreeNode(rec.data);
						
					}
					
					// update the currently selected annotation before the focus is taken off it
					// for the newly created annotation
					if (lore.anno.ui.curSelAnno &&
						((lore.anno.ui.form.isDirty()||
							lore.anno.isNewAnnotation(lore.anno.ui.curSelAnno)) && 
							lore.anno.ui.form.findField('id').getValue() == lore.anno.ui.curSelAnno.data.id)) {
							lore.anno.ui.updateAnnoFromRecord(lore.anno.ui.curSelAnno);
					}
					
					if (!lore.anno.ui.formpanel.isVisible()) {
					
						lore.anno.ui.formpanel.show();
					}
					lore.anno.ui.showAnnotation(rec);
				
					node.ensureVisible();
					lore.anno.ui.setCurrentAnno(rec);
					
					node.select();
				}
				else {
				
					for (var i = 0; i < records.length; i++) {
						var rec = records[i];
						var anno = rec.data;
						try {
							lore.anno.ui.createAndInsertTreeNode(anno);
							
						} 
						catch (e) {
							lore.debug.anno("error loading: " + rec.id, e);
						}
					}
					
					lore.anno.ui.scheduleTimelineLayout();
				}
				
				if (!lore.anno.ui.treeroot.isExpanded()) {
					lore.anno.ui.treeroot.expand();
				}
			} 
			catch (e) {
				lore.debug.ui("Error loading annotation tree view: " + e, e);
			}
		}
		
		lore.anno.ui.updateUIOnClear = function(store) {
			var tree = lore.anno.ui.treeroot.getOwnerTree();
			lore.anno.ui.treeroot = new Ext.tree.TreeNode({});
			tree.setRootNode(lore.anno.ui.treeroot);
		}
		
		lore.anno.ui.updateUIOnRemove = function(store, rec, index){
			try {
				var node = lore.global.util.findChildRecursively(lore.anno.ui.treeroot, 'id', rec.data.id);
				if (!node) {
					return;
				}
				
				node.remove();
				if (!lore.anno.isNewAnnotation(rec)) {
				
					// remove from timeline
					
					var evt = lore.anno.ui.annoEventSource.getEvent(rec.data.id);
					if (evt) {
						evt._eventID = "flagdelete";
						lore.anno.ui.scheduleTimelineLayout();
					}
					
				}
			} 
			catch (e) {
				lore.debug.ui("Error removing annotation from tree view: " + e, e);
			}
		}
		
		lore.anno.ui.updateUIOnUpdate = function(store, rec, operation){
			
			try {
				var node = lore.global.util.findChildRecursively(lore.anno.ui.treeroot, 'id', rec.data.id);
				
				if (!node) {
					return;
				}
				
				if (rec.dirty) {
					if (operation == Ext.data.Record.EDIT) {
						node.getUI().addClass("annochanged");
					}
				}
				if ( operation == Ext.data.Record.COMMIT || 
						( operation == Ext.data.Record.REJECT 
						&& !lore.anno.isNewAnnotation(rec)) ) {
						
						node.getUI().removeClass("annochanged");
				}
				
				var info = ' ';
				if (!lore.anno.isNewAnnotation(rec)) {
					info = lore.anno.ui.genAnnotationCaption(rec.data, 'by c, d r')
				}
				else if (lore.anno.isNewAnnotation(rec) && rec.data.resource != lore.anno.ui.currentURL) {
					//TODO: Need to change this logic or add an entry for replies that recursively checks
					// to find the leaf annotation and if that annotation's resource != currentURL
						info = "Unsaved annotation from " + rec.data.resource;
				}
				node.setText(rec.data.title, info,'', lore.anno.ui.genTreeNodeText(rec.data));
				lore.anno.ui.updateAnnoInTimeline(rec.data);
				lore.anno.ui.showAnnotation(rec, true);
				
				
			} 
			catch (e) {
				lore.debug.ui("Error updating annotation tree view: " + e, e);
			}
		}
		
		lore.anno.ui.highlightCurrentAnnotation = function(rec){
		
			lore.anno.ui.curAnnoMarkers = new Array();
			
			// regular non variant case for highlighting
			if (rec.data.context && !rec.data.variantcontext 
					&& rec.data.resource == lore.anno.ui.currentURL) {
					try {
						lore.anno.ui.curAnnoMarkers.push(lore.anno.ui.highlightAnnotation(lore.global.util.normalizeXPointer(rec.data.context), lore.anno.ui.getCreatorColour(rec.data.creator), lore.anno.ui.setCurAnnoStyle));
					} 
					catch (e) {
						lore.debug.anno(e, e);
					}
			} else 	if (rec.data.variantcontext) {
			
				if (rec.data.original && rec.data.original == lore.anno.ui.currentURL) {
					try {
						lore.anno.ui.curAnnoMarkers.push(lore.anno.ui.highlightAnnotation(lore.global.util.normalizeXPointer(rec.data.context), lore.anno.ui.getCreatorColour(rec.data.creator), lore.anno.ui.setCurAnnoStyle));
					} 
					catch (e) {
						lore.debug.anno("Error highlighting variation context: " + e, e);
					}
					
					if (lore.anno.ui.topView.variationContentWindowIsVisible()) {
						try {
							lore.anno.ui.curAnnoMarkers.push(lore.anno.ui.highlightAnnotation(lore.global.util.normalizeXPointer(rec.data.variantcontext), lore.anno.ui.getCreatorColour(rec.data.creator), lore.anno.ui.setCurAnnoStyle, lore.anno.ui.topView.getVariationContentWindow()))
						} 
						catch (e) {
							lore.debug.anno(e, e);
						}
						
					}
				}
				if (rec.data.variant == lore.anno.ui.currentURL) {
					try {
						lore.anno.ui.curAnnoMarkers.push(lore.anno.ui.highlightAnnotation(lore.global.util.normalizeXPointer(rec.data.variantcontext), lore.anno.ui.getCreatorColour(rec.data.creator), lore.anno.ui.setCurAnnoStyle));
					} 
					catch (e) {
						lore.debug.anno("Error highlighting variation context: " + e, e);
					}
					
					if (rec.data.context && lore.anno.ui.topView.variationContentWindowIsVisible()) {
						try {
							lore.anno.ui.curAnnoMarkers.push(lore.anno.ui.highlightAnnotation(lore.global.util.normalizeXPointer(rec.data.context), lore.anno.ui.getCreatorColour(rec.data.creator), lore.anno.ui.setCurAnnoStyle, lore.anno.ui.topView.getVariationContentWindow()))
						} 
						catch (e) {
							lore.debug.anno("Error highlighting variation context: " + e, e);
						}
					}
				}
			}
				
		}
		
		lore.anno.ui.handleAnnotationSelection = function(node, event){
		
			try {
				
				var rec = lore.global.util.findRecordById(lore.anno.annods, node.id);
				
				if ( rec == lore.anno.ui.curSelAnno )
					return;
			
				
				// update annotations grid from form if it's a new annotation
				//lore.anno.ui.hideMarker();
				
				if (lore.anno.ui.curSelAnno &&
				(lore.anno.ui.form.isDirty() ||
				lore.anno.isNewAnnotation(lore.anno.ui.curSelAnno))) {
					lore.anno.ui.updateAnnoFromRecord(lore.anno.ui.curSelAnno);
				}
				
				if (rec == null) { // if they select root element, if it's shown 
					lore.anno.ui.setCurrentAnno(null);
					return;
				}
				
				lore.anno.ui.setCurrentAnno(rec);// TODO: eventually have a listener on this to abstract on which gui element was selected
				 
				if ( lore.anno.ui.topView.variationContentWindowIsVisible() &&
					 lore.anno.ui.curSelAnno.data.type== lore.constants.NAMESPACES["vanno"] + "VariationAnnotation") {
					 lore.anno.ui.showSplitter();	
				} else {
					lore.anno.ui.highlightCurrentAnnotation(rec);
				}
				
				lore.anno.ui.formpanel.hide();
				Ext.getCmp("treeview").doLayout();
				
			} 
			catch (e) {
				lore.debug.anno("Error occurred highlightling " + e, e);
			}
			
		}
		
		lore.anno.ui.handleReplyToAnnotation = function(arg){
			lore.anno.ui.views.activate('treeview');
			try {
				var rec;
				if (!arg) { //toolbar
					rec = lore.anno.ui.curSelAnno;
					if (!rec)
						return;
				}
				else if (typeof(arg) == 'string') {  // timeline
					rec = lore.global.util.findRecordById(lore.anno.annods, arg);
					if ( rec) lore.anno.ui.setCurrentAnno(rec);//lore.anno.ui.curSelAnno = rec;
				}
					
				if (!rec) {
					lore.debug.anno("Couldn't find record to reply to: " + arg, arg);
					return;
				}
				
				lore.anno.ui.handleAddAnnotation(rec);
			} 
			catch (e) {
				lore.debug.anno(e, e);
			}
		}
		
		/**
	 * Open an annotation in the editor
	 * @param {} annoid The id of the anotation to open
	 */
		lore.anno.ui.handleEditAnnotation = function(arg){
			lore.anno.ui.views.activate('treeview');
		
			var rec;
			try {
				if (!arg) { // no argument supplied, via the toolbar
					rec = lore.anno.ui.curSelAnno
					if (!rec)
						return;
				}
				else 
					if (typeof(arg) == 'string') { // via timeline
						rec = lore.global.util.findRecordById(lore.anno.annods, arg);
					}
					else { // treenode supplied
						rec = lore.global.util.findRecordById(lore.anno.annods, arg.id);
					}
				
				if (!rec) {
					lore.debug.anno("Couldn't find record to edit: " + arg, arg);
					return;
				}
				var node = lore.global.util.findChildRecursively(lore.anno.ui.treeroot, 'id', rec.data.id);

				if (node) {
					lore.anno.ui.showAnnotation(rec);
					node.ensureVisible();
					node.select();
				}
			}
			catch (e ) {
				lore.debug.anno(e,e);
			}
		}
		
	} catch(e ) {
		alert(e + " " + e.stack);
	}

	/**
	 * 
	 * 
	 */
	lore.anno.ui.handleLocationChange = function(contextURL) {
		try {
			var oldurl = lore.anno.ui.currentURL + '';
			lore.anno.ui.currentURL = contextURL;
			if (!lore.anno.ui.initialized ||	!lore.anno.ui.lorevisible)
					return;
				
				
			
			lore.debug.anno("The uri is " + lore.anno.ui.currentURL);
			lore.debug.ui("Updating annotation source list");
			
			var update_ds = {
				multiSelAnno: lore.anno.ui.multiSelAnno.slice(),
				colourForOwner: lore.global.util.clone(lore.anno.ui.colourForOwner),
				colourCount: lore.anno.ui.colourCount,
				curSelAnnoId: lore.anno.ui.curSelAnno ? lore.anno.ui.curSelAnno.data.id:null,
				curAnnoMarkers: lore.anno.ui.curAnnoMarkers.slice()
			};
			
			lore.global.store.set(lore.constants.HIGHLIGHT_STORE, update_ds, oldurl);
			
			// tag any unsaved new annotations for the new page
			lore.anno.annods.each(function(rec){
				if (lore.anno.isNewAnnotation(rec)) {
					var n = lore.global.util.findChildRecursively(lore.anno.ui.treeroot, 'id', rec.data.id);
					if ( n) 
						n.setText(rec.data.title, "Unsaved annotation from " + rec.data.resource, '', lore.anno.ui.genTreeNodeText(rec.data));
					else {
						lore.debug.anno("new annotation not found in tree window. This is incorrect. " + rec.data.id );
					}
				}
			})
			
			if (lore.anno.ui.curSelAnno) {
				if (!lore.anno.isNewAnnotation(lore.anno.ui.curSelAnno)) {
					lore.anno.ui.hideAnnotation();
				}
			}
			
			var ds = lore.global.store.get(lore.constants.HIGHLIGHT_STORE, contextURL);
			if (ds) {
				lore.anno.ui.multiSelAnno = ds.multiSelAnno;
				lore.anno.ui.colourForOwner = ds.colourForOwner;
				lore.anno.ui.colourCount = ds.colourCount
				var curSelAnnoId = ds.curSelAnnoId;
				lore.anno.ui.curAnnoMarkers = ds.curAnnoMarkers;
				
				var rec = lore.global.util.findRecordById(lore.anno.annods, curSelAnnoId);
				if (rec) {
					lore.anno.ui.curSelAnno = rec;
				}
			}
		} catch (e ) {
			
			lore.debug.anno(e,e);
		}
		lore.anno.ui.loreInfo("Loading annotations for " + contextURL);
		lore.anno.updateAnnotationsSourceList(contextURL, function (result, resultMsg) {
			if (result == 'fail') {
				lore.anno.ui.loreError("Failure loading annotations for page.");
			}
		});
		lore.anno.ui.loadedURL = contextURL;
		lore.anno.ui.annoEventSource.clear();
	}
