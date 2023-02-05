// buildingsShader.js - wraps a volumetric WebGL shader for A-Frame
// Copyright © 2019,2023 by P. Douglas Reeder under the MIT License

import vertexShader from './buildingsShaderVert.glsl'
import fragmentShader from './buildingsShaderFrag.glsl'

AFRAME.registerShader('buildings', {
    schema: {
        elevation: {type: 'number', default: 0},
        xProportion: {type: 'number', default: 5},
        zProportion: {type: 'number', default: 5},
        yProportion: {type: 'number', default: 4},
        windowWidth: {type: 'number', default: 0.0, min: -1.0, max: 1.0},
        windowHeight: {type: 'number', default: -0.4, min: -1.0, max: 1.0},
        wallMap: {type: 'map'},
        wallZoom: {type: 'number', default: 2.0, min: 0.001},
        wallColor: {type: 'color', default: '#909090'},   // off-white, like concrete
        windowColor: {type: 'color', default: '#181818'},   // dark gray, like tinted windows
        sunPosition: {type: 'vec3', default: {x:-1.0, y:1.0, z:-1.0}}
    },

    /**
     * `init` used to initialize material. Called once.
     */
    init: function (data) {
        // console.log("wallColor:", new THREE.Color(data.wallColor), "   windowColor:", new THREE.Color(data.windowColor));
        const sunPos = new THREE.Vector3(data.sunPosition.x, data.sunPosition.y, data.sunPosition.z);
        const uniforms = {
            elevation: {value: data.elevation},
            xProportion: {value: data.xProportion},
            zProportion: {value: data.zProportion},
            yProportion: {value: data.yProportion},
            windowWidth: {value: -data.windowWidth},
            windowHeight: {value: -data.windowHeight},
            useWallMap: {value: false},
            wallMap: {value: null},
            wallZoom: {value: data.wallZoom},
            wallColor: {value: new THREE.Color(data.wallColor)},
            windowColor: {value: new THREE.Color(data.windowColor)},
            sunNormal: {value: sunPos.normalize()}
        }

        this.material = new THREE.ShaderMaterial({
            uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader
        });
    },

    /**
     * `update` used to update the material. Called on initialization and when data updates.
     */
    update: function (data) {
        // console.log(`updating building material ${this.wallSrc} with ${data.wallSrc}`)
        this.material.uniforms.elevation.value = data.elevation;
        this.material.uniforms.xProportion.value = data.xProportion;
        this.material.uniforms.zProportion.value = data.zProportion;
        this.material.uniforms.yProportion.value = data.yProportion;
        this.material.uniforms.windowWidth.value = -data.windowWidth;
        this.material.uniforms.windowHeight.value = -data.windowHeight;
        // useWallMap isn't updated from data
        // wallMap must be asynchronously loaded
        this.material.uniforms.wallZoom.value = data.wallZoom
        this.material.uniforms.wallColor.value.set(data.wallColor);
        this.material.uniforms.windowColor.value.set(data.windowColor);
        let sunPos = new THREE.Vector3(data.sunPosition.x, data.sunPosition.y, data.sunPosition.z);
        this.material.uniforms.sunNormal.value = sunPos.normalize();

        if (data.wallSrc !== this.wallSrc) {
            this.loadTexture(data.wallSrc);
            this.wallSrc = data.wallSrc;
        }
    },

    loadTexture: function(wallSrc) {
        const imgEl = document.querySelector(wallSrc);
        if (imgEl?.currentSrc) {
            this.wallTexture = null;
            this.textureLoader = new THREE.TextureLoader();
            this.textureLoader.load(imgEl.currentSrc, texture => {
                this.material.uniforms.wallMap.value = this.wallTexture = texture;
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(2, 3);
                texture.magFilfer = THREE.LinearMipmapNearestFilter;
                texture.minFilfer = THREE.LinearMipmapNearestFilter;
                this.material.uniforms.useWallMap.value = true;
            });
        }
    }
});
