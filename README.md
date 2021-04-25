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

```shell
$~/node.js_training> node app.js
```

전자는 nodemon을 사용했으므로, 코드를 수정하여도 자동으로 적용된다. 전자와 후자 둘중에 편한 방법으로 실행하면 된다. 기본 포트는 3000번으로 설정하였다.

만약 포트 번호를 변경하고 싶다면, ```app.js``` 에서 ```app.set('port', 3000);``` 를 수정하면 된다.


4. DB 튜닝 및 느낀점

개인적으로 DB 관계와 concept를 이해하는데 조금 어려움을 겪었다. 그래서 그런가 DB를 튜닝하기에는 시간이 부족해서 WITH절을 많이 사용하여 코드가 꽤 지저분한 것이 아쉽다. 또한 VIEW를 사용하여 임시 테이블을 만들어 본 적이 처음이라 생성하고 추후에 어떻게 관리해야하는지 잘 몰랐고, 제거하지 않으면 데이터가 변함에 따라 임시 테이블은 변하지 않으므로 문제가 될 것 같아 생성하고 사용한 뒤에는 삭제하였다.

우선순위를 정하는데에 있어, 1번과 3번을 먼저 구현한 이유는, 2번의 뜻이 모호했다고 생각했기 때문이다. concept_id를 검색하였을 때, 어떤 이름이고 어떤 뜻인지를 알려주는 API를 구현하는 것인지, 각 테이블마다 어떤 concept가 있고, 어느 범위의 concept_id를 가질 수 있으며, 어떤 뜻인지를 알려주는 API를 구현하는 것인지 확신이 잘 서지 않았다. 그래서 가장 뒤로 미뤄두고 1, 3번을 먼저 구현하였다.

2번을 어떻게 구현할 것인지 생각해보면, 키워드 검색 기능같은 경우는 간단할 것이라고 생각한다. ```GET	/api/concept-id/:concept_id``` URI와 concept_id param을 이용하여 concept 테이블에서 검색하여 데이터를 보내면 될 것이다. 테이블마다 어떤 concept를 가지고 있고, 어떤 종류의 concept이 있는지를 알려주는 api는 복잡할 것이다. 우선 ```GET	/api/concept-id/tables/:table_name``` URI를 통해 접속을 하고, 테이블마다 가지고 있는 concept이 다 다르다. 이에 맞추어, concept 테이블에서 class가 테이블 별 concept를 분류하였다. 예를 들면, race_concept은 concept 테이블에서 Race class를 통해 확인할 수 있다. 선택한 테이블이 가지고 있는 concept을 확인하고, concept 테이블에서 적합한 class를 찾은 뒤, id와 name을 분류하여 전송하는 방식으로 접근하면 복잡하지만 해결할 수 있다고 생각한다.

최대한 RESTful한 api를 짜려고 노력하였다. 예를 들면, 헤더에 'Accept-Range', 'Link', 'Content-Type'을 사용하였고, http 상태 코드도 상황에 맞게 사용하려고 노력하였다. 다만 5xx 상태코드는 사용자에게 전송하면 안되지만, nginx같은 프록시 서버가 앞에 있다고 구현하였다.
