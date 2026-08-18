const canvas = document.getElementById("mainCanvas");

const ctx = canvas.getContext("2d");

let prevTime = 0;
let deltaTime = 0;

let scene;

const epsilon = 1e-9;

let mouseX = 0;
let mouseY = 0;
let mouseDown = false;
let dragging = false;

let uiSize = 10;
let frameCount = 0;

let isOverlayOpen = false;

let selectedObject = null;

let rayDensity = 20;
let rayThickness = 1;
let maxBounces = 10;

const rayDensitySlider = document.getElementById('rayDensity');
const rayThicknessSlider = document.getElementById('rayThickness');
const maxBouncesSlider = document.getElementById('maxBounces');

const rayDensityValue = document.getElementById('rayDensityValue');
const rayThicknessValue = document.getElementById('rayThicknessValue');
const maxBouncesValue = document.getElementById('maxBouncesValue');

rayDensitySlider.addEventListener('input', function () {
    rayDensityValue.textContent = this.value;
    rayDensity = parseFloat(this.value);

    if (rayDensity > 1) {
        rayDensityValue.textContent = Math.round(rayDensity);
        rayDensity = Math.round(rayDensity);
    }
});

rayThicknessSlider.addEventListener('input', function () {
    rayThicknessValue.textContent = this.value;
    rayThickness = parseFloat(this.value);
});

maxBouncesSlider.addEventListener('input', function () {
    maxBouncesValue.textContent = this.value;
    maxBounces = parseInt(this.value);
});








canvas.addEventListener("mousedown", (e) => {
    mouseDown = true;
});

canvas.addEventListener("mouseup", (e) => {
    mouseDown = false;
});
function updateMousePosition(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    mouseX = (((clientX - rect.left) / rect.width) * canvas.width) - (canvas.width / 2);
    mouseY = (canvas.height / 2) - (((clientY - rect.top) / rect.height) * canvas.height);
}

window.addEventListener("mousemove", (e) => {
    updateMousePosition(e.clientX, e.clientY);
});











// window.addEventListener('mousemove', (e) => {
//     mouseX = Math.max(-canvas.width / 2, Math.min(canvas.width / 2, e.clientX - (canvas.width / 2)));
//     mouseY = Math.max(-canvas.height / 2, Math.min(canvas.height / 2, (canvas.height / 2) - e.clientY));
// });

// window.addEventListener('touchmove', (e) => {
//     mouseX = Math.max(-canvas.width / 2, Math.min(canvas.width / 2, e.clientX - (canvas.width / 2)));
//     mouseY = Math.max(-canvas.height / 2, Math.min(canvas.height / 2, (canvas.height / 2) - e.clientY));
// });

// window.addEventListener('pointerdown', (e) => {
//     if (!isOverlayOpen) {
//         mouseDown = true;
//     }
// });

// window.addEventListener('pointerup', (e) => {
//     mouseDown = false;
// });

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
});

function openOverlay() {
    isOverlayOpen = true;
    mouseDown = false;
    document.getElementById("overlay-container").style.display = "flex";
}

function closeOverlay() {
    isOverlayOpen = false;
    document.getElementById("overlay-container").style.display = "none";
}

function addRay() {
    scene.lights.push(new Ray(-100, 0, -20, 0, true));
}

function addBeam() {
    scene.lights.push(new Beam(-100, 100, -100, -100));
}

function addPointSource() {
    scene.lights.push(new PointSource(0, 0));
}

function addPointSource() {
    scene.lights.push(new PointSource(0, 0));
}

function addPlaneMirror() {
    scene.mirrors.push(new PlaneMirror(100, 100, 100, -100));
}

function addCurvedMirror() {
    scene.mirrors.push(new CurvedMirror(100, 100, 100, -100, 200, 0));
}

function deleteSelected() {
    if (!selectedObject) return;

    if (selectedObject.constructor.name == "PlaneMirror" || selectedObject.constructor.name == "CurvedMirror") {
        const index = scene.mirrors.indexOf(selectedObject);
        if (index !== -1) {
            scene.mirrors.splice(index, 1);
        }
    } else {
        const index = scene.lights.indexOf(selectedObject);
        if (index !== -1) {
            scene.lights.splice(index, 1);
        }
    }

    selectedObject = null;
}

function initialize() {
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;

    scene = new Scene();

    requestAnimationFrame(loop);
}

function loop(currentTime) {
    deltaTime = currentTime - prevTime;
    prevTime = currentTime;

    if (!selectedObject) {
        document.getElementById("delete-object").style.display = "none";
    } else {
        document.getElementById("delete-object").style.display = "flex";
    }

    scene.update();
    scene.render();

    document.getElementById("fps").textContent = "FPS: " + Math.round(1000 / deltaTime);

    frameCount++;
    requestAnimationFrame(loop);
}

initialize();
