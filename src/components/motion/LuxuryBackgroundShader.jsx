import React, { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Triangle } from 'ogl';

const vertex = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `#version 300 es
precision highp float;

uniform vec2 iResolution;
uniform float iTime;
uniform vec2 uMouse;
uniform vec3 uColor1; // Sovereign Gold
uniform vec3 uColor2; // Warm Roasted Amber
uniform vec3 uColor3; // Dark Obsidian Base
uniform float uOpacity;

out vec4 fragColor;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187,
                      0.366025403784439,
                     -0.577350269189626,
                      0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
        + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 0.9;
  for (int i = 0; i < 4; i++) {
    value += amplitude * snoise(p * frequency);
    frequency *= 2.05;
    amplitude *= 0.48;
  }
  return value;
}

void main() {
  vec2 uv = gl_FragCoord.xy / iResolution.xy;
  vec2 p = (gl_FragCoord.xy * 2.0 - iResolution.xy) / min(iResolution.x, iResolution.y);
  
  float t = iTime * 0.09;

  // Domain warping for fluid golden silk waves
  vec2 q = vec2(fbm(p + vec2(t * 0.15, t * 0.1)),
                fbm(p + vec2(5.2, 1.3) + vec2(-t * 0.1, t * 0.12)));

  vec2 r = vec2(fbm(p + 3.0 * q + vec2(1.7, 9.2) + vec2(t * 0.08, -t * 0.06)),
                fbm(p + 3.0 * q + vec2(8.3, 2.8) + vec2(-t * 0.06, t * 0.09)));

  float f = fbm(p + 2.5 * r);

  // Haute Parfumerie color synthesis
  vec3 col = mix(uColor3, uColor2, clamp(f * f * 3.2, 0.0, 1.0));
  col = mix(col, uColor1, clamp(length(q) * 0.5, 0.0, 1.0));
  col = mix(col, vec3(1.0, 0.94, 0.82), clamp(pow(max(0.0, r.x * r.y), 2.2) * 1.8, 0.0, 1.0));

  // Soft atmospheric radial vignette
  float vig = 1.0 - length(uv - 0.5) * 0.65;
  col *= clamp(vig, 0.2, 1.0);

  // Ambient gold glow
  float glow = pow(max(0.0, f), 2.8) * 0.3;
  col += vec3(0.85, 0.68, 0.28) * glow;

  fragColor = vec4(col, uOpacity);
}
`;

export default function LuxuryBackgroundShader({
  color1 = '#D4AF37', // Gold
  color2 = '#3A2116', // Roasted Amber / Mahogany
  color3 = '#0B0A08', // Obsidian Dark
  opacity = 0.65,
  className = ''
}) {
  const containerRef = useRef(null);

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return [0.83, 0.69, 0.22];
    return [
      parseInt(result[1], 16) / 255,
      parseInt(result[2], 16) / 255,
      parseInt(result[3], 16) / 255
    ];
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer;
    let gl;
    try {
      renderer = new Renderer({
        alpha: true,
        premultipliedAlpha: false,
        powerPreference: 'high-performance',
        dpr: Math.min(window.devicePixelRatio || 1, 1.5)
      });
      gl = renderer.gl;
      container.appendChild(gl.canvas);
      gl.canvas.style.display = 'block';
      gl.canvas.style.width = '100%';
      gl.canvas.style.height = '100%';
      gl.canvas.style.pointerEvents = 'none';
    } catch (e) {
      console.warn('WebGL not supported for LuxuryBackgroundShader', e);
      return;
    }

    const geometry = new Triangle(gl);

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        iResolution: { value: [gl.canvas.width, gl.canvas.height] },
        iTime: { value: 0 },
        uMouse: { value: [0.5, 0.5] },
        uColor1: { value: hexToRgb(color1) },
        uColor2: { value: hexToRgb(color2) },
        uColor3: { value: hexToRgb(color3) },
        uOpacity: { value: opacity }
      },
      transparent: true
    });

    const mesh = new Mesh(gl, { geometry, program });

    let animationId;
    let isVisible = true;

    const resize = () => {
      if (!container || !renderer) return;
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;
      renderer.setSize(width, height);
      program.uniforms.iResolution.value = [gl.canvas.width, gl.canvas.height];
    };

    window.addEventListener('resize', resize);
    resize();

    // Intersection Observer to pause shader when offscreen
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    let startTime = performance.now();

    const update = (now) => {
      animationId = requestAnimationFrame(update);
      if (!isVisible) return;
      const elapsed = (now - startTime) * 0.001;
      program.uniforms.iTime.value = elapsed;
      renderer.render({ scene: mesh });
    };

    animationId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      observer.disconnect();
      if (gl.canvas && gl.canvas.parentNode) {
        gl.canvas.parentNode.removeChild(gl.canvas);
      }
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [color1, color2, color3, opacity]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      style={{ touchAction: 'pan-y' }}
      aria-hidden="true"
    />
  );
}
