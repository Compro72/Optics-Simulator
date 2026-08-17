class PointSource {
    constructor(x1, y1) {
        this.x1 = x1;
        this.y1 = y1;

        this.draggingPoint1 = false;

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

        if (this.prevRayDensity !== rayDensity) {
            this.prevRayDensity = rayDensity;

            this.rays = [];

            for (let i = 0; i < Math.PI * 2; i += rayDensity/150) {
                this.rays.push(new Ray(this.x1, this.y1, this.x1 + Math.cos(i), this.y1 + Math.sin(i), false));
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
    }
}