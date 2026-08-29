class Beam {
    constructor(x1, y1, x2, y2) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;

        this.draggingPoint1 = false;
        this.draggingPoint2 = false;

        this.prevRayDensity = null;

        this.rays = [];
    }

    update(mirrors) {
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
                this.prevRayDensity = null;
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
                this.prevRayDensity = null;
            }
        }

        if (this.prevRayDensity !== rayDensity) {
            this.prevRayDensity = rayDensity;

            let dx = this.x2 - this.x1;
            let dy = this.y2 - this.y1;
            let len = Math.hypot(dx, dy);
            let step = rayDensity / len;

            let perpendicularX = this.x1 - dy;
            let perpendicularY = this.y1 + dx;

            this.rays = [];

            for (let i = 0; i < 1; i += step) {
                this.rays.push(new Ray(this.x1 + dx * i, this.y1 + dy * i, perpendicularX + dx * i, perpendicularY + dy * i, false));
            }
        }

        for (let ray of this.rays) {
            ray.update(mirrors);
        }
    }

    render() {
        for (let ray of this.rays) {
            ray.render();
        }
    }

    renderUi() {
        ctx.moveTo(this.x1 + uiSize, this.y1);
        ctx.arc(this.x1, this.y1, uiSize, 0, Math.PI * 2);

        ctx.moveTo(this.x2 + uiSize, this.y2);
        ctx.arc(this.x2, this.y2, uiSize, 0, Math.PI * 2);

        ctx.moveTo(this.x1, this.y1);
        ctx.lineTo(this.x2, this.y2);
    }
}