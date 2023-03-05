
const float PI = 3.1415926535897932384626433832795;

uniform float elevation;
uniform float xProportion;
uniform float zProportion;
uniform float yProportion;
uniform float windowWidth;
uniform float windowHeight;
uniform bool useWallMap;
uniform sampler2D wallMap;
uniform float wallZoom;
uniform vec3 wallColor;
uniform bool useWindowCube;
uniform samplerCube windowCube;
uniform vec3 windowColor;

varying vec3 pos;
varying float sunFactor;
varying float vIntensityTweak;
// vIntensityTweak > 0: 1.0 is no change to wall color
// vIntensityTweak <= 0: 0.0 is black, 1.0 is white

varying vec3 vViewDirTangent;
varying vec2 vUv;

float min3 (vec3 v) {
    return min (min (v.x, v.y), v.z);
}

void main() {
    vec3 wallIdealColor = useWallMap ?
        texture2D(wallMap, vec2((pos.x+pos.z)/wallZoom, pos.y/wallZoom)).rgb :
        wallColor;

    vec3 wallTweakedColor = vIntensityTweak > 0.0 ?
        wallIdealColor * vec3(vIntensityTweak) :
        vec3(-vIntensityTweak);

    vec4 wallPixelColor = vec4(wallTweakedColor * sunFactor, 1.);


    vec2 uv = fract(vUv);
    vec3 sampleDir = normalize(vViewDirTangent);

    sampleDir *= vec3(-1., -1., 1.);
    vec3 viewInv = 1. / sampleDir;

    vec3 uvPos = vec3(uv * 2.0 - 1.0, -1.0);

    float fmin = min3(abs(viewInv) - viewInv * uvPos);
    sampleDir = sampleDir * fmin + uvPos;

    vec4 windowPixelColor = useWindowCube ? texture(windowCube, sampleDir) : vec4(windowColor, 1.);


    float xx1 = step(windowWidth, sin(pos.x * 2.0 * PI / xProportion - PI / 2.0));
    float xx2 = step(0.8, sin(pos.z * 2.0 * PI / zProportion + PI / 2.0));

    float zz1 = step(windowWidth, sin(pos.z * 2.0 * PI / zProportion - PI / 2.0));
    float zz2 = step(0.8, sin(pos.x * 2.0 * PI / xProportion + PI / 2.0));

    float yy1 = step(windowHeight, sin((pos.y - elevation) * 2.0 * PI / yProportion - 2.0));

    gl_FragColor = mix(wallPixelColor, windowPixelColor, (xx1 * xx2 + zz1 * zz2) * yy1);
}

// Interior cubemap shader code by Mosen Heydari
// https://github.com/mohsenheydari/three-interior-mapping
