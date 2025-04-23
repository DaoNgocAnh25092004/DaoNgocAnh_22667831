"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"

export default function StudentManagement() {
  // Dữ liệu sinh viên mẫu
  const [students, setStudents] = useState([
    { id: 1, name: "Nguyễn Văn A", class: "12A1", age: 18 },
    { id: 2, name: "Trần Thị B", class: "12A2", age: 18 },
    { id: 3, name: "Lê Văn C", class: "11B1", age: 17 },
    { id: 4, name: "Phạm Thị D", class: "11B2", age: 17 },
    { id: 5, name: "Hoàng Văn E", class: "10C1", age: 16 },
    { id: 6, name: "Ngô Thị F", class: "10C2", age: 16 },
  ])

  // Hàm xóa sinh viên
  const deleteStudent = (id) => {
    setStudents(students.filter((student) => student.id !== id))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-center text-blue-600">Quản lý Danh sách Sinh viên</h1>
          <p className="text-center text-gray-600 mt-2">Hệ thống quản lý thông tin sinh viên</p>
        </header>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 bg-blue-500 text-white">
            <h2 className="text-xl font-semibold">Danh sách Sinh viên</h2>
            <p className="text-blue-100">Tổng số: {students.length} sinh viên</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    STT
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Họ và Tên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lớp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tuổi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student, index) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{student.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {student.class}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.age}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => deleteStudent(student.id)}
                        className="text-red-600 hover:text-red-900 flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Xoá
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {students.length === 0 && (
            <div className="text-center py-8 text-gray-500">Không có sinh viên nào trong danh sách</div>
          )}
        </div>
      </div>
    </div>
  )
}
