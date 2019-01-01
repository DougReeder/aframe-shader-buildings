// aframe-shader-buildings.js - boxy buildings using a fast shader for A-Frame WebXR
// Copyright © 2019 by P. Douglas Reeder under the MIT License

AFRAME.registerGeometry('ell', {
    schema: {
        xSections: {type: 'number', default: 4},
        xThickness: {type: 'number', default: 2},
        xProportion: {type: 'number', default: 5},

        zSections: {type: 'number', default: 2},
        zThickness: {type: 'number', default: 1},
        zProportion: {type: 'number', default: 5},

        ySections: {type: 'number', default: 1},
        yProportion: {type: 'number', default: 4},
    },
    init: function (data) {
        var geometry = new THREE.Geometry();

        let xProportion = data.xProportion;
        let zProportion = data.zProportion;

        let xWingLength = (data.xSections - data.xThickness) * xProportion;
        let xWingThickness = data.zThickness * zProportion;
        let zWingLength = (data.zSections - data.zThickness) * zProportion;
        let zWingThickness = data.xThickness * xProportion;

        let yHeight = data.ySections * data.yProportion;
        geometry.vertices.push(new THREE.Vector3(0, 0, 0));
        geometry.vertices.push(new THREE.Vector3(xWingLength, 0, 0));
        geometry.vertices.push(new THREE.Vector3(xWingLength, 0, -xWingThickness));
        geometry.vertices.push(new THREE.Vector3(-zWingThickness, 0, -xWingThickness));
        geometry.vertices.push(new THREE.Vector3(-zWingThickness, 0, zWingLength));
        geometry.vertices.push(new THREE.Vector3(0, 0, zWingLength));
        geometry.vertices.push(new THREE.Vector3(0, yHeight, 0));
        geometry.vertices.push(new THREE.Vector3(xWingLength, yHeight, 0));
        geometry.vertices.push(new THREE.Vector3(xWingLength, yHeight, -xWingThickness));
        geometry.vertices.push(new THREE.Vector3(-zWingThickness, yHeight, -xWingThickness));
        geometry.vertices.push(new THREE.Vector3(-zWingThickness, yHeight, zWingLength));
        geometry.vertices.push(new THREE.Vector3(0, yHeight, zWingLength));
        geometry.computeBoundingBox();

        geometry.faces.push(new THREE.Face3(0, 1, 7));
        geometry.faces.push(new THREE.Face3(0, 7, 6));
        geometry.faces.push(new THREE.Face3(1, 2, 8));
        geometry.faces.push(new THREE.Face3(1, 8, 7));
        geometry.faces.push(new THREE.Face3(2, 3, 9));
        geometry.faces.push(new THREE.Face3(2, 9, 8));
        geometry.faces.push(new THREE.Face3(3, 4, 10));
        geometry.faces.push(new THREE.Face3(3, 10, 9));
        geometry.faces.push(new THREE.Face3(4, 5, 11));
        geometry.faces.push(new THREE.Face3(4, 11, 10));
        geometry.faces.push(new THREE.Face3(5, 0, 6));
        geometry.faces.push(new THREE.Face3(5, 6, 11));
        // TODO: replace these faces with a separate roof using a different shader
        geometry.faces.push(new THREE.Face3(6, 7, 8));
        geometry.faces.push(new THREE.Face3(8, 9, 6));
        geometry.faces.push(new THREE.Face3(9, 10, 6));
        geometry.faces.push(new THREE.Face3(10, 11, 6));

        geometry.mergeVertices();
        geometry.computeFaceNormals();
        geometry.computeVertexNormals();
        this.geometry = geometry;
    }
});


AFRAME.registerShader('buildings', {
    schema: {
        wallColor: {type: 'color', default: '#000080'},   // navy blue
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
        console.log("wallColor:", new THREE.Color(data.wallColor), "   windowColor:", new THREE.Color(data.windowColor));
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


AFRAME.registerPrimitive('a-shader-building', {
    defaultComponents: {
        geometry: {
            primitive: 'ell',
            xSections: 5.11,
            xThickness: 2,
            zSections: 4,
            zThickness: 2,
            ySections: 8.4
        },
        material: {
            shader: 'buildings',
        }
    },

    mappings: {
        'wall-color': 'material.wallColor',
        'window-color': 'material.windowColor',
        'sun-position': 'material.sunPosition',
    }
});
