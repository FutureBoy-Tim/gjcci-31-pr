# 광진구상공회 CEO 아카데미 31기 회원 명부

광진구상공회 CEO 아카데미 31기 회원 52명의 명부를 검색·업종 필터·상세 페이지로 볼 수 있는 정적 사이트입니다.
빌드 도구 없이 HTML/CSS/JS와 JSON 하나로 동작합니다.

- 사이트: https://futureboy-tim.github.io/gjcci-31-pr/
- 회원 상세: https://futureboy-tim.github.io/gjcci-31-pr/member.html?id=m01

## 구조

```
├─ index.html                 메인 (검색 · 업종 필터 · 회원 카드)
├─ member.html                회원 상세 (member.html?id=m01)
├─ data/members.json          회원 데이터 (연락처 전체 공개)
├─ assets/css/style.css
├─ assets/js/app.js           데이터 로드 · 검색 · 필터 · 상세 렌더
├─ assets/members/{id}/profile.png  회원 프로필 사진 (44명)
└─ robots.txt                 검색엔진 수집 차단
```

## 개인정보

- 명부에는 회원수첩(gjcci.okmb.kr) 31기 상세에 등록된 정보가 그대로 들어 있습니다. 이름·회사·직위·업종·주소·전화·팩스·휴대폰·이메일·사업자등록번호·프로필 사진이 모두 공개되어 있습니다.
- 검색엔진 수집 방지를 위해 `robots.txt`와 `<meta name="robots" content="noindex, nofollow">`를 적용했습니다. 링크를 아는 사람은 열람할 수 있습니다.
- 본인 정보 수정·비공개 요청: adjinpr@naver.com (정리: 이형진 / 주식회사 다은컴즈, 운영: 31기 총무진)

## 데이터 출처

광진구상공회 회원수첩 31기 회원 상세 정보 · 2026-11-18 수집.
52명 중 27명은 회원수첩에 직장명·직위·업종이 등록되어 있지 않아 `업종 미입력`으로 표시됩니다.
