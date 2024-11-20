import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';

import type { Metric } from 'web-vitals';


const reportWebVitals = (onPerfEntry?: (metric: Metric) => void) => {
  if (!(onPerfEntry instanceof Function)) return;

  onCLS(onPerfEntry);
  onINP(onPerfEntry);
  onFCP(onPerfEntry);
  onLCP(onPerfEntry);
  onTTFB(onPerfEntry);
};

export default reportWebVitals;
