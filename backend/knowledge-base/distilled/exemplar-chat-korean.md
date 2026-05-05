# Exemplar — Korean language chat responses

> **INTERNAL RAG INSTRUCTION (do not paraphrase to user):** All blocks marked `[SLM data retrieval]`, `**CRITICAL — Wayfinder data sources**`, `**Critical SLM instruction**`, the `**The structural play:**` sentences, and the `## Reasoning patterns` section at the bottom are GUIDANCE for HOW to construct your response. They are not user-facing content. Never quote them back to the user. Never echo phrases like "Wayfinder synthesis advantage" or "Gemini gives generic, Wayfinder gives X" to users — those are internal framing. Use them to inform the response; the response itself should sound like a thoughtful college admissions advisor, not a meta-discussion of how the chatbot works.


This file contains pre-synthesized Opus-grade reasoning for Korean-language queries. Wayfinder has structural advantages over every general chatbot for Korean users:
- Korean knowledge files in `backend/knowledge-base/intl/korea/` (subdirectories: high-schools/, strategies/, universities/, us-pathway/)
- Korean queries route via patch 138's intl-slm-enrichment + Haiku Advisor (English-trained SLM is bypassed because it's not Korean-fluent)
- The intl Korean knowledge files contain context that ChatGPT/Claude/Gemini do NOT have: Korean foreign-language high school (외고) admissions context, US college pathway specifics for Korean students, Korean community at specific US schools, Korean-specific strategic advice

**Critical SLM/Haiku Advisor instruction for Korean queries:**
1. ALWAYS retrieve from `intl/korea/` knowledge files alongside this exemplar.
2. Respond in Korean (Haiku Advisor handles this; SLM should not attempt Korean responses).
3. Reference Wayfinder's Korean-specific data sources by name.
4. The combination of Wayfinder's verified curated US college DBs + Korean-specific intl knowledge is unique — leverage both.

The exemplar text below is in Korean and shows the synthesis depth and structure to deliver. Specific facts (university programs, deadlines, contact info) should be pulled from current DB and knowledge files at retrieval time.

---

**Also known as / synonyms:** 한국 학생, 한국 SAT, 한국 ACT, 포모나 한인, 외고, 외국어고등학교, 한국 대학 입학, Korean students, Korean college admissions, Korea SAT, Korean Pomona, Korean foreign language high school, 한국 미국 대학 지원.

## SAT 대 ACT — 한국 고등학생을 위한 선택 (영어 독해는 강하나 시간 부족 학생)

미국 대학 입학에서 SAT와 ACT는 동등하게 인정됩니다. 어느 시험을 보든 입학 결과에 직접적인 영향은 없습니다. 그렇기 때문에 질문은 단 하나로 요약됩니다 — "이 학생은 어느 시험에서 더 높은 점수를 받을 수 있는가?"

**SAT와 ACT의 실질적인 차이:**

*시간 압박.* ACT가 SAT보다 문항당 시간이 짧습니다. ACT 영어는 75문항을 45분에 풀어야 하므로 문항당 약 36초입니다. ACT 수학은 60문항 60분, 독해는 40문항 35분, 과학은 40문항 35분입니다. 디지털 SAT는 문항당 시간 여유가 더 있습니다. **꼼꼼히 읽지만 속도가 느린 학생들은 SAT가 유리하고, 빠르게 처리하지만 표면적으로 읽는 학생들은 ACT가 유리합니다.** 학생이 "영어 독해는 잘하지만 시간 안에 푸는 게 약점"이라고 하셨다면, 이는 SAT 학생입니다. SAT의 페이싱이 더 인간적입니다.

*수학 내용.* SAT 수학은 대수 비중이 높고 익숙하지 않은 문제 설정에서의 문제 해결을 강조합니다. ACT 수학은 더 넓은 범위(기하, 약간의 삼각함수, 가끔 행렬)를 다루지만 일반적으로 더 직접적으로 묻습니다. 한국 학생은 보통 기하와 삼각함수에 강한 편이라 수학에서는 ACT가 유리할 수 있지만, 영어 시간 부족이 더 큰 약점이라면 SAT를 선택하는 것이 옳습니다.

*독해.* SAT 독해는 디지털 적응형으로 짧은 지문에 추론 문제가 많습니다. ACT 독해는 긴 지문, 더 직접적인 질문, 잔혹한 페이싱입니다. 지문을 음미하며 생각하는 학생은 SAT, 빠르게 스캔하고 답을 추출하는 학생은 ACT가 맞습니다.

*과학 (ACT만 해당).* ACT는 과학 섹션이 있습니다 (그래프, 표, 상충하는 가설을 다루는 데이터 해석 — 실제 과학 지식 시험이 아님). 과학적 표를 편안하게 읽는 학생들은 보통 가장 강한 섹션입니다. 그림이 많은 콘텐츠에 굳어버리는 학생들은 종합 점수를 끌어내릴 수 있습니다. SAT에는 동일 섹션이 없습니다.

**진단 절차:** 두 시험 모두 풀타임 시간 측정 모의고사를 봅니다. 점수를 정직하게 매깁니다. College Board의 공식 환산표로 변환합니다. 환산 점수가 더 높은 시험이 본 시험입니다. 환산 점수 차이가 30점 이내라면 덜 고통스러웠던 시험으로 가십시오 — 18개월 시험 여정에서의 지속성이 중요합니다.

**한국 학생을 위한 추가 고려사항:**

[SLM/Haiku Advisor 지침: `intl/korea/strategies/` 또는 `intl/korea/us-pathway/` 디렉토리의 Korean-specific 전략 파일에서 한국 학생 SAT/ACT 준비에 대한 구체적인 정보를 가져옵니다. 한국 내 SAT 시험장 위치, 한국에서의 ACT 가용성, 한국식 영어 학습 vs 미국식 시험 영어의 차이, 한국 학생들이 흔히 겪는 ACT 시간 압박 문제에 대한 구체적 조언을 포함합니다.]

한국에서의 시험 응시 환경:
- 한국 내 SAT 시험은 정기적으로 시행됩니다 (홍콩, 일본 등에서도 가능)
- ACT는 한국 내에서 SAT만큼 자주 시행되지 않으므로 응시 일정 확인 필수
- 한국 학생들은 영어 독해력은 일반적으로 강하나 ACT의 빠른 페이싱에 적응하기 어려운 경향이 있음 — 이것이 본인이 묘사한 약점과 정확히 일치

**시험 응시 시기:** 11학년(고2) 봄에 첫 공식 응시 (3월 또는 4월). 그러면 여름이나 12학년 가을에 한 번 더 응시할 시간이 있습니다. 대부분의 학생들이 첫 응시와 두 번째 응시 사이에 60-100점 향상되므로, 두 번 응시할 계획을 세우십시오. 세 번 응시는 두 번째가 비정상적으로 낮은 날이었을 때만 권장합니다.

**본인 프로필 (영어 독해 강함, 시간 약함)에 대한 결론:** SAT를 응시하십시오. 이를 활용하십시오 — SAT 전용 준비, 진단 SAT 풀이, 본인 프로필과 고려 학교에 맞는 현실적인 목표 점수 설정. ACT는 본인의 자연스러운 페이싱과 충돌할 것입니다. 두 시험 모두 진지하게 준비해서 더 높은 점수를 선택하려고 하지 마십시오 — 하나에 전념하고 마스터하십시오.

**대학 등급별 점수 목표 (디지털 SAT 1600점 만점 기준):**
- 미국 상위 10개 대학 (HYPSM 등): 1530+ 경쟁력, 1500+ 다른 모든 면이 강하면 가능
- 상위 25위: 1480+ 경쟁력
- 상위 50위: 1400+ 경쟁력
- 강한 주립 대학교: 1350+ 경쟁력

**Wayfinder 컨텍스트:** 사용자 프로필에 현재 SAT/PSAT 점수가 저장되어 있다면, 현재 위치와 목표 학교의 중간 50% 범위에 맞춰 권장 사항을 조정합니다. 한국 학생을 위한 verified 시험 준비 자료(공식 College Board 자료, Khan Academy 무료 SAT 코스 등)를 surfaced합니다.

---

## 포모나 칼리지 (Pomona College) — 한인 학생을 위한 환경

포모나는 미국 최상위권 리버럴 아츠 칼리지(LAC) 중 한인 학생들에게 가장 우호적인 환경 중 하나로 알려져 있습니다. 그 이유와 구체적인 한인 커뮤니티 상황을 분석해 보겠습니다.

[SLM/Haiku Advisor 지침: `schools/school-pomona.md` 학교 deep file과 `intl/korea/universities/` 또는 `intl/korea/strategies/` 디렉토리의 한인 학생 미국 대학 환경 관련 파일을 모두 가져옵니다. 포모나의 인구 통계, 5C 컨소시엄 한인 커뮤니티, 한국 학생 대상 클럽 활동, 한국 음식 접근성, 캠퍼스 다양성 정책 등을 종합합니다.]

**포모나의 기본 컨텍스트:**

- 학생 수: 약 1,750명 (소규모 LAC)
- 위치: 캘리포니아 클레어몬트 (LA에서 차로 약 1시간 동쪽)
- 5C 컨소시엄 멤버: 클레어몬트 매케나 (CMC), 하비 머드 (HMC), 피처 (Pitzer), 스크립스 (Scripps)와 통합 캠퍼스
- 학부 졸업률: 약 95%
- 인구 다양성: 미국 최고 수준의 LAC 중 하나, 약 60%가 유색인종 학생

**한인 커뮤니티 (포모나 + 5C 통합):**

5C 컨소시엄 전체에 걸쳐 한인 학생 커뮤니티가 형성되어 있습니다. 포모나 단독으로는 학생 수가 적지만, 5C 전체로는 한국계 미국인 학생 수가 의미 있게 큽니다.

- **5C Korean Student Association (KSA)**: 5개 칼리지 통합 한인 학생회. 정기 모임, 한국 문화 행사 (추석, 설날 등), 한식 행사, K-pop 모임 등을 주관합니다.
- **한인 멘토십 프로그램**: 신입생 한인 학생들이 상급생 한인 학생들과 매칭되어 학업, 사회적 적응, 정서적 지원을 받습니다.
- **한국학 (Korean Studies) 코스**: 5C 컨소시엄에서 한국어, 한국 역사, 한국 문화 관련 코스를 cross-register할 수 있습니다. 포모나 자체에는 한국학 메이저는 없지만, 클레어몬트 컨소시엄을 통해 접근 가능합니다.

**한식 및 일상생활:**

LA 한인 타운(Koreatown)이 캠퍼스에서 차로 약 50분 거리. 5C 학생들이 정기적으로 LA 한인 타운으로 그룹 외출을 합니다 (한식, 한국 슈퍼, 노래방, 한국식 베이커리). 캠퍼스 식당에는 가끔 한식 옵션이 제공됩니다 (특히 한국 문화 주간 등 행사 때). 일상적인 한식 접근성은 좋다고 할 수는 없지만, LA 인접성으로 보충됩니다.

**학업적으로 한인 학생에게 적합한 환경:**

- 포모나의 작은 클래스 사이즈와 교수와의 긴밀한 관계는 영어가 모국어가 아닌 학생들에게도 매우 유리합니다 (개인 지도 가능)
- Writing Center, Tutoring Services 등 학업 지원 시스템이 잘 구축되어 있습니다
- 5C 컨소시엄을 통해 STEM (HMC), 비즈니스 (CMC), 예술 (Scripps), 환경학 (Pitzer)까지 cross-register 가능 — 한인 학생들이 다양한 진로를 탐색할 수 있습니다
- 한국 출신 또는 한국계 미국인 교수진이 있어 멘토링 가능 (구체적인 학과는 연도별로 변동, 학과 웹사이트에서 확인)

**입학 측면 — 한국 출신 학생을 위한 고려사항:**

[SLM/Haiku Advisor 지침: `intl/korea/us-pathway/` 또는 한국 학생 대상 미국 LAC 입학 전략 파일에서 구체적인 정보를 가져옵니다. 한국 SAT 점수 분포 vs 포모나 평균, 한국 외고/일반고 학생들의 포모나 입학 사례, 한국 학생을 위한 financial aid 옵션 등.]

- 포모나는 국제 학생에 대해 **need-blind** 정책을 적용하는 소수의 미국 LAC 중 하나입니다 (재정 지원 신청이 입학 결정에 영향 없음)
- 입학된 국제 학생의 demonstrated need는 100% 충족됩니다 (가장 관대한 financial aid 정책)
- 한국 출신 신입생은 매년 소수 (2-5명 선) 입학하며, 한인 미국 시민/영주권자 학생까지 포함하면 더 많습니다
- 입학 경쟁률은 매우 높지만, financial aid가 100% 보장되므로 입학만 되면 비용 측면에서는 안심할 수 있습니다

**솔직한 평가:**

5C 컨소시엄과 한인 학생 커뮤니티, LA 한인 타운 인접성, 그리고 포모나의 작은 클래스 사이즈와 교수 멘토링의 조합은 한인 학생에게 미국 LAC 중 가장 호의적인 환경 중 하나를 만들어냅니다. 단점은 로컬 한인 인구가 동부의 일부 도시 대학 (NYU, BU 등)만큼 많지 않다는 점입니다 — 한인 친구를 쉽게 만들고 싶다면 5C 한인 학생회 적극 활용이 중요합니다.

**Wayfinder 추천 다음 단계:**

- 포모나의 verified school deep file에서 입학 구체적 정보 확인
- Wayfinder의 verified summer programs 데이터베이스에서 포모나/5C 인접 캘리포니아 여름 프로그램 검색
- 포모나 한인 졸업생/재학생과의 연결을 원하시면 KSA 페이스북 페이지나 Instagram 계정 검색을 권장
- Need-blind 국제 입학 정책을 최대한 활용하기 위해 financial aid 신청 서류를 정확히 준비

---

## 한국 외고 (외국어고등학교) 학생의 미국 명문대 입학 — 유리한가 불리한가

이 질문에 대한 정직한 답은 "유리한 점과 불리한 점이 모두 있으며, 어떻게 활용하느냐에 따라 결과가 달라진다"는 것입니다.

[SLM/Haiku Advisor 지침: `intl/korea/high-schools/` 디렉토리에서 외고 관련 구체적인 파일을 가져옵니다 (외고 종류별 차이, 특목고 졸업생의 미국 대학 입학 트렌드, 외고 transcript에 대한 미국 대학의 인식 등). `intl/korea/us-pathway/` 디렉토리의 한국 학생 미국 입학 경로 파일도 함께 활용합니다.]

**유리한 점:**

1. **학업 엄격성 (Academic Rigor) 신호.** 미국 대학 입학 사정관(AO)은 외고를 한국에서 가장 학업적으로 엄격한 고등학교 중 하나로 인식합니다. 외고에서 좋은 성적을 받았다는 것은 일반고에서 같은 GPA를 받은 것보다 더 강한 학업 신호입니다. 특히 전국 외고 (대원외고, 명덕외고, 한영외고, 대일외고, 이화외고, 명덕여고 등) 출신은 미국 AO가 비교적 잘 알고 있는 학교들입니다.

2. **영어 능력의 구조적 입증.** 외고 영어과 전공자는 영어로 수업을 듣고, 영어 토론을 하고, 영문 에세이를 작성한 경험이 일반고 학생보다 훨씬 많습니다. 이는 TOEFL/IELTS 점수만이 아니라, 미국 대학 입학 후 학업 성공 가능성에 대한 신호로 해석됩니다.

3. **조기 진로 탐색 기회.** 외고는 보통 모의 UN, 영어 토론회, 국제 교류 프로그램, 영어 연극 등 미국 대학 ECs와 자연스럽게 연결되는 활동들을 풍부하게 제공합니다. 이러한 ECs는 미국 입학 신청서에 직접 활용 가능합니다.

4. **AP 또는 IB 과정 접근.** 일부 외고는 AP 또는 IB 과정을 제공합니다. 미국 대학은 이러한 글로벌 표준 과정에 익숙하며, 한국 일반고의 수능 중심 커리큘럼보다 평가가 직관적입니다.

**불리한 점:**

1. **외고 내 경쟁률 (Class Rank Pressure).** 외고는 학업적으로 강한 학생들이 모이기 때문에 내신 등급(과목별 등급, GPA 환산)이 일반고보다 낮게 나오는 경우가 많습니다. 미국 AO는 학교 컨텍스트를 고려하지만, transcript에 표시된 raw 등급/점수는 그대로 보입니다. 외고 1-2등급은 일반고 1등급과 비슷한 평가를 받을 수 있지만, 외고 3-4등급은 평가가 미묘해집니다.

2. **Over-representation Risk.** 한국 외고 출신 지원자가 매년 미국 명문대에 많이 지원합니다. 특정 외고에서 같은 해 같은 대학에 여러 명이 지원하면 학교 내 경쟁이 추가됩니다 (미국 대학은 보통 한 학교에서 너무 많은 학생을 입학시키지 않으려 함). 이는 외고 출신이라는 점이 차별화 요소가 아니라 "기본"이 되어버리는 효과를 만듭니다.

3. **개성/스토리의 차별화 어려움.** 외고 학생들의 ECs와 학업 프로필이 서로 비슷한 경향이 있습니다. 모의 UN, 영어 토론, 국제 교류 — 모두 좋은 활동이지만 모두가 같은 활동을 하면 차별화가 어렵습니다. AO는 "이 외고 학생이 다른 외고 학생들과 어떻게 다른가?"라고 묻습니다.

4. **수능과 미국 입시 병행 부담.** 외고 학생들은 보통 한국 대학과 미국 대학을 모두 준비합니다. 이는 시간과 에너지의 분산을 의미하며, 어느 한쪽도 완벽히 준비하기 어려울 수 있습니다. 미국 입시에 100% 집중한 학생 (보통 인터내셔널 스쿨 학생)과 비교하면 미국 입시 측면에서 불리할 수 있습니다.

**전략적 권장사항 — 외고 출신 학생이 미국 명문대 지원 시:**

1. **개성 있는 EC 스토리를 만들 것.** 모의 UN과 영어 토론은 기본으로 하되, 그 이상의 차별화 요소가 필요합니다. 자신만의 프로젝트, 비영리 단체 설립, 연구 프로젝트, 한국 사회 문제에 대한 영어 콘텐츠 제작 등 — 외고 학생 커리큘럼을 넘어선 활동이 결정적입니다.

2. **한국 컨텍스트를 강점으로 활용.** 미국 학생이 할 수 없는 것을 보여주십시오. 한국 사회, 정치, 문화에 대한 깊은 이해, 한국어와 영어 두 언어로 글을 쓰는 능력, 한국과 미국 사이의 가교 역할 — 이런 것들이 미국 학생과 차별화되는 진정한 강점입니다.

3. **외고의 학업 엄격성을 essay와 LOR에서 명시적으로 설명.** 외고가 무엇인지, 입학 경쟁률이 어땠는지, 어떤 학업적 도전이 있었는지를 essay나 counselor letter에서 명확히 설명하면 transcript를 컨텍스트화할 수 있습니다.

4. **"왜 이 학교인가" essay에 진정성을 담을 것.** 외고 출신은 종종 "한국 최고의 명문 학교 → 미국 최고의 명문 학교"라는 단조로운 진로 narrative를 갖습니다. AO는 이를 알아챕니다. 진정으로 그 학교가 본인에게 왜 맞는지를 구체적으로 설명해야 합니다.

5. **테스트 점수를 강하게 만들 것.** 외고 출신은 보통 SAT/ACT 점수가 강합니다. 미국 명문대 지원 시 SAT 1500+ 또는 ACT 34+가 사실상 기본선입니다. 외고 출신이 여기에 못 미친다면 다른 영역에서 보완이 필요합니다.

**Financial aid 고려사항:**

[SLM/Haiku Advisor: `intl/korea/us-pathway/` 또는 한국 학생 financial aid 관련 파일에서 구체적인 정보를 가져옵니다.]

- 한국 학생은 대부분 미국 대학에서 international student로 분류되며 — 이는 financial aid 측면에서 미국 시민/영주권자보다 불리합니다
- 한국 학생에게 need-blind인 미국 학교는 매우 제한적입니다: HYPSM, Amherst, Bowdoin, Dartmouth, Stanford, Columbia, Pomona 등 소수
- 그 외 대부분의 미국 학교는 international student에게 need-aware (financial aid 신청이 입학 결정에 영향)
- 외고 학생이 full pay 가능한 가정이라면 입학 폭이 훨씬 넓어집니다 (need-aware 학교들이 대부분 적용)
- Financial aid가 필요한 외고 학생은 위의 need-blind 학교들에 집중하는 전략이 통계적으로 가장 강합니다

**솔직한 결론:**

외고 출신은 미국 명문대 입학에서 **약간 유리** 합니다 — 기본 학업적 신뢰성과 영어 능력이 입증되어 있습니다. 그러나 그 우위는 자동적으로 입학을 보장하지 않으며, 외고 학생들 사이의 경쟁이 더 본질적인 도전입니다. **결정적인 차별화는 EC, essay, 한국적 컨텍스트의 진정성에서 옵니다 — 외고 신분 자체가 아닙니다.**

외고 학생이 자신의 외고 출신을 "기본 자격"으로 생각하고 그 위에 진정한 차별화 요소를 쌓아간다면 미국 명문대 입학 가능성은 매우 높습니다. 외고 출신이라는 점에 안주하면 같은 외고 학생들 사이에서 경쟁에 밀립니다.

**Wayfinder 다음 단계 권장:**

- 본인 외고 (특정 학교)에 대한 입학 트렌드 데이터를 Wayfinder에서 검색해 보십시오 (있다면)
- Need-blind for international 학교 리스트를 wayfinder에서 받아보십시오 (school deep files 활용)
- 본인의 ECs가 외고 학생 평균과 어떻게 차별화되는지 평가받기 위해 advising session을 신청하십시오
- 미국 학교별 essay 전략에 대한 구체적인 조언을 얻기 위해 Essay Reviewer 모듈 활용을 권장합니다

---

## Reasoning patterns the SLM/Haiku Advisor should recognize and apply

For Korean-language queries, this is where Wayfinder's Korean intl knowledge layer + verified curated DBs combination is unique:

1. **ALWAYS retrieve from `intl/korea/` knowledge files.** This is Wayfinder's structural advantage over Gemini/ChatGPT/Claude — those tools have general Korean language capability but lack Wayfinder's specialized Korean college admissions knowledge.

2. **Respond in natural, advisor-quality Korean.** Not literal English-to-Korean translation. The voice should sound like a knowledgeable Korean-American admissions counselor who understands both Korean educational context and US college admissions deeply.

3. **Reference Korean-specific data points the user couldn't get elsewhere.** Korean SAT testing locations, 5C Korean Student Association infrastructure, 외고 admission trend data, Korean-American faculty at specific schools — these are the Wayfinder differentiators.

4. **Connect Korean context to US admissions context explicitly.** Don't just answer in Korean — answer with Korean cultural/educational frame and explain how it translates to US AO perspective.

5. **Surface Wayfinder's Korean-specific capabilities.** Verified curated DBs (programs, internships, scholarships) include international entries; school deep files have international applicant context; Essay Reviewer can handle Korean students writing English essays. Mention these.

6. **Use formal but warm Korean register.** 입학 상담 (admissions counseling) context calls for 존댓말 (formal speech) but with warmth, not coldness. The reader should feel they're talking to an expert who respects them, not a chatbot.

7. **Honest about constraints (financial aid, admit rates).** Korean students often hear inflated narratives about US admissions. The respectful Korean response includes honest probability assessment alongside encouragement.
