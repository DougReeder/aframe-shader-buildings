
uniform vec3 sunNormal;

attribute vec4 tangent;
attribute float intensityTweak;

varying vec3 pos;
varying vec3 vViewDirTangent;
varying vec2 vUv;
varying float sunFactor;
varying float vIntensityTweak;

void main() {
  pos = position;

  sunFactor = 0.5 + max(dot(normal, sunNormal), 0.0);

  vUv = uv;
  vec3 vNormal = normalMatrix * normal;
  vec3 vTangent = normalMatrix * tangent.xyz;
  vec3 vBitangent = normalize( cross(vNormal, vTangent) * tangent.w);

  mat3 mTBN = transpose(mat3(vTangent, vBitangent, vNormal));

  vec4 cameraSpacePosition = modelViewMatrix * vec4(position, 1.0);
  vec3 viewDir = -cameraSpacePosition.xyz;
  vViewDirTangent = mTBN * viewDir;

  gl_Position = projectionMatrix * cameraSpacePosition;

  vIntensityTweak = intensityTweak;
}

// Interior cubemap code by Mosen Heydari
// https://github.com/mohsenheydari/three-interior-mapping
