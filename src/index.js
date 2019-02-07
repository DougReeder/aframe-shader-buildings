// index.js - boxy buildings using a fast shader for A-Frame WebXR
// Copyright © 2019 by P. Douglas Reeder under the MIT License

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
        let buildings = JSON.parse(data.buildings);
        var geometry = new THREE.Geometry();

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

            geometry.vertices.push(new THREE.Vector3(x, y, z));
            geometry.vertices.push(new THREE.Vector3(x + xWingLength, y, z));
            geometry.vertices.push(new THREE.Vector3(x + xWingLength, y, z - zCoreLength));
            geometry.vertices.push(new THREE.Vector3(x - xCoreLength, y, z - zCoreLength));
            geometry.vertices.push(new THREE.Vector3(x - xCoreLength, y, z + zWingLength));
            geometry.vertices.push(new THREE.Vector3(x, y, z + zWingLength));
            geometry.vertices.push(new THREE.Vector3(x, yRoof, z));
            geometry.vertices.push(new THREE.Vector3(x + xWingLength, yRoof, z));
            geometry.vertices.push(new THREE.Vector3(x + xWingLength, yRoof, z - zCoreLength));
            geometry.vertices.push(new THREE.Vector3(x - xCoreLength, yRoof, z - zCoreLength));
            geometry.vertices.push(new THREE.Vector3(x - xCoreLength, yRoof, z + zWingLength));
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
