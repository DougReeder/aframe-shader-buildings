
const float PI = 3.1415926535897932384626433832795;

uniform float elevation;
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

    float yy1 = step(windowHeight, sin((pos.y - elevation) * 2.0 * PI / yProportion - 2.0));

    vec3 inherentColor = mix(wallColor, windowColor, (xx1 * xx2 + zz1 * zz2) * yy1);

    gl_FragColor = vec4(inherentColor * sunFactor, 1.0);
}
