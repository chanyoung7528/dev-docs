import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function FormArchitecturePage() {
  return (
    <DocLayout
      title="폼 공통 설계 (RHF + Zod)"
      description="react-hook-form + Zod 기반 폼 시스템의 공통 아키텍처, 스키마 설계, 비동기 검증, 스텝 폼 패턴입니다."
    >
      <h2>아키텍처 개요</h2>

      <CodeBlock
        language="text"
        code={`┌─────────────────────────────────────────────────────┐
│  Schema Layer (domains/*.schema.ts)                 │
│  - Zod 스키마 정의 (유효성 규칙의 Single Source)       │
│  - z.infer로 타입 자동 추론                           │
│  - API 검증에도 재사용 가능                            │
├─────────────────────────────────────────────────────┤
│  Hook Layer (features/*/hooks/useXxxForm.ts)        │
│  - useForm + zodResolver 연결                        │
│  - 비동기 검증 (중복 확인 등)                          │
│  - 제출 로직 (API 호출 + 성공/실패 처리)              │
│  - 폼 상태 파생 (isFormValid, isSubmitting)          │
├─────────────────────────────────────────────────────┤
│  Input Hook (shared/hooks/useInputValidation.ts)    │
│  - useController로 RHF 연결                          │
│  - 포커스/터치 상태 관리                              │
│  - 규칙별 통과 여부 (UI 피드백용)                     │
├─────────────────────────────────────────────────────┤
│  UI Layer (features/*/ui/)                          │
│  - 폼 컴포넌트 (시각적 렌더링만)                      │
│  - 에러 메시지 표시                                   │
│  - 버튼 활성화/비활성화                               │
└─────────────────────────────────────────────────────┘`}
      />

      <h2>Zod 스키마 설계 패턴</h2>

      <h3>기본: 필드별 규칙 체이닝</h3>

      <CodeBlock
        filename="member.schema.ts"
        language="typescript"
        code={`import { z } from 'zod';

// 재사용 가능한 필드 스키마 (공통 규칙)
const passwordSchema = z
  .string()
  .min(10, '비밀번호는 10자 이상이어야 합니다')
  .max(15, '비밀번호는 15자 이하여야 합니다')
  .regex(/[a-zA-Z]/, '영문을 포함해야 합니다')
  .regex(/\\d/, '숫자를 포함해야 합니다')
  .regex(/[!@#$%^&*]/, '특수문자를 포함해야 합니다');

const phoneSchema = z
  .string()
  .regex(/^01[016789]\\d{7,8}$/, '올바른 휴대폰 번호를 입력하세요');

const emailSchema = z
  .string()
  .email('올바른 이메일을 입력하세요');`}
        highlight={[4, 12, 16]}
      />

      <h3>교차 필드 검증 (refine / superRefine)</h3>

      <CodeBlock
        filename="signup.schema.ts"
        language="typescript"
        code={`export const signupSchema = z
  .object({
    loginId: z.string().min(6).max(15).regex(/^[a-z0-9]+$/),
    password: passwordSchema,
    passwordConfirm: z.string().min(1, '비밀번호 확인을 입력하세요'),
    agreeTerms: z.boolean(),
    agreePrivacy: z.boolean(),
  })
  // refine: 단일 조건
  .refine(data => data.password === data.passwordConfirm, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['passwordConfirm'],
  })
  // superRefine: 여러 조건 (세밀한 에러 제어)
  .superRefine((data, ctx) => {
    if (!data.agreeTerms) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '이용약관에 동의해주세요',
        path: ['agreeTerms'],
      });
    }
    if (!data.agreePrivacy) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '개인정보 처리방침에 동의해주세요',
        path: ['agreePrivacy'],
      });
    }
  });

// 타입 자동 추론 — 스키마가 타입의 Single Source of Truth
export type SignupForm = z.infer<typeof signupSchema>;
// { loginId: string; password: string; passwordConfirm: string;
//   agreeTerms: boolean; agreePrivacy: boolean }`}
        highlight={[10, 11, 12, 15, 16, 17, 18, 19, 33]}
      />

      <Callout variant="note">
        <p>
          <code>refine</code>은 단일 조건 하나,{" "}
          <code>superRefine</code>은 여러 에러를 동시에 추가할 수 있습니다.
          교차 필드 검증이 2개 이상이면 superRefine을 쓰세요.
        </p>
      </Callout>

      <h3>조건부 스키마 (discriminatedUnion)</h3>

      <CodeBlock
        language="typescript"
        code={`// 회원 유형에 따라 다른 필드 요구
const memberSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('individual'),
    name: z.string().min(1),
    ssn: z.string().regex(/^\\d{6}-\\d{7}$/),
  }),
  z.object({
    type: z.literal('corporation'),
    companyName: z.string().min(1),
    bizNo: z.string().regex(/^\\d{3}-\\d{2}-\\d{5}$/),
    representative: z.string().min(1),
  }),
]);

// type이 'individual'이면 ssn 필수, bizNo 불필요
// type이 'corporation'이면 bizNo 필수, ssn 불필요
type MemberForm = z.infer<typeof memberSchema>;`}
        highlight={[2, 3, 8]}
      />

      <h2>useForm 공통 설정</h2>

      <CodeBlock
        filename="useSignupForm.ts"
        language="typescript"
        code={`import { useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export function useSignupForm() {
  const form = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),

    // mode 옵션 선택 기준
    // 'onChange'  — 입력 즉시 검증 (실시간 피드백, 비용 높음)
    // 'onBlur'    — 포커스 해제 시 검증 (UX 적절, 보통 이거)
    // 'onSubmit'  — 제출 시만 검증 (간단한 폼)
    // 'onTouched' — 첫 blur 이후부터 onChange (권장)
    mode: 'onTouched',

    defaultValues: {
      loginId: '',
      password: '',
      passwordConfirm: '',
      agreeTerms: false,
      agreePrivacy: false,
    },
  });

  // 파생 상태
  const { isValid, isSubmitting, errors, dirtyFields } = form.formState;

  // 실제 폼 유효성 (Zod 검증 + 비동기 검증 모두 통과)
  const [isIdChecked, setIsIdChecked] = useState(false);
  const isFormValid = isValid && isIdChecked;

  return {
    form,
    isFormValid,
    isSubmitting,
    errors,
    // ...handlers
  };
}`}
        highlight={[6, 13, 25, 29]}
      />

      <h2>비동기 검증 (서버 중복 확인)</h2>

      <CodeBlock
        filename="useSignupForm.ts"
        language="typescript"
        code={`// 패턴: Zod는 동기 검증, 비동기 검증은 setError로 별도 처리
async function handleCheckDuplicate(loginId: string): Promise<boolean> {
  // 1. Zod 스키마로 먼저 동기 검증
  const fieldValid = await form.trigger('loginId');
  if (!fieldValid) return false;

  // 2. 서버 중복 확인
  try {
    const result = await memberApi.checkDuplicate({ loginId });

    if (!result.data.isAvailable) {
      // RHF에 수동 에러 설정
      form.setError('loginId', {
        type: 'manual',
        message: result.data.message ?? '이미 사용 중인 아이디입니다.',
      });
      return false;
    }

    // 성공: 에러 클리어 + 통과 상태 기록
    form.clearErrors('loginId');
    setIsIdChecked(true);
    return true;
  } catch (error) {
    form.setError('loginId', {
      type: 'manual',
      message: '중복 확인 중 오류가 발생했습니다.',
    });
    return false;
  }
}

// loginId가 변경되면 중복 확인 상태 초기화
useEffect(() => {
  const subscription = form.watch((value, { name }) => {
    if (name === 'loginId') setIsIdChecked(false);
  });
  return () => subscription.unsubscribe();
}, [form]);`}
        highlight={[4, 12, 13, 14, 15, 21, 22, 35, 36, 37]}
      />

      <h2>useInputValidation — 공통 입력 훅</h2>

      <CodeBlock
        filename="useInputValidation.ts"
        language="typescript"
        code={`interface ValidationRule {
  id: string;
  label: string;
  check: (value: string) => boolean;
}

interface UseInputValidationProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  validationRules?: ValidationRule[];
}

export function useInputValidation<T extends FieldValues>({
  name,
  control,
  validationRules = [],
}: UseInputValidationProps<T>) {
  const [isFocused, setIsFocused] = useState(false);
  const [isTouched, setIsTouched] = useState(false);

  // RHF 연결
  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  // 파생 상태
  const hasValue = String(field.value ?? '').length > 0;
  const hasError = !!error && isTouched;

  // 규칙별 통과 여부 (UI에서 체크리스트로 표시)
  const ruleResults = validationRules.map(rule => ({
    ...rule,
    passed: rule.check(String(field.value ?? '')),
  }));

  const allRulesPassed = ruleResults.every(r => r.passed);

  return {
    field,
    error,
    isFocused,
    isTouched,
    hasValue,
    hasError,
    ruleResults,
    allRulesPassed,
    handleFocus: () => setIsFocused(true),
    handleBlur: () => {
      setIsFocused(false);
      setIsTouched(true);
      field.onBlur(); // RHF에 blur 알림
    },
    handleClear: () => {
      field.onChange('');
      setIsTouched(false);
    },
  };
}

// 사용: 비밀번호 입력에 규칙 체크리스트
const passwordRules: ValidationRule[] = [
  { id: 'length', label: '10~15자', check: v => v.length >= 10 && v.length <= 15 },
  { id: 'alpha', label: '영문 포함', check: v => /[a-zA-Z]/.test(v) },
  { id: 'number', label: '숫자 포함', check: v => /\\d/.test(v) },
  { id: 'special', label: '특수문자 포함', check: v => /[!@#$%^&*]/.test(v) },
];

const { ruleResults } = useInputValidation({
  name: 'password',
  control: form.control,
  validationRules: passwordRules,
});

// UI에서:
// ruleResults.map(r => <RuleItem key={r.id} passed={r.passed}>{r.label}</RuleItem>)`}
        highlight={[13, 22, 23, 24, 32, 33, 34, 37, 50, 51, 63, 64, 65, 66]}
      />

      <h2>스텝 폼 (Multi-Step Form)</h2>

      <CodeBlock
        filename="useStepForm.ts"
        language="typescript"
        code={`// 각 스텝에 대한 스키마를 분리
const step1Schema = z.object({
  loginId: z.string().min(6).max(15),
  password: passwordSchema,
  passwordConfirm: z.string(),
}).refine(d => d.password === d.passwordConfirm, {
  path: ['passwordConfirm'], message: '비밀번호 불일치',
});

const step2Schema = z.object({
  name: z.string().min(1, '이름을 입력하세요'),
  phone: phoneSchema,
  verificationCode: z.string().length(6, '인증번호 6자리를 입력하세요'),
});

const step3Schema = z.object({
  agreeTerms: z.literal(true, { errorMap: () => ({ message: '필수 동의' }) }),
  agreePrivacy: z.literal(true, { errorMap: () => ({ message: '필수 동의' }) }),
  agreeMarketing: z.boolean().optional(),
});

// 전체 스키마 = 스텝별 스키마 합치기
const fullSchema = step1Schema.and(step2Schema).and(step3Schema);
type FullFormData = z.infer<typeof fullSchema>;

// 스텝 폼 훅
function useStepForm() {
  const [step, setStep] = useState(1);
  const schemas = [step1Schema, step2Schema, step3Schema];

  const form = useForm<FullFormData>({
    resolver: zodResolver(fullSchema),
    mode: 'onTouched',
    defaultValues: { /* ... */ },
  });

  // 현재 스텝 유효성만 검사
  async function validateCurrentStep(): Promise<boolean> {
    const currentSchema = schemas[step - 1];
    const values = form.getValues();

    const result = currentSchema.safeParse(values);
    if (!result.success) {
      // 현재 스텝 필드의 에러만 설정
      result.error.issues.forEach(issue => {
        const field = issue.path[0] as keyof FullFormData;
        form.setError(field, { message: issue.message });
      });
      return false;
    }
    return true;
  }

  async function handleNext() {
    const valid = await validateCurrentStep();
    if (valid && step < 3) setStep(s => s + 1);
  }

  function handlePrev() {
    if (step > 1) setStep(s => s - 1);
  }

  async function handleSubmit() {
    const valid = await form.trigger(); // 전체 스키마 검증
    if (valid) {
      await submitSignup(form.getValues());
    }
  }

  return { form, step, handleNext, handlePrev, handleSubmit };
}`}
        highlight={[23, 29, 31, 38, 41, 42, 43, 53, 54, 60]}
      />

      <h2>폼 컴포넌트 연결 패턴</h2>

      <CodeBlock
        filename="SignupStep1.tsx"
        language="tsx"
        code={`interface Step1Props {
  form: UseFormReturn<FullFormData>;
  onNext: () => void;
  isIdChecked: boolean;
  onCheckDuplicate: (id: string) => Promise<boolean>;
}

function SignupStep1({ form, onNext, isIdChecked, onCheckDuplicate }: Step1Props) {
  const loginId = useInputValidation({
    name: 'loginId',
    control: form.control,
  });

  const password = useInputValidation({
    name: 'password',
    control: form.control,
    validationRules: passwordRules,
  });

  return (
    <form onSubmit={form.handleSubmit(onNext)}>
      {/* 아이디 */}
      <Input
        label="아이디"
        value={loginId.field.value}
        onChange={loginId.field.onChange}
        onBlur={loginId.handleBlur}
        error={loginId.hasError ? loginId.error?.message : undefined}
        rightSlot={
          <Button
            size="sm"
            disabled={!loginId.hasValue || isIdChecked}
            onClick={() => onCheckDuplicate(loginId.field.value)}
          >
            {isIdChecked ? '확인완료' : '중복확인'}
          </Button>
        }
      />

      {/* 비밀번호 + 규칙 체크리스트 */}
      <Input
        label="비밀번호"
        type="password"
        value={password.field.value}
        onChange={password.field.onChange}
        onBlur={password.handleBlur}
        error={password.hasError ? password.error?.message : undefined}
      />
      <ValidationRuleList rules={password.ruleResults} />

      <Button type="submit" fullWidth disabled={!form.formState.isValid || !isIdChecked}>
        다음
      </Button>
    </form>
  );
}`}
        highlight={[9, 10, 14, 15, 16, 17, 28, 51]}
      />

      <h2>Zod 유틸리티 패턴</h2>

      <CodeBlock
        filename="schema-utils.ts"
        language="typescript"
        code={`// 한글 포함 문자열 (이름, 주소 등)
const koreanName = z
  .string()
  .min(2, '2자 이상 입력하세요')
  .regex(/^[가-힣a-zA-Z]+$/, '한글 또는 영문만 입력 가능합니다');

// 금액 (문자열 → 숫자 변환)
const amountSchema = z
  .string()
  .transform(val => val.replace(/,/g, ''))  // 콤마 제거
  .pipe(z.coerce.number().min(1, '1원 이상 입력하세요'));

// 날짜 범위
const dateRangeSchema = z
  .object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  })
  .refine(d => d.startDate <= d.endDate, {
    message: '시작일이 종료일보다 늦을 수 없습니다',
    path: ['endDate'],
  });

// 선택적이지만 입력하면 규칙 적용
const optionalEmail = z
  .string()
  .optional()
  .refine(val => !val || /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(val), {
    message: '올바른 이메일을 입력하세요',
  });

// 파일 업로드 검증
const fileSchema = z
  .instanceof(File)
  .refine(file => file.size <= 5 * 1024 * 1024, '파일 크기는 5MB 이하여야 합니다')
  .refine(
    file => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
    'JPG, PNG, WebP 파일만 업로드 가능합니다'
  );`}
        highlight={[9, 10, 11, 15, 20, 21, 26, 27, 28, 29, 34, 35, 36, 37]}
      />

      <Callout variant="tip">
        <p>
          <strong>설계 원칙 정리:</strong>
        </p>
        <p>
          &bull; Zod 스키마 = 유효성 규칙의 <strong>Single Source of Truth</strong> (타입도 자동 추론)<br />
          &bull; 동기 검증은 Zod, 비동기 검증은 <code>setError</code>로 분리<br />
          &bull; <code>useInputValidation</code>으로 포커스/터치/규칙 상태를 공통화<br />
          &bull; 스텝 폼은 스텝별 스키마 분리 + <code>.and()</code>로 합성<br />
          &bull; <code>mode: &apos;onTouched&apos;</code>가 대부분의 폼에 적절
        </p>
      </Callout>
    </DocLayout>
  );
}
