import { StyleSheet, View, type DimensionValue } from 'react-native';

/**
 * Dependency-free gradient: stacked bands of one colour with eased opacity.
 * Opacity goes 0 → `max` between `from` and `to` (0..1 of the box), or
 * `max` → 0 when `reverse`. The area outside the ramp holds the end value.
 * `horizontal` runs the ramp left → right instead of top → bottom.
 */
export function Scrim({
  color = '14,20,17',
  from = 0.4,
  to = 1,
  max = 0.86,
  reverse,
  horizontal,
  steps = 16,
}: {
  color?: string;
  from?: number;
  to?: number;
  max?: number;
  reverse?: boolean;
  horizontal?: boolean;
  steps?: number;
}) {
  const pct = (n: number): DimensionValue => `${n * 100}%`;
  const band = (start: number, size: number, alpha: number, key: string | number) => (
    <View
      key={key}
      style={{
        position: 'absolute',
        ...(horizontal
          ? { top: 0, bottom: 0, left: pct(start), width: pct(size) }
          : { left: 0, right: 0, top: pct(start), height: pct(size) }),
        backgroundColor: `rgba(${color},${alpha.toFixed(3)})`,
      }}
    />
  );

  const step = (to - from) / steps;
  const ramp = Array.from({ length: steps }, (_, i) => {
    const t = (i + 0.5) / steps;
    const eased = t * t * (3 - 2 * t);
    // +0.4% overlap hides seams between bands.
    return band(from + step * i, step + 0.004, max * (reverse ? 1 - eased : eased), i);
  });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {reverse && from > 0 ? band(0, from, max, 'head') : null}
      {ramp}
      {!reverse && to < 1 ? band(to, 1 - to, max, 'tail') : null}
    </View>
  );
}
