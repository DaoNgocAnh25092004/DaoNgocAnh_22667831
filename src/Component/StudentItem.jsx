// components/StudentItem.jsx
import React from 'react';
import { Trash2, Edit } from "lucide-react";

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

const StudentItem = ({ student, index, onEdit, onDelete }) => {
    return (
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
                    onClick={() => onEdit(student)}
                    className="text-blue-600 hover:text-blue-900"
                    title="Sửa"
                >
                    <Edit className="w-4 h-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onDelete(student.id, student.name)}
                    className="text-red-600 hover:text-red-900"
                    title="Xóa"
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </td>
        </tr>
    );
};

export default StudentItem;