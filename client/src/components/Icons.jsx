const base = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: false,
};
const I = (p) => (props) => <svg {...base} {...props}>{p}</svg>;

export const Chat = I(<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.6A8 8 0 1 1 21 12Z" />);
export const Close = I(<path d="M6 6l12 12M18 6 6 18" />);
export const Minus = I(<path d="M5 12h14" />);
export const Expand = I(<path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7" />);
export const Shrink = I(<path d="M20 10h-6V4M4 14h6v6M14 10l7-7M3 21l7-7" />);
export const Restart = I(<path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" />);
export const Clip = I(<path d="m21 11-8.6 8.6a5 5 0 0 1-7-7L14 4a3.3 3.3 0 0 1 4.7 4.7l-8.6 8.6a1.7 1.7 0 0 1-2.4-2.4L15 7" />);
export const Smile = I(<><circle cx="12" cy="12" r="9" /><path d="M8.5 14.5a4.5 4.5 0 0 0 7 0M9 9.5h.01M15 9.5h.01" /></>);
export const Send = I(<path d="M12 19V5M5 12l7-7 7 7" />);
export const Alert = I(<><path d="M12 3 2 20h20L12 3Z" /><path d="M12 10v4M12 17.5h.01" /></>);
export const Check = I(<path d="m5 12.5 4.5 4.5L19 7.5" />);
export const Back = I(<path d="M15 5l-7 7 7 7" />);
export const Refresh = I(<path d="M20 12a8 8 0 1 1-2.4-5.7M20 4v5h-5" />);
export const Mail = I(<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3.5 7 8.5 6 8.5-6" /></>);
export const Layers = I(<path d="m12 3 9 5-9 5-9-5 9-5ZM3 13l9 5 9-5" />);
export const Database = I(<><ellipse cx="12" cy="6" rx="8" ry="3" /><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" /></>);
export const Plug = I(<path d="M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0V8ZM12 17v4" />);
export const Shield = I(<path d="M12 3 4 6v6c0 4.4 3.1 8 8 9 4.9-1 8-4.6 8-9V6l-8-3Zm-3 9 2.2 2.2L15.5 10" />);
export const Window = I(<><rect x="3" y="4" width="18" height="16" rx="2.5" /><path d="M3 9h18" /></>);
export const Inbox = I(<path d="M4 13 6.5 5h11L20 13M4 13v5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5M4 13h4.5l1 2h5l1-2H20" />);

export function Logo({ size = 28, light = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="9" fill={light ? "var(--paper)" : "var(--night)"} />
      <path
        d="M10.5 22.5a4.5 4.5 0 0 1-.6-8.96A6.2 6.2 0 0 1 21.8 12.6 5 5 0 0 1 21.5 22.5h-11Z"
        fill={light ? "var(--night)" : "var(--paper)"}
      />
      <circle cx="21.6" cy="11.2" r="2.6" fill="var(--ember)" />
    </svg>
  );
}
