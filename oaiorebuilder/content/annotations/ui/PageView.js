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


// base64 encoded icons  
var closeIcon 	= "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAABIAAAASABGyWs+AAAACXZwQWcAAAAQAAAAEABcxq3DAAACjklEQVQ4y2XTv2uddRTH8dfzPDf3Po9pjRfSVGKvlUApWEkdEkRxCI4pdAgdYjvrZBEyhFJwyT+QVdAiLqLQNg6Nix10ukoGsYU0Y/OrMdomJqm5ufc+9/k65IehnuWc4ZwPh88578j/I8ZrGRer1CJssNzgAVZQHG+ODosyWtTO89FIYmw48UYtkkZYDvbmOhZ/7rjziC8qLDePq5xCwtBorH6noniSCn93CZslYaMkPO0SFlPhdipcStQThk4fDpf208BoYq5eEbYSYYPwzH/5L8ITwkoi/FQRLiXmMNCFpCA+H/vsZsnYcJt2gXKZclnI831TskwSx4q84+WC3pL+h0H4M/gxxrkPYpffyWkFOmmqMjkpm55WVKuKalU2PS2dnJSkqSjwVs77scs4V0ojF4eC/q6CXWSjo166cUOUZXR3g+zqVaHR0Jyf17p7V6XgQqQ/jQyWqvT1Fcpt5Nit11VmZ3VfuSK7dm3foRDszs7ardePblgtdPXQF8eBKAj5gUBzbc3G1JT20hJRRBRpLy3ZmJrSXFuTHz7C/lwUb7O+STscCOjt1TMxoVSrHZ25VKvpmZigt9fhplu0d1iPd3jwkNUOOiiPjDgxPi5KEtszM7ZnZkRJ4sT4uPLIiBx7WGD1H35PsNnk7Nu824vni4viNNVaXLR6/brte/d09fd7fv++Z7duCe22BXzDV+t8F1XQZOBDvv2U4VfQyDJKJZ2dHZCcPCnkubjR8Ac+59fvGS/zOOngdTbn+G2DwVc5cyrPxa2W6ICsqNXSznPzhK+p/8Anp3m0dRymDA1qF/j4Pcbe5GyVtMBT9uZ5/Au3F/iywsohTEcCL+B8JmWwh1rANkt7+zivvojzv3rjBCvezErGAAAAJXRFWHRjcmVhdGUtZGF0ZQAyMDA4LTEwLTE4VDE4OjQ1OjQ1KzA4OjAwKJpk+wAAACV0RVh0bW9kaWZ5LWRhdGUAMjAwOC0xMC0xOFQxODo0NTo0NSswODowMHcrEs8AAAAASUVORK5CYII=";
var objectIcon 	= "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAFWSURBVBgZBcE/SFQBAAfg792dppJeEhjZn80MChpqdQ2iscmlscGi1nBPaGkviKKhONSpvSGHcCrBiDDjEhOC0I68sjvf+/V9RQCsLHRu7k0yvtN8MTMPICJieaLVS5IkafVeTkZEFLGy0JndO6vWNGVafPJVh2p8q/lqZl60DpIkaWcpa1nLYtpJkqR1EPVLz+pX4rj47FDbD2NKJ1U+6jTeTRdL/YuNrkLdhhuAZVP6ukqbh7V0TzmtadSEDZXKhhMG7ekZl24jGDLgtwEd6+jbdWAAEY0gKsPO+KPy01+jGgqlUjTK4ZroK/UVKoeOgJ5CpRyq5e2qjhF1laAS8c+Ymk1ZrVXXt2+9+fJBYUwDpZ4RR7Wtf9u9m2tF8Hwi9zJ3/tg5pW2FHVv7eZJHd75TBPD0QuYze7n4Zdv+ch7cfg8UAcDjq7mfwTycew1AEQAAAMB/0x+5JQ3zQMYAAAAASUVORK5CYII=";
var relIcon 	= "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAEXSURBVDjLY/j//z8DJZhhmBpg2POQn2wDDDof8HvOe3osYtXzDzCxuM2vP3gvfn4MJIfXAP22e0Ies58eK9r2+r//3Kf3YOIhq17eK9v95j9ITrv2jhBWA/Ra7kVEr375vXDrq/9+s57eUy+4IY0kJx2w6Nk9kFzE0uffgXIRKAboNtxlC1/+/GPljjdABc9+q+ZcM0Z3qmb5LWOQXOmml/8DZz7+qJB0hQ3FBerFNyNC5z/9nrXqxX+Pvgf35OMuSSPJSXtPfXQPJBc089F3oFwE1jBQTLkiZNtw51jq4qf/XVvuwsPAa9Kjexkrnv8HyclFXxTCGwsyERf4LctvHvPuvAePBf8pDz/Y1N45BpIbKUmZFAwAR3nW32nUrY0AAAAASUVORK5CYII=";

/**
 * Class which abstracts the visual operations performed on the content window and the
 * window splitter used for variation annotations
 * @class lore.anno.ui.PageView
 * @param {Object} config The configuration the page view
 * config can contain: {
 * 		page: The PageData object to listen to events on
 * 		model: The Ext data store to listen to events on
 * 		rdfaMan: Reference to the RDFaManager
 * 		visible: Whether the PageView contents are visible
 * }
 */
lore.anno.ui.PageView = function (config) {
			
			this.page = config.page;
			this.model = config.model;
			this.rdfaMan = config.rdfaManager;	
			this.visible = config.visible || true;
			this.colourLookup = new Array("#00FF00", "#FFFF00", "#00FFFF", "#FF00FF", "#FF8000", /*"#80FF00",*/ "#00FF80", "#0080FF", "#8000FF", "#FF0080", "#FFC000", "#C0FF00", "#00FFC0", "#00C0FF", "#C000FF", "#FF00C0", "#FF4000", /*"#40FF00", "#00FF40",*/ "#0040FF", /*"#4000FF",*/ "#FF0040", "#0000FF" /*, "#FF0000",*/);
			this.model.on('load', this.handleLoad, this);
			this.model.on('remove', this.handleRemove, this);	
			this.model.on('update', this.handleUpdate, this);
			this.page.on('annochanged', this.handleAnnoChanged, this);
			this.rdfaMan.on('rdfaloaded', this.handleRDFaLoaded, this);
		}
		
lore.anno.ui.PageView.prototype = {

	/**
	 * Refresh all the annotations on the page
	 */
	tog: function(){
		if (this.page.multiSelAnno.length > 0) {
			// hide then reshow 
			this.toggleAllAnnotations();
			this.toggleAllAnnotations();
		}
	},
	
	/**
	 * When currently selected annotation changes, highlight the annotation
	 * @param {Object} oldRec
	 * @param {Object} newRec
	 */
	handleAnnoChanged: function (oldRec, newRec ) {
		if (newRec) {
			if ( newRec.data.type == lore.constants.NAMESPACES["vanno"] + "VariationAnnotation" ) {	
				 this.updateSplitter(newRec, lore.anno.ui.topView.variationContentWindowIsVisible(), lore.anno.ui.formpanel.updateSplitterContextField, lore.anno.ui.formpanel);
			} else {
				this.highlightCurrentAnnotation(newRec);
			}
		} else {
            this.removeHighlightForCurrentAnnotation();
        }
	},
	
	/**
	 * Refresh annotations currently highlighted when new annotaiotns
	 * are loaded
	 * @param {Object} store
	 * @param {Object} records
	 * @param {Object} options
	 */
	handleLoad: function(store, records, options){
		this.tog();
	},
	/**
	 * 
	 * Refresh annotations currently highlighted when annotation are removed
	 * @param {Object} store
	 * @param {Object} rec
	 * @param {Object} ind
	 */
	handleRemove: function(store, rec, ind){
		this.tog();
	},
	
	/**
	 * When a annotation record is updated, refresh the currently selected
	 * highlighting
	 * @param {Object} store
	 * @param {Object} rec
	 * @param {Object} operation
	 */
	handleUpdate: function(store, rec, operation){
		try {
			this.removeHighlightForCurrentAnnotation();
		} 
		catch (e) {
			lore.debug.anno("PageView:handleUpdate() - " + e, e);
		}
	},
	
	/**
	 * Hide or Show the page view
	 * @param {Boolean} visible
	 */
	setContentsVisible: function(visible) {
		this.visible = visible;
		try {
			// if markers exist for the page view and it's being made visible, show them
			if (visible && this.page.curAnnoMarkers.length > 0 && this.page.getCurrentAnno()) {
				var cc = this.getCreatorColour(this.page.getCurrentAnno().data.creator);
				
				for (var i = 0; i < lore.anno.ui.page.curAnnoMarkers.length; i++) {
					this.page.curAnnoMarkers[i].show(cc, lore.anno.ui.setCurAnnoStyle, true);
				}
			}
			else if ( !visible ){
				// if markers exist for the page view and it's being made visible, show them
				if (this.page.multiSelAnno.length > 0) {
					this.toggleAllAnnotations();
				}

				this.removeHighlightForCurrentAnnotation(lore.anno.ui.topView.getVariationContentWindow());
				if (this.page.curAnnoMarkers.length > 0) {
					for (var i = 0; i < this.page.curAnnoMarkers.length; i++) {
						this.page.curAnnoMarkers[i].hide();
					}
				}
			}
		} catch (e) {
			lore.debug.anno("setContentsVisible(): " + e, e);
		}
	},
	
	/**
	 * Hide the currently selected annotation markers
	 * @param {Object} cw Content window that this applies to (Optional)
	 */
	removeHighlightForCurrentAnnotation: function(cw){
	
		try {
			if (this.page.curAnnoMarkers) {
				for (var i = 0; i < this.page.curAnnoMarkers.length; i++) {
					var m = this.page.curAnnoMarkers[i];
					if (cw) { // remove markers only for the specified content window
						if (m.target.defaultView == cw) {
							m.hide();
							delete m;
							this.page.curAnnoMarkers.splice(i, 1);
							i--;
						}
					}
					else {
						// remove marker
						m.hide();
						delete m;
					}
				}
				if (!cw) 
					this.page.curAnnoMarkers = [];
			}
		} 
		catch (ex) {
			lore.debug.anno("hide marker failure: " + ex, ex);
		}
	},
	
	/**
	 * Get a colour based off the creator's name.  This is retrieve from a predefined
	 * table of colours.  If there a no colours available from the table, then a
	 * colour is generated.
	 * @param {String} creator Creator name
	 * @return {String} A hexadecimal colour value of the form #RRGGBB
	 */
	getCreatorColour: function(creator){
		creator = creator.replace(/\s+$/, ""); //rtrim
		var colour = this.page.colourForOwner[creator];
		if (!colour) {
			if (this.page.colourCount < this.colourLookup.length) {
				colour = this.colourLookup[this.page.colourCount++];
			}
			else {
				// back up
				colour = lore.global.util.generateColour(196, 196, 196, 240, 240, 240);
			}
			this.page.colourForOwner[creator] = colour;
		}
		return colour;
	},
	
	/**
	 * Set the currently selected image
	 * @param {Object} img The dom element for the image i.e <img>
	 */
	setCurSelImage: function(img){
		var old = this.page.curImage;
		this.page.curImage = $(img);
		if (old && old.context != this.page.curImage.context) {
			var inst = old.imgAreaSelectInst();
			if (inst) {
				inst.setOptions({
					show: false,
					hide: true
				});
				inst.update();
			}
			
		}
	},
	
	/**
	 * Get the currently selected image
	 */
	getCurSelImage: function(){
		return this.page.curImage ? this.page.curImage.get(0) : null;
	},
	
	
	/**
	 * Retrieve th current selection whether that is selected text or selected part of an image
	 */
	getCurrentSelection: function(){
		var selxp = lore.global.util.getXPathForSelection(window);
		
		if (this.page.curImage && lore.global.util.trim(selxp) == '') {
			var sel = this.page.curImage.imgAreaSelectInst().getSelection()
			if (sel.x1 != sel.x2 && sel.y1 != sel.y2) {
				return lore.global.util.getXPathForImageSelection(this.page.curImage.get(0), this.page.curImage.get(0).ownerDocument, sel, true);
			}
		}
		
		return selxp;
	},
	
	/**
	 * Highlight the current annotation
	 * @param {Record} rec The record of the annotation to highlight
	 */
	highlightCurrentAnnotation: function(rec){
		try {
			this.removeHighlightForCurrentAnnotation();
			if (this.page.curImage) {
				var inst = this.page.curImage.imgAreaSelectInst();
				inst.setOptions({
					show: false,
					hide: true
				});
				inst.update();
				
			}
			this.page.curAnnoMarkers = this.highlightAnnotation(rec, lore.anno.ui.setCurAnnoStyle);
		} catch (e) {
            lore.debug.anno("Error highlighting (in highlightCurrentAnnotation)", {rec:rec,e:e});
			lore.anno.ui.loreError('Unable to highlight. Page has been modified.');
		}
	},
	
	/**
	 * Highlight an annotation.
	 * @param {Record} rec The record of the annotation to highlight
	 * @param {Function} annoStyle a callback which is called once the dom node is created for the selection.
	 * The dom node is passed in as a parameter to the callback.
	 */	
	highlightAnnotation : function(rec, annoStyle) {
		var markers = [];
		
        var urlsAreSame = lore.global.util.urlsAreSame;
        
		// regular non variant case for highlighting
		if (rec.data.context && urlsAreSame(rec.data.resource, lore.anno.ui.currentURL) &&
			rec.data.type!= lore.constants.NAMESPACES["vanno"] + "VariationAnnotation")  {
				try {
					markers.push(new lore.anno.ui.Marker({xpointer:rec.data.context, page: this.page }));
				} 
				catch (e) {
					lore.debug.anno(e, e);
				}
		} else 	{
		
			if (urlsAreSame(rec.data.original, lore.anno.ui.currentURL)) {
				try {
					if ( rec.data.context) markers.push(new lore.anno.ui.Marker({xpointer:rec.data.context, page: this.page }));
				} 
				catch (e) {
					lore.debug.anno("Error highlighting variation context: " + e, e);
				}
				var cw = lore.anno.ui.topView.getVariationContentWindow();
				if (rec.data.variantcontext && lore.anno.ui.topView.variationContentWindowIsVisible() && cw.location == rec.data.variant) {
					try {
						markers.push(new lore.anno.ui.Marker({xpointer:rec.data.variantcontext, target:cw.document, page: this.page }));
					} 
					catch (e) {
						lore.debug.anno(e, e);
					}
					
				}
			}
			if (urlsAreSame(rec.data.variant, lore.anno.ui.currentURL)) {
				try {
					if ( rec.data.variantcontext )
						markers.push(new lore.anno.ui.Marker({xpointer:rec.data.variantcontext, page: this.page }));
				} 
				catch (e) {
					lore.debug.anno("Error highlighting variation context: " + e, e);
				}
				var cw = lore.anno.ui.topView.getVariationContentWindow();
				if (rec.data.context && lore.anno.ui.topView.variationContentWindowIsVisible() && cw.location == rec.data.original) {
					try {
						markers.push(new lore.anno.ui.Marker({xpointer:rec.data.context, target:cw.document, page: this.page }));
					} 
					catch (e) {
						lore.debug.anno("Error highlighting variation context: " + e, e);
					}
				}
			}
		}
		
		// get colour of highlight and show marker, and generate tooltip
		var cc = this.getCreatorColour(rec.data.creator);
		for ( var i=0; i < markers.length;i++) {
			markers[i].show(cc, annoStyle, true);
			markers[i].tip(rec.data);
		}
		
		if ( rec.data.meta.context){
			// if semantic context, create marker, show and tooltip-erize
			var m = new lore.anno.ui.Marker({xpointer:rec.data.meta.context, page: this.page });
			markers.push(m);
			m.show(cc, function (type, node) {
				node.style.backgroundColor = null;
				node.style.border = "2px dashed " + cc;
				lore.debug.anno(node.style.border, node);
				return node;
			});
			m.tip(rec.data);
		}
		
		return markers;
			
	},
	
	/**
	 * Highlight all annotations on the current page
	 */
	toggleAllAnnotations : function(){
		if (this.page.multiSelAnno.length == 0) {
			// toggle to highlight all
			
			// set text to inherit for select all fields   
			var selAllStyle = function(type, domObj){
				if (type === 'string-range' || type === 'plain') {
					if (domObj) {
						domObj.style.textDecoration = "inherit";
					}
				} else if ( type === 'image-range') {
					domObj.style.borderStyle = "dashed";
				}
					
				return domObj;
			}
			
			this.model.each(function highlightAnnotations(rec){
				if ( rec.data.context || rec.data.meta.context ) {
					try {
						var markers = this.highlightAnnotation(rec, selAllStyle);	
						
						// 'attach' annotation description bubble
						if (markers != null) {
							this.page.multiSelAnno = this.page.multiSelAnno.concat(markers);
							// create the tip div in the content window
							for ( var i =0 ; i < markers.length;i++)						
								markers[i].tip(rec.data);
								
						}
						else {
							lore.debug.anno("marker null for context: " + rec.data.context, rec);
						}
					} 
					catch (ex) {
						lore.debug.anno("Error during highlight all: " + ex, rec);
					}
				}
				
			}, this);
		}
		else {
			// unhighlight
			lore.debug.anno("Un-highlighting all annotations", this.page.multiSelAnno);
			for (var i = 0; i < this.page.multiSelAnno.length; i++) {
				try {
					var m = this.page.multiSelAnno[i];
					m.hide();
					delete m;
				} 
				catch (ex) {
					lore.debug.anno("Error unhighlighting: " + ex, this.page.multiSelAnno[i]);
				}
				
			}
			// clear selection info
			this.page.multiSelAnno = new Array();
		}
	},
		
	/**
	 * Scan the DOM for a content window and find images that are loaded.  Attach event handlers
	 * to them to enable highlighting
	 * @param {Window} contentWindow The content window the enablement applies to
	 */
	enableImageHighlighting : function(contentWindow){

		var cw = contentWindow ? contentWindow : lore.global.util.getContentWindow(window);
		var doc = cw.document;
		var imgOnly = doc.contentType.indexOf("image") == 0;
		
		var self = this;
		
		var e = function(){
		try {
			var cw = contentWindow ? contentWindow : lore.global.util.getContentWindow(window);
			var doc = cw.document;
			
			if ($('span#lore_image_highlighting_inserted', doc).size() > 0) {
				lore.debug.anno("page already enabled for image annotations");
				return;
			}
			
			if (doc.getElementsByTagName("head").length == 0) {
				lore.debug.anno("image selection disabled for page.  Either not a HTML page or no <head> element.");
				lore.anno.ui.loreWarning("Image selection disabled for page. Not a valid HTML page.");
				return;
			}
			//CSS used by selection library
			lore.global.util.injectCSS("content/lib/imgareaselect-deprecated.css", cw);
			
			var im;
			
			if (imgOnly) {
				im = $('img', doc);
				lore.debug.anno("image only", im);
			}
			else 
				im = $('img[offsetWidth!=0]', doc);
						
			// add a handler that loads image selection capabilites to an image
			// when the user mouses over an image for the first time. This is because
			// trying to load the image selection library for each image on page load 
			// causes browser timeouts for pages with large amounts of image
	 
			im.each(function(){
					

				// minimum area check 
				if ( parseInt(this.offsetWidth) + parseInt(this.offsetHeight) < 64) 
					return;				
				
				$(this).mouseover(function(){
					try {
						// remove self, as it's once off use of handler
						$(this).unbind('mouseover');
						
						// preload image scale factor
						var scale = lore.anno.ui.updateImageData(this, doc);
						
						// attach image area select handle for image			
						$(this).imgAreaSelect({
							onSelectEnd: function(img, sel){
								if ((sel.x1 + sel.x2 + sel.y1 + sel.y2) == 0) 
									return;
								self.setCurSelImage(img);
							},
							onSelectStart: function(){
								var selObj = cw.getSelection();
								selObj.removeAllRanges();
							},
							handles: 'corners',
							imageHeight: scale.origHeight,
							imageWidth: scale.origWidth
						})
					} 
					catch (e) {
						lore.debug.anno("error initing image handler: " + e, e);
					}
				});
				
			});
	 					
			var e = lore.global.util.domCreate('span', doc);
			e.id = 'lore_image_highlighting_inserted';
			e.style.display = "none";
			$('body', doc).append(e);
			
			lore.debug.anno("image selection enabled for the page");
			
			var refreshImageMarkers = function(e){
				try {
					var markers = self.page.curAnnoMarkers.concat(self.page.multiSelAnno);
					var d = this.document || this.ownerDocument;
					for (var i = 0; i < markers.length; i++) {
						var m = markers[i];
						try {
							if (m.isImageMarker() && (m.target == d)) {
								m.update();
							}
						} catch (e ) {
							//#146 On the failure of one marker this would break the resizing of
							// all other markers
							lore.debug.anno('refreshImageMarkers: ' + e, {err:e, marker:m});
						}
					}
					
					im.each(function(){
						
						var inst = $(this).imgAreaSelectInst();
						
						if (inst) {
							// imgarea supports scaling, but it refreshes it scaling
							// in a stupid way, merely calling update will not work
							var s = inst.getSelection();
							inst.setOptions({});
							inst.setSelection(s.x1, s.y1, s.x2, s.y2);
							inst.update();
						}
					});
				} 
				catch (e) {
					lore.debug.anno("error occurred during window resize handler: " + e, e);
				}
			}
			lore.global.util.getContentWindow(window).addEventListener("resize", refreshImageMarkers, false);
			lore.anno.ui.topView.getVariationContentWindow().addEventListener("resize", refreshImageMarkers, false);
			if (imgOnly) 
				im.click(refreshImageMarkers);
			
			self.removeResizeListeners = function() {
				lore.global.util.getContentWindow(window).removeEventListener("resize", refreshImageMarkers, false);
				lore.anno.ui.topView.getVariationContentWindow().removeEventListener("resize", refreshImageMarkers, false);
			}
			
		} 
		catch (e) {
			lore.debug.anno("error occurred enabling image highlighting: " + e, e);
		}
	};
	var ol = function(){
		cw.removeEventListener("load", ol, true);
		lore.debug.anno("on load image anno handler called");
		e();
		
	}
	
	// case: dom content not loaded
	if ( !doc.body) {
		cw.addEventListener("load", ol, true);
		return;
	}
	
	var im = $('img', doc);

	if (im.size() > 0) {
		var contentLoaded = true;
		if ( imgOnly)
			contentLoaded = im.get(0).offsetWidth != 0;
		else 
			im.each(function () {
					contentLoaded = contentLoaded && this.offsetWidth != null;  
					
			});
			
	 	if (!contentLoaded)  // case: dom content loaded, images aren't
			cw.addEventListener("load", ol, true);
		else 			// case: page already loaded (i.e switching between preloaded tabs)
			e(); 
	}
},

	/**
	 * Handler for when RDFa loaded for page. Currently not used
	 */
	handleRDFaLoaded : function () {
		// currently no behaviour, but may want to add
		// a visual on the page later.
	}, 

	/**
	 * Remove all markers for RDFa triples on the page
	 */
	turnOffPageTripleMarkers : function() {
		// remove any existing span represting triples fropm the page 
		var ms = this.page.metaSelections;
		for (var i = 0; i < ms.length; i++) {
			try {
				var n = ms[i];
				n.removeChild(n.firstChild);
				lore.global.util.removeNodePreserveChildren(n, lore.global.util.getContentWindow(window));
			} 
			catch (e) {
				lore.debug.anno('error removing node for meta selection: ' + e, e);
			}
		}
		this.page.metaSelections = [];
	},
	
	/**
	 * Show the RDFa triples on the page
	 * @param {Object} callback Function called when RDFa element is selected
	 */
	turnOnPageTripleMarkers : function(/*function*/callback) {
		for (var i=0 ; i < this.page.rdfa.triples.length; i++ ) {
			// for each triple determine whether it's human readable
			var z = this.page.rdfa.triples[i];
			if ( !lore.anno.ui.isHumanReadableTriple(z))
				continue;

			var isObject = z.property.toString().indexOf("#type") != -1;
            
            // Don't display fields (not an object)
            if (!isObject) {
                continue;
            }
            
			var val = lore.anno.ui.tripleURIToString(z.object);

			
			//TODO: #194 - This logic should be based on store with valid Objects
			if ( isObject &&  val !='Agent' && val !='Work'
			 && val != 'Manifestation' && val != 'Expression')
			 	continue;
				
			// create a span around the location of the triple that's embedded in the HTML
			var cw = lore.global.util.getContentWindow(window);
			var doc = cw.document;
			var r = doc.createRange();
			r.selectNode(z.source);
			var span = lore.global.util.domCreate("span", doc);
			r.surroundContents(span);
																	
			this.page.metaSelections.push(span);
			var marker = lore.global.util.domCreate("img", doc);
			
			marker.src = isObject ? objectIcon: relIcon;
			marker.setAttribute("rdfIndex", i);
			span.insertBefore(marker, z.source);
			var s = $(marker);
	 	
			//tooltip
			marker.title = isObject ? val : lore.anno.ui.tripleURIToString(z.property);
			
			s.hover(function () {
				$(this).parent().css({
					'background-color': 'yellow'
				});},
				function() {
					$(this).parent().css({
						'background-color': ''
					});
				});
				
			
			var t = this;
			
			// when triple is selected, call callback and hide triples for the page
			s.click(function () {
				try {
				var triple = t.page.rdfa.triples[this.getAttribute("rdfIndex")];
				
				if (typeof(callback) === 'function')
					callback(isObject, triple);
				
				} catch (e ) {
					lore.debug.anno(e,e);
				}
				
				t.turnOffPageTripleMarkers();
			});
		}
	},
	
	/**
	 * Turn on/off triple markers for the triples on the pages
	 * @param {Function} callback Function called when triple is selected
	 */
	toggleTripleMarkers: function (/*function*/callback) {
		if (this.page.metaSelections.length == 0)
			this.turnOnPageTripleMarkers(callback);
		else
			this.turnOffPageTripleMarkers();
	},
	
	/**
	 * Update the variation splitter for the supplied annotation
	 * @param {Record} rec The annotation to update in the splitter window. 
	 * @param {Boolean} show Specifies whether the variation window is to be made visible
	 * @param {Function} callback Function called when variation window is laoded
	 * @param {Function} callbackScope The scope to run the callback in
	 */
	 updateSplitter :  function (rec, show, callback, callbackScope) {
		var urlsAreSame = lore.global.util.urlsAreSame;
		try {
			
			if (rec.data.variant) {
				// show splitter
				var ctx = null;
				var title = '';
				if (urlsAreSame(rec.data.original, lore.anno.ui.currentURL)) {
					ctx = rec.data.variant;
					title = "Variation";
				}
				else {
					ctx = rec.data.original;
					title = "Original";
				}
				
				var t = this;
				lore.anno.ui.topView.updateVariationSplitter(ctx, title, show, function(){
					// when page has loaded perform the following
					try {
						t.removeHighlightForCurrentAnnotation();
						var cw = lore.anno.ui.topView.getVariationContentWindow();
						t.enableImageHighlighting(cw);
						t.highlightCurrentAnnotation(rec);
						if (callback) callback.apply(callbackScope || this, [cw, rec]);
						
					} catch(e){
						lore.debug.anno("updateVariationSplitter-callback: " + e, e);
					}
				});
			}
		} catch (e ) {
			lore.debug.anno(e, e);
		}
	}
	
}
	

