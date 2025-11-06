"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type RecordingState = "idle" | "recording" | "processing";

const WIDTH = 960;
const HEIGHT = 540;
const FPS = 30;

const easeInOutSine = (t: number) => 0.5 * (1 - Math.cos(Math.PI * t));

export default function MonkeyGardenCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const rafRef = useRef<number>();
  const startRef = useRef<number>(0);
  const lastElapsedRef = useRef<number>(0);
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpi = window.devicePixelRatio || 1;
    canvas.width = WIDTH * dpi;
    canvas.height = HEIGHT * dpi;
    canvas.style.width = `${WIDTH}px`;
    canvas.style.height = `${HEIGHT}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpi, dpi);

    let running = true;

    const draw = (timestamp: number) => {
      if (!running) return;
      if (!startRef.current) startRef.current = timestamp;
      const time = (timestamp - startRef.current) / 1000;
      renderScene(ctx, time);
      if (Math.abs(time - lastElapsedRef.current) >= 0.1) {
        lastElapsedRef.current = time;
        setElapsed(time);
      }
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      startRef.current = 0;
      lastElapsedRef.current = 0;
    };
  }, []);

  const stopRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      setRecordingState("processing");
      recorderRef.current.stop();
    }
  }, []);

  useEffect(() => {
    const recorder = recorderRef.current;
    if (!recorder) return;

    const handleStop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      chunksRef.current = [];
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "chu-khi-trong-vuon-chuoi.webm";
      anchor.click();
      setRecordingState("idle");
       recorderRef.current = null;
      URL.revokeObjectURL(url);
    };

    const handleData = (evt: BlobEvent) => {
      if (evt.data && evt.data.size > 0) {
        chunksRef.current.push(evt.data);
      }
    };

    recorder.addEventListener("dataavailable", handleData);
    recorder.addEventListener("stop", handleStop);

    return () => {
      recorder.removeEventListener("dataavailable", handleData);
      recorder.removeEventListener("stop", handleStop);
    };
  }, [recordingState]);

  const startRecording = useCallback(() => {
    if (recordingState !== "idle") return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const stream = canvas.captureStream(FPS);
    const recorder = new MediaRecorder(stream, {
      mimeType: "video/webm;codecs=vp9"
    });
    recorderRef.current = recorder;
    chunksRef.current = [];
    setRecordingState("recording");
    recorder.start();
  }, [recordingState]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && recordingState === "recording") {
        stopRecording();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [recordingState, stopRecording]);

  useEffect(
    () => () => {
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        recorderRef.current.stop();
      }
    },
    []
  );

  return (
    <div className="canvas-wrapper">
      <canvas ref={canvasRef} aria-label="Hoạt họa chú khỉ trong vườn chuối" />
      <div className="controls">
        <button
          type="button"
          className="primary"
          onClick={recordingState === "recording" ? stopRecording : startRecording}
          disabled={recordingState === "processing"}
        >
          {recordingState === "recording"
            ? "Dừng và tải video"
            : recordingState === "processing"
              ? "Đang xử lý..."
              : "Quay video WebM"}
        </button>
        <p className="hint">
          Thời lượng hiện tại: {elapsed.toFixed(1)} giây · Khuyến nghị ghi 10-15 giây
          để có cảnh đẹp nhất.
        </p>
      </div>
    </div>
  );
}

function renderScene(ctx: CanvasRenderingContext2D, t: number) {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  drawSky(ctx, t);
  drawSun(ctx, t);
  drawClouds(ctx, t);
  drawJungle(ctx, t);
  drawBananaTrees(ctx, t);
  drawButterflies(ctx, t);
  drawMonkey(ctx, t);
  drawGroundDetails(ctx, t);
}

function drawSky(ctx: CanvasRenderingContext2D, t: number) {
  const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  gradient.addColorStop(0, "#b9f7ff");
  gradient.addColorStop(0.5, "#e4ffd9");
  gradient.addColorStop(1, "#fffbe1");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  const distantHue = Math.sin(t * 0.05) * 8;
  ctx.fillStyle = `rgba(${120 + distantHue}, 230, 160, 0.12)`;
  ctx.fillRect(0, HEIGHT * 0.45, WIDTH, HEIGHT * 0.55);
}

function drawSun(ctx: CanvasRenderingContext2D, t: number) {
  const y = 80 + Math.sin(t * 0.2) * 10;
  ctx.beginPath();
  ctx.arc(WIDTH - 120, y, 45, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 243, 150, 0.95)";
  ctx.fill();

  for (let i = 0; i < 10; i += 1) {
    ctx.save();
    ctx.translate(WIDTH - 120, y);
    ctx.rotate(((Math.PI * 2) / 10) * i + t * 0.5);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -80 - Math.sin(t * 0.8 + i) * 4);
    ctx.strokeStyle = "rgba(255, 235, 120, 0.5)";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  }
}

function drawClouds(ctx: CanvasRenderingContext2D, t: number) {
  const clouds = [
    { x: 200, y: 90, scale: 1 },
    { x: 500, y: 70, scale: 1.3 },
    { x: 740, y: 110, scale: 0.9 }
  ];

  clouds.forEach((cloud, index) => {
    const offset = ((t * 20 + index * 200) % (WIDTH + 200)) - 100;
    ctx.save();
    ctx.translate(offset, cloud.y);
    ctx.scale(cloud.scale, cloud.scale);
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.arc(i * 40, Math.sin(t * 0.8 + i) * 8, 30, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });
}

function drawJungle(ctx: CanvasRenderingContext2D, t: number) {
  ctx.save();
  ctx.fillStyle = "#5ba14d";
  ctx.globalAlpha = 0.4;
  for (let i = 0; i < 7; i += 1) {
    ctx.beginPath();
    const baseY = HEIGHT * 0.55 + i * 20;
    ctx.moveTo(0, baseY);
    for (let x = 0; x <= WIDTH; x += 30) {
      const y =
        baseY +
        Math.sin((x + t * 60 + i * 50) * 0.01) * (12 + i * 5) +
        Math.cos((x + t * 40) * 0.015) * 6;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(WIDTH, HEIGHT);
    ctx.lineTo(0, HEIGHT);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawBananaTrees(ctx: CanvasRenderingContext2D, t: number) {
  const trees = 6;
  for (let i = 0; i < trees; i += 1) {
    const baseX = 80 + (i / trees) * (WIDTH - 160);
    const sway = Math.sin(t * 0.8 + i) * 12;
    const height = 220 + (i % 2 === 0 ? 30 : 0);
    drawBananaTree(ctx, baseX, HEIGHT * 0.55, height, sway, i);
  }
}

function drawBananaTree(
  ctx: CanvasRenderingContext2D,
  baseX: number,
  baseY: number,
  height: number,
  sway: number,
  seed: number
) {
  ctx.save();
  ctx.translate(baseX, baseY);
  ctx.rotate((sway * Math.PI) / 18000);

  ctx.strokeStyle = "#7c4e25";
  ctx.lineWidth = 18;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(10, -height * 0.3, 0, -height);
  ctx.stroke();

  const leaves = 5;
  for (let i = 0; i < leaves; i += 1) {
    const angle = ((i / leaves) * Math.PI) / 1.2 - Math.PI / 2.5;
    ctx.save();
    ctx.translate(0, -height);
    ctx.rotate(angle + sway * 0.005);
    const gradient = ctx.createLinearGradient(0, 0, 120, 0);
    gradient.addColorStop(0, "#2f6b2f");
    gradient.addColorStop(1, "#82da5a");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(120, -20, 160, 0);
    ctx.quadraticCurveTo(120, 20, 0, 0);
    ctx.fill();

    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(90, -10, 150, 0);
    ctx.stroke();
    ctx.restore();
  }

  ctx.translate(0, -height + 30);
  ctx.fillStyle = "#ffd74f";
  for (let b = 0; b < 6; b += 1) {
    const angle = (Math.PI / 3) * b + (seed % 2 === 0 ? 0.3 : -0.2);
    const radius = 22 + (b % 2 === 0 ? 4 : -4);
    ctx.save();
    ctx.rotate(angle + sway * 0.0015);
    ctx.beginPath();
    ctx.ellipse(45, 0, 14, radius * 0.6, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

function drawMonkey(ctx: CanvasRenderingContext2D, t: number) {
  const swing = Math.sin(t * 1.5);
  const swingEase = easeInOutSine((swing + 1) / 2);
  const anchorX = WIDTH * 0.45 + swing * 60;
  const anchorY = HEIGHT * 0.2 + Math.sin(t * 1.2) * 8;
  const bodyX = WIDTH * 0.45 + swing * 130;
  const bodyY = HEIGHT * 0.35 + Math.cos(t * 1.5) * 25;

  ctx.save();
  ctx.strokeStyle = "#3e2a14";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(anchorX, anchorY);
  ctx.quadraticCurveTo(
    anchorX + swing * 20,
    HEIGHT * 0.28,
    bodyX,
    bodyY - 20 * swingEase
  );
  ctx.stroke();

  ctx.fillStyle = "#a26a3d";
  ctx.beginPath();
  ctx.ellipse(bodyX, bodyY, 38, 48, 0, 0, Math.PI * 2);
  ctx.fill();

  const headX = bodyX + swing * 12;
  const headY = bodyY - 64;
  ctx.fillStyle = "#c78a56";
  ctx.beginPath();
  ctx.ellipse(headX, headY, 30, 26, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f4caaa";
  ctx.beginPath();
  ctx.ellipse(headX, headY + 4, 26, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#3e2a14";
  ctx.beginPath();
  ctx.arc(headX - 10, headY - 4, 4, 0, Math.PI * 2);
  ctx.arc(headX + 10, headY - 4, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(headX, headY + 10, 6, 0, Math.PI);
  ctx.strokeStyle = "#7b4624";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(headX - 22, headY - 2, 10, 0, Math.PI * 2);
  ctx.arc(headX + 22, headY - 2, 10, 0, Math.PI * 2);
  ctx.fillStyle = "#c78a56";
  ctx.fill();
  ctx.fillStyle = "#f7d0a5";
  ctx.beginPath();
  ctx.arc(headX - 22, headY - 2, 6, 0, Math.PI * 2);
  ctx.arc(headX + 22, headY - 2, 6, 0, Math.PI * 2);
  ctx.fill();

  const limbSwing = swing * 0.6;
  drawLimb(ctx, bodyX, bodyY, -26, 40, -0.8 + limbSwing, true);
  drawLimb(ctx, bodyX, bodyY, 26, 40, 0.9 + limbSwing, true);
  drawLimb(ctx, bodyX, bodyY - 20, -24, 20, -1.3 + limbSwing, false);
  drawLimb(ctx, bodyX, bodyY - 20, 24, 20, 1.2 + limbSwing, false);

  ctx.strokeStyle = "#7b4624";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(bodyX - 10, bodyY + 38);
  const tailWave = Math.sin(t * 2.4);
  ctx.quadraticCurveTo(
    bodyX - 60,
    bodyY + 50 + tailWave * 15,
    bodyX - 80 + tailWave * 20,
    bodyY + 100
  );
  ctx.stroke();
  ctx.restore();
}

function drawLimb(
  ctx: CanvasRenderingContext2D,
  bodyX: number,
  bodyY: number,
  offsetX: number,
  offsetY: number,
  angle: number,
  isLeg: boolean
) {
  const startX = bodyX + offsetX * 0.6;
  const startY = bodyY + offsetY * 0.3;
  const length = isLeg ? 72 : 50;
  ctx.save();
  ctx.translate(startX, startY);
  ctx.rotate(angle);
  ctx.strokeStyle = "#7b4624";
  ctx.lineWidth = isLeg ? 12 : 10;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(length * 0.4, length * 0.1, length, length);
  ctx.stroke();
  ctx.restore();
}

function drawButterflies(ctx: CanvasRenderingContext2D, t: number) {
  for (let i = 0; i < 6; i += 1) {
    const path = (t + i) * 0.6;
    const x = WIDTH * ((i * 37) % 100) * 0.01 + Math.sin(path * 1.5) * 60;
    const y =
      HEIGHT * 0.35 +
      Math.sin(path * 2 + i) * 40 +
      Math.cos(path * 1.1) * 20;
    const flap = Math.sin(path * 8) * 0.6;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(0.8, 0.8);

    ctx.fillStyle = i % 2 === 0 ? "#ff9a76" : "#ffd166";

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-26, -12 * flap, -48, -4);
    ctx.quadraticCurveTo(-20, 10 * flap, 0, 0);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(26, 12 * flap, 48, 4);
    ctx.quadraticCurveTo(20, -10 * flap, 0, 0);
    ctx.fill();

    ctx.fillStyle = "#3e2a14";
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawGroundDetails(ctx: CanvasRenderingContext2D, t: number) {
  ctx.save();
  ctx.fillStyle = "#f5f2bf";
  ctx.fillRect(0, HEIGHT * 0.68, WIDTH, HEIGHT * 0.32);
  const grassGradient = ctx.createLinearGradient(0, HEIGHT * 0.65, 0, HEIGHT);
  grassGradient.addColorStop(0, "rgba(110, 186, 60, 0.7)");
  grassGradient.addColorStop(1, "rgba(90, 140, 52, 0.9)");
  ctx.fillStyle = grassGradient;
  ctx.fillRect(0, HEIGHT * 0.6, WIDTH, HEIGHT * 0.4);

  for (let i = 0; i < 120; i += 1) {
    const x = (i * 37) % WIDTH;
    const height = 40 + (i % 5) * 8;
    ctx.beginPath();
    ctx.moveTo(x, HEIGHT * 0.68);
    ctx.quadraticCurveTo(
      x + Math.sin(t * 1.5 + i) * 6,
      HEIGHT * 0.68 - height,
      x + Math.cos(t * 1.3 + i) * 4,
      HEIGHT * 0.68
    );
    ctx.strokeStyle = "rgba(64, 120, 44, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(255,255,255,0.35)";
  for (let i = 0; i < 3; i += 1) {
    const sparkleX = (WIDTH / 4) * (i + 1) + Math.sin(t * 1.3 + i) * 30;
    const sparkleY = HEIGHT * 0.58 + Math.cos(t * 2 + i) * 12;
    ctx.beginPath();
    ctx.arc(sparkleX, sparkleY, 6 + Math.sin(t * 4 + i) * 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
