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