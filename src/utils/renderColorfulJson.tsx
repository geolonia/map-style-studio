import React, { useMemo } from 'react';

export function useColorfulJson(json: string) {
  return useMemo(() => {
    const colorReg = /"(#(?:[0-9a-fA-F]{3}){1,2}|rgba?\([^)]+\)|hsla?\([^)]+\))"/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let idx = 0;

    while ((match = colorReg.exec(json)) !== null) {
      const color = match[1];
      if (match.index > lastIndex) {
        parts.push(json.slice(lastIndex, match.index));
      }
      parts.push(
        <span key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          {match[0]}
          <span
            style={{
              display: 'inline-block',
              width: 14,
              height: 14,
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 3,
              marginLeft: 4,
              background: color,
              verticalAlign: 'middle',
            }}
            title={color}
          />
        </span>
      );
      lastIndex = match.index + match[0].length;
      idx++;
    }
    if (lastIndex < json.length) {
      parts.push(json.slice(lastIndex));
    }
    return parts;
  }, [json]);
}
