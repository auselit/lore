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
 
 /*
  * General utility functions for I/O, manipulating the DOM, selections etc
  */
 
 /**
 * Display all keys, values for an object
 * @param {} obj to dump
 */
lore.util.dumpValues = function(obj){
	var res="";
	for(var k in obj){
		res += k + ": " + obj[k] + ";\n";
	}
	alert(res);
}

/**
 * Removes DOM node, but preserves its children by attaching them to the node's 
 * parent instead.
 * 
 * Taken from code snippet on http://stackoverflow.com/questions/170004/how-to-remove-only-the-parent-element-and-not-its-child-elements-in-javascript .
 * 
 * @param DOMNode nodeToRemove
 */
lore.util.removeNodePreserveChildren = function(nodeToRemove) {
  var fragment = document.createDocumentFragment();
  while(nodeToRemove.firstChild) {
    fragment.appendChild(nodeToRemove.firstChild);
  }
  nodeToRemove.parentNode.insertBefore(fragment, nodeToRemove);
  nodeToRemove.parentNode.removeChild(nodeToRemove);
}

/**
 * Returns value of first child of first node, or default value if provided.
 * Unchanged from dannotate.js
 */
lore.util.safeGetFirstChildValue = function(node, defaultValue)
{
  return ((node.length > 0) && (node[0] != null) && node[0].firstChild) ?
           node[0].firstChild.nodeValue : defaultValue ? defaultValue : '';
}

/**
 * Scroll to an element within a window
 * @param {} theElement
 * @param {} theWindow
 */
lore.util.scrollToElement = function(theElement, theWindow){

  var selectedPosX = 0;
  var selectedPosY = 0;
              
  while(theElement){
    selectedPosX += theElement.offsetLeft;
    selectedPosY += theElement.offsetTop;
    theElement = theElement.offsetParent;
  }
                                  
 theWindow.scrollTo(selectedPosX,selectedPosY);
}

/**
 * Launch a small window containing a URL
 * @param {} url The URL to launch
 * @param {} locbar Boolean: whether to show location bar
 */
lore.util.launchWindow = function(url, locbar) {
	var winOpts = 'height=650,width=800,top=200,left=250,resizable';
	if (locbar) {
		winOpts += ',location=1';
	}
	var newwindow=window.open(url,'name',winOpts);
	newwindow.focus();
} 


/**
 * Write file content to fileName in the extensions content folder
 * @param {} content
 * @param {} fileName
 * @return {}
 */
lore.util.writeFile = function(content, fileName){
		try {
			netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
			var fileBase = lore.ui.extension.path + "\\content\\";
			var filePath =  fileBase + fileName;
			var file = Components.classes["@mozilla.org/file/local;1"]
				.createInstance(Components.interfaces.nsILocalFile);
				file.initWithPath(filePath);
			if(!file.exists()) 
			{
				file.create( Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 420);
			}
			var stream = Components.classes["@mozilla.org/network/file-output-stream;1"]
				.createInstance(Components.interfaces.nsIFileOutputStream);
			stream.init(file, 0x02 | 0x08 | 0x20, 0666, 0);
			stream.write(content, content.length);
			stream.close();
			return filePath;
		} catch (e) {
			throw new Error("Unable to write to file: " + e.toString());
		}
}
/**
 * Highlight part of a document
 * @param {} xpointer Context to highlight (as xpointer)
 * @param {} targetDocument The document in which to highlight
 * @param {} scrollToHighlight Boolean indicating whether to scroll
 */
lore.util.highlightXPointer = function(xpointer, targetDocument, scrollToHighlight) {
  var sel = lore.m_xps.parseXPointerToRange(xpointer, targetDocument);
  
  var highlightNode = targetDocument.createElementNS(lore.constants.XHTML_NS, "span");
  // lore.m_xps.markElement(highlightNode);
  // lore.m_xps.markElementHide(highlightNode);
  highlightNode.style.backgroundColor = "yellow";
  sel.surroundContents(highlightNode);
  if (scrollToHighlight) {
    lore.util.scrollToElement(highlightNode, targetDocument.defaultView);
  }
  
  return highlightNode;
}
/**
 * Get the Range defined by an XPath/Xpointer (restricted to subset of
 * expressions understood by Anozilla).
 * modified from dannotate.js
 */
lore.util.getSelectionForXPath = function(xp)
{
	var mainwindow = window.top.getBrowser().selectedBrowser.contentWindow;
    return lore.m_xps.xptrResolver.resolveXPointerToRange(xp, mainwindow.document);
}
/**
 * This fn depends on a hacked version of nsXpointerService being loaded by the browser
 * before this script is loaded from tags in the page being annotated.
 * modified from dannotate.js
 * @return XPath/XPointer statement for selected text, or '' if no selection.
 */
lore.util.getXPathForSelection = function()
{
  var mainwindow = window.top.getBrowser().selectedBrowser.contentWindow;
  var xp = '';
  try {
    var seln = mainwindow.getSelection();
    if (seln != null) {
      var select = seln.getRangeAt(0);
      xp = lore.m_xps.xptrCreator.createXPointerFromSelection(seln, mainwindow.document);
    }
  }
  catch (ex) {
    throw new Error('XPath create failed\n' + ex.toString());
  }
  return xp;
}
/**
 * Return the text contents of a selection
 * @param {} currentCtxt
 * @return {} The selection contents
 */
lore.util.getSelectionText = function(currentCtxt){
	var selText = "";
	if (currentCtxt){
		var idx = currentCtxt.indexOf('#');
		var sel = lore.util.getSelectionForXPath(currentCtxt.substring(idx + 1));
		selText = sel.toString();
		if (selText){
			if (selText.length > 100){
				selText = selText.substring(0,100) + "...";
			}
		}
	}
	return selText;
}
/**
 * Escape characters for HTML display
 * @return {}
 */
String.prototype.escapeHTML = function () {                                       
        return(                                                                 
            this.replace(/&/g,'&amp;').                                         
                replace(/>/g,'&gt;').                                           
                replace(/</g,'&lt;').                                           
                replace(/"/g,'&quot;').
				replace(/'/g,'&apos;')                                         
        );                                                                     
};
/**
 * Unescape HTML entities to characters
 * @return {}
 */
String.prototype.unescapeHTML = function (){
	return(                                                                 
            this.replace(/&amp;/g,'&').                                         
                replace(/&gt;/g,'>').                                           
                replace(/&lt;/g,'<').                                           
                replace(/&quot;/g,'"')                                         
        );    
};
/**
 * Quick and nasty function to tidy up html string so that it is valid XML
 * @return {}
 */
String.prototype.tidyHTML = function (){
	var res = this;
	if (res.match("<title>") && res.match("</title>")){
		var res1 = res.substring(0,(res.indexOf('<title>')));
		var res2 = res.substring((res.indexOf('</title>')+8), res.length);
		res = res1 + res2;
	}
	while (res.match('<br xmlns"'+ lore.constants.XHTML_NS + '">')){
		res = res.replace('<br xmlns="' + lore.constants.XHTML_NS + '">', '<br />');
	}
	while (res.match('<br>')){
		res = res.replace('<br>','<br />');
	}
	while (res.match('</br>')){
		res = res.replace('</br>',' ');
	}
	if (res.match('nbsp')){
		res = res.replace('&nbsp;',' ');
	}
	return res;
};
/**
 * normalize spaces in a string
 * @return {}
 */
String.prototype.normalize = function() {
	return this.replace(/^\s*|\s(?=\s)|\s*$/g, "");
}
