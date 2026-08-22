import React, { useEffect, useRef, useState } from 'react';
import { Renderer, Program, Mesh, Triangle } from 'ogl';
import performanceManager from '../../utils/performanceManager';

const vertex = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `#version 300 es
precision mediump float;

uniform vec2 iResolution;
uniform float iTime;
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
  float amplitude = 0.6;
  float frequency = 0.55;
  // 2 ultra-smooth low frequency octaves (completely noise-free fluid silk motion)
  for (int i = 0; i < 2; i++) {
    value += amplitude * snoise(p * frequency);
    frequency *= 1.8;
    amplitude *= 0.45;
  }
  return value;
}

void main() {
  vec2 p = (gl_FragCoord.xy * 2.0 - iResolution.xy) / min(iResolution.x, iResolution.y);
  
  float t = iTime * 0.05;

  // Ultra-smooth liquid golden silk waves (zero noise)
  vec2 q = vec2(fbm(p + vec2(t * 0.08, t * 0.05)),
                fbm(p + vec2(4.2, 2.1) + vec2(-t * 0.06, t * 0.07)));

  vec2 r = vec2(fbm(p + 1.8 * q + vec2(1.5, 8.2) + vec2(t * 0.04, -t * 0.03)),
                fbm(p + 1.8 * q + vec2(7.2, 3.4) + vec2(-t * 0.03, t * 0.05)));

  float f = fbm(p + 1.5 * r);

  // Haute Parfumerie liquid color synthesis
  vec3 col = mix(uColor3, uColor2, clamp(f * f * 2.2, 0.0, 1.0));
  col = mix(col, uColor1, clamp(length(q) * 0.65, 0.0, 1.0));
  col = mix(col, vec3(1.0, 0.92, 0.75), clamp(pow(max(0.0, r.x * r.y), 1.8) * 1.6, 0.0, 1.0));

  // 100% mathematically perfect circular alpha falloff to pure zero
  float dist = length(p);
  float edgeFade = smoothstep(0.95, 0.25, dist);
  
  col *= edgeFade;

  // Radiant gold glow
  float glow = pow(max(0.0, f), 1.8) * 0.55;
  col += vec3(1.0, 0.85, 0.4) * glow * edgeFade;

  fragColor = vec4(col, uOpacity * edgeFade);
}
`;

export default function LuxuryBackgroundShader({
  color1 = '#D4AF37', // Gold
  color2 = '#3A2116', // Dark Brown
  color3 = '#0B0A08', // Soft Black
  opacity = 0.65,
  className = ''
}) {
  const containerRef = useRef(null);
  const [useCssFallback, setUseCssFallback] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer, gl, animationFrameId;
    let isVisible = true;

    try {
      // Optimal sub-sampled DPR for mobile & desktop (ultralight GPU footprint)
      const dpr = performanceManager.isMobile ? 0.5 : 0.75;

      renderer = new Renderer({
        alpha: true,
        antialias: false,
        dpr: dpr,
        powerPreference: 'low-power'
      });
      gl = renderer.gl;

      if (!gl) {
        setUseCssFallback(true);
        return;
      }

      gl.clearColor(0, 0, 0, 0);
      container.appendChild(gl.canvas);
      gl.canvas.style.width = '100%';
      gl.canvas.style.height = '100%';
      gl.canvas.style.position = 'absolute';
      gl.canvas.style.inset = '0';
      gl.canvas.style.pointerEvents = 'none';

      const geometry = new Triangle(gl);

      const hexToVec3 = (hex) => {
        hex = hex.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16) / 255;
        const g = parseInt(hex.substring(2, 4), 16) / 255;
        const b = parseInt(hex.substring(4, 6), 16) / 255;
        return [r, g, b];
      };

      const program = new Program(gl, {
        vertex,
        fragment,
        uniforms: {
          iTime: { value: 0 },
          iResolution: { value: [gl.canvas.width, gl.canvas.height] },
          uColor1: { value: hexToVec3(color1) },
          uColor2: { value: hexToVec3(color2) },
          uColor3: { value: hexToVec3(color3) },
          uOpacity: { value: opacity }
        },
        transparent: true
      });

      const mesh = new Mesh(gl, { geometry, program });

      const resize = () => {
        if (!container || !renderer) return;
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || window.innerHeight;
        renderer.setSize(w, h);
        program.uniforms.iResolution.value = [gl.canvas.width, gl.canvas.height];
      };

      window.addEventListener('resize', resize, { passive: true });
      resize();

      // Intersection & visibility management
      const observer = new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting;
      }, { threshold: 0.01 });
      observer.observe(container);

      let lastTime = 0;
      const animate = (t) => {
        animationFrameId = requestAnimationFrame(animate);

        // Sleep when hidden or offscreen
        if (!isVisible || !performanceManager.isTabVisible) return;

        // Throttle to 30fps on mobile to preserve battery
        if (performanceManager.isMobile && t - lastTime < 32) return;
        lastTime = t;

        program.uniforms.iTime.value = t * 0.001;
        renderer.render({ scene: mesh });
      };

      animationFrameId = requestAnimationFrame(animate);

      return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('resize', resize);
        observer.disconnect();
        if (gl && gl.canvas && container.contains(gl.canvas)) {
          container.removeChild(gl.canvas);
        }
      };
    } catch (e) {
      console.warn('LuxuryBackgroundShader WebGL fallback:', e);
      setUseCssFallback(true);
    }
  }, [color1, color2, color3, opacity]);

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden pointer-events-none rounded-full ${className}`}
      aria-hidden="true"
    >
      {/* 100% Transparent CSS Radial Fallback (Zero cutoff lines) */}
      {useCssFallback && (
        <div
          className="absolute inset-0 w-full h-full pointer-events-none rounded-full"
          style={{
            background: `radial-gradient(circle at center, rgba(242, 214, 117, 0.45) 0%, rgba(184, 134, 11, 0.25) 45%, rgba(26, 16, 8, 0.0) 70%, transparent 100%)`,
            opacity: opacity
          }}
        />
      )}
    </div>
  );
}
