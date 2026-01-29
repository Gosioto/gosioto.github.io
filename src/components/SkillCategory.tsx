// src/components/SkillCategory.tsx
import { useMemo } from 'react';
import { SkillCategory as SkillCategoryType, Skill } from '@/types/skills';
import SkillCard from './SkillCard';

interface SkillCategoryProps {
  category: SkillCategoryType;
}

function sortSkills(skills: Skill[]): Skill[] {
  return [...skills].sort((a, b) => {
    if (a.order != null && b.order != null) return a.order - b.order;
    if (a.order != null) return -1;
    if (b.order != null) return 1;
    return b.percentage - a.percentage;
  });
}

const SkillCategoryComponent = ({ category }: SkillCategoryProps) => {
  const grouped = useMemo(() => {
    const hasSubcategories = category.skills.some(s => s.subcategory);
    const sorted = sortSkills(category.skills);
    if (!hasSubcategories) {
      return [{ subcategory: null as string | null, skills: sorted }];
    }
    const bySub = new Map<string, Skill[]>();
    const subOrder: string[] = [];
    for (const skill of sorted) {
      const key = skill.subcategory ?? '';
      if (!bySub.has(key)) {
        subOrder.push(key);
        bySub.set(key, []);
      }
      bySub.get(key)!.push(skill);
    }
    return subOrder.map(sub => ({
      subcategory: sub || null,
      skills: bySub.get(sub)!
    }));
  }, [category.skills]);

  return (
    <section className="skill-category" id={category.id}>
      <h2>{category.title}</h2>
      {grouped.map(({ subcategory, skills }) => (
        <div key={subcategory ?? 'main'} className="skill-category__block">
          {subcategory && <h3 className="skill-subcategory-title">{subcategory}</h3>}
          <div className="skills-grid">
            {skills.map(skill => (
              <SkillCard
                key={skill.id}
                skill={skill}
                category={category.id}
              />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
};

export default SkillCategoryComponent;