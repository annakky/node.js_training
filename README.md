# node.js_training

### API 문서 주소 : https://www.notion.so/e4902d1a8b0e47dd866fb7eafbd0a8ab?v=366742f224424fee80ca14235dfc38a3
(표에서 첫번째 열, Method를 확인하면 uri 예시와 respond 예시를 확인할 수 있도록 해두었다.

## 사용 방법

1. 기본 설정

사용하기 전, node.js를 설치하여야한다.

node.js가 설치되어있거나, 설치했다면,

```shell
git clone <url>

cd node.js_training
npm install
```
위 코드를 통해 기본설정을 해야한다.


2. 데이터베이스 설정

```config/database.js``` 에서 테스트해볼 데이터베이스 정보를 알맞게 설정한다.


3. 실행

```shell
$~/node.js_training> node start
```

nodemon을 사용했으므로, 코드를 수정하여도 자동으로 적용된다. 기본 포트는 3000번으로 설정하였다.

만약 포트 번호를 변경하고 싶다면, ```app.js``` 에서 ```app.set('port', 3000);``` 를 수정하면 된다.
