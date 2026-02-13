import React from 'react'

function CommonFooter() {
  return (
    <footer className="flex flex-col w-full items-center justify-center py-4 px-4 border-t border-gray-200 bg-white min-h-[120px]">
      <div className="flex flex-col items-center justify-center w-full gap-1 text-xs text-gray-900">
        {/* 사업장 정보 */}
        <span>상호 : (주)태원 | 대표 : 안병근 | 사업자등록번호 : 111-11-11111</span>
        <span>주소 : 서울특별시 강남구 대치동 111-1, 1층(우 : 11111)</span>
        <span>통신판매업 신고번호 : 제2011-서울강남-11111호</span>
        <span>이메일 : teawon@gmail.com | 팩스 : 02-111-1111</span>
      </div>
      <div className="flex flex-col items-center justify-center w-full gap-2 pt-3 text-sm text-gray-500">
        <span>Copyright @ TEAWON. All Rights Reserved.</span>
      </div>
    </footer>
  )
}
export default CommonFooter