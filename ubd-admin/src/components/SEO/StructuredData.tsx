import Script from 'next/script';

interface StructuredDataProps {
  data: Record<string, any>;
  id?: string;
}

export default function StructuredData({ data, id }: StructuredDataProps) {
  const scriptId = id || `structured-data-${JSON.stringify(data).slice(0, 30).replace(/[^a-zA-Z0-9]/g, '')}`;
  
  return (
    <Script
      id={scriptId}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data, null, 2) }}
    />
  );
}
