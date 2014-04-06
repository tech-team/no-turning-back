define([
    'backbone',
    'tmpl/gamefinished',
    'collections/scores',
    'models/player',
    'views/scoreboard'
], 
function(Backbone, tmpl, Scoreboard, Player, ScoreboardView) {

    var GameFinishedView = Backbone.View.extend({
        template: tmpl,
        el: '#pages',
        tagName: 'section',
        className: 'page',
        pageId: '#gameFinishedPage',
        hidden: true,

        senderForm: null,
        userField: null,
        scoreField: null,
        sendSubmit: null,
        loader: null,
        errorField: null,

        initialize: function () {
            var self = this;
            $(document).on("scoreSending", function(event) {
                self.sendingForm();
            });

            $(document).on("scoreSent", function(event) {
                self.okForm(event);
            });

            $(document).on("scoreSendFailed", function(event) {
                self.failForm(event);
            });
        },

        render: function (scoreValue) {
            scoreValue = scoreValue ? scoreValue : 0;

            this.$el.html(this.template({score: scoreValue}));
            this.$el.attr('id', this.pageId.slice(1));

            this.senderForm = this.$el.find('#scoreForm');
            this.userField = this.$el.find('input#user');
            this.scoreField = this.$el.find('input#score');
            this.sendSubmit = this.$el.find('input#sendSubmit');
            this.loader = this.$el.find('.score-content__loading-indicator');
            this.errorField = this.$el.find('.error_message');
            
            return this;
        },

        show: function (scoreValue) {
            this.render(scoreValue);
            this.calcDimensions();
            this.$el.show();
            this.hidden = false;

            var self = this;
            senderForm.submit(function(event) {
                event.preventDefault();

                var data = {};
                $.each(senderForm.serializeArray(), function (i, input) {
                    data[input.name] = input.value;
                });
                Scoreboard.sendScore(data, {
                    before: function() {
                        console.log("form is sending");
                        self.blockForm();
                    },
                    success: function(event) {
                        console.log("form is sent successfully");
                        self.unblockForm();
                        self.hide();

                        ScoreboardView.show();
                    },
                    fail: function(event) {
                        console.log("failed to send");
                        self.unblockForm();

                        self.errorField.text(event.message);
                        self.errorField.show();   
                    }
                });
                
            });
        },

        hide: function () {
            if (!this.hidden) {
                this.$el.hide();
                this.remove();
                this.hidden = true;
            }
        },

        blockForm: function() {
            this.userField.prop('disabled', true);
            this.sendSubmit.prop('disabled', true);
            this.loader.show();
        },

        unblockForm: function() {
            this.userField.prop('disabled', false);
            this.sendSubmit.prop('disabled', false);
            this.loader.hide();
        },

        calcDimensions: function() {
            var $dimmer = this.$el.find('.score-sender-dimmer');

            var $sender = this.$el.find('.score-content-wrapper');
            var senderWidth = $sender.width();
            var senderHeight = $sender.height();

            var self = this;
            $(window).resize(function() {
                var windowWidth = $(this).width();
                var windowHeight = $(this).height();

                $dimmer.css({
                    'height': windowHeight + 'px'
                });

                var marginLeft = (windowWidth - senderWidth) / 2;
                var marginTop = (windowHeight - senderHeight) / 2 - 30;
                $sender.css({
                    'margin-left': marginLeft + 'px',
                    'margin-top': marginTop + 'px'
                });
            });
            $(window).resize();

        }

    });

    return new GameFinishedView();
});