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
        wallSrc: {type: 'selector'},
        wallZoom: {type: 'number', default: 2.0, min: 0.001},
        wallColor: {type: 'color', default: '#909090'},   // off-white, like concrete
        px: {type: 'selector'},
        nx: {type: 'selector'},
        py: {type: 'selector'},
        ny: {type: 'selector'},
        // positive Z is never used - it's the window side of the cube
        nz: {type: 'selector'},
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
            useWindowCube: {value: false},
            windowCube: {value: null},
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
        // useWindowCube isn't updated from data
        // windowCube must be asynchronously loaded
        this.material.uniforms.windowColor.value.set(data.windowColor);
        let sunPos = new THREE.Vector3(data.sunPosition.x, data.sunPosition.y, data.sunPosition.z);
        this.material.uniforms.sunNormal.value = sunPos.normalize();

        if (data.wallSrc !== this.wallSrc) {
            this.loadTexture(data.wallSrc);
            this.wallSrc = data.wallSrc;
        }
        if (data.px !== this.px || data.nx !== this.nx || data.py !== this.py || data.nz !== this.nz) {
            this.loadCubeTexture(data.px, data.nx, data.py, data.ny, data.nz)
            this.px = data.px;
            this.nx = data.nx;
            this.py = data.py;
            this.ny = data.ny;
            this.nz = data.nz;
        }
    },

    loadTexture: function(wallSrc) {
        if (wallSrc?.currentSrc) {
            this.wallTexture = null;
            this.textureLoader = new THREE.TextureLoader();
            this.textureLoader.load(wallSrc.currentSrc, texture => {
                this.material.uniforms.wallMap.value = this.wallTexture = texture;
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(2, 3);
                texture.magFilfer = THREE.LinearMipmapNearestFilter;
                texture.minFilfer = THREE.LinearMipmapNearestFilter;
                this.material.uniforms.useWallMap.value = true;
            });
        }
    },

    loadCubeTexture: function (px, nx, py, ny, nz) {
        if (px?.currentSrc) {   // What should be done if some have values and some don't?
            this.windowTexture = null;
            this.cubeLoader = new THREE.CubeTextureLoader();
            const cubeMap = this.cubeLoader.load([
                px?.currentSrc, nx?.currentSrc,
                py?.currentSrc, ny?.currentSrc,
                nz?.currentSrc, nz?.currentSrc   // uses nz for pz
            ], texture => {
                this.material.uniforms.windowCube.value = this.windowTexture = texture;
                texture.encoding = THREE.sRGBEncoding
                this.material.uniforms.useWindowCube.value = true;
                console.log("cube texture:", texture)
            });
        }
    },
});
