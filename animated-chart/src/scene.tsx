import { Easing, interpolate, useCurrentFrame } from 'remotion';

const data = [
  { label: 'Mon', value: 42, color: '#7267f0' },
  { label: 'Tue', value: 68, color: '#8b7cf6' },
  { label: 'Wed', value: 54, color: '#a394fa' },
  { label: 'Thu', value: 86, color: '#c0b5ff' },
  { label: 'Fri', value: 73, color: '#e0a4f7' },
];

export const BarChart = () => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <div style={{ width: '100%', height: '100%', background: '#10111b', color: '#f5f3ff', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 930, opacity: fade }}>
        <div style={{ color: '#9b94b6', fontSize: 15, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 18 }}>Weekly overview · 01</div>
        <div style={{ fontSize: 46, fontWeight: 650, letterSpacing: -1.8, marginBottom: 10 }}>A little more, every day.</div>
        <div style={{ color: '#9995aa', fontSize: 18, marginBottom: 48 }}>Five focused sessions, one steady week.</div>
        <div style={{ height: 350, display: 'flex', alignItems: 'flex-end', gap: 32, borderBottom: '1px solid #343444', padding: '0 12px', position: 'relative' }}>
          {[25, 50, 75, 100].map((v) => <div key={v} style={{ position: 'absolute', left: 0, right: 0, bottom: `${v * 2.65}px`, borderTop: '1px solid #252534', opacity: 0.8 }} />)}
          {data.map((item, i) => {
            const height = interpolate(frame, [12 + i * 7, 48 + i * 7], [0, item.value * 2.7], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1) });
            const valueOpacity = interpolate(frame, [35 + i * 6, 48 + i * 6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            return <div key={item.label} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', zIndex: 1 }}>
              <div style={{ opacity: valueOpacity, color: '#efedff', fontSize: 19, fontWeight: 600, marginBottom: 14 }}>{item.value}<span style={{ fontSize: 12, color: '#8f8ba2', marginLeft: 3 }}>min</span></div>
              <div style={{ width: '100%', height, background: `linear-gradient(180deg, ${item.color}, ${item.color}88)`, borderRadius: '12px 12px 3px 3px', boxShadow: `0 0 35px ${item.color}22` }} />
              <div style={{ position: 'absolute', bottom: -38, color: '#aaa6b9', fontSize: 15, letterSpacing: 0.5 }}>{item.label}</div>
            </div>;
          })}
        </div>
        <div style={{ marginTop: 72, display: 'flex', justifyContent: 'space-between', color: '#777487', fontSize: 13, letterSpacing: 1.2, textTransform: 'uppercase' }}><span>Deep work</span><span>+24% from last week&nbsp; ↗</span></div>
      </div>
    </div>
  );
};
