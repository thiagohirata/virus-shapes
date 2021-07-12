const ShapePoints = require('shape-points')
const yaml = require('yaml')
const lerp = require('lerp')
// const points = ShapePoints.circle(0, 0, 1, 4);
const points = ShapePoints.rect(0, 0, 2, 2);
const interpolation = 5;

const vectors = []
for (let i = 0; i < points.length; i += 2) {
    const currentPoint = { x: points[i], y: points[i + 1], z: 0 };
    vectors.push(currentPoint);

    const nextPointIndex = (i + 2) % points.length
    const nextPoint = { x: points[nextPointIndex], y: points[nextPointIndex + 1], z: 0 }

    //interpolate
    if (nextPoint.x != null) {
        for (let j = 1; j < interpolation; j++) {
            const [x, y, z] = ['x', 'y', 'z'].map(k => lerp(currentPoint[k], nextPoint[k], j / interpolation))
            vectors.push({ x, y, z })
        }

    }
}
console.log(yaml.stringify({ positions: vectors }))