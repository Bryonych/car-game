import React, { JSX } from "react";

export interface Card {
    id: number,
    content: JSX.Element | React.ReactNode | string,
    className: string,
    thumbnail: string,
    color: string,
  }

export interface CarData {
    image: string,
    carlist: [],
    cardata: object,
  }

export interface OptionType {
    label: string;
    category: string;
  }