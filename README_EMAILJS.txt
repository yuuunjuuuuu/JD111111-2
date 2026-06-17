===================================================
  EmailJS 설정 방법 (신청서 이메일 수신용)
===================================================

신청자가 폼을 제출하면 yundu0112@gmail.com 으로 자동 이메일이 발송됩니다.
아래 순서대로 설정하면 됩니다. (무료 플랜: 월 200건 무료)

---------------------------------------------------
STEP 1. EmailJS 계정 만들기
---------------------------------------------------
1. https://www.emailjs.com 접속 → Sign Up (Google 계정으로도 가능)
2. 로그인 후 대시보드 진입

---------------------------------------------------
STEP 2. Email Service 연결
---------------------------------------------------
1. 왼쪽 메뉴 "Email Services" 클릭
2. "Add New Service" → Gmail 선택
3. Gmail 계정(yundu0112@gmail.com)으로 인증
4. "Create Service" 클릭
5. 생성된 Service ID 복사 (예: service_abc123)

---------------------------------------------------
STEP 3. Email Template 만들기
---------------------------------------------------
1. 왼쪽 메뉴 "Email Templates" 클릭
2. "Create New Template" 클릭
3. 아래 내용으로 Template 작성:

  [To email]  : {{to_email}}
  [Subject]   : [데이터분석 입문] 새 신청서 - {{from_name}}

  [Body 예시]:
  ────────────────────────────
  새로운 신청서가 접수되었습니다.

  이름:     {{from_name}}
  연락처:   {{from_phone}}
  이메일:   {{from_email}}
  학교/소속: {{school}}
  거주지역: {{location}}
  경험수준: {{experience}}
  경험상세: {{exp_detail}}

  [지원동기]
  {{motivation}}

  [목표]
  {{goal}}

  신청일시: {{apply_date}}
  ────────────────────────────

4. "Save" 후 Template ID 복사 (예: template_xyz456)

---------------------------------------------------
STEP 4. Public Key 확인
---------------------------------------------------
1. 오른쪽 상단 계정 아이콘 클릭 → "Account"
2. "Public Key" 복사 (예: AbCdEfGhIjKlMnOp)

---------------------------------------------------
STEP 5. js/apply.js 에 값 입력
---------------------------------------------------
c:\JD1\js\apply.js 파일 상단 3줄을 수정하세요:

  const EMAILJS_PUBLIC_KEY  = 'AbCdEfGhIjKlMnOp';   ← 여기에 Public Key
  const EMAILJS_SERVICE_ID  = 'service_abc123';       ← 여기에 Service ID
  const EMAILJS_TEMPLATE_ID = 'template_xyz456';      ← 여기에 Template ID

---------------------------------------------------
설정 완료 후 apply.html 을 열고 테스트 신청해보세요!
문의: yundu0112@gmail.com
===================================================
