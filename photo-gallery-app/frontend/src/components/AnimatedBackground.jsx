import React, { useEffect, useRef } from "react";
import "./AnimatedBackground.css";

const AnimatedBackground = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        containerRef.current.style.setProperty("--mouse-x", `${e.clientX}px`);
        containerRef.current.style.setProperty("--mouse-y", `${e.clientY}px`);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Cool white and blue stars for a quiet night-sky palette.
    const colors = [
      "rgba(255, 255, 255, ",
      "rgba(186, 230, 253, ",
      "rgba(147, 197, 253, ",
    ];

    const particleCount = Math.min(180, Math.max(90, Math.floor(window.innerWidth / 8)));

    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.2 + 0.7,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.5 + 0.5,
      speedY: Math.random() * 1.4 + 0.45,
      speedX: Math.random() * 0.8 + 0.3,
      streak: Math.random() > 0.9,
      pulseSpeed: Math.random() * 0.025 + 0.01,
      pulsePhase: Math.random() * Math.PI * 2,
    }));

    let frame = 0;
    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;

        if (p.y > height + 15 || p.x > width + 15) {
          p.y = Math.random() * height * 0.2 - 20;
          p.x = Math.random() * width * 0.85 - 20;
        }
        if (p.x < -15) p.x = width + 15;
        if (p.x > width + 15) p.x = -15;

        const currentAlpha =
          p.alpha * (0.65 + 0.35 * Math.sin(frame * p.pulseSpeed + p.pulsePhase));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${currentAlpha})`;
        ctx.shadowBlur = p.radius * 7;
        ctx.shadowColor = `${p.color}${Math.min(1, currentAlpha + 0.15)})`;
        ctx.fill();
        ctx.shadowBlur = 0;

        if (p.streak) {
          const trailLength = 18 + p.radius * 14;
          const trailGradient = ctx.createLinearGradient(
            p.x - trailLength,
            p.y - trailLength,
            p.x,
            p.y
          );
          trailGradient.addColorStop(0, `${p.color}0)`);
          trailGradient.addColorStop(1, `${p.color}${currentAlpha})`);
          ctx.beginPath();
          ctx.moveTo(p.x - trailLength, p.y - trailLength);
          ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = trailGradient;
          ctx.lineWidth = p.radius * 2;
          ctx.stroke();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="animated-bg-container" ref={containerRef} aria-hidden="true">
      <div className="night-haze" />
      <div className="moon" />
      <div className="moon-glow" />

      {/* Interactive Cursor Ambient Glow */}
      <div className="cursor-spotlight" />

      {/* Floating Bokeh Particle Canvas */}
      <canvas ref={canvasRef} className="bokeh-canvas" />

      {/* Studio Dot Grid Texture */}
      <div className="grid-overlay" />

      {/* Cinematic Vignette */}
      <div className="vignette-overlay" />
    </div>
  );
};

export default AnimatedBackground;
