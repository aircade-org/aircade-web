import { ReactNode } from 'react';

import FaultyTerminal from './faulty-terminal';

export function Background(): ReactNode {
  return (
    <div
      className="pointer-events-none absolute inset-0 -z-10 bg-transparent"
      style={{ background: 'transparent' }}
    >
      <FaultyTerminal
        scale={3}
        gridMul={[2, 1]}
        digitSize={1.2}
        timeScale={0.5}
        pause={false}
        scanlineIntensity={0.5}
        glitchAmount={1}
        flickerAmount={1}
        noiseAmp={1}
        chromaticAberration={0}
        dither={0}
        curvature={0.1}
        tint="#A7EF9E"
        mouseReact={false}
        mouseStrength={0.5}
        pageLoadAnimation
        brightness={0.6}
        style={{ background: 'transparent' }}
      />
    </div>
  );
}
