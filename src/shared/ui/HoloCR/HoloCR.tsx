import "./HoloCR.css";

export interface HoloCRProps {
  size?: number;
}

const TICK_COUNT = 16;
const TICKS = Array.from({ length: TICK_COUNT }, (_, i) => (360 / TICK_COUNT) * i);

export function HoloCR({ size = 120 }: HoloCRProps) {
  const fontSize = size * 0.46;
  const radius = size * 0.49;

  return (
    <div className="holo-cr" style={{ width: size, height: size }}>
      <div className="holo-cr__glow" />
      <div className="holo-cr__ring holo-cr__ring--outer" />
      <div className="holo-cr__ring" />

      <div className="holo-cr__ticks">
        {TICKS.map(angle => (
          <span
            key={angle}
            className="holo-cr__tick"
            style={{ transform: `rotate(${angle}deg) translate(${radius}px, 0)` }}
          />
        ))}
      </div>

      <div className="holo-cr__stage" style={{ width: size, height: size }}>
        <div className="holo-cr__spin">
          <div className="holo-cr__edge" />
          <div className="holo-cr__face">
            <span className="holo-cr__letters" style={{ fontSize }}>
              <span className="holo-cr__letter--c">C</span>
              <span className="holo-cr__letter--r">R</span>
            </span>
          </div>
          <div className="holo-cr__face holo-cr__face--back">
            <span className="holo-cr__letters" style={{ fontSize }}>
              <span className="holo-cr__letter--c">C</span>
              <span className="holo-cr__letter--r">R</span>
            </span>
          </div>
        </div>
      </div>

      <div className="holo-cr__scan" />
    </div>
  );
}
