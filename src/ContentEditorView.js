var ContentEditorView = Backbone.View.extend({
    initialize : function(){

        this.setEvents();
    },
    resize : function(){
        setTimeout(function(){
            $('#_content_editor').css('height', '');
            var nHeight = $('#_content_editor').height();
            $('#_content_editor').css('height', nHeight + 'px');

        }, 50);
    },

    initCKEditor : function (){
// This code is generally not necessary, but it is here to demonstrate
        // how to customize specific editor instances on the fly. This fits well
        // this demo because we have editable elements (like headers) that
        // require less features.

        // The "instanceCreated" event is fired for every editor instance created.
        CKEDITOR.on('instanceCreated', function (event){
            var editor = event.editor,
                element = editor.element;

            // Customize editors for headers and tag list.
            // These editors don't need features like smileys, templates, iframes etc.
            // Customize the editor configurations on "configLoaded" event,
            // which is fired after the configuration file loading and
            // execution. This makes it possible to change the
            // configurations before the editor initialization takes place.
            editor.on('configLoaded', function (){

                // Remove unnecessary plugins to make the editor simpler.
                editor.config.removePlugins = 'colorbutton,find,flash,font,' +
                    'forms,iframe,image,newpage,removeformat,' +
                    'smiley,specialchar,stylescombo,templates';

                // Rearrange the layout of the toolbar.
                editor.config.toolbarGroups = [
                    { name : 'editing', groups : [ 'basicstyles', 'links' ] }
//                        { name: 'undo' },
//                        { name: 'clipboard',	groups: [ 'selection', 'clipboard' ] },
//                        { name: 'about' }
                ];
            });
        });
    }, setEvents : function(){

        var current;

        function SetToBold (e) {
            $(current).attr('contenteditable', 'true');
            document.execCommand('bold', false, true);

            $(current).contents().focus();
            return false;
        }

        function resize(){
            setTimeout(function(){
                $('#_content_editor').css('height', '');
                var nHeight = $('#_content_editor').height();
                $('#_content_editor').css('height', nHeight + 'px');

            }, 50);
        }


        $('#_bold').on('click', function(){
            SetToBold();
        });

        $(document).on('focus', "div[contenteditable=true]", function() {
            current = this;
        });

        $(document)// make sure br is always the lastChild of contenteditable
            .on("keydown keyup", 'div[contenteditable=true]', function(e){

                resize();
                if(e.which === 9) {
                    e.preventDefault();
                } else if(e.which === 27){

                    $(e.currentTarget).trigger('blur');
                    return;

                } else if (e.which == 13) {
                    if (window.getSelection) {
                        var selection = window.getSelection(),
                            range = selection.getRangeAt(0),
                            br = document.createElement("br");
                        range.deleteContents();
                        range.insertNode(br);
                        range.setStartAfter(br);
                        range.setEndAfter(br);
                        range.collapse(false);
                        selection.removeAllRanges();
                        selection.addRange(range);
                        return false;
                    }

                }


            });

        $('#_add_img').on('click', function(){
            $('#_content_editor').append(_.template($('#_img_tmpl').html(), {
                title : 'Meta Title',
                description : 'Description'

            }));

            resize();
        });

        $('#_add_movie').on('click', function(){
            $('#_content_editor').append(_.template($('#_movie_tmpl').html(), {
                title : 'Meta Title',
                description : 'Description'

            }));
            resize();
        });

        $('#_add_text').on('click', function(){

            $('#_append_item').trigger('click');
        });


        this.initCKEditor();

        this.$el.on('blur', 'div', $.proxy(function(e){

//            if($(e.currentTarget).attr('id') === '__cke'){
//                return;
//            }

            $(e.currentTarget)
                .removeAttr('contenteditable')
                .removeAttr('id');


            if($(e.currentTarget).html() === ''){
                $(e.currentTarget).remove();
            }

            if(this.editor){
                this.editor.destroy();
                this.editor = null;
            }

            this.$el.sortable("option", 'disabled', false);
        }, this));

        this.$el.on('click', '._remove', $.proxy(function(e){

            var target = $(e.currentTarget).parent();

            if(this.editor){
                this.editor.destroy();
                this.editor = null;
            }

            $(e.currentTarget).parent().slideUp(300, $.proxy(function(){
                target.remove();
                this.$el.sortable("option", 'disabled', false);

                this.resize();
            }, this));

            e.stopPropagation();
            return false;

        }, this));

        this.$el.on('mouseenter', 'div', $.proxy(function(e){
            $(e.currentTarget).addClass('hover');
            $(e.currentTarget).find('._remove').remove();
            $(e.currentTarget).prepend('<span class="_remove remove_item"></span>');

        }, this));

        this.$el.on('mouseleave', 'div', $.proxy(function(e){
            $(e.currentTarget).removeClass('hover');
            $(e.currentTarget).find('._remove').remove();
        }, this));


        $('#_append_item').on('click', $.proxy(function(e){

            this.$el.find('._text').removeAttr('id');

            $('#__cke').find('._remove').remove();

            this.$el.append('<div id="__cke" class="_text" style="clear:both;outline:none;"></div>');

            this.editor = CKEDITOR.inline('__cke');

            $('#__cke')
                .css('height', '')
                .attr('contenteditable', 'true')
                .focus();


            this.targetElement = $('#__cke');
            this.$el.sortable("option", 'disabled', true).enableSelection();



        }, this));

        this.$el.on('click', 'div', $.proxy(function(e){

            if(
                $(e.currentTarget).attr('id') === '__cke' ||
//                $(e.currentTarget).hasClass('_text') === false ||
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

//            this.editor = CKEDITOR.inline('__cke');

            this.targetElement = $(e.currentTarget);

            this.$el.sortable("option", 'disabled', true).enableSelection();
        }, this));



        this.$el.sortable({
            delay : 250,
            axis : 'y',
            tolerance: 'pointer',
            revert: 250,

//            containment: "parent",
            cursor: "move",
            start: $.proxy(function(e, ui ){

                this.bSort = true;
                ui.placeholder.height(ui.helper.height());
                ui.helper.addClass('grap');

                ui.placeholder.css("outline", "none");
                ui.placeholder.css("border-radius", "3px");
                ui.placeholder.css("border", "3px dashed #EEE");
                ui.placeholder.css("box-sizing", "border-box");
                ui.placeholder.css("visibility", "visible");
                ui.placeholder.css("background-color", "#FFF");
                ui.placeholder.css("box-shadow", "none");

            }, this),

            stop : $.proxy(function(e, ui){
                this.bSort = false;
                ui.item.removeClass('grap');
            }, this)
        }).disableSelection();


        $('#_save').on('click', $.proxy(function(){
            var aWelContents = this.$el.find('div');
            var aResult = [];

            _.each(aWelContents, function(el){
                var sContent = $(el).html();
                aResult.push(sContent);
            });

            alert(aResult.join('===============================================\n'));
        }, this));
    }
});
