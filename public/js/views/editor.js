define([
    'backbone',
    'tmpl/editor',
    'game/Game',
    'utils/Message'
], 
function(Backbone, tmpl, Game, Message) {
    var EditorView = Backbone.View.extend({

        template: tmpl,
        tagName: 'section',
        className: 'page',
        pageId: '#editorPage',
        hidden: true,

        $backButton: null,
        
        canvas: null,
        scene: null,
        sidebar: null,
        game: null,

        messenger: null,

        initialize: function () {
            this.render();
        },

        render: function () {
            this.$el.html(this.template());
            this.$el.attr('id', this.pageId.slice(1));

            this.$backButton = this.$el.find('.back-button');

            this.canvas = this.$el.find('#editor-field')[0];
            this.scene = this.$el.find('#editor-scene');
            this.sidebar = this.$el.find('#editor-sidebar');

            this.messenger = new Message(this.$el);

            this.createEvents();
            this.calcDimensions();

            return this;
        },

        createEvents: function() {
            var self = this;

            this.$backButton.on('click', function(event) {
                var controls = [
                    {
                        name: "Yes",
                        action: function(event) {
                            window.location = self.$backButton.attr('href');
                        }
                    },
                    {
                        name: "No",
                        action: function(event) {
                            self.messenger.hideMessage();
                        }
                    }
                ];
                self.messenger.showMessage("Do you really want to close this page?", true, null, controls);
                return false;
            });
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
                this.messenger.hideMessage();
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

                if (this.game)
                    this.game.resize();
            });
            $(window).resize();
        }
    });

    return new EditorView();
});