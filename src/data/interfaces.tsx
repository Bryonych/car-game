import React, { JSX } from "react";

export interface Card {
    id: number,
    content: JSX.Element | React.ReactNode | string,
    className: string,
    thumbnail: string,
    color: string,
  }