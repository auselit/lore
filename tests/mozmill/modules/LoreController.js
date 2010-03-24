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

var jumlib = {};

Components.utils.import("resource://mozmill/modules/jum.js", jumlib);

var EXPORTED_SYMBOLS = ['LoreController'];

	
LoreController = {
	
		init: function (controller, elementslib){
	
		this.overlay=  controller.window.loreoverlay;
		this.anno=  controller.window.document.getElementById('annographiframe').contentWindow;
		this.annoDoc= controller.window.document.getElementById('annographiframe').contentWindow.document;
		this.co= controller.window.document.getElementById('graphiframe').contentWindow;
		this.coDoc= controller.window.document.getElementById('graphiframe').contentWindow.document;
		this.win= controller.window;
		this.controller = controller;
		this.elementslib = elementslib;
				
		//TODO: Would be better to load from JSON file.
		this.testPreferences = {
			annoserver: "http://maenad-auselit.cloud.itee.uq.edu.au/danno/annotea",
			dccreator: "Test User",
			disable: false,
			mode: false,
			timeout: 1
		}
		
		return this;
	},
		
		waitForEvent: function(pre, observee, event, timeout, interval, msg, fail){
			this.recurringWaitForEvent(pre, observee, event, function () { return true}, timeout, interval, msg, fail);
		},
			
		recurringWaitForEvent: function(pre, observee, event, condition, timeout, interval, msg, fail){
			//this.anno.lore.debug.anno('waitForTreeNodeInsert - start ', arguments);
			var eventOccurred = false,
				eventSuccessful = false;
			
			if (!interval) 
				interval = 100;
			
			var eventHandler = function(){
				try {
					eventOccurred = true;
					if (!eventSuccessful) {
						if (condition.apply(this, arguments)) 
							eventSuccessful = true;
						this.anno.lore.debug.anno('msg: ' + msg + ' eventOccurred true. eventSuccessful ' + eventSuccessful + '. fail flag: ' + fail);
					}
				} catch(e) {
					controller.window.alert(e);
				}
			};
			
			observee.on(event, eventHandler, this);
			var millis = 0;
			if (pre) 
				pre();
			
			//this.anno.lore.debug.anno('polling');
			while (!eventSuccessful && (millis < timeout)) {
				millis += interval;
				this.controller.sleep(interval);
			}
			
			observee.un(event, eventHandler, this);
			
			//this.anno.lore.debug.anno('waitForTreeNodeInsert - finish', arguments);
			if ( !fail )
				jumlib.assertTrue(eventSuccessful, msg || event + " successful.");
			else
				jumlib.assertFalse(eventSuccessful, msg || event + " unsuccessful.");
			
		},
		
		waitForTreeNodeInsert: function(pre, parent, timeout, interval, fail){
			this.waitForEvent(pre, parent, 'append', timeout, interval, 'Node inserted', fail);
		},
		
		waitForTreeNodeRemoval: function(pre, parent, timeout, interval, fail) {
			this.waitForEvent(pre, parent, 'remove', timeout, interval, 'Node removed', fail);
		},
		
		assertValues: function(window, values){
			for (var name in values) {
				//this.anno.lore.debug.anno('checking ' + name + ' to be value: ' + values[name]);
				this.controller.assertValue(new this.elementslib.ID(window, name), values[name]);
			}
		},
		
		//TODO: Replace with firefox test profile run via command line
		pushPopTestPreferences: function(push){
			var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.lore.");
			prefs.QueryInterface(Components.interfaces.nsIPrefBranch2);
			if (push) {
				this.originalPreferences = {
					annoserver: prefs.getCharPref("annoserver"),
					dccreator: prefs.getCharPref("dccreator"),
					disable: prefs.getBoolPref("disable_annotations"),
					mode: prefs.getBoolPref("annotationmode"),
					timeout: prefs.getIntPref("annocache_timeout")
				}
				var t = this.testPreferences;
				prefs.setCharPref("annoserver", t.annoserver);
				prefs.setCharPref("dccreator", t.dccreator);
				prefs.setBoolPref("disable_annotations", t.disable);
				prefs.setBoolPref("annotationmode", t.mode);
				prefs.setIntPref("annocache_timeout", t.timeout); // no caching by default
			}
			else {
				var o = this.originalPreferences;
				prefs.setCharPref("annoserver", o.annoserver);
				prefs.setCharPref("dccreator", o.dccreator);
				prefs.setBoolPref("disable_annotations", o.disable);
				prefs.setBoolPref("annotationmode", o.mode);
				prefs.setIntPref("annocache_timeout", o.timeout);
			}
			
		},
		
		openLore : function (annotations){
			var isVisibleFunc = annotations ? this.overlay.annotationsVisible:this.overlay.compoundObjectsVisible;
   			if (!isVisibleFunc()) {
    			 	this.controller.click(new this.elementslib.ID(this.controller.window.document, "loreStatusIcon"));
	   			jumlib.assertTrue(isVisibleFunc(),'LORE should be open');
   			}
		}
	}
