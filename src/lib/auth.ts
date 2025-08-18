import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { supabase } from './supabase'

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Employee ID',
            credentials: {
                employeeId: { label: 'Employee ID', type: 'text' }
            },
            async authorize(credentials) {
                const rawId = credentials?.employeeId ?? ''
                const trimmed = rawId.trim()
                const employeeId = trimmed.replace(/\D/g, '') // 숫자만 유지

                if (!employeeId) {
                    console.log('No valid employee ID provided (empty after sanitize)')
                    return null
                }

                console.log('Attempting to authenticate employee ID:', employeeId)

                try {
                    const { data: user, error } = await supabase
                        .from('allowed_users')
                        .select('*')
                        .eq('employee_id', employeeId)
                        .single()

                    console.log('Supabase query result:', { user, error })

                    if (error) {
                        console.error('Supabase error:', error)
                        return null
                    }

                    if (!user) {
                        console.log('User not found in database for employeeId:', employeeId)
                        return null
                    }

                    console.log('User authenticated successfully:', user)

                    return {
                        id: user.employee_id,
                        name: user.name,
                        email: `${user.employee_id}@company.com`,
                        role: user.role,
                        employeeId: user.employee_id
                    }
                } catch (error) {
                    console.error('Auth error:', error)
                    return null
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role
                token.employeeId = (user as any).employeeId
            }
            return token
        },
        async session({ session, token }) {
            if (token) {
                ; (session.user as any).role = (token as any).role
                    ; (session.user as any).employeeId = (token as any).employeeId
            }
            return session
        }
    },
    pages: {
        signIn: '/login',
        error: '/login'
    },
    session: {
        strategy: 'jwt',
        maxAge: 24 * 60 * 60
    },
    secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
    debug: process.env.NODE_ENV === 'development'
}

declare module 'next-auth' {
    interface User {
        role?: string
        employeeId?: string
    }

    interface Session {
        user: {
            id: string
            name?: string | null
            email?: string | null
            role?: string
            employeeId?: string
        }
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        role?: string
        employeeId?: string
    }
}
