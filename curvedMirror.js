class CurvedMirror {
    constructor(x1, y1, x2, y2, curveX, curveY) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.curveX = curveX;
        this.curveY = curveY;

        this.circumcenter;
        this.radius;
        this.startAngle;
        this.endAngle;
        this.counterClockwise;

        this.updateValues();

        this.draggingPoint1 = false;
        this.draggingPoint2 = false;
        this.draggingCurvePoint = false;
    }

    updateValues() {
        const A = this.curveY - this.y2;
        const B = this.y2 - this.y1;
        const C = this.y1 - this.curveY;

        const D = this.x1 * this.x1 + this.y1 * this.y1;
        const E = this.curveX * this.curveX + this.curveY * this.curveY;
        const F = this.x2 * this.x2 + this.y2 * this.y2;

        const G = this.x2 - this.curveX;
        const H = this.x1 - this.x2;
        const I = this.curveX - this.x1;

        let denom = 2 * (this.x1 * A + this.curveX * B + this.x2 * C);

        if (Math.abs(denom) < epsilon) {
            denom = 10;
        }

        this.centerX = (D * A + E * B + F * C) / denom;
        this.centerY = (D * G + E * H + F * I) / denom;

        const dx1 = this.x1 - this.centerX;
        const dy1 = this.y1 - this.centerY;
        const dx2 = this.x2 - this.centerX;
        const dy2 = this.y2 - this.centerY;
        const dCurveX = this.curveX - this.centerX;
        const dCurveY = this.curveY - this.centerY;

        this.radius = Math.hypot(dCurveX, dCurveY);

        this.startAngle = Math.atan2(dy1, dx1);
        this.endAngle = Math.atan2(dy2, dx2);
        const curveAngle = Math.atan2(dCurveY, dCurveX);

        if (this.startAngle > this.endAngle && this.endAngle > curveAngle) {
            this.counterClockwise = false;
        } else if (this.startAngle > curveAngle && curveAngle > this.endAngle) {
            this.counterClockwise = true;
        } else if (this.endAngle > this.startAngle && this.startAngle > curveAngle) {
            this.counterClockwise = true;
        } else if (this.endAngle > curveAngle && curveAngle > this.startAngle) {
            this.counterClockwise = false;
        } else if (curveAngle > this.startAngle && this.startAngle > this.endAngle) {
            this.counterClockwise = false;
        } else if (curveAngle > this.endAngle && this.endAngle > this.startAngle) {
            this.counterClockwise = true;
        }
    }

    getRayIntersect(rayOriginX, rayOriginY, rayDirX, rayDirY) {
        let toCircleX = this.centerX - rayOriginX;
        let toCircleY = this.centerY - rayOriginY;

        let distToClosestApproach = toCircleX * rayDirX + toCircleY * rayDirY;

        let rayOriginToCircleCenterDistSq = toCircleX * toCircleX + toCircleY * toCircleY;
        let radiusSq = this.radius * this.radius;
        if (distToClosestApproach < 0 && rayOriginToCircleCenterDistSq > radiusSq) {
            return null;
        }

        let perpDistToRaySq = rayOriginToCircleCenterDistSq - distToClosestApproach * distToClosestApproach;

        if (perpDistToRaySq > radiusSq) {
            return null;
        }

        let halfChordDist = Math.sqrt(radiusSq - perpDistToRaySq);

        let entryDist = distToClosestApproach - halfChordDist;
        let exitDist = distToClosestApproach + halfChordDist;

        let intersectX;
        let intersectY;

        if (entryDist > epsilon) {
            intersectX = rayOriginX + rayDirX * entryDist;
            intersectY = rayOriginY + rayDirY * entryDist;

            if (this.isAngleOnArc(intersectX, intersectY)) {
                return [intersectX, intersectY, entryDist];
            }
        }

        if (exitDist > epsilon) {
            intersectX = rayOriginX + rayDirX * exitDist;
            intersectY = rayOriginY + rayDirY * exitDist;

            if (this.isAngleOnArc(intersectX, intersectY)) {
                return [intersectX, intersectY, exitDist];
            }
        }

        return null;
    }


    isAngleOnArc(x, y) {
        const angle = Math.atan2(y - this.centerY, x - this.centerX);
        let counterClockwiseAngle;

        if (this.startAngle > this.endAngle && this.endAngle > angle) {
            counterClockwiseAngle = false;
        } else if (this.startAngle > angle && angle > this.endAngle) {
            counterClockwiseAngle = true;
        } else if (this.endAngle > this.startAngle && this.startAngle > angle) {
            counterClockwiseAngle = true;
        } else if (this.endAngle > angle && angle > this.startAngle) {
            counterClockwiseAngle = false;
        } else if (angle > this.startAngle && this.startAngle > this.endAngle) {
            counterClockwiseAngle = false;
        } else if (angle > this.endAngle && this.endAngle > this.startAngle) {
            counterClockwiseAngle = true;
        }

        return counterClockwiseAngle === this.counterClockwise;
    }

    getNormal(intersectX, intersectY) {
        const dx = intersectX - this.centerX;
        const dy = intersectY - this.centerY;
        const len = Math.hypot(dx, dy);

        if (len === 0) {
            return [0, 0];
        }

        return [dx / len, dy / len];
    }

    getNewDirection(rayDirX, rayDirY, intersectX, intersectY) {
        let [normalX, normalY] = this.getNormal(intersectX, intersectY);

        let dotProduct = rayDirX * normalX + rayDirY * normalY;

        if (dotProduct < 0) {
            normalX = -normalX;
            normalY = -normalY;
            dotProduct = -dotProduct;
        }

        const rx = rayDirX - 2 * dotProduct * normalX;
        const ry = rayDirY - 2 * dotProduct * normalY;

        return [rx, ry];
    }

    update() {
        if (Math.hypot(mouseX - this.x1, mouseY - this.y1) <= uiSize && mouseDown && !dragging) {
            this.draggingPoint1 = true;
            dragging = true;
            selectedObject = this;
        }

        if (this.draggingPoint1) {
            if (!mouseDown) {
                this.draggingPoint1 = false;
                dragging = false;
            } else {
                this.x1 = mouseX;
                this.y1 = mouseY;
                this.updateValues();
            }
        }

        if (Math.hypot(mouseX - this.x2, mouseY - this.y2) <= uiSize && mouseDown && !dragging) {
            this.draggingPoint2 = true;
            dragging = true;
            selectedObject = this;
        }

        if (this.draggingPoint2) {
            if (!mouseDown) {
                this.draggingPoint2 = false;
                dragging = false;
            } else {
                this.x2 = mouseX;
                this.y2 = mouseY;
                this.updateValues();
            }
        }

        if (Math.hypot(mouseX - this.curveX, mouseY - this.curveY) <= uiSize && mouseDown && !dragging) {
            this.draggingCurvePoint = true;
            dragging = true;
            selectedObject = this;
        }

        if (this.draggingCurvePoint) {
            if (!mouseDown) {
                this.draggingCurvePoint = false;
                dragging = false;
            } else {
                this.curveX = mouseX;
                this.curveY = mouseY;
                this.updateValues();
            }
        }
    }

    render() {
        ctx.moveTo(this.centerX + Math.cos(this.startAngle) * this.radius, this.centerY + Math.sin(this.startAngle) * this.radius);
        ctx.arc(this.centerX, this.centerY, this.radius, this.startAngle, this.endAngle, this.counterClockwise);
    }

    renderUi() {
        ctx.moveTo(this.x1 + uiSize, this.y1);
        ctx.arc(this.x1, this.y1, uiSize, 0, Math.PI * 2);

        ctx.moveTo(this.x2 + uiSize, this.y2);
        ctx.arc(this.x2, this.y2, uiSize, 0, Math.PI * 2);

        ctx.moveTo(this.curveX + uiSize, this.curveY);
        ctx.arc(this.curveX, this.curveY, uiSize, 0, Math.PI * 2);
    }
}