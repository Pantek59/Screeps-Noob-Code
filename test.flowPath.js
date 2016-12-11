Creep.prototype.useFlowPathTo = function (targetPosition) {
    // Data structure: Memory.flowPath.room.target x/y.source x/y = direction
    // flowMarker Hash: Memory.flowPath.room.roomHash
    if (targetPosition.roomName != this.room.name) {
        return false;
    }

    let targetXY = targetPosition.x + "/" + targetPosition.y;
    let creepXY = this.pos.x + "/" + this.pos.y;

    // Prepare memory
    if (Memory.flowPath == undefined) {
        Memory.flowPath = {};
    }
    if (Memory.flowPath[this.room.name] == undefined) {
        Memory.flowPath[this.room.name] = {};
    }
    if (Memory.flowPath[this.room.name][targetXY] == undefined) {
        Memory.flowPath[this.room.name][targetXY] = {};
    }

    if (Memory.flowPath[this.room.name][targetXY][creepXY] == undefined) {
        // Get path
        let myPath = this.pos.findPathTo(targetPosition, {ignoreCreeps: true});
        if (myPath.length == 0) {
            return false;
        }

        // Save direction to flowPath memory
        for (let step in myPath) {
            let savePos;
            if (step == 0) {
                savePos = creepXY;
            }
            else {
                savePos = myPath[step - 1].x + "/" + myPath[step - 1].y;
            }
            Memory.flowPath[this.room.name][targetXY][savePos] = myPath[step].direction;
        }
    }

    if (Memory.flowPath[this.room.name][targetXY][creepXY] == undefined) {
        return false;
    }

    // Move in saved direction
    this.move(Memory.flowPath[this.room.name][targetXY][creepXY]);
};
