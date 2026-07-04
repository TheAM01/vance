'use client'

import { useEffect, useRef } from 'react'

/**
 * "Halo" preset recreated in raw WebGL (no react-three-fiber, so it runs under
 * Next + Turbopack): a glowing teal orb with an amber halo rim over deep
 * charcoal-teal, using the Vance brand colors. Renders nothing (solid fallback
 * behind shows) if WebGL is unavailable.
 */
const VERT = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`

const FRAG = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.0 + 17.3;
    a *= 0.5;
  }
  return v;
}
void main() {
  vec2 c = (gl_FragCoord.xy - 0.5 * u_res) / max(u_res.y, 1.0);
  float t = u_time * 0.12;
  float d = length(c);

  // organic distortion of the halo edge
  float n = fbm(c * 1.8 + vec2(t * 0.4, -t * 0.25));
  float dd = d + (n - 0.5) * 0.14;

  vec3 dark  = vec3(0.031, 0.078, 0.094);
  vec3 teal  = vec3(0.129, 0.369, 0.380);
  vec3 amber = vec3(1.000, 0.620, 0.125);

  float body = smoothstep(0.66, 0.12, dd);          // soft orb body
  float rim  = exp(-pow((dd - 0.52) * 7.0, 2.0));    // bright halo ring
  float glow = exp(-dd * 1.7);                       // outer glow

  vec3 col = dark;
  col = mix(col, teal, body * 0.85);
  col += amber * rim * 1.15;
  col += mix(teal, amber, 0.35) * glow * 0.22;
  col += teal * fbm(c * 3.0 - t) * 0.05;

  col *= 1.0 - 0.22 * smoothstep(0.65, 1.4, d);      // vignette

  gl_FragColor = vec4(col, 1.0);
}
`

export function ShaderHero() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const gl = (canvas.getContext('webgl', { antialias: true, alpha: false }) ||
      canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null
    if (!gl) return

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }
    const prog = gl.createProgram()!
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'p')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    const uRes = gl.getUniformLocation(prog, 'u_res')
    const uTime = gl.getUniformLocation(prog, 'u_time')

    let raf = 0
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = Math.max(1, Math.floor(canvas.clientWidth * dpr))
      const h = Math.max(1, Math.floor(canvas.clientHeight * dpr))
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
        gl.viewport(0, 0, w, h)
      }
    }
    const render = (now: number) => {
      resize()
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform1f(uTime, now * 0.001)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
      raf = requestAnimationFrame(render)
    }
    raf = requestAnimationFrame(render)
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [])

  return <canvas ref={ref} className="absolute inset-0 block h-full w-full" aria-hidden />
}
