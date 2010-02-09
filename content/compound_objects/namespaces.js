try {
// Set up JavaScript namespaces
lore = {
    /* General LORE user interface functionality */
    ui : {},
    /* Compound objects */
    ore: {
        /* Text mining */  
        textm: {}, 
        /* Graphical Editor */
        graph: {},
        /* Compound object-related user interface */
        ui: {},
        /* Model classes for Compound Objects */
        model: {},
        /* Repository access for Compound Objects */
        repos: {}
    },
    /* Global functions and properties  */
    global: {}
}
    // imports the lore namespace and its sub components
    Components.utils.import("resource://lore/constants.js", lore);
    // lore.debug
    Components.utils.import("resource://lore/util.js", lore.global);
    // lore.debug
    Components.utils.import("resource://lore/debug.js", lore);
    // Load and cache global ui functions
    Components.utils.import("resource://lore/uiglobal.js", lore.global);
} catch (e) {
    window.top.alert(e + " " + e.stack);
}