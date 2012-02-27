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

/**
 * Object containing LORE preferences
 * @class lore.anno.Preferences
 * @extends Ext.util.Observable
 */
lore.anno.Preferences = Ext.extend(Ext.util.Observable, {

    /**
     * Attachs event to the parent object to listen for when prefernces changes
     * for annotations.
     * @param {Object} config Can contain the prefsObj which points to object that generates 'annoprefs_changed' events
     */
    constructor: function (config) {
        this.addEvents(
            /**
             * @event prefs_changed
             * Fires when one of the preferences changes
             * @param {Preferences} this
             */
            'prefs_changed');
        this.setPrefs(config);
    },
    
    /**
     * Set the preferences. Fires 'prefs_changed' event
     * @param {Object} args
     */
    setPrefs: function (args) {
        try {
            //lore.debug.anno("lore.anno.Preferences:setPrefs", [args, this]);
            Ext.apply(this, args);
            this.mode = args.mode ? lore.constants.ANNOMODE_SCHOLARLY: lore.constants.ANNOMODE_NORMAL;
            this.fireEvent('prefs_changed', this);
        } catch(e) {
            lore.debug.anno("Error setting annotation preferences",e);
        }   
    }
});
