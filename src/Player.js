/**
 * Created by Seb on 25/01/14.
 */

var Player = new Class({
    initialize: function (color,game) {
        this.mouseX = 0;
        this.mouseY = 0;
        this.sprite = null;
        this.type = color;
        this.speed = 100;
        this.firstDown = false;
        this.life = 3;
        this.currentZone = 0;
        this.spaceDown = false;
        this.lock = false;

        // sonar options
        this.nbPoints = 150;
        this.nbMaxoints = 400;
        this.sonarPts = game.add.group();
        this.sonarPts.createMultiple(this.nbMaxoints,'w_'+color.name);
        this.sonarSpeed = this.type.power.speed;
        this.sonarPeriod = this.type.power.period;
    },
    setSprite: function (sprite){
        this.sprite = sprite;
        this.sprite.body.bounce = new Phaser.Point(1,1);
    },
    parseColor: function (game, color) {
        this.type = color;
        // this.sonarPts.removeAll();
        // this.sonarPts.createMultiple(this.nbMaxoints,'w_'+this.type.name);
        var _ = this;
        this.sonarPts.forEach(function(pt){
            pt.loadTexture('w_'+_.type.name);
        });
        this.sonarSpeed = this.type.power.speed;
        this.sonarPeriod = this.type.power.period;
        // var x = this.sprite.x;
        // var y = this.sprite.y;
        // this.sprite.destroy();
        this.sprite.loadTexture('w_'+this.type.name);
        // this.setSprite(game.add.sprite(this.sprite.x,this.sprite.y,'w_'+this.type.name));
        this.sprite.scale = new Phaser.Point(2*this.life,2*this.life);
    },
    setType: function(game) {
        switch(this.type){
            case COLORS.RED:
                this.parseColor(game, COLORS.BLUE); 
            break;
            case COLORS.BLUE:
                this.parseColor(game, COLORS.GREEN);
                if(this.maxColor==2)
                    this.parseColor(game, COLORS.RED);
                break;
            case COLORS.GREEN:
                this.parseColor(game, COLORS.YELLOW);
                if(this.maxColor==3)
                    this.parseColor(game, COLORS.RED);
            break; 
            case COLORS.YELLOW:
                this.parseColor(game, COLORS.PURPLE);
                if(this.maxColor==4)
                    this.parseColor(game, COLORS.RED);
            break; 
            case COLORS.PURPLE:
                this.parseColor(game, COLORS.RED); 
            break;
        }
    },
    moveK: function (inputs, game) {
        if(!this.lock){
            if (inputs.isDown(Phaser.Keyboard.LEFT))
                this.sprite.body.velocity.x = -this.speed;
            else
                this.sprite.body.velocity.x = this.sprite.body.velocity.x*0.90;

            if (inputs.isDown(Phaser.Keyboard.RIGHT))
                this.sprite.body.velocity.x = this.speed;
            else
                this.sprite.body.velocity.x = this.sprite.body.velocity.x*0.90;

            if (inputs.isDown(Phaser.Keyboard.UP))
                this.sprite.body.velocity.y = -this.speed;
            else
                this.sprite.body.velocity.y = this.sprite.body.velocity.y*0.90;

            if (inputs.isDown(Phaser.Keyboard.DOWN))
                this.sprite.body.velocity.y = this.speed;
            else
                this.sprite.body.velocity.y = this.sprite.body.velocity.y*0.90;

            if(inputs.isDown(Phaser.Keyboard.SPACEBAR) && !this.spaceDown){
                this.spaceDown = true;
                this.setType(game);
            }

            if(!inputs.isDown(Phaser.Keyboard.SPACEBAR)){
                this.spaceDown = false;
            }
        }
    },
    moveM: function (inputs, mouse, game) {
        if(!this.lock){
            if(inputs.isDown && mouse.button == 1){
                if(!this.firstDown){
                    this.mouseY = inputs.y;
                    this.mouseX = inputs.x;
                    this.firstDown = true;
                }
                // Right
                this.sprite.body.velocity.x-=1.25*(this.mouseX-inputs.x);
                this.sprite.body.velocity.y-=1.25*(this.mouseY-inputs.y);

                this.mouseY = inputs.y;
                this.mouseX = inputs.x;
            }
            else{
                this.firstDown = false;
                this.sprite.body.velocity.x = this.sprite.body.velocity.x*0.90;
                this.sprite.body.velocity.y = this.sprite.body.velocity.y*0.90;
            }

            if(inputs.isDown && mouse.button == 3 && !this.spaceDown){
                this.spaceDown = true;
                this.setType(game);
            }

            if(!(inputs.isDown && mouse.button == 3)){
                this.spaceDown = false;
            }
        }
    },
    sonar: function(game){
        // if(!game.focus){
            if(this.sonarPts.countDead() <= this.nbPoints){ 
                // console.log("too less deadPoints !",this.sonarPts.countDead() );
            }
            else{
                for(var i = 0; i < this.nbPoints ; i ++){
                    var destPt = new Phaser.Point(this.sprite.body.center.x, this.sprite.body.center.y)
                    Phaser.Point.rotate(destPt, this.sprite.body.center.x, this.sprite.body.center.y,360/this.nbPoints * i, true, 100);

                    var pt = this.sonarPts.getFirstDead();
                    // var pt = this.sonarPts.getRandom();
                    pt.reset(this.sprite.body.center.x, this.sprite.body.center.y);
                    pt.scale = new Phaser.Point(1,1);
                    pt.lifespan = 1550 + Math.random()*300;
                    game.physics.moveToXY(pt, destPt.x, destPt.y, this.sonarSpeed + Math.random()*2 );//+ Math.cos(game.physics.angleBetween(this.sprite,pt))*this.sprite.body.velocity.x);
                }
                game.soundRadar();
            }
        // }

        var _= this;
        setTimeout(function(){
            _.sonar(game);
        }, this.sonarSpeed + Math.random()*10);
    },
    sonarCollision: function(pt,game){
        pt.body.velocity = new Phaser.Point(0,0); //  we stop the point
        pt.kill();
        pt.lifespan = 1;//pt.lifespan*2 + Math.random()*100; // add a little delay
        var d = game.add.sprite(pt.x,pt.y,'w_'+this.type.name);
        d.scale = new Phaser.Point(2,2); 
        d.lifespan = 1000;
    },
    loseLife: function (){
        this.life -= 1;
        if(this.life === 0){
            this.sprite.x = 0;
            this.sprite.y = 0;
            this.sprite.body.velocity.x = 0;
            this.sprite.body.velocity.y = 0;
            this.life = 3;
        }
        this.sprite.scale = new Phaser.Point(2*this.life,2*this.life);
    },
    applyForce: function (force,x,y,game) {
        game.physics.accelerateToXY(this.sprite, x, y, -force);
        ;
    },
    getPush: function(player, value_x, value_y){
        this.sprite.body.velocity.x = value_x;
        this.sprite.body.velocity.y = value_y;
    },
     meteorShower: function(game, player, delay, radius){
        var meteorArray = new Array();
        for (var i = 0; i < number; i++) {
            var spriteMeteor = game.add.sprite(300, 200, 'meteor');
            spriteMeteor.animations.add('walk');
            spriteMeteor.animations.play('walk', 16, true);
            spriteMeteor.lifespan = delay;
            meteorArray.push(spriteMeteor);
        }

        for (var i = 0; i < meteorArray.length; i++) {
            if(meteorArray[i].lifespan <= 0)
                meteorArray.remove(i);
        }
    },
    linePush: function(game, delay, radius){
            var y = Math.random()*3000;
            y = y-3000;
            var degree = Math.random()*360;
            



            var spriteLine = game.add.sprite(-3000, y, 'greenline');
            spriteLine.scale.setTo(300000, 1);
            spriteLine.animations.add('spray');
            spriteLine.animations.play('spray', 20, true);
            spriteLine.angle = degree;
            spriteLine.lifespan = delay;
            
            if(((this.sprite.y+1 > spriteLine.y)) && (this.sprite.y < spriteLine.y+64))
            {
                 console.log("LOOOSE");
                this.loseLife();
            }
            
    },
    farAway: function(game){        
        var randRencontre = Math.random()*1000;
        if(this.currentZone == 1){
            //Lvl 1 event
            if(randRencontre > 950){
                //Push in an another direction
                console.log("Push Line go !!!");
                this.linePush(game, 1500, 100);
            }
            else if(this.currentZone == 1){
                if(randRencontre > 950){
                    //Pop wave going through the screen
                    console.log("Push Line lvl 2 go !!!");
                    this.linePush(game, this, 1000, 200);
                }
            }
            else if(this.currentZone == 2){
                //Lvl 3 Event
                if(randRencontre <= 750){
                    //DO nothing
                }
                else if(randRencontre > 990){
                    //Meteor shower with one and a delay of 2.5s
                    console.log("Meteor Shower !! Save your life !!!");
                    this.meteorShower(game, this, 1500, 100, 1);
                }
                else if(randRencontre > 995){
                    //Meteor shower with two and a delay of 1s
                    console.log("Meteor Shower lvl2 !! Run fools !!!");
                    this.meteorShower(game, this, 800, 100, 2);
                }
            }

        }
    },
    updateSector: function(map, game){
        var distance = game.physics.distanceToXY(this.sprite, 0,0);
        if(distance < map.getSectors()[0].getRadius()){
            map.getSectors()[0].executeEvent(this);
            /*if(Math.random()*10<=1){
                //Push in an another direction
                console.log("Push Line go !!!");
                this.linePush(game, 1500, 100);
            }*/
        }
        else if(distance < map.getSectors()[1].getRadius()){
            map.getSectors()[1].executeEvent(this);
            /*if(Math.random()*10<=1){
                //Push in an another direction
                console.log("Push Line go !!!");
                this.linePush(game, 100, 200);
            }*/
        }
        else if(distance < map.getSectors()[2].getRadius()){
            map.getSectors()[2].executeEvent(this);
            var random = Math.random()*100;
            /*if(random<=5){
                //Meteor shower with one and a delay of 2.5s
                console.log("Meteor Shower !! Save your life !!!");
                this.meteorShower(game, this, 800, 100, 2);
            }
            else if(random<=10){
                //Meteor shower with two and a delay of 1s
                console.log("Meteor Shower lvl2 !! Run fools !!!");
                this.meteorShower(game, this, 1500, 100, 1);
            }*/
        }else if(distance < map.getSectors()[3].getRadius()){
            map.getSectors()[3].executeEvent(this);
            var random = Math.random()*100;
            /*if(random<=5){
                //Meteor shower with one and a delay of 2.5s
                console.log("Meteor Shower !! Save your life !!!");
                this.meteorShower(game, this, 800, 100, 2);
            }
            else if(random<=10){
                //Meteor shower with two and a delay of 1s
                console.log("Meteor Shower lvl2 !! Run fools !!!");
                this.meteorShower(game, this, 1500, 100, 1);
            }*/
        }
        else{
            console.log("End");
        }
    }
});


function distanceTo( aX, aY, bX, bY){
    return Math.sqrt(Math.pow(aX-bX,2)+Math.pow(aY-bY,2));
}