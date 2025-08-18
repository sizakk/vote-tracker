'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Search,
    Plus,
    Edit,
    Trash2,
    Shield,
    User,
    Filter,
    RefreshCw
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { PageErrorBoundary } from '@/components/ui/error-boundary'

interface User {
    id: string
    employee_id: string
    name: string
    role: 'admin' | 'user'
    created_at: string
    updated_at: string
}

interface UserFormData {
    employee_id: string
    name: string
    role: 'admin' | 'user'
}

export default function AdminUsersPage() {
    const { data: session, status } = useSession()
    const router = useRouter()

    const [users, setUsers] = useState<User[]>([])
    const [filteredUsers, setFilteredUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all')
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [formData, setFormData] = useState<UserFormData>({
        employee_id: '',
        name: '',
        role: 'user'
    })

    // 권한 확인
    useEffect(() => {
        if (status === 'loading') return
        if (!session) {
            router.push('/login')
            return
        }
        if (session.user?.role !== 'admin') {
            router.push('/')
            toast.error('관리자 권한이 필요합니다.')
            return
        }
    }, [session, status, router])

    // 사용자 목록 로드
    const loadUsers = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/admin/users')
            if (!response.ok) {
                throw new Error('사용자 목록을 불러오는데 실패했습니다.')
            }
            const data = await response.json()
            setUsers(data.users || [])
        } catch (error) {
            console.error('사용자 목록 로드 오류:', error)
            toast.error('사용자 목록을 불러오는데 실패했습니다.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (session?.user?.role === 'admin') {
            loadUsers()
        }
    }, [session])

    // 검색 및 필터링
    useEffect(() => {
        let filtered = users

        // 검색 필터
        if (searchTerm) {
            filtered = filtered.filter(user =>
                user.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        // 역할 필터
        if (roleFilter !== 'all') {
            filtered = filtered.filter(user => user.role === roleFilter)
        }

        setFilteredUsers(filtered)
    }, [users, searchTerm, roleFilter])

    // 사용자 추가
    const handleAddUser = async () => {
        try {
            const response = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error?.message || '사용자 추가에 실패했습니다.')
            }

            toast.success('사용자가 성공적으로 추가되었습니다.')
            setIsAddDialogOpen(false)
            setFormData({ employee_id: '', name: '', role: 'user' })
            loadUsers()
        } catch (error) {
            console.error('사용자 추가 오류:', error)
            toast.error(error instanceof Error ? error.message : '사용자 추가에 실패했습니다.')
        }
    }

    // 사용자 수정
    const handleEditUser = async () => {
        if (!selectedUser) return

        try {
            const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error?.message || '사용자 수정에 실패했습니다.')
            }

            toast.success('사용자 정보가 성공적으로 수정되었습니다.')
            setIsEditDialogOpen(false)
            setSelectedUser(null)
            setFormData({ employee_id: '', name: '', role: 'user' })
            loadUsers()
        } catch (error) {
            console.error('사용자 수정 오류:', error)
            toast.error(error instanceof Error ? error.message : '사용자 수정에 실패했습니다.')
        }
    }

    // 사용자 삭제
    const handleDeleteUser = async () => {
        if (!selectedUser) return

        try {
            const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
                method: 'DELETE'
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error?.message || '사용자 삭제에 실패했습니다.')
            }

            toast.success('사용자가 성공적으로 삭제되었습니다.')
            setIsDeleteDialogOpen(false)
            setSelectedUser(null)
            loadUsers()
        } catch (error) {
            console.error('사용자 삭제 오류:', error)
            toast.error(error instanceof Error ? error.message : '사용자 삭제에 실패했습니다.')
        }
    }

    // 편집 다이얼로그 열기
    const openEditDialog = (user: User) => {
        setSelectedUser(user)
        setFormData({
            employee_id: user.employee_id,
            name: user.name,
            role: user.role
        })
        setIsEditDialogOpen(true)
    }

    // 삭제 다이얼로그 열기
    const openDeleteDialog = (user: User) => {
        setSelectedUser(user)
        setIsDeleteDialogOpen(true)
    }

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p>로딩 중...</p>
                </div>
            </div>
        )
    }

    if (!session || session.user?.role !== 'admin') {
        return null
    }

    return (
        <PageErrorBoundary pageName="사용자 관리">
            <div className="min-h-screen bg-gray-50">
                {/* 헤더 */}
                <header className="bg-white shadow-sm border-b">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <h1 className="text-2xl font-bold text-gray-900">사용자 관리</h1>
                                <Badge variant="secondary">관리자 전용</Badge>
                            </div>
                            <Button
                                onClick={() => router.push('/admin')}
                                variant="outline"
                            >
                                관리자 대시보드로 돌아가기
                            </Button>
                        </div>
                    </div>
                </header>

                <main className="container mx-auto px-4 py-6">
                    {/* 검색 및 필터 */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Search className="h-5 w-5" />
                                <span>사용자 검색 및 필터</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="사번 또는 이름으로 검색..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Select value={roleFilter} onValueChange={(value: 'all' | 'admin' | 'user') => setRoleFilter(value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="역할 필터" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">모든 사용자</SelectItem>
                                        <SelectItem value="admin">관리자</SelectItem>
                                        <SelectItem value="user">일반 사용자</SelectItem>
                                    </SelectContent>
                                </Select>
                                <div className="flex space-x-2">
                                    <Button
                                        onClick={loadUsers}
                                        variant="outline"
                                        className="flex items-center space-x-2"
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                        <span>새로고침</span>
                                    </Button>
                                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button className="flex items-center space-x-2">
                                                <Plus className="h-4 w-4" />
                                                <span>사용자 추가</span>
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>새 사용자 추가</DialogTitle>
                                                <DialogDescription>
                                                    새로운 사용자를 시스템에 추가합니다.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-2">사번</label>
                                                    <Input
                                                        value={formData.employee_id}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, employee_id: e.target.value }))}
                                                        placeholder="사번을 입력하세요"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-2">이름</label>
                                                    <Input
                                                        value={formData.name}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                                        placeholder="이름을 입력하세요"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-2">역할</label>
                                                    <Select value={formData.role} onValueChange={(value: 'admin' | 'user') => setFormData(prev => ({ ...prev, role: value }))}>
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
                                            <DialogFooter>
                                                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                                                    취소
                                                </Button>
                                                <Button onClick={handleAddUser}>
                                                    추가
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 사용자 목록 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>사용자 목록 ({filteredUsers.length}명)</span>
                                {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="text-center py-8">
                                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                                    <p>사용자 목록을 불러오는 중...</p>
                                </div>
                            ) : filteredUsers.length === 0 ? (
                                <div className="text-center py-8">
                                    <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">사용자가 없습니다.</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>사번</TableHead>
                                            <TableHead>이름</TableHead>
                                            <TableHead>역할</TableHead>
                                            <TableHead>등록일</TableHead>
                                            <TableHead>수정일</TableHead>
                                            <TableHead>작업</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredUsers.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium">{user.employee_id}</TableCell>
                                                <TableCell>{user.name}</TableCell>
                                                <TableCell>
                                                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                                        {user.role === 'admin' ? (
                                                            <>
                                                                <Shield className="h-3 w-3 mr-1" />
                                                                관리자
                                                            </>
                                                        ) : (
                                                            <>
                                                                <User className="h-3 w-3 mr-1" />
                                                                일반 사용자
                                                            </>
                                                        )}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                                                <TableCell>{new Date(user.updated_at).toLocaleDateString()}</TableCell>
                                                <TableCell>
                                                    <div className="flex space-x-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => openEditDialog(user)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => openDeleteDialog(user)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </main>

                {/* 편집 다이얼로그 */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>사용자 정보 수정</DialogTitle>
                            <DialogDescription>
                                사용자 정보를 수정합니다.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">사번</label>
                                <Input
                                    value={formData.employee_id}
                                    onChange={(e) => setFormData(prev => ({ ...prev, employee_id: e.target.value }))}
                                    placeholder="사번을 입력하세요"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">이름</label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="이름을 입력하세요"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">역할</label>
                                <Select value={formData.role} onValueChange={(value: 'admin' | 'user') => setFormData(prev => ({ ...prev, role: value }))}>
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
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                취소
                            </Button>
                            <Button onClick={handleEditUser}>
                                수정
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* 삭제 확인 다이얼로그 */}
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>사용자 삭제 확인</DialogTitle>
                            <DialogDescription>
                                정말로 이 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                            </DialogDescription>
                        </DialogHeader>
                        {selectedUser && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-red-800">
                                    <strong>사번:</strong> {selectedUser.employee_id}<br />
                                    <strong>이름:</strong> {selectedUser.name}<br />
                                    <strong>역할:</strong> {selectedUser.role === 'admin' ? '관리자' : '일반 사용자'}
                                </p>
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                                취소
                            </Button>
                            <Button variant="destructive" onClick={handleDeleteUser}>
                                삭제
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </PageErrorBoundary>
    )
}
