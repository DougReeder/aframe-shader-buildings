(()=>{var e={227:e=>{e.exports="\nconst float PI = 3.1415926535897932384626433832795;\n\nuniform float elevation;\nuniform float xProportion;\nuniform float zProportion;\nuniform float yProportion;\nuniform float windowWidth;\nuniform float windowHeight;\nuniform bool useWallMap;\nuniform sampler2D wallMap;\nuniform float wallZoom;\nuniform vec3 wallColor;\nuniform bool useWindowCube;\nuniform samplerCube windowCube;\nuniform vec3 windowColor;\n\nvarying vec3 pos;\nvarying float sunFactor;\nvarying float vIntensityTweak;\n// vIntensityTweak > 0: 1.0 is no change to wall color\n// vIntensityTweak <= 0: 0.0 is black, 1.0 is white\n\nvarying vec3 vViewDirTangent;\nvarying vec2 vUv;\n\nfloat min3 (vec3 v) {\n    return min (min (v.x, v.y), v.z);\n}\n\nvoid main() {\n    vec3 wallIdealColor = useWallMap ?\n        texture2D(wallMap, vec2((pos.x+pos.z)/wallZoom, pos.y/wallZoom)).rgb :\n        wallColor;\n\n    vec3 wallTweakedColor = vIntensityTweak > 0.0 ?\n        wallIdealColor * vec3(vIntensityTweak) :\n        vec3(-vIntensityTweak);\n\n    vec4 wallPixelColor = vec4(wallTweakedColor * sunFactor, 1.);\n\n\n    vec2 uv = fract(vUv);\n    vec3 sampleDir = normalize(vViewDirTangent);\n\n    sampleDir *= vec3(-1., -1., 1.);\n    vec3 viewInv = 1. / sampleDir;\n\n    vec3 uvPos = vec3(uv * 2.0 - 1.0, -1.0);\n\n    float fmin = min3(abs(viewInv) - viewInv * uvPos);\n    sampleDir = sampleDir * fmin + uvPos;\n\n    vec4 windowPixelColor = useWindowCube ? texture(windowCube, sampleDir) : vec4(windowColor, 1.);\n\n\n    float xx1 = step(windowWidth, sin(pos.x * 2.0 * PI / xProportion - PI / 2.0));\n    float xx2 = step(0.8, sin(pos.z * 2.0 * PI / zProportion + PI / 2.0));\n\n    float zz1 = step(windowWidth, sin(pos.z * 2.0 * PI / zProportion - PI / 2.0));\n    float zz2 = step(0.8, sin(pos.x * 2.0 * PI / xProportion + PI / 2.0));\n\n    float yy1 = step(windowHeight, sin((pos.y - elevation) * 2.0 * PI / yProportion - 2.0));\n\n    gl_FragColor = mix(wallPixelColor, windowPixelColor, (xx1 * xx2 + zz1 * zz2) * yy1);\n}\n\n// Interior cubemap shader code by Mosen Heydari\n// https://github.com/mohsenheydari/three-interior-mapping\n"},106:e=>{e.exports="\nuniform vec3 sunNormal;\n\nattribute vec4 tangent;\nattribute float intensityTweak;\n\nvarying vec3 pos;\nvarying vec3 vViewDirTangent;\nvarying vec2 vUv;\nvarying float sunFactor;\nvarying float vIntensityTweak;\n\nvoid main() {\n  pos = position;\n\n  sunFactor = 0.5 + max(dot(normal, sunNormal), 0.0);\n\n  vUv = uv;\n  vec3 vNormal = normalMatrix * normal;\n  vec3 vTangent = normalMatrix * tangent.xyz;\n  vec3 vBitangent = normalize( cross(vNormal, vTangent) * tangent.w);\n\n  mat3 mTBN = transpose(mat3(vTangent, vBitangent, vNormal));\n\n  vec4 cameraSpacePosition = modelViewMatrix * vec4(position, 1.0);\n  vec3 viewDir = -cameraSpacePosition.xyz;\n  vViewDirTangent = mTBN * viewDir;\n\n  gl_Position = projectionMatrix * cameraSpacePosition;\n\n  vIntensityTweak = intensityTweak;\n}\n\n// Interior cubemap code by Mosen Heydari\n// https://github.com/mohsenheydari/three-interior-mapping\n"}},t={};function n(o){var r=t[o];if(void 0!==r)return r.exports;var i=t[o]={exports:{}};return e[o](i,i.exports,n),i.exports}n.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return n.d(t,{a:t}),t},n.d=(e,t)=>{for(var o in t)n.o(t,o)&&!n.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})},n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),(()=>{"use strict";var e=n(106),t=n.n(e),o=n(227),r=n.n(o);AFRAME.registerShader("buildings",{schema:{elevation:{type:"number",default:0},xProportion:{type:"number",default:5},zProportion:{type:"number",default:5},yProportion:{type:"number",default:4},windowWidth:{type:"number",default:0,min:-1,max:1},windowHeight:{type:"number",default:-.4,min:-1,max:1},wallSrc:{type:"selector"},wallZoom:{type:"number",default:2,min:.001},wallColor:{type:"color",default:"#909090"},equirectangular:{type:"selector"},px:{type:"selector"},nx:{type:"selector"},py:{type:"selector"},ny:{type:"selector"},nz:{type:"selector"},windowColor:{type:"color",default:"#181818"},sunPosition:{type:"vec3",default:{x:-1,y:1,z:-1}}},init:function(e){const n=new THREE.Vector3(e.sunPosition.x,e.sunPosition.y,e.sunPosition.z),o={elevation:{value:e.elevation},xProportion:{value:e.xProportion},zProportion:{value:e.zProportion},yProportion:{value:e.yProportion},windowWidth:{value:-e.windowWidth},windowHeight:{value:-e.windowHeight},useWallMap:{value:!1},wallMap:{value:null},wallZoom:{value:e.wallZoom},wallColor:{value:new THREE.Color(e.wallColor)},useWindowCube:{value:!1},windowCube:{value:null},windowColor:{value:new THREE.Color(e.windowColor)},sunNormal:{value:n.normalize()}};this.material=new THREE.ShaderMaterial({uniforms:o,vertexShader:t(),fragmentShader:r()})},update:function(e){this.material.uniforms.elevation.value=e.elevation,this.material.uniforms.xProportion.value=e.xProportion,this.material.uniforms.zProportion.value=e.zProportion,this.material.uniforms.yProportion.value=e.yProportion,this.material.uniforms.windowWidth.value=-e.windowWidth,this.material.uniforms.windowHeight.value=-e.windowHeight,this.material.uniforms.wallZoom.value=e.wallZoom,this.material.uniforms.wallColor.value.set(e.wallColor),this.material.uniforms.windowColor.value.set(e.windowColor);let t=new THREE.Vector3(e.sunPosition.x,e.sunPosition.y,e.sunPosition.z);this.material.uniforms.sunNormal.value=t.normalize(),e.wallSrc!==this.wallSrc&&(this.loadTexture(e.wallSrc),this.wallSrc=e.wallSrc),e.equirectangular&&e.equirectangular!==this.equirectangular?(this.loadEquirectangular(e.equirectangular),this.equirectangular=e.equirectangular):e.px===this.px&&e.nx===this.nx&&e.py===this.py&&e.nz===this.nz||(this.loadCubeTexture(e.px,e.nx,e.py,e.ny,e.nz),this.px=e.px,this.nx=e.nx,this.py=e.py,this.ny=e.ny,this.nz=e.nz)},loadTexture:function(e){e?.currentSrc&&(new THREE.TextureLoader).load(e.currentSrc,(e=>{this.material.uniforms.wallMap.value=e,e.wrapS=THREE.RepeatWrapping,e.wrapT=THREE.RepeatWrapping,e.repeat.set(2,3),e.magFilfer=THREE.LinearMipmapNearestFilter,e.minFilfer=THREE.LinearMipmapNearestFilter,this.material.uniforms.useWallMap.value=!0}))},loadEquirectangular:function(e){e.currentSrc&&(new THREE.TextureLoader).load(e.currentSrc,(e=>{e.mapping=THREE.EquirectangularReflectionMapping,e.encoding=THREE.sRGBEncoding;const t=new THREE.WebGLCubeRenderTarget(e.source.data.height,{}).fromEquirectangularTexture(AFRAME.scenes[0].renderer,e);this.material.uniforms.windowCube.value=t.texture,this.material.uniforms.useWindowCube.value=!0,console.log("cube texture from equirect:",e)}))},loadCubeTexture:function(e,t,n,o,r){e?.currentSrc&&(this.windowTexture=null,(new THREE.CubeTextureLoader).load([e?.currentSrc,t?.currentSrc,n?.currentSrc,o?.currentSrc,r?.currentSrc,r?.currentSrc],(e=>{this.material.uniforms.windowCube.value=this.windowTexture=e,e.encoding=THREE.sRGBEncoding,this.material.uniforms.useWindowCube.value=!0,console.log("cube texture:",e)})))}}),AFRAME.registerGeometry("ell",{schema:{elevation:{type:"number",default:0},xProportion:{type:"number",default:5,min:1},zProportion:{type:"number",default:5,min:1},yProportion:{type:"number",default:4,min:2},buildings:{type:"string",default:"[{}]"}},init:function(e){const t=JSON.parse(e.buildings),n=30,o=90,r=new Float32Array(t.length*o),i=new Float32Array(t.length*o),a=60,l=new Float32Array(t.length*a),s=[],u=new Float32Array(t.length*n);for(let m=0;m<t.length;++m){let p=t[m].x||0,w=t[m].z||0,c=e.elevation+(t[m].y||0),v=Math.max(t[m].xCoreSections||2,1),d=Math.max(t[m].xWingSections||0,0),y=Math.max(t[m].zCoreSections||2,1),g=Math.max(t[m].zWingSections||0,0),h=v*e.xProportion,f=d*e.xProportion,x=y*e.zProportion,P=g*e.zProportion;const b=t[m].ySections||1;let T=c+b*e.yProportion;r.set([p,c,w],m*o+0),r.set([p+f,c,w],m*o+3),r.set([p+f,T,w],m*o+6),r.set([p,T,w],m*o+9),i.set([0,0,1,0,0,1,0,0,1,0,0,1],m*o+0),l.set([0,0,d,0,d,b,0,b],m*a+0),s.push(m*n+0,m*n+1,m*n+2,m*n+2,m*n+3,m*n+0),r.set([p+f,c,w],m*o+12),r.set([p+f,c,w-x],m*o+15),r.set([p+f,T,w-x],m*o+18),r.set([p+f,T,w],m*o+21),i.set([1,0,0,1,0,0,1,0,0,1,0,0],m*o+12),l.set([0,0,y,0,y,b,0,b],m*a+8),s.push(m*n+4,m*n+5,m*n+6,m*n+6,m*n+7,m*n+4),r.set([p+f,c,w-x],m*o+24),r.set([p-h,c,w-x],m*o+27),r.set([p-h,T,w-x],m*o+30),r.set([p+f,T,w-x],m*o+33),i.set([0,0,-1,0,0,-1,0,0,-1,0,0,-1],m*o+24),l.set([0,0,v+d,0,v+d,b,0,b],m*a+16),s.push(m*n+8,m*n+9,m*n+10,m*n+10,m*n+11,m*n+8),r.set([p-h,c,w-x],m*o+36),r.set([p-h,c,w+P],m*o+39),r.set([p-h,T,w+P],m*o+42),r.set([p-h,T,w-x],m*o+45),i.set([-1,0,0,-1,0,0,-1,0,0,-1,0,0],m*o+36),l.set([0,0,y+g,0,y+g,b,0,b],m*a+24),s.push(m*n+12,m*n+13,m*n+14,m*n+14,m*n+15,m*n+12),r.set([p-h,c,w+P],m*o+48),r.set([p,c,w+P],m*o+51),r.set([p,T,w+P],m*o+54),r.set([p-h,T,w+P],m*o+57),i.set([0,0,1,0,0,1,0,0,1,0,0,1],m*o+48),l.set([0,0,v,0,v,b,0,b],m*a+32),s.push(m*n+16,m*n+17,m*n+18,m*n+18,m*n+19,m*n+16),r.set([p,c,w+P],m*o+60),r.set([p,c,w],m*o+63),r.set([p,T,w],m*o+66),r.set([p,T,w+P],m*o+69),i.set([1,0,0,1,0,0,1,0,0,1,0,0],m*o+60),l.set([0,0,g,0,g,b,0,b],m*a+40),s.push(m*n+20,m*n+21,m*n+22,m*n+22,m*n+23,m*n+20);const E=.5+Math.random()/2;for(let e=m*n;e<m*n+24;++e)u[e]=E+Math.random()/2;0===g&&(u[m*n+17]=u[m*n],u[m*n+18]=u[m*n+3]),0===d&&(u[m*n+21]=u[m*n+4],u[m*n+22]=u[m*n+7]),r.set([p,T,w],m*o+72),r.set([p+f,T,w],m*o+75),r.set([p+f,T,w-x],m*o+78),r.set([p-h,T,w-x],m*o+81),r.set([p-h,T,w+P],m*o+84),r.set([p,T,w+P],m*o+87),i.set([0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0],m*o+72),l.set([.5,.5,1,.5,1,1,0,1,0,0,.5,0],m*a+48),s.push(m*n+24,m*n+25,m*n+26,m*n+26,m*n+27,m*n+24,m*n+27,m*n+28,m*n+24,m*n+28,m*n+29,m*n+24);const z=Math.random()/3;for(let e=m*n+24;e<(m+1)*n;++e)u[e]=-(z+Math.random()/8)}this.geometry=new THREE.BufferGeometry,this.geometry.setAttribute("position",new THREE.BufferAttribute(r,3)),this.geometry.setAttribute("normal",new THREE.BufferAttribute(i,3)),this.geometry.setAttribute("uv",new THREE.BufferAttribute(l,2)),this.geometry.setIndex(s),this.geometry.setAttribute("intensityTweak",new THREE.BufferAttribute(u,1)),this.geometry.computeBoundingBox(),this.geometry.computeTangents()}}),AFRAME.registerPrimitive("a-shader-buildings",{defaultComponents:{geometry:{primitive:"ell",buildings:[]},material:{shader:"buildings"}},mappings:{"elevation-geometry":"geometry.elevation","x-proportion-geometry":"geometry.xProportion","z-proportion-geometry":"geometry.zProportion","y-proportion-geometry":"geometry.yProportion",buildings:"geometry.buildings","elevation-material":"material.elevation","x-proportion-material":"material.xProportion","z-proportion-material":"material.zProportion","y-proportion-material":"material.yProportion","window-width":"material.windowWidth","window-height":"material.windowHeight","wall-src":"material.wallSrc","wall-zoom":"material.wallZoom","wall-color":"material.wallColor",equirectangular:"material.equirectangular",px:"material.px",nx:"material.nx",py:"material.py",ny:"material.ny",nz:"material.nz","window-color":"material.windowColor","sun-position":"material.sunPosition"}})})()})();