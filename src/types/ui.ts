import { Interpolation } from "@react-spring/web";
import { ReactNode } from "react";

export type SpringValue =
  | Interpolation<number, number>
  | Interpolation<number, string>;

export interface StatsCardProps {
  title: string;
  value: ReactNode | SpringValue;
  gradientFrom: string;
  gradientTo: string;
  borderColor: string;
  textColor: string;
}
