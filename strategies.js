module.exports = {
    // a function to run the logic for this role
    destroy: function (creep, target) {
        switch (creep.memory.role) {
            case "attacker":
            case "einarr":
            case "archer":
                if (creep.memory.role == "einarr" && creep.hits < creep.hitsMax) {
                    creep.heal(creep);
                }

                let target;

                let targets = flag.pos.findInRange(hostileCreeps, 3);
                if (targets.length > 0) {
                    //Hostile creeps within flag range -> attack
                    if (creep.memory.role == "archer") {
                        target = flag.pos.findClosestByRange(targets);
                    }
                    else {
                        target = flag.pos.findClosestByPath(targets);
                    }
                    if (target != null && creep.attack(target) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target, {reusePath: moveReusePath()});
                    }
                    else {
                        target = undefined;
                    }
                }

                if (target == undefined || target == null) {
                    //No hostile creeps around or not path to them found -> attack structure
                    targets = flag.pos.lookFor(LOOK_STRUCTURES);
                    if (targets.length > 0) {
                        // Structure found
                        for (let t in targets) {
                            if (targets[t].structureType != STRUCTURE_CONTROLLER && targets[t].structureType != STRUCTURE_ROAD) {
                                target = targets[t];
                            }
                            break;
                        }

                        if (target != undefined) {
                            if (creep.attack(target) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(target, {reusePath: moveReusePath()});
                            }
                        }
                    }
                    else {
                        //No structure to attack found
                        return false;
                    }

                }
                break;

            case "healer":
                if (creep.hits < creep.hitsMax) {
                    creep.heal(creep);
                }

                var danger = creep.pos.findInRange(hostileCreeps, 1);
                if (danger.length > 0) {
                    creep.flee(danger, 3)
                }
                else {
                    // No hostile creeps around
                    var patients = flag.pos.findInRange(friendlyCreeps, 5);
                    if (patients.length > 0) {
                        //Damaged creeps near flag found
                        let patient = creep.pos.findClosestByPath(patients, {filter: (s) => s.hits < s.hitsMax});
                        if (patient != null && creep.heal(patient) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(patient, {reusePath: moveReusePath()});
                        }
                        else {
                            //No path to patient found
                            if (creep.pos.getRangeTo(flag) > 3) {
                                creep.moveTo(flag, {reusePath: moveReusePath()});
                            }
                        }
                    }
                    else {
                        //No damaged creeps around
                        if (creep.pos.getRangeTo(flag) > 3) {
                            creep.moveTo(flag, {reusePath: moveReusePath()});
                        }
                    }
                }
                break;
        }
        return true;
    },

    run: function(creep, flag) {
        let strategy = flag.memory.strategy;
        let bunkerDown = false;
        let hostileCreeps = creep.room.find(FIND_CREEPS, {filter: function (creep) {return isHostile(creep)}});
        let friendlyCreeps = creep.room.find(FIND_CREEPS, {filter: function (creep) {return !isHostile(creep)}});

        switch (strategy) {
            case "remoteDrain":
                switch (creep.memory.role) {
                    case "attacker":
                    case "einarr":
                        if (creep.memory.role == "einarr" && creep.hits < creep.hitsMax * 0.5) {
                            //Self-heal
                            creep.heal(creep);
                        }

                        if (creep.room.name == flag.pos.roomName) {
                            //Attacker outside target room
                            if (hostileCreeps.length > 0) {
                                //Enemies present -> attack
                                let target = creep.pos.findClosestByPath(hostileCreeps);
                                if (creep.pos.isNearTo(target)){
                                    creep.attack(target);
                                    //creep.rangedHeal(creep);
                                }
                                else {
                                    creep.moveTo(target, {reusePath: moveReusePath(true)});
                                    if (creep.memory.role == "einarr") {
                                        creep.heal(creep);
                                    }
                                }
                            }
                            else{
                                if (creep.hitsMax == creep.hits) {
                                    //No enemies around and attacker ready
                                    //Find direction to target room
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
                                    creep.moveTo(exitToTarget, {reusePath: moveReusePath(true)});
                                }
                                else  {
                                    // Attacker outside room and wounded -> Go to flag and wait
                                    if (creep.pos.getRangeTo(flag) < 2) {
                                        let healer = creep.pos.findClosestByPath(FIND_MY_CREEPS, {filter: (c) => c.memory.role == "healer"});
                                        creep.moveTo(healer, {reusePath: moveReusePath(true)});
                                    }
                                    else {
                                        creep.moveTo(flag, {reusePath: moveReusePath(true)});
                                    }
                                }
                                if (creep.memory.role == "einarr") {
                                    creep.heal(creep);
                                }
                            }
                        }
                        else {
                            // Attacker in target room
                            if (creep.hits < creep.hitsMax * 0.8) {
                                //Attacker damaged enough to withdraw
                                creep.moveTo(flag, {reusePath: moveReusePath(true)});
                                if (creep.memory.role == "einarr") {
                                    creep.heal(creep);
                                }
                            }
                            else {
                                if (creep.pos.x == 0 || creep.pos.x == 49 || creep.pos.y == 0 || creep.pos.y == 49) {
                                    //Move away from exit
                                    //creep.moveTo(creep.pos.findClosestByPath(FIND_STRUCTURES));
                                    let target = creep.pos.findClosestByPath(hostileCreeps);
                                    if (target != null) {
                                        if (creep.pos.isNearTo(target)) {
                                            creep.attack(target);
                                            //creep.rangedHeal(creep);
                                        }
                                        else {
                                            creep.moveTo(target, {reusePath: moveReusePath(true)});
                                            if (creep.hits < creep.hitsMax) {
                                                if (creep.memory.role == "einarr") {
                                                    creep.heal(creep);
                                                }
                                            }
                                        }
                                    }
                                    else {
                                        creep.moveTo(creep.pos.findClosestByPath(FIND_STRUCTURES), {reusePath: moveReusePath(true)});
                                    }
                                }
                                else if (creep.hits < creep.hitsMax && creep.memory.role == "einarr"){
                                    creep.heal(creep);
                                }
                                else if (flag.memory.drainTarget != undefined) {
                                    //drainTarget auf Flagge gesetzt
                                    let target = Game.getObjectById(flag.memory.drainTarget);

                                    if (target == null) {
                                        delete flag.memory.drainTarget;
                                    }
                                    else {
                                        // Check for possible attack towards drainTarget
                                        let towers = [];
                                        if (creep.memory.enemyTowerBuffer == undefined || Game.time % 83 == 0) {
                                            towers = creep.room.find(FIND_HOSTILE_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_TOWER});
                                            let towerIDs = [];
                                            if (towers.length == 0) {
                                                for (let t in towers) {
                                                    towerIDs.push(towers[t].id);
                                                }
                                                creep.memory.enemyTowerBuffer = towerIDs;
                                            }
                                        }
                                        else {
                                            for (let t in creep.memory.enemyTowerBuffer) {
                                                towers.push(Game.getObjectById(creep.memory.enemyTowerBuffer[t]));
                                            }
                                        }

                                        let activeTowers = _.filter(towers, function (t) {return (t.energy >= 10)});

                                        if (activeTowers.length == 0) {
                                            if (creep.attack(target) == ERR_NOT_IN_RANGE) {
                                                creep.moveTo(target, {reusePath: moveReusePath(true)});
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        break;

                    case "healer":
                        if (creep.hits < creep.hitsMax * 0.6) {
                            //Self-heal
                            creep.heal(creep);
                        }
                        if (flag.pos.roomName != creep.room.name) {
                            creep.moveTo(flag, {reusePath: moveReusePath(true)});
                        }
                        else {
                            // Healer is in flag room
                            if (friendlyCreeps.length > 0) {
                                //Look for nearest creep to flag needing help
                                let patient = flag.pos.findClosestByPath(FIND_MY_CREEPS, {filter: function (creep) {return creep.hits < creep.hitsMax}});
                                if (patient != null) {
                                    //Wounded creep found
                                    if (creep.pos.isNearTo(patient)){
                                        creep.heal(patient);
                                    }
                                    else if (creep.pos.inRangeTo(patient,3)){
                                        creep.rangedHeal(patient);
                                        if (creep.pos.getRangeTo(flag) < 1) {
                                            creep.moveTo(patient, {reusePath: moveReusePath(true)});
                                        }
                                    }
                                    else {
                                        if (creep.pos.getRangeTo(flag) > 1) {
                                            creep.moveTo(patient, {reusePath: moveReusePath(true)});
                                        }

                                        if (creep.hits < creep.hitsMax) {
                                            creep.heal(creep);
                                        }
                                    }
                                }
                                else {
                                    // Go to flag and wait
                                    if (creep.pos.getRangeTo(flag) > 1) {
                                        creep.moveTo(flag, {reusePath: moveReusePath(true)});
                                    }
                                    if (creep.hits < creep.hitsMax) {
                                        creep.heal(creep);
                                    }
                                }
                            }
                            else if (creep.hits < creep.hitsMax) {
                                creep.heal(creep);
                            }
                        }
                        break;
                }
                break;

            case "remoteDestroy": //To be tested
                switch (creep.memory.role) {
                    case "attacker":
                    case "einarr":
                    case "archer":
                        if (creep.memory.role == "einarr" && creep.hits < creep.hitsMax) {
                            //Self-heal
                            creep.heal(creep);
                        }

                        if (creep.room.name == flag.pos.roomName) {
                            //Attacker outside target room
                            if (hostileCreeps.length > 0) {
                                //Enemies present -> attack
                                let target = creep.pos.findClosestByPath(hostileCreeps);

                                if (creep.memory.role == "archer") {
                                    //Creep with ranged attack
                                    if (creep.rangedAttack(target) == ERR_NOT_IN_RANGE) {
                                        creep.moveTo(target, {reusePath: moveReusePath(true)});
                                    }
                                }
                                else {
                                    // Creep without ranged attack
                                    if (creep.attack(target) == ERR_NOT_IN_RANGE) {
                                        creep.moveTo(target, {reusePath: moveReusePath(true)});
                                    }
                                }
                            }
                            else if (creep.hitsMax == creep.hits) {
                                //No enemies around and attacker ready
                                //Find direction to target room
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
                                creep.memory.directionToTargetRoom = directionToTargetRoom;
                                let exitToTarget = flag.pos.findClosestByRange(directionToTargetRoom);
                                creep.moveTo(exitToTarget, {reusePath: moveReusePath(true)});
                            }
                            else if (creep.pos.getRangeTo(flag) > 1) {
                                // Attacker outside room and wounded -> Go to flag and wait
                                creep.moveTo(flag, {reusePath: moveReusePath(true)});
                            }
                        }
                        else {
                            // Attacker in target room
                            if (creep.hits < creep.hitsMax * 0.6) {
                                //Attacker damaged enough to withdraw
                                creep.moveTo(flag, {reusePath: moveReusePath(true)});
                            }
                            else {
                                // Go for wall or rampart
                                let target;
                                if (flag.memory.targetRemoteDestroy == undefined || Game.time % 10) {
                                    target = creep.pos.findInRange(FIND_STRUCTURES, 10, {filter: (s) => s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART});
                                    if (target.length > 0) {
                                        target = _.sortBy(target, "hits");
                                        target = target[0];
                                        flag.memory.targetRemoteDestroy = target.id;
                                    }
                                    else {
                                        target = null;
                                        delete flag.memory.targetRemoteDestroy;
                                    }
                                }
                                else {
                                    target = Game.getObjectById(flag.memory.targetRemoteDestroy);
                                    if (target == null) {
                                        delete flag.memory.targetRemoteDestroy;
                                    }
                                }
                                if (target != null) {
                                    //Attack structure
                                    if (creep.memory.role == "archer") {
                                        //Creeps with remote attack
                                        if (creep.rangedAttack(target) == ERR_NOT_IN_RANGE) {
                                            creep.moveTo(target, {reusePath: moveReusePath(true)});
                                        }
                                    }
                                    else {
                                        //Creeps without remote attack
                                        if (creep.attack(target) == ERR_NOT_IN_RANGE) {
                                            creep.moveTo(target, {reusePath: moveReusePath(true)});
                                        }
                                    }
                                }
                            }
                        }
                        break;

                    case "healer":
                        if (creep.hits < creep.hitsMax) {
                            //Self-heal
                            creep.heal(creep);
                        }
                        if (flag.pos.roomName != creep.room.name) {
                            creep.moveTo(flag, {reusePath: moveReusePath(true)});
                        }
                        else {
                            // Healer is in flag room
                            if (friendlyCreeps.length > 0) {
                                //Look for nearest creep to flag needing help
                                var patient = flag.pos.findClosestByPath(FIND_CREEPS, {filter: function (creep) {return creep.hits < creep.hitsMax}});
                                if (patient != null) {
                                    if (creep.heal(patient) == ERR_NOT_IN_RANGE) {
                                        creep.moveTo(patient, {reusePath: moveReusePath(true)});
                                    }
                                }
                            }
                            else if (creep.pos.getRangeTo(flag) > 2) {
                                // Go to flag and wait
                                creep.moveTo(flag, {reusePath: moveReusePath(true)});
                            }
                        }
                        break;
                }
                break;

            case "destroy":
                switch (creep.memory.role) {
                    case "attacker":
                    case "einarr":
                    case "archer":
                        if (creep.memory.role == "einarr" && creep.hits < creep.hitsMax) {
                            creep.heal(creep);
                        }

                        var target;

                        var targets = flag.pos.findInRange(hostileCreeps, 4);
                        if (targets.length > 0) {
                            //Hostile creeps within flag range -> attack
                            if (creep.memory.role == "archer") {
                                target = flag.pos.findClosestByRange(targets);
                            }
                            else {
                                target = flag.pos.findClosestByPath(targets);
                            }
                            if (target != null && creep.attack(target) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(target, {reusePath: moveReusePath(true)});
                            }
                            else if (target == null){
                                target = undefined;
                            }
                        }
                        else {
                            targets = creep.pos.findInRange(hostileCreeps, 2);
                            if (targets.length > 0) {
                                //Hostile creeps within flag range -> attack
                                if (creep.memory.role == "archer") {
                                    target = flag.pos.findClosestByRange(targets);
                                }
                                else {
                                    target = flag.pos.findClosestByPath(targets);
                                }
                                if (target != null && creep.attack(target) == ERR_NOT_IN_RANGE) {
                                    creep.moveTo(target, {reusePath: moveReusePath(true)});
                                }
                                else if (target == null) {
                                    target = undefined;
                                }
                            }
                        }


                        if (target == undefined || target == null) {
                            //No hostile creeps around or not path to them found -> attack structure
                            targets = flag.pos.lookFor(LOOK_STRUCTURES);
                            if (targets.length > 0) {
                                // Structure found
                                for (let t in targets) {
                                    if (targets[t].structureType != STRUCTURE_CONTROLLER && targets[t].structureType != STRUCTURE_ROAD) {
                                        target = targets[t];
                                    }
                                    break;
                                }

                                if (target != undefined) {
                                    if (creep.attack(target) == ERR_NOT_IN_RANGE) {
                                        creep.moveTo(target, {reusePath: moveReusePath(true)});
                                    }
                                }
                            }
                            else {
                                //No structure to attack found
                                bunkerDown = true;
                            }

                        }
                        break;

                    case "healer":
                        if (creep.hits < creep.hitsMax) {
                            creep.heal(creep);
                        }

                        // No hostile creeps around
                        var patients = flag.pos.findInRange(friendlyCreeps, 5, {filter: (s) => s.hits < s.hitsMax});
                        if (patients.length > 0) {
                            //Damaged creeps near flag found
                            let patient = creep.pos.findClosestByPath(patients);
                            if (patient != null && creep.heal(patient) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(patient, {reusePath: moveReusePath(true)});
                                creep.rangedHeal(patient);
                            }
                            else {
                                //No path to patient found
                                if (creep.pos.getRangeTo(flag) > 2) {
                                    creep.moveTo(flag, {reusePath: moveReusePath(true)});
                                }
                            }
                        }
                        else {
                            //No damaged creeps around
                            if (creep.pos.getRangeTo(flag) > 2) {
                                creep.moveTo(flag, {reusePath: moveReusePath(true)});
                            }
                        }
                        break;
                }
                break;
            case "skr": //Source keeper room patrol -> not working yet
                //Find target
                var keepers = [];
                let roomFlags = creep.room.find(FIND_FLAGS, {filter: (f) => f.memory.function == "SKHarvest" || f.memory.function == "SKMine"});
                if (flag.memory.keeperLairs == undefined || Game.time % 11 == 0) {
                    //Search and save lair IDss & source keeper
                    flag.memory.keeperLairs = [];
                    if (roomFlags.length > 0) {
                        for (let f in roomFlags) {
                            let lairs = roomFlags[f].pos.findInRange(FIND_HOSTILE_STRUCTURES, 5);
                            if (lairs.length > 0) {
                                flag.memory.keeperLairs.push(lairs[0].id);
                            }

                            let invaders = roomFlags[f].pos.findInRange(FIND_HOSTILE_CREEPS, 5, {filter: (c) => isHostile(c) == true});
                            if (invaders.length > 0) {
                                for (let i in invaders) {
                                    if (keepers.indexOf(invaders[i]) == -1) {
                                        keepers.push(invaders[i]);
                                    }
                                }
                            }
                        }
                    }
                }
                else {
                    //Search and save source keeper
                    if (roomFlags.length > 0) {
                        for (let f in roomFlags) {
                            let invaders = roomFlags[f].pos.findInRange(FIND_HOSTILE_CREEPS, 5, {filter: (c) => isHostile(c) == true});
                            if (invaders.length > 0) {
                                for (let i in invaders) {
                                    if (keepers.indexOf(invaders[i]) == -1) {
                                        keepers.push(invaders[i]);
                                    }
                                }
                            }
                        }
                    }
                }

                switch (creep.memory.role)
                {
                    case "attacker":
                    case "einarr":
                    case "archer":
                        if (creep.memory.role == "einarr" && creep.hits < creep.hitsMax) {
                            creep.heal(creep);
                        }
                        let invaders = creep.room.find(FIND_HOSTILE_CREEPS, {filter: (c) => c.owner.username == "Invader"});
                        if (invaders.length > 0) {
                            //Invaders spawned
                            let myInvader = creep.pos.findClosestByPath(invaders);
                            if (creep.attack(myInvader) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(myInvader, {reusePath: moveReusePath(true)});
                            }
                        }
                        else if (keepers.length == 0) {
                            //No source keepers spawned -> go to next spawn
                            let lairs = []
                            for (let l in flag.memory.keeperLairs) {
                                lairs.push(Game.getObjectById(flag.memory.keeperLairs[l]));
                            }
                            lairs = _.sortBy(lairs, "ticksToSpawn");
                            if (creep.pos.getRangeTo(lairs[0]) > 1) {
                                creep.moveTo(lairs[0], {reusePath: moveReusePath(true)});
                            }
                        }
                        else {
                            let myKeeper = creep.pos.findClosestByPath(keepers);
                            if (creep.pos.getRangeTo(myKeeper) > 6) {
                                creep.moveTo(myKeeper, {reusePath: moveReusePath(true)});
                            }
                            else if (creep.pos.findInRange(FIND_MY_CREEPS, 2, {filter: (c) => c.memory.role == "healer"}).length > 0) {
                                //Healthy healer in range
                                if (creep.attack(myKeeper) == ERR_NOT_IN_RANGE) {
                                    creep.moveTo(myKeeper, {reusePath: moveReusePath(true)});
                                }
                            }
                            else if (creep.pos.getRangeTo(myKeeper) < 7) {
                                creep.goToHomeRoom();
                            }
                        }
                        break;

                    case "healer":
                        if (creep.hitsMax > creep.hits) {
                            creep.heal(creep);
                        }

                        let patient;
                        if (creep.memory.myPatient == undefined && Game.time % 3 == 0) {
                            let patients = creep.pos.findInRange(FIND_CREEPS, 5, {filter: (c) => c.hits < c.hitsMax && isHostile(c) == false});
                            if (patients.length > 0) {
                                patient = creep.pos.findClosestByPath(patients);
                                if (patient != null) {
                                    creep.memory.myPatient = patient.id;
                                }
                            }
                        }
                        else {
                           patient = Game.getObjectById(creep.memory.myPatient);
                        }
                        if (patient != null && patient.hits < patient.hitsMax && patient.hits < creep.hits) {
                            if (creep.heal(patient) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(patient, {reusePath: moveReusePath(true)});
                            }
                        }
                        else {
                            //No patients, found -> goto attacker
                            delete creep.memory.myPatient;
                            let myAttacker = creep.pos.findClosestByPath(FIND_MY_CREEPS, {filter: (c) => c.memory.role == "attacker" && c.memory.spawn == creep.memory.spawn});
                            if (creep.pos.getRangeTo(myAttacker) > 1) {
                                creep.moveTo(myAttacker, {reusePath: moveReusePath(true)});
                            }
                        }
                        break;
                }
                break;
            default:
                bunkerDown = true
                break;
        }

        if (bunkerDown == true) {
            switch (creep.memory.role) {
                case "attacker":
                case "einarr":
                    let target;
                    let targets = flag.pos.findInRange(hostileCreeps, 5);
                    if (targets.length > 0) {
                        //Hostile creeps within flag range -> attack
                        target = flag.pos.findClosestByPath(targets);
                        if (target != null && creep.attack(target) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(target, {reusePath: moveReusePath()});
                        }
                    }
                    else if (creep.memory.role == "einarr") {
                        let patients = flag.pos.findInRange(friendlyCreeps, 5);
                        if (patients.length > 0) {
                            //Damaged creeps near flag found
                            let patient = creep.pos.findClosestByPath(patients, {filter: (s) => s.hits < s.hitsMax});
                            if (patient != null && creep.heal(patient) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(patient, {reusePath: moveReusePath()});
                            }
                            else {
                                //No path to patient found
                                if (creep.pos.getRangeTo(flag) > 2) {
                                    creep.moveTo(flag, {reusePath: moveReusePath()});
                                }
                            }
                        }
                        else {
                            //No damaged creeps around
                            if (creep.pos.getRangeTo(flag) > 2) {
                                creep.moveTo(flag, {reusePath: moveReusePath()});
                            }
                        }
                    }
                    else {
                        //No hostile creeps around
                        if (creep.pos.getRangeTo(flag) > 2) {
                            creep.moveTo(flag, {reusePath: moveReusePath()});
                        }
                    }
                    break;

                case "healer":
                    let danger = creep.pos.findInRange(hostileCreeps, 2);
                    if (danger.length > 0) {
                        creep.moveTo(danger, {flee: true, reusePath: moveReusePath()});
                    }
                    else {
                        // No hostile creeps around
                        let patients = flag.pos.findInRange(friendlyCreeps, 5);
                        if (patients.length > 0) {
                            //Damaged creeps near flag found
                            let patient = creep.pos.findClosestByPath(patients, {filter: (s) => s.hits < s.hitsMax});
                            if (patient != null && creep.heal(patient) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(patient);
                            }
                            else {
                                //No path to patient found
                                if (creep.pos.getRangeTo(flag) > 2) {
                                    creep.moveTo(flag, {reusePath: moveReusePath()});
                                }
                            }
                        }
                        else {
                            //No damaged creeps around
                            if (creep.pos.getRangeTo(flag) > 2) {
                                creep.moveTo(flag, {reusePath: moveReusePath()});
                            }
                        }
                    }
                    break;
            }
        }
    }
};