# 3초 생존 - Design Specification

## Aesthetic Direction: "Neon Arcade Nightscape"

CRT 모니터를 통해 보는 레트로 아케이드 캐비넷 — 깊은 심야 톤의 배경 위에 네온 글로우가 살아 숨쉬는 디자인.

---

## 1. Design Tokens

### Colors

| Token | Value | Usage |
|---|---|---|
| `--arc-bg` | `#0a0e17` | 전체 배경 (깊은 네이비-블랙) |
| `--arc-surface` | `#111827` | 카드, 오버레이 배경 |
| `--arc-surface-light` | `#1e293b` | 보더, 구분선 |
| `--arc-text` | `#e2e8f0` | 기본 텍스트 |
| `--arc-muted` | `#64748b` | 보조 텍스트, 힌트 |
| `--arc-green` | `#39ff14` | **Primary accent** — 네온 그린 |
| `--arc-green-dim` | `#1a7a0a` | 그린 서브톤 |
| `--arc-green-glow` | `rgba(57,255,20,0.4)` | 그린 글로우 이펙트 |
| `--arc-amber` | `#ffb800` | 점수, 골드 하이라이트 |
| `--arc-amber-glow` | `rgba(255,184,0,0.3)` | 앰버 글로우 |
| `--arc-cyan` | `#00e5ff` | 보조 액센트 |
| `--arc-danger` | `#ff3b5c` | 실패, 경고 |
| `--arc-danger-glow` | `rgba(255,59,92,0.4)` | 위험 글로우 |
| `--arc-success` | `#39ff14` | 성공 (그린과 동일) |

### Game Colors (미션용)

| Token | Value |
|---|---|
| `--color-red` | `#ff3b5c` |
| `--color-blue` | `#448aff` |
| `--color-yellow` | `#ffd600` |
| `--color-green` | `#00e676` |
| `--color-purple` | `#d500f9` |

---

## 2. Typography

- **Font**: `Galmuri11` (로컬 woff2 픽셀 폰트)
- **Fallback**: `monospace`
- 픽셀 폰트 특성상 `font-smoothing` 비활성화로 선명도 유지

### Scale

| Element | Size | Weight |
|---|---|---|
| 메인 타이틀 숫자 | 96px | 900 |
| 메인 타이틀 텍스트 | 36px | 700 |
| 게임 점수 | 48px | 900 |
| 미션 텍스트 | 32px | 900 |
| 페이즈 뱃지 | 24-32px | 700 |
| 버튼 라벨 | 18-20px | 700 |
| 힌트/보조 텍스트 | 13-16px | 400 |

---

## 3. Visual Effects

### Scanlines
전체 화면에 CRT 스캔라인 오버레이. 2px 간격의 반투명 검정 줄무늬.
```css
background: repeating-linear-gradient(
  to bottom,
  transparent 0px, transparent 2px,
  rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px
);
```

### Neon Glow
주요 요소에 다중 레이어 `text-shadow` / `box-shadow`:
- 근거리 글로우 (20px, 높은 불투명도)
- 중거리 글로우 (60px, 중간 불투명도)
- 원거리 글로우 (120px, 낮은 불투명도)

### Background Atmosphere
배경에 미묘한 radial-gradient 오버레이:
- 상단: 그린 글로우 (6% 불투명도)
- 하단: 앰버 글로우 (4% 불투명도)

### City Skyline (MainScreen only)
CSS-only 2레이어 도시 실루엣:
- Back layer: `#0f1a2e` (반투명, 더 높은 빌딩)
- Front layer: `#070d1a` (불투명, radial-gradient 창문 불빛)

### Stars (MainScreen only)
30개의 `span` 요소, 절차적 배치, stagger된 twinkle 애니메이션.

---

## 4. Animation Catalog

| Name | Duration | Easing | Usage |
|---|---|---|---|
| `twinkle` | 1.5-3.1s | ease-in-out | 별 반짝임 |
| `num-breathe` | 3s | ease-in-out | 타이틀 숫자 글로우 |
| `btn-pulse` | 2.5s | ease-in-out | 시작 버튼 글로우 |
| `shake` | 0.3s | ease-in-out | 실패 시 화면 흔들림 |
| `score-pop` | 0.3s | ease-out | 점수 획득 팝 |
| `fade-in` | 0.3s | ease-out | 요소 등장 |
| `flash-red` | 0.4s | ease-out | 피드백 플래시 |
| `particle-fly` | 0.5s | ease-out | 파티클 버스트 |
| `pulse` | 0.6-1s | ease-in-out | 범용 펄스 |
| `mission-enter` | 0.3s | ease-out | 미션 텍스트 등장 |
| `pulse-warning` | 0.6s | ease-in-out | 위험 경고 펄스 |

---

## 5. Component Design

### MainScreen
- 전체화면 배경 + 별 + 도시 스카이라인
- 거대한 "3" (네온 그린) + "초 생존 게임"
- 아케이드 스타일 시작 버튼 (그린 네온 보더)
- 최고 점수 뱃지 (앰버/골드)

### GameView
- 스캔라인 오버레이
- 상단: 타이머 바 + 점수
- 중앙: 미션 텍스트 + 미션 컨텐츠
- 하단: 페이즈 뱃지

### TimerBar
- 높이 6px, 네온 그린 바
- active 시 글로우 이펙트
- 30% 미만 시 `--arc-danger` 색상 + 레드 글로우

### ScoreDisplay
- 48px 점수, 앰버 네온 글로우
- "점수:" 라벨 (muted)
- 점수 증가 시 pop 애니메이션

### MissionText
- 32px 볼드, 네온 그린 글로우
- mission-enter 애니메이션으로 등장

### Mission Components
- **ColorTap**: 80px 원형 버튼, 각 색상별 네온 글로우 보더
- **Swipe**: 96px 화살표, 네온 그린 (reverse: 레드)
- **MultiTap**: 카운터 + 프로그레스 바 (네온 그린)
- **LongPress**: 120px 원형 타겟, 네온 보더, 누르면 시안 글로우
- **DualTap**: 쌍 원형 타겟, 펄스 애니메이션
- **DoNothing**: 위험 아이콘 + "참아!" (레드 네온)
- **Sequence**: 64px 스텝 카드, 진행 상태별 색상 변화

### ResultOverlay
- 반투명 다크 오버레이
- 아케이드 스타일 카드 (네온 보더)
- 점수 (앰버 네온), NEW RECORD (앰버 펄스)
- 아케이드 스타일 버튼 (그린 primary, 고스트 secondary)

### FeedbackLayer
- 플래시 오버레이 + 파티클 시스템
- 파티클에 네온 글로우 추가

---

## 6. Layout

- 모바일 퍼스트: `max-width: 500px`, 중앙 정렬
- `100dvh` 전체 뷰포트 사용
- `touch-action: none` 제스처 충돌 방지
- `safe-area-inset` 노치 대응
