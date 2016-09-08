global.terminalTransfer = function (transferResource, transferAmount, targetRoom, transferFlag) {
    // transfer resources to remote room from whatever room(s) is cheapest
    var roomCandidates = new Array();
    var tempArray = new Array();
    var resourceTotal = 0;
    //TODO: Rooms for transfer are chosen strangely
    for (var r in Game.rooms) {
        if (Game.rooms[r].terminal != undefined && Game.rooms[r].storage != undefined) {
            //Fill candidate array with rooms
            var roomResourceTotal = 0;
            var roomArray = new Array();

            // Add resource in storage
            if (Game.rooms[r].storage != undefined) {
                roomResourceTotal += Game.rooms[r].storage.store[transferResource];
            }

            // Add resource in containers
            tempArray = Game.rooms[r].memory.roomArrayContainers;
            var container;
            for (var s in tempArray) {
                container = Game.getObjectById(tempArray[s]);
                if (container != undefined) {
                    if (container.store[transferResource] != undefined) {
                        roomResourceTotal += container.store[transferResource];
                    }
                }
            }

            if (transferResource == RESOURCE_ENERGY) {
                // Add resource in links
                tempArray = Game.rooms[r].memory.roomArrayLinks;
                for (var s in tempArray) {
                    container = Game.getObjectById(tempArray[s]);
                    if (container != undefined) {
                        roomResourceTotal += Game.getObjectById(tempArray[s]).energy;
                    }
                }
            }

            if (roomResourceTotal > 0 && Game.rooms[r].name != targetRoom) {
                roomArray["name"] = Game.rooms[r].name;
                roomArray["volume"] = roomResourceTotal;

                if (roomResourceTotal > transferAmount) {
                    roomArray["totalCost"] = Game.market.calcTransactionCost(transferAmount, Game.rooms[r].name, targetRoom);
                }
                else {
                    roomArray["totalCost"] = Game.market.calcTransactionCost(roomResourceTotal, Game.rooms[r].name, targetRoom);
                }
                roomArray["cost"] = Game.market.calcTransactionCost(100, roomArray.name, targetRoom);

                if (transferFlag == false) {
                    console.log(roomArray.name + ": " + roomResourceTotal + " of " + transferResource + " (energy factor: " + roomArray.cost + ")");
                }

                roomCandidates.push(roomArray);
                resourceTotal += roomResourceTotal;
            }
        }
    }

    if (roomCandidates.length == 0) {
        return "No rooms with " + transferResource + " found.";
    }
    else if (resourceTotal < transferAmount) {
        return "Not enough " + transferResource + " found.";
    }
    else {
        // There are rooms holding enough of the transfer resource
        var candidatesByCost = _.sortBy(roomCandidates,"cost");
        var totalVolume = 0;

        for (var c in candidatesByCost) {
            if (candidatesByCost[c].volume > transferAmount) {
                if (transferFlag == false) {
                    console.log("Terminal Transfer Preview for room " + candidatesByCost[c].name + " // " + targetRoom + ":" + transferAmount + ":" + transferResource + ":global transfer // Total Energy Cost: " + candidatesByCost[c].totalCost);
                }
                else {
                    Game.rooms[candidatesByCost[c].name].memory.terminalTransfer = targetRoom + ":" + transferAmount + ":" + transferResource + ":global transfer";
                    console.log(transferAmount + " " + transferResource + " scheduled from room " + candidatesByCost[c].name + " to room " + targetRoom + " for " + candidatesByCost[c].totalCost + " energy.");
                }
                break;
            }
            else {
                if (transferFlag == false) {
                    console.log("Terminal Transfer Preview for room " + candidatesByCost[c].name + " // " + targetRoom + ":" + candidatesByCost[c].volume + ":" + transferResource + ":global transfer // Total Energy Cost: " + candidatesByCost[c].totalCost);
                }
                else {
                    Game.rooms[candidatesByCost[c].name].memory.terminalTransfer = targetRoom + ":" + candidatesByCost[c].volume + ":" + transferResource + ":global transfer";
                    console.log(candidatesByCost[c].volume + " " + transferResource + " scheduled from room " + candidatesByCost[c].name + " to room " + targetRoom + " for " + candidatesByCost[c].totalCost + " energy.");
                }
                transferAmount -= candidatesByCost[c].volume;
            }
        }
        return "OK";
    }
};