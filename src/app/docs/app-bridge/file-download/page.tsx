import { DocLayout } from "@/components/doc-layout/DocLayout";
import { CodeBlock } from "@/components/code-block/CodeBlock";
import { Callout } from "@/components/callout/Callout";

export default function FileDownloadPage() {
  return (
    <DocLayout
      title="파일 다운로드"
      description="WebView에서 네이티브 파일 시스템으로 파일을 저장하는 방법입니다."
    >
      <h2>WebView에서의 파일 다운로드 문제</h2>
      <p>
        WebView는 일반 브라우저와 달리 <code>a[download]</code> 속성이나
        <code>URL.createObjectURL</code>이 제대로 동작하지 않습니다.
        네이티브 앱에 Base64로 인코딩하여 전달해야 합니다.
      </p>

      <h2>구현</h2>
      <CodeBlock
        filename="native-bridge.ts"
        language="tsx"
        code={`async function downloadFile(blob: Blob, fileName: string): Promise<void> {
  if (typeof window === 'undefined') return;

  const mimeType = blob.type || 'application/octet-stream';
  const fileBase64 = await blobToBase64(blob);

  const payload: DownloadFilePayload = {
    data: fileBase64,
    fileName,
    mimeType,
  };

  // Why: btoa(unescape(encodeURIComponent(...))) for multibyte safety
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));

  if (window.WellfyApp) {
    await window.WellfyApp.callHandler('DownloadFile', encoded);
    logger.info('[NativeBridge] DownloadFile', { fileName, mimeType });
  }
}

// Blob → Base64 변환
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);  // data:...;base64, 제거
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}`}
        highlight={[5, 13, 14, 16, 17, 28]}
      />

      <h2>사용 예시: PDF 다운로드</h2>
      <CodeBlock
        language="tsx"
        code={`async function handleDownloadReport(reportId: string) {
  try {
    // API에서 PDF Blob 받기
    const blob = await reportApi.downloadPdf(reportId);

    // 네이티브 파일 시스템에 저장
    await appBridge.downloadFile(blob, \`건강검진_결과_\${reportId}.pdf\`);

    toast.success('파일이 저장되었습니다.');
  } catch (error) {
    toast.error('다운로드에 실패했습니다.');
  }
}`}
        highlight={[4, 7]}
      />

      <Callout variant="warning" title="Base64 인코딩 주의">
        <p>
          한글 파일명이나 멀티바이트 문자가 포함된 데이터는{" "}
          <code>btoa()</code>에서 에러가 발생합니다.{" "}
          <code>btoa(unescape(encodeURIComponent(...)))</code>로
          멀티바이트 안전하게 인코딩해야 합니다.
        </p>
      </Callout>

      <h2>브라우저 폴백</h2>
      <CodeBlock
        language="tsx"
        code={`// WellfyApp이 없는 환경(브라우저)에서의 폴백
function downloadFileFallback(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}`}
      />
    </DocLayout>
  );
}
