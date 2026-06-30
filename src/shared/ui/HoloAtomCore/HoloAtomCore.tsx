import "./HoloAtomCore.css";

export interface HoloAtomCoreProps {
  size?: number;
}

export function HoloAtomCore({ size = 200 }: HoloAtomCoreProps) {
  return (
    <div className="holo-atom" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <g transform="rotate(0 50 50)">
          <g className="holo-atom__ring holo-atom__ring--a">
            <ellipse cx="50" cy="50" rx="40" ry="17" />
            <circle cx="50" cy="33" r="1.8" />
            <circle cx="50" cy="67" r="1.8" />
          </g>
        </g>
        <g transform="rotate(60 50 50)">
          <g className="holo-atom__ring holo-atom__ring--b">
            <ellipse cx="50" cy="50" rx="40" ry="17" />
            <circle cx="50" cy="33" r="1.8" />
            <circle cx="50" cy="67" r="1.8" />
          </g>
        </g>
        <g transform="rotate(120 50 50)">
          <g className="holo-atom__ring holo-atom__ring--c">
            <ellipse cx="50" cy="50" rx="40" ry="17" />
            <circle cx="50" cy="33" r="1.8" />
            <circle cx="50" cy="67" r="1.8" />
          </g>
        </g>
        <g className="holo-atom__ring holo-atom__ring--d">
          <ellipse cx="50" cy="50" rx="32" ry="32" />
          <circle cx="82" cy="50" r="1.4" />
          <circle cx="18" cy="50" r="1.4" />
        </g>
      </svg>
      <div className="holo-atom__core" />
      <div className="holo-atom__flare holo-atom__flare--v" />
      <div className="holo-atom__flare holo-atom__flare--h" />
    </div>
  );
}
