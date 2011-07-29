Ext.namespace('Ext.ux.plugin');

/**
* @class Ext.ux.plugin.VisibilityMode
* @version  1.1
* @author Doug Hendricks. doug[always-At]theactivegroup.com
* @copyright 2007-2008, Active Group, Inc.  All rights reserved.
* @license <a href="http://www.gnu.org/licenses/gpl.html">GPL 3.0</a>
* @donate <a target="tag_donate" href="http://donate.theactivegroup.com"><img border="0" src="http://www.paypal.com/en_US/i/btn/x-click-butcc-donate.gif" border="0" alt="Make a donation to support ongoing development"></a>
* @constructor
* @desc
* This plugin provides an alternate visibility mode to Ext.Elements and a new hideMode for Ext.Components.<br />
* <p>It is generally designed for use with all browsers <b>except</b> Internet Explorer.
* <p>If included in a Component as a plugin, it sets it's hideMode to 'nosize' and provides a new supported
* CSS rule that sets the height and width of an element and all child elements to 0 (rather than
* 'display:none', which causes DOM reflow to occur and re-initializes nested OBJECT, EMBED, and IFRAMES elements)
* @example someContainer.add({
    xtype:'flashpanel',
    plugins: [new Ext.ux.plugin.VisibilityMode({hideMode:'nosize'}) ],
    ...
    });

  //or, Fix a specific Container only and all of it's child items:

 var V = new Ext.ux.plugin.VisibilityMode({hideMode:'nosize', bubble : false }) ;
 new Ext.TabPanel({
    plugins     : V,
    defaults    :{ plugins: V },
    items       :[....]
 });
*/

Ext.onReady(function(){
  var CSS = Ext.util.CSS;

    if(!Ext.isIE && this.fixMaximizedWindow !== false){
        //Prevent overflow:hidden (reflow) transitions when an Ext.Window is maximize.
        CSS.updateRule ( '.x-window-maximized-ct', 'overflow', '');
    }


    /* This important rule solves many of the <object/iframe>.reInit issues encountered
    * when setting display:none on an upstream(parent) element (on all Browsers except IE).
    * This default rule enables the new Panel:hideMode 'nosize'. The rule is designed to
    * set height/width to 0 cia CSS if hidden or collapsed.
    * Additional selectors also hide 'x-panel-body's within layouts to prevent
    * container and <object, img, iframe> bleed-thru.
    */

    
    CSS.createStyleSheet('.x-hide-nosize, .x-hide-nosize * {height:0px!important;width:0px!important;border:none!important;}');
    CSS.refreshCache();
    
});


Ext.ux.plugin.VisibilityMode = function(opt) {

    Ext.apply(this, opt||{});

    

    //Apply the necessary overrides to Ext.Element once.
    if(!Ext.Element.prototype.setVisible.patched){

          Ext.override(Ext.Element, {
              setVisible : function(visible, animate){

                if(!animate || !Ext.lib.Anim){
                    if(this.visibilityMode === Ext.Element.DISPLAY){
                        this.setDisplayed(visible);
                    }else if(this.visibilityMode === Ext.Element.VISIBILITY){
                        this.fixDisplay();
                        this.dom.style.visibility = visible ? "visible" : "hidden";
                    }else {
                        this[visible?'removeClass':'addClass'](String(this.visibilityMode));
                    }

                }else{
                    // closure for composites
                    var dom = this.dom;
                    var visMode = this.visibilityMode;

                    if(visible){
                        this.setOpacity(.01);
                        this.setVisible(true);
                    }
                    this.anim({opacity: { to: (visible?1:0) }},
                          this.preanim(arguments, 1),
                          null, .35, 'easeIn', function(){

                             if(!visible){
                                 if(visMode === Ext.Element.DISPLAY){
                                     dom.style.display = "none";
                                 }else if(visMode === Ext.Element.VISIBILITY){
                                     dom.style.visibility = "hidden";
                                 }else {
                                     Ext.get(dom).addClass(String(visMode));
                                 }
                                 Ext.get(dom).setOpacity(1);
                             }
                         });
                }

                return this;
            },

            /**
             * Checks whether the element is currently visible using both visibility and display properties.
             * @param {Boolean} deep (optional) True to walk the dom and see if parent elements are hidden (defaults to false)
             * @return {Boolean} True if the element is currently visible, else false
             */
            isVisible : function(deep) {
                var vis = !( this.getStyle("visibility") === "hidden" || this.getStyle("display") === "none" || this.hasClass(this.visibilityMode));
                if(deep !== true || !vis){
                    return vis;
                }
                var p = this.dom.parentNode;
                while(p && p.tagName.toLowerCase() !== "body"){
                    if(!Ext.fly(p, '_isVisible').isVisible()){
                        return false;
                    }
                    p = p.parentNode;
                }
                return true;
            }
        });
        Ext.Element.prototype.setVisible.patched = true;
    }
   };


  Ext.ux.plugin.VisibilityMode.prototype = {


       /**
        * @cfg {Boolean} bubble If true, the VisibilityMode fixes are also applied to parent Containers which may also impact DOM reflow problems.
        * @default true
        */
      bubble              :  true,

      /**
      * @cfg {Boolean} fixMaximizedWindow If not false, the ext-all.css style rule 'x-window-maximized-ct' is disabled to <b>prevent</b> reflow
      * after overflow:hidden is applied to the document.body.
      * @default true
      */
      fixMaximizedWindow  :  true,

      /**
       *
       * @cfg {array} elements (optional) A list of additional named component members to also adjust visibility for.
       * <br />By default, the plugin handles most scenarios automatically.
       * @default null
       * @example ['bwrap','toptoolbar']
       */

      elements       :  null,

      /**
       * @cfg {String} visibilityCls A specific CSS classname to apply to Component element when hidden/made visible.
       * @default 'x-hide-nosize'
       */

      visibilityCls   : 'x-hide-nosize',

      /**
       * @cfg {String} hideMode A specific hideMode value to assign to affected Components.
       * @default 'nosize'
       */
      hideMode  :   'nosize' ,

     /**
      * Component plugin initialization method.
      * @param {Ext.Component} c The Ext.Component (or subclass) for which to apply visibilityMode treatment
      */
     init : function(c) {

        var El = Ext.Element;

        var hideMode = this.hideMode || c.hideMode;
        var visMode = c.visibilityCls || this.visibilityCls || El[hideMode.toUpperCase()] || El.VISIBILITY;
        var plugin = this;

        var changeVis = function(){

            var els = [this.collapseEl, this.floating? null: this.actionMode ].concat(plugin.elements||[]);

            Ext.each(els, function(el){
            var e = el ? this[el] : el;
            if(e && e.setVisibilityMode){
                e.setVisibilityMode(visMode);
            }
            },this);

            var cfg = {
            animCollapse : false,
            hideMode  : hideMode,
            animFloat : false,
            visibilityCls  : visMode,
            defaults  : this.defaults || {}
            };

            cfg.defaults.hideMode = hideMode;
            cfg.defaults.visibilityCls = visMode;

            Ext.apply(this, cfg);
            Ext.apply(this.initialConfig || {}, cfg);

         };

         var bubble = Ext.Container.prototype.bubble;


         c.on('render', function(){

            // Bubble up the layout and set the new
            // visibility mode on parent containers
            // which might also cause DOM reflow when
            // hidden or collapsed.
            if(plugin.bubble !== false && this.ownerCt){

               bubble.call(this.ownerCt, function(){

               if(this.hideMode !== hideMode){
                  this.hideMode = hideMode ;

                  this.on('afterlayout', changeVis, this, {single:true} );
                }

              });
             }

             changeVis.call(this);

          }, c, {single:true});


     }

  };

