export const shortDate = (d: string) =>
  new Date(d.length === 10 ? d + 'T00:00:00Z' : d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', timeZone: 'UTC' });
export const longDate = (d: string) =>
  new Date(d.length === 10 ? d + 'T00:00:00Z' : d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
