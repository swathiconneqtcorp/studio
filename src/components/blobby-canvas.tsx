
'use client';

import React, { useRef, useEffect } from 'react';

// Basic Perlin noise implementation
const PERLIN_YWRAPB = 4;
const PERLIN_YWRAP = 1 << PERLIN_YWRAPB;
const PERLIN_ZWRAPB = 8;
const PERLIN_ZWRAP = 1 << PERLIN_ZWRAPB;
const PERLIN_SIZE = 4095;

let perlin_octaves = 4;
let perlin_amp_falloff = 0.5;
let perlin: number[] | null = null;

const scaled_cosine = (i: number) => 0.5 * (1.0 - Math.cos(i * Math.PI));

function noise(x: number, y = 0, z = 0) {
  if (perlin === null) {
    perlin = new Array(PERLIN_SIZE + 1);
    for (let i = 0; i < PERLIN_SIZE + 1; i++) {
      perlin[i] = Math.random();
    }
  }

  if (x < 0) {
    x = -x;
  }
  if (y < 0) {
    y = -y;
  }
  if (z < 0) {
    z = -z;
  }

  let xi = Math.floor(x),
    yi = Math.floor(y),
    zi = Math.floor(z);
  let xf = x - xi;
  let yf = y - yi;
  let zf = z - zi;
  let rxf, ryf;

  let r = 0;
  let ampl = 0.5;

  let n1, n2, n3;

  for (let o = 0; o < perlin_octaves; o++) {
    let of = xi + (yi << PERLIN_YWRAPB) + (zi << PERLIN_ZWRAPB);

    rxf = scaled_cosine(xf);
    ryf = scaled_cosine(yf);

    n1 = perlin[of & PERLIN_SIZE];
    n1 += rxf * (perlin[(of + 1) & PERLIN_SIZE] - n1);
    n2 = perlin[(of + PERLIN_YWRAP) & PERLIN_SIZE];
    n2 += rxf * (perlin[(of + PERLIN_YWRAP + 1) & PERLIN_SIZE] - n2);
    n1 += ryf * (n2 - n1);

    of += PERLIN_ZWRAP;
    n2 = perlin[of & PERLIN_SIZE];
    n2 += rxf * (perlin[(of + 1) & PERLIN_SIZE] - n2);
    n3 = perlin[(of + PERLIN_YWRAP) & PERLIN_SIZE];
    n3 += rxf * (perlin[(of + PERLIN_YWRAP + 1) & PERLIN_SIZE] - n3);
    n2 += ryf * (n3 - n2);

    n1 += scaled_cosine(zf) * (n2 - n1);

    r += n1 * ampl;
    ampl *= perlin_amp_falloff;
    xi <<= 1;
    xf *= 2;
    yi <<= 1;
    yf *= 2;
    zi <<= 1;
    zf *= 2;

    if (xf >= 1.0) {
      xi++;
      xf--;
    }
    if (yf >= 1.0) {
      yi++;
      yf--;
    }
    if (zf >= 1.0) {
      zi++;
      zf--;
    }
  }
  return r;
}

interface BlobbyCanvasProps {
  isRecording: boolean;
}

const BlobbyCanvas: React.FC<BlobbyCanvasProps> = ({ isRecording }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>();
  const time = useRef(0);
  const points = useRef<any[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);
    const k = width / 2.5;

    if (points.current.length === 0) {
      const numPoints = 2500;
      for (let i = 0; i < numPoints; i++) {
        const phi = Math.acos(-1 + (2 * i) / numPoints);
        const theta = Math.sqrt(numPoints * Math.PI) * phi;
        points.current.push([Math.cos(theta) * Math.sin(phi), Math.sin(theta) * Math.sin(phi), Math.cos(phi)]);
      }
    }
    
    const draw = () => {
      time.current += 0.005;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
      ctx.clearRect(0, 0, width, height);

      const rotationX = time.current * 0.5;
      const rotationZ = time.current * 0.2;
      const shakeFactor = isRecording ? 1.5 + Math.sin(time.current * 20) * 0.5 : 1;

      for (const p of points.current) {
        const [x, y, z] = p;

        const noiseFactor = 0.5 * noise(x * 1.5 * shakeFactor, y * 1.5 * shakeFactor, z * 1.5 * shakeFactor + time.current);
        const r = 1 + noiseFactor;
        
        let newX = x * r;
        let newY = y * r;
        let newZ = z * r;

        // Rotation
        const tempY = newY;
        newY = newY * Math.cos(rotationX) - newZ * Math.sin(rotationX);
        newZ = tempY * Math.sin(rotationX) + newZ * Math.cos(rotationX);
        const tempX = newX;
        newX = newX * Math.cos(rotationZ) - newY * Math.sin(rotationZ);
        newY = tempX * Math.sin(rotationZ) + newY * Math.cos(rotationZ);

        const distance = 4 / (4 - newZ);
        const projX = newX * distance * k + width / 2;
        const projY = newY * distance * k + height / 2;
        
        const alpha = Math.min(1, Math.max(0.1, distance/2));

        const purpleShade = 150 + Math.floor((newZ + 1) * 50);

        ctx.fillStyle = `rgba(${purpleShade}, 100, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(projX, projY, distance * 1.5, 0, 2 * Math.PI);
        ctx.fill();
      }

      animationFrameId.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isRecording]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

export default BlobbyCanvas;
