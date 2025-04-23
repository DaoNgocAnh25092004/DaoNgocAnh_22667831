"use client"

import React, { useState, useEffect } from "react"
import { Trash2, UserPlus, AlertTriangle, Edit, Search, Filter } from "lucide-react"

const Button = ({ variant, size, onClick, className, children, type, ...props }) => {
    let classes = 'px-4 py-2 rounded';
    if (variant === 'outline') {
        classes += ' border border-gray-300';
    } else if (variant === 'ghost') {
        classes = 'hover:bg-gray-100 rounded';
    }
    else {
        classes += ' bg-blue-500 text-white';
    }
    if (size === 'icon') {
        classes = 'p-2 rounded-full';
    }
    classes += ' ' + className;
    return (
        <button type={type} onClick={onClick} className={classes} {...props}>
            {children}
        </button>
    );
};

const Input = ({ className, ...props }) => (
    <input className={`px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`} {...props} />
);

const Label = ({ className, ...props }) => (
    <label className={`block text-sm font-medium text-gray-700 mb-1 ${className}`} {...props} />
);

const Dialog = ({ open, onOpenChange, children }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            {children}
        </div>
    );
};
const DialogContent = ({ className, children, ...props }) => <div className={`bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 ${className}`} {...props}>{children}</div>;
const DialogHeader = ({ children }) => <div>{children}</div>;
const DialogTitle = ({ children }) => <h2 className="text-lg font-semibold">{children}</h2>;
const DialogDescription = ({ children }) => <p className="text-gray-600">{children}</p>;
const DialogFooter = ({ children }) => <div className="flex justify-end space-x-3">{children}</div>;
const DialogTrigger = ({ children, ...props }) => <div {...props}>{children}</div>

// Mock Select and Option components
const Select = ({ value, onChange, children, className, ...props }) => (
    <select value={value} onChange={onChange} className={`px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`} {...props}>
        {children}
    </select>
);
const Option = ({ value, children }) => <option value={value}>{children}</option>;
// End mock components


const StudentManagement = () => {
    // Dữ liệu sinh viên mẫu
    const [students, setStudents] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedStudents = localStorage.getItem('students');
            return savedStudents ? JSON.parse(savedStudents) : [
                { id: 1, name: "Nguyễn Văn A", class: "12A1", age: 18 },
                { id: 2, name: "Trần Thị B", class: "12A2", age: 18 },
                { id: 3, name: "Lê Văn C", class: "11B1", age: 17 },
                { id: 4, name: "Phạm Thị D", class: "11B2", age: 17 },
                { id: 5, name: "Hoàng Văn E", class: "10C1", age: 16 },
                { id: 6, name: "Ngô Thị F", class: "10C2", age: 16 },
            ];
        }
        return [ // Giá trị mặc định để tránh lỗi phía server
            { id: 1, name: "Nguyễn Văn A", class: "12A1", age: 18 },
            { id: 2, name: "Trần Thị B", class: "12A2", age: 18 },
            { id: 3, name: "Lê Văn C", class: "11B1", age: 17 },
            { id: 4, name: "Phạm Thị D", class: "11B2", age: 17 },
            { id: 5, name: "Hoàng Văn E", class: "10C1", age: 16 },
            { id: 6, name: "Ngô Thị F", class: "10C2", age: 16 },
        ];
    });

    // State cho form thêm sinh viên mới
    const [newStudent, setNewStudent] = useState({
        name: "",
        class: "",
        age: "",
    })

    // State thông báo
    const [message, setMessage] = useState({ text: "", type: "" })

    // State cho xác nhận xóa
    const [deleteConfirm, setDeleteConfirm] = useState({
        show: false,
        studentId: null,
        studentName: "",
    })

    // State cho việc chỉnh sửa sinh viên
    const [editStudent, setEditStudent] = useState({
        show: false,
        student: null,
    })
    const [editingStudentData, setEditingStudentData] = useState({})

    // State cho tìm kiếm
    const [searchName, setSearchName] = useState("");
    const [filteredStudents, setFilteredStudents] = useState(students);

    // State cho lọc theo lớp
    const [selectedClass, setSelectedClass] = useState("");
    const [availableClasses, setAvailableClasses] = useState(() => { // Fix: Added setAvailableClasses
        if (typeof window !== 'undefined') {
            return [...new Set(students.map(student => student.class))]
        }
        return [];
    }); // Lấy danh sách lớp duy nhất

    // Lưu danh sách sinh viên vào localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('students', JSON.stringify(students));
        }
    }, [students]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setAvailableClasses([...new Set(students.map(student => student.class))]);
        }
    }, [students]);

    // Cập nhật danh sách sinh viên lọc khi có thay đổi trong tìm kiếm hoặc danh sách sinh viên
    useEffect(() => {
        let results = students;

        // Lọc theo tên
        const lowerCaseSearchName = searchName.toLowerCase();
        results = results.filter(student =>
            student.name.toLowerCase().includes(lowerCaseSearchName)
        );

        // Lọc theo lớp
        if (selectedClass) {
            results = results.filter(student => student.class === selectedClass);
        }

        setFilteredStudents(results);
    }, [searchName, selectedClass, students]);


    // Hàm hiển thị xác nhận xóa
    const confirmDelete = (id, name) => {
        setDeleteConfirm({
            show: true,
            studentId: id,
            studentName: name,
        })
    }

    // Hàm hủy xóa
    const cancelDelete = () => {
        setDeleteConfirm({
            show: false,
            studentId: null,
            studentName: "",
        })
    }

    // Hàm xóa sinh viên
    const deleteStudent = () => {
        if (deleteConfirm.studentId) {
            setStudents(students.filter((student) => student.id !== deleteConfirm.studentId))
            showMessage(`Đã xóa sinh viên ${deleteConfirm.studentName} thành công!`, "success")
            setDeleteConfirm({
                show: false,
                studentId: null,
                studentName: "",
            })
        }
    }

    // Hàm xử lý thay đổi input
    const handleInputChange = (e) => {
        const { name, value } = e.target
        const newValue = name === "age" ? (value === "" ? "" : parseInt(value, 10) || "") : value;
        if (editStudent.show) {
            setEditingStudentData({
                ...editingStudentData,
                [name]: newValue,
            });
        } else if (name === "search") { // Handle search input
            setSearchName(value);
        }
        else if (name === "classFilter") { // Handle class filter
            setSelectedClass(value);
        }
        else {
            setNewStudent({
                ...newStudent,
                [name]: newValue,
            })
        }

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
                age: parseInt(newStudent.age?.toString() || '0', 10),
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

    const handleEditStudent = (student) => {
        setEditStudent({ show: true, student });
        setEditingStudentData({
            name: student.name,
            class: student.class,
            age: student.age
        })
    };

    const saveEditStudent = () => {
        if (editStudent.student) {
            const updatedStudents = students.map(st =>
                st.id === editStudent.student?.id
                    ? {
                        ...st,
                        name: editingStudentData.name || st.name,
                        class: editingStudentData.class || st.class,
                        age: editingStudentData.age || st.age
                    }
                    : st
            );
            setStudents(updatedStudents);
            setEditStudent({ show: false, student: null });
            setEditingStudentData({});
            showMessage("Cập nhật thành công", "success");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-center text-blue-600">Quản lý Danh sách Sinh viên</h1>
                    <p className="text-center text-gray-600 mt-2">Hệ thống quản lý thông tin sinh viên</p>
                </header>

                {/* Thông báo */}
                {message.text && (
                    <div
                        className={cn(
                            "mb-4 p-4 rounded-md shadow-sm",
                            message.type === "success" && "bg-green-100 text-green-700",
                            message.type === "error" && "bg-red-100 text-red-700"
                        )}
                    >
                        {message.text}
                    </div>
                )}

                {/* Modal xác nhận xóa */}
                {deleteConfirm.show && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
                            <div className="flex items-center text-red-500 mb-4">
                                <AlertTriangle className="w-6 h-6 mr-2" />
                                <h3 className="text-lg font-semibold">Xác nhận xóa</h3>
                            </div>

                            <p className="mb-6">
                                Bạn có chắc chắn muốn xóa sinh viên <span className="font-semibold">{deleteConfirm.studentName}</span>?
                                Hành động này không thể hoàn tác.
                            </p>

                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={cancelDelete}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={deleteStudent}
                                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center"
                                >
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form thêm sinh viên mới */}
                <div className="bg-white rounded-lg shadow-lg mb-8 overflow-hidden">
                    <div className="p-6 bg-green-500 text-white">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <UserPlus className="w-5 h-5" />
                            Thêm Sinh viên mới
                        </h2>
                    </div>

                    <form onSubmit={addStudent} className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Họ tên
                                </Label>
                                <Input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={newStudent.name || ""}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Nhập họ tên sinh viên"
                                />
                            </div>

                            <div>
                                <Label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-1">
                                    Lớp
                                </Label>
                                <Input
                                    type="text"
                                    id="class"
                                    name="class"
                                    value={newStudent.class || ""}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Nhập lớp"
                                />
                            </div>

                            <div>
                                <Label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                                    Tuổi
                                </Label>
                                <Input
                                    type="number"
                                    id="age"
                                    name="age"
                                    value={newStudent.age || ""}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Nhập tuổi"
                                    min={1}
                                />
                            </div>
                        </div>

                        <div className="mt-6">
                            <Button
                                type="submit"
                                className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                            >
                                Thêm sinh viên
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Tìm kiếm và lọc sinh viên */}
                <div className="bg-white rounded-lg shadow-lg mb-8 overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center">
                            <Filter className="w-5 h-5 mr-2" />
                            Tìm kiếm và lọc sinh viên
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Tìm kiếm theo tên */}
                            <div>
                                <Label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                                    Tìm kiếm theo tên
                                </Label>
                                <Input
                                    type="text"
                                    id="search"
                                    name="search"
                                    value={searchName}
                                    onChange={handleInputChange}
                                    placeholder="Nhập tên sinh viên để tìm kiếm..."
                                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Lọc theo lớp */}
                            <div>
                                <Label htmlFor="classFilter" className="block text-sm font-medium text-gray-700 mb-1">
                                    Lọc theo lớp
                                </Label>
                                <Select
                                    id="classFilter"
                                    name="classFilter"
                                    value={selectedClass}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <Option value="">Tất cả các lớp</Option>
                                    {availableClasses.map(className => (
                                        <Option key={className} value={className}>
                                            {className}
                                        </Option>
                                    ))}
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Danh sách sinh viên */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="p-6 bg-blue-500 text-white">
                        <h2 className="text-xl font-semibold">Danh sách Sinh viên</h2>
                        <p className="text-blue-100">Tổng số: {filteredStudents.length} sinh viên</p>
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
                                {filteredStudents.map((student, index) => (
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
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => handleEditStudent(student)}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="Sửa"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => confirmDelete(student.id, student.name)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Xóa"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredStudents.length === 0 && (
                        <div className="text-center py-8 text-gray-500">Không có sinh viên nào trong danh sách</div>
                    )}
                </div>

                {/* Edit Student Dialog */}
                <Dialog open={editStudent.show} onOpenChange={(open) => {
                    if (!open) {
                        setEditStudent({ show: false, student: null });
                        setEditingStudentData({});
                    }
                }}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Sửa thông tin sinh viên</DialogTitle>
                            <DialogDescription>
                                Cập nhật thông tin chi tiết của sinh viên.
                            </DialogDescription>
                        </DialogHeader>
                        {editStudent.student && (
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">
                                        Tên
                                    </Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={editingStudentData.name || ""}
                                        onChange={handleInputChange}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="class" className="text-right">
                                        Lớp
                                    </Label>
                                    <Input
                                        id="class"
                                        name="class"
                                        value={editingStudentData.class || ""}
                                        onChange={handleInputChange}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="age" className="text-right">
                                        Tuổi
                                    </Label>
                                    <Input
                                        id="age"
                                        name="age"
                                        type="number"
                                        value={editingStudentData.age || ""}
                                        onChange={handleInputChange}
                                        className="col-span-3"
                                    />
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setEditStudent({ show: false, student: null });
                                    setEditingStudentData({});
                                }}
                            >
                                Hủy
                            </Button>
                            <Button
                                type="submit"
                                onClick={saveEditStudent}
                            >
                                Lưu
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}

export default StudentManagement;

