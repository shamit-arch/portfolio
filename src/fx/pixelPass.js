import * as THREE from 'three';

/**
 * Renders the scene into a small render target, then upscales it with nearest filtering
 * through a shader that adds depth outlines, colour quantisation and ordered (Bayer) dithering.
 */
export class PixelPass {
  constructor(renderer) {
    this.renderer = renderer;
    this.target = new THREE.WebGLRenderTarget(1, 1, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      type: THREE.HalfFloatType,
      depthTexture: new THREE.DepthTexture(1, 1),
    });
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        tColor: { value: this.target.texture },
        tDepth: { value: this.target.depthTexture },
        uRes: { value: new THREE.Vector2(1, 1) },
        uNear: { value: 0.05 },
        uFar: { value: 20 },
        uLevels: { value: 7 },
        uOutline: { value: 1 },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
      fragmentShader: /* glsl */ `
        uniform sampler2D tColor, tDepth;
        uniform vec2 uRes;
        uniform float uNear, uFar, uLevels, uOutline;
        varying vec2 vUv;

        float lin(float d) {
          float z = d * 2.0 - 1.0;
          return (2.0 * uNear * uFar) / (uFar + uNear - z * (uFar - uNear));
        }
        float depthAt(vec2 uv) { return lin(texture2D(tDepth, uv).r); }
        float bayer(vec2 p) {
          int x = int(mod(p.x, 4.0));
          int y = int(mod(p.y, 4.0));
          mat4 m = mat4(0.0, 8.0, 2.0, 10.0, 12.0, 4.0, 14.0, 6.0, 3.0, 11.0, 1.0, 9.0, 15.0, 7.0, 13.0, 5.0);
          return m[x][y] / 16.0;
        }
        void main() {
          vec2 pix = floor(vUv * uRes);
          vec2 uv = (pix + 0.5) / uRes;
          vec2 t = 1.0 / uRes;
          vec3 c = texture2D(tColor, uv).rgb;

          // outline the near side of depth discontinuities
          float d = depthAt(uv);
          float e = 0.0;
          e += max(depthAt(uv + vec2(t.x, 0.0)) - d, 0.0);
          e += max(depthAt(uv - vec2(t.x, 0.0)) - d, 0.0);
          e += max(depthAt(uv + vec2(0.0, t.y)) - d, 0.0);
          e += max(depthAt(uv - vec2(0.0, t.y)) - d, 0.0);
          float edge = smoothstep(0.035, 0.06, e / max(d, 0.5)) * uOutline;
          c = mix(c, c * 0.35, edge);

          // linear -> sRGB, a touch more saturation
          c = pow(max(c, 0.0), vec3(1.0 / 2.2));
          float l = dot(c, vec3(0.299, 0.587, 0.114));
          c = mix(vec3(l), c, 1.18);

          // posterise with ordered dithering
          float b = bayer(pix) - 0.5;
          c = floor(c * uLevels + 0.5 + b * 0.9) / uLevels;

          // soft vignette
          vec2 q = vUv - 0.5;
          c *= 1.0 - dot(q, q) * 0.55;
          gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
        }`,
      depthTest: false,
      depthWrite: false,
    });
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material);
    this.quad.frustumCulled = false;
    this.quadScene = new THREE.Scene();
    this.quadScene.add(this.quad);
    this.quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  }

  /** density = how many low-res rows fill the screen height (higher = finer pixels). */
  setSize(w, h, density = this.density || 380) {
    this.density = density;
    this.size = [w, h];
    const pixel = Math.max(1, Math.round(h / density));
    const lw = Math.max(1, Math.floor(w / pixel));
    const lh = Math.max(1, Math.floor(h / pixel));
    this.target.setSize(lw, lh);
    this.material.uniforms.uRes.value.set(lw, lh);
    this.pixel = pixel;
  }

  render(scene, camera) {
    this.material.uniforms.uNear.value = camera.near;
    this.material.uniforms.uFar.value = camera.far;
    this.renderer.setRenderTarget(this.target);
    this.renderer.render(scene, camera);
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.quadScene, this.quadCam);
  }
}
