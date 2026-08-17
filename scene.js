class Scene {
    constructor() {
        this.lights = [];
        this.mirrors = [];
    }

    update() {
        for (let light of this.lights) {
            light.update(this.mirrors);
        }
        for (let mirror of this.mirrors) {
            mirror.update();
        }
    }

    render() {
        ctx.save();

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(1, -1);

        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        // Rays
        ctx.lineWidth = rayThickness;
        ctx.beginPath();
        for (let light of this.lights) {
            light.render();
        }
        ctx.strokeStyle = "rgb(255, 255, 0)";
        ctx.stroke();

        // Mirror
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let mirror of this.mirrors) {
            mirror.render();
        }
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();

        // UI
        ctx.beginPath();
        for (let light of this.lights) {
            light.renderUi();
        }
        for (let mirror of this.mirrors) {
            mirror.renderUi();
        }
        ctx.strokeStyle = "#0000ff";
        ctx.fillStyle = "#0000ff";
        ctx.stroke();
        ctx.fill();

        ctx.restore();
    }
}