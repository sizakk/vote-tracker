'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Users, Plus, Edit, Trash2, Shield, User, AlertCircle, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface User {
    employee_id: string
    name: string
    role: string
    created_at: string
}

export default function UserManagement() {
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showAddForm, setShowAddForm] = useState(false)
    const [editingUser, setEditingUser] = useState<string | null>(null)

    // 새 사용자 폼 상태
    const [newUser, setNewUser] = useState({
        employeeId: '',
        name: '',
        role: 'user'
    })

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await fetch('/api/admin/users')
            if (!response.ok) {
                throw new Error('Failed to fetch users')
            }

            const data = await response.json()
            setUsers(data)
        } catch (err) {
            console.error('Error fetching users:', err)
            setError('사용자 목록을 불러오는 중 오류가 발생했습니다.')
            toast.error('사용자 목록을 불러오는 중 오류가 발생했습니다.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleAddUser = async () => {
        if (!newUser.employeeId || !newUser.name) {
            toast.error('사번과 이름을 모두 입력해주세요.')
            return
        }

        try {
            const response = await fetch('/api/admin/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    employeeId: newUser.employeeId,
                    name: newUser.name,
                    role: newUser.role
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to add user')
            }

            toast.success('사용자가 성공적으로 추가되었습니다.')
            setNewUser({ employeeId: '', name: '', role: 'user' })
            setShowAddForm(false)
            fetchUsers()
        } catch (err) {
            console.error('Error adding user:', err)
            toast.error(err instanceof Error ? err.message : '사용자 추가 중 오류가 발생했습니다.')
        }
    }

    const handleUpdateUserRole = async (employeeId: string, newRole: string) => {
        try {
            const response = await fetch(`/api/admin/users/${employeeId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ role: newRole }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to update user role')
            }

            toast.success('사용자 역할이 성공적으로 변경되었습니다.')
            setEditingUser(null)
            fetchUsers()
        } catch (err) {
            console.error('Error updating user role:', err)
            toast.error(err instanceof Error ? err.message : '역할 변경 중 오류가 발생했습니다.')
        }
    }

    const handleDeleteUser = async (employeeId: string) => {
        if (!confirm('정말로 이 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            return
        }

        try {
            const response = await fetch(`/api/admin/users/${employeeId}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to delete user')
            }

            toast.success('사용자가 성공적으로 삭제되었습니다.')
            fetchUsers()
        } catch (err) {
            console.error('Error deleting user:', err)
            toast.error(err instanceof Error ? err.message : '사용자 삭제 중 오류가 발생했습니다.')
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                        <Users className="h-6 w-6 mr-2 text-blue-600" />
                        사용자 관리
                    </CardTitle>
                    <CardDescription>
                        시스템 사용자 목록 및 권한 관리
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mr-3"></div>
                        <span className="text-gray-600">사용자 목록을 불러오는 중...</span>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center text-xl">
                        <Users className="h-6 w-6 mr-2 text-blue-600" />
                        사용자 관리
                    </CardTitle>
                    <CardDescription>
                        시스템 사용자 목록 및 권한 관리
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-12">
                        <AlertCircle className="h-8 w-8 text-red-500 mr-3" />
                        <div>
                            <p className="text-red-600 font-medium">오류가 발생했습니다</p>
                            <p className="text-sm text-gray-500">{error}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center text-xl">
                                <Users className="h-6 w-6 mr-2 text-blue-600" />
                                사용자 관리
                            </CardTitle>
                            <CardDescription>
                                시스템 사용자 목록 및 권한 관리
                            </CardDescription>
                        </div>
                        <Button
                            onClick={() => setShowAddForm(!showAddForm)}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            새 사용자 추가
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            {/* Add User Form */}
            {showAddForm && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">새 사용자 추가</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="employeeId">사번</Label>
                                <Input
                                    id="employeeId"
                                    value={newUser.employeeId}
                                    onChange={(e) => setNewUser({ ...newUser, employeeId: e.target.value })}
                                    placeholder="사번을 입력하세요"
                                />
                            </div>
                            <div>
                                <Label htmlFor="name">이름</Label>
                                <Input
                                    id="name"
                                    value={newUser.name}
                                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                    placeholder="이름을 입력하세요"
                                />
                            </div>
                            <div>
                                <Label htmlFor="role">역할</Label>
                                <Select
                                    value={newUser.role}
                                    onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="user">일반 사용자</SelectItem>
                                        <SelectItem value="admin">관리자</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex space-x-3 mt-4">
                            <Button onClick={handleAddUser} className="bg-green-600 hover:bg-green-700">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                추가
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowAddForm(false)
                                    setNewUser({ employeeId: '', name: '', role: 'user' })
                                }}
                            >
                                취소
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Users List */}
            <Card>
                <CardHeader>
                    <CardTitle>사용자 목록</CardTitle>
                    <CardDescription>
                        총 {users.length}명의 사용자가 등록되어 있습니다
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {users.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p className="text-gray-500 font-medium">등록된 사용자가 없습니다</p>
                            <p className="text-sm text-gray-400 mt-1">새 사용자를 추가해보세요</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {users.map((user) => (
                                <div
                                    key={user.employee_id}
                                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center space-x-2">
                                                {user.role === 'admin' ? (
                                                    <Shield className="h-5 w-5 text-blue-600" />
                                                ) : (
                                                    <User className="h-5 w-5 text-gray-600" />
                                                )}
                                                <div>
                                                    <h3 className="font-medium text-gray-900">{user.name}</h3>
                                                    <p className="text-sm text-gray-500">사번: {user.employee_id}</p>
                                                </div>
                                            </div>
                                            <Badge
                                                variant={user.role === 'admin' ? 'default' : 'secondary'}
                                                className={user.role === 'admin' ? 'bg-blue-100 text-blue-800' : ''}
                                            >
                                                {user.role === 'admin' ? '관리자' : '일반 사용자'}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <div className="text-sm text-gray-500">
                                                가입일: {formatDate(user.created_at)}
                                            </div>

                                            {editingUser === user.employee_id ? (
                                                <div className="flex items-center space-x-2">
                                                    <Select
                                                        value={user.role}
                                                        onValueChange={(value) => handleUpdateUserRole(user.employee_id, value)}
                                                    >
                                                        <SelectTrigger className="w-32">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="user">일반 사용자</SelectItem>
                                                            <SelectItem value="admin">관리자</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setEditingUser(null)}
                                                    >
                                                        취소
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setEditingUser(user.employee_id)}
                                                    >
                                                        <Edit className="h-4 w-4 mr-1" />
                                                        역할 변경
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDeleteUser(user.employee_id)}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
