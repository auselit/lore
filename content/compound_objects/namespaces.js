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
try {
    // Set up JavaScript namespaces
    lore = {
        /* General LORE user interface functionality */
        ui : {},
        /* Resource Maps */
        ore: {
            /* Text mining */  
            textm: {}, 
            /* Resource Map-related user interface */
            ui: {
                /* Graphical Editor */
                graph: {}
            },
            /* Model classes for Resource Maps */
            model: {},
            /* Repository access for Resource Maps */
            repos: {}
        },
        /* Global functions and properties  */
        global: {}
    };
    /* Import modules into the lore namespace.
     * Use eval for the import statements because the YUI compressor does not allow 
     * us to call the import function directly as import is a reserved word in JavaScript.
     */

    Components.utils["import"]("resource://lore/constants.js", lore);
    Components.utils["import"]("resource://lore/util.js",lore);
    Components.utils["import"]("resource://lore/debug.js", lore);
    Components.utils["import"]("resource://lore/uiglobal.js", lore.global);
    // Indicates whether we are on Firefox or Chrome
    lore.ore.firefox = true;
} catch (e) {
    window.top.alert(
        "Unable to load LORE. Please provide the following details to the development team:\n\n" 
        + e + " " + e.stack
    );
}