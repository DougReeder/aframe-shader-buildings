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
        const indexes = [];

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

            let yRoof = y + (buildings[i].ySections || 1) * data.yProportion;

            // console.log("xCoreSections:", xCoreSections, "   xWingSections:", xWingSections,
            //     "   xWingLength:", xWingLength, "   zCoreLength:", zCoreLength);

            positions.set([x, y, z], i*CPB + 0);
            positions.set([x + xWingLength, y, z], i*CPB + 3);
            positions.set([x + xWingLength, yRoof, z], i*CPB + 6);
            positions.set([x, yRoof, z], i*CPB + 9);
            normals.set([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1], i*CPB + 0);
            indexes.push(i*VPB + 0, i*VPB + 1, i*VPB + 2,   i*VPB + 2,  i*VPB + 3, i*VPB + 0);

            positions.set([x + xWingLength, y, z], i*CPB + 4*3);
            positions.set([x + xWingLength, y, z - zCoreLength], i*CPB + 5*3);
            positions.set([x + xWingLength, yRoof, z - zCoreLength], i*CPB + 6*3);
            positions.set([x + xWingLength, yRoof, z], i*CPB + 7*3);
            normals.set([1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0 ], i*CPB + 12);
            indexes.push(i*VPB + 4, i*VPB + 5, i*VPB + 6,   i*VPB + 6, i*VPB + 7, i*VPB + 4);

            positions.set([x + xWingLength, y, z - zCoreLength], i*CPB + 8*3);
            positions.set([x - xCoreLength, y, z - zCoreLength], i*CPB + 9*3);
            positions.set([x - xCoreLength, yRoof, z - zCoreLength], i*CPB + 10*3);
            positions.set([x + xWingLength, yRoof, z - zCoreLength], i*CPB + 11*3);
            normals.set([0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1], i*CPB + 24);
            indexes.push(i*VPB + 8, i*VPB + 9, i*VPB + 10,  i*VPB + 10, i*VPB + 11, i*VPB + 5);

            positions.set([x - xCoreLength, y, z - zCoreLength], i*CPB + 12*3);
            positions.set([x - xCoreLength, y, z + zWingLength], i*CPB + 13*3);
            positions.set([x - xCoreLength, yRoof, z + zWingLength], i*CPB + 14*3);
            positions.set([x - xCoreLength, yRoof, z - zCoreLength], i*CPB + 15*3);
            normals.set([-1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0], i*CPB + 36);
            indexes.push(i*VPB + 12, i*VPB + 13, i*VPB + 14,  i*VPB + 14, i*VPB + 15, i*VPB + 12);

            positions.set([x - xCoreLength, y, z + zWingLength], i*CPB + 16*3);
            positions.set([x, y, z + zWingLength], i*CPB + 17*3);
            positions.set([x, yRoof, z + zWingLength], i*CPB + 18*3);
            positions.set([x - xCoreLength, yRoof, z + zWingLength], i*CPB + 19*3);
            normals.set([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1], i*CPB + 48);
            indexes.push(i*VPB + 16, i*VPB + 17, i*VPB + 18,  i*VPB + 18, i*VPB + 19, i*VPB + 16);

            positions.set([x, y, z + zWingLength], i*CPB + 20*3);
            positions.set([x, y, z], i*CPB + 21*3);
            positions.set([x, yRoof, z], i*CPB + 22*3);
            positions.set([x, yRoof, z + zWingLength], i*CPB + 23*3);
            normals.set([1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0], i*CPB + 60);
            indexes.push(i*VPB + 20, i*VPB + 21, i*VPB + 22,  i*VPB + 22, i*VPB + 23, i*VPB + 20);

            // TODO: replace these faces with a separate roof using a different shader
            positions.set([x, yRoof, z], i*CPB + 24*3);
            positions.set([x + xWingLength, yRoof, z], i*CPB + 25*3);
            positions.set([x + xWingLength, yRoof, z - zCoreLength], i*CPB + 26*3);
            positions.set([x - xCoreLength, yRoof, z - zCoreLength], i*CPB + 27*3);
            positions.set([x - xCoreLength, yRoof, z + zWingLength], i*CPB + 28*3);
            positions.set([x, yRoof, z + zWingLength], i*CPB + 29*3);
            normals.set([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0], i*CPB + 72);
            indexes.push(i*VPB + 24, i*VPB + 25, i*VPB + 26,  i*VPB + 26, i*VPB + 27, i*VPB + 24,  i*VPB + 27, i*VPB + 28, i*VPB + 24,  i*VPB + 28, i*VPB + 29, i*VPB + 24);
        }

        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
        this.geometry.setIndex(indexes);

        this.geometry.computeBoundingBox();
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
        'wall-color': 'material.wallColor',
        'window-color': 'material.windowColor',
        'sun-position': 'material.sunPosition',
    }
});
