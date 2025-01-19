declare module '*.csv' {
  const content: {
    Country: string;
    City: string;
  }[];
  export default content;
}

declare module '*.csv?raw' {
  const content: string;
  export default content;
} 