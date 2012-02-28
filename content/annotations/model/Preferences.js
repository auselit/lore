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
