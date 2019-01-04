// aframe-shader-buildings.js - boxy buildings using a fast shader for A-Frame WebXR
// Copyright © 2019 by P. Douglas Reeder under the MIT License

AFRAME.registerGeometry('ell', {
    schema: {
        xProportion: {type: 'number', default: 5, min: 1},
        zProportion: {type: 'number', default: 5, min: 1},
        yProportion: {type: 'number', default: 4, min: 2},
        // JSON array of objects with fields x, z, y, xSections, xWingSections, zSections, zWingSections, ySections
        buildings: {type: 'string', default: '[{}]'}
    },
    init: function (data) {
        // console.log("xProportion:", data.xProportion, "   zProportion:", data.zProportion);
        // console.log("typeof data.buildings:", typeof data.buildings, "   data.buildings:", data.buildings);
        let buildings = JSON.parse(data.buildings);
        var geometry = new THREE.Geometry();

        for (let i=0; i< buildings.length; ++i) {
            // console.log("buildings["+i+"]:", buildings[i]);

            let x = buildings[i].x || 0;
            let z = buildings[i].z || 0;
            let y = buildings[i].y || 0;

            let xSections = Math.max(buildings[i].xSections || 3, 1);
            let xWingSections = Math.max(Math.min(buildings[i].xWingSections || 0, xSections - 1), 0);

            let zSections = Math.max(buildings[i].zSections || 2, 1);
            let zWingSections =  Math.max(Math.min(buildings[i].zWingSections || 0, zSections - 1), 0);

            let xWingLength = xWingSections * data.xProportion;
            let xWingThickness = (zSections - zWingSections) * data.zProportion;
            let zWingLength = zWingSections * data.zProportion;
            let zWingThickness = (xSections - xWingSections) * data.xProportion;

            let yRoof = y + (buildings[i].ySections || 1) * data.yProportion;

            // console.log("xSections:", xSections, "   xWingSections:", xWingSections,
            //     "   xWingLength:", xWingLength, "   xWingThickness:", xWingThickness);

            geometry.vertices.push(new THREE.Vector3(x, y, z));
            geometry.vertices.push(new THREE.Vector3(x + xWingLength, y, z));
            geometry.vertices.push(new THREE.Vector3(x + xWingLength, y, z - xWingThickness));
            geometry.vertices.push(new THREE.Vector3(x - zWingThickness, y, z - xWingThickness));
            geometry.vertices.push(new THREE.Vector3(x - zWingThickness, y, z + zWingLength));
            geometry.vertices.push(new THREE.Vector3(x, y, z + zWingLength));
            geometry.vertices.push(new THREE.Vector3(x, yRoof, z));
            geometry.vertices.push(new THREE.Vector3(x + xWingLength, yRoof, z));
            geometry.vertices.push(new THREE.Vector3(x + xWingLength, yRoof, z - xWingThickness));
            geometry.vertices.push(new THREE.Vector3(x - zWingThickness, yRoof, z - xWingThickness));
            geometry.vertices.push(new THREE.Vector3(x - zWingThickness, yRoof, z + zWingLength));
            geometry.vertices.push(new THREE.Vector3(x, yRoof, z + zWingLength));

            geometry.faces.push(new THREE.Face3(12 * i + 0, 12 * i + 1, 12 * i + 7));
            geometry.faces.push(new THREE.Face3(12 * i + 0, 12 * i + 7, 12 * i + 6));
            geometry.faces.push(new THREE.Face3(12 * i + 1, 12 * i + 2, 12 * i + 8));
            geometry.faces.push(new THREE.Face3(12 * i + 1, 12 * i + 8, 12 * i + 7));
            geometry.faces.push(new THREE.Face3(12 * i + 2, 12 * i + 3, 12 * i + 9));
            geometry.faces.push(new THREE.Face3(12 * i + 2, 12 * i + 9, 12 * i + 8));
            geometry.faces.push(new THREE.Face3(12 * i + 3, 12 * i + 4, 12 * i + 10));
            geometry.faces.push(new THREE.Face3(12 * i + 3, 12 * i + 10, 12 * i + 9));
            geometry.faces.push(new THREE.Face3(12 * i + 4, 12 * i + 5, 12 * i + 11));
            geometry.faces.push(new THREE.Face3(12 * i + 4, 12 * i + 11, 12 * i + 10));
            geometry.faces.push(new THREE.Face3(12 * i + 5, 12 * i + 0, 12 * i + 6));
            geometry.faces.push(new THREE.Face3(12 * i + 5, 12 * i + 6, 12 * i + 11));
            // TODO: replace these faces with a separate roof using a different shader
            geometry.faces.push(new THREE.Face3(12 * i + 6, 12 * i + 7, 12 * i + 8));
            geometry.faces.push(new THREE.Face3(12 * i + 8, 12 * i + 9, 12 * i + 6));
            geometry.faces.push(new THREE.Face3(12 * i + 9, 12 * i + 10, 12 * i + 6));
            geometry.faces.push(new THREE.Face3(12 * i + 10, 12 * i + 11, 12 * i + 6));
        }

        geometry.computeBoundingBox();
        geometry.mergeVertices();
        geometry.computeFaceNormals();
        geometry.computeVertexNormals();
        this.geometry = geometry;
    }
});


AFRAME.registerShader('buildings', {
    schema: {
        wallColor: {type: 'color', default: '#909090'},   // off-white, like concrete
        windowColor: {type: 'color', default: '#181818'},   // dark gray
        sunPosition: {type: 'vec3', default: {x:-1.0, y:1.0, z:-1.0}}
    },

    vertexShader: `
precision mediump float;

uniform vec3 sunNormal;

varying vec3 pos;
varying float sunFactor;

void main() {
  pos = position;

  sunFactor = 0.5 + max(dot(normal, sunNormal), 0.0);

  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,

    fragmentShader: `
precision mediump float;

const float PI = 3.1415926535897932384626433832795;

uniform vec3 wallColor;
uniform vec3 windowColor;

varying vec3 pos;
varying float sunFactor;

void main() {
    float xx1 = step(0.0, sin(pos.x * 2.0 * PI / 5.0 - PI / 2.0));
    float xx2 = step(0.8, sin(pos.z * 2.0 * PI / 5.0 + PI / 2.0));

    float zz1 = step(0.0, sin(pos.z * 2.0 * PI / 5.0 - PI / 2.0));
    float zz2 = step(0.8, sin(pos.x * 2.0 * PI / 5.0 + PI / 2.0));

    float yy1 = step(0.4, sin(pos.y * 2.0 * PI / 4.0 - 2.3));

    vec3 inherentColor = mix(wallColor, windowColor, (xx1 * xx2 + zz1 * zz2) * yy1);

    gl_FragColor = vec4(inherentColor * sunFactor, 1.0);
}`,

    /**
     * `init` used to initialize material. Called once.
     */
    init: function (data) {
        // console.log("wallColor:", new THREE.Color(data.wallColor), "   windowColor:", new THREE.Color(data.windowColor));
        let sunPos = new THREE.Vector3(data.sunPosition.x, data.sunPosition.y, data.sunPosition.z);
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                wallColor: {value: new THREE.Color(data.wallColor)},
                windowColor: {value: new THREE.Color(data.windowColor)},
                sunNormal: {value: sunPos.normalize()}
            },
            vertexShader: this.vertexShader,
            fragmentShader: this.fragmentShader
        });
    },

    /**
     * `update` used to update the material. Called on initialization and when data updates.
     */
    update: function (data) {
        this.material.uniforms.wallColor.value.set(data.wallColor);
        this.material.uniforms.windowColor.value.set(data.windowColor);
        let sunPos = new THREE.Vector3(data.sunPosition.x, data.sunPosition.y, data.sunPosition.z);
        this.material.uniforms.sunNormal.value = sunPos.normalize();
    },
});


AFRAME.registerPrimitive('a-shader-buildings', {
    defaultComponents: {
        geometry: {
            primitive: 'ell',
            buildings: [
                {
                    x: -25,
                    z: -20,

                    xSections: 5.11,
                    xWingSections: 3.11,

                    zSections: 4,
                    zWingSections: 2,

                    ySections: 8.4
                },
                {
                    x: 30,
                    z: -30,

                    xSections: 6,
                    xWingSections: 2,

                    zSections: 5,
                    zWingSections: 2,

                    ySections: 6.2
                },
            ]
        },
        material: {
            shader: 'buildings',
        }
    },

    mappings: {
        'x-proportion': 'geometry.xProportion',
        'z-proportion': 'geometry.zProportion',
        'y-proportion': 'geometry.yProportion',
        'buildings': 'geometry.buildings',

        'wall-color': 'material.wallColor',
        'window-color': 'material.windowColor',
        'sun-position': 'material.sunPosition',
    }
});
