import React from 'react';


export interface CanvasViewProps extends React.HTMLAttributes<HTMLCanvasElement> {
  width: number,
  height: number,
  render: (_: HTMLCanvasElement) => void,
}
export default function CanvasView({width, height, render}: CanvasViewProps) {
  const mref = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    let rafId: number | null = null;
    function loop() {
      if (mref.current) render(mref.current);
      rafId = requestAnimationFrame(loop);
    }
    loop();
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    }
  }, [render, width, height])
  
  return (
    <canvas ref={mref} width={width} height={height}></canvas>
  )
}