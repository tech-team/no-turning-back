define([
    'backbone',
    'tmpl/editor',
    'game/Game',
    'views/viewmanager'
], 
function(Backbone, tmpl, Game) {
    var EditorView = Backbone.View.extend({

        template: tmpl,
        tagName: 'section',
        className: 'page',
        pageId: '#editorPage',
        hidden: true,
        
        canvas: null,
        scene: null,
        sidebar: null,
        game: null,

        initialize: function () {
            this.render();
        },

        render: function () {
            this.$el.html(this.template());
            this.$el.attr('id', this.pageId.slice(1));

            this.canvas = this.$el.find('#editor-field')[0];
            this.scene = this.$el.find('#editor-scene');
            this.sidebar = this.$el.find('#editor-sidebar');
            this.calcDimensions();

            return this;
        },

        show: function () {
            this.$el.show();
            this.hidden = false;
            $.event.trigger({
                type: "showPageEvent",
                pageId: this.pageId
            });
            this.runGame();
        },

        hide: function () {
            if (!this.hidden) {
                this.$el.hide();
                this.hidden = true;
            }
        },

        runGame: function() {
            var self = this;
            this.game = new Game(this.canvas, true,
                function() {
                    self.game.run();
                }
            );
        },

        calcDimensions: function() {
            if (this.scene === null) {
                console.error("#scene is null");
                return;
            }

            var self = this;
            $(window).resize(function() {
                var width = $(this).width() * 0.8;
                var height = $(this).height() - 5;

                var cssSizes = {
                    'width': width + "px",
                    'height' : height + "px"
                };

                self.canvas.width = width;
                self.canvas.height = height;
                self.scene.css(cssSizes);
                self.sidebar.height(height);

                var level = $('.editor-sidebar__level');
                var object = $('.editor-sidebar__object');
                var palette = $('.editor-sidebar__palette');
                object.height(
                    self.sidebar.height()
                    - level.height()
                    - palette.height()
                    - 18); //todo: everybody like magic
            });
            $(window).resize();
        }
    });

    return new EditorView();
});