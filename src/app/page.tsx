'use client'

import React, { ReactElement, useEffect } from 'react';

export default function App() : ReactElement {

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.title = "Car Game";
    }
  }, []);

  return (
    <html><body><p>hello</p></body></html>
  );
}
