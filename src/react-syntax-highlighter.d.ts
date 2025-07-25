declare module 'react-syntax-highlighter' {
  import { ComponentType, DetailedHTMLProps, HTMLAttributes } from 'react';
  
  export const Prism: ComponentType<{
    children?: string;
    language?: string;
    style?: Record<string, any>;
    customStyle?: React.CSSProperties;
    // Add other props as needed
  }>;
  
  // For styles
  export const lucario: Record<string, any>;
}

declare module 'react-syntax-highlighter/dist/esm/styles/prism' {
  export * from 'react-syntax-highlighter';
}