
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
uniform vec3 windowColor;

varying vec3 pos;
varying float sunFactor;
varying float vIntensityTweak;
// vIntensityTweak > 0: 1.0 is no change to wall color
// vIntensityTweak <= 0: 0.0 is black, 1.0 is white

void main() {
    float xx1 = step(windowWidth, sin(pos.x * 2.0 * PI / xProportion - PI / 2.0));
    float xx2 = step(0.8, sin(pos.z * 2.0 * PI / zProportion + PI / 2.0));

    float zz1 = step(windowWidth, sin(pos.z * 2.0 * PI / zProportion - PI / 2.0));
    float zz2 = step(0.8, sin(pos.x * 2.0 * PI / xProportion + PI / 2.0));

    float yy1 = step(windowHeight, sin((pos.y - elevation) * 2.0 * PI / yProportion - 2.0));

    vec3 wallPixelColor = useWallMap ?
        texture2D(wallMap, vec2((pos.x+pos.z)/wallZoom, pos.y/wallZoom)).rgb :
        wallColor;
    vec3 inherentColor = vIntensityTweak > 0.0 ?
        mix(wallPixelColor, windowColor, (xx1 * xx2 + zz1 * zz2) * yy1) :
        vec3(-1.0);  // will be multiplied by negative vIntensityTweak
    vec3 tweakedColor = inherentColor * vec3(vIntensityTweak);

    gl_FragColor = vec4(tweakedColor * sunFactor, 1.0);
}
