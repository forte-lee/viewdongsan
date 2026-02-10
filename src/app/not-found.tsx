export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">페이지를 찾을 수 없습니다</h2>
      <p className="text-gray-600 mb-8">요청하신 페이지가 존재하지 않습니다.</p>
      <a
        href="/"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        홈으로 돌아가기
      </a>
    </div>
  );
}
