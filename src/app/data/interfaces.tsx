import React, { JSX } from "react";

export interface Tile {
    id: number,
    content: JSX.Element | React.ReactNode | string,
    className: string,
    thumbnail: string,
    color: string,
  }

export interface Accreditation {
  Link: string,
  ImageName: string,
  ImageLicence?: string,
  LicenceName: string,
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

export const TileColors = [
  "#D62246", 
  "#8BA6A9", 
  "#3A445D", 
  "#E7BB41", 
  "#DB995A", 
  "#352208", 
  "#B8D8D8", 
  "#3772FF", 
  "#0B6E4F", 
  "#8491A3", 
  "#F15152", 
  "#470FF4", 
  "#F7D488", 
  "#92140C", 
  "#2A1E5C"
]