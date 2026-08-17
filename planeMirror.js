class PlaneMirror {
    constructor(x1, y1, x2, y2) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;

        this.draggingPoint1 = false;
        this.draggingPoint2 = false;
    }

    getRayIntersect(rayOriginX, rayOriginY, rayDirX, rayDirY) {
        let A = rayDirX;
        let B = this.y2 - this.y1;
        let C = rayDirY;
        let D = this.x2 - this.x1;
        let E = this.x1 - rayOriginX;
        let F = rayOriginY - this.y1;

        let c = A * B - C * D;

        if (Math.abs(c) < epsilon) {
            return null;
        }

        let a = (D * F + B * E) / c;
        let b = (C * E + A * F) / c;

        if (a >= 0 && b >= 0 && b <= 1) {
            let intersectX = this.x1 + D * b;
            let intersectY = this.y1 + B * b;
            if (Math.abs(intersectX - rayOriginX) < epsilon && Math.abs(intersectY - rayOriginY) < epsilon) {
                return null
            } else {
                return [intersectX, intersectY, a]
            }
        } else {
            return null;
        }
    }
    
    getNormal() {
        const dx = this.x2 - this.x1;
        const dy = this.y2 - this.y1;
        const len = Math.hypot(dx, dy);

        if(len === 0) {
            return [0, 0];
        }

        return [-dy / len, dx / len];
    }

    getNewDirection(rayDirX, rayDirY, intersectX, intersectY) {
        let [normalX, normalY] = this.getNormal();

        let dotProduct = rayDirX * normalX + rayDirY * normalY;

        if(dotProduct < 0) {
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
            }
        }
    }

    render() {
        ctx.moveTo(this.x1, this.y1);
        ctx.lineTo(this.x2, this.y2);
    }

    renderUi() {
        ctx.moveTo(this.x1+uiSize, this.y1);
        ctx.arc(this.x1, this.y1, uiSize, 0, Math.PI * 2);

        ctx.moveTo(this.x2+uiSize, this.y2);
        ctx.arc(this.x2, this.y2, uiSize, 0, Math.PI * 2);
    }
}