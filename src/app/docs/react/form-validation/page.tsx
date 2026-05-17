import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function FormValidationPage() {
  return (
    <DocLayout
      title="Zod + react-hook-form"
      description="Zod 스키마로 폼 유효성을 검사하고 react-hook-form으로 폼 상태를 관리합니다."
    >
      <h2>구조</h2>
      <CodeBlock
        language="plaintext"
        code={`Zod 스키마 (domains/*.schema.ts)
  ↓ zodResolver
react-hook-form (features/*/hooks/)
  ↓ useController
UI 컴포넌트 (features/*/ui/)`}
      />

      <h2>Zod 스키마 정의</h2>
      <CodeBlock
        filename="member.schema.ts"
        language="tsx"
        code={`import { z } from 'zod';

export const signupAccountSchema = z
  .object({
    loginId: z
      .string()
      .min(6, '아이디는 6자 이상이어야 합니다')
      .max(15, '아이디는 15자 이하여야 합니다')
      .regex(/^[a-z0-9]+$/, '영문 소문자 또는 숫자만 사용 가능합니다'),

    password: z
      .string()
      .min(10, '비밀번호는 10자 이상이어야 합니다')
      .max(15, '비밀번호는 15자 이하여야 합니다')
      .regex(/[a-zA-Z]/, '영문을 포함해야 합니다')
      .regex(/\\d/, '숫자를 포함해야 합니다')
      .regex(/[!@#$%^&*(),.?":{}|<>]/, '특수문자를 포함해야 합니다'),

    passwordConfirm: z.string().min(1, '비밀번호 확인을 입력해주세요'),
  })
  // 스키마 레벨 유효성: 비밀번호 일치 확인
  .refine(data => data.password === data.passwordConfirm, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['passwordConfirm'],  // 에러를 passwordConfirm 필드에 매핑
  });

// 타입 자동 추론
type SignupAccountForm = z.infer<typeof signupAccountSchema>;`}
        highlight={[6, 7, 8, 9, 15, 16, 17, 22, 23, 24, 28]}
      />

      <h2>useForm + zodResolver</h2>
      <CodeBlock
        filename="useSignupAccount.ts"
        language="tsx"
        code={`import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export function useSignupAccount() {
  const form = useForm<SignupAccountForm>({
    resolver: zodResolver(signupAccountSchema),
    mode: 'onChange',  // 입력 즉시 유효성 검사
    defaultValues: {
      loginId: '',
      password: '',
      passwordConfirm: '',
    },
  });

  const { isValid, errors } = form.formState;

  // 아이디 중복 확인 (서버 검증 + RHF 에러 설정)
  async function handleCheckDuplicate(loginId: string): Promise<boolean> {
    const isAvailable = await checkDuplicate(loginId);

    if (!isAvailable) {
      form.setError('loginId', {
        type: 'manual',
        message: '이미 사용 중인 아이디입니다.',
      });
    } else {
      form.clearErrors('loginId');
    }

    return isAvailable;
  }

  function onSubmit(data: SignupAccountForm) {
    // Zod 검증 통과한 데이터만 여기에 도달
    submitSignup(data);
  }

  return { form, isValid, errors, handleCheckDuplicate, onSubmit };
}`}
        highlight={[6, 7, 15, 22, 23, 24]}
      />

      <h2>useController로 커스텀 입력 연결</h2>
      <CodeBlock
        filename="useInputValidation.ts"
        language="tsx"
        code={`export function useInputValidation<T extends FieldValues>({
  name,
  control,
  validationRules = [],
}: UseInputValidationProps<T>) {
  const [isFocused, setIsFocused] = useState(false);
  const [isTouched, setIsTouched] = useState(false);

  const { field, fieldState: { error } } = useController({ name, control });

  // 파생 상태
  const hasValue = String(field.value ?? '').length > 0;
  const hasError = !!error && isTouched;

  // 커스텀 유효성 규칙 결과
  const ruleResults = validationRules.map(rule => ({
    ...rule,
    passed: rule.check(field.value ?? ''),
  }));

  const allRulesPassed = ruleResults.every(rule => rule.passed);

  return {
    field, error, isFocused, isTouched,
    hasValue, hasError, ruleResults, allRulesPassed,
    handleFocus: () => setIsFocused(true),
    handleBlur: () => { setIsFocused(false); setIsTouched(true); },
    handleClear: () => { field.onChange(''); setIsTouched(false); },
  };
}`}
        highlight={[9, 12, 13, 16, 17, 18]}
      />

      <Callout variant="tip">
        <p>
          Zod 스키마는 <code>domains/*.schema.ts</code>에,
          폼 Hook은 <code>features/*/hooks/</code>에 위치합니다.
          스키마와 폼 로직을 분리하면 스키마를 API 검증에도 재사용할 수 있습니다.
        </p>
      </Callout>
    </DocLayout>
  );
}
