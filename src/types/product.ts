export type NeckType = "crew" | "v-neck";
export type ShirtColor = "white" | "black";
export type Side = "front" | "back";

export interface ProductSelection {
  neckType: NeckType;
  color: ShirtColor;
}
