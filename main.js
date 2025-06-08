let mouseDown = false;
let done = false;
const epsilon = 10 ** -4;


class Ray {
    constructor(rayPosition, rayDirection, colour = [255, 255, 0], thickness=2, maxRays=100, brightness=0.5) {
        this.rayPosition = rayPosition;
        this.rayDirection = rayDirection;
        this.colour = colour;
        this.thickness = thickness;
        this.brightness = brightness
        this.maxRays = maxRays;
        this.draggingPosition = false;
        this.draggingRayDirection = false;
    }

    simulate(mirrors, rayPosition = "start", rayDirection = "start", depth = 1) {
        if (rayPosition === "start" && rayDirection === "start") {
            rayPosition = this.rayPosition;
            rayDirection = this.rayDirection;
        }

        const distToStart = (item) => distance(item[0], rayPosition);
        
        let intersect = [];
        for (let mirror of mirrors) {
            const temp = mirror.getReflectedRay(rayPosition, rayDirection);
            if (temp !== null) {
                intersect.push(temp);
            }
        }

        if (intersect.length === 0) {
            drawLine(rayPosition, getScreenIntersect(rayPosition, rayDirection), this.colour, this.thickness, this.brightness);
            return;
        } else {
            intersect = intersect.reduce((prev, curr) => distToStart(curr) < distToStart(prev) ? curr : prev);
            const reflectedRayPosition = intersect[1];
            intersect = intersect[0];

            drawLine(rayPosition, intersect, this.colour, this.thickness, this.brightness);
            if (depth + 1 === this.maxRays) {
                return;
            }

            this.simulate(mirrors, intersect, reflectedRayPosition, depth + 1);
        }
    }

    movePoints(mouseX, mouseY, mouseDown) {
        drawDot(this.rayPosition, [0, 0, 255], 10);
        drawDot(this.rayDirection, [0, 0, 255], 10);

        if (Math.abs(mouseX - this.rayPosition[0]) <= 15 && Math.abs(mouseY - this.rayPosition[1]) <= 15 && mouseDown && !dragging) {
            this.draggingPosition = true;
            dragging = true;
        }

        if (this.draggingPosition) {
            if (!mouseDown) {
                this.draggingPosition = false;
                dragging = false;
            } else {
                this.rayPosition = [mouseX, mouseY];
            }
        }

        if (Math.abs(mouseX - this.rayDirection[0]) <= 15 && Math.abs(mouseY - this.rayDirection[1]) <= 15 && mouseDown && !dragging) {
            this.draggingRayDirection = true;
            dragging = true;
        }

        if (this.draggingRayDirection) {
            if (!mouseDown) {
                this.draggingRayDirection = false;
                dragging = false;
            } else {
                this.rayDirection = [mouseX, mouseY];
            }
        }
    }
}



class PlaneMirror {
    constructor(point1, point2, colour = [204, 204, 204], thickness = 2) {
        this.point1 = point1;
        this.point2 = point2;

        this.colour = colour;
        this.thickness = thickness;

        this.draggingPoint1 = false;
        this.draggingPoint2 = false;
    }

    getReflectedRay(rayPosition, rayDirection) {
        // Return [intersect, reflected]
        const rayM = getSlope(rayPosition, rayDirection);
        const rayB = getYIntercept(rayM, rayPosition);

        const mirrorM = getSlope(this.point1, this.point2);
        const mirrorB = getYIntercept(mirrorM, this.point1);

        const rayMirrorIntersect = lineToLineIntersection(rayM, rayB, mirrorM, mirrorB);

        if (rayMirrorIntersect === null) {
            return null;
        }

        const isIntersectOnMirror = Math.min(this.point1[0], this.point2[0]) - epsilon <= rayMirrorIntersect[0] && rayMirrorIntersect[0] <= Math.max(this.point1[0], this.point2[0]) + epsilon &&
            Math.min(this.point1[1], this.point2[1]) - epsilon <= rayMirrorIntersect[1] && rayMirrorIntersect[1] <= Math.max(this.point1[1], this.point2[1]) + epsilon;

        const intersectPointingCorrect = !((rayMirrorIntersect[0] < rayPosition[0] && rayPosition[0] < rayDirection[0]) || (rayMirrorIntersect[0] > rayPosition[0] && rayPosition[0] > rayDirection[0]) ||
            (rayMirrorIntersect[1] < rayPosition[1] && rayPosition[1] < rayDirection[1]) || (rayMirrorIntersect[1] > rayPosition[1] && rayPosition[1] > rayDirection[1]));

        const isIntersectPrevIntersect = (Math.abs(rayMirrorIntersect[0] - rayPosition[0]) < 1 && Math.abs(rayMirrorIntersect[1] - rayPosition[1]) < 1);

        if (!isIntersectOnMirror || !intersectPointingCorrect || isIntersectPrevIntersect) {
            return null;
        }

        const reflectedRayPosition = rotatePoint(rayPosition, Math.PI + 2 * (-getAngle(rayMirrorIntersect, rayPosition) + getAngle(rayMirrorIntersect, this.point1)), rayMirrorIntersect);

        return [rayMirrorIntersect, reflectedRayPosition];
    }

    draw() {
        drawLine(this.point1, this.point2, this.colour, this.thickness);
        drawDot(this.point1, this.colour, 10);
        drawDot(this.point2, this.colour, 10);
    }

    movePoints(mouseX, mouseY, mouseDown) {
        if (Math.abs(mouseX - this.point1[0]) <= 15 && Math.abs(mouseY - this.point1[1]) <= 15 && mouseDown && !dragging) {
            this.draggingPoint1 = true;
            dragging = true;
        }

        if (this.draggingPoint1) {
            if (!mouseDown) {
                this.draggingPoint1 = false;
                dragging = false;
            } else {
                this.point1 = [mouseX, mouseY];
            }
        }

        if (Math.abs(mouseX - this.point2[0]) <= 15 && Math.abs(mouseY - this.point2[1]) <= 15 && mouseDown && !dragging) {
            this.draggingPoint2 = true;
            dragging = true;
        }

        if (this.draggingPoint2) {
            if (!mouseDown) {
                this.draggingPoint2 = false;
                dragging = false;
            } else {
                this.point2 = [mouseX, mouseY];
            }
        }
    }
}



class CurvedMirror {
    constructor(point1, point2, curvePoint = [0, 0], colour = [204, 204, 204], thickness = 2) {
        this.point1 = point1;
        this.point2 = point2;
        this.curvePoint = curvePoint;

        this.centerOfCurvature = null;
        this.radius = null;
        this.startAngle = null;
        this.endAngle = null;
        this.dir = null;
        this.isCurveBetweenPoints = null;

        this.colour = colour;
        this.thickness = thickness;

        this.draggingPoint1 = false;
        this.draggingPoint2 = false;
        this.draggingCurvePoint = false;

        this.updateValues();
    }

    updateValues() {
        this.centerOfCurvature = getCenterOfCurvature(this.point1, this.point2, this.curvePoint);
        if (this.centerOfCurvature !== null) {
            this.radius = distance(this.point1, this.centerOfCurvature);

            this.startAngle = (90 - degrees(getAngle(this.centerOfCurvature, this.point1))) % 360;
            this.endAngle = (90 - degrees(getAngle(this.centerOfCurvature, this.point2))) % 360;
            const curveAngle = (90 - degrees(getAngle(this.centerOfCurvature, this.curvePoint))) % 360;

            this.dir = "left";

            if (this.startAngle > this.endAngle && this.endAngle > curveAngle) {
                this.dir = "right";
            } else if (this.startAngle > curveAngle && curveAngle > this.endAngle) {
                this.dir = "left";
            } else if (this.endAngle > this.startAngle && this.startAngle > curveAngle) {
                this.dir = "left";
            } else if (this.endAngle > curveAngle && curveAngle > this.startAngle) {
                this.dir = "right";
            } else if (curveAngle > this.startAngle && this.startAngle > this.endAngle) {
                this.dir = "right";
            } else if (curveAngle > this.endAngle && this.endAngle > this.startAngle) {
                this.dir = "left";
            }
        } else {
            this.isCurveBetweenPoints = 
                Math.min(this.point1[0], this.point2[0]) - epsilon <= this.curvePoint[0] &&
                this.curvePoint[0] <= Math.max(this.point1[0], this.point2[0]) + epsilon &&
                Math.min(this.point1[1], this.point2[1]) - epsilon <= this.curvePoint[1] &&
                this.curvePoint[1] <= Math.max(this.point1[1], this.point2[1]) + epsilon;
        }
    }

    getReflectedRay(rayPosition, rayDirection) {
        // Return [intersect, reflected]

        if (this.centerOfCurvature === null) {
            if (this.isCurveBetweenPoints) {
                return new PlaneMirror(this.point1, this.point2).getReflectedRay(rayPosition, rayDirection);
            } else {
                const ans1 = new PlaneMirror(this.point1, getScreenIntersect(this.point1, [2 * this.point1[0] - this.point2[0], 2 * this.point1[1] - this.point2[1]])).getReflectedRay(rayPosition, rayDirection);
                const ans2 = new PlaneMirror(this.point2, getScreenIntersect(this.point2, [2 * this.point2[0] - this.point1[0], 2 * this.point2[1] - this.point1[1]])).getReflectedRay(rayPosition, rayDirection);
                if (ans1 !== null) {
                    return ans1;
                } else if (ans2 !== null) {
                    return ans2;
                } else {
                    return null;
                }
            }
        }

        const rayM = getSlope(rayPosition, rayDirection);
        const rayB = getYIntercept(rayM, rayPosition);

        const rayMirrorIntersect = [];
        for (const point of circleLineIntersection(this.centerOfCurvature[0], this.centerOfCurvature[1], this.radius, rayM, rayB)) {
            const centerToPointAngle = (90 - degrees(getAngle(this.centerOfCurvature, point))) % 360;

            const intersectPointingCorrect = !((point[0] < rayPosition[0] && rayPosition[0] < rayDirection[0]) || (point[0] > rayPosition[0] && rayPosition[0] > rayDirection[0]) || (point[1] < rayPosition[1] && rayPosition[1] < rayDirection[1]) || (point[1] > rayPosition[1] && rayPosition[1] > rayDirection[1]));

            let isIntersectOnMirror;

            let intersectDir = "right"

            if (this.startAngle > this.endAngle && this.endAngle > centerToPointAngle) {
                intersectDir = "right";
            } else if (this.startAngle > centerToPointAngle && centerToPointAngle > this.endAngle) {
                intersectDir = "left";
            } else if (this.endAngle > this.startAngle && this.startAngle > centerToPointAngle) {
                intersectDir = "left";
            } else if (this.endAngle > centerToPointAngle && centerToPointAngle > this.startAngle) {
                intersectDir = "right";
            } else if (centerToPointAngle > this.startAngle && this.startAngle > this.endAngle) {
                intersectDir = "right";
            } else if (centerToPointAngle > this.endAngle && this.endAngle > this.startAngle) {
                intersectDir = "left";
            }

            isIntersectOnMirror = intersectDir===this.dir

            if (isIntersectOnMirror && intersectPointingCorrect) {
                rayMirrorIntersect.push(point);
            }
        }

        const distToRay = (item) => {
            const dist = distance(item, rayPosition);
            return dist < 1 ? Infinity : dist;
        };

        if (rayMirrorIntersect.length !== 0) {
            const closestIntersect = rayMirrorIntersect.reduce((prev, curr) => distToRay(curr) < distToRay(prev) ? curr : prev);
            
            const isIntersectPrevIntersect = (Math.abs(closestIntersect[0] - rayPosition[0]) < 1 && Math.abs(closestIntersect[1] - rayPosition[1]) < 1);
            
            if (isIntersectPrevIntersect) {
                return null;
            } else {
                const reflectedRayPosition = rotatePoint(rayPosition, 2 * (getAngle(closestIntersect, this.centerOfCurvature) - getAngle(closestIntersect, rayPosition)), closestIntersect);
                return [closestIntersect, reflectedRayPosition];
            }
        } else {
            return null;
        }
    }

    draw() {
        if (this.centerOfCurvature === null) {
            if (this.isCurveBetweenPoints) {
                drawLine(this.point1, this.point2, this.colour, this.thickness);
            } else {
                drawLine(this.point1, getScreenIntersect(this.point1, [2 * this.point1[0] - this.point2[0], 2 * this.point1[1] - this.point2[1]]), this.colour, this.thickness);
                drawLine(this.point2, getScreenIntersect(this.point2, [2 * this.point2[0] - this.point1[0], 2 * this.point2[1] - this.point1[1]]), this.colour, this.thickness);
            }
        } else {
            drawArc(this.centerOfCurvature, this.radius, this.startAngle, this.endAngle, this.dir, this.colour, this.thickness);
            drawDot(this.centerOfCurvature, this.colour, this.thickness * 5);
        }
        drawDot(this.point1, this.colour, this.thickness * 5);
        drawDot(this.point2, this.colour, this.thickness * 5);
        drawDot(this.curvePoint, [0, 0, 255], this.thickness * 5);
    }

    movePoints(mouseX, mouseY, mouseDown) {
        if (Math.abs(mouseX - this.point1[0]) <= 15 && Math.abs(mouseY - this.point1[1]) <= 15 && mouseDown && !dragging) {
            this.draggingPoint1 = true;
            dragging = true;
        }

        if (this.draggingPoint1) {
            if (!mouseDown) {
                this.draggingPoint1 = false;
                dragging = false;
            } else {
                this.point1 = [mouseX, mouseY];
            }
        }

        if (Math.abs(mouseX - this.point2[0]) <= 15 && Math.abs(mouseY - this.point2[1]) <= 15 && mouseDown && !dragging) {
            this.draggingPoint2 = true;
            dragging = true;
        }

        if (this.draggingPoint2) {
            if (!mouseDown) {
                this.draggingPoint2 = false;
                dragging = false;
            } else {
                this.point2 = [mouseX, mouseY];
            }
        }

        if (Math.abs(mouseX - this.curvePoint[0]) <= 15 && Math.abs(mouseY - this.curvePoint[1]) <= 15 && mouseDown && !dragging) {
            this.draggingCurvePoint = true;
            dragging = true;
        }

        if (this.draggingCurvePoint) {
            if (!mouseDown) {
                this.draggingCurvePoint = false;
                dragging = false;
            } else {
                this.curvePoint = [mouseX, mouseY];
            }
        }

        this.updateValues();
    }
}


class ParallelBeam {
    constructor(point1, point2, numRays, colour = [150, 150, 150], thickness = 2) {
        this.rays = [];
        this.point1 = point1;
        this.point2 = point2;
        this.numRays = numRays;
        this.colour = colour;
        this.thickness = thickness;

        this.draggingPoint1 = false;
        this.draggingPoint2 = false;
    }

    simulate(mirrors) {
        this.rays = [];

        let beam_m = getSlope(this.point1, this.point2)
        let beam_b = getYIntercept(beam_m, this.point1)

        let x = this.point1[0]
        for (let i=0; i<this.numRays; i++) {
            this.rays.push(new Ray([x, beam_m*x+beam_b], [x+1, beam_m*x+beam_b], [255, 255, 0], 1, 10, 1))

            x += (this.point2[0]-this.point1[0])/(this.numRays-1)
        }

        for (let ray of this.rays) {
            ray.simulate(mirrors);
        }
    }

    movePoints(mouseX, mouseY, mouseDown) {
        drawLine(this.point1, this.point2, this.colour, this.thickness);
        drawDot(this.point1, this.colour, 10);
        drawDot(this.point2, this.colour, 10);
        if (Math.abs(mouseX - this.point1[0]) <= 15 && Math.abs(mouseY - this.point1[1]) <= 15 && mouseDown && !dragging) {
            this.draggingPoint1 = true;
            dragging = true;
        }

        if (this.draggingPoint1) {
            if (!mouseDown) {
                this.draggingPoint1 = false;
                dragging = false;
            } else {
                this.point1 = [mouseX, mouseY];
            }
        }

        if (Math.abs(mouseX - this.point2[0]) <= 15 && Math.abs(mouseY - this.point2[1]) <= 15 && mouseDown && !dragging) {
            this.draggingPoint2 = true;
            dragging = true;
        }

        if (this.draggingPoint2) {
            if (!mouseDown) {
                this.draggingPoint2 = false;
                dragging = false;
            } else {
                this.point2 = [mouseX, mouseY];
            }
        }
    }
}


function convertFromCartesian(point) {
    let x = point[0];
    let y = point[1];

    return [(windowWidth/2)+x, (windowHeight/2)-y];
}

function convertToCartesian(point) {
    let x = point[0];
    let y = point[1];

    return [x-(windowWidth/2), (windowHeight/2)-y];
}

function getScreenIntersect(linePosition, lineDirection) {
    const m = getSlope(linePosition, lineDirection);
    const b = getYIntercept(m, linePosition);

    if (m === "inf") {
        if (lineDirection[1] - linePosition[1] > 0) {
            return [b, windowHeight/2];
        } else {
            return [b, -windowHeight/2];
        }
    } else if (lineDirection[0] - linePosition[0] > 0) {
        return [windowWidth/2, m * (windowWidth/2) + b];
    } else if (lineDirection[0] - linePosition[0] < 0) {
        return [-windowWidth/2, m * (-windowWidth/2) + b];
    }
}

function lineToLineIntersection(m1, b1, m2, b2) {
    if (m1 === "inf" && m2 === "inf") {
        return null;
    } else if (m1 === "inf") {
        let poiX = b1;
        let poiY = m2 * poiX + b2;

        poiX = Math.round(poiX / epsilon) * epsilon;
        poiY = Math.round(poiY / epsilon) * epsilon;

        return [poiX, poiY];
    } else if (m2 === "inf") {
        let poiX = b2;
        let poiY = m1 * poiX + b1;

        poiX = Math.round(poiX / epsilon) * epsilon;
        poiY = Math.round(poiY / epsilon) * epsilon;

        return [poiX, poiY];
    } else if ((m1 - m2) === 0) {
        return null;
    } else {
        let poiX = (b1 - b2) / (m2 - m1);
        let poiY = m1 * poiX + b1;

        poiX = Math.round(poiX / epsilon) * epsilon;
        poiY = Math.round(poiY / epsilon) * epsilon;

        return [poiX, poiY];
    }
}

function getCenterOfCurvature(p1, p2, p3) {
    const m1 = getPerpendicularSlope(getSlope(p1, p3));
    const b1 = getYIntercept(m1, getCenter(p1, p3));

    const m2 = getPerpendicularSlope(getSlope(p2, p3));
    const b2 = getYIntercept(m2, getCenter(p2, p3));

    return lineToLineIntersection(m1, b1, m2, b2);
}

function drawLine(p1, p2, colour, thickness, opacity=1) {
    stroke(...colour, 255*opacity);
    strokeWeight(thickness);
    line(...convertFromCartesian(p1), ...convertFromCartesian(p2));
}


function drawDot(point, colour = [255, 255, 255], thickness = 10) {
    fill(colour);
    noStroke();
    ellipse(...convertFromCartesian(point), thickness, thickness);
}


function drawArc(center, radius, startAngle, endAngle, dir = "right", colour = [0, 0, 0], thickness = 2) {
    stroke(colour); // Set arc color
    strokeWeight(thickness); // Set arc thickness
    noFill(); // Remove fill color



    // Adjust angles to radians
    let startRad = -radians(startAngle);
    let endRad = -radians(endAngle);

    // Flip direction if needed
    if (dir === "right") {
        [startRad, endRad] = [endRad, startRad]; // Swap angles
    }

    arc(...convertFromCartesian(center), radius * 2, radius * 2, startRad, endRad);
}


function rotatePoint(point, radians, origin = [0, 0]) {
    let x = point[0];
    let y = point[1];
    x -= origin[0];
    y -= origin[1];

    let rotatedX = x * Math.cos(radians) + y * Math.sin(radians);
    let rotatedY = -x * Math.sin(radians) + y * Math.cos(radians);

    rotatedX += origin[0];
    rotatedY += origin[1];

    rotatedX = Math.round(rotatedX / epsilon) * epsilon;
    rotatedY = Math.round(rotatedY / epsilon) * epsilon;

    return [rotatedX, rotatedY];
}

function circleLineIntersection(h, k, r, m, b) {
    if (m === "inf") {
        const temp = (r ** 2) - ((b - h) ** 2);
        if (temp < 0) {
            return [];
        } else if (temp === 0) {
            return [[b, k]];
        } else {
            let y1 = +Math.sqrt(temp) + k;
            let y2 = -Math.sqrt(temp) + k;

            y1 = Math.round(y1 / epsilon) * epsilon;
            y2 = Math.round(y2 / epsilon) * epsilon;

            return [[b, y1], [b, y2]];
        }
    }

    const A = 1 + m ** 2;
    const B = 2 * m * (b - k) - 2 * h;
    const C = h ** 2 + (b - k) ** 2 - r ** 2;

    const discriminant = B ** 2 - 4 * A * C;

    if (discriminant < 0) {
        return [];
    } else if (discriminant === 0) {
        const x = -B / (2 * A);
        return [[Math.round(x / epsilon) * epsilon, Math.round((m * x + b) / epsilon) * epsilon]];
    } else {
        let x1 = (-B + Math.sqrt(discriminant)) / (2 * A);
        let x2 = (-B - Math.sqrt(discriminant)) / (2 * A);

        x1 = Math.round(x1 / epsilon) * epsilon;
        x2 = Math.round(x2 / epsilon) * epsilon;

        return [[x1, m * x1 + b], [x2, m * x2 + b]];
    }
}

function parabolaLineIntersection(m, b, a, h, k) {
    if (m === "inf") {
        return [[b, a * (b - k)**2 + h]];
    }
    
    const A = a;
    const B = -2 * a * h - m;
    const C = a * h**2 + k - b;

    const discriminant = B**2 - 4 * A * C;

    if (discriminant < 0) {
        return [];
    } else if (discriminant === 0) {
        const x = -B / (2 * A);
        return [[x, m * x + b]];
    } else {
        const x1 = (-B + Math.sqrt(discriminant)) / (2 * A);
        const x2 = (-B - Math.sqrt(discriminant)) / (2 * A);
        return [[x1, m * x1 + b], [x2, m * x2 + b]];
    }
}

function distance(point1, point2) {
    return Math.round(Math.sqrt((point1[0]-point2[0])**2+(point1[1]-point2[1])**2)/epsilon)*epsilon;
}

function getSlope(point1, point2) {
    if (point2[0] - point1[0] === 0) {
        return "inf";
    }
    return (point2[1] - point1[1]) / (point2[0] - point1[0]);
}

function getYIntercept(slope, point) {
    if (slope === "inf") {
        return point[0];
    }
    return point[1] - slope * point[0];
}

function getPerpendicularSlope(slope) {
    if (slope === "inf") {
        return 0;
    } else if (slope === 0) {
        return "inf";
    } else {
        return -1 / slope;
    }
}

function getCenter(point1, point2) {
    return [(point1[0] + point2[0])/2, (point1[1] + point2[1])/2];
}

function getPerpendicularSlope(slope) {
    if (slope === 0) {
        return "inf";
    } else if (slope === "inf") {
        return 0;
    } else {
        return -1/slope;
    }
}

function getParabolaAValue(point, vertex = [0, 0]) {
    if (((point[0] - vertex[1]) ** 2) === 0) {
        return "inf";
    } else {
        return (point[1] - vertex[0]) / ((point[0] - vertex[1]) ** 2);
    }
}

function getAngle(point1, point2) {
    const distX = (point2[0] - point1[0]);
    const distY = (point2[1] - point1[1]);
    const angle = Math.atan2(distX, distY);
    
    return angle;
}

function degrees(radians) {
    return radians*(180/Math.PI)
}

class Scene {
    constructor() {
        this.lights = [];
        this.mirrors = [];
        this.dragging = false;
    }

    simulateRays() {
        for (let light of this.lights) {
            light.simulate(this.mirrors);
        }
    }

    drawMirrors() {
        for (let mirror of this.mirrors) {
            mirror.draw();
        }
    }

    movePoints(mouseX, mouseY, mouseDown) {
        for (let light of this.lights) {
            light.movePoints(mouseX, mouseY, mouseDown);
        }
        for (let mirror of this.mirrors) {
            mirror.movePoints(mouseX, mouseY, mouseDown);
        }
    }
}


// Main simulation code
const newScene = new Scene();
const num = 20;
const start = 200;
let dragging = false

//newScene.lights.push(new ParallelBeam([-200, start], [-200, -start], 20));

for (let i = 0; i <= num; i++) {
    newScene.lights.push(new Ray([-300, start - (((start * 2) / num) * i)], [-200, start - (((start * 2) / num) * i)], [255, 255, 0], 1.5, 100, 0.5));
}


//newScene.mirrors.push(new PlaneMirror([700, 10], [700, -10]));
newScene.mirrors.push(new CurvedMirror([100, 300], [100, -300], [290, 0]));
//newScene.mirrors.push(new PlaneMirror([400, 100], [500, 50]));


function setup() {
    createCanvas(windowWidth, windowHeight);
}

function draw() {
    background(0, 0, 0);

    newScene.movePoints(...convertToCartesian([mouseX, mouseY]), mouseDown)
    newScene.simulateRays()
    newScene.drawMirrors()
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
    mouseDown = true
}

function mouseReleased() {
    mouseDown = false
}