var ContentEditorView = Backbone.View.extend({
    initialize : function(){

        this.setEvents();
    },
    setEvents : function(){
        // This code is generally not necessary, but it is here to demonstrate
        // how to customize specific editor instances on the fly. This fits well
        // this demo because we have editable elements (like headers) that
        // require less features.

        // The "instanceCreated" event is fired for every editor instance created.
        CKEDITOR.on( 'instanceCreated', function( event ) {
            var editor = event.editor,
                element = editor.element;

            // Customize editors for headers and tag list.
            // These editors don't need features like smileys, templates, iframes etc.
            if ( element.is( 'h1', 'h2', 'h3' ) || element.getAttribute( 'id' ) == 'taglist' ) {
                // Customize the editor configurations on "configLoaded" event,
                // which is fired after the configuration file loading and
                // execution. This makes it possible to change the
                // configurations before the editor initialization takes place.
                editor.on( 'configLoaded', function() {

                    // Remove unnecessary plugins to make the editor simpler.
                    editor.config.removePlugins = 'colorbutton,find,flash,font,' +
                        'forms,iframe,image,newpage,removeformat,' +
                        'smiley,specialchar,stylescombo,templates';

                    // Rearrange the layout of the toolbar.
                    editor.config.toolbarGroups = [
                        { name: 'editing',		groups: [ 'basicstyles', 'links' ] },
                        { name: 'undo' },
                        { name: 'clipboard',	groups: [ 'selection', 'clipboard' ] },
                        { name: 'about' }
                    ];
                });
            }
        });

        this.$el.on('blur', 'div', $.proxy(function(e){


            $(e.currentTarget)
                .removeAttr('contenteditable')
                .removeAttr('id');


            if($(e.currentTarget).html() === ''){

                $(e.currentTarget).remove();
            }

            this.editor.destroy();

            this.editor = null;
            this.$el.sortable("option", 'disabled', false);
        }, this));

        this.$el.on('click', '._remove', $.proxy(function(e){

            var target = $(e.currentTarget).parent();

            if(this.editor !== null){
                this.editor.destroy();
                this.editor = null;
            }

            $(e.currentTarget).parent().slideUp(300, $.proxy(function(){
                target.remove();

                this.$el.sortable("option", 'disabled', false);

            }, this));



            e.stopPropagation();
            return false;

        }, this));

        this.$el.on('mouseenter', 'div', $.proxy(function(e){

            if(this.editor !== null){ return false;}

            $(e.currentTarget).addClass('hover');

            $(e.currentTarget).find('._remove').remove();
            $(e.currentTarget).prepend('<span class="_remove remove_item"></span>');

        }, this));

        this.$el.on('mouseleave', 'div', $.proxy(function(e){
            $(e.currentTarget).removeClass('hover');

            $(e.currentTarget).find('._remove').remove();

        }, this));


        $('#_append_item').on('click', $.proxy(function(e){
            $('#__cke').find('._remove').remove();

            this.$el.append('<div id="__cke" style="outline:none;"></div>');

            this.editor = CKEDITOR.inline('__cke');

            $('#__cke')
                .css('height', '')
                .attr('contenteditable', 'true')
                .focus();


            this.targetElement = $('#__cke');

            this.$el.sortable("option", 'disabled', true);


        }, this));

        this.$el.on('click', 'div', $.proxy(function(e){

            if(
                $(e.currentTarget).attr('id') === '__cke' ||
                this.bSort === true
            ){
                return;
            }

            $(e.currentTarget).find('._remove').remove();


            $(e.currentTarget)
                .removeClass('hover')
                .attr('contenteditable', 'true')
                .attr('id', '__cke')
                .focus();

            this.editor = CKEDITOR.inline('__cke');

            this.targetElement = $(e.currentTarget);

            this.$el.sortable("option", 'disabled', true);
        }, this));

        this.$el.sortable({
            delay : 250,
            tolerance: 'pointer',
            revert: 250,
            start: $.proxy(function(e, ui ){
                this.bSort = true;
                ui.placeholder.height(ui.helper.height());
                ui.helper.addClass('grap');
            }, this),

            stop : $.proxy(function(e, ui){
                this.bSort = false;
                ui.item.removeClass('grap');
            }, this)
        }).disableSelection();
    }
});
