export interface ConditionalFood {
  food: string;
  condition: string;
}

export interface Member {
  id: string;
  name: string;
  avatar?: string;
  likes: string[];
  dislikes: string[];
  allergies: string[];
  neverEaten?: string[];
  conditionalFoods: ConditionalFood[];
  rankings: Record<string, string[]>;
  memo?: string;
}

export type FilterType = "all" | "allergy" | "dislike";

export interface SearchState {
  query: string;
  filter: FilterType;
  dislikeSearch: string;
}
