// buildingsShader.js - shader for aframe-shader-buildings
// Copyright © 2019 by P. Douglas Reeder under the MIT License


AFRAME.registerShader('buildings', {
    schema: {
        xProportion: {type: 'number', default: 5},
        zProportion: {type: 'number', default: 5},
        yProportion: {type: 'number', default: 4},
        windowWidth: {type: 'number', default: 0.0, min: -1.0, max: 1.0},
        windowHeight: {type: 'number', default: -0.4, min: -1.0, max: 1.0},
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

uniform float xProportion;
uniform float zProportion;
uniform float yProportion;
uniform float windowWidth;
uniform float windowHeight;
uniform vec3 wallColor;
uniform vec3 windowColor;

varying vec3 pos;
varying float sunFactor;

void main() {
    float xx1 = step(windowWidth, sin(pos.x * 2.0 * PI / xProportion - PI / 2.0));
    float xx2 = step(0.8, sin(pos.z * 2.0 * PI / zProportion + PI / 2.0));

    float zz1 = step(windowWidth, sin(pos.z * 2.0 * PI / zProportion - PI / 2.0));
    float zz2 = step(0.8, sin(pos.x * 2.0 * PI / xProportion + PI / 2.0));

    float yy1 = step(windowHeight, sin(pos.y * 2.0 * PI / yProportion - 2.0));

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
                xProportion: {value: data.xProportion},
                zProportion: {value: data.zProportion},
                yProportion: {value: data.yProportion},
                windowWidth: {value: -data.windowWidth},
                windowHeight: {value: -data.windowHeight},
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
        this.material.uniforms.xProportion.value = data.xProportion;
        this.material.uniforms.zProportion.value = data.zProportion;
        this.material.uniforms.yProportion.value = data.yProportion;
        this.material.uniforms.windowWidth.value = -data.windowWidth;
        this.material.uniforms.windowHeight.value = -data.windowHeight;
        this.material.uniforms.wallColor.value.set(data.wallColor);
        this.material.uniforms.windowColor.value.set(data.windowColor);
        let sunPos = new THREE.Vector3(data.sunPosition.x, data.sunPosition.y, data.sunPosition.z);
        this.material.uniforms.sunNormal.value = sunPos.normalize();
    },
});
