class Ray {
    constructor(originX, originY, targetX, targetY, addUi = true) {
        this.originX = originX;
        this.originY = originY;

        this.targetX = targetX;
        this.targetY = targetY;

        this.draggingOrigin = false;
        this.draggingDir = false;

        this.hasUI = addUi;

        this.points = [];
    }

    update(mirrors) {
        if (this.hasUI) {
            if (Math.hypot(mouseX - this.originX, mouseY - this.originY) <= uiSize && mouseDown && !dragging) {
                this.draggingOrigin = true;
                dragging = true;
                selectedObject = this;
            }

            if (this.draggingOrigin) {
                if (!mouseDown) {
                    this.draggingOrigin = false;
                    dragging = false;
                } else {
                    this.originX = mouseX;
                    this.originY = mouseY;
                }
            }

            if (Math.hypot(mouseX - this.targetX, mouseY - this.targetY) <= uiSize && mouseDown && !dragging) {
                this.draggingDir = true;
                dragging = true;
                selectedObject = this;
            }

            if (this.draggingDir) {
                if (!mouseDown) {
                    this.draggingDir = false;
                    dragging = false;
                } else {
                    this.targetX = mouseX;
                    this.targetY = mouseY;
                }
            }
        }

        this.points = [];

        let currentOriginX = this.originX;
        let currentOriginY = this.originY;

        let currentDirX = this.targetX - this.originX;
        let currentDirY = this.targetY - this.originY;

        const len = Math.hypot(currentDirX, currentDirY);

        if (len > 0) {
            currentDirX /= len;
            currentDirY /= len;
        }

        for (let i = 0; i < maxBounces + 1; i++) {
            let minDist = Infinity;
            let currentIntersect;
            let intersectMirror;
            for (let mirror of mirrors) {
                let intersect = mirror.getRayIntersect(currentOriginX, currentOriginY, currentDirX, currentDirY);

                if (intersect && intersect[2] < minDist) {
                    minDist = intersect[2];
                    currentIntersect = [intersect[0], intersect[1]];
                    intersectMirror = mirror;
                }
            }

            if (minDist === Infinity) {
                this.points.push([currentOriginX + currentDirX * 99999, currentOriginY + currentDirY * 99999]);
                break;
            }

            let newDir = intersectMirror.getNewDirection(currentDirX, currentDirY, currentIntersect[0], currentIntersect[1]);

            currentOriginX = currentIntersect[0];
            currentOriginY = currentIntersect[1];
            currentDirX = newDir[0];
            currentDirY = newDir[1];

            this.points.push([currentOriginX, currentOriginY]);
        }
    }

    render() {
        ctx.moveTo(this.originX, this.originY);
        for (let point of this.points) {
            ctx.lineTo(point[0], point[1]);
        }
    }

    renderUi() {

        ctx.moveTo(this.originX + uiSize, this.originY);
        ctx.arc(this.originX, this.originY, uiSize, 0, Math.PI * 2);

        ctx.moveTo(this.targetX + uiSize, this.targetY);
        ctx.arc(this.targetX, this.targetY, uiSize, 0, Math.PI * 2);
    }
}