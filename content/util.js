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
 
var EXPORTED_SYMBOLS = ['util'];

Components.utils.import("resource://lore/constants.js");
Components.utils.import("resource://lore/debug.js");
Components.utils.import("resource://lore/lib/nsXPointerService.js");

/**
 * @property lore.global.util.xps
 * @type XPointerService
 * Used for generating xpointers for annotations
 */
m_xps = new XPointerService(); 

/**
 * General utility functions for I/O, manipulating the DOM, selections etc 
 * @class lore.global.util
 * @singleton
 */
util = {
    /**
     * Create a clone of an object
     * @param {Object} o The object to clone
     * @return {Object} The clone
     */
    clone : function(o) {
        if(!o || 'object' !== typeof o) {
            return o;
        }
        var c = '[object Array]' === Object.prototype.toString.call(o) ? [] : {};
        var p, v;
        for(p in o) {
            if(o.hasOwnProperty(p)) {
                v = o[p];
                if(v && 'object' === typeof v) {
                    c[p] = util.clone(v);
                }
                else {
                    c[p] = v;
                }
            }
        }
        return c;
    },
    /** Determine if an object is empty (has no properties)
     * @param {Object} ob The object to check
     * @return {Boolean} true if the object is equivalent to {}
     */
	isEmptyObject : function (ob){
       for(var i in ob){ if(ob.hasOwnProperty(i)){return false;}}
       return true;
    },
	/**
	 * Dynamically create a wrapper around an object and return
	 * the wrapper object. The wrapper object currently only
	 * exposes the original object's functions
     * @param {Object} srcObj The original object to wrap
     * @param {String} name Currently not used
     * @param {Object} pre Currently not used
     * @param {Object} post Currently not used
     * @return {Object} The wrapper
	 */
	createWrapper: function(srcObj, name, pre, post) {
		var wrapper = { _real: srcObj, _pre: pre, _post: post};
		for ( x in srcObj) {
			if ( typeof(srcObj[x]) == 'function' ) {
				wrapper[x] = eval('function(){'+
					// would need to chain argument values for _pre
					// if (this._pre) { for ( var i =0; i < this._pre.length; i++) { this._pre[i].apply(this._real, arguments); }} 
					//'debug.ui("' + name + '.' + x + ' args:" + arguments, arguments);' +
					'return this._real["' + x + '"].apply(this._real,arguments);' +
					// // if (this._post) { for ( var i =0; i < this._pre.length; i++) { this._pre[i].apply(this._real, arguments); }}
					// would need to chain return values for _post
						'}');
			}
		}
		return wrapper;
	},
	
	ELFHash: function(str) {
     var hash = 0;
     var x    = 0;

      for(var i = 0; i < str.length; i++)
      {
         hash = (hash << 4) + str.charCodeAt(i);

         if((x = hash & 0xF0000000) != 0)
         {
            hash ^= (x >> 24);
         }
         hash &= ~x;
      }

      return hash;
   },
   
   /**
     * Make sure that characters that might cause sparql errors are encoded
     * @param {String} str
     * */
    preEncode : function (str) {
        return str.replace(/}/,"%7D").replace(/{/,"%7B").replace(/</, '%3C').replace(/>/, '%3E');    
    },
	
    /**
     * Trim whitespace from a string
     * @param {String} str
     */
	trim : function (str) {
		return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
	},
    
    /**
     * Removes DOM node, but preserves its children by attaching them to the node's 
     * parent instead.
     * 
     * Taken from code snippet on http://stackoverflow.com/questions/170004/how-to-remove-only-the-parent-element-and-not-its-child-elements-in-javascript .
     * @param {Node} nodeToRemove The node to remove
     */
    removeNodePreserveChildren : function(nodeToRemove, win) {
      var fragment = win.document.createDocumentFragment();
      while(nodeToRemove.firstChild) {
        fragment.appendChild(nodeToRemove.firstChild);
      }
      nodeToRemove.parentNode.insertBefore(fragment, nodeToRemove);
      nodeToRemove.parentNode.removeChild(nodeToRemove);
    },
    
    /**
     * From dannotate.js: Return value of first child or default
     * @param {Node} node
     * @param {} defaultValue
     * @return {} value of first child of first node, or default value if provided
     */
    safeGetFirstChildValue : function(node, defaultValue)
    {
      return ((node.length > 0) && (node[0]) && node[0].firstChild) ?
               node[0].firstChild.nodeValue : defaultValue ? defaultValue : '';
    },
    
    /**
     * Scroll to an element within a window
     * @param {Element} theElement
     * @param {} theWindow
     */
    scrollToElement : function(theElement, theWindow){
    
      var selectedPosX = 0;
      var selectedPosY = 0;
                  
      while(theElement){
        selectedPosX += theElement.offsetLeft;
        selectedPosY += theElement.offsetTop;
        theElement = theElement.offsetParent;
      }
                                      
     theWindow.scrollTo(selectedPosX,selectedPosY);
    },
    
    /**
     * Launch a small window containing a URL
     * @param {} url The URL to launch
     * @param {} locbar Boolean: whether to show location bar
     * @param {} win The parent window
     */
    launchWindow : function(url, locbar, win) {
        var winOpts = 'height=650,width=800,top=200,left=250,resizable,scrollbars=yes';
        if (locbar) {
            winOpts += ',location=1';
        }
        var newwindow=win.openDialog(url,'view_resource',winOpts);
        newwindow.focus();
        
    },
    
    /**
     * Launch a URL in a new tab in the main browser (or focus existing tab if already open in browser)
     * Code from MDC code snippets page https://developer.mozilla.org/en/Code_snippets/Tabbed_browser
     * @param {Object} url The url to launch
     * @param {Object} win The window in which to open the tab
     */
    launchTab : function(url, win) {
      var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                         .getService(Components.interfaces.nsIWindowMediator);
      var browserEnumerator = wm.getEnumerator("navigator:browser");
      var found = false;
      while (!found && browserEnumerator.hasMoreElements()) {
        var browserWin = browserEnumerator.getNext();
        var tabbrowser = browserWin.getBrowser();
        // Check each tab of this browser instance
        var numTabs = tabbrowser.browsers.length;
        for(var index=0; index<numTabs; index++) {
          var currentBrowser = tabbrowser.getBrowserAtIndex(index);
          if (url == currentBrowser.currentURI.spec) {
            // The URL is already opened. Select this tab.
            tabbrowser.selectedTab = tabbrowser.mTabs[index];
            // Focus *this* browser-window
            browserWin.focus();
            found = true;
            break;
          }
        }
      }
      // Our URL isn't open. Open it now.
      if (!found) {
        var recentWindow = wm.getMostRecentWindow("navigator:browser");
        if (recentWindow) {
          // Use an existing browser window
          recentWindow.delayedOpenTab(url, null, null, null, null);
        }
        else {
          // No browser windows are open, so open a new one.
          win.open(url);
        }
      }
    },
    /**
     * Format a date (long format)
     * @param {String} adate The date to format
     * @param {Object} dateObj Object that parses the date
     * @return {String} the formatted date
     */
    longDate : function ( adate, dateObj ) {
        return dateObj.parseDate(adate, 'c').format("D, d M Y H:i:s \\G\\M\\T O");
    },
    /**
     * Format a date (short format)
     * @param {String} adate The date to format
     * @param {Object} dateObj Object that parses the date
     * @return {String}
     */
    shortDate : function (adate, dateObj ) {
        return dateObj.parseDate(adate, 'c').format("d M Y H:i:s");
    },
	
	/**
	 * Retrieve an instance of the nsiLocalFile interface, initializing it with the
	 * path supplied if it is supplied.
	 * @param {String} fileBase (optional) File path
	 * @return {nsiLocalFile} file object
	 */
	getFile: function (fileBase) {
        var file = Components.classes["@mozilla.org/file/local;1"]
            .createInstance(Components.interfaces.nsILocalFile);
			if ( fileBase)
    			file.initWithPath(fileBase);
		return file;
	},
	
    /**
     * Write content to a file 
     * @param {String} content
     * @param {nsiLocalFile} file The file to write to
     * @return {String} The path to the file as a string
     */
    writeFile : function(content, file ,theWindow){
            try {
                theWindow.netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
               
                if(!file.exists()) 
                {
                    file.create( Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 420);
                }
                var stream = Components.classes["@mozilla.org/network/file-output-stream;1"]
                    .createInstance(Components.interfaces.nsIFileOutputStream);
                stream.init(file, 0x02 | 0x08 | 0x20, 0666, 0);
                stream.write(content, content.length);
                stream.close();
               
				return file.path;
            } catch (e) {
                debug.ui("Unable to write to file: " + fileName, e);
                throw new Error("Unable to write to file" + e.toString());
            }
    },
	/**
     * Prompts user to choose a file to save to (creating it if it does not exist)
     * @param {} title
     * @param {} defExtension
     * @param {} callback
     * @param {} win
     * @return {}
	 */
	writeFileWithSaveAs: function (title, defExtension, callback, win) {
			var nsIFilePicker = Components.interfaces.nsIFilePicker;
			var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
	        
			fp.defaultExtension = defExtension;
	        if ("xml" == defExtension){
	            fp.appendFilters(nsIFilePicker.filterXML); 
	        } else if ("txt" == defExtension){
	            fp.appendFilters(nsIFilePicker.filterText);  
	        } 
			fp.appendFilters(nsIFilePicker.filterAll);
			fp.init(win, title, nsIFilePicker.modeSave);
			var res = fp.show();
			if (res == nsIFilePicker.returnOK || res == nsIFilePicker.returnReplace) {
				var dataStr = callback();
				var thefile = fp.file;
				var fostream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
				fostream.init(thefile, 0x02 | 0x08 | 0x20, 0666, 0);
				var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].createInstance(Components.interfaces.nsIConverterOutputStream);
				converter.init(fostream, "UTF-8", 0, 0);
				converter.writeString(dataStr);
				converter.close();
				return {fname: thefile.persistentDescriptor, data:dataStr};
			}
			return null;
			
	},
	/**
     * Prompts user to choose a file and loads that file
     * @param {} title
     * @param {} defExtension
     * @param {} win
     * @return {}
	 */
	loadFileWithOpen: function(title, defExtension, win) {
		 
		 var nsIFilePicker = Components.interfaces.nsIFilePicker;
         var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
         fp.appendFilters(nsIFilePicker.filterXML);
         fp.appendFilter(defExtension.desc, defExtension.filter);
	   	 fp.init(win, title , nsIFilePicker.modeOpen);
         
		 var res = fp.show();
         
		 if (res == nsIFilePicker.returnOK){
         	var thefile = fp.file;
            var data = "";
            var fistream = Components.classes["@mozilla.org/network/file-input-stream;1"].
                        createInstance(Components.interfaces.nsIFileInputStream);
            var cstream = Components.classes["@mozilla.org/intl/converter-input-stream;1"].
                        createInstance(Components.interfaces.nsIConverterInputStream);
            fistream.init(thefile, -1, 0, 0);
            cstream.init(fistream, "UTF-8", 0, 0); 
            var str = {};
            while(cstream.readString(4096,str) != 0){
                data += str.value;
            }
            cstream.close();
			return {fname: thefile.persistentDescriptor, data:data};
        }
		return null;
	},
    
    /**
     * Remove any artifacts from the XPath
     * @param {} xp
     */
    normalizeXPointer : function(xp) {
		
	if (typeof(xp) == 'string') {
		var idx = xp.indexOf('#');
		return xp.substring(idx + 1);
	}

	for ( var i =0; i < xp.length;i++) {
		xp[i] = xp[i] + '';
		xp[i] = xp[i].substring(xp[i].indexOf("#")+1);
	}

	return xp;
    },
    
    /**
     * Read a file that exists in the LORE extension
     * Path supplied is relative to <profile>/lore/
     * @param {} path
     */
    readChromeFile : function(path, win) {
          try {
            var url = "chrome://lore/" + path;
            var xhr = new win.XMLHttpRequest();
            xhr.overrideMimeType('text/javascript');
        
            xhr.open("GET", url, false);
            xhr.send(null);
            return xhr.responseText;
        } catch (e) {
            debug.ui("Unable to read resource file: " + e.toString());
        }
    },
    /** 
     * Inject contents of local script into a document
     * @param {} chromefile Path to chrome file
     */
    injectScript : function (chromefile,win) {
        var doc = win.document;
        var buffer = util.readChromeFile(chromefile, win);
        var script = doc.createElement("script");
        script.type = "text/javascript";
        script.innerHTML = buffer;
        doc.getElementsByTagName("head")[0].appendChild(script);   
    },
	/**
     * Inject contents of local stylesheet into document
     * @param {} chromefile
     * @param {} win
	 */
	injectCSS : function ( chromefile, win ) {
		var doc = win.document;
        var buffer = util.readChromeFile(chromefile, win);
        var script = doc.createElement("style");
        script.innerHTML = buffer;
        doc.getElementsByTagName("head")[0].appendChild(script);   
	},
	
    /**
     * Generate random colour and return as hex string
     * If one or more arguments aren't supplied min fields wil default to 0
     * and max fields will default to 255
     * @param {Object} mr min red
     * @param {Object} mg min green
     * @param {Object} mb min blue
     * @param {Object} mxr max red
     * @param {Object} mxg max green
     * @param {Object} mxb max blue
     */
    generateColour : function(mr,mg,mb,mxr, mxg, mxb) {
        var min = new Array( (mr ? mr: 0), (mg ? mg: 0), (mb ? mb: 0) );
        var max = new Array( (mxr ? mxr: 255), (mxg ? mxg: 255), (mxb ? mxb: 255) );
        
        var rgb = new Array(3);
        for (var i = 0; i < rgb.length; i++) {
            rgb[i] = Math.round(Math.random() * (max[i] - min[i])) + min[i];
        }
        var colour = rgb[0] + ( rgb[1] << 8) + (rgb[2] << 16);
        return "#" + colour.toString(16);
    },
	
	/**
	 * Disect the range into multiple ranges IF a selection passes it's containing DOM 
	 * element's DOM boundary  
     * @param {} targetDocument
     * @param {} r
     * @param {} nodeTmpl
     * @return {}
     */
	safeSurroundContents: function(targetDocument, r, nodeTmpl) {
		var nodes = [];
			
		if ( r.startContainer.parentNode == r.endContainer.parentNode ) {
			// doesn't cross parent element boundary
			var n = nodeTmpl.cloneNode(false);
			r.surroundContents(n);
			
			return [n];
		} 
		var s = r.startContainer;
		var e = r.endContainer;

		// create inital range to end of the start Container
		// set end offset to end of contents of start node
		// i.e <div> This [is </div> <p> a lot of </p><p>highli]ghting</p>
		// inital range is 'is ' out the selection ( '[' and ']' denote highlighted region)
		var w = targetDocument.createRange();
		
		w.selectNodeContents(s);
		w.setStart(r.startContainer,r.startOffset);
		//debug.ui("start range: " + w, w);
		var n = nodeTmpl.cloneNode(false);
		w.surroundContents(n);
		nodes.push(n);
		
		var container = s.nodeType !=1 ?  n: s;
		// loop through DOM nodes thats are completely selected 
		// i.e 'a lot of ' range selection would be created from the example
		var containsEl = function(src, dest) {
			if ( src == dest) {
				return true;
			}
			
			if (src.nodeType == 1) {
				for (var i = 0; i < src.childNodes.length; i++) {
					if (containsEl(src.childNodes[i], dest)) {
						return true;
					}
				}
			}
			return false;
		};
		
		var tag = function(container) {
			var nt = container.nodeType;
			var ignore = {};
			if ( nt == 1 ) {
				for (var i = 0; i < container.childNodes.length; i++) {
					var n = container.childNodes[i];
					if (!n.id || (n.id && !ignore[n.id])) {
						n = tag(container.childNodes[i]);
						if ( n) ignore[n.id] = n;
					}
				}
			} else if ( (nt == 3 || nt ==4 || nt == 8) && util.trim(container.nodeValue) != '') {
				var w = targetDocument.createRange();
				w.selectNodeContents(container);
				//debug.ui("tagging : " + w , w);
				var n = nodeTmpl.cloneNode(false);
				w.surroundContents(n);
				n.id = debug.hcounter|| 0;
				debug.hcounter = debug.hcounter ? debug.hcounter+1:1;
								
				nodes.push(n);
				return n;
			}
		};
		
		// move up the DOM tree until find parent node
		// that contains the end container  
		var found = false;
		while ( !found ) {
			while (!container.nextSibling ) {
					//debug.ui('p');
					container = container.parentNode;
					if (!container)
						break;
			}
			if (!container)
				break;
			//debug.ui('s');	
			container = container.nextSibling;
			
			if ( containsEl(container, e)) {
				found = true;
			}
			else {
				tag(container);
			}
		}
		// traverse down to end container
		container = container.nodeType == 1 ? container.firstChild : container;
		
		while ( container != e ) {
			if ( containsEl(container, e) ){
				container = container.firstChild;
			} else {
				tag(container);
				container = container.nextSibling;
			}
		}
		
		// create range for end container
		// i.e 'highli' from example
		w = targetDocument.createRange();
		w.selectNodeContents(e);
		w.setEnd(r.endContainer, r.endOffset);
		//debug.ui("end range: " + w, w);
		n = nodeTmpl.cloneNode(false);
		w.surroundContents(n);
		nodes.push(n);
		//debug.ui("end");
		
		return nodes;
	},

		
	 /**
     * Highlight part of a document
     * @param {} sel Context to highlight (as DOM Range)
     * @param {} targetDocument The document in which to highlight
     * @param {} scrollToHighlight Boolean indicating whether to scroll
     * @param {} colour highlight colour
     */
	highlightRange : function ( sel, targetDocument, scrollToHighlight, styleCallback) {
		try {
            var highlightNodeTmpl = targetDocument.createElementNS(constants.NAMESPACES["xhtml"], "span");
			if ( styleCallback)
				styleCallback(highlightNodeTmpl);
			
			var highlightNodes =  util.safeSurroundContents(targetDocument, sel, highlightNodeTmpl);
			for ( var i =0; i< highlightNodes.length;i++) {
				util.ignoreElementForXP(highlightNodes[i]);
			}

            if (scrollToHighlight) {
                util.scrollToElement(highlightNodes[0], targetDocument.defaultView);
            }
            
            return highlightNodes;
        } catch (e) {
            debug.ui(e,e);
            return null;
        }
	},
	
	/**
	 * Create a dom node configure to be ignored by the xpath parser 
	 * @param {String} tagName
	 * @param {Document} targetDocument
	 * @return {Node} Created dom node. Not attached to the document.
	 */
	domCreate: function (tagName, targetDocument) {
		var domNode = targetDocument.createElement(tagName);
		util.ignoreElementForXP ( domNode);
		return domNode;
	},
	
	/**
	 * Mark element to be ignored when xpointer library is searching through dom during node resolution
	 * @param {Object} domNode
	 */
	ignoreElementForXP : function ( domNode ) {
		m_xps.markElement(domNode);
	},	
	
    /**
     * Return the window object of the content window
     */
    getContentWindow : function(win) {
        return win.top.getBrowser().selectedBrowser.contentWindow;
    },
    /**
     * Get the Range defined by an XPath/Xpointer (restricted to subset of
     * expressions understood by Anozilla).
     * modified from dannotate.js
     */
    getSelectionForXPath : function(xp, targetDocument)
    {
        return m_xps.xptrResolver.resolveXPointerToRange(xp, targetDocument);
    },
    /**
     * @param {} xp
     * @param {} win
     * @return {}
     */
    getNodeForXPath : function(xp, targetDocument) {
		//return targetDocument.evaluate( xp, targetDocument, null, win.XPathResult.FIRST_ORDERED_NODE_TYPE, null ).singleNodeValue;
		if ( xp.indexOf("#") != -1)
			xp = xp.substring(xp.indexOf("#")+1);
		
		return targetDocument.evaluate( xp, targetDocument, null, 0, null ).iterateNext();
    },
	/**
     * 
     * @param {} xp
     * @param {} targetDocument
     * @return {}
	 */
	getNodeForXPointer: function(xp, targetDocument) {
		if ( xp.indexOf("#") != -1)
			xp = xp.substring(xp.indexOf("#")+1);
		return m_xps.parseXPointerToNode(xp, targetDocument);
	},
	
    /**
     * This fn depends on a hacked version of nsXpointerService being loaded by the browser
     * before this script is loaded from tags in the page being annotated.
     * modified from dannotate.js
     * @return XPath/XPointer statement for selected text, or '' if no selection.
     */
    
    getXPathForSelection : function(win)
    {
      var mainwindow = util.getContentWindow(win);
      var xp = '';
      try {
        var seln = mainwindow.getSelection();
        
        if (seln && seln!='') {
          var select = seln.getRangeAt(0);
          xp = m_xps.xptrCreator.createXPointerFromSelection(seln, mainwindow.document);
        }
      }
      catch (ex) {
        throw new Error('XPath create failed\n' + ex.toString());
      }
      return xp;
    },
    /**
     * Return an XPath for an image
     */
	getXPathForImageSelection : function (domNode, doc, coords, noScale ) {
			var scale = noScale ? {x:1,y:1}: util.getImageScaleFactor( domNode, doc);
			var x1 = parseInt(coords.x1 * scale.x), y1 = parseInt(coords.y1 * scale.y), 
				x2 = parseInt(coords.x2 * scale.x), y2 = parseInt(coords.y2 * scale.y);
			
			var xp = ("xpointer(image-range(" + m_xps.xptrCreator.create_child_XPointer(domNode)
			+ ",[" + x1 + "," + y1 + "],[" + x2 + "," + y2 + "],\"" + domNode.src + "\"))");
			 
			debug.ui("The image region Xpointer is: " + xp);
			return xp;	
	},
	/**
     * Creates a hash to represent a triple
     * @param {} triple
     * @return {}
	 */
	tripleToStringHash: function( triple ) {
		return util.ELFHash(triple.subject.toString() + "_" + triple.property.toString() + "_" + triple.object.value.toString());
	},
	
	  
	/**
     * 
     * @param {} triple
     * @return {}
	 */
	getMetaSelection: function(triple) {
		var stringHash = '';
		var sel = [];
		try {
			stringHash = util.tripleToStringHash(triple);
			sel.push(stringHash);
		} catch (e) {
			debug.anno("Error occurred generating string hash for triple: " +e ,e );
		}
		
		if (!triple.source) {
			debug.ui ( "Couldn't find dom context", triple);
			return sel;
		}
		
		try {
			var xp = "xpointer(" + m_xps.xptrCreator.create_child_XPointer(triple.source) + ")";
			sel.push(xp);
		} catch (e) {
			debug.anno("Error occurred generating xpointer for tirple:  " +e, e);
		}
		return sel;
	},
	/**
     * 
     * @param {} srcHash
     * @param {} triples
     * @return {}
	 */
	stringHashToTriple: function( srcHash, triples ) {
		srcHash = srcHash + '';
		if ( srcHash.indexOf("#")!=-1)
			srcHash = srcHash.substring(srcHash.indexOf("#")+1); 
		
		for (var i = 0; i < triples.length; i++) {
			var hash = util.tripleToStringHash(triples[i]) + '';
			if (srcHash == hash) {
				return triples[i];
			}
		}
		return null;
	},
	/**
     * 
     * @param {} srcHash
     * @param {} triples
     * @return {}
	 */
	getSelectionForHash: function( srcHash, triples ){
		try {
			var triple = util.stringHashToTriple(srcHash, triples).source;
			if ( triple ) {
				
				var r = triple.ownerDocument.createRange();
				r.selectNode(triple);
				return r;
			}
			return null;
		} catch (e) {
			debug.anno(e,e);
		}
		
		return null;
	},
	/**
     * Checks if xpointer contains an image range
     * @param {} xp The xpointer to check
     * @return {Boolean} True if xp contains an image range
	 */
	isXPointerImageRange: function ( xp) {
		return xp.indexOf("image-range") != -1;
	},
	/**
     * 
     * @param {} xpointer
     * @param {} targetDocument
     * @return {}
	 */
	parseImageRangeXPointer: function (xpointer, targetDocument) {
		if (!util.isXPointerImageRange(xpointer))
			return null;
		
		xpointer = util.normalizeXPointer(xpointer);
		
		var xpBits = xpointer.substring("xpointer(image-range(".length ).split(',');
		var xp =  xpBits[0];
		//debug.ui("xpath is " + xp, targetDocument);
		var img = util.getNodeForXPath(xp, targetDocument);
	
		// co-ordinates
		var x1 = parseInt(xpBits[1].substring(1)),
	    	y1 = parseInt(xpBits[2].substring(0,xpBits[2].length-1)),
			x2 = parseInt(xpBits[3].substring(1)),
			y2 = parseInt(xpBits[4].substring(0,xpBits[4].length-1));
		var coords = {x1: x1, y1:y1, x2:x2, y2:y2};
		return { image: img, coords: coords};
	},
	
	/**
     * Temporarily load another copy of an image an determine if the version
     * visible on the page has been scaled (implicitly or explicitly)
     * @param img The IMG element to test
     */
    getImageScaleFactor: function  (img, doc)
    {
		// stripped from dannotate.js
		//var doc = img.ownerDocument;
		var iwidth = parseInt(img.offsetWidth);
		var iheight = parseInt(img.offsetHeight);
		var tmpNode = doc.createElement('img');
		tmpNode.setAttribute('src', img.src);
		tmpNode.style.visibility = 'hidden';
		doc.body.appendChild(tmpNode);
		
		var twidth = parseInt(tmpNode.offsetWidth);
		var theight = parseInt(tmpNode.offsetHeight);
		doc.body.removeChild(tmpNode);
		
		var xScaleFac = twidth/iwidth;
		var yScaleFac = theight/iheight;
		return { x: xScaleFac, y: yScaleFac, imgWidth:iwidth, imgHeight:iheight, origWidth:twidth,origHeight:theight};
    },
				
    /**
     * Return the text contents of a selection
     * @param {} currentCtxt
     * @return {} The selection contents
     */
    getSelectionText : function(currentCtxt, targetDocument){
        var selText = "";
        if (currentCtxt){
            if ( util.isXPointerImageRange(currentCtxt)){
				
				var data = util.parseImageRangeXPointer(currentCtxt, targetDocument);
				var c = data.coords;
				return 'Image region (' + c.x1 + ', ' + c.y1 +')-(' + c.x2 +', ' + c.y2 +') selected from ' + data.image.src; 				
			}
			var idx = currentCtxt.indexOf('#');
            var sel = util.getSelectionForXPath(currentCtxt.substring(idx + 1), targetDocument);
            selText = sel.toString();
            if (selText){
                if (selText.length > 100){
                    selText = selText.substring(0,100) + "...";
                }
            }
        }
        return selText;
    },
    /**
     * Split a URL identifier into namespace and term
     * @param {String} theurl The URL identifier to split
     * @return {Object} A JSON object with properties ns (the namespace) and term
     *         (the unqualified term)
     */
    splitTerm : function(theurl) {
        var result = {};
        // try splitting on #
        var termsplit = theurl.split("#");
        if (termsplit.length > 1) {
            result.ns = (termsplit[0] + "#");
            result.term = termsplit[1];
        } else {
            // split after last slash
            var lastSlash = theurl.lastIndexOf('/');
            result.ns = theurl.substring(0, lastSlash + 1);
            result.term = theurl.substring(lastSlash + 1);
        }
        return result;
    },
    /**
     * @param {} tree
     * @param {} attribute
     * @param {} value
     * @return {}
     */
    findChildRecursively : function(tree,attribute, value) {
        var cs = tree.childNodes;
        var found;
        for(var i = 0, len = cs.length; i < len; i++) {
            if(cs[i].attributes[attribute] == value){
                return cs[i];
            }
            else {
                // Find it in this tree
                if(found = util.findChildRecursively(cs[i], attribute, value)) {
                    return found;
                }
            }
        }
        return null;
    },
    /**
     * @param {} store
     * @param {} xid
     * @return {}
     */
    findRecordById : function(store, xid) {
        var ind = store.findBy(function(rec, id){
                if ( !xid ) {
                    return !rec.json.id;
                } else  if (rec.json.id == xid) {
                    return true;
                }
            })
        if (ind != -1) {
            return store.getAt(ind);
        } else {
            return null;
        }
    },
    
    /**
     * Escape characters for HTML display
     * @return {}
     */
    escapeHTML : function (str) {                                       
            return(                                                                 
                str.replace(/&/g,'&amp;').                                         
                    replace(/>/g,'&gt;').                                           
                    replace(/</g,'&lt;').                                           
                    replace(/"/g,'&quot;').
                    replace(/'/g,'&apos;')                                         
            );                                                                     
    },
    /**
     * Unescape HTML entities to characters
     * @return {}
     */
    unescapeHTML : function (str){
        return(                                                                 
                str.replace(/&amp;/g,'&').                                         
                    replace(/&gt;/g,'>').                                           
                    replace(/&lt;/g,'<').                                           
                    replace(/&quot;/g,'"').
                    replace(/&apos;/g,'\'') 
            );    
    },
    
    /**
     * Creates a XUL iframe that has javascript and embedded objects disabled. 
     * @param iframe DOM element 
     * @param theurl URL to load
     * @param exOnLoad callback function
     
     */
    
    createXULIFrame : function(win) {
        var iframe = win.top.document.createElement("iframe"); // create a XUL iframe 
        
        iframe.setAttribute("type", "content");
        iframe.setAttribute("collapsed", true);
        iframe.style.visibility = "visible";
        iframe.setAttribute("src", "about:config");
        return iframe;
    },
    /**
     * @param {} iframe
     * @param {} theurl
     */
    setSecureXULIFrameContent : function(iframe, theurl) {
    
        // once the document had loaded the iframe
        // the docshell object will be created.
        // dochsell must be set before loading the page
        // so reload the page
        iframe.docShell.allowAuth = false;
        //iframe.docShell.allowImages = false;
        iframe.docShell.allowJavascript = false;
        iframe.docShell.allowMetaRedirects = false;
        iframe.docShell.allowPlugins = false;
        // subframes inherit the permissons of the parents
        //iframe.docShell.allowSubframes = false;
        
        iframe.setAttribute("src",theurl);
    },
    /**
     * @param {} win
     * @param {} theurl
     * @param {} extraFunc
     * @return {}
     */
    createSecureIFrame : function(win, theurl, extraFunc) {
        var iframe = util.createXULIFrame(win);
        
        iframe.addEventListener("load", function onLoadTrigger (event) {
                                try {
                                    iframe.removeEventListener("load", onLoadTrigger, true);
                                    util.setSecureXULIFrameContent(iframe, theurl);
                                    if ( extraFunc) {
                                        extraFunc();
                                    }
                                } catch (e ) {
                                    debug.ore("iframe(onload): " + e, e);
                                }
            }, true);
            
        iframe.setAttribute("src", "about:blank"); // trigger onload
        return iframe;
    },
    
    /**
     * Basic HTML Sanitizer using Firefox's parseFragment
     * @param {Object} html
     */
    sanitizeHTML : function(html, win) {
        var serializer = new win.XMLSerializer();
        
        var fragment = Components.classes["@mozilla.org/feed-unescapehtml;1"]  
            .getService(Components.interfaces.nsIScriptableUnescapeHTML)  
            .parseFragment(html, false, null, win.document.body);
        if (fragment) {
            var buf = serializer.serializeToString(fragment);
            // remove garbage
            return buf.replace(/[\x80-\xff|\u0080-\uFFFF]*/g, '');
        } else {
            return "";
        }
        
        
    },
    /**
     * Add target="_blank" to all links in an html string
     * @param {Object} html
     */
    externalizeLinks : function(html){
        return html.replace(/<A /g,'<A target="_blank" '); 
    },
    /**
     * @name lore.util.externalizeDomLinks
     * @param {} node
     */
    externalizeDomLinks : function(node){
        var links = node.getElementsByTagName('a');
        var attr;
        for (var i=0; i < links.length; i++){
            attr = node.ownerDocument.createAttribute('target');
            attr.nodeValue = "_blank";
            links[i].setAttributeNode(attr);
        }
    },
    /**
     * normalize spaces in a string
     * @return {}
     */
    normalize : function(str) {
        return str.replace(/^\s*|\s(?=\s)|\s*$/g, "");
    },
	/**
     * Transform RDF to a presentation format using an XSLT stylesheet
     * @param {} stylesheetURL
     * @param {} theRDF
     * @param {} params
     * @param {} win
     * @param {} serialize
     * @return {}
	 */
	transformRDF: function(stylesheetURL, theRDF, params, win, serialize) {
	
		var xsltproc = new win.XSLTProcessor();
	    // get the stylesheet - this has to be an XMLHttpRequest because Ext.Ajax.request fails on chrome urls
	    var xhr = new win.XMLHttpRequest();
	    xhr.overrideMimeType('text/xml');
	    xhr.open("GET", stylesheetURL, false);
	    xhr.send(null);
	    var stylesheetDoc = xhr.responseXML;
	    xsltproc.importStylesheet(stylesheetDoc
		);
	    for (param in params){
	        xsltproc.setParameter(null,param,params[param]);
	    }
	    xsltproc.setParameter(null, "indent", "yes");
	    
	    var parser = new win.DOMParser();
	    var rdfDoc = parser.parseFromString(theRDF, "text/xml");
        try{
	    var resultFrag = xsltproc.transformToFragment(rdfDoc, win.document);
        } catch (e){
            debug.ui("Error transforming RDF",e);
        }
	    if (serialize){
	         var serializer = new win.XMLSerializer();
	         return serializer.serializeToString(resultFrag);
	    } else {
	        return resultFrag
	    }
	}
};