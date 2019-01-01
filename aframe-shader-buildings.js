// aframe-shader-buildings.js - boxy buildings using a fast shader for A-Frame WebXR
// Copyright © 2019 by P. Douglas Reeder under the MIT License

AFRAME.registerShader('buildings', {
    schema: {
        wallColor: {type: 'color', default: '#000080'},   // navy blue
        windowColor: {type: 'color', default: '#181818'},   // dark gray
    },

    vertexShader: `
precision mediump float;

varying vec3 pos;

void main() {
  pos = position;

  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,

    fragmentShader: `
precision mediump float;

const float PI = 3.1415926535897932384626433832795;

uniform vec3 wallColor;
uniform vec3 windowColor;

varying vec3 pos;

void main() {
    float xx1 = step(0.0, sin(pos.x * 2.0 * PI / 5.0 - PI / 2.0));
    float xx2 = step(0.8, sin(pos.z * 2.0 * PI / 5.0 + PI / 2.0));

    float zz1 = step(0.0, sin(pos.z * 2.0 * PI / 5.0 - PI / 2.0));
    float zz2 = step(0.8, sin(pos.x * 2.0 * PI / 5.0 + PI / 2.0));

    float yy1 = step(0.4, sin(pos.y * 2.0 * PI / 4.0 - 2.3));

    vec3 color = mix(wallColor, windowColor, (xx1 * xx2 + zz1 * zz2) * yy1);

    gl_FragColor = vec4(color, 1.0);
}`,

    /**
     * `init` used to initialize material. Called once.
     */
    init: function (data) {
        console.log("wallColor:", new THREE.Color(data.wallColor), "   windowColor:", new THREE.Color(data.windowColor));
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                wallColor: {value: new THREE.Color(data.wallColor)},
                windowColor: {value: new THREE.Color(data.windowColor)},
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
    },
});


AFRAME.registerPrimitive('a-shader-building', {
    defaultComponents: {
        geometry: {
            primitive: 'box',
            width: 20,
            height: 40,
            depth: 10
        },
        material: {
            shader: 'buildings',
        }
    },

    mappings: {
        'wall-color': 'material.wallColor',
        'window-color': 'material.windowColor',
    }
});
