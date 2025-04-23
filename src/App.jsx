"use client"

import { useState } from "react"
import { Trash2, UserPlus } from "lucide-react"

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

  // State cho form thêm sinh viên mới
  const [newStudent, setNewStudent] = useState({
    name: "",
    class: "",
    age: "",
  })

  // State thông báo
  const [message, setMessage] = useState({ text: "", type: "" })

  // Hàm xóa sinh viên
  const deleteStudent = (id) => {
    setStudents(students.filter((student) => student.id !== id))
    showMessage("Đã xóa sinh viên thành công!", "success")
  }

  // Hàm xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewStudent({
      ...newStudent,
      [name]: name === "age" ? (value === "" ? "" : Number.parseInt(value, 10) || "") : value,
    })
  }

  // Hàm hiển thị thông báo
  const showMessage = (text, type) => {
    setMessage({ text, type })
    setTimeout(() => {
      setMessage({ text: "", type: "" })
    }, 3000)
  }

  // Hàm thêm sinh viên mới
  const addStudent = (e) => {
    e.preventDefault()

    // Kiểm tra dữ liệu
    if (!newStudent.name || !newStudent.class || !newStudent.age) {
      showMessage("Vui lòng điền đầy đủ thông tin!", "error")
      return
    }

    // Tạo ID mới (lớn nhất + 1)
    const newId = students.length > 0 ? Math.max(...students.map((student) => student.id)) + 1 : 1

    // Thêm sinh viên mới vào danh sách
    setStudents([
      ...students,
      {
        id: newId,
        name: newStudent.name,
        class: newStudent.class,
        age: Number.parseInt(newStudent.age, 10),
      },
    ])

    // Reset form
    setNewStudent({
      name: "",
      class: "",
      age: "",
    })

    showMessage("Thêm sinh viên thành công!", "success")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-center text-blue-600">Quản lý Danh sách Sinh viên</h1>
          <p className="text-center text-gray-600 mt-2">Hệ thống quản lý thông tin sinh viên</p>
        </header>

        {/* Form thêm sinh viên mới */}
        <div className="bg-white rounded-lg shadow-lg mb-8 overflow-hidden">
          <div className="p-6 bg-green-500 text-white">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Thêm Sinh viên mới
            </h2>
          </div>

          <form onSubmit={addStudent} className="p-6">
            {message.text && (
              <div
                className={`mb-4 p-3 rounded ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
              >
                {message.text}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Họ tên
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newStudent.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập họ tên sinh viên"
                />
              </div>

              <div>
                <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-1">
                  Lớp
                </label>
                <input
                  type="text"
                  id="class"
                  name="class"
                  value={newStudent.class}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập lớp"
                />
              </div>

              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                  Tuổi
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={newStudent.age}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập tuổi"
                  min="1"
                />
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
              >
                Thêm sinh viên
              </button>
            </div>
          </form>
        </div>

        {/* Danh sách sinh viên */}
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
