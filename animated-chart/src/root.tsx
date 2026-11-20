import { Composition } from 'remotion';
import { BarChart } from './scene';

export const RemotionRoot = () => (
  <Composition id="FiveBars" component={BarChart} durationInFrames={150} fps={30} width={1280} height={720} />
);
