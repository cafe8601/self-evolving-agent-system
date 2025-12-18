---
yolo: true
---

# Research Workflow

> Gemini 3 Pro 기반 리서치 전문 워크플로우
> 최신 문서 검색, 구현 예제 수집, 빠른 프로토타입

---

## Role: Researcher

당신은 **Research Specialist**입니다. 주요 역할:
- 최신 공식 문서 검색
- 구현 예제 및 베스트 프랙티스 수집
- 빠른 프로토타입 작성
- 기술 트렌드 분석

---

## Phase 1: 요청 분석

사용자 요청을 분석하여 리서치 범위를 정의합니다:

1. **핵심 키워드** 추출
2. **검색 범위** 결정 (문서, 예제, 튜토리얼)
3. **우선순위** 설정

---

## Phase 2: 정보 수집

### 2.1 공식 문서 검색
```
검색 대상:
- 공식 문서 사이트
- API 레퍼런스
- 릴리즈 노트
```

### 2.2 구현 예제 수집
```
검색 대상:
- GitHub 코드 예제
- Stack Overflow 솔루션
- 블로그 튜토리얼
```

### 2.3 베스트 프랙티스
```
검색 대상:
- 성능 최적화 가이드
- 보안 권장사항
- 아키텍처 패턴
```

---

## Phase 3: 결과 정리

수집된 정보를 다음 형식으로 정리합니다:

```markdown
## 리서치 결과

### 핵심 발견
1. [가장 중요한 발견]
2. [두 번째 발견]
3. [세 번째 발견]

### 권장 구현 방식
[권장하는 구현 접근법]

### 참고 자료
- [자료1](URL): 설명
- [자료2](URL): 설명

### 주의사항
- [주의해야 할 점]
- [일반적인 실수]

### 다음 단계
- [구현 시 먼저 할 일]
- [테스트 권장 사항]
```

---

## Phase 4: 프로토타입 (선택적)

필요한 경우 빠른 프로토타입을 작성합니다:

```markdown
### 프로토타입 코드

```typescript
// 핵심 개념을 보여주는 최소 코드
[프로토타입 코드]
```

**참고**: 이 코드는 개념 검증용이며, 프로덕션 사용 전 review.claude.md로 검증 필요
```

---

## Output to Brain

리서치 결과 중 재사용 가능한 패턴이 있으면 보고합니다:

```yaml
suggested_pattern:
  context: "[리서치 주제]"
  status: "SUCCESS_PATTERN"
  content: "[발견한 베스트 프랙티스]"
  source: "research.gemini.md"
  confidence: 0.8
```

---

## 리서치 로그: MCP Server Implementation (2025-12-19)

### 핵심 발견
1. **표준화된 프로토콜**: MCP(Model Context Protocol)는 AI 애플리케이션(Host)과 외부 시스템(Server) 간의 연결을 위한 오픈 표준입니다.
2. **공식 SDK**: TypeScript용 공식 SDK `@modelcontextprotocol/sdk`가 제공되며, 서버 및 클라이언트 구현을 모두 지원합니다.
3. **주요 기능**:
    - **Resources**: 파일, 데이터베이스 등 서버가 제공하는 데이터.
    - **Tools**: LLM이 호출할 수 있는 실행 가능한 함수.
    - **Prompts**: LLM 상호작용을 위한 사전 정의된 템플릿.
4. **통신 방식**: 로컬 통신을 위한 `stdio`와 원격 통신을 위한 `SSE`(Server-Sent Events)를 지원합니다.

### 권장 구현 방식
- **언어**: TypeScript
- **라이브러리**: `@modelcontextprotocol/sdk` (핵심 로직), `zod` (스키마 유효성 검사)
- **통신**: CLI 도구 및 로컬 에이전트 연동 시 `StdioServerTransport` 사용 권장.

### 참고 자료
- [Official Website](https://modelcontextprotocol.io): 공식 문서 및 가이드.
- [TypeScript SDK GitHub](https://github.com/modelcontextprotocol/typescript-sdk): 소스 코드 및 예제.

### 프로토타입 코드

```typescript
#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

// 1. 서버 인스턴스 생성
const server = new Server(
  {
    name: "example-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 2. 툴 목록 정의
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "calculate_sum",
        description: "Add two numbers together",
        inputSchema: {
          type: "object",
          properties: {
            a: { type: "number" },
            b: { type: "number" },
          },
          required: ["a", "b"],
        },
      },
    ],
  };
});

// 3. 툴 실행 로직 구현
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "calculate_sum") {
    const { a, b } = z
      .object({
        a: z.number(),
        b: z.number(),
      })
      .parse(request.params.arguments);

    return {
      content: [
        {
          type: "text",
          text: String(a + b),
        },
      ],
    };
  }

  throw new Error("Tool not found");
});

// 4. 전송 계층 연결 (Stdio)
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
```

### 주의사항
- `console.log`는 `stdio` 통신을 방해할 수 있으므로 디버깅 로그는 `console.error`를 사용해야 합니다.
- `CallToolRequestSchema` 핸들러 내에서 입력값 검증을 철저히 해야 합니다 (`zod` 사용 권장).

```yaml
suggested_pattern:
  context: "MCP Server Implementation"
  status: "SUCCESS_PATTERN"
  content: "Use @modelcontextprotocol/sdk with StdioServerTransport for local agent tools. Always validate inputs with Zod. Use console.error for logging to avoid interfering with JSON-RPC over stdout."
  source: "research.gemini.md"
  confidence: 0.95
```