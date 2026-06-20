export const LEVELS = {
  level1: ["교육"],
  level2: ["유아교육", "초등교육", "중등교육", "고등교육", "직업훈련", "인재양성", "디지털교육"],
  level3: ["교육접근성", "학습성과", "정책·제도 개선"],
  level4: ["교육시설", "교사 연수", "교육 기자재", "교사학습공동체", "학교운영위원회"],
};

export const FACTOR_TYPES = ["작동요인", "비작동요인", "개선사항"] as const;
export const MONITORING_STATUSES = ["반영", "미반영", "진행중"] as const;

export function getFactorColor(type: string) {
  switch (type) {
    case "작동요인":
      return "bg-green-100 text-green-800";
    case "비작동요인":
      return "bg-red-100 text-red-800";
    case "개선사항":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function getMonitoringColor(status: string | null) {
  switch (status) {
    case "반영":
      return "bg-green-100 text-green-800";
    case "미반영":
      return "bg-red-100 text-red-800";
    case "진행중":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-500";
  }
}
