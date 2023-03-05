// index.js - boxy buildings using a fast shader for A-Frame WebXR
// Copyright © 2019,2023 by P. Douglas Reeder under the MIT License

import buildingsShader from './buildingsShader';

AFRAME.registerGeometry('ell', {
    schema: {
        elevation: {type: 'number', default: 0},
        xProportion: {type: 'number', default: 5, min: 1},
        zProportion: {type: 'number', default: 5, min: 1},
        yProportion: {type: 'number', default: 4, min: 2},
        // JSON array of objects with fields x, z, y, xCoreSections, xWingSections, zSections, zWingSections, ySections
        buildings: {type: 'string', default: '[{}]'}
    },
    init: function (data) {
        // console.log("xProportion:", data.xProportion, "   zProportion:", data.zProportion);
        // console.log("typeof data.buildings:", typeof data.buildings, "   data.buildings:", data.buildings);
        const buildings = JSON.parse(data.buildings);
        const VPB = 6 * 4 + 6;   // vertexes per building
        const CPB = VPB * 3;   // coordinates per building
        const positions = new Float32Array(buildings.length * CPB);
        const normals = new Float32Array(buildings.length * CPB);
        const UVCPB = VPB * 2;
        const uvs = new Float32Array(buildings.length * UVCPB);
        const indexes = [];
        const intensityTweak = new Float32Array(buildings.length * VPB);

        for (let i=0; i< buildings.length; ++i) {
            // console.log("buildings["+i+"]:", buildings[i]);

            let x = buildings[i].x || 0;
            let z = buildings[i].z || 0;
            let y = data.elevation + (buildings[i].y || 0);

            let xCoreSections = Math.max(buildings[i].xCoreSections || 2, 1);
            let xWingSections = Math.max(buildings[i].xWingSections || 0, 0);

            let zCoreSections = Math.max(buildings[i].zCoreSections || 2, 1);
            let zWingSections = Math.max(buildings[i].zWingSections || 0, 0);

            let xCoreLength = xCoreSections * data.xProportion;
            let xWingLength = xWingSections * data.xProportion;
            let zCoreLength = zCoreSections * data.zProportion;
            let zWingLength = zWingSections * data.zProportion;

            const ySections = buildings[i].ySections || 1;
            let yRoof = y + (ySections) * data.yProportion;

            // console.log("xCoreSections:", xCoreSections, "   xWingSections:", xWingSections,
            //     "   xWingLength:", xWingLength, "   zCoreLength:", zCoreLength);

            positions.set([x, y, z], i*CPB + 0);
            positions.set([x + xWingLength, y, z], i*CPB + 3);
            positions.set([x + xWingLength, yRoof, z], i*CPB + 6);
            positions.set([x, yRoof, z], i*CPB + 9);
            normals.set([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1], i*CPB + 0);
            uvs.set([0, 0,  xWingSections, 0,  xWingSections, ySections,  0, ySections], i*UVCPB + 0*8);
            indexes.push(i*VPB + 0, i*VPB + 1, i*VPB + 2,   i*VPB + 2,  i*VPB + 3, i*VPB + 0);

            positions.set([x + xWingLength, y, z], i*CPB + 4*3);
            positions.set([x + xWingLength, y, z - zCoreLength], i*CPB + 5*3);
            positions.set([x + xWingLength, yRoof, z - zCoreLength], i*CPB + 6*3);
            positions.set([x + xWingLength, yRoof, z], i*CPB + 7*3);
            normals.set([1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0 ], i*CPB + 12);
            uvs.set([0, 0,  zCoreSections, 0,  zCoreSections, ySections,  0, ySections], i*UVCPB + 1*8);
            indexes.push(i*VPB + 4, i*VPB + 5, i*VPB + 6,   i*VPB + 6, i*VPB + 7, i*VPB + 4);

            positions.set([x + xWingLength, y, z - zCoreLength], i*CPB + 8*3);
            positions.set([x - xCoreLength, y, z - zCoreLength], i*CPB + 9*3);
            positions.set([x - xCoreLength, yRoof, z - zCoreLength], i*CPB + 10*3);
            positions.set([x + xWingLength, yRoof, z - zCoreLength], i*CPB + 11*3);
            normals.set([0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1], i*CPB + 24);
            uvs.set([0, 0,  xCoreSections+xWingSections, 0,  xCoreSections+xWingSections, ySections,  0, ySections], i*UVCPB + 2*8);
            indexes.push(i*VPB + 8, i*VPB + 9, i*VPB + 10,  i*VPB + 10, i*VPB + 11, i*VPB + 8);

            positions.set([x - xCoreLength, y, z - zCoreLength], i*CPB + 12*3);
            positions.set([x - xCoreLength, y, z + zWingLength], i*CPB + 13*3);
            positions.set([x - xCoreLength, yRoof, z + zWingLength], i*CPB + 14*3);
            positions.set([x - xCoreLength, yRoof, z - zCoreLength], i*CPB + 15*3);
            normals.set([-1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0], i*CPB + 36);
            uvs.set([0, 0,  zCoreSections+zWingSections, 0,  zCoreSections+zWingSections, ySections,  0, ySections], i*UVCPB + 3*8);
            indexes.push(i*VPB + 12, i*VPB + 13, i*VPB + 14,  i*VPB + 14, i*VPB + 15, i*VPB + 12);

            positions.set([x - xCoreLength, y, z + zWingLength], i*CPB + 16*3);
            positions.set([x, y, z + zWingLength], i*CPB + 17*3);
            positions.set([x, yRoof, z + zWingLength], i*CPB + 18*3);
            positions.set([x - xCoreLength, yRoof, z + zWingLength], i*CPB + 19*3);
            normals.set([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1], i*CPB + 48);
            uvs.set([0, 0,  xCoreSections, 0,  xCoreSections, ySections,  0, ySections], i*UVCPB + 4*8);
            indexes.push(i*VPB + 16, i*VPB + 17, i*VPB + 18,  i*VPB + 18, i*VPB + 19, i*VPB + 16);

            positions.set([x, y, z + zWingLength], i*CPB + 20*3);
            positions.set([x, y, z], i*CPB + 21*3);
            positions.set([x, yRoof, z], i*CPB + 22*3);
            positions.set([x, yRoof, z + zWingLength], i*CPB + 23*3);
            normals.set([1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0], i*CPB + 60);
            uvs.set([0, 0,  zWingSections, 0,  zWingSections, ySections,  0, ySections], i*UVCPB + 5*8);
            indexes.push(i*VPB + 20, i*VPB + 21, i*VPB + 22,  i*VPB + 22, i*VPB + 23, i*VPB + 20);

            const buildingIntensityChange = 0.50 + Math.random()/2;
            for (let v = i * VPB; v < i * VPB + 6 * 4; ++v) {
                intensityTweak[v] = buildingIntensityChange + Math.random()/2;
            }
            if (0 === zWingSections) {   // ensures there's no visible seam
                intensityTweak[i * VPB + 17] = intensityTweak[i * VPB];
                intensityTweak[i * VPB + 18] = intensityTweak[i * VPB + 3];
            }
            if (0 === xWingSections) {   // ensures there's no visible seam
                intensityTweak[i * VPB + 21] = intensityTweak[i * VPB + 4];
                intensityTweak[i * VPB + 22] = intensityTweak[i * VPB + 7];
            }

            // roof
            positions.set([x, yRoof, z], i*CPB + 24*3);
            positions.set([x + xWingLength, yRoof, z], i*CPB + 25*3);
            positions.set([x + xWingLength, yRoof, z - zCoreLength], i*CPB + 26*3);
            positions.set([x - xCoreLength, yRoof, z - zCoreLength], i*CPB + 27*3);
            positions.set([x - xCoreLength, yRoof, z + zWingLength], i*CPB + 28*3);
            positions.set([x, yRoof, z + zWingLength], i*CPB + 29*3);
            normals.set([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0], i*CPB + 72);
            uvs.set([0.5, 0.5,  1, 0.5,  1, 1,  0, 1,  0, 0,  0.5, 0], i*UVCPB + 6*8);
            indexes.push(i*VPB + 24, i*VPB + 25, i*VPB + 26,  i*VPB + 26, i*VPB + 27, i*VPB + 24,  i*VPB + 27, i*VPB + 28, i*VPB + 24,  i*VPB + 28, i*VPB + 29, i*VPB + 24);

            const minRoofIntensity = Math.random()/3;
            for (let v = i * VPB + 6 * 4; v < (i+1) * VPB; ++v) {
                intensityTweak[v] = -(minRoofIntensity + Math.random()/8);
            }
        }

        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
        this.geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
        this.geometry.setIndex(indexes);
        this.geometry.setAttribute('intensityTweak', new THREE.BufferAttribute(intensityTweak, 1));

        this.geometry.computeBoundingBox();
        this.geometry.computeTangents();
    }
});



AFRAME.registerPrimitive('a-shader-buildings', {
    defaultComponents: {
        geometry: {
            primitive: 'ell',
            buildings: []
        },
        material: {
            shader: 'buildings',
        }
    },

    mappings: {
        'elevation-geometry': 'geometry.elevation',
        'x-proportion-geometry': 'geometry.xProportion',
        'z-proportion-geometry': 'geometry.zProportion',
        'y-proportion-geometry': 'geometry.yProportion',
        'buildings': 'geometry.buildings',

        'elevation-material': 'material.elevation',
        'x-proportion-material': 'material.xProportion',
        'z-proportion-material': 'material.zProportion',
        'y-proportion-material': 'material.yProportion',
        'window-width': 'material.windowWidth',
        'window-height': 'material.windowHeight',
        'wall-src': 'material.wallSrc',
        'wall-zoom': 'material.wallZoom',
        'wall-color': 'material.wallColor',
        'equirectangular': 'material.equirectangular',
        'px': 'material.px',
        'nx': 'material.nx',
        'py': 'material.py',
        'ny': 'material.ny',
        'nz': 'material.nz',
        'window-color': 'material.windowColor',
        'sun-position': 'material.sunPosition',
    }
});
