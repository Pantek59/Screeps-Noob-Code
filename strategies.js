module.exports = {
    init (friendlyCreeps, enemyCreeps) {
        this.friendlyCreeps = friendlyCreeps;
        this.enemyCreeps = enemyCreeps;
    },

    remoteDrain (flag) {
        // flag.memory.targetRoom = [Name of room to be drained]
        // Position flag where units should rally before entering room to be drained
        if (flag.memory.targetRoom == undefined || Game.rooms[flag.memory.targetRoom] == undefined) {
            console.log(flag.name + " in room " + flag.pos.roomName + " has no target room defined!");
        }
        let targetRoom = Game.rooms[flag.memory.targetRoom];
        if (targetRoom != undefined) {
            let towers = Game.rooms[flag.memory.targetRoom].find(FIND_HOSTILE_STRUCTURES, {filter: (t) => t.structureType == STRUCTURE_TOWER && t.store[RESOURCE_ENERGY] > 0});
            if (towers.length == 0) {
                // No loaded towers in target room found
                return false;
            }
        }

        // Target room has loaded towers ==> drain
        let orderModule = require('orders');
        let flagRoom = Game.rooms[flag.pos.roomName];
        let myCreeps = _.filter(Game.creeps, {memory: {currentFlag: flag.name}});
        let targetRoomCreeps = [];
        let rallyRoomCreeps = [];
        let enrouteCreeps = [];

        // Split creeps per room
        for (let c in myCreeps) {
            switch (myCreeps[c].room) {
                case targetRoom.name:
                    targetRoomCreeps.push(c);
                    break;
                case flag.pos.roomName:
                    rallyRoomCreeps.push(c);
                    break;
                default:
                    enrouteCreeps.push(c);
                    break;
            }
        }

        // Determine orders: Rally Room
        let meleeTarget, healerTarget, rangedTarget;
        let meleeFormation = [];
        let healerFormation = [];
        let rangedFormation = [];
        let woundedFormation = [];

        // Determine melee & ranged target
        if (targetRoom.memory.hostiles.length > 0) {
            // Enemy creeps in rally room
            if (flagRoom.memory.hostiles.length == 1) {
                // Set attacker target to only enemy in room
                meleeTarget = Game.getObjectById(flagRoom.memory.hostiles[0]);
                rangedTarget = Game.getObjectById(flagRoom.memory.hostiles[0]);
            }
            else {
                // TODO: Identify priority melee target
                // TODO: Identify priority ranged target
            }
        }
        else {
            // No enemies in rally room
            meleeTarget = false;
            rangedTarget = false;

            // Get target formation for wounded creeps
            let direction;
            switch (flag.room.findExitTo(targetRoom.name)) {
                case FIND_EXIT_LEFT:
                    direction = LEFT;
                    break;
                case FIND_EXIT_RIGHT:
                    direction = RIGHT;
                    break;
                case FIND_EXIT_TOP:
                    direction = TOP;
                    break;
                case FIND_EXIT_BOTTOM:
                    direction = BOTTOM;
                    break;
            }
            let maxAttackers = flag.memory.attacker + flag.memory.einarr + flag.memory.archer;
            woundedFormation = orderModule.getFormationPositions("reverseArrow", flag.pos, direction, maxAttackers);
        }

        // Determine healer target
        let myPatients = _.filter(myCreeps, function (c) {return c.hits != c.hitsMax});
        if (myPatients.length > 0) {
            //TODO: Identify priority healer area
        }
        else {
            // Nothing to heal
            if (flagRoom.memory.hostiles.length > 0) {
                //TODO: Enemies in room --> Stand behind attackers!

            }
            else {
                // TODO: No enemies in room --> Calculate target formation for healers
                healerTarget = false;
            }


            // TODO: Determine orders: Target Room


            // TODO: Execute orders in target room
            for (let nr in targetRoomCreeps) {
                let creep = myCreeps[targetRoomCreeps[nr]];
                switch (creep.memory.role) {
                    case "attacker":
                    case "einarr":
                        break;
                    case "archer":
                        break;
                    case "healer":
                        break;
                }
                // TODO: Execute orders in rally room
                for (let nr in rallyRoomCreeps) {
                    let creep = myCreeps[rallyRoomCreeps[nr]];

                }
                // Execute orders enroute
                for (let nr in enrouteCreeps) {
                    let creep = myCreeps[enrouteCreeps[nr]];
                    creep.gotoFlag(flag);
                }


                /** OLD CODE **/
                switch (creep.memory.role) {
                    case "attacker":
                    case "einarr":
                    case "archer":
                        if (creep.room.name == targetRoom.name) {
                            if (creep.hits < creep.hitsMax * 0.6) {
                                // Creep damaged enough to withdraw
                                creep.moveTo(flag, {reusePath: moveReusePath(true)});
                            }
                            else {
                                if (creep.pos.x == 0 || creep.pos.x == 49 || creep.pos.y == 0 || creep.pos.y == 49) {
                                    // Creep sits on the edge of the room
                                    let orientationPoints = creep.room.find(STRUCTURE_RAMPART);
                                    creep.moveTo(creep.pos.findClosestByPath(orientationPoints));
                                }
                            }
                        }
                        else if (creep.room.name == flag.pos.roomName) {
                            // Attacker is in rally room
                            if (creep.hits < creep.hitsMax) {
                                let myHealer = this.getNearestRole(creep, "healer");
                                if (myHealer != null) {
                                    creep.moveTo(myHealer, {reusePath: moveReusePath(true)});
                                }
                                else {
                                    creep.flee(this.enemyCreeps, 5);
                                }
                            }
                            else if (this.enemyCreeps.length > 0) {
                                // Enemies in rally room --> attack
                                let nextEnemy = creep.pos.findClosestByPath(this.enemyCreeps);
                                this.attackTarget(creep, nextEnemy);
                            }
                            else if (creep.pos.getRangeTo(flag) > 3) {
                                // Too far from flag --> move closer
                                creep.moveTo(flag, {reusePath: moveReusePath()});
                            }
                            else {
                                let roomHealers = _.filter(this.friendlyCreeps, {filter: (c) => c.memory.role == "healer" && c.memory.homeroom == creep.memory.homeroom});
                                if (roomHealers.length > 0) {
                                    // Healers in room present --> go for it!
                                    // Find direction to target room
                                    let directionToTargetRoom;
                                    if (flag.pos.x >= 45) {
                                        directionToTargetRoom = FIND_EXIT_RIGHT;
                                    }
                                    else if (flag.pos.x <= 5) {
                                        directionToTargetRoom = FIND_EXIT_LEFT;
                                    }
                                    else if (flag.pos.y <= 5) {
                                        directionToTargetRoom = FIND_EXIT_TOP;
                                    }
                                    else if (flag.pos.y >= 45) {
                                        directionToTargetRoom = FIND_EXIT_BOTTOM;
                                    }
                                    //Move to target room
                                    let exitToTarget = flag.pos.findClosestByRange(directionToTargetRoom);
                                    creep.moveTo(exitToTarget, {reusePath: moveReusePath()});
                                }
                                else {
                                    // No healers present --> wait for them to appear
                                    creep.memory.sleep = 10;
                                }
                            }
                        }
                        else {
                            // Attacker is en route to rally room
                            creep.gotoFlag(flag);
                        }
                        break;
                    case "healer":
                        //TODO: Healer
                        break;
                }
            }
        }
    },

    test (flag) {
        let orderModule = require('orders');
        let myCreeps = _.filter(Game.creeps, {memory: {currentFlag: flag.name}});
        if (myCreeps.length > 0) {
            let formation = orderModule.getFormationPositions("reverseArrow", flag.pos, RIGHT, myCreeps.length);
            orderModule.moveToFormation(myCreeps, formation);
        }
    }
};