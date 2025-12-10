# Git 푸시 권한 오류 해결 가이드

## 문제 상황

```
remote: Permission to habakdev-cloud/1210-map.git denied to heejin0330.
fatal: unable to access 'https://github.com/habakdev-cloud/1210-map.git/': The requested URL returned error: 403
```

## 원인

`heejin0330` 계정이 `habakdev-cloud` 조직의 저장소에 대한 쓰기 권한이 없습니다.

## 해결 방법

### 방법 1: 조직 멤버 권한 확인 (권장)

1. **GitHub에서 조직 멤버 확인**
   - GitHub에 로그인
   - `habakdev-cloud` 조직 페이지로 이동
   - 조직 설정에서 멤버 목록 확인
   - `heejin0330` 계정이 멤버인지 확인

2. **저장소 권한 확인**
   - `habakdev-cloud/1210-map` 저장소로 이동
   - Settings → Collaborators에서 접근 권한 확인
   - 필요시 저장소 관리자에게 쓰기 권한 요청

3. **초대 수락**
   - GitHub 이메일에서 조직/저장소 초대 확인
   - 초대가 있다면 수락

### 방법 2: 개인 저장소로 원격 URL 변경

본인 계정(`heejin0330`)의 저장소로 변경하려면:

```bash
# 1. 개인 GitHub 저장소 생성 (GitHub 웹사이트에서)
# 예: https://github.com/heejin0330/1210-map

# 2. 원격 저장소 URL 변경
git remote set-url origin https://github.com/heejin0330/1210-map.git

# 3. 변경 확인
git remote -v

# 4. 푸시 재시도
git push -u origin main
```

### 방법 3: Personal Access Token 사용

HTTPS 인증을 위해 Personal Access Token을 사용:

1. **토큰 생성**
   - GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - "Generate new token (classic)" 클릭
   - 권한: `repo` 체크
   - 토큰 생성 후 복사 (한 번만 표시됨!)

2. **토큰으로 푸시**
   ```bash
   # 사용자명: heejin0330
   # 비밀번호: Personal Access Token 입력
   git push -u origin main
   ```

### 방법 4: SSH 키 사용 (고급)

SSH 키를 사용하여 인증:

```bash
# 1. 원격 URL을 SSH 형식으로 변경
git remote set-url origin git@github.com:habakdev-cloud/1210-map.git

# 2. SSH 키가 없다면 생성
ssh-keygen -t ed25519 -C "hjin82@gmail.com"

# 3. 공개 키를 GitHub에 등록
# Windows: type %USERPROFILE%\.ssh\id_ed25519.pub
# 키 내용을 GitHub → Settings → SSH and GPG keys에 추가

# 4. 푸시
git push -u origin main
```

## 현재 설정 확인

```bash
# 원격 저장소 URL 확인
git remote -v

# Git 사용자 정보 확인
git config user.name
git config user.email
```

## 추천 해결 순서

1. ✅ **조직 권한 확인** - 가장 간단하고 일반적인 해결책
2. ✅ **Personal Access Token 사용** - 빠른 해결책
3. ✅ **개인 저장소로 변경** - 조직 권한이 필요 없는 경우
4. ✅ **SSH 키 사용** - 장기적으로 안전한 방법

## 참고

- GitHub 저장소 권한은 저장소 소유자나 조직 관리자가 부여할 수 있습니다
- 403 오류는 인증 문제가 아니라 권한 문제입니다
- Personal Access Token은 비밀번호처럼 안전하게 보관하세요

