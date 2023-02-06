
uniform vec3 sunNormal;

attribute float intensityTweak;

varying vec3 pos;
varying float sunFactor;
varying float vIntensityTweak;

void main() {
  pos = position;

  sunFactor = 0.5 + max(dot(normal, sunNormal), 0.0);

  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

  vIntensityTweak = intensityTweak;
}
