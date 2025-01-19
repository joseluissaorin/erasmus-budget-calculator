declare module '*.json' {
  const value: {
    id: string;
    country: string;
    city: string;
  }[];
  export default value;
} 