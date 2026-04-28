'use client';

import * as React from 'react';

interface Heading {
  id: string;
  text: string;
  level: number;
  numbering: string;
}

export function useWikiHeadings(containerSelector: string) {
  const [headings, setHeadings] = React.useState<Heading[]>([]);

  React.useEffect(() => {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const elements = Array.from(container.querySelectorAll('h2, h3'));
    
    // Assign IDs to elements if they don't have one
    elements.forEach((elem) => {
      if (!elem.id) {
        elem.id = elem.textContent?.toLowerCase().trim().replace(/\s+/g, '-') || '';
      }
    });

    // Calculate hierarchical numbering
    let h2Count = 0;
    let h3Count = 0;
    
    const processedHeadings: Heading[] = elements.map((elem) => {
      const level = Number(elem.tagName.replace('H', ''));
      let numbering = '';

      if (level === 2) {
        h2Count++;
        h3Count = 0;
        numbering = `${h2Count}.`;
      } else if (level === 3) {
        h3Count++;
        numbering = `${h2Count}.${h3Count}.`;
      }

      return {
        id: elem.id,
        text: elem.textContent || '',
        level,
        numbering,
      };
    });

    setHeadings(processedHeadings);
  }, [containerSelector]);

  return headings;
}
