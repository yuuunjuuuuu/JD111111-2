// =====================================================
// EmailJS 설정
// 아래 세 값을 본인의 EmailJS 계정 정보로 교체하세요.
// 설정 방법은 README_EMAILJS.txt 파일을 참고하세요.
// =====================================================
const EMAILJS_PUBLIC_KEY  = '7ja7hs_jtoLt3qUDh';
const EMAILJS_SERVICE_ID  = 'yundu0112';
const EMAILJS_TEMPLATE_ID = 'template_w9se4a5';

try { emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY }); } catch(e) { console.warn('EmailJS 초기화 실패:', e); }

// ===== 성별 버튼 선택 처리 =====
document.querySelectorAll('.gender-label').forEach(label => {
  label.addEventListener('click', function() {
    document.querySelectorAll('.gender-label').forEach(l => l.classList.remove('selected'));
    this.classList.add('selected');
    const radio = this.querySelector('input[type="radio"]');
    if (radio) radio.checked = true;
  });
});

// ===== 참여 가능 시간 그리드 (요일 x 1시간 단위) =====
const SCHEDULE_DAYS = ['월', '화', '수', '목', '금', '토', '일'];
const scheduleSelected = new Set(); // "요일-시" 예: "월-9"
const scheduleGridEl = document.getElementById('scheduleGrid');

function buildScheduleGrid() {
  if (!scheduleGridEl) return;

  const corner = document.createElement('div');
  corner.className = 'sg-corner';
  scheduleGridEl.appendChild(corner);

  SCHEDULE_DAYS.forEach(day => {
    const head = document.createElement('div');
    head.className = 'sg-day-head';
    head.textContent = day;
    scheduleGridEl.appendChild(head);
  });

  for (let hour = 0; hour < 24; hour++) {
    const label = document.createElement('div');
    label.className = 'sg-hour-label';
    label.textContent = String(hour).padStart(2, '0');
    scheduleGridEl.appendChild(label);

    SCHEDULE_DAYS.forEach(day => {
      const cell = document.createElement('div');
      cell.className = 'sg-cell';
      cell.dataset.day = day;
      cell.dataset.hour = String(hour);
      scheduleGridEl.appendChild(cell);
    });
  }
}
buildScheduleGrid();

let scheduleDragging = false;
let schedulePaintValue = true;

function toggleScheduleCell(cell, value) {
  const key = `${cell.dataset.day}-${cell.dataset.hour}`;
  cell.classList.toggle('selected', value);
  if (value) scheduleSelected.add(key);
  else scheduleSelected.delete(key);
}

if (scheduleGridEl) {
  scheduleGridEl.addEventListener('mousedown', (e) => {
    const cell = e.target.closest('.sg-cell');
    if (!cell) return;
    e.preventDefault();
    scheduleDragging = true;
    schedulePaintValue = !cell.classList.contains('selected');
    toggleScheduleCell(cell, schedulePaintValue);
  });
  scheduleGridEl.addEventListener('mouseover', (e) => {
    if (!scheduleDragging) return;
    const cell = e.target.closest('.sg-cell');
    if (!cell) return;
    toggleScheduleCell(cell, schedulePaintValue);
  });
  scheduleGridEl.addEventListener('touchstart', (e) => {
    const cell = e.target.closest('.sg-cell');
    if (!cell) return;
    scheduleDragging = true;
    schedulePaintValue = !cell.classList.contains('selected');
    toggleScheduleCell(cell, schedulePaintValue);
  }, { passive: true });
  scheduleGridEl.addEventListener('touchmove', (e) => {
    if (!scheduleDragging) return;
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const cell = el && el.closest('.sg-cell');
    if (!cell) return;
    e.preventDefault();
    toggleScheduleCell(cell, schedulePaintValue);
  }, { passive: false });
}
document.addEventListener('mouseup', () => { scheduleDragging = false; });
document.addEventListener('touchend', () => { scheduleDragging = false; });

const scheduleClearBtn = document.getElementById('scheduleClearBtn');
if (scheduleClearBtn) {
  scheduleClearBtn.addEventListener('click', () => {
    scheduleSelected.clear();
    scheduleGridEl.querySelectorAll('.sg-cell.selected').forEach(cell => cell.classList.remove('selected'));
  });
}

function formatScheduleSummary() {
  return SCHEDULE_DAYS
    .map(day => {
      const hours = [...scheduleSelected]
        .filter(key => key.startsWith(`${day}-`))
        .map(key => Number(key.split('-')[1]))
        .sort((a, b) => a - b);
      if (!hours.length) return null;

      const ranges = [];
      let start = hours[0];
      let prev = hours[0];
      for (let i = 1; i <= hours.length; i++) {
        const h = hours[i];
        if (h === prev + 1) { prev = h; continue; }
        ranges.push(`${String(start).padStart(2, '0')}~${String(prev + 1).padStart(2, '0')}시`);
        start = h; prev = h;
      }
      return `${day} ${ranges.join(', ')}`;
    })
    .filter(Boolean)
    .join(' / ');
}

// ===== 글자수 카운터 =====
const motivationEl = document.getElementById('motivation');
const countEl      = document.getElementById('motivationCount');

if (motivationEl && countEl) {
  motivationEl.addEventListener('input', () => {
    const len = motivationEl.value.length;
    countEl.textContent = len;
    countEl.style.color = len >= 10 ? '#16a34a' : '#dc2626';
  });
}

// ===== 유효성 검사 =====
function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = msg;
    if (msg) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}
function clearErrors() {
  ['nameErr','ageErr','genderErr','phoneErr','emailErr','locationErr','scheduleErr','experienceErr','motivationErr','privacyErr']
    .forEach(id => showError(id, ''));
}

function validateForm(data) {
  let valid = true;

  if (!data.name.trim()) {
    showError('nameErr', '이름을 입력해주세요.'); valid = false;
  }

  if (!data.age) {
    showError('ageErr', '나이를 입력해주세요.'); valid = false;
  } else if (isNaN(data.age) || data.age < 1 || data.age > 99) {
    showError('ageErr', '올바른 나이를 입력해주세요.'); valid = false;
  }

  if (!data.gender) {
    showError('genderErr', '성별을 선택해주세요.'); valid = false;
  }

  if (!data.phone.trim()) {
    showError('phoneErr', '연락처를 입력해주세요.'); valid = false;
  } else if (!/^[0-9\-+\s]{9,15}$/.test(data.phone.trim())) {
    showError('phoneErr', '올바른 연락처 형식을 입력해주세요.'); valid = false;
  }

  if (!data.email.trim()) {
    showError('emailErr', '이메일을 입력해주세요.'); valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    showError('emailErr', '올바른 이메일 주소를 입력해주세요.'); valid = false;
  }

  if (!data.location.trim()) {
    showError('locationErr', '가까운 지하철역을 입력해주세요.'); valid = false;
  }

  if (!data.scheduleSummary) {
    showError('scheduleErr', '참여 가능한 시간을 1칸 이상 선택해주세요.'); valid = false;
  }

  if (!data.experience) {
    showError('experienceErr', '경험 수준을 선택해주세요.'); valid = false;
  }

  if (!data.motivation.trim()) {
    showError('motivationErr', '지원 동기를 입력해주세요.'); valid = false;
  } else if (data.motivation.trim().length < 10) {
    showError('motivationErr', `10자 이상 작성해주세요. (현재 ${data.motivation.trim().length}자)`); valid = false;
  }

  if (!data.privacy) {
    showError('privacyErr', '개인정보 수집에 동의해주세요.'); valid = false;
  }

  return valid;
}

// ===== 경험 수준 레이블 =====
const experienceLabels = {
  none:         '완전 초보 (경험 없음)',
  beginner:     '엑셀/기초 통계 정도 사용 가능',
  intermediate: 'Python 기초 문법은 알고 있음',
  advanced:     '데이터분석 경험 있음',
};

// ===== 폼 제출 =====
const form       = document.getElementById('applyForm');
const submitBtn  = document.getElementById('submitBtn');
const submitText = document.getElementById('submitText');
const submitLoad = document.getElementById('submitLoading');
const successMsg = document.getElementById('successMsg');
const submittedEmailEl = document.getElementById('submittedEmail');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const experienceRadio = document.querySelector('input[name="experience"]:checked');

    const genderRadio = document.querySelector('input[name="gender"]:checked');

    const scheduleSummary = formatScheduleSummary();
    document.getElementById('scheduleSummary').value = scheduleSummary;

    const data = {
      name:       document.getElementById('name').value,
      age:        document.getElementById('age').value,
      gender:     genderRadio ? genderRadio.value : '',
      phone:      document.getElementById('phone').value,
      email:      document.getElementById('email').value,
      school:     document.getElementById('school').value || '미입력',
      location:   document.getElementById('location').value,
      scheduleSummary: scheduleSummary,
      experience: experienceRadio ? experienceRadio.value : '',
      expDetail:  document.getElementById('expDetail').value || '없음',
      motivation: document.getElementById('motivation').value,
      goal:       document.getElementById('goal').value || '없음',
      privacy:    document.getElementById('privacy').checked,
    };

    if (!validateForm(data)) return;

    // 로딩 상태
    submitBtn.disabled = true;
    submitText.style.display = 'none';
    submitLoad.style.display = 'inline';

    const templateParams = {
      to_email:   'yundu0112@gmail.com',
      from_name:  data.name,
      from_age:   data.age,
      from_gender: data.gender,
      from_phone: data.phone,
      from_email: data.email,
      school:     data.school,
      location:   data.location,
      available_time: data.scheduleSummary,
      experience: experienceLabels[data.experience] || data.experience,
      exp_detail: data.expDetail,
      motivation: data.motivation,
      goal:       data.goal,
      apply_date: new Date().toLocaleString('ko-KR'),
    };

    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);

      // 성공
      form.style.display = 'none';
      successMsg.style.display = 'block';
      if (submittedEmailEl) submittedEmailEl.textContent = data.email;

    } catch (err) {
      console.error('EmailJS 오류:', err);
      alert('전송 중 오류가 발생했습니다. 잠시 후 다시 시도하거나 이메일(yundu0112@gmail.com)로 직접 문의해주세요.');

      submitBtn.disabled = false;
      submitText.style.display = 'inline';
      submitLoad.style.display = 'none';
    }
  });
}
