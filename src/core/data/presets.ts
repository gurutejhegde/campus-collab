export const PROJECT_DOMAINS = [
  'AI & Machine Learning',
  'Web & Full-Stack',
  'Mobile Apps',
  'FinTech',
  'HealthTech',
  'EdTech',
  'AgriTech',
  'CleanTech & Sustainability',
  'Robotics & IoT',
  'Cybersecurity',
  'Developer Tools',
  'Web3 / Blockchain',
  'Social Impact',
  'Hardware & Embedded',
] as const;

export const ROLE_PRESETS = [
  'Frontend Developer',
  'Backend Engineer',
  'Full-Stack Developer',
  'Mobile Engineer',
  'ML / AI Engineer',
  'Data Scientist',
  'UI/UX Designer',
  'Embedded / IoT Engineer',
  'Cloud / DevOps Engineer',
  'Security Engineer',
  'Product & Pitch Lead',
] as const;

export const SKILL_PRESETS = [
  'TypeScript',
  'JavaScript',
  'React',
  'Next.js',
  'React Native',
  'Expo',
  'Flutter',
  'Tailwind CSS',
  'Node.js',
  'Python',
  'FastAPI',
  'PostgreSQL',
  'Supabase',
  'REST APIs',
  'PyTorch',
  'ONNX',
  'OpenCV',
  'LLMs / RAG',
  'Figma',
  'Design Systems',
  'C++',
  'Embedded C',
  'ESP32',
  'ROS2',
  'MQTT',
  'Docker',
  'Linux',
  'Git',
] as const;

export const ROLE_SKILL_RECOMMENDATIONS: Record<string, string[]> = {
  'Frontend Developer': ['TypeScript', 'React', 'Tailwind CSS', 'Next.js', 'Figma'],
  'Backend Engineer': ['Node.js', 'Python', 'PostgreSQL', 'Supabase', 'FastAPI', 'REST APIs'],
  'Full-Stack Developer': ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Supabase'],
  'Mobile Engineer': ['React Native', 'Expo', 'TypeScript', 'Flutter', 'REST APIs'],
  'ML / AI Engineer': ['Python', 'PyTorch', 'ONNX', 'OpenCV', 'LLMs / RAG', 'FastAPI'],
  'Data Scientist': ['Python', 'PostgreSQL', 'PyTorch', 'LLMs / RAG'],
  'UI/UX Designer': ['Figma', 'Design Systems', 'Tailwind CSS'],
  'Embedded / IoT Engineer': ['C++', 'Embedded C', 'ESP32', 'MQTT', 'ROS2'],
  'Cloud / DevOps Engineer': ['Docker', 'Linux', 'PostgreSQL', 'Git'],
  'Security Engineer': ['Linux', 'REST APIs', 'TypeScript', 'Python'],
  'Product & Pitch Lead': ['Figma', 'Git', 'Design Systems'],
};

const KEYWORD_FALLBACKS: Array<{ match: RegExp; skills: string[] }> = [
  { match: /front|ui|react|web/i, skills: ['TypeScript', 'React', 'Tailwind CSS'] },
  { match: /back|api|server|db/i, skills: ['Node.js', 'PostgreSQL', 'Supabase', 'FastAPI'] },
  { match: /mobile|android|ios|app/i, skills: ['React Native', 'Expo', 'Flutter', 'TypeScript'] },
  { match: /ml|ai|vision|nlp|data/i, skills: ['Python', 'PyTorch', 'LLMs / RAG', 'ONNX'] },
  { match: /design|ux|product/i, skills: ['Figma', 'Design Systems'] },
  { match: /iot|hardware|robot|embed/i, skills: ['C++', 'Embedded C', 'ESP32', 'ROS2', 'MQTT'] },
];

/**
 * Computes deduplicated skill recommendations from selected role titles.
 */
export function getRecommendedSkillsForRoles(roles: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  const pushUnique = (skill: string) => {
    const key = skill.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(skill);
    }
  };

  for (const role of roles) {
    const direct = ROLE_SKILL_RECOMMENDATIONS[role];
    if (direct) {
      direct.forEach(pushUnique);
      continue;
    }

    for (const rule of KEYWORD_FALLBACKS) {
      if (rule.match.test(role)) {
        rule.skills.forEach(pushUnique);
      }
    }
  }

  return result;
}
