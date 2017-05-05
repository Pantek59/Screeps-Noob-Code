Creep.prototype.roleUnit = function() {
    let myFlag;
    let myGroup;
    if (this.memory.currentFlag == undefined) {
        // Creep has no current flag --> get one!
        myGroup = this.findMyFlag("unitGroup");
        myFlag = Game.flags[myGroup];
    }
    else {
        // Creep has current flag --> check!

        if (Game.flags[this.memory.currentFlag] != undefined) {
            //myFlag = this.memory.currentFlag;
            return;
        }
        else {
            myGroup = this.findMyFlag("unitGroup");
            myFlag = Game.flags[myGroup];
        }
    }

    if (myFlag == undefined) {
        //No flag found for creep --> go home
        if (this.goToHomeRoom() == true) {
            let range = this.pos.getRangeTo(this.room.controller);
            if (range > 1) {
                this.moveTo(this.room.controller, {reusePath: moveReusePath()});
            }
        }
        this.memory.currentFlag = undefined;
    }
    else {
        this.memory.currentFlag = myFlag.name;
    }
};