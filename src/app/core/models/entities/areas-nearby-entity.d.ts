import { EskomAreaNearby } from "../common/areas/eskom-area-nearby"

export interface AreasNearbyEntity {
  areas: EskomAreaNearby[];
  lat: number;
  long: number;
}