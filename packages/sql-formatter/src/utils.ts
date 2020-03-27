export function formatQuery(query: string): string {
  return query.replace(
    /\s+(?=SELECT|INSERT|UPDATE|DELETE|INTO|VALUES|FROM|(?:(?:LEFT|RIGHT|OUTER|INNER)\s+)*JOIN|WHERE|GROUP|HAVING|ORDER|LIMIT)/gi,
    '\n',
  );
}

export function formatQueryTime(ms: number): string {
  const value = ms > 1000 ? ms / 1000 : ms;
  const unit = ms > 1000 ? 's' : 'ms';
  return `<strong>${value.toFixed(2)}</strong> ${unit}`;
}
