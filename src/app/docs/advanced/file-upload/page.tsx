import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function FileUploadPage() {
  return (
    <DocLayout
      title="파일 업로드 & 다운로드 패턴"
      description="Blob, FormData, Base64, Presigned URL, CDN 등 프론트엔드가 알아야 할 파일 처리 전략입니다."
    >
      <h2>파일 업로드 방식 비교</h2>

      <CodeBlock
        language="text"
        code={`┌──────────────────┬───────────────────┬──────────────────────────────┐
│      방식        │     적합한 경우     │         특징                  │
├──────────────────┼───────────────────┼──────────────────────────────┤
│ FormData         │ 일반 파일 업로드   │ multipart/form-data, 가장 표준│
│ Base64           │ 작은 이미지       │ 문자열 변환, 33% 용량 증가     │
│ Presigned URL    │ 대용량, S3       │ 서버 부하 없이 직접 업로드     │
│ Chunk Upload     │ 대용량 (100MB+)   │ 분할 업로드, 이어받기 가능     │
│ URL (CDN)        │ 에디터 이미지     │ 업로드 후 URL만 저장           │
└──────────────────┴───────────────────┴──────────────────────────────┘`}
      />

      <h2>1. FormData 업로드 (가장 기본)</h2>

      <CodeBlock
        filename="file-upload.ts"
        language="typescript"
        code={`// 단일 파일 업로드
async function uploadFile(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
    // Content-Type 헤더를 직접 설정하지 않음!
    // → 브라우저가 boundary 포함하여 자동 설정
  });

  return res.json();
}

// 다중 파일 업로드
async function uploadFiles(files: File[]): Promise<UploadResult[]> {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));

  const res = await fetch('/api/upload/multiple', {
    method: 'POST',
    body: formData,
  });

  return res.json();
}

// 파일 + 메타데이터 함께 전송
async function uploadWithMeta(file: File, meta: { title: string; category: string }) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', meta.title);
  formData.append('category', meta.category);

  return fetch('/api/upload', { method: 'POST', body: formData });
}`}
        highlight={[3, 4, 9, 10, 19, 32, 33, 34]}
      />

      <Callout variant="danger">
        <p>
          FormData 전송 시 <code>Content-Type</code> 헤더를 직접 설정하면 안 됩니다.
          브라우저가 <code>multipart/form-data; boundary=...</code>를 자동
          설정해야 서버가 파싱할 수 있습니다.
        </p>
      </Callout>

      <h2>2. 파일 입력 UI (input + 드래그앤드롭)</h2>

      <CodeBlock
        filename="FileInput.tsx"
        language="tsx"
        code={`interface FileInputProps {
  accept?: string;       // 'image/*', '.pdf,.docx'
  multiple?: boolean;
  maxSize?: number;       // bytes
  onChange: (files: File[]) => void;
}

export function FileInput({ accept, multiple, maxSize = 10 * 1024 * 1024, onChange }: FileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const files = Array.from(fileList);

    // 파일 크기 검증
    const oversized = files.filter(f => f.size > maxSize);
    if (oversized.length > 0) {
      alert(\`파일 크기는 \${(maxSize / 1024 / 1024).toFixed(0)}MB 이하여야 합니다\`);
      return;
    }

    onChange(files);
  };

  // 드래그앤드롭
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  return (
    <div
      className={cn(styles.dropzone, isDragging && styles.dragging)}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={() => setIsDragging(false)}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => handleFiles(e.target.files)}
        hidden
      />
      <p>파일을 드래그하거나 클릭하여 선택</p>
    </div>
  );
}`}
        highlight={[12, 13, 17, 18, 27, 28, 29, 44, 48, 49]}
      />

      <h2>3. 이미지 미리보기 (Blob URL vs FileReader)</h2>

      <CodeBlock
        filename="image-preview.ts"
        language="typescript"
        code={`// 방법 1: URL.createObjectURL (권장 — 동기, 빠름)
function previewWithBlobURL(file: File): string {
  const url = URL.createObjectURL(file);
  // 사용 후 반드시 해제! (메모리 누수 방지)
  // → 컴포넌트 언마운트 시 URL.revokeObjectURL(url)
  return url;
}

// 방법 2: FileReader (Base64 — 작은 이미지, 서버 전송용)
function previewWithBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);  // data:image/png;base64,...
  });
}

// React 컴포넌트에서
function ImagePreview({ file }: { file: File }) {
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);  // 클린업!
  }, [file]);

  return <img src={previewUrl} alt="미리보기" />;
}`}
        highlight={[2, 4, 5, 10, 15, 24, 26]}
      />

      <h2>4. Presigned URL (대용량 / S3)</h2>

      <CodeBlock
        filename="presigned-upload.ts"
        language="typescript"
        code={`// 서버 부하 없이 클라이언트 → S3 직접 업로드
// 1단계: 서버에서 Presigned URL 발급
async function getPresignedUrl(fileName: string, fileType: string) {
  const res = await fetch('/api/upload/presigned', {
    method: 'POST',
    body: JSON.stringify({ fileName, fileType }),
  });
  return res.json(); // { uploadUrl, fileUrl }
}

// 2단계: S3에 직접 업로드
async function uploadToS3(file: File): Promise<string> {
  const { uploadUrl, fileUrl } = await getPresignedUrl(file.name, file.type);

  // S3에 직접 PUT (서버 경유 X)
  await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  });

  return fileUrl; // CDN URL 반환
}

// 장점: 서버가 파일 데이터를 처리하지 않음
// 단점: CORS 설정 필요, S3 설정 복잡`}
        highlight={[3, 4, 12, 15, 16, 17, 22]}
      />

      <h2>5. 에디터 이미지 업로드 (CKEditor 등)</h2>

      <CodeBlock
        filename="editor-upload.ts"
        language="typescript"
        code={`// CKEditor / TipTap 등에서 이미지 처리 흐름
// 1. 사용자가 이미지를 에디터에 붙여넣기/드래그
// 2. 에디터가 uploadAdapter를 호출
// 3. 서버에 업로드 → CDN URL 반환
// 4. 에디터가 <img src="CDN_URL"> 삽입
// 5. DB에는 HTML 문자열만 저장 (이미지는 CDN에)

// CKEditor Upload Adapter 예시
class CustomUploadAdapter {
  private loader: any;

  constructor(loader: any) {
    this.loader = loader;
  }

  async upload(): Promise<{ default: string }> {
    const file = await this.loader.file;

    // 서버에 업로드
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload/editor', {
      method: 'POST',
      body: formData,
    });

    const { url } = await res.json();

    // 에디터에 CDN URL 반환
    return { default: url };
  }

  abort() {
    // 업로드 취소 로직
  }
}

// TipTap 이미지 처리
const handleEditorImage = async (file: File) => {
  const url = await uploadToS3(file);
  editor.chain().focus().setImage({ src: url }).run();
};`}
        highlight={[6, 16, 17, 23, 30]}
      />

      <h2>6. 파일 다운로드</h2>

      <CodeBlock
        filename="file-download.ts"
        language="typescript"
        code={`// 방법 1: a 태그 (가장 간단, 같은 도메인)
function downloadByLink(url: string, fileName: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
}

// 방법 2: Blob (다른 도메인, 가공 필요할 때)
async function downloadByBlob(url: string, fileName: string) {
  const res = await fetch(url);
  const blob = await res.blob();

  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(objectUrl);  // 메모리 해제
}

// 방법 3: 서버에서 생성 (엑셀, PDF)
async function downloadExcel(params: ReportParams) {
  const res = await fetch('/api/report/excel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const blob = await res.blob();
  const fileName = res.headers.get('Content-Disposition')
    ?.split('filename=')[1]?.replace(/"/g, '') ?? 'report.xlsx';

  downloadByBlob(URL.createObjectURL(blob), fileName);
}

// 하이브리드 앱: WebView에서 다운로드 안 되는 경우
async function downloadInApp(url: string, fileName: string) {
  if (isNativeApp()) {
    // 네이티브 브릿지로 다운로드 위임
    const res = await fetch(url);
    const blob = await res.blob();
    await nativeBridge.downloadFile(blob, fileName);
  } else {
    downloadByBlob(url, fileName);
  }
}`}
        highlight={[2, 3, 4, 10, 11, 14, 19, 38, 39, 41, 42]}
      />

      <h2>7. 이미지 최적화</h2>

      <CodeBlock
        filename="image-utils.ts"
        language="typescript"
        code={`// 업로드 전 이미지 리사이즈 (Canvas API)
function resizeImage(file: File, maxWidth: number): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ratio = Math.min(maxWidth / img.width, 1);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;

      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => resolve(blob!),
        'image/webp',  // WebP로 변환 (더 작은 용량)
        0.8            // 품질 80%
      );
    };
    img.src = URL.createObjectURL(file);
  });
}

// 사용
const resized = await resizeImage(file, 1200);
const resizedFile = new File([resized], 'resized.webp', { type: 'image/webp' });
await uploadFile(resizedFile);`}
        highlight={[2, 7, 8, 14, 15, 16]}
      />

      <h2>Blob, File, ArrayBuffer 관계</h2>

      <CodeBlock
        language="typescript"
        code={`// Blob: 바이너리 대이터 (Binary Large Object)
const blob = new Blob(['Hello'], { type: 'text/plain' });

// File: Blob을 상속 + 파일명, 수정 시간 추가
const file = new File([blob], 'hello.txt', { type: 'text/plain' });
// file instanceof Blob === true

// ArrayBuffer: 바이너리 데이터의 원시 버퍼
const buffer = await blob.arrayBuffer();
// → Base64 변환, 암호화 등에 사용

// 변환 경로:
// File/Blob → URL:      URL.createObjectURL(blob)
// File/Blob → Base64:   FileReader.readAsDataURL(blob)
// File/Blob → ArrayBuffer: blob.arrayBuffer()
// File/Blob → Text:     blob.text()
// Base64 → Blob:        fetch(dataUrl).then(r => r.blob())
// ArrayBuffer → Blob:   new Blob([buffer])
// string → Blob:        new Blob([string])`}
        highlight={[13, 14, 15, 16, 17, 18]}
      />

      <Callout variant="tip">
        <p>
          <strong>실무 판단 기준:</strong>
        </p>
        <p>
          &bull; 일반 파일 (&lt;10MB) → FormData<br />
          &bull; 대용량/다수 → Presigned URL (S3 직접)<br />
          &bull; 에디터 이미지 → 업로드 후 CDN URL로 교체<br />
          &bull; 하이브리드 앱 → 네이티브 브릿지 다운로드 분기<br />
          &bull; 이미지 최적화 → Canvas 리사이즈 + WebP 변환
        </p>
      </Callout>
    </DocLayout>
  );
}
