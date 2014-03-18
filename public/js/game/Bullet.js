define([
    'classy',
    'game/GameObject'
],
    function(Class, GameObject) {
        var Bullet = GameObject.$extend({
            __init__: function(type, player) {
                switch(type) {
                    case "pistol":
                        this.speed = 5;
                        this.tex = "pistol-bullet";
                        break;
                    default:
                        this.speed = 0;
                        this.tex = "";
                }
                this.x = player.dispObj.x;
                this.y = player.dispObj.y;
                this.rotation = player.dispObj.rotation;
            },

            update: function(event, player) {
                this.x += this.speed * Math.cos( (Math.PI / 180) * this.rotation);
                this.y += this.speed * Math.sin( (Math.PI / 180) * this.rotation);
            }
        });

        return Bullet;
    });
