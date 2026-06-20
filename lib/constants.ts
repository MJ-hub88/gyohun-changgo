export const LEVELS = {
  level1: ["교육"],
  level2: ["유아교육", "초등교육", "중등교육", "고등교육", "직업훈련", "인재양성", "디지털교육"],
  level3: {
    "교육접근성": ["등록·출석률 향상", "통학 환경·안전", "교육비 지원·장학", "취약계층 포용"],
    "학습성과": ["교수법·수업 설계", "학습 동기·참여", "기초학력 보장", "역량 평가·측정"],
    "교육 인프라": ["교육시설 구축·관리", "교육 기자재·장비", "ICT 인프라·디지털 환경"],
    "교원 역량": ["교사 연수·훈련", "수업 가이드·매뉴얼", "교사학습공동체", "교원 동기부여·지원"],
    "거버넌스·제도": ["학교운영위원회", "지방정부 연계·제도화", "정책·규정 개선", "모니터링 체계"],
    "지속가능성": ["자원동원·모금", "지역사회 참여", "사업 종료 후 자생력", "성과 확산·공유"],
    "사업 설계": ["사업 구조·목표 설정", "대상자 선정·맞춤화", "성인지·포용적 설계", "통합적 개입 전략"],
  },
  level4: ["교육시설", "교사 연수", "교육 기자재", "교사학습공동체", "학교운영위원회"],
};

export type Level3Category = keyof typeof LEVELS.level3;
export const LEVEL3_CATEGORIES = Object.keys(LEVELS.level3) as Level3Category[];

export function getLevel3Subcategories(category: string): string[] {
  return LEVELS.level3[category as Level3Category] || [];
}

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
