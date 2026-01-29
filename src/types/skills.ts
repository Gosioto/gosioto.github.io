// src/types/skills.ts
export interface Skill {
  id: string;
  name: string;
  icon: string;
  percentage: number;
  tooltip?: string;
  /** Группировка внутри категории (например: «Языки», «Фреймворки») */
  subcategory?: string;
  /** Порядок внутри категории/подкатегории (меньше — выше) */
  order?: number;
}

export interface SkillCategory {
  id: string;
  title: string;
  skills: Skill[];
  /** Порядок отображения категории на странице (меньше — выше) */
  order?: number;
}