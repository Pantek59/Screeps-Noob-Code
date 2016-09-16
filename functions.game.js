var playerUsername = "Pantek59";

global.terminalTransfer = function (transferResource, transferAmount, targetRoom, transferFlag) {
    // transfer resources to remote room from whatever room(s) is cheapest
    var roomCandidates = new Array();
    var tempArray = new Array();
    var resourceTotal = 0;

    if (arguments.length == 0) {
        return "terminalTransfer (transferResource, transferAmount, targetRoom, transferFlag) --> terminalTransfer(\"Z\", 10000, \"W16S47\", false)";
    }

    if (transferAmount < 100) {
        return "Minimal amount for terminal transfers are 100 units.";
    }

    for (var r in Game.rooms) {
        if (Game.rooms[r].terminal != undefined && Game.rooms[r].storage != undefined) {
            //Fill candidate array with rooms
            var roomResourceTotal = 0;
            var roomArray = new Array();

            // Add resource in storage
            if (Game.rooms[r].storage != undefined && Game.rooms[r].storage.store[transferResource] != undefined) {
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

    var totalVolume = 0;
    var totalCost = 0;

    if (roomCandidates.length == 0) {
        return "No rooms with " + transferResource + " found.";
    }
    else if (resourceTotal < transferAmount) {
        return "Not enough " + transferResource + " found.";
    }
    else {
        // There are rooms holding enough of the transfer resource
        var candidatesByCost = _.sortBy(roomCandidates,"cost");

        for (var c in candidatesByCost) {
            if (candidatesByCost[c].volume > transferAmount) {
                if (transferFlag == false) {
                    console.log("Terminal Transfer Preview for room " + candidatesByCost[c].name + " // " + targetRoom + ":" + transferAmount + ":" + transferResource + ":global transfer // Total Energy Cost: " + candidatesByCost[c].totalCost);
                }
                else if (transferFlag == true) {
                    Game.rooms[candidatesByCost[c].name].memory.terminalTransfer = targetRoom + ":" + transferAmount + ":" + transferResource + ":global transfer";
                    console.log(transferAmount + " " + transferResource + " scheduled from room " + candidatesByCost[c].name + " to room " + targetRoom + " for " + candidatesByCost[c].totalCost + " energy.");
                }
                totalVolume += transferAmount;
                totalCost += candidatesByCost[c].totalCost;
                break;
            }
            else {
                if (transferFlag == false) {
                    console.log("Terminal Transfer Preview for room " + candidatesByCost[c].name + " // " + targetRoom + ":" + candidatesByCost[c].volume + ":" + transferResource + ":global transfer // Total Energy Cost: " + candidatesByCost[c].totalCost);
                }
                else if (transferFlag == true) {
                    Game.rooms[candidatesByCost[c].name].memory.terminalTransfer = targetRoom + ":" + candidatesByCost[c].volume + ":" + transferResource + ":global transfer";
                    console.log(candidatesByCost[c].volume + " " + transferResource + " scheduled from room " + candidatesByCost[c].name + " to room " + targetRoom + " for " + candidatesByCost[c].totalCost + " energy.");
                }
                totalVolume += candidatesByCost[c].volume;
                totalCost += candidatesByCost[c].totalCost;
                transferAmount -= candidatesByCost[c].volume;
            }
        }

        if (transferFlag == "cost") {
            return totalCost;
        }
        return "OK";
    }
};

global.getRoomMineralLimit = function (roomName) {
    if (arguments.length == 0) {
        return "getRoomMineralLimit (roomName) --> getRoomMineralLimit(\"W16S47\")";
    }
    if (Game.rooms[roomName].memory.roomMineralLimit == undefined) {
        return "No roomMineralLimit defined in room " + roomName + ".";
    }
    else {
        return Game.rooms[roomName].memory.roomMineralLimit;
    }
};

global.setRoomMineralLimit = function (roomName, limit) {
    if (arguments.length == 0) {
        return "setRoomMineralLimit (roomName, limit) --> getRoomMineralLimit(\"W16S47\", 250000)";
    }
    if (Game.rooms[roomName].controller.owner.username == playerUsername) {
        Game.rooms[roomName].memory.roomMineralLimit = parseInt(limit);
        return "roomMineralLimit for room " + roomName + " has been set to " + Game.rooms[roomName].memory.roomMineralLimit + ".";
    }
    else {
        return "Room not owned by player!"
    }
};

global.listStorages = function () {
    // "<table><tr><th>Room</th><th>Lastname</th><th>Age</th></tr><tr><td>Jill</td><td>Smith</td><td>50</td></tr><tr><td>Eve</td><td>Jackson</td><td>94</td></tr></table>"
    var returnstring = "<table><tr><th>Resource  </th>";
    var resourceTable = new Array();

    for (var r in Game.rooms) {
        if (Game.rooms[r].storage != undefined) {
            for (var res in Game.rooms[r].storage.store) {
                if (resourceTable[res] == undefined) {
                    resourceTable[res] = 0;
                }
                resourceTable[res] = new Array;
                resourceTable[res].push(Game.rooms[r].storage.store[res]);

                returnstring = returnstring.concat("<th>" + Game.rooms[r].name + "</th>");

            }
        }
    }

    returnstring = returnstring.concat("</tr><tr>");

    for (res in resourceTable) {
        returnstring = returnstring.concat("<td>" + res + "  </td>");

        for (var h = 0; h < resourceTable[res].length; h++) {
            returnstring = returnstring.concat("<td>" )
        }
        //resourceInfo = resourceTable[res].pull ??
    }
    returnstring = returnstring.concat("</tr></table>");
    console.log (returnstring);
};