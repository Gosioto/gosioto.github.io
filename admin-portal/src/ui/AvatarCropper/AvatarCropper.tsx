import { useCallback, useEffect, useRef, useState } from 'react';

import Button from '../Button/Button';

import styles from './AvatarCropper.module.css';

type Props = {
  file: File;
  onCancel: () => void;
  onConfirm: (dataUrl: string) => void;
};

const OUT = 256;

export default function AvatarCropper({ file, onCancel, onConfirm }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const containScaleRef = useRef(1);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });
  const [ready, setReady] = useState(false);
  const [scaleRange, setScaleRange] = useState({ min: 0.25, max: 3 });

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const size = canvas.width;
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, size, size);
    const w = img.width * scale;
    const h = img.height * scale;
    const dx = (size - w) / 2 + offset.x;
    const dy = (size - h) / 2 + offset.y;
    ctx.drawImage(img, dx, dy, w, h);
  }, [scale, offset]);

  useEffect(() => {
    if (ready) draw();
  }, [ready, draw, scale, offset]);

  const onImgLoad = (img: HTMLImageElement) => {
    imgRef.current = img;
    const containScale = Math.min(OUT / img.width, OUT / img.height);
    containScaleRef.current = containScale;
    setScaleRange({ min: containScale * 0.25, max: containScale * 4 });
    setScale(containScale);
    setOffset({ x: 0, y: 0 });
    setReady(true);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setOffset({ x: dragStart.current.ox + dx, y: dragStart.current.oy + dy });
  };

  const handlePointerUp = () => setDragging(false);

  const handleConfirm = () => {
    draw();
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          onConfirm(canvas.toDataURL('image/jpeg', 0.9));
          return;
        }
        const reader = new FileReader();
        reader.onload = () => onConfirm(reader.result as string);
        reader.readAsDataURL(blob);
      },
      'image/webp',
      0.88,
    );
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <h2 className={styles.title}>Обрезка аватара</h2>
        <div
          className={styles.cropBox}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <canvas ref={canvasRef} width={OUT} height={OUT} className={styles.canvas} />
          {!ready ? (
            <img
              src={URL.createObjectURL(file)}
              alt=""
              className={styles.hiddenImg}
              onLoad={(e) => onImgLoad(e.currentTarget)}
            />
          ) : null}
        </div>
        <label className={styles.scaleLabel}>
          Масштаб
          <input
            type="range"
            min={scaleRange.min}
            max={scaleRange.max}
            step={0.01}
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
          />
        </label>
        <div className={styles.actions}>
          <Button type="button" variant="ghost" onClick={onCancel}>
            Отмена
          </Button>
          <Button type="button" variant="primary" onClick={handleConfirm} disabled={!ready}>
            Сохранить
          </Button>
        </div>
      </div>
    </div>
  );
}
