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

/**
 * Update the resource map dc:creator property
 * 
 * @param {}
 *            creator The new value for dc:creator
 */
lore.ui.setdccreator = function(creator) {
	var remprops = lore.ui.grid.getSource();
	remprops["dc:creator"] = creator;
	lore.ui.grid.setSource(remprops);
	lore.defaultCreator = creator;
}

lore.ui.anno.setdccreator = function(creator) {
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
lore.ui.setRepos = function(rdfrepos, rdfrepostype, annoserver) {
	lore.ore.reposURL = rdfrepos; // compound object repository
	lore.ore.reposType = rdfrepostype; // type of compound object repository
	// (eg sesame)
	lore.anno.annoURL = annoserver; // annotation server
}
/**
 * Display an informational message in the status bar
 * 
 * @param {}
 *            message The message to display
 */
lore.ui.loreInfo = function(message) {
	
	if (lore.ui.lorestatus) {
		lore.ui.lorestatus.setStatus({
			text: message,
			iconCls: 'info-icon',
			clear: {
				wait: 3000
			}
		});
	} else {
		lore.ui.loreMsg(message, 'info-icon');	
	}
     
}

/**
 * Display an warning message in the status bar
 * 
 * @param {}
 *            message The message to display
 */
lore.ui.loreWarning = function(message) {
	if (lore.ui.lorestatus) {
		lore.ui.lorestatus.setStatus({
			text: message,
			iconCls: 'warning-icon',
			clear: {
				wait: 3000
			}
		});
	}
	else {
		lore.ui.loreMsg(message, 'warning-icon');
	}
}
/**
 * Display an error message in the status bar
 * 
 * @param {}
 *            message The message to display
 */
lore.ui.loreError = function(message) {
	if (lore.ui.lorestatus) {
		lore.ui.lorestatus.setStatus({
			text: message,
			iconCls: 'error-icon',
			clear: {
				wait: 3000
			}
		});
	}
	else {
		lore.ui.loreMsg(message, 'error-icon');
	}
}

lore.ui.loreMsg = function (message, iconCls) {
	if ( !lore.ui.loreMsgStack) {
		lore.ui.loreMsgStack = [];
	}
	iconCls = iconCls || '';
	message = '<div class="status-bubble-icon ' + iconCls +'"></div><div class="status-bubble-msg">' + message + "</div>";
		
	lore.ui.loreMsgStack.push(message);
	Ext.Msg.show({msg: '', modal:false, closable:true, width:window.innerWidth});
	Ext.Msg.updateText(lore.ui.loreMsgStack.join('<br/>'));
	var w =Ext.Msg.getDialog(); 
	w.setPosition(0, window.innerHeight - w.getBox().height);
	
	window.setTimeout(function(){
		try {
			if (lore.ui.loreMsgStack.length == 1) {
				lore.ui.loreMsgStack.pop();
				Ext.Msg.hide();
			} else {
				lore.ui.loreMsgStack.splice(0, 1);
				Ext.Msg.updateText(lore.ui.loreMsgStack.join('<br/>'));
				var w =Ext.Msg.getDialog();
				w.setPosition(0, window.innerHeight - w.getBox().height);
			}
		} catch (e ) {
			lore.debug.ui(e,e);
		}
	},3000);
	
}
				
				


/**
 * Clear nodes from sources tree
 * 
 * @param {Object} theTree The tree node to clear
 */
lore.ui.clearTree = function(treeRoot) {
	while (treeRoot.firstChild) {
		treeRoot.removeChild(treeRoot.firstChild);
	}
}
/**
 * Set up scripts for image selection etc when a page loads in the browser
 * @param {} contextURL
 */
lore.ui.locationLoaded = function(contextURL){
    /*var doc = lore.util.getContentWindow().document;
    if (contextURL.match(".jpg")){ // temporary hack to test
        //if doc contains any images and it has not already been injected, inject image annotation script
        lore.util.injectScript("content/lib/ext/adapter/jquery/jquery-1.3.2.min.js",doc);
        lore.util.injectScript("content/lib/jquery.imgareaselect-0.8.min.js",doc);
        var imgscript = "$('img').imgAreaSelect({onSelectEnd: function(){alert('image region selected');},handles:'corners'});";
        var hidden = doc.createElement("div");
        var script = doc.createElement("script");
        script.type = "text/javascript";
        script.innerHTML = imgscript;
        var body = doc.getElementsByTagName("body")[0];
        if (body){
            body.appendChild(script);
            body.appendChild(hidden);
        }
    }*/
}
/**
 * Update the source lists to show annotations and compound objects that
 * reference the resource currently loaded in the web browser
 * 
 * @param {}
 *            contextURL The URL of the resource currently loaded in the browser
 */
lore.ui.updateSourceLists = function(contextURL) {
    lore.ui.currentURL = contextURL; // store the contextURL
	if (lore.ui.lorevisible) {
       
        //if (!lore.ui.disabled || !lore.ui.disabled.disable_annotations){
		if (lore.anno && lore.anno.updateAnnotationsSourceList) {
			lore.anno.updateAnnotationsSourceList(contextURL);
		}
        //}
        //if (!lore.ui.disabled || !lore.ui.disabled.disable_compoundobjects){
		if (lore.ore && lore.ore.updateCompoundObjectsSourceList) {
			lore.ore.updateCompoundObjectsSourceList(contextURL);
		}
		//}
		lore.ui.loadedURL = contextURL;
	}
}

lore.ui.loreOpen = function() {
	lore.ui.lorevisible = true;

	if (lore.ui.currentURL && lore.ui.currentURL != 'about:blank'
			&& lore.ui.currentURL != ''
			&& (!lore.ui.loadedURL || lore.ui.currentURL != lore.ui.loadedURL)) {
		
		lore.ui.updateSourceLists(lore.ui.currentURL);
		lore.ui.loadedURL = lore.ui.currentURL;
	}
}
lore.ui.loreClose = function() {
	lore.ui.lorevisible = false;
}





